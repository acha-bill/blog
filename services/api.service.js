"use strict";

const ApiGateway = require("moleculer-web");
const bodyParser = require("body-parser");
const E = require("moleculer-web").Errors;


module.exports = {
	name: "api",
	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.PORT || 4000,
		path: "/api",
		logRequestParams: "info",
		cors: true,
		use: [bodyParser({
			json: {
				strict: false
			},
			urlencoded: {
				extended: false
			}
		})],
		routes: [
			{
				path: "/users",
				authorization: true,
				whitelist: ["**"],
				aliases: {
					"POST ": "users.create",
					"POST login": "users.login",
					"GET profile": "users.profile",
					"health": "$node.health"
				},
				mappingPolicy: "restrict",
			},
			{
				path: "/posts",
				authorization: true,
				whitelist: ["**"],
				//https://moleculer.services/docs/0.12/moleculer-web.html#Aliases
				//To use this shorthand alias you need to create a service which has list, get, create, update and remove actions.
				aliases: {
					"REST ": "posts"
				}
			},
			{
				path: "/comments",
				authorization: true,
				whitelist: ["**"],
				aliases: {
					"POST ": "comments.create",
					"GET :id ": "comments.get",
					"GET ": "comments.list",
					"DELETE ": "comments.remove"
				},
				mappingPolicy: "restrict",
			},
			{
				path: "/follows",
				authorization: true,
				whitelist: ["**"],
				aliases: {
					"POST ": "follows.create",
					"DELETE ": "follows.remove",
					"GET followers": "follows.followers",
					"GET following": "follows.followings",
					"GET followingCount": "follows.followingCount",
					"GET followersCount": "follows.followersCount",
					"GET has": "follows.has"
				},
				mappingPolicy: "restrict",
			},
			{
				path: "/stars",
				authorization: true,
				whitelist: ["**"],
				aliases: {
					"POST ": "stars.create",
					"GET :id": "stars.get",
					"GET ": "stars.list",
					"DELETE ": "stars.remove"
				},
				mappingPolicy: "restrict",
			},

		]
	},
	methods: {
		authorize(ctx, route, req, res) {
			return new Promise((resolve, reject) => {
				if (req.$endpoint.action.auth == "required") {
					let auth = req.headers["authorization"];
					if (auth && auth.startsWith("Bearer")) {
						let token = auth.slice(7);
						if (token) {
							ctx.call("users.resolveToken", { token }).then(user => {
								this.logger.info("Authenticated via JWT: ", user.username);
								ctx.meta.user = user;
								ctx.meta.token = token;
								resolve(user);
							}).catch((err) => reject(err));
						} else {
							reject(new E.UnAuthorizedError(E.ERR_INVALID_TOKEN));
						}
					} else {
						reject(new E.UnAuthorizedError(E.ERR_NO_TOKEN));
					}
				} else {
					resolve(true);
				}
			});
		}
	}
};

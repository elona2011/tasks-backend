const Router = require("@koa/router")
const router = new Router();
const wx = require('./wx')
const publish = require('./publish')

wx(router)
publish(router)
module.exports = router
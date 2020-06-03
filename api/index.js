const Router = require("@koa/router")
const router = new Router();
const wx = require('./wx')

wx(router)
module.exports = router
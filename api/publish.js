module.exports = router => {
    router.all('/publish', ctx => {
        let query = ctx.request.query
        if (query.t) {
            ctx.redirect(`/#/publish/${query.t}`);
            ctx.status = 301;
        }
    });
}
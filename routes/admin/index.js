const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");

const faker = require("faker");

router.all("/*", (req, res, next) => {
    req.app.locals.layout = "admin";
    next();
});

router.get("/", (req, res, next) => {
    res.render("admin/index");
});

router.post("/generate-fake-post", async (req, res, next) => {
    for (let i = 0; i < +req.body.amount; i++) {
        let post = await new Post();

        post.title = faker.name.title();
        post.status = "Public";
        post.slug = faker.name.title();
        post.allowComments = faker.datatype.boolean();
        post.body = faker.lorem.sentence();

        await post.save(function (err) {
            if (err) {
                throw err;
            }
        });
    }
    res.redirect("/admin/posts");
});
module.exports = router;

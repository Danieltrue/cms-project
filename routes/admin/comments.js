const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");

router.all("/*", (req, res, next) => {
    req.app.locals.layout = "admin";
    next();
});

router.get("/", (req, res, next) => {
    Comment.find({ user: req.user.id })
        .populate("user")
        .then((comments) => {
            res.render("admin/comment/comments", { comments });
        })
        .catch((err) => console.log(err));
});

router.post("/", (req, res, next) => {
    Post.findOne({ _id: req.body.post_id })
        .then((post) => {
            const newComment = new Comment({
                user: req.user.id,
                body: req.body.body,
            });
            post.comments.push(newComment);
            post.save().then((savedPost) => {
                newComment.save().then((savedComment) => {
                    res.redirect(`/post/${post.id}`);
                });
            });
        })
        .catch((err) => console.log(err));
});

router.delete("/:id", (req, res, next) => {
    Comment.remove({ _id: req.params.id }).then((comments) => {
        Post.findOneAndUpdate(
            { comments: req.params.id },
            { $pull: { comments: req.params.id } },
            (err, data) => {
                if (err) console.log(err);

                res.redirect("/admin/comments");
            }
        );
    });
});
module.exports = router;

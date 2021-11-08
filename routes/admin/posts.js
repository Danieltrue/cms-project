const express = require("express");
const router = express.Router();
const fs = require("fs");
const { userAuthenticated } = require("../../helper/auth");

const Post = require("../../models/Post");
const Category = require("../../models/Category");
const { isEmpty, uploadDir } = require("../../helper/upload-helper");

router.all("/*", userAuthenticated, (req, res, next) => {
    req.app.locals.layout = "admin";
    next();
});

router.get("/create", (req, res, next) => {
    Category.find({})
        .then((category) => {
            res.render("admin/posts/create", {
                category,
            });
        })
        .catch((err) => console.log(err));
});

router.post("/create", async (req, res, next) => {
    let error = [];

    if (!req.body.title) {
        error.push({ msg: "Please Add You Title" });
    }

    if (!req.body.body) {
        error.push({ msg: "Please add Your Message" });
    }

    if (error.length > 0) {
        res.render("admin/posts/create", {
            error,
        });
    } else {
        let filename = "";

        if (!isEmpty(req.files)) {
            let file = req.files.file;
            filename = Date.now() + "_" + file.name;
            //move the file to the public directory and use the filename to save the data
            file.mv("./public/uploads/" + filename, (err) => {
                if (err) {
                    throw err;
                }
            });
        }

        let { title, status, allowComments, body, category } = req.body;
        //validating the data comming from the frontend

        if (allowComments) {
            allowComments = true;
        } else {
            allowComments = false;
        }

        const newPost = await new Post({
            user: req.user.id,
            title,
            status,
            allowComments,
            body,
            category,
            file: filename,
        });

        await newPost.save();

        await req.flash(
            "Success_Message",
            `${req.body.title} Post created Successfully`
        );

        await res.redirect("/admin/posts");
    }
});

router.get("/", async (req, res, next) => {
    //query the database
    const data = await Post.find({}).populate("category");
    await res.render("admin/posts/post", { posts: data });
});

router.get("/edit/:id", (req, res, next) => {
    Post.findOne({ _id: req.params.id }).then((posts) => {
        Category.find({})
            .then((category) => {
                res.render("admin/posts/edit", {
                    posts,
                    category,
                });
            })
            .catch((err) => console.log(err));
    });
});

router.get("/my-post", (req, res, next) => {
    Post.find({ user: req.user.id })
        .populate("category")
        .then((posts) => {
            res.render("admin/posts/my-post", { posts });
        })
        .catch((err) => console.log(err));
});

router.put("/edit/:id", async (req, res, next) => {
    const updatedPost = await Post.findOne({ _id: req.params.id });

    let allowComments;

    if (updatedPost.allowComments) {
        allowComments = true;
    } else {
        allowComments = false;
    }

    updatedPost.user = req.user.id;
    updatedPost.title = req.body.title;
    updatedPost.status = req.body.status;
    updatedPost.allowComments = allowComments;
    updatedPost.body = req.body.body;
    updatedPost.category = req.body.category;
    if (!isEmpty(req.files)) {
        let file = req.files.file;
        filename = Date.now() + "_" + file.name;
        updatedPost.file = filename;
        //move the file to the public directory and use the filename to save the data
        file.mv("./public/uploads/" + filename, (err) => {
            if (err) {
                throw err;
            }
        });
    }

    await updatedPost.save();
    await req.flash(
        "edit_success_message",
        `${updatedPost.title} Post was sucessfully Edited`
    );
    await res.redirect("/admin/posts");
});

router.delete("/:id", (req, res, next) => {
    Post.findOne({ _id: req.params.id })
        .populate("comments")
        .then((posts) => {
            fs.unlink(uploadDir + posts.file, (err) => {
                if (err) {
                    throw err;
                }

                if (posts.comments.length > 0) {
                    posts.comments.forEach((comment) => {
                        comment.remove();
                    });
                }
                posts.remove();
                req.flash(
                    "delete_success_message",
                    `${posts.title} was Deleted Successfully`
                );
                res.redirect("/admin/posts");
            });
        })
        .catch((err) => {
            if (err) {
                console.log(err);
            }
        });
});

module.exports = router;

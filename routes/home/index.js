const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const Category = require("../../models/Category");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

router.all("/*", (req, res, next) => {
    req.app.locals.layout = "home";
    next();
});

router.get("/", (req, res, next) => {
    //creating a session when accessing the home page
    req.session.newSession = "Start Session";

    const perPage = 10;
    const page = req.query.page || 1;

    Post.find({})
        .skip(perPage * page - perPage)
        .limit(perPage)
        .then((posts) => {
            Post.count().then((postCount) => {
                Category.find({})
                    .then((category) => {
                        res.render("home/index", {
                            posts,
                            category,
                            current: parseInt(page),
                            pages: Math.ceil(postCount / perPage),
                        });
                    })
                    .catch((err) => console.log(err));
            });
        })
        .catch((err) => console.log(err));

    if (req.session.newSession) {
        console.log(`We Found The Seesion ${req.session.newSession}`);
    }
});

router.get("/about", (req, res, next) => {
    res.render("home/about");
});

router.get("/login", (req, res, next) => {
    res.render("home/login");
});

passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
        User.findOne({ email: email }).then((user) => {
            if (!user) {
                return done(null, false, { message: "No User Found" });
            } else {
                bcrypt.compare(password, user.password, (err, matched) => {
                    if (err) throw err;
                    if (matched) {
                        return done(null, user);
                    } else {
                        return done(null, false, {
                            message: "Password Do not Match",
                        });
                    }
                });
            }
        });
    })
);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/admin",
        failureRedirect: "/login",
        failureFlash: true,
    })(req, res, next);
});

router.get("/register", (req, res, next) => {
    res.render("home/register");
});

router.post("/register", (req, res, next) => {
    let error = [];

    const newUser = new User({
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
    });

    if (!req.body.firstName) {
        error.push({ msg: "Please Add Your firstname" });
    }
    if (!req.body.lastName) {
        error.push({ msg: "Please add Your lastname" });
    }
    if (!req.body.email) {
        error.push({ msg: "Please add Your email" });
    }
    if (!req.body.password) {
        error.push({ msg: "Please add Your lastname" });
    }

    if (error.length > 0) {
        res.render("/register", {
            error,
            firstname: req.body.firstName,
            lastname: req.body.lastName,
            email: req.body.email,
        });
    } else {
        User.findOne({ email: req.body.email }).then((user) => {
            if (user) {
                req.flash("user_exist", "The Email Has Already Been Used");
                res.redirect("/register");
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        newUser.password = hash;
                        newUser
                            .save()
                            .then((response) => {
                                req.flash(
                                    "register_success",
                                    "Your registration was successful"
                                );
                                res.redirect("/login");
                            })
                            .catch((err) => console.log(err));
                    });
                });
            }
        });
    }
});

router.get("/post/:slug", (req, res, next) => {
    Post.findOne({ slug: req.params.slug })
        .populate({
            path: "comments",
            populate: { path: "user", model: "User" },
        })
        .populate("user")
        .then((posts) => {
            Category.find({}).then((category) => {
                res.render("home/post", {
                    posts,
                    category,
                });
            });
        })
        .catch((err) => console.log(err));
});

router.get("/logout", (req, res, next) => {
    req.logOut();
    res.redirect("/login");
});
module.exports = router;

//Native Modules
const path = require("path");
//Third Party Modules
const express = require("express");
const dotenv = require("dotenv").config({ path: "./config/config.env" });
const helmet = require("helmet");
const colors = require("colors");
const exhbs = require("express-handlebars");
const connectDB = require("./config/connectDB");
const {
    select,
    generateTime,
    paginate,
} = require("./helper/handlebars-helper");
const methodOverride = require("method-override");
const upload = require("express-fileupload");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
//init express
const app = express();
//init express body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//init port
const port = process.env.PORT || 1234;
//create public dir in node to fetch all static files
app.use(express.static("public"));

//add helmet a little bit of security
app.use(helmet());
//configure the view engine
app.engine(
    "hbs",
    exhbs({
        defaultLayout: "home",
        extname: "hbs",
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        },
        helpers: { select, generateTime, paginate },
    })
);
app.set("view engine", "hbs");
//file upload
app.use(upload());

//conect data base here
connectDB();
//router
//overide method using method override
app.use(methodOverride("_method"));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
    })
);
app.use(flash());
app.use(function (req, res, next) {
    res.locals.success_message = req.flash("Success_Message");
    next();
});
app.use(function (req, res, next) {
    res.locals.edit_success = req.flash("edit_success_message");
    res.locals.delete_success = req.flash("delete_success_message");
    res.locals.register_success = req.flash("register_success");
    res.locals.user_exist = req.flash("user_exist");
    res.locals.user = req.user || null;
    res.locals.error = req.flash("error");
    next();
});
app.use(passport.initialize());
app.use(passport.session());

const home = require("./routes/home/index");
const admin = require("./routes/admin/index");
const posts = require("./routes/admin/posts");
const category = require("./routes/admin/category");
const comments = require("./routes/admin/comments");

app.use("/", home);
app.use("/admin", admin);
app.use("/admin/posts", posts);
app.use("/admin/category", category);
app.use("/admin/comments", comments);

//listen to port
app.listen(port, () =>
    console.log(`Server Running on Port ${port}`.bgWhite.black)
);

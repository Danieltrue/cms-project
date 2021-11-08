const express = require("express");
const router = express.Router();
const Category = require("../../models/Category");

router.all("/*", (req, res, next) => {
    res.locals.layout = "admin";
    next();
});

router.get("/", (req, res, next) => {
    Category.find({})
        .then((category) => {
            res.render("admin/category/index", {
                category,
            });
        })
        .catch((err) => console.log(err));
});

router.post("/create", (req, res, next) => {
    const newCategory = new Category({
        name: req.body.name,
    });

    newCategory
        .save()
        .then((category) => {
            res.render("admin/category/index", {
                category,
            });
        })
        .catch((err) => console.log(err));
});

router.get("/edit/:id", (req, res, next) => {
    Category.findOne({ _id: req.params.id })
        .then((category) => {
            res.render("admin/category/edit", { category });
        })
        .catch((err) => console.log(err));
});

router.put("/edit/:id", (req, res, next) => {
    Category.findOne({ _id: req.params.id }).then((categorys) => {
        categorys.name = req.body.name;
        categorys.save((category) => {
            res.redirect("/admin/category");
        });
    });
});

router.delete("/delete/:id", (req, res, next) => {
    const deleteCategory = Category.findOne({ _id: req.params.id });

    deleteCategory
        .remove()
        .then((category) => {
            res.redirect("/admin/category");
        })
        .catch((err) => console.log(err));
});
module.exports = router;

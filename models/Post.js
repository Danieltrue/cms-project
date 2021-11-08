const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const URLSlugs = require("mongoose-url-slugs");

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
    },
    title: {
        type: String,
        required: [true, "Please Add a Title"],
    },
    slug: {
        type: String,
    },
    status: {
        type: String,
        required: [true, "Who Should See This"],
        default: "public",
        enum: ["Public", "Private", "Draft"],
    },
    allowComments: {
        type: Boolean,
        required: true,
        default: true,
    },
    body: {
        type: String,
        required: [true, "What is Kicking you"],
    },
    file: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now(),
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
});

PostSchema.plugin(URLSlugs("title", { field: "slug" }));
module.exports = mongoose.model("Post", PostSchema);

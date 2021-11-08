const mongoose = require("mongoose");
const schema = mongoose.Schema;

const UserSchema = new schema({
    firstname: {
        type: String,
        require: [true, "Please Add a First Name"],
    },
    lastname: {
        type: String,
        require: [true, "Please Add a Last Name"],
    },
    email: {
        type: String,
        require: [true, "Add An Email Address"],
    },
    password: {
        type: String,
        require: [true, "Add a Password"],
    },
});

module.exports = mongoose.model("User", UserSchema);

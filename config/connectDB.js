const mongoose = require("mongoose");

//function to connect mongoDb
async function connectDB() {
    //create a connetion
    const connect = await mongoose.connect("mongodb://localhost:27017/cms");
    console.log(
        `MongoDB Database Connected to mongodb://localhost:${connect.connection.port}/cms`
            .bgYellow.black.underline
    );
}

module.exports = connectDB;

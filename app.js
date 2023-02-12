//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const encrypt = require("mongoose-encryption");
const _ = require("lodash");
const mongoose = require("mongoose");
mongoose.set("strictQuery", "false");

const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb://0.0.0.0:27017/userDB");
        console.log(`MongoDB connected at: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);


app.get("/", (req, res) => {
    res.render("home");
});


app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });
        newUser.save((err)=>{
            if(err){
                console.log(err);
            } else {
                res.render("secrets");
            }
        });
    })

app.route("/login")
    .get((req, res) => {
        res.render("login");
    })
    .post((req, res) => {
        User.findOne(
            {
                email: req.body.username
            },
            (err, foundUser) => {
                if (err) {
                    console.log(err);
                    res.redirect("/");
                } else {
                    if( foundUser && foundUser.password === req.body.password) {
                        res.render("secrets");
                    } else {
                        console.log("Error Authenticating");
                        res.redirect("/");
                    }
                }
            });
    });

app.route("/logout")
    .get((req, res) => {
        res.redirect("/");
    });

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server started on port " + PORT);
    });
});

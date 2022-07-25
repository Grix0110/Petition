const express = require("express");
const router = express.Router();
const db = require("../db");
const { signedIn } = require("../middleware");

router.get("/register", signedIn, (req, res) => {
    console.log("get request REGISTER");
    res.render("register");
});

//post the given information from the register input fields
router.post("/register", (req, res) => {
    let data = req.body;
    let firstUpper = data.first[0].toUpperCase() + data.first.substr(1);
    let lastUpper = data.last[0].toUpperCase() + data.last.substr(1);
    if (!data.first || !data.last || !data.email) {
        return res.redirect("/register");
    }
    db.insertUser(firstUpper, lastUpper, data.email, data.pword)
        .then((results) => {
            req.session.logId = results.rows[0].id;
            res.redirect("user");
        })
        .catch((err) => {
            console.log("ERROR in insertUser: ", err);
        });
});

module.exports = router;
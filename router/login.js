const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs/dist/bcrypt");

const { signedIn } = require("../middleware");

router.get("/", (req, res) => {
    console.log("get request MAIN");
    res.redirect("register");
});

router.get("/login", signedIn, (req, res) => {
    console.log("get request LOGIN");
    res.render("login");
});

router.post("/login", (req, res) => {
    db.findUser(req.body.email)
        .then((results) => {
            if (results.rows.length > 0) {
                const hash = results.rows[0].pword;
                bcrypt.compare(req.body.password, hash).then((isMatch) => {
                    if (isMatch === true) {
                        req.session.logId = results.rows[0].id;
                        res.redirect("/petition");
                    }
                });
            }
        })
        .catch((err) => console.log("ERROR in findUser: ", err));
});

router.get("/logout", (req, res) => {
    console.log("user logged out");
    req.session = undefined;
    res.redirect("/register");
});

module.exports = router;

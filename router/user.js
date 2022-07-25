const express = require("express");
const router = express.Router();
const db = require("../db");
const { signedOut, petitionUnSigned } = require("../middleware");

router.get("/user", signedOut, petitionUnSigned, (req, res) => {
    console.log("get request USER");
    res.render("user");
});

router.post("/user", (req, res) => {
    let data = req.body;
    let id = req.session.logId;
    let cityUpper = data.City[0].toUpperCase() + data.City.substr(1);
    db.addProfile(id, data.age, cityUpper, data.Url)
        .then(() => {
            res.redirect("petition");
        })
        .catch((err) => {
            console.log("ERROR in addProfile: ", err);
        });
});

module.exports = router;
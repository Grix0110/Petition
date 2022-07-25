const express = require("express");
const router = express.Router();
const db = require("../db");
const { signedOut, petitionUnSigned } = require("../middleware");

router.get("/petition", signedOut, petitionUnSigned, (req, res) => {
    console.log("get request Petition");
    res.render("petition");
});

//add the signature and return an ID
router.post("/petition", (req, res) => {
    let data = req.body;
    let id = req.session.logId;
    db.addSigner(id, data.signature)
        .then(() => {
            console.log("posted NEW signature");
            res.redirect("signed");
        })
        .catch((err) => {
            console.log("ERROR in addSigner: ", err);
        });
});

module.exports = router;
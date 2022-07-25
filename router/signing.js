const express = require("express");
const router = express.Router();
const db = require("../db");
const { signedOut, petitionSigned } = require("../middleware");

router.get("/signed", signedOut, petitionSigned, (req, res) => {
    Promise.all([db.getId(req.session.logId), db.countSigners()]).then(
        ([getId, count]) => {
            res.render("signed", {
                signature: getId.rows[0].signature,
                count: count.rows[0].count,
            });
        }
    );
});

router.post("/signed", (req, res) => {
    db.deleteSignature(req.session.logId)
        .then(res.redirect("petition"), console.log("deleted Signature!"))
        .catch((err) => {
            console.log("ERROR in deleteSignatures", err);
        });
});

router.get("/signers", signedOut, (req, res) => {
    console.log("get request SIGNERS");
    db.getSigners()
        .then((results) => {
            const signers = results.rows;
            res.render("signers", { signers });
        })
        .catch((err) => {
            console.log("ERROR in getSigners: ", err);
        });
});

router.get("/signers/:city", signedOut, (req, res) => {
    const city = req.params.city;
    db.getSignerByCity(city)
        .then((results) => {
            const signers = results.rows;
            res.render("signers", { signers, city });
        })
        .catch((err) => {
            console.log("ERROR in getSignersByCity", err);
        });
});


router.post("/signers", (req, res) => {
    return res.redirect("edit");
});

module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("../db");
const { signedOut } = require("../middleware");

router.get("/edit", signedOut, (req, res) => {
    const id = req.session.logId;
    db.getSignerToEdit(id)
        .then((results) => {
            const data = results.rows[0];
            return res.render("edit", {
                first: data.first_name,
                last: data.last_name,
                email: data.email,
                age: data.age,
                city: data.city,
                home: data.homepage,
            });
        })
        .catch((err) => console.log("ERROR in EDIT", err));
});

router.post("/edit", (req, res) => {
    let data = req.body;
    if (!data.first || !data.last || !data.email) {
        return res.redirect("/edit");
    }
    let cityUpper = data.City[0].toUpperCase() + data.City.substr(1);
    let firstUpper = data.first[0].toUpperCase() + data.first.substr(1);
    let lastUpper = data.last[0].toUpperCase() + data.last.substr(1);
    let id = req.session.logId;
    const password = req.body.password;
    if (password === "") {
        db.updateUserWithoutPassword(
            req.session.logId,
            firstUpper,
            lastUpper,
            data.email
        )
            .then(
                db
                    .updateProfile(id, data.age, cityUpper, data.Url)
                    .then(() => {
                        return res.redirect("/signers");
                    })
                    .catch((err) => console.log("ERROR in EDIT", err))
            )
            .catch((err) => console.log("ERROR in EDIT with Password", err));
    } else {
        db.updateUserWithPassword(
            id,
            data.first,
            data.last,
            data.email,
            data.pword
        )
            .then(
                db
                    .updateProfile(id, data.age, data.City, data.Url)
                    .then(() => {
                        return res.redirect("/signers");
                    })
                    .catch((err) => console.log("ERROR in EDIT", err))
            )
            .catch((err) => console.log("ERROR in EDIT with password", err));
    }
});

module.exports = router;
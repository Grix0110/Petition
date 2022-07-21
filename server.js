const express = require("express");
const app = express();
const PORT = 8080;
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs/dist/bcrypt");
// const cookie = require("cookie-parser");
// app.use(cookie());

app.engine("handlebars", hb.engine());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: false }));
app.use(express.static("./public"));
app.use(
    cookieSession({
        secret: "can't touch this...",
        maxAge: 1000 * 60 * 60 * 24 * 24,
    })
);

//functionality of the login/register site
app.get("/", (req, res) => {
    console.log("get request MAIN");
    res.redirect("login");
});

app.get("/login", (req, res) => {
    console.log("get request LOGIN");
    res.render("login");
});

app.post("/login", (req, res) => {
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

app.get("/register", (req, res) => {
    console.log("get request REGISTER");
    res.render("register");
});

//post the given information from the register input fields
app.post("/register", (req, res) => {
    let data = req.body;
    db.insertUser(data.first, data.last, data.email, data.pword)
        .then((results) => {
            req.session.logId = results.rows[0].id;
            res.redirect("user");
        })
        .catch((err) => {
            console.log("ERROR in insertUser: ", err);
        });
});

//userprofile information routes
app.get("/user", (req, res) => {
    if (!req.session.logId) {
        res.redirect("/register");
    }
    res.render("user");
});

app.post("/user", (req, res) => {
    let data = req.body;
    let cook = req.session.logId;
    db.addProfile(cook, data.age, data.City, data.Url)
        .then(() => {
            res.redirect("petition");
        })
        .catch((err) => {
            console.log("ERROR in addProfile: ", err);
        });
});

//functionality of the petition site
//check for cookie with ID
app.get("/petition", (req, res) => {
    if (req.session.signatureId) {
        res.redirect("/signed");
    }
    res.render("petition");
});

//add the signature and return an ID
app.post("/petition", (req, res) => {
    let data = req.body;
    let cook = req.session.logId;
    db.addSigner(cook, data.signature)
        .then(() => {
            console.log("posted NEW signature");
            res.redirect("signed");
        })
        .catch((err) => {
            console.log("ERROR in addSigner: ", err);
        });
});

//functionality when petition was signed...Implement information on signed route
app.get("/signed", (req, res) => {
    // if (!req.session.logId) {
    //     return res.redirect("petition");
    // }
    db.getId(req.session.logId)
        .then((results) => {
            const signer = results.rows[0];
            res.render("signed", {
                signature: signer.signature,
            });
        })
        .catch((err) => {
            console.log("ERROR in getId: ", err);
        });
});

app.post("/signed", (req, res) => {
    db.deleteSignature(req.session.logId)
        .then(res.redirect("petition"), console.log("deleted Signature!"))
        .catch((err) => {
            console.log("ERROR in deleteSignatures", err);
        });
});

app.get("/edit", (req, res) => {
    res.render("edit");
});

app.post("edit", (req, res) => {});

app.get("/signers", (req, res) => {
    console.log("get request SIGNERS");
    db.getSigners()
        .then((results) => {
            // console.log(results.rows);
            const signers = results.rows;
            res.render("signers", { signers });
        })
        .catch((err) => {
            console.log("ERROR in getSigners: ", err);
        });
});

app.get("/signers/:city", (req, res) => {
    const city = req.params.city;
    db.getSignerByCity(city)
        .then((results) => {
            console.log("city results: ", results);
            const signedCity = results.rows;
            res.render("/signers/:city", { signedCity });
        })
        .catch((err) => {
            console.log("ERROR in getSignersByCity", err);
        });
});

app.get("/signers", (req, res) => {
    db.getSigners()
        .then((results) => {
            console.log("results from getSigners", results);
            res.render("signers");
        })
        .catch((err) => {
            console.log("err in getSigners ", err);
        });
});

app.listen(PORT, () => {
    console.log("petition server is listening!");
});

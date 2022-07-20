const express = require("express");
const app = express();
const PORT = 8080;
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
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
            req.session.logId = results.rows[0].id;
            res.redirect("signed");
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
            res.redirect("user");
        })
        .catch((err) => console.log("ERROR in insertUser: ", err));
});

app.get("/user", (req, res) => {
    res.render("user");
});

//functionality of the petition site
//check for cookie with ID
app.get("/petition", (req, res) => {
    if (req.session.signatureId) {
        return res.redirect("/signed");
    }
    res.render("petition");
});

//add the signature and return an ID
app.post("/signed", (req, res) => {
    db.addSigner(req.body.signature)
        .then((results) => {
            console.log("posted NEW signature");
            req.session.signatureId = results.rows[0].id;
            res.redirect("signed");
        })
        .catch((err) => {
            console.log("ERROR in addSigner: ", err);
        });
});

//functionality when petition was signed...Implement information on signed route
app.get("/signed", (req, res) => {
    if (!req.session.signatureId) {
        return res.redirect("petition");
    }
    db.getId(req.session.signatureId)
        .then((results) => {
            const signer = results.rows[0];
            console.log(signer.signature);
            res.render("signed", {
                signature: signer.signature,
            });
        })
        .catch((err) => {
            console.log("ERROR in getId: ", err);
        });
});

app.get("/signers", (req, res) => {
    console.log("get request SIGNERS");
    res.render("signers");
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
const express = require("express");
const app = express();
const PORT = 8080;
const db = require("./db");
const hb = require("express-handlebars");
const cookie = require("cookie-parser");
const cookieSession = require("cookie-session");

app.engine("handlebars", hb.engine());
app.set("view engine", "handlebars");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("./public"));

app.use(cookie());

app.use(
    cookieSession({
        secret: "can't touch this...",
        maxAge: 1000 * 60 * 60 * 24 * 24,
    })
);

//functionality of the petition main site
app.get("/", (req, res) => {
    console.log("get request just happened");
    res.redirect("petition");
});

//check for cookie with ID
app.get("/petition", (req, res) => {
    if (req.session.signatureId) {
        return res.redirect("/signed");
    }
    res.render("petition");
});

//add the signature and return an ID
app.post("/signed", (req, res) => {
    db.addSigner(req.body.first, req.body.last, req.body.signature)
        .then((results) => {
            console.log("posted signature");
            req.session.signatureId = results.rows[0].id;
            res.redirect("signed");
        })
        .catch((err) => console.log("ERROR in addSigner: ", err));
});

//functionality when petition was signed...Implement information on signed route
app.get("/signed", (req, res) => {
    db.getId(req.session.signatureId)
        .then((results) => {
            console.log(results.rows[0].first, results.rows[0].last);
            const signer = results.rows[0];
            res.render("signed", {
                first: signer.first,
                last: signer.last,
                signature: signer.signature,
            });
        })
        .catch((err) => console.log("ERROR in getId: ", err));
});

app.get("/signers", (req, res) => {
    console.log("get request just happened");
    res.render("signers");
});

app.get("/signers", (req, res) => {
    db.getSigners()
        .then((results) => {
            console.log("results from getSigners", results);
            res.render("signers");
        })
        .catch((err) => console.log("err in getSigners ", err));
});

app.listen(PORT, () => console.log("petition server is listening!"));

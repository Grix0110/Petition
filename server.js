const express = require("express");
const app = express();
const PORT = 8080;
const db = require("./db");
const hb = require("express-handlebars");
const cookie = require("cookie-parser");

app.engine("handlebars", hb.engine());
app.set("view engine", "handlebars");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("./public"));

app.use(cookie());

//functionality of the petition main site
app.get("/", (req, res) => {
    console.log("get request just happened");
    res.redirect("petition");
});

app.get("/petition", (req, res) => {
    if (req.cookies.signed === "1") {
        return res.redirect("/signed");
    }
    res.render("petition");
});

app.post("/petition", (req, res) => {
    db.addSigner(req.body.firstName, req.body.lastName, req.body.signature)
        .then(() => {
            console.log("posted signature");
            res.cookie("signed", 1);
            res.redirect("signed");
        })
        .catch((err) => console.log("ERROR in addSigner: ", err));
});

//functionality when petition was signed
app.get("/signed", (req, res) => {
    console.log("get request just happened");
    res.render("signed");
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

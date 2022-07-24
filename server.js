const express = require("express");
const app = express();
const PORT = 8080;
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs/dist/bcrypt");
// const cookie = require("cookie-parser");
// app.use(cookie());
const {
    signedIn,
    signedOut,
    petitionSigned,
    petitionUnSigned,
} = require("./middleware");

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
    res.redirect("register");
});

app.get("/login", signedIn, (req, res) => {
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

app.get("/register", signedIn, (req, res) => {
    console.log("get request REGISTER");
    res.render("register");
});

//post the given information from the register input fields
app.post("/register", (req, res) => {
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

//userprofile information routes
app.get("/user", signedOut, petitionUnSigned, (req, res) => {
    console.log("get request USER");
    res.render("user");
});

app.post("/user", (req, res) => {
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

//functionality of the petition site
//check for cookie with ID
app.get("/petition", signedOut, petitionUnSigned, (req, res) => {
    console.log("get request Petition");
    res.render("petition");
});

//add the signature and return an ID
app.post("/petition", (req, res) => {
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

//functionality when petition was signed...Implement information on signed route
app.get("/signed", signedOut, petitionSigned, (req, res) => {
    Promise.all([db.getId(req.session.logId), db.countSigners()]).then(
        ([getId, count]) => {
            res.render("signed", {
                signature: getId.rows[0].signature,
                count: count.rows[0].count,
            });
        }
    );
});

app.post("/signed", (req, res) => {
    db.deleteSignature(req.session.logId)
        .then(res.redirect("petition"), console.log("deleted Signature!"))
        .catch((err) => {
            console.log("ERROR in deleteSignatures", err);
        });
});

app.get("/signers", signedOut, (req, res) => {
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

app.get("/signers/:city", signedOut, (req, res) => {
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

app.post("/signers", (req, res) => {
    return res.redirect("edit");
});

app.get("/edit", signedOut, (req, res) => {
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

app.post("/edit", (req, res) => {
    let data = req.body;
    let cityUpper = data.City[0].toUpperCase() + data.City.substr(1);
    let firstUpper = data.first[0].toUpperCase() + data.first.substr(1);
    let lastUpper = data.last[0].toUpperCase() + data.last.substr(1);
    if (!data.first || !data.last || !data.email) {
        return res.redirect("/edit");
    }
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

app.get("/logout", (req, res) => {
    console.log("user logged out");
    req.session = undefined;
    res.redirect("/register");
});

app.listen(PORT, () => {
    console.log("petition server is listening!");
});
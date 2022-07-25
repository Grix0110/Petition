const express = require("express");
const app = express();
// const PORT = 8080;
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("./secrets.json").COOKIE_SECRET;

if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

app.use(express.urlencoded({ extended: false }));
app.use(express.static("./public"));
app.use(
    cookieSession({
        secret: COOKIE_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 24,
    })
);

const register = require("./router/register");
const login = require("./router/login");
const user = require("./router/user");
const petition = require("./router/petition");
const signing = require("./router/signing");
const edit = require("./router/edit");
app.use(register);
app.use(login);
app.use(user);
app.use(petition);
app.use(signing);
app.use(edit);

app.engine("handlebars", hb.engine());
app.set("view engine", "handlebars");

app.listen(process.env.PORT || 8080, () => {
    console.log("petition server is listening!");
});
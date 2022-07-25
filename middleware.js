const db = require("./db");

function signedIn(req, res, next) {
    if (req.session.logId) {
        return res.redirect("/user");
    }
    next();
}

function signedOut(req, res, next) {
    if (!req.session.logId) {
        return res.redirect("/register");
    }
    next();
}

function petitionSigned(req, res, next) {
    return db.getId(req.session.logId).then((result) => {
        if (result.rowCount === 0) {
            return res.redirect("/petition");
        }
        next();
    });
}

function petitionUnSigned(req, res, next) {
    return db.getId(req.session.logId).then((result) => {
        if (result.rowCount === 1) {
            return res.redirect("/signed");
        }
        next();
    });
}

module.exports = {
    signedIn,
    signedOut,
    petitionSigned,
    petitionUnSigned,
};

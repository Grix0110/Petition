const bcrypt = require("bcryptjs/dist/bcrypt");
const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/signatures");

module.exports.getId = (id) => {
    return db.query(`SELECT * FROM signatures WHERE id = $1`, [id]);
};

module.exports.getSigners = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.addSigner = (signature) => {
    return db.query(
        `
    INSERT INTO signatures(signature)
    VALUES ($1) RETURNING id`,
        [signature]
    );
};

module.exports.countSigners = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

function hashPassword(password) {
    return bcrypt.genSalt().then((salt) => {
        return bcrypt.hash(password, salt);
    });
}

module.exports.insertUser = (first, last, email, pword) => {
    return hashPassword(pword).then((hashedPassword) => {
        return db.query(
            `INSERT INTO users(first_name, last_name, email, pword) VALUES ($1, $2, $3,$4) RETURNING id`,
            [first, last, email, hashedPassword]
        );
    });
};

module.exports.findUser = (email) => {
    return db.query(`SELECT * FROM users WHERE email = $1`, [email]);
};

module.exports.authenticate = (email, password) => {
    return db
        .query(`SELECT * FROM users WHERE email = $1`, [email])
        .then(password);
};

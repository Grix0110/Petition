const bcrypt = require("bcryptjs/dist/bcrypt");
const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/signatures");

module.exports.getId = (id) => {
    return db.query(`SELECT * FROM signatures WHERE user_id = $1`, [id]);
};

module.exports.getUser = (id) => {
    return db.query(`SELECT * FROM users WHERE id = $1`, [id]);
};

// module.exports.getSigners = () => {
//     return db.query(`SELECT * FROM signatures`);
// };

module.exports.addSigner = (user_id, signature) => {
    return db.query(
        `
    INSERT INTO signatures(user_id, signature)
    VALUES ($1, $2) RETURNING id`,
        [user_id, signature]
    );
};

module.exports.getSigners = () => {
    return db.query(
        `SELECT users.first_name, users.last_name, profiles.age, profiles.city, profiles.homepage FROM users
        LEFT OUTER JOIN profiles
        ON users.id = profiles.user_id`
    );
};

module.exports.getSignerByCity = (city) => {
    return db.query(
        `SELECT users.first_name, users.last_name, profiles.age, profiles.city, profiles.homepage FROM users
        LEFT OUTER JOIN profiles
        ON users.id = profiles.user_id
        WHERE $1 = profiles.city`,
        [city]
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

module.exports.addProfile = (id, age, city, url) => {
    return db.query(
        `INSERT INTO profiles(user_id, age, city, homepage) VALUES ($1, $2, $3, $4)`,
        [id, age || null, city, url]
    );
};

module.exports.deleteSignature = (id) => {
    return db.query(`DELETE FROM signatures WHERE user_id = $1`, [id]);
};

const bcrypt = require("bcryptjs/dist/bcrypt");
const spicedPg = require("spiced-pg");

let databaseUrl;
if (process.env.NODE_ENV === "production") {
    databaseUrl = process.env.DATABASE_URL;
} else {
    const {
        DB_NAME,
        DB_PW,
        DB_HOST,
        DB_PORT,
        DB_BASE,
    } = require("./secrets.json");
    databaseUrl = `postgres:${DB_NAME}:${DB_PW}@${DB_HOST}:${DB_PORT}/${DB_BASE}`;
}

const db = spicedPg(databaseUrl);

module.exports.getId = (id) => {
    return db.query(`SELECT * FROM signatures WHERE user_id = $1`, [id]);
};

module.exports.getUser = (id) => {
    return db.query(`SELECT * FROM users WHERE id = $1`, [id]);
};

module.exports.addSigner = (user_id, signature) => {
    return db.query(
        `
    INSERT INTO signatures(user_id, signature)
    VALUES ($1, $2) RETURNING id`,
        [user_id, signature]
    );
};

module.exports.deleteSignature = (id) => {
    return db.query(`DELETE FROM signatures WHERE user_id = $1`, [id]);
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

module.exports.getSignerToEdit = (id) => {
    return db.query(
        `SELECT users.first_name, users.last_name, users.email, profiles.age, profiles.city, profiles.homepage FROM users
    LEFT OUTER JOIN profiles
    ON users.id = profiles.user_id
    WHERE $1 = user_id`,
        [id]
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
            `INSERT INTO users(first_name, last_name, email, pword) VALUES ($1, $2, $3, $4) RETURNING id`,
            [first, last, email, hashedPassword]
        );
    });
};

module.exports.findUser = (email) => {
    return db.query(`SELECT * FROM users WHERE email = $1`, [email]);
};

module.exports.addProfile = (id, age, city, url) => {
    return db.query(
        `INSERT INTO profiles(user_id, age, city, homepage) VALUES ($1, $2, initcap($3), $4)`,
        [id, age || null, city, url]
    );
};

module.exports.updateProfile = (id, age, city, url) => {
    return db.query(
        `
    INSERT INTO profiles(user_id, age, city, homepage) 
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET age = $2, city = $3, homepage = $4`,
        [id, age || null, city, url]
    );
};

module.exports.updateUserWithPassword = (id, first, last, email, password) => {
    return hashPassword(password).then((hashedPassword) => {
        console.log("hashed pass", hashedPassword);
        return db.query(
            `UPDATE users SET first_name = $2, last_name = $3, email = $4, pword = $5 WHERE id = $1`,
            [id, first, last, email, hashedPassword]
        );
    });
};

module.exports.updateUserWithoutPassword = (id, first, last, email) => {
    return db.query(
        `UPDATE users SET first_name = $2, last_name = $3, email = $4 WHERE id = $1`,
        [id, first, last, email]
    );
};
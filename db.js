const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/signatures");

// db.query("SELECT * FROM signatures")
//     .then(function (result) {
//         console.log(result.rows);
//     })
//     .catch(function (err) {
//         console.log(err);
//     });

module.exports.getId = (id) => {
    return db.query(`SELECT * FROM signatures WHERE id = $1`, [id]);
};

module.exports.getSigners = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.addSigner = (first, last, signature) => {
    return db.query(
        `
    INSERT INTO signatures(first, last, signature)
    VALUES ($1,$2,$3) RETURNING id`,
        [first, last, signature]
    );
};

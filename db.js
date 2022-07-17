const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/signatures");

// db.query("SELECT * FROM signatures")
//     .then(function (result) {
//         console.log(result.rows);
//     })
//     .catch(function (err) {
//         console.log(err);
//     });

module.exports.getSigners = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.addSigner = (first_name, last_name, signature) => {
    return db.query(
        `
    INSERT INTO signatures(first_name, last_name, signatures)
    VALUES ($1,$2,$3)`,
        [first_name, last_name, signature]
    );
};

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL primary key,
    first_name VARCHAR(255) NOT NULL CHECK (first_name <> ''),
    last_name VARCHAR(255) NOT NULL CHECK (last_name <> ''),
    email VARCHAR UNIQUE NOT NULL CHECK (email <> ''),
    pword VARCHAR UNIQUE NOT NULL CHECK (pword <> '')
);

CREATE TABLE profiles (
    id        SERIAL PRIMARY KEY,
    user_id   INTEGER NOT NULL UNIQUE REFERENCES users (id),
    age       INT,
    city      TEXT,
    homepage  TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

SELECT users.first_name, users.last_name, profiles.age, profiles.city, profiles.homepage 
    FROM users
    JOIN profiles
    ON users.id = profiles.user_id

UPADTE table SET column = $1
    WHERE column = row

INSERT INTO stats (pokemon_id, hp) VALUES (7,3)
    ON CONFLICT (pokemon_id)
    DO UPDATE SET hp=5 WHERE stats.pokemon_id=7

DELETE FROM stats WHERE pokemon_id = 7
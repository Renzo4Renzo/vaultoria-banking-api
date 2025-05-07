--Create a User
INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *;
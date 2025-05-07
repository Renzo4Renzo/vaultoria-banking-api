-- Create tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL
);

CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE account_owners (
    user_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, account_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER')),
    amount NUMERIC(12, 2) NOT NULL,
    from_account_id INTEGER,
    to_account_id INTEGER,
    FOREIGN KEY (from_account_id) REFERENCES accounts(id),
    FOREIGN KEY (to_account_id) REFERENCES accounts(id)
);

CREATE TABLE transaction_logs (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    error_message TEXT,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

-- Populate Tables
INSERT INTO users (name,email) VALUES ('Vernon Dursley', 'vernon.dursley@gmail.com')
INSERT INTO users (name,email) VALUES ('Tom Riddle', 'tom.riddle@gmail.com')
INSERT INTO users (name,email) VALUES ('Narcissa Malfoy', 'narcissa.malfoy@gmail.com')
INSERT INTO users (name,email) VALUES ('Rubeus Hagrid', 'rubeus.hagrid@gmail.com')
INSERT INTO users (name,email) VALUES ('Ginevra Weasley', 'ginevra.weasley@gmail.com')
INSERT INTO users (name,email) VALUES ('Alastor Moody', 'alastor.moody@gmail.com')
INSERT INTO users (name,email) VALUES ('Nymphadora Tonks', 'nymphadora.tonks@gmail.com')

DO $$
DECLARE
  user_ids INTEGER[] := ARRAY[1, 2, 3, 4, 5, 6, 7];  -- Replace with your user IDs
  uid INTEGER;
  new_account_id INTEGER;
BEGIN
  FOREACH uid IN ARRAY user_ids
  LOOP
    INSERT INTO accounts (balance)
    VALUES (0.00)
    RETURNING id INTO new_account_id;

    INSERT INTO account_owners (user_id, account_id)
    VALUES (uid, new_account_id);

    RAISE NOTICE 'Created account % for user %', new_account_id, uid;
  END LOOP;
END $$;
CREATE DATABASE expense_tracker;

USE expense_tracker;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    password VARCHAR(50)
);

CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    amount INT,
    category VARCHAR(50),
    date DATE
);

INSERT INTO users (password)
VALUES ('1234');
ALTER TABLE users ADD UNIQUE (username);
UPDATE users SET daily_budget = 5000 WHERE username='abdul';
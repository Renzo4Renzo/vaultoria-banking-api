--Get top X wealthiest users
WITH ranked_users AS (
    SELECT
        u.id AS user_id,
        u.name,
        u.email,
        SUM(a.balance) AS total_balance,
        DENSE_RANK() OVER (ORDER BY SUM(a.balance) DESC) AS rank
    FROM users u
    JOIN account_owners ao ON u.id = ao.user_id
    JOIN accounts a ON ao.account_id = a.id
    GROUP BY u.id, u.name, u.email
    HAVING SUM(a.balance) > 0
)
SELECT user_id, name, email, total_balance
FROM ranked_users
WHERE rank <= :rank;
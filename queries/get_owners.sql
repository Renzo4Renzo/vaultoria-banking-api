CREATE OR REPLACE FUNCTION get_owners(p_user_id INTEGER, p_account_id INTEGER)
RETURNS TABLE (id INTEGER, fullName CHARACTER VARYING, email CHARACTER VARYING) AS $$
BEGIN
	-- Check account exists
	IF NOT EXISTS (
		SELECT 1 FROM accounts a WHERE a.id = p_account_id
	) THEN
		RAISE EXCEPTION 'Account % Not Found', p_account_id;
	END IF;

	-- Check if requesting user is an owner
	IF NOT EXISTS (
		SELECT 1 FROM account_owners WHERE user_id = p_user_id AND account_id = p_account_id
 	) THEN
		RAISE EXCEPTION 'Unauthorized Access To Account: User % does not own account %', p_user_id, p_account_id;
	END IF;

	-- Return all users who own the account
	RETURN QUERY
	SELECT u.id, u.name AS fullName, u.email
	FROM users u
	JOIN account_owners ao ON ao.user_id = u.id
	WHERE ao.account_id = p_account_id;

END;
$$ LANGUAGE plpgsql;

SELECT * FROM get_owners(16, 24)
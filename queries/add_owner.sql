CREATE OR REPLACE FUNCTION add_owner(authenticated_user_id INTEGER, new_user_id INTEGER, selected_account_id INTEGER)
RETURNS VOID AS $$
DECLARE
	owner_ids INTEGER[];
BEGIN
    -- Ensure the account exists
	IF NOT EXISTS (
		SELECT 1 FROM accounts WHERE id = selected_account_id
	) THEN
		RAISE EXCEPTION 'Account not Found';
	END IF;

	--Lock relevant owners and fetch user_ids
	WITH locked_rows AS (
	    SELECT ao.user_id AS userId
	    FROM account_owners ao
	    WHERE ao.account_id = selected_account_id
	      AND ao.user_id IN (authenticated_user_id, new_user_id)
	    FOR UPDATE
	)
	SELECT ARRAY_AGG(userId) INTO owner_ids
	FROM locked_rows;

	--Check for authorization
	IF owner_ids IS NULL OR NOT (authenticated_user_id = ANY(owner_ids)) THEN
		RAISE EXCEPTION 'UnauthorizedAccessToAccount';
	END IF;

	--Check for duplicate ownership
	IF (new_user_id = ANY(owner_ids)) THEN
		RAISE EXCEPTION 'AccountOwnerExists';
	END IF;

	--Try insert and return inserted row
	BEGIN
		INSERT INTO account_owners (user_id, account_id)
		VALUES (new_user_id, selected_account_id);
	EXCEPTION
		WHEN SQLSTATE '23505' THEN -- Unique Violation
			RAISE EXCEPTION 'AccountOwnerExists';
		WHEN SQLSTATE '23503' THEN -- Foreign Key Violation
			RAISE EXCEPTION 'UserNotFound';
	END;
END;
$$ LANGUAGE plpgsql;


DO $$
BEGIN
	PERFORM add_owner(14, 7, 11);
END;
$$;
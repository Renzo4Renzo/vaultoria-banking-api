create or replace FUNCTION delete_owner(authentication_user_id INTEGER, target_user_id INTEGER, selected_account_id INTEGER)
RETURNS VOID AS $$
DECLARE
	remaining_count INTEGER;
BEGIN
	-- Ensure the account exists
	IF NOT EXISTS (
		SELECT 1 FROM accounts WHERE id = selected_account_id
	) THEN
		RAISE EXCEPTION 'Account Not Found';
    END IF;

	-- Ensure the user is authorized
	IF NOT EXISTS (
		SELECT 1
		FROM account_owners
		WHERE user_id = delete_owner.authentication_user_id AND account_id = selected_account_id
		FOR UPDATE
	) THEN
		RAISE EXCEPTION 'Unauthorized Access To Account';
	END IF;

    -- Delete the account
	IF NOT EXISTS (
		SELECT 1 FROM account_owners
		WHERE user_id = delete_owner.target_user_id AND account_id = selected_account_id
	) THEN
		RAISE EXCEPTION 'Account Owner Not Found';
	ELSE
		DELETE FROM account_owners
		WHERE user_id = delete_owner.target_user_id AND account_id = selected_account_id;
	END IF;

	-- Lock all owners for the account
	PERFORM 1
	FROM account_owners
	WHERE account_id = selected_account_id
	FOR UPDATE;
	
	-- Then count remaining owners
	SELECT COUNT(*) INTO remaining_count
	FROM account_owners
	WHERE account_id = selected_account_id;

	IF remaining_count = 0 THEN
		RAISE EXCEPTION 'Orphan Account Now Allowed';
	END IF;
END;
$$ LANGUAGE plpgsql;


DO $$
BEGIN
	PERFORM delete_owner(16, 7, 110);
END;
$$;
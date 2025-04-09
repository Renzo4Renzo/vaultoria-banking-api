CREATE OR REPLACE FUNCTION public.create_account(p_user_id integer)
 RETURNS accounts
 LANGUAGE plpgsql
AS $function$
declare
	v_account_id INTEGER;
	v_account accounts%ROWTYPE;
begin
 	--Lock the user row and ensure the user exists
	IF NOT EXISTS (
		SELECT 1
		FROM users
		WHERE id = p_user_id FOR UPDATE
	) THEN 
	  RAISE EXCEPTION 'User % not found', p_user_id;
	END IF;

    --Create account
 	INSERT INTO accounts (balance) 
	VALUES (0.00) 
	RETURNING id INTO v_account_id;

	--Get and Lock Account
	SELECT * INTO v_account
	FROM accounts
	where id = v_account_id FOR UPDATE;

	--Create Account Owner
	INSERT INTO account_owners (user_id, account_id) 
	VALUES (p_user_id, v_account_id);

	--Return Account
	RETURN v_account;
end;
$function$
;
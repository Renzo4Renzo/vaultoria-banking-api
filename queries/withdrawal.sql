-- Withdrawal transaction
CREATE OR REPLACE PROCEDURE public.withdrawal_transaction(IN p_user_id integer, IN p_from_account_id integer, IN p_amount numeric, IN p_request_id character varying)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
	v_transaction transactions%ROWTYPE;
	v_transaction_log_id INTEGER;
	v_error TEXT;
BEGIN

	--Check if transaction already exists
	IF p_request_id IS NOT NULL THEN
		SELECT *
	    INTO v_transaction
	    FROM transactions
	    WHERE request_id = p_request_id
	    LIMIT 1;
	
		IF FOUND THEN
			RAISE NOTICE 'Transaction % already exists', p_request_id;
			RETURN;
		END IF;
	END IF;

	--Create transaction
	INSERT INTO transactions (type, amount, from_account_id, request_id) VALUES ('WITHDRAWAL', p_amount, NULL, p_request_id) RETURNING * INTO v_transaction;

	--Create transaction_log record
	INSERT INTO transaction_logs (transaction_id, status) VALUES (v_transaction.id, 'PENDING') RETURNING id INTO v_transaction_log_id;


	--Call withdrawal procedure
	BEGIN
		CALL withdrawal(p_user_id, p_from_account_id, p_amount, v_transaction.id, v_error);

		IF v_error IS NOT NULL THEN
			RAISE EXCEPTION 'Error: %',v_error;
		END IF;

		--If all good
		UPDATE transaction_logs
		SET status = 'COMPLETED'
		WHERE id = v_transaction_log_id;

	EXCEPTION WHEN OTHERS THEN
		v_error :=  SQLERRM;

		UPDATE transaction_logs
		SET status = 'FAILED', error_message = v_error
		WHERE id = v_transaction_log_id;
	END;
END;
$procedure$
;

-- Withdrawal from account
CREATE OR REPLACE PROCEDURE public.withdrawal(IN p_user_id integer, IN p_from_account_id integer, IN p_amount numeric, IN v_transaction_id integer, OUT o_error text)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
	v_account_balance NUMERIC(12,2);
BEGIN
    o_error := NULL;

	--Check if account exists, lock it if so
	SELECT balance INTO v_account_balance
	FROM accounts
	WHERE id = p_from_account_id 
	FOR UPDATE;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'Account % not found', p_from_account_id;
	END IF;

	--Check ownership and lock it if so
	PERFORM 1
	FROM account_owners
	WHERE user_id = p_user_id AND account_id = p_from_account_id
	FOR UPDATE;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'Unauthorized access to account %', p_from_account_id;
	END IF;

	--Update transaction
	UPDATE transactions
	SET	from_account_id = p_from_account_id
	WHERE id = v_transaction_id;

	--Check if balance is greater/equal than withdrawal amount
	IF v_account_balance - p_amount < 0 THEN
		RAISE EXCEPTION 'Insufficient balance in account %', p_from_account_id;
	END IF;

	--Update balance
	UPDATE accounts
	SET balance = balance - p_amount
	WHERE id = p_from_account_id;

EXCEPTION WHEN OTHERS THEN
	o_error := SQLERRM;
END;
$procedure$
;
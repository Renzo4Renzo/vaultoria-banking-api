CREATE OR REPLACE PROCEDURE public.transfer_transaction(IN p_user_id integer, IN p_from_account_id integer, IN p_to_account_id integer, IN p_amount numeric, IN p_request_id character varying)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
	v_transaction_id INTEGER;
	v_transaction_log_id INTEGER;
	v_error TEXT;
BEGIN
	--Check if transaction already exists
	IF p_request_id IS NOT NULL THEN
		SELECT id
	    INTO v_transaction_id
	    FROM transactions
	    WHERE request_id = p_request_id
	    LIMIT 1;

        IF FOUND THEN
			RAISE NOTICE 'Transaction % already exists', p_request_id;
			RETURN;
		END IF;
	END IF;

	--Create transaction
	INSERT INTO transactions(type, amount, from_account_id, to_account_id, request_id) VALUES ('TRANSFER',p_amount,NULL,NULL,p_request_id) RETURNING id INTO v_transaction_id;

	--Create transaction log
	INSERT INTO transaction_logs (transaction_id, status) VALUES (v_transaction_id, 'PENDING') RETURNING id INTO v_transaction_log_id;

	--Call transfer procedure
	BEGIN
		CALL transfer(p_user_id, p_from_account_id, p_to_account_id, p_amount, v_transaction_id, v_error);

		IF v_error IS NOT NULL THEN
			RAISE EXCEPTION 'Error: %', v_error;
		END IF;

		--If all good
		UPDATE transaction_logs
		SET status = 'COMPLETED'
		WHERE id = v_transaction_log_id;

	EXCEPTION WHEN OTHERS THEN
		v_error:= SQLERRM;
		
		UPDATE transaction_logs
		SET status = 'FAILED', error_message = v_error
		WHERE id = v_transaction_log_id;
	END;

END;
$procedure$
;

CREATE OR REPLACE PROCEDURE public.transfer(IN p_user_id integer, IN p_from_account_id integer, IN p_to_account_id integer, IN p_amount numeric, IN v_transaction_id integer, OUT v_error text)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
	v_source_balance NUMERIC;
	v_destination_balance NUMERIC;
BEGIN
	v_error := NULL;

	--Get Accounts
	WITH locked_accounts AS (
	  SELECT id, balance
	  FROM accounts
	  WHERE id IN (p_from_account_id, p_to_account_id)
	  FOR UPDATE
	)
	SELECT 
	  MAX(CASE WHEN id = p_from_account_id THEN balance END),
	  MAX(CASE WHEN id = p_to_account_id THEN balance END)
	INTO v_source_balance, v_destination_balance
	FROM locked_accounts;

	--Check if source account exists
	IF v_source_balance IS NULL THEN
		RAISE EXCEPTION 'Source account not found';
	END IF;

	--Check if destination account exists
	IF v_destination_balance IS NULL THEN
		RAISE EXCEPTION 'Destination account not found';
	END IF;
	
	--Get Account Owner
	PERFORM 1
	FROM account_owners
	WHERE user_id = p_user_id AND account_id = p_from_account_id
	FOR UPDATE;
	
	IF NOT FOUND THEN
	  RAISE EXCEPTION 'Unauthorized access to account';
	END IF;

	--Update Transaction
	UPDATE transactions
	SET from_account_id = p_from_account_id, to_account_id = p_to_account_id
	WHERE id = v_transaction_id;
	
	--Check Balance
	IF v_source_balance - p_amount < 0 THEN
		RAISE EXCEPTION  'Insufficient balance';
	END IF;

    --Update Accounts
	UPDATE accounts
	SET balance = v_source_balance - p_amount
	WHERE id = p_from_account_id;

	UPDATE accounts
	SET balance = v_destination_balance + p_amount
	WHERE id = p_to_account_id;

EXCEPTION WHEN OTHERS THEN
	v_error := SQLERRM;
END;
$procedure$
;
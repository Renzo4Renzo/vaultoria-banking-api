
-- Create the deposit transaction
CREATE OR REPLACE PROCEDURE public.deposit_transaction(IN p_user_id integer, IN p_to_account_id integer, IN p_amount numeric, IN p_request_id character varying)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
  v_transaction transactions%ROWTYPE;
  v_transaction_log_id INT;
  v_account_balance NUMERIC(12,2);
  v_error TEXT;
BEGIN
  -- Check if transaction with request_id already exists
  IF p_request_id IS NOT NULL THEN
    SELECT *
    INTO v_transaction
    FROM transactions
    WHERE request_id = p_request_id
    LIMIT 1;

    IF FOUND THEN
      -- Already exists, nothing more to do
		RAISE NOTICE 'Transaction % already exists', p_request_id;
      RETURN;
    END IF;
  END IF;

  -- Create new transaction (with NULL to_account_id)
  INSERT INTO transactions (type, amount, to_account_id, request_id)
  VALUES ('DEPOSIT', p_amount, NULL, p_request_id)
  RETURNING * INTO v_transaction;

  -- Create transaction_log with PENDING status
  INSERT INTO transaction_logs (transaction_id, status)
  VALUES (v_transaction.id, 'PENDING')
  RETURNING id INTO v_transaction_log_id;

  -- Try to do the deposit safely
  BEGIN
    CALL deposit(v_transaction.id, p_to_account_id, p_user_id, p_amount, v_error);

    IF v_error IS NOT NULL THEN
      -- If internal error inside the procedure
      RAISE EXCEPTION 'Internal error: %', v_error;
    END IF;

    -- If all good
    UPDATE transaction_logs
    SET status = 'COMPLETED'
    WHERE id = v_transaction_log_id;

  EXCEPTION WHEN OTHERS THEN
    -- Mark transaction_log as FAILED
    v_error := SQLERRM;

    UPDATE transaction_logs
    SET status = 'FAILED', error_message = v_error
    WHERE id = v_transaction_log_id;
  END;
END;
$procedure$
;

-- Deposit into account
CREATE OR REPLACE PROCEDURE public.deposit(IN p_transaction_id integer, IN p_to_account_id integer, IN p_user_id integer, IN p_amount numeric, OUT o_error text)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
  v_account_balance NUMERIC(12,2);
BEGIN
  o_error := NULL;

  -- Lock and validate
  SELECT balance INTO v_account_balance
  FROM accounts
  WHERE id = p_to_account_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account % not found', p_to_account_id;
  END IF;

  PERFORM 1
  FROM account_owners
  WHERE user_id = p_user_id AND account_id = p_to_account_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unauthorized access to account %', p_to_account_id;
  END IF;

  -- Update balance
  UPDATE accounts
  SET balance = balance + p_amount
  WHERE id = p_to_account_id;

  -- Update transaction
  UPDATE transactions
  SET to_account_id = p_to_account_id
  WHERE id = p_transaction_id;

EXCEPTION WHEN OTHERS THEN
  o_error := SQLERRM;
END;
$procedure$
;

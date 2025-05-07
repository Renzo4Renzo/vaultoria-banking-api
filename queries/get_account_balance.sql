CREATE OR REPLACE FUNCTION public.get_account_balance(p_user_id integer, p_account_id integer)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
DECLARE
  balance numeric;
BEGIN
  -- Check if account exists and get its balance
  SELECT a.balance INTO balance
  FROM accounts a
  WHERE a.id = p_account_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account with ID % not found', p_account_id;
  END IF;

  -- Check if the user is an owner of the account
  IF NOT EXISTS (
    SELECT 1
    FROM account_owners ao
    WHERE ao.user_id = p_user_id
      AND ao.account_id = p_account_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized access to account % by user %', p_account_id, p_user_id;
  END IF;

  -- Return the balance
  RETURN balance;
END;
$function$
;
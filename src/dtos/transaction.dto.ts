interface BaseTransactionDTO {
  user_id: number;
  amount: number;
  request_id?: string;
}

export interface DepositIntoAccountDTO extends BaseTransactionDTO {
  to_account_id: number;
}

export interface WithdrawFromAccountDTO extends BaseTransactionDTO {
  from_account_id: number;
}

export interface TransferFromAccountDTO extends DepositIntoAccountDTO, WithdrawFromAccountDTO {}

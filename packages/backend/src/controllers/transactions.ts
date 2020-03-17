/* //TODO:
    -[] grab id from input
    -[] find account by id
    -[] get transactions array from account
    -[] return transactions related to account
*/

import { AppContext } from "../app";
import { Account } from "../models/account";
import { Transaction } from "../models/transaction";

const enforce = (subject: string, account: Account): boolean => {
  return account.userId.toString() === subject;
};

// const enforceTransactions = (subject: string, userId: string): boolean => {
//   return userId === subject
// };

export async function create(ctx: AppContext): Promise<void> {
  const { body } = ctx.request;

  const FAUCET_AMOUNT = 100000000n;

  const account = await Account.query().findById(body.accountId);

  if (!account) {
    return;
  }

  if (!enforce(ctx.state.user.sub, account)) {
    ctx.status = 403;
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    await Account.transaction(async trx => {
      const trxAccount = await Account.query(trx)
        .findById(account.id)
        .forUpdate();

      if (!trxAccount) {
        throw new Error("Account not found");
      }

      const balance = trxAccount.balance;
      const limit = trxAccount.limit;
      const newBalance = balance + FAUCET_AMOUNT;

      await Account.query(trx)
        .findById(trxAccount.id)
        .patch({
          balance: newBalance
        });

      await trxAccount.$relatedQuery("transactions", trx).insert({
        amount: FAUCET_AMOUNT,
        description: "Faucet money"
      });
    });

    ctx.status = 201;
  } catch (error) {
    console.log(error);
  }
}

export async function show(ctx: AppContext): Promise<void> {
  const { id } = ctx.params;

  ctx.logger.info("Getting an account", { id });

  const account = await Account.query().findById(id);
  if (!account) {
    return;
  }

    ctx.logger.info("Getting an transaction", { id });
      const transactions = await Transaction.query().where({ accountId: id })

      console.log(transactions)




}

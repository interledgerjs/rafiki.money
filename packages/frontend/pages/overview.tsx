/* 
TODO:
- [] colour on graph change based on darkmode
- [] get initial props with moc data for accounts & transactions card
*/

import React, { useState, useEffect, Fragment } from "react";
import { NextPage } from "next";
import { Card, Content, Navigation, Button } from "../components";
import { Doughnut } from "react-chartjs-2";

type Props = {
  account: AccountData;
};

type UserInfo = {
  id: number;
  username?: string;
  password?: string;
  defaultAccountId?: string;
}

type TransactionInfo = {
  // FIXME: bigInt for amount
  id: number;
  accountId: number;
  amount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
};

type AccountInfo = {
  id: number;
  userId?: number;
  name: string;
  assetCode?: string;
  assetScale?: number;
  //FIXME: change balance numbers to string
  balance: number;
  limit?: string;
};

export type AccountData = {
  user: {
    client_id: string;
  };
  accounts?: AccountInfo[];
  transactions: TransactionInfo[];
};

const dummyAccountInfo: AccountData = {
  user: {
    client_id: "Test"
  },
  accounts: [
    {
      id: 1,
      name: "Cheque",
      balance: 100
    },
    {
      id: 2,
      name: "Savings",
      balance: 300
    },
    {
      id: 3,
      name: "Credit Card",
      balance: 100
    },
    {
      id: 4,
      name: "Vacation",
      balance: 1000
    },
    {
      id: 5,
      name: "Swiss Bank Account",
      balance: 100000
    }
  ],
  transactions: [
    {
      id: 1,
      accountId: 1,
      amount: 50,
      description: "Test",
      createdAt: "1 Feb 2020",
      updatedAt: "1 Feb 2020"
    },
    {
      id: 2,
      accountId: 1,
      amount: 100,
      description: "Test",
      createdAt: "1 Feb 2020",
      updatedAt: "1 Feb 2020"
    },
    {
      id: 3,
      accountId: 2,
      amount: 84,
      description: "Test",
      createdAt: "1 Feb 2020",
      updatedAt: "1 Feb 2020"
    },
    {
      id: 4,
      accountId: 1,
      amount: -16,
      description: "Test",
      createdAt: "2 Feb 2020",
      updatedAt: "2 Feb 2020"
    },
    {
      id: 5,
      accountId: 1,
      amount: 200,
      description: "Test",
      createdAt: "2 Feb 2020",
      updatedAt: "2 Feb 2020"
    },
    {
      id: 6,
      accountId: 3,
      amount: -160,
      description: "Test",
      createdAt: "2 Feb 2020",
      updatedAt: "2 Feb 2020"
    }
  ]
};

type accountData = {
  id: number;
  name: string;
  balance: number;
};

const btnCopyTap = () => {};
const btnCopyTo = "";
const btnAddAccountTap = () => {};
const btnAddAccountTo = "";

const data = {
  labels: ["Cheque", "Savings"],
  datasets: [
    {
      data: [300, 500],
      backgroundColor: ["#9B51E0", "#2F80ED"],
      hoverBackgroundColor: ["#9B51E0", "#36A2EB"]
    }
  ]
};

// Renders Accounts cards
function AccountCard(name: String, balance: String) {
  // TODO: currency symbols
  return (
    <Fragment>
      <Card>
        <div className="headline-5">{name}</div>
        <div className="headline-4">${balance}</div>
      </Card>
    </Fragment>
  );
}

function renderAccountCards(data: AccountData) {
  if (data.accounts.length > 0) {
    const listAccounts = data.accounts.map((mapData, index) => {
      var account: accountData = {
        id: mapData.id,
        name: mapData.name,
        balance: mapData.balance
      };
      return account;
    });

    let cardArray = [];
    for (let index = 0; index < listAccounts.length; index++) {
      cardArray.push(
        <Fragment key={listAccounts[index].id}>
          <div className="w-card md:pr-0 md:w-auto pb-4">
            {AccountCard(
              listAccounts[index].name,
              listAccounts[index].balance.toString()
            )}
          </div>
        </Fragment>
      );
    }
    return (
      <div className="flex flex-col items-center sm:flex-row md:flex-wrap md:justify-between">
        {cardArray}
      </div>
    );
  }
}

function TransactionCard(name: string, date: string, amount: number) {
  //TODO: colors change based on account

  var nameColor: string = "overline text-purple";
  var amountColor: string = "self-center headline-6 text-green";
  var amountSign: string = "";

  if (amount <= 0) {
    amountColor = "self-center headline-6 text-red";
    amountSign = "-";
    amount = Math.abs(amount);
  }
  return (
    <div className="my-2">
      <Card>
        <div className="flex justify-between">
          <div>
            <div className={nameColor}>{name}</div>
            <div className="headline-6">{date}</div>
          </div>
          <div className={amountColor}>
            {amountSign}$ {amount}
          </div>
        </div>
      </Card>
    </div>
  );
}

function retrieveAccountName(data: AccountData, accountId: number) {
  //FIXME: Find a way to not pass the whole data object around
  let name: string;
  data.accounts.forEach(element => {
    if (element.id === accountId) name = element.name;
  });
  return name;
}

function renderTransactionCards(data: AccountData) {
  if (data.transactions.length > 0) {
    const listTransactions = data.transactions.map((mapData, index) => {
      var transaction: TransactionInfo = {
        id: mapData.id,
        accountId: mapData.accountId,
        amount: mapData.amount,
        description: mapData.description,
        createdAt: mapData.createdAt,
        updatedAt: mapData.updatedAt
      };
      return transaction;
    });

    let cardArray = [];
    let accountName: string;
    for (let index = 0; index < listTransactions.length; index++) {
      {
        accountName = retrieveAccountName(
          data,
          listTransactions[index].accountId
        );
      }

      cardArray.push(
        <Fragment key={listTransactions[index].id}>
          <div>
            {TransactionCard(
              accountName,
              listTransactions[index].createdAt,
              listTransactions[index].amount
            )}
          </div>
        </Fragment>
      );
    }

    return <div className="flex flex-col-reverse">{cardArray}</div>;
  }
}

const Overview: NextPage<Props> = ({ account }) => {
  return (
    <div className="flex">
      <Navigation active="overview"></Navigation>
      <Content navigation>
        <div className="flex">
          <div>
            <div className="flex flex-row">
              <div>
                <Card>
                  <div className="headline-5">Total balance</div>
                  <div className="headline-3 pb-1">$126.00</div>
                </Card>
              </div>
              <div className="pl-16 relative flex">
                <Card>
                  <div className="headline-5">Payment Pointer</div>
                  <div className="body-2">$rafiki.money/p/cairin@coil.com</div>
                  <div className="flex pr-3 pt-5 justify-end">
                    <Button type="text" onTap={btnCopyTap}>
                      Copy
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
            <div className="flex py-6">
              <div className="headline-6">Accounts</div>
              <div className="w-64 flex-1"></div>
              <div className="">
                <Button
                  type="solid"
                  onTap={btnAddAccountTap}
                >
                  Add account
                </Button>
              </div>
            </div>
            {/* Accounts*/}
            <div>{renderAccountCards(account)}</div>
          </div>
          <div className="ml-8 hidden md:flex">
            {/* Graph Card */}
            <Card>
              <div className="h-64">
                <Doughnut
                  data={data}
                  width={170}
                  legend={{
                    position: "left",
                    display: false
                  }}
                />
              </div>

              {/* Headline */}
              <div className="mt-10 headline-6">Transactions</div>
              {/* Transactions in sidebar */}
              <div className="flex flex-col h-64 overflow-y-auto">
                {renderTransactionCards(account)}
              </div>
            </Card>
          </div>
        </div>
      </Content>
    </div>
  );
};

Overview.getInitialProps = async ({}) => {
  // FIXME: Get accounts & Transactions from those accounts instead of mocking data
  const account = dummyAccountInfo;

  return { account };
};

export default Overview;

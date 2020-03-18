
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('mandates').del()
    .then(function () {
      // Inserts seed entries
      return knex('mandates').insert([
        {
          id: 'ce149ace-61e3-11ea-bc55-0242ac130003', 
          userId: '1',
          accountId: '1',
          description: 'Big Burger 1',
          assetCode: '111',
          assetScale: '6',
          amount: '4000',
          balance: '1000',
          startAt: '2010-01-01 01:11:10.111111+00',
          expireAt: '2111-11-11 11:11:11.111111+00',
          interval: 'Yearly',
          cap: true,
          scope: 'Scope',
          createdAt: '1010-01-01 01:11:10.111111+00',
          updatedAt: '1010-01-01 01:11:10.111111+00',
          cancelledAt: null
        },
        {
          id: 'ce149d9e-61e3-11ea-bc55-0242ac130003', 
          userId: '1',
          accountId: '1',
          description: 'Big Burger 2',
          assetCode: '222',
          assetScale: '6',
          amount: '4000',
          balance: '2000',
          startAt: '2020-02-02 02:22:20.222222+00',
          expireAt: '2020-02-02 02:22:20.222222+00',
          interval: 'Yearly',
          cap: true,
          scope: 'Scope',
          createdAt: '2020-02-02 02:22:20.222222+00',
          updatedAt: '2020-02-02 02:22:20.222222+00',
          cancelledAt: null
        },
        {
          id: 'ce149ee8-61e3-11ea-bc55-0242ac130003', 
          userId: '1',
          accountId: '1',
          description: 'Big Burger 3',
          assetCode: '333',
          assetScale: '6',
          amount: '4000',
          balance: '3000',
          startAt: '3030-03-03 03:33:30.333333+00',
          expireAt: '3030-03-03 03:33:30.333333+00',
          interval: 'Yearly',
          cap: true,
          scope: 'Scope',
          createdAt: '3030-03-03 03:33:30.333333+00',
          updatedAt: '3030-03-03 03:33:30.333333+00',
          cancelledAt: null
        }
      ]);
    });
};

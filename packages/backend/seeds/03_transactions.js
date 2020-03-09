
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('transactions').del()
    .then(function () {
      // Inserts seed entries
      return knex('transactions').insert([
        {
          id: 1,
          accountId: 1,
          amount: 100,
          description: 'Description for This',
          createdAt: '1010-01-01 01:11:10.111111+00',
          updatedAt: '1010-01-01 01:11:10.111111+00'
        },
        {
          id: 2,
          accountId: 1,
          amount: 200,
          description: 'Description for This',
          createdAt: '2020-02-02 02:22:20.222222+00',
          updatedAt: '2020-02-02 02:22:20.222222+00'
        },
        {
          id: 3,
          accountId: 1,
          amount: 300,
          description: 'Description for This',
          createdAt: '3030-03-03 03:33:30.333333+00',
          updatedAt: '3030-03-03 03:33:30.333333+00'
        },
        {
          id: 4,
          accountId: 1,
          amount: 400,
          description: 'Description for This',
          createdAt: '4040-04-04 04:44:40.444444+00',
          updatedAt: '4040-04-04 04:44:40.444444+00'
        },
        {
          id: 5,
          accountId: 1,
          amount: 500,
          description: 'Description for This',
          createdAt: '5050-05-05 05:55:50.555555+00',
          updatedAt: '5050-05-05 05:55:50.555555+00'
        },
        {
          id: 6,
          accountId: 1,
          amount: 600,
          description: 'Description for This',
          createdAt: '6060-06-06 06:06:06.666666+00',
          updatedAt: '6060-06-06 06:06:06.666666+00'
        },
        {
          id: 7,
          accountId: 1,
          amount: 700,
          description: 'Description for This',
          createdAt: '7070-07-07 07:07:07.777777+00',
          updatedAt: '7070-07-07 07:07:07.777777+00'
        },
        {
          id: 8,
          accountId: 1,
          amount: 800,
          description: 'Description for This',
          createdAt: '8080-08-08 08:08:08.888888+00',
          updatedAt: '8080-08-08 08:08:08.888888+00'
        },
        {
          id: 9,
          accountId: 1,
          amount: 900,
          description: 'Description for This',
          createdAt: '9090-09-09 09:09:09.999999+00',
          updatedAt: '9090-09-09 09:09:09.999999+00'
        },
      ]);
    });
};

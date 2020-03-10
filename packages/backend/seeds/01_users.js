
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {
          id: 1, 
          username: 'mandates@user.com',
          password: '$2b$10$btMgXC.9BrQRioNQb.NLpOLP8dWglOZFadFRR4p/LOnxh9z9HjpjW',
          createdAt: '2020-03-09 08:49:40.158375+00',
          updatedAt: '2020-03-09 08:51:40.158375+00',
          defaultAccountId: 'defaultAccountId'
        }
      ]);
    });
};

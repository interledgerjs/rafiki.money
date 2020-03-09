
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {
          id: 1, 
          username: 'Mandates User',
          password: 'Mandates User',
          createdAt: '2020-03-09 08:49:40.158375+00',
          updatedAt: '2020-03-09 08:51:40.158375+00',
          defaultAccountId: 'defaultAccountId'
        }
      ]);
    });
};

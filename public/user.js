exports.users = []

users.push({
  id: Date.now().toString(),
  name: 'Admin',
  email: process.env.login_id,
  password: process.env.login_password,
  role:0
})

users.push({
  id: Date.now().toString(),
  name: 'User',
  email: 'stuff@gmail.com',
  password: '1234',
  role:1
})

users.push({
  id: Date.now().toString(),
  name: 'User',
  email: 'test@gmail.com',
  password: '1234',
  role:1
})

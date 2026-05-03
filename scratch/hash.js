import bcrypt from 'bcryptjs';
const password = 'pedrao';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);

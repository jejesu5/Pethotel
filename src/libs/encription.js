const bcrypt = require('bcrypt')

const encrypt = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

const compareEncrypt = async (hash, password) => {
  return await bcrypt.compare(hash, password)
}

module.exports = {
  encrypt,
  compareEncrypt
}

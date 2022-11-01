const db = require('../database/models/db.models')
const Role = db.roles

async function createRoles () {
  try {
    const roles = await Role.estimatedDocumentCount()
    if (roles > 0) {
      return
    }
    const values = await Promise.all([
      new Role({ name: 'admin' }).save(),
      new Role({ name: 'client' }).save()
    ])
    console.log(values)
  } catch (error) {
    console.error(error.message)
  }
}

module.exports = createRoles

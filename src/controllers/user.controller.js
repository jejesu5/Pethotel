const services = require('../services/user.service')

exports.getAllUser = async (req, res) => {
  try {
    const { skip, limit } = req.query
    const users = await services.getAllUsers(skip, limit)
    return res.send(users)
  } catch (error) {
    return res.status(500).send({ msg: error.message })
  }
}

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const user = await services.getUserById(id)
    return res.send(user)
  } catch (error) {
    return res.status(500).send({ msg: error.message })
  }
}

exports.modifyUser = async (req, res) => {
  try {
    const updates = req.body
    const { id } = req.params
    const toModify = await services.modifyUser(id, updates)

    return res.send(toModify)
  } catch (error) {
    return res.status(500).send({ msg: error.message })
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const toDelete = await services.deleteUser(id)

    return res.send(toDelete)
  } catch (error) {
    return res.status(500).send({ msg: error.message })
  }
}

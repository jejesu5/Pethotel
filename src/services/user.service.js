const db = require('../database/models/db.models')
const User = db.user

/**
 * this service is used to get all the users, it's paginated, if skip and limit are not provided, it will return all the users with a default limit
 * @param {*} skip
 * @param {*} limit
 * @returns array of all the users
 */
exports.getAllUsers = async (skip = 0, limit = 10) => {
  try {
    const count = await User.count({ isActive: true })
    const users = await User.find({ isActive: true }).populate('roles', {
      name: 1,
      _id: 0
    }).limit(limit).skip(skip * limit).sort({ createdAt: 'desc' })
    return {
      currentPage: skip,
      maxPage: Math.ceil(count / limit),
      data: users
    }
  } catch (error) {
    throw new Error(error)
  }
}

/**
   * this service is used to get a user by id
   * @param {*} id from the user
   * @returns all the information of the user
   */
exports.getUserById = async (id) => {
  try {
    const user = await User.findById(id).populate('roles', {
      name: 1,
      _id: 0
    })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

/**
   * this service is used to update a user, it requires the id of the user and the new info to update
   * @param {*} id from the user
   * @param {*} updates info to update the user
   * @returns updated user
   */
exports.modifyUser = async (id, updates) => {
  try {
    const toUpdate = await User.findByIdAndUpdate(id, updates, { new: true })
    return toUpdate
  } catch (error) {
    throw new Error(error)
  }
}

/**
   * this service is used to delete a user, it requires the id of the user
   * @param {*} id from the user
   * @returns deleted user
   */
exports.deleteUser = async (id) => {
  try {
    const toDelete = await User.findByIdAndUpdate(id, { isActive: false }, { new: true })

    return toDelete
  } catch (error) {
    throw new Error(error)
  }
}

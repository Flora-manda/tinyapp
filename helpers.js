//Check if user already exists in db
const checkUserByEmail = (email, database) => {
  for (let userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
};

module.exports = { checkUserByEmail };
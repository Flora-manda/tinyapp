//Required modules and functions
const { assert } = require('chai');
const { checkUserByEmail } = require('../helpers.js');


//Users database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


//Test assertions
describe('getUserByEmail', function() {

  it('should return a user with valid email', function() {
    const user = checkUserByEmail("user@example.com", users);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user.id, expectedOutput);
  });

  it('should return undefined with an invalid email', function() {
    const user = checkUserByEmail("test123@example.com", users);
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });

});
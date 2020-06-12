const { assert } = require('chai');

const emailLookup = require('../helpers.js');

const testUsers = {
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

describe('emailLookup', function() {
  
  it('should return true when an email exists in database', function() {
    const user = emailLookup("user@example.com", testUsers)
    const expectedOutput = true;
    assert.equal(user, expectedOutput);
  });

  it('should return false when an email doesn\'t exist', function() {
    const user = emailLookup("goomba@hat.com", testUsers)
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });

});
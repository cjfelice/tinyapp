const emailLookup = function(newEmail, database) {
  for (const user in database) {
    if (database[user].email === newEmail) {
      return true;
    }
  }
  return false;
};

const generateRandomString = function() {
  let newString = '';
  for (let i = 0; i < 6; i++) {
    newString += Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)[0];
  }
  newString += '!';
  return newString.toUpperCase();
};

const idLookup = function(key, value, database) {
  for (const user in database) {
    if (database[user][key] === value) {
      return user;
    }
  }
};

const httpAdd = function(string) {
  let checkString = '';
  for (let i = 0; i < 7; i++) {
    checkString += string[i];
  }
  if (checkString === "http://") {
    return string;
  } else {
    return 'http://' + string;
  }
};

const urlForUser = function(id, database) {
  let newObj = {};
  for (const item in database) {
    if (database[item].userID === id) {
      newObj[item] = database[item];
    }
  }
  return newObj;
};

module.exports = { emailLookup, generateRandomString, idLookup, httpAdd, urlForUser };
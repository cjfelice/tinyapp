//checks if a given email exists in the database and return a boolean.
const emailLookup = function(newEmail, database) {
  for (const user in database) {
    if (database[user].email === newEmail) {
      return true;
    }
  }
  return false;
};

//generates a random string of 6 capitalized letters
//ending with an exclamation mark. I think it looks cool.
const generateRandomString = function() {
  let newString = '';
  for (let i = 0; i < 6; i++) {
    newString += Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)[0];
  }
  newString += '!';
  return newString.toUpperCase();
};

//finds the corresponding user id when given a key and a value to search.
const idLookup = function(key, value, database) {
  for (const user in database) {
    if (database[user][key] === value) {
      return user;
    }
  }
};

//adds 'http://' to a given url if user forgot to add it themselves.
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

//creates an object containing all of the saved urls for a given user id.
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
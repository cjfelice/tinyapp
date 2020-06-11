const express = require('express');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const generateRandomString = function() {
  let newString = '';
  for (i = 0; i < 6; i++) {
    newString += Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)[0];
  }
  newString += '!';
  return newString.toUpperCase();
};

const emailLookup = function(newEmail) {
  for(const user in users) {
    if (users[user].email === newEmail) {
      return false;
    }
  }
  return true;
};

const idLookup = function(key, value) {
  for(const user in users) {
    if (users[user][key] === value) {
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


app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.com',
  '9sm5xK': 'http://www.google.com'
};


const urlForUser = function(id) {
  let newObj = {};
  for (const item in urlDatabase) {
    if (urlDatabase[item].userID === id) {
      newObj[item] = urlDatabase[item];
    }
  }
  console.log(newObj);
  return newObj;
};

urlForUser('g@man.com');

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
}

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlForUser(req.cookies['user_id']), userID: req.cookies['user_id'], users: users };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, userID: req.cookies['user_id'], users: users };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, userID: req.cookies['user_id'], users: users };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, userID: req.cookies['user_id'], users: users };
  res.render("urls_login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userID: req.cookies['user_id'], users: users };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.cookies['user_id']) {
  const newLong = httpAdd(req.body.longURL);
  const newShort = generateRandomString();
  urlDatabase[newShort] = { 'longURL': newLong, 'userID': req.cookies['user_id']};
  res.redirect(`/urls/${newShort}`);
  } else {
    res.redirect('/login');
  } 
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = httpAdd(req.body.longURL);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const ID = idLookup('email', email);
  if (emailLookup(email)) {
    res.sendStatus(403);
  } else if (users[ID].password !== password) {
    res.sendStatus(403);
  } else {
    res.cookie('user_id', email);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post('/register', (req, res) => {
  newID = generateRandomString();
  if (!req.body.email || !req.body.password || !emailLookup(req.body.email)) {
    res.sendStatus(400);
  } else {
    users[newID] = { id: newID, email: req.body.email, password: req.body.password };
    res.cookie('user_id', users[newID].email);
    res.redirect("/urls");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
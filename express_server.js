const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const { emailLookup } = require('./helpers');
const { generateRandomString } = require('./helpers');
const { idLookup } = require('./helpers');
const { httpAdd } = require('./helpers');
const { urlForUser } = require('./helpers');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.com',
  '9sm5xK': 'http://www.google.com'
};

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

app.get('/', (req, res) => {
  res.redirect("/urls");
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlForUser(req.session.user_id, urlDatabase), userID: req.session.user_id, users: users };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, userID: req.session.user_id, users: users };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, userID: req.session.user_id, users: users };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, userID: req.session.user_id, users: users };
  res.render("urls_login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userID: req.session.user_id, users: users, myUrl: urlForUser(req.session.user_id, urlDatabase) };
    res.render("urls_show", templateVars);
  } else {
    let templateVars = { userID: req.session.user_id, users: users, myUrl: urlForUser(req.session.user_id, urlDatabase) };
    res.render("urls_notFound", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    let templateVars = { userID: req.session.user_id, users: users, myUrl: urlForUser(req.session.user_id, urlDatabase) };
    res.render("urls_notFound", templateVars);
  }
});

app.get("/userError", (req, res) => {
  let templateVars = { urls: urlDatabase, userID: req.session.user_id, users: users };
  res.render("urls_problem", templateVars);
});

app.get("/regError", (req, res) => {
  let templateVars = { urls: urlDatabase, userID: req.session.user_id, users: users };
  res.render("urls_regErr", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const newLong = httpAdd(req.body.longURL);
    const newShort = generateRandomString();
    urlDatabase[newShort] = { 'longURL': newLong, 'userID': req.session.user_id};
    res.redirect(`/urls/${newShort}`);
  } else {
    res.redirect('/login');
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const myUrls = urlForUser(req.session.user_id, urlDatabase);
  const pageTitle = req.params.shortURL;
  if (userID && myUrls[pageTitle]) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const myUrls = urlForUser(req.session.user_id, urlDatabase);
  const pageTitle = req.params.shortURL;
  if (userID && myUrls[pageTitle]) {
    urlDatabase[req.params.shortURL] = { 'longURL': httpAdd(req.body.longURL), 'userID': req.session.user_id};
  }
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const ID = idLookup('email', email, users);
  if (!emailLookup(email, users)) {
    res.redirect("/userError");
  }
  bcrypt.compare(password, users[ID].password, function(err, result) {
    if (result === false) {
      res.redirect("/userError");
    } else {
      req.session.user_id = email;
      res.redirect("/urls");
    }
  });
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post('/register', (req, res) => {
  const newID = generateRandomString();
  if (!req.body.email || !req.body.password || emailLookup(req.body.email, users)) {
    res.redirect("/regError");
  } else {
    users[newID] = { id: newID, email: req.body.email};
    bcrypt.hash(req.body.password, 10, function(err, hash) {
      if (err) {
        throw err;
      }
      users[newID].password = hash;
      return;
    });
    req.session.user_id = users[newID].email;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
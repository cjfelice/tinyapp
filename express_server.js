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

const urlDatabase = {};

const users = {};

//redirects to a page that shows login options or a logged in user's urls.
app.get('/', (req, res) => {
  res.redirect("/urls");
});

//renders url index.
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlForUser(req.session.user_id, urlDatabase), userID: req.session.user_id, users: users };
  res.render('urls_index', templateVars);
});

//renders new url form page.
app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, userID: req.session.user_id, users: users };
  res.render("urls_new", templateVars);
});

//renders registration form for new account.
//if user is already logged in, they can still create a new account with a different email.
app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, userID: req.session.user_id, users: users };
  res.render("urls_registration", templateVars);
});

//renders login form page.
app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, userID: req.session.user_id, users: users };
  res.render("urls_login", templateVars);
});

//directs a user to an existing short url edit page.
//or directs to error page if requested tinyurl doesnt exist.
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userID: req.session.user_id, users: users, myUrl: urlForUser(req.session.user_id, urlDatabase) };
    res.render("urls_show", templateVars);
  } else {
    let templateVars = { userID: req.session.user_id, users: users, myUrl: urlForUser(req.session.user_id, urlDatabase) };
    res.render("urls_notFound", templateVars);
  }
});

//redirects tinyurl link to previopusly set url.
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    let templateVars = { userID: req.session.user_id, users: users, myUrl: urlForUser(req.session.user_id, urlDatabase) };
    res.render("urls_notFound", templateVars);
  }
});

//renders login error site.
app.get("/userError", (req, res) => {
  let templateVars = { urls: urlDatabase, userID: req.session.user_id, users: users };
  res.render("urls_problem", templateVars);
});

//renders registration error site.
app.get("/regError", (req, res) => {
  let templateVars = { urls: urlDatabase, userID: req.session.user_id, users: users };
  res.render("urls_regErr", templateVars);
});

//adds new tinyurl into the database if user is logged in.
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

//removes tinyurl from database if user is logged into the creating account.
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const myUrls = urlForUser(req.session.user_id, urlDatabase);
  const pageTitle = req.params.shortURL;
  if (userID && myUrls[pageTitle]) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

//edits tinyurl if user is logged into the creating account.
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const myUrls = urlForUser(req.session.user_id, urlDatabase);
  const pageTitle = req.params.shortURL;
  if (userID && myUrls[pageTitle]) {
    urlDatabase[req.params.shortURL] = { 'longURL': httpAdd(req.body.longURL), 'userID': req.session.user_id};
  }
  res.redirect("/urls");
});

//logs a user into an existing account with email & password
//or gives errors if incorrect info is entered.
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

//removes user id cookies and logs a user out.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//creates a new account and logs a user in.
//if email exists for another account or form is unfilled throws error.
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
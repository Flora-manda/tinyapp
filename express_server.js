////////////////////////////////////////////////////////////////
/////////////////////////---MODULES---/////////////////////////
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


///////////////////////////////////////////////////////////////
//////////////////--- IN MEMORY DATABASE---///////////////////
const urlDatabase = {
  "b2xVn2": { shortURL: "b2xVn2", longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { shortURL: "9sm5xK", longURL: "http://www.google.com", userID: "user2RandomID" }
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

////////////////////////////////////////////////////////////////////
////////////////////////---FUNCTIONS---////////////////////////////

//Fuction that returns URL to logged in user in their account
const urlsForUser = (id) => {
  let result = [];
  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      result.push(urlDatabase[urlId]);
    }
  }
  console.log(result);
  return result;
};

//To add new longURL and userID in db
const addURL = (longURL, userID) => {
  let shortURL = generateRandomString(6);
  const newObj = {
    shortURL,
    longURL,
    userID
  };
  urlDatabase[shortURL] = newObj;
  return shortURL;
};

//Check if user already exists in db
const checkUserByEmail = email => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};

//Create new user in db
const addNewUser = (email, password) => {
  const userId = generateRandomString(13);
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);

  const newUserObj = {
    id: userId, 
    email, 
    password: hash
  }

  users[userId] = newUserObj;
  return userId;
};
  
//Generates random string for shortURL
function generateRandomString() {
  let result = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < 6; i++ ) {
    result += chars.charAt(Math.floor(Math.random() * 62));
  }
   return result;
};

//To update longURL in db
const updateURL = (shortURL, longURL) => {
  urlDatabase[shortURL].longURL = longURL;
  return true;
};

////////////////////////////////////////////////////////////////////
//////////////////////---SERVER LOGIC---///////////////////////////

//Register endpoint for POST request
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.status(400).send('Please enter a valid email or password to register!');
  } else if (!checkUserByEmail(email)) {
    const userId = addNewUser(email, password);
    res.cookie("user_id", userId);
    res.redirect("/urls");
  } else {
    res.status(403).send('There is a user already registered with this email!');
  }
});

//Register endpoint for GET request
app.get("/register", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  let templateVars = { currentUser: loggedInUser };
  res.render("urls_register", templateVars);
});express


//Login endpoint for POST request
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = checkUserByEmail(email);

  if (email === "" || password === "") {
    res.status(403).send('Please enter a valid email or password to login!');
  } else if (!userId.email) {
    res.status(403).send('User with this email cannot be found!');
  } else if (userId.email) {
      if (!bcrypt.compareSync(password, userId.password)) {
        res.status(403).send('Incorrect password!');
      } else {
    res.cookie("user_id", userId.id);
    res.redirect("/urls");
    }
  }
});

//Login endpoint for GET request
app.get("/login", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  let templateVars = { currentUser: loggedInUser };
  res.render("urls_login", templateVars);
});

//Logout endpoint for POST request
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Edit shortURL key/property only if user is logged in
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  updateURL(shortURL, longURL);
  res.redirect("/urls");
});

//Delete shortURL key/property only if user is logged in
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURL === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  } else {
     res.redirect("/urls");
  }
});

//longURL redirect endpoint for GET request
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Edit URLS endpoint for POST request
app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const longURL = req.body.longURL;
  const shortURL = addURL(longURL, userId);
  const loggedInUser = users[userId];
  let templateVars = { shortURL, longURL, currentUser: loggedInUser };
  res.render("urls_show", templateVars);     // Redirects to the url_show template 
});

//To check URL database
app.get("/urls/json", (req, res) => {
  res.json(urlDatabase);
});

//To check user database
app.get("/users/json", (req, res) => {
  res.json(users);
});

//Create new URL endpoint (GET request) if the user is logged in
app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  let templateVars = { currentUser: loggedInUser };
  if (userId) {
    res.render("urls_new", templateVars);
  } else {
    res.render("urls_login", templateVars);
  }
});

//Create new URL endpoint via GET request only if user is logged
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, currentUser: loggedInUser };
  if (shortURL === urlDatabase[shortURL].userID) {
    res.render("urls_show", templateVars);
  }
});

//Homepage for TinyApp: will show no URL if not logged in
app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  const urls = urlsForUser(userId);
  let templateVars = { urls, currentUser: loggedInUser };
  res.render("urls_index", templateVars);
});

//Server listening on PORT 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

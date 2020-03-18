//-------------------------START - MODULES---------------------------//
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
//---------------------------END- MODULES----------------------------//



//------------------START - IN MEMORY DATABASE-----------------------//
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}
//------------------END - IN MEMORY DATABASE-----------------------//




//-----------------------START - FUNCTIONS------------------------//

//Check if user already exists
const checkUserByEmail = email => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};

//Create new user 
const addNewUser = (email, password) => {
  const userId = generateRandomString(13);
  const newUserObj = {
    id: userId, 
    email, 
    password
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
  urlDatabase[shortURL] = longURL;
  return true;
}
//-----------------------END - FUNCTIONS------------------------//



//-------------------START - SERVER LOGIC-----------------------//

//POST /register endpoint
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.status(400).send('Please enter a valid email or password to register!');
  } else if (!checkUserByEmail(email)) {
    const userId = addNewUser(email, password);
    res.cookie("user_id", userId);
    console.log(users);
    res.redirect("/urls");
  } else {
    res.status(403).send('There is a user already registered with this email!');
  }
});

//To GET/request registration page
app.get("/register", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], currentUser: loggedInUser };
  res.render("urls_register", templateVars);
});

//Endpoint to handle POST request to logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Endpoint to handle Login page / GET request
app.get("/login", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], currentUser: loggedInUser };
  res.render("urls_login", templateVars);
});

//Endpoint to handle POST request
app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.user_id)
  res.redirect("/urls");
});

//To edit shortURL key/property
app.post("/urls/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;

  updateURL(shortURL, longURL);

  res.redirect("/urls");
});

//To delete shortURL key/property
app.post("/urls/:shortURL/delete", (req, res) => {

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(urlDatabase);
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL; //How can i save this to the database?
  //console.log(req.body, { shortURL: shortString });  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);         // Redirects to the url_show template 
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  let templateVars = { currentUser: loggedInUser };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], currentUser: loggedInUser };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  let templateVars = { urls: urlDatabase, currentUser: loggedInUser };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });

 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//----------------------END - SERVER LOGIC-------------------------//
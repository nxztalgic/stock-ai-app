
const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const ejs = require('ejs');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const userModel = require('./models/user-model');

// EJS view engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(session({
  secret: process.env.EXPRESS_SESSION_SECRET || 'sombr_xz34r',
  resave: false,
  saveUninitialized: true,
}));

//  Landing page
app.get("/", (req, res) => {
  res.render("landing");
});
//  Auth page
app.get("/authentication", (req, res) => {
  res.render("authentication");
});

// Register user
app.post("/register", async (req, res) => {
  let { email, password, username, name } = req.body;
  let user = await userModel.findOne({ email });
  if (user) return res.status(400).send(" User already registered");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        email,
        name,
        password: hash
      });
      let token = jwt.sign({ email: email, userid: user._id }, "shhhh");
      res.cookie("token", token);
      res.send("Registered");
    });
  });
});

//  Login user
app.post('/login', async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });

  if (!user) return res.status(400).send("Invalid email or password");

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email: email, userid: user._id }, "shhhh");
      res.cookie("token", token);
      res.redirect("/home");
    } else {
      res.redirect("/");
    }
  });
});

//  Home page (protected)
app.get("/home", isLoggedIn, (req, res) => {
  res.render("home");
});

// //  Prediction page
// app.get("/prediction", isLoggedIn, (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'server-ai', 'templates', 'index.html'));
// });

// //  Sentiment page
// app.get("/sentiment", isLoggedIn, (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'server-ai', 'templates', 'sentiment.html'));
// });

//  Risk page
app.get("/risk", isLoggedIn, (req, res) => {
  res.render("risk");
});

//  Future page
app.get("/future", isLoggedIn, (req, res) => {
  res.render("future");
});

//  Auth middleware
function isLoggedIn(req, res, next) {
  if (!req.cookies.token) {
    return res.redirect("/");
  }
  try {
    let data = jwt.verify(req.cookies.token, "shhhh");
    req.user = data;
    next();
  } catch (err) {
    res.clearCookie("token");
    res.redirect("/");
  }
}

// Start server
app.listen(3000, () => {
  console.log("✅ Express server running at http://localhost:3000");
});

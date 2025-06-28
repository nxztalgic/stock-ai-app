const express = require('express');
const app = express();

const path = require('path')
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const ejs = require('ejs');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const userModel = require('./models/user-model');
const { log } = require('console');

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")))
app.use(cookieParser());
app.use(session({
  secret: process.env.EXPRESS_SESSION_SECRET || 'sombr_xz34r', // Change this to a secure secret in production
  resave: false,
  saveUninitialized: true,
}));

app.get("/", (req,res)=>{
    res.render("index")
})

app.get("/authentication", (req, res)=>{
  res.render("authentication")
})

app.post("/register", async (req, res)=>{
  let {email, password, username, name} = req.body
  let user = await userModel.findOne({email})
  if(user) return res.status(500).send("User already registered") //since return so returns from outer most loop so doesnt go below

  bcrypt.genSalt(10, (err, salt)=>{
      bcrypt.hash(password, salt,async (err, hash)=>{
          let user = await userModel.create({
              username,
              email,
              name,
              password: hash
          })
          let token = jwt.sign({email: email, userid: user._id}, "shhhh")
          res.cookie("token", token);
          res.send("Registered")
      })
  })
})

app.post('/login',async (req,res)=>{
  let {email, password} = req.body
  let user = await userModel.findOne({email})

  if(!user) return res.status(500).send("Something went wrong") //since return so returns from outer most loop so doesnt go below

  bcrypt.compare(req.body.password, user.password, (err, result)=>{
      if(result) {
          let token = jwt.sign({email: email, userid: user._id}, "shhhh")
          res.cookie("token", token);
          // res.status(200).send("You can login")
          res.status(200).redirect("/home")
      } else {
          res.redirect("/")
      }
  })
})

app.get("/home", isLoggedIn, (req,res)=>{
  res.render("home");
})

app.get("/prediction", (req, res)=>{
  res.render("prediction")
})

app.get("/future", (req, res)=>{
  res.render("future")
})


app.get("/risk", (req, res)=>{
  res.render("risk")
})

app.get("/sentiment", (req, res)=>{
  res.render("sentiment")
})

function isLoggedIn(req, res, next) {
    if(req.cookies.token === "") res.redirect("/")
        else {
            let data = jwt.verify(req.cookies.token, "shhhh")
            req.user = data;
            next();
    }
}

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

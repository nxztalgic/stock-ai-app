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

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

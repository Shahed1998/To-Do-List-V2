'use strict';

// ---------------------- Declaring variables and requiring packages -------------------------------
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
let loginMsg = '';
let userName = '';
let loginMsgAttr = 'hidden';
let failureMsg = 'failureMsg';

// ------------------------------------ Mongoose --------------------------------------------------
// Schemas and models

// connecting to mongoose
mongoose.connect('mongodb://localhost/ToDoListAppDBV2', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// List Schema
const listSchema = new mongoose.Schema({
  titles: String,
  items: [String],
});

const List = mongoose.model('List', listSchema);

const list1 = new List({
  titles: 'Hello',
  items: ['a', 'b', 'c'],
});

// list1.save();

// User section for schema and model
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name field is required'],
  },
  email: {
    type: String,
    required: [true, 'Email field is required'],
    minLength: [
      5,
      'Minimum length must be equal or greater than 5 characters.',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password field is required'],
  },
  lists: [listSchema],
});

// Secret key for encrypting user's password
userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ['password'],
});

const User = mongoose.model('User', userSchema);

// ------------------------------------ Routes --------------------------------------------------

app.set('view engine', 'ejs'); // setting view engine
app.use(express.static('public')); // setting up static files
app.use(bodyParser.urlencoded({ extended: false })); // setting up body-parser

// ------------------------------------ Get --------------------------------------------------

// Home route which brings us to login page.
app.get('/', (req, res) => {
  res.render('login', {
    loginMsg: loginMsg,
    loginMsgAttr: loginMsgAttr,
    failureMsg: failureMsg,
  });
  loginMsg = '';
  loginMsgAttr = 'hidden';
  failureMsg = 'failureMsg';
});

// Insert route
app.get('/insert', (req, res) => {
  if (userName === '') {
    res.redirect('/');
  } else {
    User.findOne({ name: userName }, (err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        // console.log(foundUser.lists);
        res.render('insert', {
          userName: userName,
          listTitles: foundUser.lists,
        });
      }
    });
  }
});

// Sign up route
app.get('/signUp', (req, res) => {
  res.render('signUp', {
    loginMsg: loginMsg,
    loginMsgAttr: loginMsgAttr,
    failureMsg: failureMsg,
  });
  loginMsg = '';
  loginMsgAttr = 'hidden';
  failureMsg = 'failureMsg';
});

app.get('/lists', (req, res) => {
  res.render('lists');
});

// ------------------------------------ Post --------------------------------------------------

// Log In
app.post('/', (req, res) => {
  if (req.body.submit === 'Log In') {
    // Login verification
    User.findOne({ email: req.body.email }, (err, foundUser) => {
      if (!err) {
        if (!foundUser) {
          loginMsg = 'Failed to log in.';
          loginMsgAttr = '';
          res.redirect('/');
        } else {
          if (foundUser.password === req.body.password) {
            userName = foundUser.name;
            res.redirect('/insert');
          } else {
            loginMsg = 'Failed to log in.';
            loginMsgAttr = '';
            res.redirect('/');
          }
        }
      } else {
        console.log(err);
      }
    });
  } else {
    res.redirect('/signUp');
  }
});

// Sign Up
app.post('/signUp', (req, res) => {
  if (req.body.submit === 'Go back') {
    res.redirect('/');
  } else {
    const user = new User({
      name: req.body.Name,
      email: req.body.email,
      password: req.body.password,
    });

    user.save((err, result) => {
      if (!err) {
        loginMsg = 'Successfully registered user . Please Log In';
        loginMsgAttr = '';
        failureMsg = 'successMsg';
        res.redirect('/');
      } else {
        console.log(err);
        loginMsg = 'Failed to SignUp. All information are required';
        loginMsgAttr = '';
        res.redirect('/signUp');
      }
    });
  }
});

// Insert route
app.post('/insert', (req, res) => {
  // console.log(req.body);
  // console.log(userName);
  //---------------------------------------------------------> Need thorough checking
  //------------------------------------------------------------------> Rectify logic
  User.findOne({ name: userName }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      // console.log(foundUser.lists);
      if (!foundUser) {
        res.redirect('/insert');
      } else {
        // console.log(foundUser);
        //------------------------------------------> TBC
        // Err in code beneath , need to redirect to lists
        if (foundUser.lists.length !== 0) {
          for (let i = 0; i < foundUser.lists.length; i++) {
            console.log(foundUser.lists[i].titles);
            if (foundUser.lists[i].titles !== req.body.title) {
              console.log('List not found');
              const listObj = new List({
                titles: req.body.title,
                items: ['Hello'],
              });
              foundUser.lists.push(listObj);
              foundUser.save((err) => {
                if (err) {
                  console.log(err);
                } else {
                  // res.redirect('/lists');
                }
              });
              // res.redirect('/lists');
            } else {
              console.log('Found listTitle');
              // res.redirect('/lists');
            }
          }
        } else {
          console.log('List is empty');
          const listObj = new List({
            titles: req.body.title,
            items: ['Hello'],
          });
          foundUser.lists.push(listObj);
          foundUser.save();
          res.redirect('/lists');
        }
      }
    }
  });
  // res.redirect('/insert');
});

// listening to port
app.listen(port, (error) => {
  if (error) throw error;
  console.log(`App running at port ${port}`);
});

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
let loginMsg = '';
let userName = '';
let loginMsgAttr = 'hidden';
let failureMsg = 'failureMsg';

mongoose.connect('mongodb://localhost/ToDoListAppDBV2', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
});

const User = mongoose.model('User', userSchema);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

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

app.get('/insert', (req, res) => {
  res.render('insert', { userName: userName });
  userName = '';
});

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

app.post('/signUp', (req, res) => {
  // console.log(req.body.Name.length);
  console.log(req.body);
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

app.listen(port, (error) => {
  if (error) throw error;
  console.log(`App running at port ${port}`);
});

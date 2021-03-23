'use strict';

const express = require('express');
const bodyParser = require('body-parser');
// const { check, validationResult } = require('express-validator');
const app = express();
const port = process.env.PORT || 3000;
const user = ['Shahed', 'abcd@gmail.com', 'abc123'];
let loginMsg = '';
let loginMsgAttr = 'hidden';
let failureMsg = 'failureMsg';

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
  res.render('insert');
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
    if (req.body.email === user[1] && req.body.password === user[2]) {
      res.redirect('/insert');
    } else {
      loginMsg = 'Failed to log in.';
      loginMsgAttr = '';
      res.redirect('/');
    }
  } else {
    res.redirect('/signUp');
  }
});

app.post('/signUp', (req, res) => {
  // console.log(req.body.Name.length);

  if (req.body.submit === 'Go back') {
    res.redirect('/');
  } else {
    if (
      req.body.Name.length === 0 ||
      req.body.email.length === 0 ||
      req.body.password.length === 0
    ) {
      console.log(loginMsg);
      loginMsg = 'Failed to SignUp. All information are required';
      loginMsgAttr = '';
      res.redirect('/signUp');
    } else {
      loginMsg = 'Successfully registered user . Please Log In';
      loginMsgAttr = '';
      failureMsg = 'successMsg';
      res.redirect('/');
    }
  }
});

app.listen(port, (error) => {
  if (error) throw error;
  console.log(`App running at port ${port}`);
});

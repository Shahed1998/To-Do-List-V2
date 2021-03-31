'use strict';

// ---------------------- Declaring variables and requiring packages -------------------------------
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const password = process.env.PASSWORD;
const secret = process.env.SECRET;

//----------------------------------------------------------> Functions

const getRouteFunc = function (route, renderPage) {
  app.get(`/${route}`, (req, res) => {
    // attrSetFunc('signup');
    res.render(`${renderPage}`, {
      loginMsg: loginMsg,
      loginMsgAttr: loginMsgAttr,
      failureMsg: failureMsg,
    });
    attrResetFunc();
  });
};

const attrResetFunc = function () {
  loginMsg = '';
  loginMsgAttr = 'hidden';
  failureMsg = 'failureMsg';
};

let loginMsg = '';
let userName = '';
let loginMsgAttr = 'hidden';
let failureMsg = 'failureMsg';
let listPageLists = '';

// ------------------------------------ Mongoose --------------------------------------------------
// Schemas and models

mongoose.connect(
  `mongodb+srv://admin-Shahed:${password}@test.6q7bm.mongodb.net/ToDoListAppDBV2?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

//----------------------------------------------------------> List Schema & Model
const listSchema = new mongoose.Schema({
  titles: String,
  items: [{ item: String }],
});

const List = mongoose.model('List', listSchema);

//----------------------------------------------------------> User Schema & Model
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

//----------------------------------------------------------> Code for encrypting password
userSchema.plugin(encrypt, {
  secret: secret,
  encryptedFields: ['password'],
});

const User = mongoose.model('User', userSchema);

// ------------------------------------ Routes --------------------------------------------------

app.set('view engine', 'ejs'); // setting view engine
app.use(express.static('public')); // setting up static files
app.use(bodyParser.urlencoded({ extended: false })); // setting up body-parser

// ------------------------------------ Get ------------------------------------------------------

//----------------------------------------------------------> Sign Up

getRouteFunc('signup', 'signup');

//----------------------------------------------------------> Log In

getRouteFunc('', 'login');

//----------------------------------------------------------> Insert
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

//----------------------------------------------------------> Insert with parameter
app.get('/insert/:todoTitle', (req, res) => {
  User.findOne({ name: userName }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (!foundUser) {
        res.redirect('/');
      } else {
        foundUser.lists.forEach((list) => {
          if (list.titles === req.params.todoTitle) {
            listPageLists = list.items;
            res.render('lists', {
              title: req.params.todoTitle,
              user: userName,
              listPageLists: listPageLists,
            });
          }
        });
      }
    }
  });
});

// ------------------------------------ Post --------------------------------------------------

//----------------------------------------------------------> Log In Route
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

//----------------------------------------------------------> Sign Up Route
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

//----------------------------------------------------------> Insert Route
app.post('/insert', (req, res) => {
  if (req.body.submit === 'Logout') {
    userName = '';
    res.redirect('/');
  } else if (req.body.submit === 'Enter') {
    if (req.body.title !== '') {
      // console.log(req.body.title);
      User.findOne({ name: userName }, (err, foundUser) => {
        if (err) {
          console.log(err);
        } else {
          if (!foundUser) {
            res.redirect('/');
          } else {
            let foundUserTitles = [];

            const listObj = new List({
              titles: req.body.title,
              items: ['Hello'],
            });

            // console.log(foundUser.lists);

            foundUser.lists.forEach((list) => {
              foundUserTitles.push(list.titles);
            });
            // console.log(foundUserTitles);

            if (foundUserTitles.includes(listObj.titles)) {
              // console.log(`List found`);
              res.redirect('/insert');
            } else {
              // console.log('List not found');
              foundUser.lists.push(listObj);
              foundUser.save();
              res.redirect('/insert');
            }
          }
        }
      });
    } else {
      res.redirect('/insert');
    }
  } else {
    // console.log(req.body);
    User.updateOne(
      { name: userName },
      { $pull: { lists: { titles: req.body.submit } } },
      (err, result) => {
        // console.log(result);
      }
    );
    res.redirect('/insert');
  }
});

//----------------------------------------------------------> List's Route

app.post('/insert/:todoTitle', (req, res) => {
  console.log(req.body);

  // console.log(inputtedValue);
  if (req.body.submit === '+') {
    if (req.body.inputtedValue === '') {
      res.redirect(`/insert/${req.params.todoTitle}`);
    } else {
      User.findOne({ name: userName }, (err, foundUser) => {
        if (err) {
          console.log(err);
        } else {
          if (!foundUser) {
            userName = '';
            res.redirect('/');
          } else {
            foundUser.lists.forEach((list) => {
              if (list.titles === req.params.todoTitle) {
                // console.log(list.items);
                //   items: [{ item: 'a' }, { item: 'b' }],

                // const inputtedValue = { item: req.body.inputtedValue };
                list.items.push({ item: req.body.inputtedValue });
                foundUser.save();
                listPageLists = list.items;
                res.redirect(`/insert/${req.params.todoTitle}`);
              }
            });
          }
        }
      });
    }
  } else if (req.body.submit === 'insertPage') {
    res.redirect('/insert');
  } else {
    // --------------------------------------------------> Here the code of checkbox deletion will happen
    console.log(req.body);
    User.updateOne(
      {
        name: userName,
      },
      {
        $pull: { 'lists.$[].items': { _id: req.body.listCheckBox } },
      },

      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          console.log(results);
          res.redirect(`/insert/${req.params.todoTitle}`);
        }
      }
    );
  }
});

// listening to port
app.listen(port, (error) => {
  if (error) throw error;
  console.log(`App running at port ${port}`);
});

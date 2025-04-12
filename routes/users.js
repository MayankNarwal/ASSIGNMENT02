// routes/users.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// GET Registration page
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

// POST Registration handler
router.post('/register', async (req, res) => {
  const { username, email, password, password2 } = req.body;
  let errors = [];

  // Simple validation
  if (!username || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }
  if (errors.length) {
    return res.render('register', { errors, username, email, password, password2 });
  }
  
  // Check if user exists
  const userExists = await User.findOne({ email: email });
  if (userExists) {
    errors.push({ msg: 'Email is already registered' });
    return res.render('register', { errors, username, email, password, password2 });
  }

  // Create new user
  const newUser = new User({ username, email, password });
  // Hash password
  bcrypt.genSalt(10, (err, salt) =>
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save()
        .then(user => {
          req.flash('success_msg', 'You are now registered and can log in');
          res.redirect('/users/login');
        })
        .catch(err => console.log(err));
    })
  );
});

// GET Login page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// POST Login handler using Passport local strategy
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/playlists/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// GET GitHub authentication route
router.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

// GET GitHub callback route
router.get('/auth/github/callback', passport.authenticate('github', {
  failureRedirect: '/users/login'
}), (req, res) => {
  // Successful authentication, redirect to dashboard.
  res.redirect('/playlists/dashboard');
});

// GET Logout route
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) { return next(err); }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });
});

module.exports = router;

// config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Load User model
const User = require('../models/User');

module.exports = function(passport) {
  // Local Strategy for username and password
  passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    // Match user by email
    User.findOne({ email: email }).then(user => {
      if (!user) {
        return done(null, false, { message: 'No user found with that email' });
      }

      // Compare password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Password incorrect' });
        }
      });
    }).catch(err => console.log(err));
  }));

  // GitHub Strategy
  passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, done) {
      // Find or create a user based on GitHub profile information
      User.findOne({ githubId: profile.id }).then(user => {
        if (user) {
          return done(null, user);
        } else {
          const newUser = new User({
            githubId: profile.id,
            username: profile.username,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : 'no-email@example.com'
          });
          newUser.save().then(user => done(null, user)).catch(err => console.log(err));
        }
      });
    }
  ));

  // Serialize user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(function(id, done) {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};

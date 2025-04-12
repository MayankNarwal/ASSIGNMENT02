require('dotenv').config(); // Load environment variables from .env
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

// Handlebars setup for partials
const hbs = require('hbs'); // Include Handlebars

// Passport configuration (local and GitHub)
require('./config/passport')(passport);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const playlistsRouter = require('./routes/playlists');

const app = express();

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Register partials folder (ensure this line is included)
hbs.registerPartials(path.join(__dirname, 'views/partials')); // Register partials

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method')); // supports ?_method=PUT or DELETE in forms
app.use(express.static(path.join(__dirname, 'public')));

// Express session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash messages (for success/error messages)
app.use(flash());

// Global variables for views (flash messages and user info)
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error'); // Passport error message
  res.locals.user = req.user || null;
  next();
});

// Routes middleware
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/playlists', playlistsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error details in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

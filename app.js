var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose')

const indexRouter = require('./routes/index');
const userRouter = require('./routes/userRouter')
const doctorRouter = require('./routes/doctorRouter')
const profileRouter = require('./routes/profileRouter')

var app = express()

const { db_user, db_password } = require('./shared/credentials')
const connect = mongoose.connect(`mongodb+srv://${db_user}:${db_password}@medbuddy.sd9b2.mongodb.net/Main?retryWrites=true&w=majority`)

connect.then((db) => {
    console.log("\nDatabase connected!")
}, (err) => console.log(err))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', userRouter)
app.use('/doctors', doctorRouter)
app.use('/profile', profileRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
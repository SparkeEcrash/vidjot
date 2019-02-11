const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');

const app = express();


//Load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// Passport Config
require('./config/passport')(passport);
/*passport from require('passport') is passed to the config file.

require('./config/passport')(passport) changes to... 
module.exports = function(passport) in the config file and passport variable is passed to the config file. 

require('./config/passport')(passport) changes to module.exports which in turn causes
changes it to function(passport){}*/

// DB Config
  const db = require('./config/database');

mongoose.Promise = global.Promise;

// Connect to mongoose
mongoose.connect(db.mongoURI, {useNewUrlParser: true})
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

  // Handlebars Middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Body parser middleware
// app.use(express.urlencoded({ extended: false }))
// app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Method override middleware
app.use(methodOverride('_method'));

// Express session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}))

// Passport middleware *this must be after express session middleware is set up*
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Setting up Global variables for app.use(flash());
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  //the above line sets up an empty flash message to input message string later with req.flash('success_msg', 'msg_string') in the response section

  //{{#if success_msg}}
  // the above line in view looks up if req.flash('success_msg', 'line') was triggered to set the success_msg as true in res.locals.success_msg
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  //passport sets up a user object in request if authentication passes
  //we can set the user object as global variable in response variable for access client side
  next();
});

// Index Route
app.get('/', (req, res) => {
  const title = 'Passed from Express';
  res.render('index', {
    title: title
  });
  //the render directory is setup by app.engine() and appp.set()
  //it first renders the main.handlebars which renders the 'index.handlebars' in the {{{body}}}
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});

// Use routes
app.use('/ideas', ideas);
app.use('/users', users);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
});
const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const mongoose = require('mongoose');

const app = express();

// Connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev', {useNewUrlParser: true})
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Load Idea Model
require('./models/Idea');
const Idea = mongoose.model('ideas');


  // Handlebars Middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(express.urlencoded({ extended: false }))
app.use(express.json());

// Method override middleware
app.use(methodOverride('_method'));

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

// Idea Index Page
app.get('/ideas', (req, res) => {
  Idea.find({})
    .sort({date: 'desc'})
    .then(ideas => {
      res.render('ideas/index', {
        ideas
      });
    });
});

// Add Idea Form
app.get('/ideas/add', (req, res) => {
  res.render('ideas/add');
});

// Edit Idea Form
app.get('/ideas/edit/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    res.render('ideas/edit', {
      idea
    });
  });
});

// Process Form
app.post('/ideas', (req, res) => {
  let errors = [];
  if(!req.body.title) {
    errors.push({text: 'Please add a title'});
  }
  if(!req.body.details) {
    errors.push({text: 'Please add some details'});
  }
  if(errors.length > 0) {
    res.render('ideas/add', {
      errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details
    }
    new Idea(newUser)
      .save()
      .then(idea => {
        res.redirect('/ideas');
      })
  }
});

// Edit Form Process
app.put('/ideas/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    //new values
    idea.title = req.body.title;
    idea.details = req.body.details;
    idea.save()
      .then( idea => {
        res.redirect('/ideas');
      })
  });
});

// Delete Idea
app.delete('/ideas/:id', (req, res)=> {
  Idea.remove({_id: req.params.id})
    .then(() => {
      res.redirect('/ideas');
    });
});

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
});
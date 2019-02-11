const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {ensureAuthenticated} = require('../helpers/auth');

// Load Helper


// Load Idea Model
require('./../models/Idea');
const Idea = mongoose.model('ideas'); 

// Idea Index Page
router.get('/', ensureAuthenticated, (req, res) => {
  console.log(req.user);
  Idea.find({user: req.user.id})
    .sort({date: 'desc'})
    .then(ideas => {
      res.render('ideas/index', {
        ideas
      });
    });
});

// Add Idea Form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('ideas/add');
});

// Edit Idea Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    if(idea.user != req.user.id){
      req.flash('error_msg', 'Not Authorized');
      res.redirect('/ideas');
    } else {
      res.render('ideas/edit', {
        idea
      }
    )};
  });
});

// Process Form
router.post('/', ensureAuthenticated, (req, res) => {
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
      details: req.body.details,
      user: req.user.id
    }
    new Idea(newUser)
      .save()
      .then(idea => {
        req.flash('success_msg', 'Video idea added');
        res.redirect('/ideas');
      })
  }
});

// Edit Form Process
router.put('/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    //new values
    idea.title = req.body.title;
    idea.details = req.body.details;
    idea.save()
      .then( idea => {
        req.flash('success_msg', 'Video idea updated');
        res.redirect('/ideas');
      })
  });
});

// Delete Idea
router.delete('/:id', ensureAuthenticated, (req, res)=> {
  Idea.remove({_id: req.params.id})
    .then(() => {
      // ***res.locals.success_msg = req.flash('success_msg');***
      // the above line in app.use() set up an empty flash message in res. to receive message from req. If message is present {{success_msg}} from res.locals.success_msg turns to true
      req.flash('success_msg', 'Video idea removed');
      //adding string 'Video idea removed' to empty success flash message in order for success message to show up
      res.redirect('/ideas');
    });
});

module.exports = router;

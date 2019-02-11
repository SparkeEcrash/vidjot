const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load user model 
const User = mongoose.model('users');

//passport uses cookies with the name "connect.sid" to communicate the authentication status with the back end
//when user successfully gets authenticated user information is stored in the LocalStrategy as well as the login status
//information from the LocalStrategy whether the user is logged in or not gets communicated by the token "connect.sid" that automatically gets sent to the client from passport when passport gets set up in the back end

//passport.serializeUser is the function that takes in the information from the authenticated user object information and stores it into Local Strategy for reference
//passport.deserializeUser is the function that logs the user out



module.exports = function(passport){
  passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    // Match user
    User.findOne({
      email
    }).then(user => {
      if(!user){
        return done(null, false, {message: 'No User Found'});
        //null genereates an error variable at the errors.handlebars partial view 
        //false indicates that authentication failed
        //message object shows the string message to display as error
      } 

      //Match password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch) {
          //hello
          return done(null, user);
          //successful authentication
        } else {
          return done(null, false, {message: 'Password Incorrect'});
          //incorrect password
        }
      });
    })
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  //serializeUser from passport is being invoked and a function is being passed as the only parameter for the serializeUser function
  //how serializeUser processes the passed function is unknown but we can set up the function that gets passed

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}

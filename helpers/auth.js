module.exports = {
  ensureAuthenticated: function(req, res, next){
    if(req.isAuthenticated()){
      //method from passport that checks if user is authenticated before accessing a route
      return next();
    }
    req.flash('error_msg', 'Not Authorized');
    res.redirect('/users/login');
  }
}
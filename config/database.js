if(process.env.NODE_ENV === 'production') {
  module.exports = {mongoURI: 'mongodb://test:password123@ds331135.mlab.com:31135/vidjot-prod'}
} else {
  module.exports = {mongoURI: 'mongodb://localhost/vidjot-dev'}
}
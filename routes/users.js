var express = require('express');
var router = express.Router();


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
  
});

/* GET users listing. */
router.get('/name', function(req, res, next) {
  res.render('index', {title : 'name'})
  
});

/* GET users listing. */
router.get('/name/1', function(req, res, next) {
  res.send('you are number 1');
  
});
module.exports = router;

var express = require('express');
var router = express.Router();
var cool= require('cool-ascii-faces')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/catalog')
});


router.get('/cool',(req,res)=>{
    res.send(cool())
})
module.exports = router;

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

router.get('/times', (req,res)=>{
  res.send( showTimes())
})

showTimes=function(){
  let result='';
  const times= process.env.TIMES || 5;
  for(let i=0; i<= times;i++){
    result += i +'';

  }
return result
}
module.exports = router;

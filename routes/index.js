var express = require('express');
var router = express.Router();

var Album = require('../models/Album');
var Content = require('../models/Content');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/albums/:albumId', async function(req, res){
  const album = await Album.findOne({ albumId: req.params.albumId});
  if(!album){
    return res.render('error');
  }
  const contents = await Content.find({ albumId: req.params.albumId}).sort({ contentId: 'asc'});
  console.log(contents);
  res.render('album', { album, contents })
})

router.get('/step/:step', (req, res) => {
  res.render(`step${req.params.step}`);
})

module.exports = router;

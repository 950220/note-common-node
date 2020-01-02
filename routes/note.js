var express = require('express');
var router = express.Router();
const conn = require('../utils/dbUtils.js');
const sql = require('../dbBase/sql.js');
const multer  = require('multer');
var path = require('path');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/note-list', function(req, res, next) {
  let query = req.body
  conn.query(sql.getNoteListSql, query.openid, (error, results) => {
    if (error) {
      return res.json({
        resultCode: 5000,
        errorDescription: '获取失败'
      })
    }
    var totalPublic = 0
    var totalPrivate = 0
    if (results) {
      results.forEach(item => {
        item.type === 'private' ? totalPrivate++ : totalPublic++
      });
    }
    return res.json({
      data: {
        results: results || [],
        totalPrivate: totalPrivate,
        totalPublic: totalPublic,
        total: totalPrivate + totalPublic
      },
      resultCode: 200
    })
  })
})

router.post('/note-list-all', function(req, res, next) {
  let query = req.body
  conn.query(query.type === 'public' ? sql.getNoteListAllSql : sql.getNoteListPrivateSql, query.type === 'public' ? [query.type, query.start, query.length] : [query.type, query.openid, query.start, query.length], (error, results) => {
    if (error) {
      return res.json({
        resultCode: 5000,
        errorDescription: '获取失败'
      })
    }
    return res.json({
      data: {
        results: results || [],
        total: results.length
      },
      resultCode: 200
    })
  })
})

router.post('/addNote', function(req, res, next) {
  let query = req.body
  const { openid, content, type, username, images } = query
  conn.query(sql.addNoteSql, [openid, content, type, nickname, images], (error, reuslts) => {
    if (error) {
      return res.json({
        resultCode: 5000,
        errorDescription: '添加失败'
      })
    }
    if (results) {
      return res.json({
        resultCode: 200,
        noteId: results.insertId
      })
    } else {
      return res.json({
        resultCode: 5000,
        errorDescription: '添加失败'
      })
    }
  })
})

var upload = multer({
  dest: 'static/images'
})
router.post('/static', upload.single('Filedata'), function(req, res, next) {
  let file = req.file;
  let query = req.query
  if (!file) {
    return res.json({
      resultCode: 5000
    })
  }
  if (!query.noteId) {
    return res.json({
      resultCode: 5000
    })
  }
  var oldfliepath = path.join('./',"static/images",file.filename)
  var newfileName = file.filename + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]
  var newfilepath = path.join('./',"static/images", newfileName)
  fs.rename(oldfliepath,newfilepath,function(err){
    if (err) throw err;
    fs.stat(newfilepath, function (err, stats) {
        if (err) throw err;
      });
  });
  conn.query(sql.updateImagesSql, [newfileName, query.noteId], (err, results) => {
    if (err) {
      res.json({
        resultCode: 5000
      })
    }
    if (results) {
      return res.json({
        resultCode: 200
      })
    } else {
      return res.json({
        resultCode: 5000
      })
    }
  })
})

router.post('/delete-note', function(req, res, results) {
  
})

router.post('/collect-note', function(req, res, results) {

})

router.post('/cancel-collect-note', function(req, res, results) {

})


module.exports = router;
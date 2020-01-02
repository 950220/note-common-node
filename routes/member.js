var express = require('express');
var router = express.Router();
var request=require('request');
const conn = require('../utils/dbUtils.js');
const sql = require('../dbBase/sql.js');

/* GET users listing. */
router.post('/login', function(req, res, next) {
  let query = req.body
  let url = `https://api.weixin.qq.com/sns/jscode2session?appid=wx04dafcc81b44ddd4&secret=bb89e0c3e0efaee1a368dccacb0db77e&js_code=${query.code}&grant_type=authorization_code`
  request(
    {
      url: url,
      method:'GET',
      headers:{'Content-Type':'text/json' }
    },
    (error,response,body) => {
      if(!error && response.statusCode==200){
        let data = JSON.parse(body)
        conn.query(sql.loginSql, data.openid, (err, results) => {
          if (err) {
            return res.json({
              resultCode: 5000,
              errorDescription: '登录失败'
            })
          }
          if (results && results.length === 0) {
            console.log(data.openid)
            conn.query(sql.registerSql, data.openid, (error, results) => {
              if (error) {
                return res.json({
                  resultCode: 5000,
                  errorDescription: '登录失败'
                })
              }
              return res.json({
                resultCode: 200,
                data: body
              })
            })
          } else {
            return res.json({
              resultCode: 200,
              data: body
            })
          }
        })
      } else {
        return res.json({
          resultCode: 5000,
          errorDescription: '登录失败'
        })
      }
    });
});

module.exports = router;
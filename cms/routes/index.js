const router = require('koa-router')()
const config = require('../config.js')
const request = require('request-promise')
const fs = require('fs')//操作文件的内置模块

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

router.post('/uploadBannerImg', async (ctx, next) => {
  var files = ctx.request.files
  var file = files.file
  console.log(files)
  //上传需要获取三个数据接口
  try {
    let options = {
      uri: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + config.appid + '&secret=' + config.secret + '',
      json: true
    }
    //第一个是获取token的凭证
    let { access_token } = await request(options)
    // console.log(access_token)
    let fileName = `${Date.now()}.jpg`
    let filePath = `banner/${fileName}`
    options = {
      method: 'POST',
      uri: 'https://api.weixin.qq.com/tcb/uploadfile?access_token=' + access_token + '',
      body: {
        "env": 'freefree-wsi5b',
        "path": filePath
      },
      json: true
    }
    //用凭证拿到上传的具体信息
    
    let res = await request(options)
    let file_id = res.file_id
    //这里是对数据库表进行操作
    options = {
      method: 'POST',
      uri: 'https://api.weixin.qq.com/tcb/databaseadd?access_token=' + access_token + '',
      body: {
        "env": 'freefree-wsi5b',
        "query": "db.collection(\"banner\").add({data:{fileId:\"" + file_id + "\"}})"
      },
      json: true
    }
    await request(options)
    
    //再通过具体信息执行上传的任务
    options = {
      method: 'POST',
      uri: res.url,
      formData: {
        "Signature": res.authorization,
        "key": filePath,
        "x-cos-security-token": res.token,
        "x-cos-meta-fileid": res.cos_file_id,
        "file": {
          value: fs.createReadStream(file.path),
          options: {
            fileName: fileName,
            contentTyoe: file.type
          }
        }
      }
    }
    await request(options)
    ctx.body = res
  } catch (err) {
    console.log(err.stack)
  }
})

module.exports = router

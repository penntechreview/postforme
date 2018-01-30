const router = require('express').Router()
const path = require('path')
const schedule = require('node-schedule')
const request = require('request-promise');

module.exports = function (DB) {
  router.get('/', (req,res) => {
    DB.getAllPosts()
    .then(posts => {
      res.render('allposts', {
        posts
      })
    })
  })

  router.get('/fbpost', (req,res) => {
    const postTextOptions = {  
      method: 'POST',
      uri: `https://graph.facebook.com/v2.11/me/feed`,
      qs: {
        access_token: req.user.accessToken,
        message: 'Look at this awesome article',
        link: 'https://penntechreview.com/read/paladindrone'
      }
    };
    request(postTextOptions)
    .then(fbRes => {
      console.log(fbRes)
    })
    .catch(error => {
      console.log(error)
    })
  })

  router.get('/schedulepost', (req,res) => {
    res.render('scheduler')
  })

  router.post('/schedulepost', (req,res) => {
    const {articlelink, posttime, postcontent} = req.body
    const postdate = new Date(posttime)
    DB.createPost(articlelink, posttime, postcontent, req.user.id)
    .then(created => {
      //jobs will continue to fire as long as 
      const job = schedule.scheduleJob(postdate, function(){
        //Post the content to facebook, then change the status of whether content has successfully posted
        const postTextOptions = {  
          method: 'POST',
          uri: `https://graph.facebook.com/v2.11/me/feed`,
          qs: {
            access_token: req.user.accessToken,
            message: postcontent,
            link: articlelink
          }
        };
        request(postTextOptions)
        .then(fbRes => {
          const {postid} = JSON.parse(fbRes)
          DB.postedPost(fbpostid, created.id)
          .then(post => {
            console.log(post)
          })
        })
        .then()
        console.log('just fired' + postcontent)
      })
      res.send('Success!')
    })
    .catch(error => {
      res.status(500).send(error)
    })
  })

  return router
}
const router = require('express').Router()
const path = require('path')
const schedule = require('node-schedule')
const request = require('request-promise');

module.exports = function (DB) {
  router.get('/', (req,res) => {
    DB.getAllPosts()
    .then(posts => {
      posts.sort((post1,post2) => {
        return post1.posttime < post2.posttime;
      })
      res.render('allposts', {
        posts
      })
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
      var dt = new Date(posttime)
      if(process.env.PRODUCTION) {
        dt.setTime(dt.getTime() + (5*60*60*1000))
      }
      console.log(dt)
      //jobs will continue to fire as long as
      const job = schedule.scheduleJob(dt, function(){
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
          const fbpostid = JSON.parse(fbRes).id
          DB.postedPost(fbpostid, created.id)
          .then(post => {
            console.log(post)
          })
        })
        .then()
        console.log('just fired: ' + created.id)
      })
      res.redirect('/')
    })
    .catch(error => {
      res.status(500).send(error)
    })
  })

  return router
}
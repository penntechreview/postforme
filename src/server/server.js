const express = require('express')
const app = express()
const path = require('path')
const schedulerouter = require('./schedulerouter')
const authrouter = require('./authrouter')
const DB = require('./database/db')

global.public_dir = path.join(__dirname,'..','..','public')

app.set('view engine', 'ejs');
app.use(express.static(global.public_dir))

app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));


app.use('/auth', authrouter(DB, app))

app.use((req,res,next) => {
  if (!req.user) {
    res.redirect('/auth/facebook')
  } else {
    next()
  }
})

app.use('/', schedulerouter(DB))

const schedule = require('node-schedule')
const request = require('request-promise');

DB.getAllPosts()
.then(posts => {
  posts.forEach(post => {
    var dt = new Date(post.posttime)
    console.log(post.postcontent.substring(0,10)," ", dt)
    const job = schedule.scheduleJob(dt, function(){
      //Post the content to facebook, then change the status of whether content has successfully posted
      const postTextOptions = {
        method: 'POST',
        uri: `https://graph.facebook.com/v2.11/me/feed`,
        qs: {
          access_token: post.poster.accessToken,
          message: post.postcontent,
          link: post.articlelink
        }
      };
      request(postTextOptions)
      .then(fbRes => {
        const fbpostid = JSON.parse(fbRes).id
        DB.postedPost(fbpostid, post.id)
        .then(post => {
          console.log(post)
        })
      })
      .then()
      .catch(error => {

      })
      console.log('just fired: ' + post.id)
    })
  })
})





const PORT = process.env.PRODUCTION ? 8080 : 3000

app.listen(PORT, () => {
  console.log('listening on port' + PORT)
})
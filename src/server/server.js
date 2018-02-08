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


// FOR TESTING PURPOSES

const postTextOptions = {
  method: 'POST',
  uri: `https://graph.facebook.com/v2.11/me/feed`,
  qs: {
    access_token: "EAADB7HZCrmRkBANKrkl4VKCW2OKb1NR66OKGO8kZB5aM4DIuZAOiX9PA67VS7Kl6dY82fgGESkSC0ZAZA9Hzf82ejVzH989Xfmvx3Pc3VA4g7RcXjwjuO85rnIG5ZAdQpYUyXRLTTtHJxdZClkFAXr65zWrLH3zadOIFj52Up0qZCQZDZD",
    message: 'Hello world'
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
.catch(error => {

})

// END TESTS



DB.getAllPosts()
.then(posts => {
  posts.forEach(post => {
    var dt = new Date(post.posttime)
    if (process.env.PRODUCTION) {
      dt.setTime(dt.getTime() + (5*60*60*1000))
    }
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
        DB.postedPost(fbpostid, created.id)
        .then(post => {
          console.log(post)
        })
      })
      .then()
      .catch(error => {

      })
      console.log('just fired: ' + created.id)
    })
  })
})





const PORT = process.env.PRODUCTION ? 8080 : 3000

app.listen(PORT, () => {
  console.log('listening on port' + PORT)
})
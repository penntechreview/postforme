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




const PORT = process.env.PRODUCTION ? 8080 : 3000

app.listen(PORT, () => {
  console.log('listening on port' + PORT)
})
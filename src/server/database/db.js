const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/postforme', function(){
  console.log('successfully connected to database')
})

const User = require('./models/User')
const Post = require('./models/Post')

//USER FUNCTIONS
function findUserById(id){
  return User.findById(id)
}

function findOrCreateUser(profile, accessToken, refreshToken){
  return User.findOne({ facebookId: profile.id })
  .then(user => {

    if (user == null) {
      return new User({
        facebookId: profile.id,
        firstname: profile.displayName.split(' ')[0],
        lastname: profile.displayName.split(' ')[1],
        accessToken,
        refreshToken
      }).save()
    } else {
      return user
    }
  })
}


//POST FUNCTIONS
function createPost(articlelink, posttime, postcontent, userid){
  return new Post({
    articlelink,
    posttime,
    postcontent,
    poster: userid
  }).save()
}

function getAllPosts() {
  return Post.find().populate('poster')
}

module.exports = {
  findOrCreateUser,
  findUserById,
  createPost,
  getAllPosts
}
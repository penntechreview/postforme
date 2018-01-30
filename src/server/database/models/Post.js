const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema = new Schema({
  postcontent: {
    type: String,
    required: true
  },
  articlelink: {
    type: String,
    required: true
  },
  posttime: {
    type: Date,
    required: true
  },
  poster: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  posted: {
    type: Boolean,
    required: true,
    default: false
  },
  fbpostid: String
})

module.exports = mongoose.model('Post', postSchema)
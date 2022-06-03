const mongoose = require("mongoose")

const schema = mongoose.Schema({
  albumId : String,
  respondent : String,
  contentId : Number, 
  question : String, 
  lastUpdated : Number, 
  answers : [ String ] 
});

module.exports = mongoose.model("Content", schema)


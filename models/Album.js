const mongoose = require("mongoose")

const schema = mongoose.Schema({
  albumId : String,
  contentGroups: [ String ],
  title: String, 
})

module.exports = mongoose.model("Album", schema)


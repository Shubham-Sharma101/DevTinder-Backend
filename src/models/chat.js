const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
      message :{
        type: String,
      },
      fromUserId :{
        
      }
})
const Chat = mongoose.model("chat", chatSchema);

module.exports = Chat;
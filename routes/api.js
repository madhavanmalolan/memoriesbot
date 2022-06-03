var express = require('express');
var router = express.Router();
var axios = require("axios");
var Album = require("../models/Album");
var Content = require("../models/Content");
var https = require("https");
var fs = require("fs");
var questions = require('./questions.json')

async function getRandomQuestion(){
    return questions[Math.floor(Math.random()*questions.length)];
}

async function sendMessage(chatId, text){
 await  axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_KEY}/sendMessage`, {chat_id: chatId, text });
}

async function downloadFile(url, path){
  console.log(url);
  const file = fs.createWriteStream(path);
  const request = https.get(url, function(response) {
     response.pipe(file);

     // after download completed close filestream
     file.on("finish", () => {
	 file.close();
	 console.log("Download Completed");
     });
  });

}


async function processCommand(command, message){
  if(command == "/album"){
    const albumId = message.chat.id.toString();
    const prev = await Album.find({ albumId })
    console.log(prev);
    if(prev.length == 0){
      const album = new Album({ albumId, title: message.chat.title, contentGroups: [] });
      await album.save();
      await sendMessage(albumId, "Created new album : "+albumId+"\n\nFor next steps visit : https://memoriesbot.com/step/2")
    }
    else {
      await sendMessage(albumId, "Album for this group is already created : "+albumId+"\n\nFor next steps visit : https://memoriesbot.com/step/2")
    }
    await sendMessage(albumId, "Once you have followed the steps on https://memoriesbot.com/step/2 , forward the following message to the group you just created")
    await sendMessage(albumId, "@memoriesbotdotcom_bot /join "+albumId)
  }
  if(command == "/view"){
    const albumId = message.chat.id.toString();
    await sendMessage(albumId, "You can view your album at : \n\nhttps://memoriesbot.com/albums/"+albumId);
  }
  if(command == "/join"){
    const groupId = message.from.username+"/"+message.chat.id.toString();
    const chatId = message.chat.id.toString();
    const parts = message.text.split(" ");
    if(parts.length != 3){
      await sendMessage(chatId, "To join the album, forward the message that looks like this : `@memoriesbotdotcom_bot /join -123123`")
    }
    else {
      const albumId = parts[2];
      const albums = await Album.find({ albumId });
      if(albums.length == 0){
        await sendMessage(chatId, "This album doesn't exist. Are you sure you forwarded the right message?\n\nTo be doubly sure, go to the main group and type `@memoriesbotdotcom_bot /album`");
      }
      else {
        const album = albums[0];
        const joinedAlbums = await Album.find({ contentGroups: groupId });
        if( joinedAlbums.length > 1){
          await sendMessage(chatId, "Something wrong with this group. Create a new group https://memoriesbot.com/step/2")
        }
        else if(joinedAlbums.length == 1 && joinedAlbums[0].albumId != albumId){
          await sendMessage(chatId, "This group is already being used for another album "+joinedAlbums[0].title+". One group can be used for only one album. \n\nVisit: https://memoriesbot.com/step/2 for troubleshooting");
        }
        else if(album.contentGroups.includes(groupId)){
          await sendMessage(chatId, "Already subscribed to the album "+album.title);
        }
        else {
          album.contentGroups.push(groupId)
          await album.save();
          await sendMessage(chatId, "Added you to the album "+album.title+". You will start receiving the next question onwards. For more information, visit https://memoriesbot.com/step/3");
        }
      }
    }
  }
  if(command == "/ping"){
    const albumId = message.chat.id.toString();
    const albums = await Album.find({ albumId });
    if(albums.length == 0){
      await sendMessage(groupId, "Album doesn't exist. Create new album using: `@memoriesbotdotcom_bot /album`")
    }
    else {
      const album = albums[0];
      let success = 0;
      for(i in album.contentGroups){
        const [ username, chatId ] = album.contentGroups[i].split("/");
        try{
          await sendMessage(chatId, "Pong");
          await sendMessage(albumId, "Pong Success : "+username)
        }
        catch(e){
          await sendMessage(albumId, "!!Pong Failed : "+username);
        }
      }
    }
  }
  if(command == "/nextquestion"){
    const albumId = message.chat.id.toString();
    const albums = await Album.find({ albumId });
    if(albums.length == 0){
      await sendMessage(groupId, "Album doesn't exist. Create new album using: `@memoriesbotdotcom_bot /album`")
    }
    else {
      const album = albums[0];
      let success = 0;
      for(i in album.contentGroups){
        const [ username, chatId ] = album.contentGroups[i].split("/");
        const question = await getRandomQuestion();
        const content = new Content({ albumId, respondent:album.contentGroups[i], question, answers: [], contentId: Date.now()})
        await content.save();
        await sendMessage(chatId, "NEW QUESTION!!!\n\n\n"+question);
      }
    }
  }
  if(command == "/help"){
    await sendMessage("Available commands: \n\n");
  }

}

async function processPhoto(message, fileId){
  const file = await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_KEY}/getFile`, { file_id: fileId});
  const ext = file.data.result.file_path.split(".")[1];
  await downloadFile(`https://api.telegram.org/file/bot${process.env.TELEGRAM_KEY}/${file.data.result.file_path}`, "public/data/images/"+fileId+"."+ext);
  const url = "https://memoriesbot.com/data/images/"+fileId+"."+ext;
 
  const groupId = message.from.username+"/"+message.chat.id.toString();
  const joinedAlbums = await Album.find({ contentGroups: groupId });
  if(joinedAlbums.length == 0){
    return;
  }
  const album = joinedAlbums[0];
  const contents = await Content.find({ albumId: album.albumId, respondent:groupId}).sort({ contentId: 'desc'});
  if(contents.length == 0){
    return await sendMessage(message.chat.id.toString(), "Please wait for the /next-question https://memoriesbot.com/step/3");
  }
  const content = contents[0];
  content.answers.push("IMAGE::CONTENT-START::"+url);
  await content.save();
  await sendMessage(message.chat.id, "OK");
  return url;
 
}

async function processMessage(message){
  const groupId = message.from.username+"/"+message.chat.id.toString();
  const joinedAlbums = await Album.find({ contentGroups: groupId });
  if(joinedAlbums.length == 0){
    return;
  }
  const album = joinedAlbums[0];
  const contents = await Content.find({ albumId: album.albumId, respondent:groupId}).sort({contentId: 'desc'});
  if(contents.length == 0){
    return await sendMessage(message.chat.id.toString(), "Please wait for the /next-question https://memoriesbot.com/steps/4");
  }
  const content = contents[0];
  if("text" in message){
    content.answers.push("TEXT::CONTENT-START::"+message.text);
    await content.save();
    await sendMessage(message.chat.id, "OK");
  }
}

/* GET home page. */
router.post('/:key/updates', async function(req, res, next) {
  if(req.params.key != process.env.TELEGRAM_KEY) return;
  console.log(req.body);
  res.send("ok")

  if( "message" in req.body) {
    let isCommand = false;
    const {message} = req.body;
    if("entities" in message) {
      for(i in message["entities"]){
        console.log(message["entities"][i]);
        if(message.entities[i].type == "bot_command"){
          processCommand(message.text.substr(message.entities[i].offset, message.entities[i].length), message);
          isCommand = true;
        }
      }
    }
    if(!isCommand){
      if("photo" in message){
        const url = await processPhoto(message, message.photo[message.photo.length -1 ].file_id);
      }
      else{
        processMessage(message);
      }
    }
  }
});

module.exports = router;

# Memories Bot for Telegram
deployed at https://memoriesbot.com

# What is Memories Bot
Create an album of memories. 
People in a group can come together to create an album. Works best with retired parents. 
The bot sends a question to people who're collaborating on the album. Over the next two weeks, members can send messages and photos on telegram just like chatting - and at the end it, a magazine is created. 

# How to set up : 
## Step 1 : Add Bot
- Add `@memoriesbotdotcom_bot` to your family group
- Make the bot an admin in the group (note: only the owner of the group can do this)
- `@memoriesbotdotcom_bot /album` to create an album. One album per family group only.

## Step 2 : Create personal answer groups
- Each member (say parent) should create a group with only 2 participants - themselves and `memoriesbotdotcom_bot`
- Then make the bot the admin of this group 
- Forward the message from step 1 to this group. This message looks like `@memoriesbotdotcom_bot /join 123123`

# Step 3 : Send Questions
- Anyone can send new questions to all members by `@memoriesbotdotcom_bot /nextquestion` on the family group
- A new question will show up on all the _personal answer groups_
- Members (parents) can answer the questions in as much detail as they want. They can send multiple images and text messages.

# Step 4 : View Album
- Anyone can compile all the answers into an Album by typing `@memoriesbotdotcom_bot /view` on the family group

Deployed at : https://memoriesbot.com

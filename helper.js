import 'dotenv/config';

// Testing
const guildId = "1251397113938706443";

// Averysync
// const guildId = "1036670017720291400";


const url = `${process.env.BASE_URL}/guilds/${guildId}/channels`;

const requestOptions = {
    method: 'GET',
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

const response = await fetch(url, requestOptions)
.then(response => response.json());
// console.log(response);

const channelIds = response
.filter(item => item.type === 0)
.map(item => item.id);

// console.log(channelIds);

let findWord = 'pikachu';
let wordLength = 15;
let channelIdsLength = channelIds.length;


console.log("Message ids: \n");

for (let index = 0; index < channelIdsLength; index++) {
    const element = channelIds[index];

    const listMessageRequestUrl = `${process.env.BASE_URL}/channels/${element}/messages`;

    const listMessageRequestResponse = await fetch(listMessageRequestUrl, requestOptions)
    .then(response => response.json());

    /*

    let eachChannelMessages = listMessageRequestResponse.map(item => item.content);
    // console.log(eachChannelMessages);

    for (let messageIndex = 0; messageIndex < eachChannelMessages.length; messageIndex++) {
        const message = eachChannelMessages[messageIndex];

        if(message.toLowerCase().includes(findWord)) {
            console.log(message);
        }
        // console.log(message);
    }
    */

    let eachChannelMessagesIds = listMessageRequestResponse;

    for (let msgIdIdx = 0; msgIdIdx < eachChannelMessagesIds.length; msgIdIdx++) {
      const element = eachChannelMessagesIds[msgIdIdx];
      // console.log(element.content);

      if (element.content.length >= wordLength && element.content.toLowerCase().includes(findWord)) {
        // console.log(`Message: ${element.content} | Id: ` + element.id);
        console.log(`https://discord.com/channels/${guildId}/${element.channel_id}/${element.id}`)
      }
    }
}

import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { Client, GatewayIntentBits } from 'discord.js';
import keep_alive from './keep_alive.js';

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: 'test',
    description: 'Replies with Hi!',
  },
  {
    name: 'search',
    description: 'Search a word and find messages with following conditions',
    options: [
      {
        type: 3,
        name: 'keyword',
        description: 'Enter keyword to search',
        required: true,
      },
      {
        type: 3,
        name: 'number',
        description: 'More than no of characters?',
        required: true,
      },
    ],
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(process.env.APP_ID), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }

  if (interaction.commandName === 'test') {
    await interaction.reply('Hi User!');
  }

  if (interaction.commandName === 'search') {

    const keywordInput = interaction.options.getString("keyword");
    const numberInput = interaction.options.getString("number");

    if (isNaN(numberInput)) {
      await interaction.reply(`You entered ` + "**" + numberInput + "**" + ` that is not a **number**.\nEnter **valid** number.`);
      return;
    }
    else if (Number(numberInput) < 1) {
      await interaction.reply(`You entered ` + "**" + numberInput + "**" + ` that is **LESS THAN ONE**.\nEnter **valid** number.`);
    }
    else {
      await interaction.reply(`Searching messages that contain **${keywordInput}** keyword and more than **${numberInput}** characters.`);
    }
    const guildId = interaction.guild.id;
    let links = new Array();
    let channelIdToSendMessage = interaction.channelId;

    try {
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
        .filter(item => item.type === 0 || item.type === 2)
        .map(item => item.id);

      // console.log(channelIds);

      let channelIdsLength = channelIds.length;
      let charactersLength = Number(numberInput);
      let findWord = keywordInput;

      for (let index = 0; index < channelIdsLength; index++) {
        const element = channelIds[index];

        const listMessageRequestUrl = `${process.env.BASE_URL}/channels/${element}/messages`;

        const listMessageRequestResponse = await fetch(listMessageRequestUrl, requestOptions)
          .then(response => response.json());



        // let eachChannelMessages = listMessageRequestResponse.map(item => item.content);
        // // console.log(eachChannelMessages);

        // for (let messageIndex = 0; messageIndex < eachChannelMessages.length; messageIndex++) {
        //     const message = eachChannelMessages[messageIndex];

        //     if(message.toLowerCase().includes(findWord)) {
        //         console.log(message);
        //     }
        //     // console.log(message);
        // }

        let eachChannelMessagesIds = listMessageRequestResponse;

        for (let msgIdIdx = 0; msgIdIdx < eachChannelMessagesIds.length; msgIdIdx++) {
          const element = eachChannelMessagesIds[msgIdIdx];

          if (element.content.length > charactersLength && element.content.toLowerCase().includes(findWord)) {
            // console.log(`Message: ${element.content} | Id: ` + element.id);
            const generatedLinks = `https://discord.com/channels/${guildId}/${element.channel_id}/${element.id}`;
            // console.log(generatedLinks);
            links.push(generatedLinks);
          }
        }

      }

      const channel = client.channels.cache.find(channel => channel.id === channelIdToSendMessage);
      if (links.length > 0) {
        channel.send(`\`\`\`Searched messages using ${findWord} keyword with more than ${charactersLength} characters.\nTotal ${links.length} messages found.\n\`\`\`` + `\n**Message Links:**\n\n` + links.join("\n\n"));
      }
      else {
        channel.send(`**NO MESSAGE FOUND THAT CONTAIN ${keywordInput} KEYWORD WITH MORE THAN ${charactersLength} CHARACTERS**`);
      }


    } catch (error) {
      console.log(error);
    }
  }
});

client.login(`${process.env.DISCORD_TOKEN}`);

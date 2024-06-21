import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { Client, GatewayIntentBits } from 'discord.js';


function getQuote() {
  return fetch("https://zenquotes.io/api/random")
    .then(res => {
      return res.json()
      })
    .then(data => {
      return data[0]["q"] + " -" + data[0]["a"]
    })
};


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
  },
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

    const guildId = client.guilds;
    console.log("guild id: " + guildId);
    const channel = client.channels.cache.get("<ENTER-CHANNEL-ID>");

    channel.messages.fetch({ limit: 100 }).then(messages => {
      console.log(`Received ${messages.size} messages`);

      //Iterate through the messages here with the variable "messages".
      messages.forEach(message => {
         console.log(message.content);
      });

    });
    let msg = '';
    
    await interaction.reply(`search: ${msg}`);

  }
});


client.on("message", msg => {
  if (msg.author.bot) return;
  if (msg.content === "") {
    getQuote().then(quote => msg.channel.send(quote))
  }
});

client.login(`${process.env.DISCORD_TOKEN}`);

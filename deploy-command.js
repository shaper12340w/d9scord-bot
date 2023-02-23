const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const fs = require('fs');
require('dotenv').config();

async function setSlashCommands(id) {
    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.CLIENT_ID;
    const guildId = id

    const rest = new REST({ version: '10' }).setToken(token);

    const commands = [];
    const commandsPath = "./slash"
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = commandsPath + "/" + file
        const command = require(filePath);
        commands.push(command.data.toJSON());
    }

    rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
        .then(() => console.log('Command Set :'+id))
        .catch(console.error);

}
module.exports = { setSlashCommands }

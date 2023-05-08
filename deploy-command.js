const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const fs = require('fs');
require('dotenv').config();


//서버마다 각각 다르게 실행하도록 변경하기!
async function setSlashCommands(id) {
    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.CLIENT_ID;
    const guildId = id

    const rest = new REST({ version: '10' }).setToken(token);

    const commands = [];
    const commandsPath = "./commands";

    function fileRead() {
        return new Promise((resolve, reject) => {
            const readdirp = require("readdirp");
            const fileList = [];

            readdirp(commandsPath, { fileFilter: "*.js" })
                .on("data", (entry) => {
                    fileList.push(entry.fullPath);
                })
                .on("error", (err) => {
                    reject(err);
                })
                .on("end", () => {
                    if (fileList.length === 0) {
                        reject(new Error("No files found"));
                    } else {
                        resolve(fileList);
                    }
                });
        });
    }

    const commandFiles = await fileRead();
    for (const file of commandFiles) {
        const command = require(file);
        commands.push(command.data.toJSON());
    }
    if(id){
        rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
        .then(() => console.log('Command Set :'+id))
        .catch(console.error);
    } else {
        rest.put(Routes.applicationCommands(clientId), { body: commands })
        .then(() => console.log('Command Set : ALL'))
        .catch(console.error);
    }
    

}
module.exports = { setSlashCommands }

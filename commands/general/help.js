const { SlashCommandBuilder,AttachmentBuilder } = require('discord.js');
const { client,serverProperty } = require('../../main');
const { createSelectMenu } = require('../../manageFunction');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('도움말'),
    async execute(interaction) { 
        const commandList = require("../../modules/commandList.json");
        const canCommandList = commandList.filter(e=>e.commands.length > 0);
        const embed = {
            color: 0x426cf5,
            title: '샾봇 도움말',
            descritpion:"",
            footer:{
                text: 'Made by SHAPER (tag:rplaz#6399)',
                icon_url: 'https://cdn.discordapp.com/avatars/457797236458258433/8721e17c0f6fc3e6879db74afcf20be3.webp'
            }
        }
        const prefix = serverProperty[interaction.guild.id].prefix;
        const row = createSelectMenu(interaction.id,{
            name:"자세한 설명",
            maxSelect: 1,
            async execute({ interaction }){
                const index = Number(interaction.values[0]);
                const list = canCommandList[index];
                const imgName = fs.readdirSync("./src/img").filter((item) => item.includes(list.name));
                const getImage = imgName.length === 1 ? fs.readFileSync(`./src/img/${imgName.join('')}`) : false;
                embed.description = `${prefix}${list.commands.join(' / ')}\n\n${list.details.replace(/\[prefix\]/g,`${prefix}`).replace(/\[commands\]/g,`${list.commands.join(" / ")}`)}`
                if(getImage){
                    const file = new AttachmentBuilder(getImage, { name : imgName.join('')});
                    embed.image = { url:`attachment://${imgName.join('')}`}
                    interaction.reply({ephemeral:true, embeds:[embed],files:[file] })
                } else {
                    interaction.reply({ephemeral:true, embeds:[embed] })
                }
                
                
            }
        },new Array(canCommandList.length).fill(0).map((_,i)=>{
            return { label : canCommandList[i].name, value: String(i) }
        }))
        embed.title = '샾봇 도움말';
        embed.description = canCommandList.map(e=>{ return `${prefix}${e.commands.join(' / ')} : ${e.description}`}).join('\n'+"⎯".repeat(30)+'\n');
        interaction.reply({embeds:[embed],components:[row]})
    }
}
const fs = require('fs');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('report')
		.setDescription('제작자에게 문의사항을 전송합니다')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('전할 내용')),
    async execute(interaction) {
        const { createModal,getToday } = require('../../manageFunction');
        const { client } = require("../../main");
        const path = require("path");
        if(interaction.options){
            vol = interaction.options.getString('message') ?? true;
            if(vol === true){
                
                createModal(interaction, {
                    title: "신고 / 문의 하기",
                    inputs: [{
                        label: '신고할 내용',
                        length: [0, 1000],
                        placeholder: '신고할 내용을 입력해 주세요.',
                        required: true,
                        style: 2,
                        value: ""
                    }]
                }).then(async ({ interaction, inputs }) => {
                    const [title] = inputs;
                    client.channels.cache.get('1091721578158501929').send(`${interaction.user.tag}님의 문의내용\n\n${String(title)}`);
                    
                    fs.writeFileSync(path.join(__dirname,"..","..","report",`${interaction.member.id}-${getToday()}.txt`),String(title));
                    interaction.reply({ content: '내용이 전송되었습니다!', ephemeral: true })
                })
                return;
            }
        } 
        const title = vol;
        client.guilds.cache.get("907888666603556935").channels.cache.get('1091721578158501929').send(`${interaction.user.tag}님의 문의내용\n\n${String(title)}`);
        fs.writeFileSync(path.join(__dirname,"..","..","report",`${interaction.member.id}-${getToday()}.txt`),String(title))
        interaction.reply({ content: '내용이 전송되었습니다!', ephemeral: true })
        
        
    }
}
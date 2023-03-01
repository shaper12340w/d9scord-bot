const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eval')
		.setDescription('eval message!')
        .addStringOption(option =>
            option.setName('execute')
                .setDescription('eval message')
                .setRequired(true)),
	async execute(interaction) {
        const { serverProperty } = require('../index')
        if (interaction.user.id !== "457797236458258433"||((interaction.guild.id === "1047500814584926209")&&(serverProperty[interaction.guild.id].administrator.includes(interaction.user.id)))) return;
        const msg = interaction.options._hoistedOptions[0].value;
        try{
            const result = eval(msg);
            await interaction.deferReply();
            interaction.editReply("```js\n명령어:\n"+msg+"\n\n실행 결과:\n"+String(result)+"```").catch((error)=>{
                console.error(error)
            });
        } catch(e) {
            await interaction.deferReply();
            interaction.editReply("```js\n명령어:\n"+msg+"\n\n에러:\n"+String(e)+"```").catch((error)=>{
                console.error(error)    
            });
        }
	},
};
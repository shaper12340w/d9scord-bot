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
        const msg = interaction.options._hoistedOptions[0].value;
        try{
            const result = eval(msg);
            await interaction.deferReply();
            interaction.editReply("```js\n명령어:\n"+msg+"\n\n실행 결과:\n"+String(result)+"```").catch((error)=>{
                console.error(error)
            });
        } catch(e) {
            await interaction.deferReply();
            interaction.editReply(String(e)).catch((error)=>{
                console.error(error)    
            });
        }
	},
};
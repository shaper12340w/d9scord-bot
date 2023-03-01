const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('현재 재생 중인 곡을 멈춥니다'),
    async execute(msgData) {
        const { queue } = require('../index');

        if (!queue[msgData.guild.id]) {
            msgData.reply({embeds:[{
                color:0xe01032,
                title:":exclamation: | 재생중인 곡이 없습니다"
            }]})
            return false;
        }
        msgData.reply({embeds:[{
            color:0x1c7fe8,
            title:":stop_button: | 노래를 멈춥니다"
        }]})
        queue[msgData.guild.id].player.stop();
        queue[msgData.guild.id].connection.destroy();
        delete queue[msgData.guild.id];
    }
}
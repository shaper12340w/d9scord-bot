const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('nowplaying')
		.setDescription('현재 재생중인 곡'),
    async execute(msgData) {
        const { queue } = require('../../main');
        const { getPlayData } = require('../../manageQueue');

        if (!queue[msgData.guild.id]) {
            msgData.reply({
                embeds: [{
                    color: 0xe01032,
                    title: ":exclamation: | 재생중인 곡이 없습니다"
                }]
            })
            return false;
        }
        msgData.reply({ embeds: [getPlayData("playing",msgData.guild.id).embed] });
    },
}
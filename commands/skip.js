const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('다음 곡을 재생합니다'),
    async execute(msgData) {
        const { getNextResource } = require('../manageQueue');
        const { queue } = require('../index');
        const guildId = msgData.guild.id;

        if (!queue[msgData.guild.id]) {
            msgData.reply({embeds:[{
                color:0xe01032,
                title:":exclamation: | 재생중인 곡이 없습니다"
            }]})
            return false;
        }
        msgData.reply({embeds:[{
            color:0x1c7fe8,
            title:"⏭️ | 노래를 스킵합니다."
        }]})
        if (queue[guildId].playlist.length == 1) {
            queue[guildId].player.stop();
            delete queue[guildId];
        } else {
            msgData.channel.send({ embeds: [queue[msgData.guild.id].playlist[1]] });
            getNextResource(msgData.guild.id);
        }
    }
}
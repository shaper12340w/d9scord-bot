const { getNextResource } = require('../manageQueue');

module.exports = {
    async execute(msgData) {
        const { queue } = require('../index');
        const guildId = msgData.guild.id;

        if (!queue[msgData.guild.id]) {
            msgData.reply('Queue가 없습니다.');
            return false;
        }
        msgData.reply('노래를 스킵합니다.');
        msgData.react('⏭️');
        if (queue[guildId].playlist.length == 1) {
            queue[guildId].player.stop();
            delete queue[guildId];
        } else {
            getNextResource(msgData.guild.id);
        }
    }
}
module.exports = {
    async execute(msgData) {
        const { queue } = require('../index');

        if (!queue[msgData.guild.id]) {
            msgData.reply('Queue가 없습니다.');
            return false;
        }
        msgData.react('🛑');
        queue[msgData.guild.id].player.stop();
        delete queue[msgData.guild.id];
    }
}
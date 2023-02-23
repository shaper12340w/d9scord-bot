module.exports = {
    async execute(msgData) {
        const { queue } = require('../index');

        if (!queue[msgData.guild.id]) {
            msgData.reply('Queue가 없습니다.');
            return false;
        }
        queue[msgData.guild.id].player.stop();
        queue[msgData.guild.id].connection.destroy();
        delete queue[msgData.guild.id];
    }
}
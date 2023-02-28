    module.exports = {
    async execute(msgData) {
        const { queue } = require('../index');

        if (!queue[msgData.guild.id]) {
            msgData.reply('Queue가 없습니다. 노래를 먼저 재생해주세요!');
            return false;
        }
        msgData.reply('지금 재생중인 음악입니다.');
        msgData.channel.send({ embeds: [queue[msgData.guild.id].nowPlaying.embed] });
    },
}
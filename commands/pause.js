module.exports = {
    async execute(msgData){
        const { queue } = require('../index');

        if (!queue[msgData.guild.id]) {
            msgData.reply('음악 재생중이 아닙니다.');
            return false;
        } else {
            switch(queue[msgData.guild.id].player._state.status){
                case "idle":
                  msgData.reply("you need to !play first!");
                  break;
                case "buffering":
                  msgData.reply("it is buffering!");
                  break;
                case "playing":
                  queue[msgData.guild.id].player.pause();
                  msgData.react('⏸️');
                  break;
                case "autopaused":
                  msgData.reply("I can't do this work because bot left the voice room or the song have ended!");
                  break;
                case "paused":
                  queue[msgData.guild.id].player.unpause();
                  msgData.react('▶️');
                  break;
                default:
                  msgData.reply("you need to !play first!");
                  break;
              }
        }
        
    }
}

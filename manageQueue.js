const playdl = require('play-dl');
const { createAudioResource } = require('@discordjs/voice');
const { queue } = require('./index');


const play = async (guildId,index) => {
    const url = queue[guildId].playlist[index].url;
    const player = queue[guildId].player;
    const { stream } = await playdl.stream(url, {
        discordPlayerCompatibility: true,
        quality: 128
      });
    queue[guildId].resource = createAudioResource(stream,{
        inlineVolume: true,
    });
    player.play(queue[guildId].resource);
};

const getNextResource = (guildId) => {
    if (queue[guildId]) {
        if(queue[guildId].playIndex > 0){
            queue[guildId].playlist.splice(queue[guildId].playIndex,1);
            queue[guildId].playIndex = 0;
        } else {
            queue[guildId].playlist.shift();
        }
        if (queue[guildId].playlist.length == 0) {
            queue[guildId].connection.destroy();
            delete queue[guildId];
        } else {
            queue[guildId].nowPlaying = JSON.parse(JSON.stringify(queue[guildId].playlist[0]));
            play(guildId,0);
        }
    }
};

module.exports = { play, getNextResource };
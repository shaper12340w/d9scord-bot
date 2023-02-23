const playdl = require('play-dl');
const { createAudioResource } = require('@discordjs/voice');
const { queue } = require('./index');


const play = async (guidId,index) => {
    const url = queue[guidId].playlist[index].url;
    const player = queue[guidId].player;
    const { stream } = await playdl.stream(url, {
        discordPlayerCompatibility: true,
        quality: 128
      });
    queue[guidId].resource = createAudioResource(stream,{
        inlineVolume: true,
    });
    player.play(queue[guidId].resource);
};

const getNextResource = (guildId) => {
    if (queue[guildId]) {
        queue[guildId].playlist.shift();
        if (queue[guildId].playlist.length == 0) {
            delete queue[guildId];
        } else {
            play(guildId,0);
            
        }
    }
};

module.exports = { play, getNextResource };
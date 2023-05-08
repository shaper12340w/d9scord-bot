const playdl = require("play-dl");
const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('discord.js');
const { parse } = require('iso8601-duration');
const { queue,client } = require('./main');

Array.prototype.ranPick=function(){
    return this[Math.floor(Math.random()*this.length)]
}

function addComma(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

class MusicPlay{

    constructor(msgData){
        this.embed = {
            color: 0x426cf5,
            title: '🎶',
            thumbnail: {
                url: '',
            },
            fields: [
                {
                    name: '재생시간',
                    value: '',
                    inline: true,
                },
                {
                    name: '조회수',
                    value: '',
                    inline: true,
                },
                {
                    name: '유튜브',
                    value: '',
                    inline: true,
                },
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: '',
                icon_url: '',
            },
        };
        this.option;
        this.msg = msgData;
        this.guildId = msgData.guildId;
        this.queue = new Map();
    }
    _getPlayData(option,guildId){
        if (queue[guildId]) {
            switch(option){
                case "deleted":
                    return queue[guildId].playlist.filter(e=>e.status === 0);
                case "ready":
                    return queue[guildId].playlist.filter(e=>e.status === 1);
                case "playing":
                    return queue[guildId].playlist.filter(e=>e.status === 2)[0];
                default:
                    return false;
            }
        } else {
            return false;
        }
    }
    async _search(url) {
        const url = this._getPlayData("playing", this.guildId).url
        console.log(url);
        const player = queue[this.guildId].player;
        if (type) {
            const { stream } = await playdl.stream(url, {
                discordPlayerCompatibility: true,
                quality: 256
            });
            queue[guildId].resource = createAudioResource(stream, {
                inlineVolume: true,
            });
        }
        player.play(queue[guildId].resource);
    }
    _normalPlay(){
        if(queue[this.guildId].option.playShuffle){
            queue[this.guildId].playlist.filter(e=>e.status === 1).ranPick().status = 3;
        } else {
            queue[this.guildId].playlist.filter(e=>e.status === 1)[0].status = 3;
        }
        queue[this.guildId].playlist.filter(e=>e.status === 2)[0].status = 0;
        queue[this.guildId].playlist.filter(e=>e.status === 3)[0].status = 2;
        play(guildId);
    }
    play(){

    }


}
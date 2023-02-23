const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
const { parse } = require('iso8601-duration');
const { isUndefined } = require('util');
const { google } = require('googleapis');
const { play, getNextResource } = require('../manageQueue');
require('dotenv').config();

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API,
});

const embed = {
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

const value = {};

function addComma(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
module.exports = {
    async execute(msgData,data){
        const { queue,serverProperty } = require('../index');
        const client = msgData.author;
        const user = msgData.author;
        if (!msgData.member.voice.channel) {
            msgData.reply('음성채널에 먼저 참가해주세요!');
            return;
        }
        const id = data;
        console.log(data)
        const result = await youtube.videos.list({
            part: 'id,snippet,contentDetails,statistics',
            id: id,
        });

        const contentDetails = result.data.items[0].contentDetails;
        const info = result.data.items[0].snippet;
        const duration = parse(contentDetails.duration);
        duration.minutes = String(duration.minutes).length == 1 ? '0' + duration.minutes : duration.minutes;
        duration.seconds = String(duration.seconds).length == 1 ? '0' + duration.seconds : duration.seconds;
        const videoDuration = duration.hours == 0 ? `${duration.minutes}:${duration.seconds}` : `${duration.hours}:${duration.minutes}:${duration.seconds}`;
        const viewCount = addComma(result.data.items[0].statistics.viewCount);
        const url = `https://www.youtube.com/watch?v=${id}`;
        const name = info.title;
        
        embed.title = `🎶${info.title}`;
        embed.fields[0].value = videoDuration;
        embed.fields[1].value = `${viewCount}회`;
        embed.fields[2].value = `[링크](${url})`;
        embed.footer.text = `${msgData.member.displayName} (${client.tag})`
        embed.footer.icon_url = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`;
        embed.thumbnail.url = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
        msgData.channel.send({ embeds: [embed] });

        // queue
        if (isUndefined(queue[msgData.guild.id])) {
            const connection = joinVoiceChannel({
                channelId: msgData.member.voice.channel.id,
                guildId: msgData.guild.id,
                adapterCreator: msgData.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer();
            player.on('error', error => {
                console.error(`Error: ${error.message}`);
                getNextResource(msgData.guild.id);
            });
            player.on(AudioPlayerStatus.Idle, () => {
                getNextResource(msgData.guild.id);
            });
            player.on(AudioPlayerStatus.Playing, () => {
                queue[msgData.guild.id].resource.volume.setVolume(serverProperty[msgData.guild.id].player.volume/100);
            });
            
            const subscription = connection.subscribe(player);
            queue[msgData.guild.id] = {
                playlist: [],
                player: player,
                connection:connection
            };
            queue[msgData.guild.id].playlist.push({
                url: url,
                name : name,
                embed: embed,
                
            });
            play(msgData.guild.id,0);
            return true;
        }

        queue[msgData.guild.id].playlist.push({
            url: url,
            name: name,
            embed: embed,
        });

    }
}
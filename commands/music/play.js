const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('discord.js');
const { parse } = require('iso8601-duration');
const { isUndefined } = require('util');
const { google } = require('googleapis');
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
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('곡을 재생합니다')
        .addStringOption(option =>
            option.setName('search_or_link')
                .setDescription('찾을 곡 이름 또는 링크')
                .setRequired(true)),
    async execute(interaction) {
        const { playYoutube } = require("../../main");
        playYoutube(interaction, interaction.options._hoistedOptions[0].value, { isPlayData : true , isReply : false , isInteraction : true });
    },
    async playMusic(msgData, data, option) {
        const { play, getNextResource } = require('../../manageQueue');
        const { youtubeAPIResult } = require('../../manageFunction')
        const { queue, serverProperty } = require('../../main');
        let user;
        const isPlaydlData = option.isPlaydlData ?? false;
        const isReply = option.isReply ?? false;
        const isInteraction = option.isInteraction ?? false;
        if (isInteraction) {
            user = msgData.user;
        } else {
            user = msgData.author;
        }
        if (!msgData.member.voice.channel) {
            msgData.reply('음성채널에 먼저 참가해주세요!');
            return;
        }
        let contentDetails, info, duration, videoDuration, viewCount, url, name, id;
        
        if (isPlaydlData) {
            data = JSON.parse(JSON.stringify(data));
            const time = data.durationInSec;
            const time2 = data.durationRaw.split(":");
            const hour = Math.floor(time/3600);
            const hours = String(hour).length == 1? '0'+hour : hour
            const minutes = String(time2[0]).length === 1 ? "0"+time2[0] : time2[0];
            const seconds = String(time2[1])
            info = { title:data.title };
            name = data.title;
            videoDuration = hour > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`
            viewCount = addComma(data.views);
            url = data.url
            id = data.id
        } else {
            id = data;
            console.log(id)
            const getResult = await youtubeAPIResult(
                {
                    part: 'id,snippet,contentDetails,statistics',
                    id: id,
                }
            )
            const result = JSON.parse(JSON.stringify(getResult));
            if (result.data.items.length < 1) {
                msgData.reply({
                    embeds: [{
                        color: 0xe01032,
                        title: ":exclamation: | ID가 잘못되었습니다"
                    }]
                })
                return false;
            }
            contentDetails = result.data.items[0].contentDetails;
            info = result.data.items[0].snippet;
            duration = parse(contentDetails.duration);
            duration.minutes = String(duration.minutes).length == 1 ? '0' + duration.minutes : duration.minutes;
            duration.seconds = String(duration.seconds).length == 1 ? '0' + duration.seconds : duration.seconds;
            videoDuration = duration.hours == 0 ? `${duration.minutes}:${duration.seconds}` : `${duration.hours}:${duration.minutes}:${duration.seconds}`;
            viewCount = addComma(result.data.items[0].statistics.viewCount);
            url = `https://www.youtube.com/watch?v=${id}`;
            name = info.title;
        }
        
    
        embed.title = `🎶${name}`;
        embed.fields[0].value = videoDuration;
        embed.fields[1].value = `${viewCount}회`;
        embed.fields[2].value = `[링크](${url})`;
        embed.footer.text = `${msgData.member.displayName} (${user.tag})`
        embed.footer.icon_url = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`;
        embed.thumbnail.url = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
        
        if(isReply){
            msgData.reply({embeds:[embed]}).then().catch()
        }else{
            msgData.channel.send({ embeds: [embed] }).then().catch();
        }
        
    
        // queue 재생중이지 않거나 없을때
        if (isUndefined(queue[msgData.guild.id])) {
            const connection = joinVoiceChannel({
                channelId: msgData.member.voice.channel.id,
                guildId: msgData.guild.id,
                adapterCreator: msgData.guild.voiceAdapterCreator,
            });
            
            //player 생성
            const player = createAudioPlayer();
            //player 이벤트 리스너
            player.on('error', error => {
                console.error(`Error: ${error.message}`);
            });
            player.on(AudioPlayerStatus.Idle, () => {
                //다음곡 재생
                getNextResource(msgData.guild.id);
            });
            player.on(AudioPlayerStatus.Playing, () => {
                //볼륨 지정
                queue[msgData.guild.id].resource.volume.setVolume(serverProperty[msgData.guild.id].player.volume / 1000);
            });
    
            const subscription = connection.subscribe(player);
            queue[msgData.guild.id] = {
                option:{
                    sendRoom:msgData.channel.id,    //실행 방 id
                    playRoom:msgData.member.voice.channel.id,   //음성 방 id
                    playRepeat: 0,  //반복 0:안함 1:전체 2:한곡만
                    playShuffle: 0, //셔플 0:안함 1:함
                    playRecommend: 0,
                    playButton:[], //반복 버튼 전송시 kill
                },
                playlist: [],   //재생 목록(삭제 시 변함)
                player: player, //player
                connection: connection  //connection
            };
            //playlist 넣는 부분
            queue[msgData.guild.id].playlist.push({
                url: url,
                name: name,
                embed: JSON.parse(JSON.stringify(embed)),
                status: 2
                // 재생을 하거나 삭제 할때 status를 0으로 바꾸고 모두 0이면 목록 자체를 삭제하도록 할꺼야
                // 여기서 status 0:삭제 1:대기 2:재생중 으로 구현하자
                //playlist 역할?: 목록에서 삭제됬을 시 list에서 현재 재생중인 순서 번호를 가져와서 현재 재생중에 넣는거
                //ㄴ 즉 바뀐 상황엔 필요없음. 왜? findindex로 구현하면 되니깐 (.findIndex(e=>e.status === 2))
            });

            play(msgData.guild.id);
            queue[msgData.guild.id].nowPlaying = JSON.parse(JSON.stringify(queue[msgData.guild.id].playlist[0]));
            return true;
        }
    
        queue[msgData.guild.id].playlist.push({
            url: url,
            name: name,
            embed: JSON.parse(JSON.stringify(embed)),
            status: 1
        });
    }
}
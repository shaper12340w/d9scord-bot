const playdl = require('play-dl');
const ytdl = require('ytdl-core');
const { createAudioResource } = require('@discordjs/voice');
const { queue,client } = require('./main');

const embed = {
    color: 0x46E88F,
    title: '✅ ',
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
        text: '추천 기능으로 자동 추가되었습니다!',
    },
};


Array.prototype.ranPick=function(){
    return this[Math.floor(Math.random()*this.length)]
}

const delay = (ms) => {
   return new Promise((resolve)=>{
      setTimeout(resolve,ms);
   });
}

function getPlayData(option,guildId){
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


const type = true;
const play = async (guildId) => {
    const url = getPlayData("playing",guildId).url
    console.log(url);
    const player = queue[guildId].player;
    if(type){
        const { stream } = await playdl.stream(url, {
            discordPlayerCompatibility: true,
            quality: 256
          });
        queue[guildId].resource = createAudioResource(stream,{
            inlineVolume: true,
        });
    }
    player.play(queue[guildId].resource);
};

const getNextResource = (guildId) => {
    if (queue[guildId]) {

        function normalPlay(){
            if(queue[guildId].option.playShuffle){
                queue[guildId].playlist.filter(e=>e.status === 1).ranPick().status = 3;
            } else {
                queue[guildId].playlist.filter(e=>e.status === 1)[0].status = 3;
            }
            queue[guildId].playlist.filter(e=>e.status === 2)[0].status = 0;
            queue[guildId].playlist.filter(e=>e.status === 3)[0].status = 2;
            play(guildId);
        }

        async function recommendPlay(videoUrl){
            const sendMessage = await client.channels.cache.get(queue[guildId].option.sendRoom).send("`🕛추천 영상 불러오는중`");
            queue[guildId].player.pause();
            try{
                const { addComma,youtubeURI } = require('./manageFunction');
                const { CompareVideo } = require('./modules/compare');

                async function returnData(){
                    let comp;
                    let vidinfo;
                    let ind = 0;
                    const getfirstInf = await playdl.video_basic_info(videoUrl);
                    do{
                        try{
                            const recVidUrl = getfirstInf.related_videos[ind];
                            await delay(1000)
                            const getInfo = await playdl.video_basic_info(recVidUrl);
                            vidinfo = getInfo.video_details.toJSON();
                            comp = new CompareVideo().compare(getfirstInf.video_details.toJSON(),vidinfo);
                            const urlList = queue[guildId].playlist.map(e=>youtubeURI(e.url));
                            if(urlList.includes(vidinfo.id)) comp = 1;
                            ind ++;
                            console.log("제목 : "+vidinfo.title);
                            console.log("시간 : "+vidinfo.durationRaw);
                            console.log("유사도 : "+comp+"\n");
                        } catch(e){
                            const recVidUrl = getfirstInf.related_videos[0];
                            await delay(1000)
                            const getInfo = await playdl.video_basic_info(recVidUrl);
                            vidinfo = getInfo.video_details.toJSON();
                        }
                    } while (Number(comp) > 0.75)
                    return vidinfo;
                }

                const videoInfo = await returnData()
                embed.title = '✅ '+videoInfo.title;
                embed.thumbnail.url = videoInfo.thumbnail.url;
                embed.fields[0].value = videoInfo.durationRaw;
                embed.fields[1].value = addComma(videoInfo.views)+"회";
                embed.fields[2].value = `[링크](${videoInfo.url})`
                queue[guildId].playlist.filter(e=>e.status === 2)[0].status = 0;
                queue[guildId].playlist.push({
                    url: videoInfo.url,
                    name: videoInfo.title,
                    embed: JSON.parse(JSON.stringify(embed)),
                    status: 2
                });
                sendMessage.delete();
                client.channels.cache.get(queue[guildId].option.sendRoom).send({embeds:[embed]});
                play(guildId);

            } catch(e){
                sendMessage.edit("`에러가 발생했습니다!`")
                console.error(e);
            }
            
        }
        
        function playNext(){
            switch(queue[guildId].option.playRepeat){
                case 0:
                    if(queue[guildId].playlist.filter(e=>e.status === 1).length <= 0){
                        queue[guildId].connection.destroy();
                        delete queue[guildId];
                        return;
                    } else {
                        normalPlay();
                    }
                    break;
                case 1:
                    if(queue[guildId].playlist.filter(e=>e.status === 1).length <= 0){
                        queue[guildId].playlist.forEach(e=>e.status = 1);
                        queue[guildId].playlist.filter(e=>e.status === 1)[0].status = 2;
                        play(guildId);
                    } else {
                        normalPlay();
                    }
                    break;
                case 2:
                    play(guildId);
                    break;
            }
        }

        if(queue[guildId].option.playRecommend){
            if(getPlayData("ready",guildId).length > 0){
                playNext();
            } else {
                recommendPlay(getPlayData("playing",guildId).url); 
            }
            return;
        } else {
            playNext();
        }
    }
};

module.exports = { play, getNextResource, getPlayData };

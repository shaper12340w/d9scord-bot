const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");

const embed = {
    color : 0xdbce39,
    title : "",
    description : '',
    
}

module.exports = {
    async execute(msgData) {
        const { queue,globalValue } = require('../index');

        if (!queue[msgData.guild.id]) {
            msgData.reply('Queue가 없습니다.');
            return false;
        }
        embed.title = `${msgData.guild.name}의 재생목록`
        embed.description = "현재 재생중:"+queue[msgData.guild.id].playlist[0].name+"\n\n"+queue[msgData.guild.id].playlist.slice(1).map((e, i) => {
            return "`"+(i+1) + "` | " + e.name
        }).join("\n");
        const playlist = queue[msgData.guild.id].playlist;
        msgData.channel.send({embeds:[embed]});
        if(playlist.length >= 2){
            const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(msgData.id)
                    .setPlaceholder('재생할 곡을 골라주세요')
                    .setMaxValues(1)
                    .addOptions(
                        new Array((playlist.length)-1).fill(0).map((e,i)=>{
                            return { label: playlist[i+1].name , value:"list_"+String(i) }
                        })
                    )
            );
            msgData.channel.send({ components: [row] }).then((e)=>{
                globalValue[msgData.guild.id].sendSelectMenu = e.id
            });
        }
        
    }
}
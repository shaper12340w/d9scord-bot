const { StringSelectMenuBuilder, ActionRowBuilder,SlashCommandBuilder } = require("discord.js");

const embed = {
    color : 0xdbce39,
    title : "",
    description : '',
    
}
function removeKey(arr, find) {
    const index = arr.indexOf(find);
    if (index < 0){ return arr; } else { return [...arr.slice(0, index), ...arr.slice(index + 1)] }
}

module.exports = {
    data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('곡 목록'),
    async execute(msgData) {
        const { queue,globalValue } = require('../index');

        if (!queue[msgData.guild.id]) {
            msgData.reply({embeds:[{
                color:0xdbce39,
                title:":octagonal_sign: | 재생중인 곡이 없습니다"
            }]})
            return false;
        }
        const playing = queue[msgData.guild.id].nowPlaying;
        const playlist = queue[msgData.guild.id].playlist;
        const musiclist = removeKey(playlist.map((e)=>{return e.name}),playing.name);
        
        embed.title = `${msgData.guild.name}의 재생목록`
        embed.description = "현재 재생중:"+playing.name+"\n\n"+musiclist.map((e, i) => {
            return "**`"+(i+1) + "`** | " + e
        }).join("\n");
        msgData.channel.send({embeds:[embed]});
        if(musiclist.length >= 1){
            const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(msgData.id)
                    .setPlaceholder('재생할 곡을 골라주세요')
                    .setMaxValues(1)
                    .addOptions(
                        new Array(musiclist.length).fill(0).map((_,i)=>{
                            return { label: musiclist[i] , value:"list_"+playlist.map((e)=>{return e.name}).indexOf(musiclist[i]) }
                        })
                    )
            );
            msgData.reply({ components: [row] }).then((message)=>{
                //!globalValue[msgData.guild.id].sendSelectMenu 일 경우 찾아서 삭제+타임아웃 삭제도 추가 ㄱㄱ+nextResource가져올때도 제거하게 ㅎㄱ?
                //했다 새꺄 삭제는 걍 좀 귀찮으니 안하는편이 나을듯
                globalValue[msgData.guild.id].sendSelectMenu = message.id
                setTimeout(() => { message.delete().catch(e=>console.error) }, 30000)
            });
        }
        
    }
}
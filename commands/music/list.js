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
        const { queue,globalValue,client } = require('../../main');
        const { getPlayData } = require("../../manageQueue");
        const { createSelectMenu } = require('../../manageFunction');
        if (!queue[msgData.guild.id]) {
            msgData.reply({embeds:[{
                color:0xdbce39,
                title:":octagonal_sign: | 재생중인 곡이 없습니다"
            }]})
            return false;
        }
        const playing = getPlayData("playing",msgData.guild.id);
        const playlist = queue[msgData.guild.id].playlist;
        const musiclist = getPlayData("ready",msgData.guild.id);
        
        embed.title = `${msgData.guild.name}의 재생목록`
        embed.description = "현재 재생중:"+playing.name+"\n\n"+musiclist.map((e, i) => {
            return "**`"+(i+1) + "`** | " + e.name
        }).join("\n");
        msgData.reply({ embeds:[embed] });
        if(musiclist.length >= 1){

            const row = createSelectMenu(msgData.id, {
                name: "재생할 곡을 골라주세요",
                maxSelect: 1,
                async execute({ interaction,kill }) {
                    const { play } = require("../../manageQueue");
                    if (queue[interaction.guild.id]) {
                        const isList = (interaction.values[0].split("_")[0] === "list");
                        if (isList) {
                            const index = Number(interaction.values[0].split("_")[1]);
                            queue[interaction.guild.id].playlist.filter(e=>e.status === 1)[index].status = 3;
                            queue[interaction.guild.id].playlist.filter(e=>e.status === 2)[0].status = 0;
                            queue[interaction.guild.id].playlist.filter(e=>e.status === 3)[0].status = 2;
                            play(interaction.guild.id);
                            client.channels.fetch(interaction.channel.id).then(async (channel) => {
                                kill();
                                await channel.messages.delete(globalValue[interaction.guild.id].sendSelectMenu);
                            });
                            interaction.channel.send({ embeds: [getPlayData("playing",interaction.guild.id).embed] }).then().catch(console.error);
                        }
                    }
                } 
            },new Array(musiclist.length).fill(0).map((_, i) => {
                return { label: musiclist[i].name, value: "list_" + i }
            }))

            msgData.channel.send({ components: [row] }).then((msg)=>{
                globalValue[msgData.guild.id].sendSelectMenu = msg.id
                setTimeout(() => { msg.delete().catch(e=>console.error) }, 30000)
            });
        }
        
    }
}
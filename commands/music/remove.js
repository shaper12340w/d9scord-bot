const { StringSelectMenuBuilder, ActionRowBuilder,SlashCommandBuilder } = require("discord.js");
const messageList = {};
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
		.setName('remove')
		.setDescription('곡 삭제'),
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
        
        if(musiclist.length >= 1){

            const row = createSelectMenu(msgData.id, {
                name: "삭제할 곡을 골라주세요",
                maxSelect: 1,
                async execute({ interaction,kill }) {
                    const { play } = require("../../manageQueue");
                    if (queue[interaction.guild.id]) {
                        const isList = (interaction.values[0].split("_")[0] === "list");
                        if (isList) {
                            const index = Number(interaction.values[0].split("_")[1]);
                            queue[interaction.guild.id].playlist.filter(e=>e.status === 1)[index].status = 0;
                            messageList[interaction.channel.id]
                            interaction.channel.send("삭제되었습니다").then().catch(console.error);
                        }
                    }
                } 
            },new Array(musiclist.length).fill(0).map((_, i) => {
                return { label: musiclist[i].name, value: "list_" + i }
            }))

            const sendmsg = await msgData.reply({ components: [row] , fetchReply: true });
            messageList[msgData.channel.id] = sendmsg;
        } else {
            msgData.reply({embeds:[{
                color:0xdbce39,
                title:":octagonal_sign: | 남은 곡이 1개 이하입니다"
            }]})
        }
        
    }
}
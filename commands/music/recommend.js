const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('recommend')
		.setDescription('추천 곡을 재생합니다'),
    async execute(msgData) {
        const { queue } = require('../../main');
        const guildId = msgData.guild.id;

        if (!queue[msgData.guild.id]) {
            msgData.reply({embeds:[{
                color:0xe01032,
                title:":exclamation: | 재생중인 곡이 없습니다"
            }]})
            return false;
        }
        if(queue[guildId].option.playRecommend){
            msgData.reply({embeds:[{
                color:0xeb3636,
                title:"❌ | 추천 기능이 비활성화되었습니다."
            }]})
            queue[guildId].option.playRecommend = 0;
        } else {
            msgData.reply({embeds:[{
                color:0x36eb87,
                title:"✅ | 추천 기능이 활성화되었습니다."
            }]})
            queue[guildId].option.playRecommend = 1;
        }
        
    }
}
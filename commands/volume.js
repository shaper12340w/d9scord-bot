const fs = require('fs');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('volume')
		.setDescription('재생중인 곡의 볼륨을 정합니다')
        .addStringOption(option =>
            option.setName('volume')
                .setDescription('정할 볼륨(숫자만 적어주세요)')
                .setRequired(true)),
    async execute(msgData,vol) {
        const { queue,serverProperty } = require('../index');
        if (msgData.options){
            vol = msgData.options._hoistedOptions[0].value;
        }
        if (!queue[msgData.guild.id]) {
            msgData.reply({embeds:[{
                color:0xe01032,
                title:":exclamation: | 재생중인 곡이 없습니다"
            }]})
            return false;
        } else if(isNaN(vol)){
            msgData.reply({embeds:[{
                color:0xe82e20,
                title:":exclamation: | 숫자를 입력해 주세요"
            }]})
        } else {
            queue[msgData.guild.id].resource.volume.setVolume(vol/100);
            serverProperty[msgData.guild.id].player.volume = vol;
            fs.writeFile("serverProperty.json",JSON.stringify(Object.fromEntries(Object.entries(serverProperty))),'utf-8',(e)=>{
                if(e){
                    message.channel.send({embeds:[{
                        color:0xff0000,
                        title:"Error!(save property)",
                        description:String(e)
                    }]});
                } else {
                    console.log('property saved');
                }
            })
            msgData.reply({embeds:[{
                color:0xdbce39,
                title:`:speaker: | 볼륨을 ${String(vol)}%로 설정했습니다`
            }]})
        }
        
    }
}
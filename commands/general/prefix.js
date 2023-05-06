const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prefix')
		.setDescription('접두사를 정하거나 확인합니다')
		.addStringOption(option =>
            option.setName('prefix')
                .setDescription('새로 정할 접두사')),
	async execute(interaction,option) {
		const { serverProperty } = require('../../main');
		const prefix = serverProperty[interaction.guild.id].prefix;
		let datavar;
		if(!option) {
			datavar = { isMessage:false, data:interaction.options._hoistedOptions[0]};
		} else {
			datavar = option;
		}
		
		const msg = datavar.data;
		if (!msg){
			if(datavar.isMessage){
				interaction.reply(`현재 접두사 : ${prefix}\n\n변경 방법:${prefix}접두사 "샤퍼야 "\nㄴ> 샤퍼야 ㅎㅇ\n(서버 관리자만 가능합니다)`);
			} else {
				interaction.reply(`현재 접두사 : ${prefix}\n\n변경 방법:/prefix prefix:"샤퍼야 "\nㄴ> 샤퍼야 ㅎㅇ\n(서버 관리자만 가능합니다)`);
			}
			return;
		}
		if (serverProperty[interaction.guild.id].administrator.includes(interaction.user.id)) {
			interaction.channel.send('```\n접두사를 바꿀때 자신이 접두사에 공백을 넣을 것인지 말 것인지 생각해주세요!\n예를 들어"샤퍼야 "라고 저장을 해야만 "샤퍼야 ㅎㅇ" 와 같은 명령어가 작동됩니다\n만약 "샤퍼야"라고만 저장할 시엔 "샤퍼야ㅎㅇ"라고 작성해야만 작동됩니다\n\n혹시 까먹었을 경우"샾봇 접두사"를 쳐주세요```')
			if(msg.value.startsWith('"')&&msg.value.endsWith('"')){
				serverProperty[interaction.guild.id].prefix = msg.value.slice(1,-1);
				const nowPrefix = serverProperty[interaction.guild.id].prefix;
				interaction.reply(`접두사가 '${nowPrefix}'로 변경되었습니다\n테스트:${nowPrefix}ㅎㅇ`)
			} else {
				interaction.reply(`사용 방법이 틀렸습니다\n예시: /prefix "샤퍼야 "\nㄴ> 샤퍼야 ㅎㅇ`)
			}
		} else {
			interaction.reply(interaction.member.displayName+"님은 관리자가 아닙니다")
		}
	},
};
const { SlashCommandBuilder,PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('notice')
		.setDescription('샾봇 공지방을 정합니다')
		.addStringOption(option =>
            option.setName('channel')
                .setDescription('공지를 보낼 채널')),
	async execute(interaction,option) {
		const { serverProperty,client } = require('../../main');
		const notice = serverProperty[interaction.guild.id].notice;
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
				interaction.reply(`현재 샾봇 공지방 : <#${notice}>\n\n변경 방법:${prefix}공지방 채팅\n(서버 관리자만 가능합니다)`);
			} else {
				interaction.reply(`현재 샾봇 공지방 : <#${notice}>\n\n변경 방법:/notice channel:채팅\n(서버 관리자만 가능합니다)`);
			}
			return;
		}
		if (serverProperty[interaction.guild.id].administrator.includes(interaction.user.id)) {
			const getMsg = msg.value.replace(/\s/g,"-")
			const option = channel => channel.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)&&channel.type === 0&&channel.name.includes(getMsg)
            const channel = interaction.guild.channels.cache.filter(option);
			if(channel.size === 0){
				interaction.reply(getMsg+"채널을 찾을 수 없습니다!");
				return;
			}
			if(channel.size === 1){
				serverProperty[interaction.guild.id].notice = channel.first().id;
				interaction.reply(`공지 방이 <#${channel.first().id}>으로 설정되었습니다!`)
			} else {
				const { createSelectMenuSet } = require("../../manageFunction");
				const menu = createSelectMenuSet(interaction.id,{
					name:"채널을 골라주세요",
					maxSelect:1,
					async execute({ interaction,kill }){
						if (serverProperty[interaction.guild.id].administrator.includes(interaction.user.id)) {
							const index = Number(interaction.values[0].split("_")[1]);
							const roomId = channel.map((e)=>{return e.id})[index];
							serverProperty[interaction.guild.id].notice = roomId
							interaction.reply(`공지 방이 <#${roomId}>으로 설정되었습니다!`);
							kill();
						} else {
							interaction.reply({ content: '당신은 관리자가 아닙니다!', ephemeral: true })
						}
					}
				},
				new Array(channel.size).fill(0).map((_,i)=>{
					const roomName = channel.map((e)=>{return e.name})[i];
					return { label:roomName, value:"noticeset_"+String(i) }
				})
				)
				interaction.reply({ content: '```\n공지할 채팅방을 골라주세요```', components:[menu] })
			} 
			
		} else {
			interaction.reply(interaction.member.displayName+"님은 관리자가 아닙니다")
		}
	}
};
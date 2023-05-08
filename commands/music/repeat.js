const { SlashCommandBuilder } = require('discord.js');
const { createButtonSet } = require('../../manageFunction');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('repeat')
		.setDescription('repeat songs'),
	async execute(interaction) {
        const { queue } = require('../../main');
		if (!queue[interaction.guild.id]) {
            interaction.reply({
              embeds: [{
                color: 0xe01032,
                title: ":exclamation: | 재생중인 곡이 없습니다"
              }]
            })
            return false;
        }
        queue[interaction.guild.id].option.playButton.forEach(e=>e())
        queue[interaction.guild.id].option.playButton = [];
        const status = ['반복 안함','전체 반복','한 곡만'];
        const status2 = ['일반 재생',"셔플"]
        const emojiList = ['▶️','🔁','🔂'];
        const shuffle  = ['▶️',"🔀"];
        const buttonSet = createButtonSet(interaction.id, [
            {
                label: status[queue[interaction.guild.id].option.playRepeat],
                emoji:emojiList[queue[interaction.guild.id].option.playRepeat],
                style: 1,
                async execute({ interaction, edit, kill }) {
                    if (!queue[interaction.guild.id]) return;
                    queue[interaction.guild.id].option.playButton.push(kill);
                    queue[interaction.guild.id].option.playRepeat++;
                    if(queue[interaction.guild.id].option.playRepeat > 2) queue[interaction.guild.id].option.playRepeat = 0;
                    await interaction.update({ components: [edit({label:status[queue[interaction.guild.id].option.playRepeat],emoji:emojiList[queue[interaction.guild.id].option.playRepeat]},{})], fetchReply: true });
                }
            },
            {
              label: status2[queue[interaction.guild.id].option.playShuffle],
              emoji:shuffle[queue[interaction.guild.id].option.playShuffle],
              style: 1,
              async execute({ interaction, edit, kill }) {
                  if (!queue[interaction.guild.id]) return;
                  queue[interaction.guild.id].option.playButton.push(kill);
                  queue[interaction.guild.id].option.playShuffle++;
                  if(queue[interaction.guild.id].option.playShuffle > 1) queue[interaction.guild.id].option.playShuffle = 0;
                  await interaction.update({ components: [edit({},{label:status2[queue[interaction.guild.id].option.playShuffle],emoji:shuffle[queue[interaction.guild.id].option.playShuffle]})], fetchReply: true });
              }
          },
        ])
        interaction.reply({ components:[buttonSet] })
	},
};
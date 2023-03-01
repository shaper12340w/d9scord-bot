const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('곡 일시정지 또는 재생'),
  async execute(msgData) {
    const { queue } = require('../index');

    if (!queue[msgData.guild.id]) {
      msgData.reply({
        embeds: [{
          color: 0xe01032,
          title: ":exclamation: | 재생중인 곡이 없습니다"
        }]
      })
      return false;
    } else {
      switch (queue[msgData.guild.id].player._state.status) {
        case "idle":
          msgData.reply({
            embeds: [{
              color: 0xe01032,
              title: ":exclamation: | 재생중인 곡이 없습니다"
            }]
          })
          break;
        case "buffering":
          msgData.reply({
            embeds: [{
              color: 0xe01032,
              title: ":exclamation: | 버퍼링 중입니다. 잠시 후 다시 시도해 주세요"
            }]
          })
          break;
        case "playing":
          queue[msgData.guild.id].player.pause();
          msgData.reply({
            embeds: [{
              color: 0x1c7fe8,
              title: "⏸️ | 일시정지됨"
            }]
          })
          break;
        case "autopaused":
          msgData.reply("I can't do this work because bot left the voice room or the song have ended!");
          break;
        case "paused":
          queue[msgData.guild.id].player.unpause();
          msgData.reply({
            embeds: [{
              color: 0x1c7fe8,
              title: "▶️ | 재생됨"
            }]
          })
          break;
        default:
          msgData.reply({
            embeds: [{
              color: 0xe01032,
              title: ":exclamation: | 재생중인 곡이 없습니다"
            }]
          })
          break;
      }
    }

  }
}

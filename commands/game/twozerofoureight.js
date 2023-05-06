const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createButtonSet } = require('../../manageFunction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('twozerofoureight')
        .setDescription('2048게임을 시작합니다'),

    async execute(interaction) {
        const { _2048, userGame } = require('../../manageFunction');
    
        const sender = interaction.member.id;

        if (!userGame[sender]) {
            //게임 시작 부분
            userGame[sender] = new _2048();
            const startGame = userGame[sender].start(4);

            //버튼 부분
            const emojiList = ['⬆', '⬇', '⬅', '➡'];
            const buttonSet = createButtonSet(interaction.id, [
                {
                    emoji: emojiList[0],
                    style: 1,
                    async execute({ interaction }) {
                        if (!userGame[interaction.member.id]) {
                            interaction.reply({ content: '남꺼 함부로 만지지 마욧', ephemeral: true })
                        } else {
                            move2048("up", interaction, userGame[interaction.member.id])
                        }
                    }
                },
                {
                    emoji: emojiList[1],
                    style: 1,
                    async execute({ interaction }) {
                        if (!userGame[interaction.member.id]) {
                            interaction.reply({ content: '남꺼 함부로 만지지 마욧', ephemeral: true })
                        } else {
                            move2048("down", interaction, userGame[interaction.member.id])
                        }
                    }
                },
                {
                    emoji: emojiList[2],
                    style: 1,
                    async execute({ interaction }) {
                        if (!userGame[interaction.member.id]) {
                            interaction.reply({ content: '남꺼 함부로 만지지 마욧', ephemeral: true })
                        } else {
                            move2048("left", interaction, userGame[interaction.member.id])
                        }
                    }
                },
                {
                    emoji: emojiList[3],
                    style: 1,
                    async execute({ interaction }) {
                        if (!userGame[interaction.member.id]) {
                            interaction.reply({ content: '남꺼 함부로 만지지 마욧', ephemeral: true })
                        } else {
                            move2048("right", interaction, userGame[interaction.member.id])
                        }
                    }
                },
                {
                    label: "포기",
                    style: 4,
                    async execute({ interaction }) {
                        if (!userGame[interaction.member.id]) {
                            interaction.reply({ content: '남꺼 함부로 만지지 마욧', ephemeral: true })
                        } else {
                            userGame[interaction.member.id].drawGameOver();
                            const file = new AttachmentBuilder(userGame[interaction.member.id].saveImage(), { name : interaction.member.id + ".png"});
                            interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor(0xD93030)
                                        .setTitle('**[2048]**')
                                        .setDescription("YOU LOSE..\n\nscore : " + String(userGame[interaction.member.id].score))
                                        .setImage(`attachment://${interaction.member.id}.png`)
                                ], files: [file]
                            });
                            userGame[interaction.member.id].message.delete();
                            delete userGame[interaction.member.id];
                        }
                    }
                },
            ])

            //움직이는 부분
            function move2048(moveTo, msgData, data) {
                const click = data.move(moveTo);

                if (!click) {
                    msgData.reply({ content: '움직일 수 없습니다!', ephemeral: true });
                } else {
                    const file = new AttachmentBuilder(click.image, { name : msgData.member.id + ".png"});
                    switch (click.status) {
                        case "win":
                            msgData.channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor(0x44E36E)
                                        .setTitle('**[2048]**')
                                        .setDescription("YOU WIN!!\n\nscore : " + String(click.score))
                                        .setImage(`attachment://${msgData.member.id}.png`)
                                ], files: [file]
                            });
                            data.message.delete();
                            delete data;
                            break;
                        case "lose":
                            msgData.channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor(0xD93030)
                                        .setTitle('**[2048]**')
                                        .setDescription("YOU LOSE..\n\nscore : " + String(click.score))
                                        .setImage(`attachment://${msgData.member.id}.png`)
                                ], files: [file]
                            });
                            data.message.delete();
                            delete data;
                            break;
                        case "proceeding":
                            msgData.deferUpdate().catch(console.error);
                            data.message.edit({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor(0x0099FF)
                                        .setTitle('**[2048]**')
                                        .setDescription("score : " + String(click.score))
                                        .setImage(`attachment://${msgData.member.id}.png`)
                                ], files: [file]
                            });
                            break;
                    }
                }
            }

            //파일 전송
            const file = new AttachmentBuilder(startGame.image, { name : interaction.member.id + ".png"});
            userGame[sender].message = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle('**[2048]**')
                        .setDescription("score : " + String(startGame.score))
                        .setImage(`attachment://${String(interaction.member.id)}.png`)
                ], files: [file], components: [buttonSet], fetchReply: true
            });

        } else {
            interaction.reply({ content: '이미 게임중이십니다만?', ephemeral: true });
        }
    },
};
const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('샾봇 서버 설정'),

    async execute(interaction) {
        const { serverProperty, client } = require("../../main");
        const { createModal, createButtonSet, createSelectMenu } = require('../../manageFunction');
        const { notice, prefix, inviteRoom } = serverProperty[interaction.guild.id];
        const isAdmin = (interaction) => { return serverProperty[interaction.guild.id].administrator.includes(interaction.user.id) };
        const botName = interaction.guild.members.cache.get(client.user.id).displayName;
        const killList = [];

        if (killList.length <= 0) {
            killList.forEach(e => e());
        }

        function setChannel(msg, eventName, interaction) {
            const getMsg = msg.replace(/\s/g, "-")
            const option = channel => channel.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages) && (channel.type === 0 || channel.type === 5) && channel.name.includes(getMsg)
            const channel = interaction.guild.channels.cache.filter(option);

            if(msg.length < 1){
                interaction.reply("해당 설정은 `사용 안함`으로 설정되었습니다")
                serverProperty[interaction.guild.id][eventName] = "";
                return;
            }

            if (channel.size === 0) {
                interaction.reply(getMsg + "채널을 찾을 수 없습니다!");
                return;
            }
            if (channel.size === 1) {
                serverProperty[interaction.guild.id][eventName] = channel.first().id;
                interaction.reply(`채널이 <#${channel.first().id}>으로 설정되었습니다!`)
            } else {
                const menu = createSelectMenu(interaction.id, {
                    name: "채널을 골라주세요",
                    maxSelect: 1,
                    async execute({ interaction, kill }) {
                        if (serverProperty[interaction.guild.id].administrator.includes(interaction.user.id)) {
                            const index = Number(interaction.values[0].split("_")[1]);
                            const roomId = channel.map((e) => { return e.id })[index];
                            serverProperty[interaction.guild.id][eventName] = roomId
                            interaction.reply(`채널이 <#${roomId}>으로 설정되었습니다!`);
                            kill();
                        } else {
                            interaction.reply({ content: '당신은 관리자가 아닙니다!', ephemeral: true })
                        }
                    }
                },
                    new Array(channel.size).fill(0).map((_, i) => {
                        const roomName = channel.map((e) => { return e.name })[i];
                        return { label: roomName, value: "noticeset_" + String(i) }
                    })
                )
                interaction.reply({ components: [menu] })
            }
        }



        const helpEmbed = new EmbedBuilder()
            .setColor(0x44E36E)
            .setTitle(`${interaction.guild.name} 의 봇 설정`)
            .setDescription(`현재 ${interaction.guild.name}의 ${botName}의 설정은 다음과 같습니다\n\n접두사:${prefix}\n봇 공지:${notice ? "<#" + notice + ">" : "없음"}\n초대 메시지:${inviteRoom ? "<#" + inviteRoom + ">" : "없음"}`)
            .setFooter({ text: `아래의 버튼을 눌러 ${botName} 봇의 설정을 할 수 있습니다` });

        const helpButton = createButtonSet(interaction.id, [
            {
                label: "접두사",
                style: 3,
                async execute({ interaction, kill }) {
                    killList.push(kill)
                    if (isAdmin(interaction)) {
                        createModal(interaction, {
                            title: "접두사 설정",
                            inputs: [{
                                label: '접두사',
                                length: [0, 10],
                                placeholder: '접두사를 입력해 주세요.',
                                required: true,
                                style: 1,
                                value: prefix
                            }]
                        }).then(async ({ interaction, inputs }) => {
                            const [title] = inputs;
                            const sendIsSpace = {}
                            const isSpaceButton = createButtonSet(interaction.id, [
                                {
                                    label: "예",
                                    style: 3,
                                    async execute({ interaction, kill }) {
                                        if (isAdmin(interaction)) {
                                            serverProperty[interaction.guild.id].prefix = title + " ";
                                            const nowPrefix = serverProperty[interaction.guild.id].prefix;
                                            interaction.reply(`접두사가 '${nowPrefix}'로 변경되었습니다\n테스트:${nowPrefix}ㅎㅇ`)
                                            sendIsSpace.message.delete();
                                        } else {
                                            interaction.reply({ content: '당신은 관리자가 아닙니다!', ephemeral: true });
                                        }
                                    }
                                },
                                {
                                    label: "아니오",
                                    style: 4,
                                    async execute({ interaction, kill }) {
                                        if (isAdmin(interaction)) {
                                            serverProperty[interaction.guild.id].prefix = title;
                                            const nowPrefix = serverProperty[interaction.guild.id].prefix;
                                            interaction.reply(`접두사가 '${nowPrefix}'로 변경되었습니다\n테스트:${nowPrefix}ㅎㅇ`)
                                            sendIsSpace.message.delete();
                                        } else {
                                            interaction.reply({ content: '당신은 관리자가 아닙니다!', ephemeral: true });
                                        }
                                    }
                                }
                            ]);
                            sendIsSpace.message = await interaction.reply({ embeds: [new EmbedBuilder().setTitle("접두사 뒤에 공백을 붙이시겠습니까?").setColor(0x0099FF).setDescription(`붙일 시: "${title + " "}"\n안 붙일 시: "${title}"`)], components: [isSpaceButton], fetchReply: true })
                        })
                    } else {
                        interaction.reply({ content: '당신은 관리자가 아닙니다!', ephemeral: true });
                    }
                }
            },
            {
                label: "공지",
                style: 3,
                async execute({ interaction, kill }) {
                    killList.push(kill)
                    if (isAdmin(interaction)) {
                        createModal(interaction, {
                            title: "공지 채널 설정",
                            inputs: [{
                                label: '공지 채널 이름',
                                length: [0, 50],
                                required: false,
                                placeholder: '채널 이름을 입력해 주세요.(비울시 설정 안 함)',
                                style: 1,
                                value: (notice ? client.channels.cache.get(notice).name : "")
                            }]
                        }).then(async ({ interaction, inputs }) => {
                            const [title] = inputs;
                            setChannel(title, "notice", interaction);
                        })
                    } else {
                        interaction.reply({ content: '당신은 관리자가 아닙니다!', ephemeral: true });
                    }
                }
            },
            {
                label: "초대",
                style: 3,
                async execute({ interaction, kill }) {
                    killList.push(kill)
                    if (isAdmin(interaction)) {
                        createModal(interaction, {
                            title: "초대 채널 설정",
                            inputs: [{
                                label: '초대 채널 이름',
                                length: [0, 50],
                                required: false,
                                placeholder: '채널 이름을 입력해 주세요.(비울시 설정 안 함)',
                                style: 1,
                                value: (inviteRoom ? client.channels.cache.get(inviteRoom).name : "")
                            }]
                        }).then(async ({ interaction, inputs }) => {
                            const [title] = inputs;
                            setChannel(title, "inviteRoom", interaction);
                        })
                    } else {
                        interaction.reply({ content: '당신은 관리자가 아닙니다!', ephemeral: true });
                    }
                }
            }
        ])

        interaction.reply({ embeds: [helpEmbed], components: [helpButton] })

    }
}
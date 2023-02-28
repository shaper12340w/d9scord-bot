const { SlashCommandBuilder , StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('listtest')
        .setDescription('list test!'),
    async execute(interaction) {
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(interaction.id)
                    .setPlaceholder('Select!')
                    .setMaxValues(1)
                    .addOptions(
                        { label: '샌즈', value: '와 샌즈', description: '샌즈가 외칩니다.' },
                        { label: '토리엘', value: '와 토리엘', description: '토리엘이 외칩니다.' }
                    )
            );
        interaction.reply({ components: [row] });
    },
};


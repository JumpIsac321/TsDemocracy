import { CommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ea")
    .setDescription("ea"),
  async execute(interaction: CommandInteraction){
    await interaction.reply("eaeaeae")
  }
}

import { SlashCommandBuilder, Snowflake } from "discord.js";
import { Sequelize } from "sequelize";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("run")
    .setDescription("Run for president"),
  async execute(interaction: any, sequelize: Sequelize){
    const Candidate = sequelize.models.Candidate;
    const Voter = sequelize.models.Voter;
    const member_id: Snowflake = interaction.member.id;
    if (await Candidate.findOne({where: {member_id: member_id}})){
      await interaction.reply("You are already running");
      return;
    }
    const voter = await Voter.findOne({where: {
      member_id: interaction.member.id
    }})
    if (voter){
      await interaction.reply("You have voted");
      return;
    }
    await Candidate.create({
      member_id: member_id,
      votes: 0,
    })
    await interaction.reply("You are now running");
  }
}

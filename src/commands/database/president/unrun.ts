import { SlashCommandBuilder, Snowflake } from "discord.js";
import { Sequelize } from "sequelize";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unrun")
    .setDescription("Stop running for president"),
  async execute(interaction: any, sequelize: Sequelize){
    const Candidate = sequelize.models.Candidate;
    const Voter = sequelize.models.Voter;
    const member_id: Snowflake = interaction.member.id;
    const candidate = await Candidate.findOne({where: {member_id: member_id}});
    if (!candidate){
      await interaction.reply("You are not running");
      return;
    }
    await candidate.destroy();
    await Voter.destroy({where: {
      candidate_id: member_id
    }})
    await interaction.reply("You are no longer running");
  }
}

import { SlashCommandBuilder } from "discord.js";
import { Sequelize } from "sequelize";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unvote")
    .setDescription("Remove your vote for a candidate"),
  async execute(interaction: any, sequelize: Sequelize){
    const Candidate = sequelize.models.Candidate;
    const Voter = sequelize.models.Voter;
    const voter = await Voter.findOne({where: {
      member_id: interaction.member.id
    }})
    if (!voter){
      await interaction.reply("You have not voted yet");
      return;
    }
    const candidate_id = voter.get("candidate_id");
    const candidate = await Candidate.findOne({where: {
      member_id: candidate_id
    }})
    if (!candidate){
      await interaction.reply("Candidate not found");
      return;
    }
    await candidate.decrement("votes");
    await interaction.reply("You have removed your vote");
  }
}

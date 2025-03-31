import { SlashCommandBuilder } from "discord.js";
import { Sequelize } from "sequelize";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vote")
    .setDescription("Vote for a candidate")
    .addUserOption(option => option
      .setName("candidate")
      .setDescription("The candidate who you want to vote for")
      .setRequired(true)),
  async execute(interaction: any, sequelize: Sequelize){
    const member = interaction.options.getMember("candidate");
    const Candidate = sequelize.models.Candidate;
    const Voter = sequelize.models.Voter;
    const candidate = await Candidate.findOne({where: {member_id: member.id}});
    if (!candidate){
      await interaction.reply("That member is not a candidate");
      return;
    }
    const voter = await Voter.findOne({where: {
      member_id: interaction.member.id
    }})
    if (voter){
      await interaction.reply("You have already voted");
      return;
    }
    if (await Candidate.findOne({where: {member_id: interaction.member.id}})){
      await interaction.reply("You are a candidate");
      return;
    }
    await candidate.increment("votes");
    await Voter.create({member_id: interaction.member.id, candidate_id: member.id});
    await interaction.reply("Voted!");
  }
}

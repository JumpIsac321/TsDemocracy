import { SlashCommandBuilder } from "discord.js";
import { Sequelize } from "sequelize";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("candidates")
    .setDescription("List all the candidates"),
  async execute(interaction: any, sequelize: Sequelize){
    const Candidate = sequelize.models.Candidate;
    const candidates = await Candidate.findAll();
    let candidatesString = "";
    for (let i = 0; i < candidates.length; i++) {
      const candidateMember = await interaction.guild.members.fetch(candidates[i].get("member_id"))
      const candidateName = candidateMember.displayName;
      candidatesString += `${candidateName}: ${candidates[i].get("votes")} votes\n`
    }
    if (candidatesString == ""){
      await interaction.reply("There are no candidates");
      return;
    }
    await interaction.reply(candidatesString)
  }
}

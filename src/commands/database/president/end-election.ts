import { GuildMember, SlashCommandBuilder } from "discord.js";
import { Op, Sequelize } from "sequelize";
import { president_role,me } from "../../../discord-ids.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("end-election")
    .setDescription("Ends an election for testing purposes only"),
  async execute(interaction: any, sequelize: Sequelize){
    if (interaction.member.id !== me){return};
    const Candidate = sequelize.models.Candidate;
    const President = sequelize.models.President;
    const Voter = sequelize.models.Voter;
    const candidate = await Candidate.findOne({
      order: [['votes','DESC']]
    })
    if (!candidate) {
      await interaction.reply("There are no candidates");
      return;
    }
    const maxVotes = candidate.get("votes");
    console.log(`Max Votes: ${maxVotes}`);
    const candidates = await Candidate.findAll({where: {votes: maxVotes}});
    if (candidates.length > 1){
      await interaction.reply("There is a tie");
      return;
    }
    const candidateMemberId = candidates[0].get("member_id")
    const candidateMember: GuildMember = await interaction.guild.members.fetch(candidateMemberId);
    console.log(`candidateMember: ${candidateMember}`);
    const presidentRole = await interaction.guild.roles.fetch(president_role)
    const president = await President.findOne();
    if (president){
      const presidentMemberId = president.get("member_id");
      try {
        const presidentMember: GuildMember = await interaction.guild.members.fetch(presidentMemberId)
        await presidentMember.roles.remove(presidentRole)
      } catch(e) {
        console.error(`Error occured: ${e}`)
      }
    } else {
      President.create({member_id: candidateMemberId});
    }
    await candidateMember.roles.add(presidentRole);
    await President.update({member_id: candidateMemberId}, {where:{
      member_id: {
        [Op.ne]: candidateMemberId
      }
    }})
    await Candidate.destroy({
      truncate: true
    })

    await Voter.destroy({
      truncate: true
    })
    await interaction.reply("Election ended")
  }
}

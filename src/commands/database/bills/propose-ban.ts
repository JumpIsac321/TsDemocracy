import { Guild, Message, SlashCommandBuilder, TextChannel } from "discord.js";
import { Sequelize } from "sequelize";
import { bills } from "../../../discord-ids.json"
import { bill_voting_time } from "../../../times.json"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("propose-ban")
    .setDescription("Propose a ban for a member that will be voted on")
    .addUserOption(option => option
      .setName("target")
      .setDescription("The user you want to ban")),
  async execute(interaction: any, sequelize: Sequelize){
    const target = interaction.options.getUser("target");
    const Bill = sequelize.models.Bill;
    const now = Math.round(Date.now()/1000)
    const bill: any = await Bill.create({bill_text: target.id, upvotes: 0, downvotes: 0, message_id: 0, bill_type: 1, end_time: (now + bill_voting_time), has_ended: false});
    const guild: Guild = interaction.guild
    const billChannel = await guild.channels.fetch(bills);
    if (!(billChannel instanceof TextChannel)){return}
    const bill_message: Message = await billChannel.send(`Bill #${bill.id}: Ban <@${target.id}> :arrow_up::0 :arrow_down::0 @everyone`);
    await interaction.reply("Bill created!");
    bill.message_id = bill_message.id;
    bill.save();
  }
}

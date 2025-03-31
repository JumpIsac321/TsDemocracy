import { SlashCommandBuilder, TextChannel } from "discord.js";
import { Sequelize } from "sequelize";
import { bills } from "../../../discord-ids.json"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("upvote")
    .setDescription("Upvotes a bill")
    .addIntegerOption(option => option
      .setName("bill-number")
      .setDescription("The number of the bill you want to upvote")
      .setRequired(true)),
  async execute(interaction: any, sequelize: Sequelize){
    const bill_id = interaction.options.getInteger("bill-number");
    const Bill = sequelize.models.Bill;
    const BillVoter = sequelize.models.BillVoter;
    const billvoter = await BillVoter.findOne({where: {bill_id: bill_id}})
    if (billvoter != null){
      await interaction.reply("You have already voted");
      return
    }
    const bill = await Bill.findByPk(bill_id);
    if (bill == null){
      await interaction.reply("You entered an invalid bill number")
      return;
    }
    if (bill.get("has_ended") == true){
      await interaction.reply("The voting period for this bill is over");
    }
    await bill.increment("upvotes");
    await bill.reload()
    await BillVoter.create({member_id: interaction.member.id, bill_id: bill_id, is_upvote: true})
    const bill_message_id: any = bill.get("message_id")
    const bill_channel = await interaction.guild.channels.fetch(bills)
    if (!(bill_channel instanceof TextChannel)){return}
    const message = await bill_channel.messages.fetch(bill_message_id)
    await message.edit(`Bill #${bill.get("id")}: ${bill.get("bill_text")} :arrow_up::${bill.get("upvotes")} :arrow_down::${bill.get("downvotes")} @everyone`)
    await interaction.reply("You upvoted the bill")
  }
}

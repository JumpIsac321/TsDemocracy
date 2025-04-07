import { SlashCommandBuilder, TextChannel } from "discord.js";
import { Sequelize } from "sequelize";
import { bills } from "../../../discord-ids.json";
import get_message_text from "../../../message-text";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unvote-bill")
    .setDescription("Undoes your vote for a specific bill")
    .addIntegerOption(option => option
      .setName("bill-number")
      .setDescription("The number of the bill you would like to unvote")
      .setRequired(true)),
  async execute(interaction: any, sequelize: Sequelize){
    const bill_id = interaction.options.getInteger("bill-number");
    const Bill = sequelize.models.Bill;
    const BillVoter = sequelize.models.BillVoter;
    const bill = await Bill.findByPk(bill_id)
    if (bill == null){
      await interaction.reply("You entered an invalid bill number");
      return;
    }
    if (bill.get("has_ended") == true){
      await interaction.reply("The voting period for this bill is over");
    }
    const billvoter = await BillVoter.findOne({where: {bill_id: bill_id}});
    if (billvoter == null){
      await interaction.reply("You not voted for this bill yet");
      return;
    }
    const is_upvote = billvoter.get("is_upvote");
    await billvoter.destroy()
    if (is_upvote){
      await bill.decrement("upvotes");
    }else{
      await bill.decrement("downvotes");
    }
    await bill.reload();
    const bill_message_id: any = bill.get("message_id");
    const bill_channel = await interaction.guild.channels.fetch(bills);
    if (!(bill_channel instanceof TextChannel)){return}
    const message = await bill_channel.messages.fetch(bill_message_id);
    await message.edit(get_message_text(bill.get("id"), bill.get("bill_text"), bill.get("upvotes"), bill.get("downvotes"), bill.get("bill_type")))
    await interaction.reply("You unvoted the bill");
  }
}

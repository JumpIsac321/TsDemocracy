import { Guild, SlashCommandBuilder, TextChannel, User } from "discord.js";
import { Sequelize } from "sequelize";
import { bills, laws } from "../../../discord-ids.json"
import { get_message_text_law } from "../../../message-text";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("approve")
    .setDescription("Signs a bill into law (Only for the president)")
    .addIntegerOption(option => option
      .setName("bill-number")
      .setDescription("The number of the bill you want to sign")
      .setRequired(true)),
  async execute(interaction: any, sequelize: Sequelize){
    const bill_id = interaction.options.getInteger("bill-number");
    const Bill = sequelize.models.Bill;
    const Law = sequelize.models.Law;
    const President = sequelize.models.President;
    const BillVoter = sequelize.models.BillVoter;
    const president = await President.findOne()
    if (president){
      const president_id: any = president.get("member_id");
      if (interaction.member.id != president_id){
        await interaction.reply("You are not the president");
        return;
      }
    }
    const guild: Guild = interaction.guild;
    const bill_channel = await guild.channels.fetch(bills);
    const law_channel = await guild.channels.fetch(laws);
    if (!(bill_channel instanceof TextChannel) || !(law_channel instanceof TextChannel)){
      return;
    }
    const bill = await Bill.findOne({where: {
      id: bill_id,
      has_ended: true,
    }})
    if (bill == null){
      await interaction.reply("You entered an invalid bill number");
      return;
    }
    let username = null;
    if (bill.get("bill_type") == 1){
      const userid: any = bill.get("bill_text")
      const targetuser: User = await interaction.client.users.fetch(userid)
      username = targetuser.username
      await guild.members.ban(userid)
    }
    const law = await Law.create({law_text: bill.get("bill_text"), message_id: 0, law_type: bill.get("law_type")});
    const law_message = await law_channel.send(get_message_text_law(bill.get("id"), bill.get("bill_text"), bill.get("bill_type"), username));
    law.set("message_id", law_message.id);
    await law.save();
    const bill_message_id: any = bill.get("message_id");
    const bill_message = await bill_channel.messages.fetch(bill_message_id);
    await bill_message.delete();
    await bill.destroy();
    await BillVoter.destroy({where: {
      bill_id: bill.get("id")
    }})
    await interaction.reply("You signed a bill");
  }
}

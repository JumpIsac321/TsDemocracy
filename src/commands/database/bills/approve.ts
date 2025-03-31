import { Guild, SlashCommandBuilder, TextChannel } from "discord.js";
import { Sequelize } from "sequelize";
import { bills, laws } from "../../../discord-ids.json"

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
    const law = await Law.create({law_text: bill.get("bill_text"), message_id: 0});
    const law_message = await law_channel.send(`#${law.get("id")}: ${law.get("law_text")}`);
    law.set("message_id", law_message.id);
    await law.save();
    const bill_message_id: any = bill.get("message_id");
    const bill_message = await bill_channel.messages.fetch(bill_message_id);
    await bill_message.delete();
    await bill.destroy();
    await interaction.reply("You signed a bill");
  }
}

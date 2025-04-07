import { Guild, SlashCommandBuilder, TextChannel } from "discord.js";
import { Sequelize } from "sequelize";
import { bills } from "../../../discord-ids.json"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("veto")
    .setDescription("Vetoes a bill (Only for the president)")
    .addIntegerOption(option => option
      .setName("bill-number")
      .setDescription("The number of the bill you want to veto")
      .setRequired(true)),
  async execute(interaction: any, sequelize: Sequelize){
    const bill_id = interaction.options.getInteger("bill-number");
    const Bill = sequelize.models.Bill;
    const BillVoter = sequelize.models.BillVoter;
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
    if (!(bill_channel instanceof TextChannel)){
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
    await bill_channel.send(`Bill #${bill.get("id")} was vetoed`);
    const bill_message_id: any = bill.get("message_id");
    const bill_message = await bill_channel.messages.fetch(bill_message_id);
    await bill_message.delete();
    await BillVoter.destroy({where: {
      bill_id: bill.get("id")
    }})
    await bill.destroy();
    await interaction.reply("You vetoed a bill");
  
  }
}

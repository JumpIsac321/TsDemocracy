import { Guild, Message, SlashCommandBuilder, TextChannel } from "discord.js";
import { Sequelize } from "sequelize";
import { bills } from "../../../discord-ids.json"
import { bill_voting_time } from "../../../times.json"


module.exports = {
  data: new SlashCommandBuilder()
    .setName("create-bill")
    .setDescription("creates a bill")
    .addStringOption((option) => 
      option.setName("text")
      .setDescription("The text of the bill")
      .setRequired(true)),
  async execute(interaction: any, sequelize: Sequelize){
    const bill_text = interaction.options.getString("text");
    const Bill = sequelize.models.Bill;
    const now = Math.round(Date.now()/1000)
    const bill: any = await Bill.create({bill_text: bill_text, upvotes: 0, downvotes: 0, message_id: 0, end_time: (now + bill_voting_time), has_ended: false});
    const guild: Guild = interaction.guild
    const billChannel = await guild.channels.fetch(bills);
    if (!(billChannel instanceof TextChannel)){return}
    const bill_message: Message = await billChannel.send(`Bill #${bill.id}: ${bill_text} :arrow_up::0 :arrow_down::0 @everyone`);
    await interaction.reply("Bill created!");
    bill.message_id = bill_message.id;
    bill.save();
  }
}

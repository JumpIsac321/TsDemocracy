import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, CommandInteraction, EmbedBuilder, Events, GatewayIntentBits, GuildMember, MessageFlags, TextChannel } from 'discord.js';
import { token, databasePassword, databaseName } from './config.json';
import { server, bills, president_office, main, president_role } from "./discord-ids.json"
import { Sequelize, DataTypes, Op } from 'sequelize';
import { check_bills, check_election, checks_election } from "./times.json"
import get_message_text, { get_message_text_president } from './message-text';


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const sequelize = new Sequelize(`mysql://root:${databasePassword}@localhost:3306/${databaseName}`);

let has_electioned = false;

const Bill = sequelize.define('Bill', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  bill_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  upvotes: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  downvotes: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bill_type: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  has_ended: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  }
});

const BillVoter = sequelize.define('BillVoter', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  member_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bill_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_upvote: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  }
});

const Law = sequelize.define('Law', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  law_text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  law_type: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});

const Candidate = sequelize.define('Candidate', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  member_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  votes: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
})

const Voter = sequelize.define('Voter', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  member_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  candidate_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})

const President = sequelize.define('President',{
  member_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
    freezeTableName: true
})


function setCommands(mainFolder: string): Collection<String,any>{
  let result_commands: Collection<String, any> = new Collection();
  const regularFoldersPath = path.join(__dirname, path.join('commands',mainFolder));
  const regularCommandFolders = fs.readdirSync(regularFoldersPath);

  for (const folder of regularCommandFolders) {
    const commandsPath = path.join(regularFoldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        result_commands.set(command.data.name, command);
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }
  return result_commands;
}

let commands: Collection<String,any> = setCommands('regular');
let database_commands: Collection<String, any> = setCommands('database');

async function sendMessages(){
  const exampleEmbed = new EmbedBuilder()
    .setTitle("Bot Commands")
    .setDescription("# Bot Commands\n### /run: run for president\n### /unrun: stop running for president\n### /vote @username: vote for a candidate to become president\n### /unvote: reverse your vote for a candidate\n### /candidates: view the candidates\n\
    ### /create-bill: propose a bill to try and create a law\n### /upvote bill-number: upvotes a bill\n### /downvote bill-number: downvotes a bill\n### /unvote-bill bill-number: reverses your vote for a bill\n## Only for president:\n\
    ### /approve bill-number: signs a bill into law\n### /veto bill-number: remove a bill after it has been voted in\n### /ea: ea")
  const guild = await client.guilds.fetch("1277053200528052316");
  const channel = await guild.channels.fetch("1277053201023111200");
  if (!(channel instanceof TextChannel)){
    return;
  }
  await channel.send({embeds: [exampleEmbed]});
  await channel.send("hi");
}

client.once(Events.ClientReady, async readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  await Bill.sync({force: true});
  await BillVoter.sync({force: true});
  await Law.sync({force: true});
  await Candidate.sync({force: true});
  await Voter.sync({force: true});
  await President.sync({force: true});

  await Candidate.create({member_id: "718151375967748098", votes: 2});
  await Candidate.create({member_id: "1356005788812054639", votes: 1});

  await President.create({member_id: "1356005788812054639"})

  const guild = await client.guilds.fetch(server);
  const bill_channel = await guild.channels.fetch(bills);
  const president_office_channel = await guild.channels.fetch(president_office);
  if (!(bill_channel instanceof TextChannel) || !(president_office_channel instanceof TextChannel)){
    return
  }
  await sendMessages();
  setInterval(async () => {
    const finished_bills = await Bill.findAll({
      where: {
        end_time: {
          [Op.lte]: Math.round(Date.now()/1000)
        },
        has_ended: false,
      }
    });
    finished_bills.forEach(async bill => {
      bill.set("has_ended", true);
      await bill.save()
      const bill_message_id: any = bill.get("message_id");
      const bill_upvotes: any = bill.get("upvotes");
      const bill_downvotes: any = bill.get("downvotes");
      const bill_message = await bill_channel.messages.fetch(bill_message_id);
      if (bill_upvotes >= bill_downvotes){
        await bill_message.edit(`${get_message_text(bill.get("id"), bill.get("bill_text"), bill.get("upvotes"), bill.get("downvotes"), bill.get("bill_type"))} (waiting for presidential approval)`)
        await president_office_channel.send(get_message_text_president(bill.get("id"), bill.get("bill_text"), bill.get("bill_type")))
      }else {
        await bill_channel.send(`Bill #${bill.get("id")} has died`);
        await bill_message.delete();
        await BillVoter.destroy({where: {
          bill_id: bill.get("id")
        }})
        await bill.destroy();
      }
    });
  }, check_bills)
  setInterval(async () => {
    if (!checks_election){
      return;
    }
    const now = new Date()
    if (now.getDay() != 1 || now.getHours() != 16){
      has_electioned = false;
      return;
    }
    if (has_electioned){
      return;
    }
    has_electioned = true;
    const candidate = await Candidate.findOne({
      order: [['votes','DESC']]
    })
    const guild = await client.guilds.fetch(server);
    const mainChannel = await guild.channels.fetch(main);
    if (!(mainChannel instanceof TextChannel)){
      return;
    }
    if (!candidate) {
      mainChannel.send("There are no candidates")
      return;
    }
    const maxVotes = candidate.get("votes");
    console.log(`Max Votes: ${maxVotes}`);
    const candidates = await Candidate.findAll({where: {votes: maxVotes}});
    if (candidates.length > 1){
      mainChannel.send("There is a tie")
      return;
    }
    const candidateMemberId: any = candidates[0].get("member_id")
    const candidateMember: GuildMember = await guild.members.fetch(candidateMemberId);
    console.log(`candidateMember: ${candidateMember}`);
    const presidentRole = await guild.roles.fetch(president_role)
    if (!presidentRole){
      return;
    }
    const president = await President.findOne();
    if (president){
      const presidentMemberId: any = president.get("member_id");
      try {
        const presidentMember: GuildMember = await guild.members.fetch(presidentMemberId)
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
    mainChannel.send(`<@${candidateMemberId}> has been elected president!`);
  }, check_election)
});

async function runRegularCommand(interaction: CommandInteraction, command: any){
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
}

async function runDatabaseCommand(interaction: CommandInteraction, command: any){
	try {
		await command.execute(interaction, sequelize);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
}


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = commands.get(interaction.commandName);

	if (command) {
    runRegularCommand(interaction, command);
		return;
	} const database_command = database_commands.get(interaction.commandName);
	if (database_command) {
    runDatabaseCommand(interaction, database_command);
		return;
	}

	console.error(`No command matching ${interaction.commandName} was found.`);

});

client.login(token);

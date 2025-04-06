import { Sequelize, DataTypes } from 'sequelize';
import { databasePassword,databaseName } from "./config.json";
const sequelize = new Sequelize(`mysql://root:${databasePassword}@localhost:3306/${databaseName}`);
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
});

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
});

const President = sequelize.define('President',{
  member_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  freezeTableName: true
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }


  await Bill.sync({alter: true});
  await BillVoter.sync();
  await Law.sync();
  await Candidate.sync();
  await Voter.sync();
  await President.sync();

  await sequelize.close()
})();


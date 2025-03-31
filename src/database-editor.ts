import { Sequelize, DataTypes } from 'sequelize';
import { databasePassword } from "./config.json";

const sequelize = new Sequelize(`mysql://root:${databasePassword}@localhost:3306/Democracy`);

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
  }
});



(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  const testBill: any = await Bill.create({
    bill_text: "this is a test bill",
    upvotes: 0,
    downvotes: 0,
    message_id: "120390129"
  })
  console.log(`Bill id: ${testBill.id}`);

  //await testBill.destroy();
  
  // await Bill.destroy({
  //   truncate: true
  // })

  await Bill.sync({alter: true});
  await sequelize.close()
})();

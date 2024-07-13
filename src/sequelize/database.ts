// database.ts
import { Sequelize } from '@sequelize/core';
import { MySqlDialect } from '@sequelize/mysql';
import dotenv from 'dotenv';
import { Customer } from '@models/customer';
import logger from '@src/utils/logger';

dotenv.config();

const sequelize = new Sequelize({
    dialect: MySqlDialect,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    models: [Customer],
});

(async () => {
    try {
      await sequelize.authenticate();
      logger.info('Connection has been established successfully.');
      await sequelize.sync({ force: false });
    } catch (error) {
      logger.error('Unable to connect to the database:', error);
    }
  })();

export default sequelize;

// Database Configuration for DogeRat Web Admin
// Supports both MySQL and PostgreSQL via Sequelize

import { Sequelize } from "sequelize-typescript";

// Determine database type from environment or default to PostgreSQL (what Replit provides)
const DATABASE_TYPE = process.env.DB_TYPE || "postgres"; // Can be 'mysql' or 'postgres'

let sequelize: Sequelize;

if (DATABASE_TYPE === "mysql") {
  // MySQL Configuration
  const MYSQL_CONNECTION_STRING =
    process.env.MYSQL_URL || process.env.DATABASE_URL;

  if (!MYSQL_CONNECTION_STRING) {
    throw new Error(
      "MySQL connection string required. Set MYSQL_URL or DATABASE_URL environment variable.",
    );
  }

  sequelize = new Sequelize(MYSQL_CONNECTION_STRING, {
    dialect: "mysql",
    dialectOptions: {
      connectTimeout: 60000,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: process.env.NODE_ENV === "development" ? console.log : false,
  });
} else {
  // PostgreSQL Configuration (default - Replit provides this)
  const PG_CONNECTION_STRING = process.env.DATABASE_URL;

  if (!PG_CONNECTION_STRING) {
    throw new Error(
      "PostgreSQL connection string required. DATABASE_URL must be set.",
    );
  }

  sequelize = new Sequelize(PG_CONNECTION_STRING, {
    dialect: "postgres",
    dialectOptions:
      process.env.NODE_ENV === "production"
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: process.env.NODE_ENV === "development" ? console.log : false,
  });
}

export { sequelize };
export default sequelize;

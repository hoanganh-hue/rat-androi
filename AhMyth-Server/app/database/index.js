const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(dataDir, 'ahmyth.db'),
    logging: false, // Set to console.log to see SQL queries
    define: {
        freezeTableName: true
    }
});

// Import models
const models = require('./models')(sequelize);

// Database initialization function
async function initializeDatabase() {
    try {
        // Test connection
        await sequelize.authenticate();
        console.log('✓ Database connection established successfully');

        // Sync all models with database
        await sequelize.sync({ alter: false }); // Use { alter: true } for development
        console.log('✓ Database models synchronized');

        return true;
    } catch (error) {
        console.error('✗ Unable to connect to the database:', error);
        return false;
    }
}

// Export sequelize instance and models
module.exports = {
    sequelize,
    ...models,
    initializeDatabase
};


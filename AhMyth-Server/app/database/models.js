const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    // Victim Model
    const Victim = sequelize.define('Victim', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        device_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            comment: 'Hashed Android ID / IMEI (SHA-256)'
        },
        model: {
            type: DataTypes.STRING,
            allowNull: true
        },
        manufacturer: {
            type: DataTypes.STRING,
            allowNull: true
        },
        os_version: {
            type: DataTypes.STRING,
            allowNull: true
        },
        ip_address: {
            type: DataTypes.STRING,
            allowNull: true
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true
        },
        first_seen: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        last_seen: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'victims',
        timestamps: false
    });

    // Session Model
    const Session = sequelize.define('Session', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        victim_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'victims',
                key: 'id'
            }
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            comment: 'Auth token (UUID)'
        },
        start_time: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'active',
            comment: 'active / closed / error'
        }
    }, {
        tableName: 'sessions',
        timestamps: false
    });

    // Log Model
    const Log = sequelize.define('Log', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        session_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },
        level: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'INFO / WARN / ERROR'
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'logs',
        timestamps: false
    });

    // File Model
    const File = sequelize.define('File', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        session_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },
        file_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        file_path: {
            type: DataTypes.STRING,
            allowNull: false
        },
        size_bytes: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        received_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'files',
        timestamps: false
    });

    // Command Model
    const Command = sequelize.define('Command', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        session_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },
        cmd_type: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'SCREEN / TOUCH / SHELL / etc.'
        },
        payload: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON / binary base64'
        },
        sent_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        ack_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'commands',
        timestamps: false
    });

    // Define Relationships
    Victim.hasMany(Session, { foreignKey: 'victim_id', as: 'sessions' });
    Session.belongsTo(Victim, { foreignKey: 'victim_id', as: 'victim' });

    Session.hasMany(Log, { foreignKey: 'session_id', as: 'logs' });
    Log.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });

    Session.hasMany(File, { foreignKey: 'session_id', as: 'files' });
    File.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });

    Session.hasMany(Command, { foreignKey: 'session_id', as: 'commands' });
    Command.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });

    return { Victim, Session, Log, File, Command };
};


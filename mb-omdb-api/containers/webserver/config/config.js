
module.exports = {
    development: {
      dialect: 'mysql',
      operatorsAliases: '0',
      username: process.env.DB_USER || 'db_user_name',
      password: process.env.DB_PASSWORD || 'db_password',
      database: process.env.DB_NAME     || 'db_name',
      host:     process.env.DB_HOST     || 'db_host',
      timestamps: true,
      freezeTableName: true,
      logging: false
    },
    test: {
      dialect: 'mysql',
      operatorsAliases: '0',
      timestamps: true,
      freezeTableName: true,
      logging: false
    },
    production: {
      dialect: 'mysql',
      operatorsAliases: '0',
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME     || 'mbmoviedata',
      host:     process.env.DB_HOST     || 'db_host',
      timestamps: true,
      freezeTableName: true,
      logging: false
    }
  };
  
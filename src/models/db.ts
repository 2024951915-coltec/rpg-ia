import {Sequelize, DataTypes} from '@sequelize/core';
import { SqliteDialect } from '@sequelize/sqlite3';
import bcrypt from 'bcryptjs';

const DB = new Sequelize({
    dialect: SqliteDialect,
    storage: 'db.sqlite'
})

/** As tabelas do Sequelize */
const table: any = {
    users: DB.define(
        'users', 
        {
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            },
            passhash: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        },
        {
            hooks: {
                beforeCreate: async (user: any)=>{
                    let salt = await bcrypt.genSalt(10);
                    user.passhash = await bcrypt.hash(user.passhash, salt);
                }
            }
        }
    ),
}

DB.sync();

export {table};
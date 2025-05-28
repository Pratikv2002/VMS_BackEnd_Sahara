import { createPool } from "mysql2";
const pool = createPool({
    port: "3306",
    host: "193.203.184.95",
    user: "u919426572_saharauser",
    password: 'Saharadb@27',
    database: "u919426572_saharavms"
});

// changes here


// const pool = createPool({
//     port: "3306",
//     host: "localhost",
//     user: "root",
//     password: 'root',
//     database: "VMS_DB"
// });

export default pool;
import mysql from "mysql2";
import dbConfig from "../config/db.config";

const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    // 根据需要，可以在此处添加重连逻辑
    return;
  }
  console.log('Connected to the MySQL database.');
});

// 实现心跳机制
const HEARTBEAT_INTERVAL = 60 * 60 * 1000;

setInterval(() => {
  connection.query('SELECT 1', (err, results) => {
    if (err) {
      console.error('Heartbeat query failed:', err);
      // 根据需要，可以在此处添加重连逻辑
    } else {
      console.log('Heartbeat query successful:', results);
    }
  });
}, HEARTBEAT_INTERVAL);

// 导出连接以供其他模块使用
export default connection;
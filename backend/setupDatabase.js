const mysql = require("mysql2/promise");
require("dotenv").config();

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true, 
  });

  try {
    const sql = await require("fs").promises.readFile(
      "database/setup.sql",
      "utf8"
    );
    await connection.query(sql);
    console.log("Database dan tabel berhasil dibuat.");
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await connection.end();
  }
}

setupDatabase();

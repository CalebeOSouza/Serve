import mysql from "mysql2/promise";
import "dotenv/config";
import { execSync } from "child_process";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function main() {
  try {
    console.log("Apagando banco db_serve...");

    await pool.query(`DROP DATABASE IF EXISTS db_serve`);

    console.log("Banco apagado.");
    console.log("Executando criação do banco...");

    execSync("npx tsx app/scripts/init-db.ts", {
      stdio: "inherit",
    });

    console.log("Banco resetado com sucesso!");
    console.log("Iniciando servidor Next.js...");

    execSync("npm run dev", {
      stdio: "inherit",
    });
  } catch (error) {
    console.error("Erro ao resetar o banco:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
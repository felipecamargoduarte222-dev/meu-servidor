import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Abre a conexão com o banco e cria o arquivo database.sqlite
export async function openDb() {
  return open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });
}

// Cria a tabela de clientes caso ela ainda não exista (DDL)
export async function initDb() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      telefone TEXT NOT NULL,
      ativo BOOLEAN DEFAULT 1
    )
  `);
}

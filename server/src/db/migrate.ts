/// <reference types="node" />
import fs from "fs";
import path from "path";
import { pool } from "./client";
import dotenv from "dotenv";

dotenv.config();

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log("✅ Database migration complete");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => { console.error("Migration failed:", err); process.exit(1); });

import Database from 'better-sqlite3';
import fs from 'fs';

const filepath = "./sql/sportDB.db";

export default async function createDB(){
  var exists = true;
  if(fs.existsSync(filepath)) exists = false

  var db = new Database(filepath);
  console.log("Connection has been established with the database");
  if(exists){
    db = createTable(db);
  }
  return db
} 

export async function createTable(db){
  await db.exec(`
    CREATE TABLE sporter
    (
      sporterID INTEGER PRIMARY KEY AUTOINCREMENT,
      naam VARCHAR(20) NOT NULL
    )`);

    await db.exec(`
      CREATE TABLE excercises
      (
        exID INTEGER PRIMARY KEY AUTOINCREMENT,
        naam VARCHAR(50) NOT NULL
      )`); 

    await db.exec(`
      CREATE TABLE entry
      (
        entID INTEGER PRIMARY KEY AUTOINCREMENT,

        exercise INTEGER NOT NULL,
        weight INTEGER NOT NULL,
        reps INTEGER NOT NULL,
        sets INTEGER NOT NULL,
        sporter INTEGER NOT NULL,

        FOREIGN KEY(exercise) REFERENCES exercises(exID),
        FOREIGN KEY(sporter) REFERENCES sporter(sporterID)
      )`);
  return db;
}
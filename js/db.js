import pkg from 'sqlite3';
const { sqlite3 } = pkg;

const filepath = "./sportDB";

function createDB(){
  const db = new sqlite3.Database(filepath, (error) =>{
    if(error)
      return console.error(error.message);
    }
  );
  console.log("Connection has been established with the database");
  return db
}

function createTable(db){
  db.exec(`
    CREATE TABLE sport
    (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      naam VARCHAR(20) NOT NULL,
      FOREIGN KEY
    )
    `)
}

module.exports = createDB(); 
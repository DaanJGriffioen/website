import http from 'http';
import { promises as fs } from 'fs';
import path, { basename } from 'path';
import { fileURLToPath } from 'url';
import createDB from './js/db.js';
import sanitizeHtml from 'sanitize-html';

// Get the file path and directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hostname = '172.30.127.135';
const port = process.env.PORT || 8080;
const db = await createDB();

// This could be much better
function commitToDB(db, data){
  let name = [];
  let val = [];

  let splitData = data.split('&');
  
  let splitHidden = String(splitData[0]).split('=')[1];

  if(splitHidden === '0'){
    console.log('tracker!');
    for (let index = 1; index < splitData.length-1; index++) {
      const element = splitData[index];
      name.push(element.split('=')[0]);
      val.push(element.split('=')[1]);
    }

    db.exec(`INSERT INTO entry(${name[0]}, ${name[1]}, ${name[2]}, ${name[3]}, ${name[4]}) VALUES(${val[0]}, ${val[1]}, ${val[2]}, ${val[3]}, ${val[4]});`);

  }
  else if(splitHidden === '1'){
    const element = splitData[1];
    var help;
    
    help = sanitizeHtml(element.split('=')[0]);
    name.push(help);
    help = sanitizeHtml(element.split('=')[1]);
    val.push(help);

    console.log(name);
    console.log(val);

    db.exec(`INSERT INTO excercises(naam) VALUES("${val[0]}");`);
  }
}

const requestListener = async function (req, res) {
  let nameID = -1;
  let data = '';
  let baseName = path.basename(req.url);
  if(baseName === '') baseName = 'index';
  let contentType, filePath;
  const ext = path.extname(req.url);
  const urlParts = req.url.split('/').slice(1);

  if(urlParts[2] === 'daan') nameID = 0;
  else if(urlParts[2] === 'thomas') nameID = 1;
  else if(urlParts[2] === 'noah') nameID = 2;

  if(req.method === 'POST'){
    req.on('data', chunk => {
      data += chunk.toString();
    });
    req.on('end',()=>{
      console.log('POST data:', data);
      commitToDB(db, data);
    });
  }

  if (req.method === 'GET' && urlParts[0] === 'api') {
    let exID = -1;
    if (urlParts[1] === 'remove') {
      if (nameID === -1) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'DB error', message: 'Invalid nameID' }));
        return;
      }
      try{
        const rows = await new Promise((resolve, reject) => {
          db.all(`SELECT exID FROM excercises WHERE naam IS '${urlParts[3]}';`, [], async (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
      });
  
      if (rows.length === 0) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found', message: 'Exercise not found' }));
        return;
      }
  
        exID = rows[0].exID;
        console.log(exID, nameID);
  
        // Now delete from the entry table
      console.log('Deleting entry...');
      await new Promise((resolve, reject) => {
        db.get(`DELETE FROM entry WHERE sporter=(?) AND exercise = (?);`, [nameID, exID-1], (err, rows)=>{
          if (err) reject(err);
          else resolve(rows);
      });
    });
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'Entry deleted successfully' }));
    }
    catch(err) {
      console.log(err);
      res.writeHead(500);
      res.end(JSON.stringify({error: 'DB error', message:err.message}));
    }
    return;
  }

    else if(urlParts[1] === 'data'){
      if(nameID === -1){
        res.writeHead(500);
        res.end(JSON.stringify({error: 'DB error', message: err.message}));
      }
      // Geen idee wtf er gebeurd bij ex.exid maar het werkt 
      res.setHeader('Content-Type', 'application/json');
      db.all(`
        SELECT
          ex.naam as Oefening,
          MAX(e.weight) as gewicht,
          e.reps,
          e.sets
        FROM 
          entry e LEFT JOIN excercises ex ON e.exercise = ex.exID-1 
        WHERE 
          sporter IS ${nameID} 
        GROUP BY
          ex.exID;`, [], (err, rows) => {
        if(err) {
          console.log(err);
          res.writeHead(500);
          res.end(JSON.stringify({error: 'DB error', message: err.message}));
        }
        else {
          res.writeHead(200);
          res.end(JSON.stringify(rows));
        }
      });
      return;
    }
    else if(urlParts[1] === 'excercise'){
      res.setHeader('Content-Type', 'application/json');
      db.all(`SELECT naam FROM excercises;`, [], (err, rows) => {
        if(err) {
          res.writeHead(500);
          res.end(JSON.stringify({error: 'DB error', message: err.message}));
        }
        else {
          res.writeHead(200);
          res.end(JSON.stringify(rows));
        }
      });
      return;
    }
  }

  switch(ext){
    case '.js':
      filePath = `/js/${baseName}`;
      contentType = 'text/javascript/';
      break;
    case '.css':
      filePath = `/views/css/${baseName}`;
      contentType = 'text/css/';
      break;
    case '.jpg':
      filePath = `/views/img/${baseName}`;
      contentType = 'image/jpeg';
      break;
    case '.png':
      filePath = `/views/img/${baseName}`;
      contentType = 'image/png';
      break;
    // Handle .ico like this for a while
    case '.ico':
      res.writeHead(204); // No Content
      res.end();
      return;
    // Html is default, since on my website the link for it has no extension
    default:
      contentType = 'text/html';
      filePath = `/views/pages/${baseName}.html`;
      break;
  }
  
  fs.readFile(__dirname + filePath)
  .then(contents => {
      res.setHeader("Content-Type", contentType);
      res.writeHead(200);
      res.end(contents);
  })
  .catch(err => {
      res.setHeader('Content-Type', 'text/plain');
      res.writeHead(500);
      console.log(err);
      res.end(`Error ${err}`);
  });
  
  return
};

const server = http.createServer(requestListener);

server.listen(port, () => {
  console.log(`Server is running on http://${hostname}:${port}`);
});


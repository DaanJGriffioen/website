import http from 'http';
import { promises as fs } from 'fs';
import path, { basename } from 'path';
import { fileURLToPath } from 'url';
import createDB from './js/db.js';
import sanitizeHtml from 'sanitize-html';

// Get the file path and directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hostname = '192.168.1.17';
const port = 3000;
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

const requestListener = function (req, res) {
  let baseName = path.basename(req.url);
  if(baseName === '') baseName = 'index';
  let contentType, filePath;
  let data = '';
  const ext = path.extname(req.url);
  const urlParts = req.url.split('/').slice(1);

  if(req.method === 'POST'){
    req.on('data', chunk => {
      data += chunk.toString();
    });
    req.on('end',()=>{
      console.log('POST data:', data);
      commitToDB(db, data);
    });
  }

  // Handle api requests made to transfer data from sql to html 
  if(req.method === 'GET' && urlParts[0] === 'api' && urlParts[1] === 'data') {
    var nameID;
    if(urlParts[2] === 'daan') nameID = 0;
    else if(urlParts[2] === 'thomas') nameID = 1;
    else if(urlParts[2] === 'noah') nameID = 2;

    // Geen idee wtf er gebeurd bij ex.exid maar het beurt 
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
  else if(req.method === 'GET' && urlParts[0] === 'api' && urlParts[1] === 'excercise') {
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
      res.end(`Error ${err}`);
  });
  
  return
};

const server = http.createServer(requestListener);

server.listen(port, hostname, () => {
  console.log(`Server is running on http://${hostname}:${port}`);
});


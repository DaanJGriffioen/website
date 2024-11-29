import http from 'http';
import { promises as fs } from 'fs';
import path, { basename } from 'path';
import { fileURLToPath } from 'url';


// Get the file path and directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hostname = '192.168.1.17'
const port = 3000;

const requestListener = function (req, res) {
  let baseName = path.basename(req.url);
  if(baseName === '') baseName = 'index';
  let contentType = '';
  let filePath = '';
  const ext = path.extname(req.url);

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
      return;
  });
};

const server = http.createServer(requestListener);
  server.listen(port, hostname, () => {
    console.log(`Server is running on http://${hostname}:${port}`);
});

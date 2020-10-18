let fs = require('fs');
let http = require('http');
let https = require('https');
let url = require('url');

let dictionary = null;

let dictionaryHandler = (request, response) => {
    let u = url.parse(request.url);

    if (u.pathname == '/readyz') {
        if (dictionary) {
            response.writeHead(200);
            response.end('OK');
        } else {
            response.writeHead(404);
            response.end('Not Loaded');
        }
        return;
    }

    let key = '';
    if (u.pathname.length > 0) {
        key = u.pathname.substr(1).toUpperCase(); 
    }
    let def = dictionary[key];
    if (!def) {
        response.writeHead(404);
        response.end(key + ' was not found');
        return;
    }
    response.writeHead(200);
    response.end(def);
}

let downloadDictionary = (url, file, callback) => {
  let stream = fs.createWriteStream(file);
  let req = https.get(url, function(res) {
    res.pipe(stream);
    stream.on('finish', function() {
      stream.close(callback);
      console.log('dictionary downloaded');
    });
  }).on('error', function(err) {
    fs.unlink(file);
    if (callback) cb(err.message);
  });
};

let loadDictionary = (file, callback) => {
    fs.readFile(file, (err, data) => {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        dictionary = JSON.parse(data);
        console.log('dictionary loaded.');
        callback();
    })
};

downloadDictionary('https://raw.githubusercontent.com/adambom/dictionary/master/dictionary.json', 'dictionary.json', (err) => {
    if (err) {
        console.log(err);
        return;
    }
    loadDictionary('dictionary.json', (err) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log('ready to serve');
    });
});

const server = http.createServer(dictionaryHandler);

server.listen(8080, (err) => {  
  if (err) {
    return console.log('error starting server: ' + err);
  }

  console.log('server is listening on 8080');
});
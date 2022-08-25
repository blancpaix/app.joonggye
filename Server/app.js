const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const morgan = require('morgan');
const winstonLogger = require('./logger/winston');
const morganFormat = process.env.NODE_ENV === 'dev' ? 'dev' : 'combined';
const cors = require('cors');
const helmet = require('helmet');
const Socket = require('./socket');

const app = express();
const PORT = process.env.PORT || 443;

console.log('NODE_ENV : ', process.env.NODE_ENV);
const sslCredentials = process.env.NODE_ENV === "dev" ?
  undefined
  :
  {
    ca: fs.readFileSync('/etc/letsencrypt/live/www.joonggye.live/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/www.joonggye.live/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/www.joonggye.live/cert.pem'),
  };

app.use(morgan(morganFormat, { stream: winstonLogger.stream }));
app.use(helmet());
app.use(cors({
  credentials: true
}));

app.use((req, res, next) => {
  if (!req.secure) {
    res.redirect('https://' + req.header["host" + req.url]);
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  res.send(new Error('hi'));
});

const httpServer = http.createServer(app).listen(3000, () => {
  console.log('SERVER IS RUNNING EXCEPT SECURE - 80')
});
const httpsServer = https.createServer(sslCredentials, app).listen(PORT, () => {
  console.log('SERVER IS RUNNING WITH TSL/SSL - 443')
});

Socket(httpsServer, app);
Socket(httpServer, app);
import express from 'express';

const PORT = process.env.APP_PORT || 3000;
const HOST = process.env.APP_HOST || 'localhost';
const URL = `http://${HOST}:${PORT}`;

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, () => {
  console.log(`server running in ${URL}`);
});

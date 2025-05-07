
const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/feedback', express.static('feedback'));

app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'pages', 'feedback.html');
  res.sendFile(filePath);
});

app.get('/exists', (req, res) => {
  const filePath = path.join(__dirname, 'pages', 'exists.html');
  res.sendFile(filePath);
});

app.post('/create', async (req, res) => {
  const title = req.body.title;
  const content = req.body.text;
  const adjTitle = title.toLowerCase();

  const tempFilePath = path.join(__dirname, 'temp', adjTitle + '.txt');
  const finalFilePath = path.join(__dirname, 'feedback', adjTitle + '.txt');

  try {
    await fs.writeFile(tempFilePath, content);

    try {
      await fs.access(finalFilePath); // if exists, throws nothing
      // File exists, redirect
      res.redirect('/exists');
    } catch {
      // File doesn't exist, proceed with move
      await fs.copyFile(tempFilePath, finalFilePath);
      await fs.unlink(tempFilePath);
      res.redirect('/');
    }
  } catch (err) {
    console.error('Error handling file:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(80, () => {
  console.log('Server running on port 80');
});

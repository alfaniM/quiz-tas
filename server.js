const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/data/:file', (req, res) => {
  const file = req.params.file;
  res.sendFile(__dirname + `/data/${file}.json`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

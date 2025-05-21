
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { getKodByUrl } = require('./puppeteerScript');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/submit', async (req, res) => {
  try {
    const result = await getKodByUrl(req.body);
    res.send('הבקשה התקבלה, קוד ההטבה נשלח למייל.');
  } catch (error) {
    console.error(error);
    res.status(500).send('אירעה שגיאה בעיבוד הבקשה.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

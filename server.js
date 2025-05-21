// require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { getKodByUrl } = require('./puppeteerScript'); // Import the function from puppeteerScript.js


const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/submit', async (req, res) => {
  try {
    const data = req.body;

    // בדיקה בסיסית על הנתונים
    if (!data.url || !data.data || !data.phone || !data.email) {
      return res.status(400).send('Missing required fields: url, data, phone, email');
    }

    // קריאה לפונקציה מה-name.js עם המידע שנשלח
    const results = await getKodByUrl(data);

    // מחזיר ללקוח תגובה שמראה שהעיבוד הסתיים
    res.json({ message: 'Processing finished', results });

  } catch (error) {
    console.error('Error in /submit:', error);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

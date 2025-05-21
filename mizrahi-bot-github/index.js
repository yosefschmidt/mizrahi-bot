// created by @Fesoy1 from telegram
// מוזמנים לפנות על כל שאלה או בקשה
// https://t.me/Fesoy1

const e = require('express')
const { getKodByUrl } = require('./puppeteer.service')
const express = require('express'),
    app = express(),
    port =  5002

app.use(express.json())
app.listen(port, () => {
    console.log('Server is up 🖥️')
})

const data=   {"email": "your@gmail.com",
  "phone": "05xxxxxxxx",
  "url": [
    "https://www.mizrahi-tefahot.co.il/hacartis/katom-shavim/tsoomi-hot-0525/"

// צריך לשים פסיק בין כל קישור או פרטים של אדם



   ],
//    id=תעודת זהות
//    cardNumber=6 ספרות
  "data": [
    {"num":1, "id": "xxxxxxxxxxx", "cardNumber": "xxxxxx" } //פלוני
    ,
    {"num":2, "id": "xxxxxxxxxxx", "cardNumber": "xxxxxx" } //אלמוני

],


}



getKodByUrl(data)

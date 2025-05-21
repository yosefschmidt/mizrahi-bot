// puppeteerScript.js (מתוקן ל־Node 18, CommonJS)

const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");

async function getKodByUrl(data) {
  const results = [];
  const nameOfBenefit = [];

  for (let urlIndex = 0; urlIndex < data.url.length; urlIndex++) {
    const tempResults = [];

    for (let dataIndex = 0; dataIndex < data.data.length; dataIndex++) {
      const v = data.data[dataIndex];
      const result = await processData(
        v,
        v.num,
        data.url[urlIndex],
        data.phone,
        data.email
      );

      console.log(result.nameOfBenefit);
      if (dataIndex === 0) {
        tempResults.push(result.nameOfBenefit);
        nameOfBenefit.push(result.nameOfBenefit);
      }
      tempResults.push(result.benefit);

      if (dataIndex < data.data.length - 1) {
        await sleep(1000);
      }
    }

    results.push(tempResults);
  }

  const textResults = arrayToString(results).trim();
  console.log(textResults);
  await sendOrderEmail({
    text: textResults,
    title: "קודי ההטבה של מזרחי טפחות",
    email: data.email,
  });

  return results;
}

async function processData(v, i, benefitUrl, phoneNumber, email) {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const url = benefitUrl;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 300000 });

  await page.evaluate(() => {
    const form = document.querySelector("#HacartisDiscountCodeForm");
    if (form && form.className.includes("hide")) {
      form.className = "discountCodeForm";
    }
  });

  await page.type('input[id="IDNumber"]', String(v.id));
  await page.type('input[id="Last6Numbers"]', String(v.cardNumber));
  await page.type('input[id="phone"]', phoneNumber);
  await page.type('input[id="Email"]', email);
  await page.click('button[id="btnSubmit"]');

  await sleep(7000);

  const failure = await page.evaluate(() => {
    return document.querySelector("#DiscountCodeModalFailure")?.className.includes("in");
  });

  if (failure) {
    console.log("לא נמצא קוד הטבה");
    await browser.close();
    return { benefit: "ERROR", nameOfBenefit: "No benefit found" };
  }

  const nameOfBenefit = await page.evaluate(() => {
    return document.querySelector(".page-title")?.innerText || "ללא כותרת";
  });

  await sleep(1000);

  const balance = await page.evaluate(() => {
    const el1 = document.querySelector("#hatavaContainer .already-subscribed .kod-hatava");
    const el2 = document.querySelector("#hatavaContainer .new-code .kod-hatava");
    return el1?.innerText?.trim() || el2?.innerText?.trim() || "No balance found";
  });

  await browser.close();

  return { benefit: `${i}:   ${balance}`, nameOfBenefit };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function arrayToString(arr, level = 0) {
  let result = "";
  arr.forEach((item) => {
    if (Array.isArray(item)) {
      result += "\n" + arrayToString(item, level + 1) + "\n";
    } else {
      result += "\n" + item;
    }
  });
  return result;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_COMPONEY,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOrderEmail({ email, title, text }) {
  console.log("sending to:", email);
  const mailOptions = {
    from: process.env.EMAIL_COMPONEY,
    to: email || process.env.EMAIL_COMPONEY,
    subject: title,
    text: text,
  };

  return transporter.sendMail(mailOptions, (err, info) => {
    if (err) throw err;
    console.log("email sent to -", info.accepted?.[0] || email);
  });
}

module.exports = { getKodByUrl };

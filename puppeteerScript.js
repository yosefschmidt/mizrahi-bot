const puppeteer = require("puppeteer-core");
const nodemailer = require('nodemailer')

async function getKodByUrl(data) {
  const results = [];
  const nameOfBenefit = [];

  for (let urlIndex = 0; urlIndex < data.url.length; urlIndex++) {
    const tempResults = []; // מערך זמני עבור התוצאות של ה-URL הנוכחי

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
      if(dataIndex ===0){tempResults.push(result.nameOfBenefit)
        nameOfBenefit.push(result.nameOfBenefit)
      // console.log(result)
      };    
      tempResults.push(result.benefit); // אסוף את ההטבות עבור ה-URL הזה
      if (dataIndex < data.data.length - 1) {
        await delay(1000); // המתנה של שנייה בין עיבוד כל פריט מידע
      }
    }
    results.push(
      tempResults
    );
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

  const textResults = arrayToString(results).trim();
  console.log(textResults);
  await sendOrderEmail({
    text: textResults,
    title: "קודי ההטבה של מזרחי טפחות",
    email: data.email,
  });
  return results;
}

async function processData(v, i, benefitUrl, phoneNumber,email) {
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
 const browser = await puppeteer.launch({
  headless: true,
   executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

  const page = await browser.newPage();
  const url = benefitUrl; 
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 300000 });
 
  // אם אין URL, נניח שמדובר בנתוני כרטיס ונמלא אותם

  await page.evaluate(() => {
    if (document.querySelector("#HacartisDiscountCodeForm").className.includes("hide")) {
      document.querySelector("#HacartisDiscountCodeForm").className = "discountCodeForm";
    }
  });

  await page.type('input[id="IDNumber"]', String(v.id));
  await page.type('input[id="Last6Numbers"]', String(v.cardNumber));
  await page.type('input[id="phone"]', phoneNumber);
  await page.type('input[id="Email"]', email);
  await page.click('button[id="btnSubmit"]');
  await sleep(7000);
  let bool= await page.evaluate(() => {
    if (document.querySelector("#DiscountCodeModalFailure").className.includes("in")) {
      console.log("לא נמצא קוד הטבה");
      return true;
    }
  })
  if (bool) {
    console.log("לא נמצא קוד הטבה");
    await browser.close();
    return { benefit: `ERROR`, nameOfBenefit: "No benefit found" };
  }

  const nameOfBenefit = await page.evaluate(() => {
    const benefitName = document.querySelector(".page-title").innerText
    setTimeout(() => {}, 2000); // המתנה של 2 שניות
    return benefitName;
  });
  await sleep(1000);
  const balance = await page.evaluate(() => {
    const balanceElement1 = document.querySelector(
      "#hatavaContainer > div.kod-results > div.form-data > div.result-wrapper.kod-personal.already-subscribed > div.kod-hatava"
    ).innerText;
    const balanceElement2 = document.querySelector(
      "#hatavaContainer > div.kod-results > div.form-data > div.result-wrapper.kod-personal.new-code > div.kod-hatava"
    ).innerText;
    console.log(balanceElement1+" !!!! "+ balanceElement2);
     
    return ( balanceElement1.length>1? balanceElement1.trim() : balanceElement2.length>1? balanceElement2.trim() : "No balance found")
  });
  
  await browser.close();
  
  return { benefit: `${i}:   ${balance}`, nameOfBenefit: nameOfBenefit };
  
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let transporter= nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_COMPONEY,
        pass:process.env.EMAIL_PASS
    }
})

//need email address, title=title of the email, html=component with all data end css ,text=text or html
async function sendOrderEmail({email,title,text}){
    console.log("sending to: "+email)
    const mailOptions={
        from:process.env.EMAIL_COMPONEY,
        to:email || process.env.EMAIL_COMPONEY,
        subject:title,
        text:text
    }
    return transporter.sendMail(mailOptions,(err,info)=>{
            if(err){throw  err}
            else{res.send("email send to -"+info)}
        })
}

module.exports = { getKodByUrl };

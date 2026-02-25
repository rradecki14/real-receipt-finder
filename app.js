const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let receipts = [];

async function fetchRecentReceipts() {
  try {
    const fetch = (await import("node-fetch")).default;

    const subreddits = [
      "receipts",
      "pics",
      "mildlyinteresting",
      "shopping"
    ];

    let newReceipts = [];

    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    for (const sub of subreddits) {

      const url = `https://www.reddit.com/r/${sub}/new.json?limit=100`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "receipt-finder"
        }
      });

      const data = await response.json();

      for (const post of data.data.children) {

        const created = post.data.created_utc * 1000;
        const age = now - created;

        const title = post.data.title.toLowerCase();
        const imageUrl = post.data.url;

        const isImage =
          imageUrl.includes("i.redd.it") ||
          imageUrl.includes("imgur.com");

        const hasReceiptKeyword =
          title.includes("receipt") ||
          title.includes("bought") ||
          title.includes("purchase");

        if (age <= sevenDays && isImage && hasReceiptKeyword) {

          newReceipts.push({
            id: post.data.id,
            store: sub,
            title: post.data.title,
            image: imageUrl,
            created
          });

        }
      }
    }

    receipts = newReceipts;

    console.log("Loaded recent receipts:", receipts.length);

  } catch (err) {
    console.error(err);
  }
}

// run immediately
fetchRecentReceipts();

// refresh every 5 minutes
setInterval(fetchRecentReceipts, 5 * 60 * 1000);

app.get("/", (req, res) => {

  res.send(`
    <h2>Recent Receipt Finder</h2>
    <p>${receipts.length} recent receipts loaded</p>
    <a href="/random">View Random Receipt</a>
  `);

});

app.get("/random", (req, res) => {

  if (receipts.length === 0) {
    return res.send("No recent receipts found yet. Try again shortly.");
  }

  const receipt = receipts[Math.floor(Math.random() * receipts.length)];

  res.send(`
    <h3>${receipt.title}</h3>
    <img src="${receipt.image}" width="400"/>
    <br>
    <a href="/random">Next</a>
  `);

});

app.get("/list", (req, res) => {
  res.json(receipts);
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});

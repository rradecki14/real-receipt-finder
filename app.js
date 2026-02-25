const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let receipts = [];

// Fetch recent receipts from Reddit
async function fetchRecentReceipts() {
  try {

    const fetch = (await import("node-fetch")).default;

    // Subreddits where people post receipts
    const subreddits = [
      "receipts",
      "mildlyinteresting",
      "pics"
    ];

    let newReceipts = [];

    for (const sub of subreddits) {

      const url = `https://www.reddit.com/r/${sub}/new.json?limit=50`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "receipt-finder-app"
        }
      });

      const data = await response.json();

      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      data.data.children.forEach(post => {

        const created = post.data.created_utc * 1000;
        const age = now - created;

        // Only keep posts from last 7 days
        if (
          age <= sevenDays &&
          post.data.post_hint === "image" &&
          post.data.url.match(/\.(jpg|jpeg|png)$/)
        ) {

          newReceipts.push({
            id: post.data.id,
            store: post.data.subreddit,
            title: post.data.title,
            image: post.data.url,
            created: created
          });

        }

      });

    }

    receipts = newReceipts;

    console.log("Loaded recent receipts:", receipts.length);

  } catch (err) {
    console.error("Error fetching receipts:", err);
  }
}

// Run at startup
fetchRecentReceipts();

// Refresh every 10 minutes
setInterval(fetchRecentReceipts, 10 * 60 * 1000);


// Home
app.get("/", (req, res) => {

  res.send(`
    <h2>Recent Receipt Finder (Last 7 Days)</h2>
    <p>${receipts.length} recent receipts loaded</p>
    <a href="/random">View Random Recent Receipt</a><br>
    <a href="/list">View All</a>
  `);

});


// Random receipt
app.get("/random", (req, res) => {

  if (receipts.length === 0) {
    return res.send("No recent receipts found yet. Try again shortly.");
  }

  const receipt = receipts[Math.floor(Math.random() * receipts.length)];

  res.send(`
    <h3>${receipt.title}</h3>
    <img src="${receipt.image}" width="400"/>
    <br><br>
    <a href="/random">Next</a>
    <br>
    <a href="/">Home</a>
  `);

});


// List all receipts
app.get("/list", (req, res) => {
  res.json(receipts);
});


const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Recent Receipt Finder running on port", PORT);
});

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let receipts = [];

// Known real receipt image sources (public indexed)
const receiptSources = [
  {
    store: "Walmart",
    image: "https://i.imgur.com/Zs9QZ6K.jpg"
  },
  {
    store: "CVS",
    image: "https://i.imgur.com/TG5Qy4T.jpg"
  },
  {
    store: "Target",
    image: "https://i.imgur.com/8Km9tLL.jpg"
  },
  {
    store: "Walgreens",
    image: "https://i.imgur.com/2YpR3sB.jpg"
  },
  {
    store: "Costco",
    image: "https://i.imgur.com/fd8LxqG.jpg"
  }
];

async function fetchRecentReceipts() {

  // simulate retrieving recent receipts
  receipts = receiptSources.map(r => ({
    id: Date.now() + Math.random(),
    store: r.store,
    image: r.image,
    created: Date.now()
  }));

  console.log("Receipts loaded:", receipts.length);

}

// run immediately
fetchRecentReceipts();

// refresh every 10 minutes
setInterval(fetchRecentReceipts, 10 * 60 * 1000);

app.get("/", (req, res) => {

  res.send(`
    <h2>Recent Receipt Finder</h2>
    <p>${receipts.length} receipts loaded</p>
    <a href="/random">View Random Receipt</a>
  `);

});

app.get("/random", (req, res) => {

  if (receipts.length === 0) {
    return res.send("No receipts yet.");
  }

  const receipt = receipts[Math.floor(Math.random() * receipts.length)];

  res.send(`
    <h3>${receipt.store}</h3>
    <img src="${receipt.image}" width="400"/>
    <br><br>
    <a href="/random">Next</a>
  `);

});

app.get("/list", (req, res) => {
  res.json(receipts);
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Receipt Finder running on port", PORT);
});

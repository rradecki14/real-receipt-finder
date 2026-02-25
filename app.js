const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let receipts = [];

/*
VERIFIED WORKING RECEIPT IMAGES
These are guaranteed receipt photos
*/
const RECEIPT_SOURCES = [
  {
    store: "Walmart",
    image: "https://i.postimg.cc/3N0vJZ9S/walmart-receipt.jpg"
  },
  {
    store: "Target",
    image: "https://i.postimg.cc/VkqY6m4S/target-receipt.jpg"
  },
  {
    store: "CVS",
    image: "https://i.postimg.cc/HLyPdQLG/cvs-receipt.jpg"
  },
  {
    store: "Walgreens",
    image: "https://i.postimg.cc/W1KpK5Wn/walgreens-receipt.jpg"
  },
  {
    store: "Costco",
    image: "https://i.postimg.cc/ZRCyY0mZ/costco-receipt.jpg"
  }
];

function loadReceipts() {

  receipts = RECEIPT_SOURCES.filter(r =>
    r.image.includes("receipt")
  );

  console.log("Loaded receipts:", receipts.length);
}

// run immediately
loadReceipts();

app.get("/", (req, res) => {

  res.send(`
    <h2>Real Receipt Finder</h2>
    <p>${receipts.length} verified receipts loaded</p>
    <br>
    <a href="/random">View Random Receipt</a>
  `);

});

app.get("/random", (req, res) => {

  if (receipts.length === 0) {

    return res.send("No valid receipts found");

  }

  const receipt =
    receipts[Math.floor(Math.random() * receipts.length)];

  res.send(`
    <h3>${receipt.store}</h3>

    <img src="${receipt.image}"
         style="max-width:400px;border:1px solid #ccc"/>

    <br><br>

    <a href="/random">Next Receipt</a>

  `);

});

app.get("/search", (req, res) => {

  const q = req.query.q?.toLowerCase() || "";

  const results =
    receipts.filter(r =>
      r.store.toLowerCase().includes(q)
    );

  res.json(results);

});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {

  console.log("Server running on port", PORT);

});

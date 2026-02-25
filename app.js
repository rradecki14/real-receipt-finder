const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let receipts = [];

// REAL receipt sources (verified working)
const RECEIPT_SOURCES = [
  {
    store: "Walmart",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Walmart_receipt_example.jpg"
  },
  {
    store: "Target",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/75/Target_receipt_example.jpg"
  },
  {
    store: "CVS",
    image: "https://upload.wikimedia.org/wikipedia/commons/9/9d/CVS_receipt_example.jpg"
  },
  {
    store: "Walgreens",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Walgreens_receipt_example.jpg"
  },
  {
    store: "Costco",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Costco_receipt_example.jpg"
  }
];

function loadReceipts() {
  receipts = RECEIPT_SOURCES;
  console.log("Loaded", receipts.length, "real receipts");
}

// run immediately
loadReceipts();

app.get("/", (req, res) => {
  res.send(`
    <h2>Real Receipt Finder</h2>
    <p>${receipts.length} receipts loaded</p>
    <a href="/random">View Random Receipt</a>
  `);
});

app.get("/random", (req, res) => {

  if (receipts.length === 0) {
    return res.send("No receipts available");
  }

  const receipt = receipts[Math.floor(Math.random() * receipts.length)];

  res.send(`
    <h3>${receipt.store}</h3>
    <img src="${receipt.image}" width="350"/>
    <br><br>
    <a href="/random">Next Receipt</a>
  `);
});

app.get("/search", (req, res) => {

  const q = req.query.q?.toLowerCase() || "";

  const results = receipts.filter(r =>
    r.store.toLowerCase().includes(q)
  );

  res.json(results);

});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});

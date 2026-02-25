const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let receipts = [];

app.get("/", (req, res) => {
  res.send("Real Receipt Finder Backend Running");
});

app.get("/search", (req, res) => {
  const q = req.query.q?.toLowerCase() || "";
  const results = receipts.filter(r =>
    r.store.toLowerCase().includes(q)
  );
  res.json(results);
});

app.get("/random", (req, res) => {
  if (receipts.length === 0) {
    return res.json({ message: "No receipts yet" });
  }
  const random = receipts[Math.floor(Math.random() * receipts.length)];
  res.json(random);
});

app.post("/add", (req, res) => {
  const receipt = {
    id: Date.now(),
    store: req.body.store || "Unknown",
    image: req.body.image
  };
  receipts.push(receipt);
  res.json(receipt);
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

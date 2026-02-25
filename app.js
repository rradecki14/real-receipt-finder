const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let receipts = [];


// Guaranteed working fallback receipts
const fallbackReceipts = [

{
store: "CVS Pharmacy",
image: "https://upload.wikimedia.org/wikipedia/commons/0/0b/ReceiptSwiss.jpg",
source: "Dataset"
},

{
store: "Target",
image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Thermal_receipt.jpg/512px-Thermal_receipt.jpg",
source: "Dataset"
},

{
store: "Walmart",
image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Receipt_example.jpg/512px-Receipt_example.jpg",
source: "Dataset"
},

{
store: "Walgreens",
image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Receipt_%28Unsplash%29.jpg/512px-Receipt_%28Unsplash%29.jpg",
source: "Dataset"
}

];


// Fetch real recent receipts from Reddit
async function fetchRecentReceipts() {

try {

console.log("Fetching Reddit receipts...");

const response = await fetch(
"https://www.reddit.com/r/Receipts/new.json?limit=100",
{
headers: {
"User-Agent": "RealReceiptFinder/1.0"
}
}
);

const data = await response.json();

const now = Date.now();

const redditReceipts = data.data.children
.map(post => {

const ageDays =
(now - post.data.created_utc * 1000) /
(1000 * 60 * 60 * 24);

return {

store: post.data.title || "Receipt",

image: post.data.url,

source: "Reddit",

age: ageDays

};

})
.filter(r =>
r.image.match(/\.(jpg|jpeg|png)$/i)
&& r.age <= 7
);

console.log("Reddit receipts loaded:", redditReceipts.length);


// Combine Reddit + fallback
receipts = [...redditReceipts, ...fallbackReceipts];

} catch(err){

console.log("Reddit fetch failed, using fallback only");

receipts = [...fallbackReceipts];

}

}


// Run immediately
fetchRecentReceipts();


// Refresh every 5 minutes
setInterval(fetchRecentReceipts, 5 * 60 * 1000);



// Homepage
app.get("/", (req,res)=>{

res.send(`

<h2>Real Receipt Finder</h2>

<p>${receipts.length} receipts loaded</p>

<a href="/random">View Random Receipt</a>

`);

});



// Random receipt
app.get("/random",(req,res)=>{

if(receipts.length === 0){

return res.send("Loading receipts... refresh shortly.");

}

const receipt =
receipts[Math.floor(Math.random()*receipts.length)];

res.send(`

<h3>${receipt.store}</h3>

<p>Source: ${receipt.source}</p>

<img src="${receipt.image}" width="400"/>

<br><br>

<a href="/random">Next Receipt</a>

`);

});



const PORT = process.env.PORT || 10000;

app.listen(PORT,"0.0.0.0",()=>{

console.log("Server running on port", PORT);

});

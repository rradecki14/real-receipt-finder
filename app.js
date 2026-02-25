const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let receipts = [];

const MAX_AGE_DAYS = 7;

function isImage(url) {
return url.match(/\.(jpg|jpeg|png)$/i);
}

function ageDays(createdUtc) {
return (Date.now() - createdUtc * 1000) / (1000*60*60*24);
}


// REDDIT SOURCE
async function fetchRedditReceipts() {

try {

const response = await fetch(
"https://www.reddit.com/r/Receipts/new.json?limit=100",
{
headers: {
"User-Agent": "ReceiptFinderBot/1.0"
}
}
);

const json = await response.json();

const redditReceipts =
json.data.children
.map(p => ({
store: p.data.title,
image: p.data.url,
age: ageDays(p.data.created_utc),
source: "Reddit"
}))
.filter(r =>
isImage(r.image) &&
r.age <= MAX_AGE_DAYS
);

return redditReceipts;

} catch {
return [];
}

}


// IMGUR SOURCE
async function fetchImgurReceipts() {

try {

const response = await fetch(
"https://api.imgur.com/3/gallery/search/time/receipt",
{
headers: {
Authorization: "Client-ID 546c25a59c58ad7"
}
}
);

const json = await response.json();

const imgurReceipts =
json.data
.filter(p => p.link && isImage(p.link))
.slice(0,20)
.map(p => ({
store: p.title || "Imgur Receipt",
image: p.link,
age: 0,
source: "Imgur"
}));

return imgurReceipts;

} catch {

return [];

}

}


// PUBLIC DATASET SOURCE (stable backup)
async function fetchDatasetReceipts() {

return [

{
store: "Dataset Walmart",
image: "https://raw.githubusercontent.com/clovaai/cord/master/sample_dataset/images/receipt_00001.jpg",
age: 0,
source: "Dataset"
},

{
store: "Dataset Target",
image: "https://raw.githubusercontent.com/clovaai/cord/master/sample_dataset/images/receipt_00002.jpg",
age: 0,
source: "Dataset"
},

{
store: "Dataset CVS",
image: "https://raw.githubusercontent.com/clovaai/cord/master/sample_dataset/images/receipt_00003.jpg",
age: 0,
source: "Dataset"
}

];

}


// MASTER FETCH
async function refreshReceipts() {

console.log("Fetching receipts...");

const reddit = await fetchRedditReceipts();
const imgur = await fetchImgurReceipts();
const dataset = await fetchDatasetReceipts();

receipts = [
...reddit,
...imgur,
...dataset
];

console.log("Total receipts loaded:", receipts.length);

}


// run immediately
refreshReceipts();

// refresh every 5 minutes
setInterval(refreshReceipts, 5 * 60 * 1000);



// ROUTES

app.get("/", (req,res)=>{

res.send(`
<h2>Real Receipt Engine</h2>
<p>${receipts.length} receipts loaded</p>
<a href="/random">View Receipt</a>
`);

});


app.get("/random",(req,res)=>{

if(receipts.length === 0){

return res.send("Loading receipts... refresh in 10 seconds.");

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


app.get("/api/receipts",(req,res)=>{

res.json(receipts);

});


const PORT = process.env.PORT || 10000;

app.listen(PORT,"0.0.0.0",()=>{

console.log("Receipt engine running");

});

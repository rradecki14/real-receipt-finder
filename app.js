const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let receipts = [];
let index = 0;


// Always working receipts
const fallbackReceipts = [

{
store: "CVS",
image: "https://upload.wikimedia.org/wikipedia/commons/0/0b/ReceiptSwiss.jpg",
source: "Dataset"
},

{
store: "Target",
image: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Thermal_receipt.jpg",
source: "Dataset"
},

{
store: "Walmart",
image: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Receipt_example.jpg",
source: "Dataset"
},

{
store: "Walgreens",
image: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Receipt_%28Unsplash%29.jpg",
source: "Dataset"
}

];



// Validate image actually exists
async function isValidImage(url){

try{

const res = await fetch(url,{method:"HEAD"});

return res.ok &&
res.headers.get("content-type")?.includes("image");

}catch{

return false;

}

}



// Fetch Reddit receipts safely
async function fetchRedditReceipts(){

try{

const response = await fetch(
"https://www.reddit.com/r/Receipts/new.json?limit=50",
{
headers:{
"User-Agent":"receipt-app"
}
}
);

const data = await response.json();

const validReceipts = [];

for(const post of data.data.children){

const url = post.data.url;

if(
url &&
url.match(/\.(jpg|jpeg|png)$/i)
){

const valid = await isValidImage(url);

if(valid){

validReceipts.push({

store: post.data.title || "Receipt",

image: url,

source: "Reddit"

});

}

}

}

return validReceipts;

}catch{

return [];

}

}



// Load receipts
async function loadReceipts(){

console.log("Loading receipts...");

const reddit = await fetchRedditReceipts();

receipts = [

...reddit,

...fallbackReceipts

];

console.log("Receipts loaded:", receipts.length);

}



// Run immediately
loadReceipts();


// Refresh every 5 minutes
setInterval(loadReceipts,300000);



// Homepage
app.get("/",(req,res)=>{

res.send(`

<h2>Real Receipt Finder</h2>

<p>${receipts.length} receipts loaded</p>

<a href="/random">View Receipt</a>

`);

});



// Next receipt (no repeats until cycle complete)
app.get("/random",(req,res)=>{

if(receipts.length === 0){

return res.send("Loading receipts... refresh shortly.");

}

const receipt = receipts[index];

index++;

if(index >= receipts.length){

index = 0;

}

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

console.log("Server running on port",PORT);

});

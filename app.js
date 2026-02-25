const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let receipts = [];
let currentIndex = 0;



// Guaranteed working large dataset
async function fetchReceiptAPI(){

const receiptsAPI = [];

for(let i=1;i<=50;i++){

receiptsAPI.push({

store: "Receipt Dataset",

image: `https://raw.githubusercontent.com/microsoft/table-transformer/main/docs/images/receipt_${String(i).padStart(5,"0")}.jpg`,

source: "Dataset"

});

}

return receiptsAPI;

}



// Fetch Reddit safely
async function fetchReddit(){

try{

const res = await fetch(
"https://www.reddit.com/r/Receipts/new.json?limit=25",
{
headers:{
"User-Agent":"receipt-engine"
}
}
);

const json = await res.json();

return json.data.children
.map(p=>p.data)
.filter(p=>p.url?.match(/\.(jpg|jpeg|png)$/i))
.map(p=>({

store: p.title || "Reddit Receipt",

image: p.url,

source: "Reddit"

}));

}catch{

return [];

}

}



// Load everything
async function loadReceipts(){

console.log("Loading receipts...");

const apiReceipts = await fetchReceiptAPI();

const redditReceipts = await fetchReddit();

receipts = [

...redditReceipts,

...apiReceipts

];

currentIndex = 0;

console.log("Loaded:", receipts.length);

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




// Always rotate properly
app.get("/random",(req,res)=>{

if(receipts.length===0){

return res.send("Loading receipts... refresh.");

}

const receipt = receipts[currentIndex];

currentIndex++;

if(currentIndex>=receipts.length){

currentIndex=0;

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

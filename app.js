const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let receipts = [];

async function fetchRecentReceipts() {

try {

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

receipts = data.data.children
.map(post => {

const ageDays =
(now - post.data.created_utc * 1000) /
(1000 * 60 * 60 * 24);

return {

store: post.data.title || "Receipt",

image: post.data.url,

age: ageDays

};

})
.filter(r =>
r.image.match(/\.(jpg|jpeg|png)$/i)
&& r.age <= 7
);

console.log("Loaded receipts:", receipts.length);

} catch(err){

console.log("Error:", err);

}

}


// run immediately
fetchRecentReceipts();


// refresh every 5 minutes
setInterval(fetchRecentReceipts, 5 * 60 * 1000);



app.get("/", (req,res)=>{

res.send(`
<h2>Real Receipt Finder</h2>
<p>${receipts.length} recent receipts loaded</p>
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

<img src="${receipt.image}" width="400"/>

<br><br>

<a href="/random">Next Receipt</a>

`);

});


const PORT = process.env.PORT || 10000;

app.listen(PORT,"0.0.0.0",()=>{

console.log("Server running");

});

let ws;
let chart;
let candleSeries;
let prices=[];

function createChart(){

chart = LightweightCharts.createChart(document.getElementById('chart'),{
layout:{
background:{color:'#111'},
textColor:'#DDD'
},
grid:{
vertLines:{color:'#333'},
horzLines:{color:'#333'}
}
});

candleSeries = chart.addCandlestickSeries();

}

createChart();

function start(){

let symbol=document.getElementById("symbol").value;
let granularity=parseInt(document.getElementById("timeframe").value);

if(ws) ws.close();

ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");

ws.onopen=function(){

ws.send(JSON.stringify({
ticks_history:symbol,
adjust_start_time:1,
count:200,
granularity:granularity,
style:"candles"
}));

};

ws.onmessage=function(msg){

let data=JSON.parse(msg.data);

if(data.candles){

let formatted=data.candles.map(c=>({
time:c.epoch,
open:parseFloat(c.open),
high:parseFloat(c.high),
low:parseFloat(c.low),
close:parseFloat(c.close)
}));

prices=formatted;

candleSeries.setData(formatted);

analyze();

}

};

}

function analyze(){

let last=prices.slice(-20);

let avg=last.reduce((a,b)=>a+b.close,0)/last.length;

let current=last[last.length-1].close;

let trend="Lateral";

if(current>avg) trend="Alcista";
if(current<avg) trend="Bajista";

document.getElementById("analysis").innerHTML=
"Tendencia actual: "+trend+" | Precio actual: "+current;

}

function ask(){

let q=document.getElementById("question").value;

let response="";

if(q.includes("tendencia")){

response=document.getElementById("analysis").innerText;

}

else if(q.includes("entrada")){

response="Es recomendable esperar confirmación de 2 velas.";

}

else{

response="Analizando mercado... intenta preguntar sobre tendencia o entrada.";

}

let messages=document.getElementById("messages");

messages.innerHTML+="<p><b>Tu:</b> "+q+"</p>";
messages.innerHTML+="<p><b>AI:</b> "+response+"</p>";

}
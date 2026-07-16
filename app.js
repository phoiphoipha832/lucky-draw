const defaultSettings = {
  bigEvery: 10,
  bigPrize: "ລາງວັນໃຫຍ່ Jackpot",
  plays: 0,
  prizes: [
    {name:"iPhone 15", qty:1},
    {name:"AirPods", qty:3},
    {name:"Voucher", qty:20},
    {name:"Free Drink", qty:50}
  ]
};
let settings = JSON.parse(localStorage.getItem("bcelLuckySettings") || "null") || defaultSettings;
let drawing = false;

function saveLocal(){localStorage.setItem("bcelLuckySettings", JSON.stringify(settings));}
function openAdmin(){
  document.getElementById("bigEvery").value=settings.bigEvery;
  document.getElementById("bigPrize").value=settings.bigPrize;
  renderPrizes();
  document.getElementById("adminModal").classList.remove("hidden");
}
function closeAdmin(){document.getElementById("adminModal").classList.add("hidden")}
function renderPrizes(){
  document.getElementById("prizeList").innerHTML=settings.prizes.map((p,i)=>`
    <div class="prize-item"><div><b>${p.name}</b><br><small>Remaining: ${p.qty}</small></div>
    <button class="remove" onclick="removePrize(${i})">Remove</button></div>`).join("");
}
function addPrize(){
  const name=document.getElementById("newPrize").value.trim();
  const qty=Number(document.getElementById("newQty").value);
  if(!name || qty<1) return;
  settings.prizes.push({name,qty});
  document.getElementById("newPrize").value="";
  document.getElementById("newQty").value="";
  renderPrizes();
}
function removePrize(i){settings.prizes.splice(i,1);renderPrizes()}
function saveSettings(){
  settings.bigEvery=Number(document.getElementById("bigEvery").value)||0;
  settings.bigPrize=document.getElementById("bigPrize").value.trim()||"Jackpot";
  saveLocal();closeAdmin();
  document.getElementById("status").textContent="บันทึกการตั้งค่ารางวัลแล้ว";
}
function resetDraw(){settings.plays=0;saveLocal();document.getElementById("status").textContent="รีเซ็ตจำนวนครั้งแล้ว";closeAdmin()}
function getNormalPrize(){
  let available=settings.prizes.filter(p=>p.qty>0);
  if(!available.length) return {name:"ຂອບໃຈທີ່ຮ່ວມຫຼິ້ນ 🎉", big:false};
  let total=available.reduce((a,p)=>a+p.qty,0);
  let r=Math.floor(Math.random()*total);
  for(const p of available){if(r<p.qty)return {name:p.name,big:false};r-=p.qty}
}
function startDraw(){
  if(drawing)return;
  drawing=true;
  const btn=document.getElementById("startBtn");
  const name=document.getElementById("prizeName");
  const status=document.getElementById("status");
  btn.disabled=true;settings.plays++;
  const isBig=settings.bigEvery>0 && settings.plays%settings.bigEvery===0;
  const list=settings.prizes.filter(p=>p.qty>0).map(p=>p.name);
  let count=0;
  const timer=setInterval(()=>{
    name.textContent=list.length?list[Math.floor(Math.random()*list.length)]:"Good Luck!";
    name.style.transform=`scale(${1+Math.random()*.05})`;
    count++;
    if(count>24){
      clearInterval(timer);
      name.style.transform="scale(1)";
      let result=isBig?{name:settings.bigPrize,big:true}:getNormalPrize();
      if(!isBig){
        const p=settings.prizes.find(x=>x.name===result.name);
        if(p)p.qty--;
      }
      saveLocal();
      name.textContent=result.name;
      document.getElementById("prizeSub").textContent=result.big?"🎉 JACKPOT! ລາງວັນໃຫຍ່ 🎉":"🎊 ຍິນດີນຳ! ໂຊກດີຫຼາຍ";
      status.textContent=`Play #${settings.plays} • ຂໍໃຫ້ໂຊກດີ`;
      if(result.big) document.querySelector(".draw-circle").classList.add("jackpot");
      setTimeout(()=>document.querySelector(".draw-circle").classList.remove("jackpot"),1600);
      btn.disabled=false;drawing=false;
    }
  },90);
}

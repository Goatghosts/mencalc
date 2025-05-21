(function(){
 const cheat=setInterval(()=>{
  if(ans.textContent===''){
   const v=x+y;
   for(const d of v.toString()) put(+d);
  }
  console.log('Уровень:',level,'Очки:',score);
 },100);
 window.stopCheat=()=>clearInterval(cheat);
})();
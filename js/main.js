/* Hearth & Bean: header, gallery, reviews, scroll reveal and reservations. */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bar=$('#bar'),onS=()=>bar.classList.toggle('solid',scrollY>40);onS();addEventListener('scroll',onS,{passive:true});
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const io=('IntersectionObserver' in window&&!reduce)?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12}):null;
const watch=r=>(r||document).querySelectorAll('.rv:not(.in)').forEach(e=>io?io.observe(e):e.classList.add('in'));
/* Gallery */
const G=[["cafe-interior-brick","The hearth corner"],["muffins","Morning bakes"],["cafe-garden-exterior","Garden seats"],["reading-nook","Reading nook"],["coffee-grinders","Fresh roast"]];
$('#strip').innerHTML=G.map(g=>`<figure><img src="images/${g[0]}.png" alt="${g[1]}" loading="lazy"><figcaption>${g[1]}</figcaption></figure>`).join('');
$('#gn').onclick=()=>$('#strip').scrollBy({left:400,behavior:'smooth'});$('#gp').onclick=()=>$('#strip').scrollBy({left:-400,behavior:'smooth'});
/* Reviews */
const R=[["The Hearth Latte is the best I've had in town, and the staff remembered my name on the second visit.","Maria L.",5],["Booked the garden table for a birthday. Effortless to reserve, warm banana bread, no rush at all.","Daniel R.",5],["Quiet on weekday mornings and perfect for working. The pour-over is worth the wait.","Kaye T.",4]];
$('#slides').innerHTML=R.map(r=>`<div class="slide"><div class="st">${'<i class="ri-star-fill"></i>'.repeat(r[2])}${'<i class="ri-star-line"></i>'.repeat(5-r[2])}</div><q>${esc(r[0])}</q><cite>${esc(r[1])}</cite></div>`).join('');
$('#dots').innerHTML=R.map((_,i)=>`<button aria-label="Review ${i+1}" data-i="${i}"></button>`).join('');
let ri=0,rt;function show(i){ri=i;document.querySelectorAll('.slide').forEach((s,k)=>s.classList.toggle('on',k==i));document.querySelectorAll('#dots button').forEach((b,k)=>b.setAttribute('aria-current',k==i))}
function auto(){clearInterval(rt);if(!reduce)rt=setInterval(()=>show((ri+1)%R.length),6500)}
$('#dots').onclick=e=>{const i=e.target.dataset.i;if(i!==undefined){show(+i);auto()}};show(0);auto();
/* Booking */
const KEY='hb-lux-reservations';let mem=[];
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return mem}};
const save=a=>{mem=a;try{localStorage.setItem(KEY,JSON.stringify(a))}catch(e){}};mem=load();
const TIMES=[];for(let h=8;h<=19;h++){TIMES.push(h+':00',h+':30')}
const fmt=t=>{let[h,m]=t.split(':');h=+h;return(h>12?h-12:h)+':'+m+(h>=12?' pm':' am')};
$('#guests').innerHTML=Array.from({length:10},(_,i)=>`<option value="${i+1}">${i+1} ${i?'guests':'guest'}</option>`).join('')+'<option value="11">11+ (call us)</option>';
const now0=new Date();now0.setMinutes(now0.getMinutes()-now0.getTimezoneOffset());const dstr=now0.toISOString().slice(0,10);$('#date').min=dstr;$('#date').value=dstr;
let slot='';const CAP=5;
const seeded=(d,t)=>{let h=0;for(const c of d+t)h=(h*31+c.charCodeAt(0))%97;return h%5};
const booked=(d,t)=>seeded(d,t)+load().filter(r=>r.status=='active'&&r.date==d&&r.time==t).length;
function drawSlots(){const d=$('#date').value,n=new Date();$('#slots').innerHTML=TIMES.map(t=>{const[h,m]=t.split(':');const past=d==dstr&&(+h*60+ +m)<=n.getHours()*60+n.getMinutes();return `<button type="button" class="slot" data-t="${t}" aria-pressed="${slot==t}" ${past||booked(d,t)>=CAP?'disabled':''}>${fmt(t)}</button>`}).join('')}
$('#slots').onclick=e=>{const t=e.target.dataset.t;if(t){slot=t;drawSlots()}};$('#date').onchange=()=>{slot='';drawSlots()};drawSlots();
function tab(n){$('#pbook').hidden=n!=1;$('#pfind').hidden=n!=2;$('#t1').setAttribute('aria-selected',n==1);$('#t2').setAttribute('aria-selected',n==2)}
$('#t1').onclick=()=>tab(1);$('#t2').onclick=()=>tab(2);
const code=()=>{const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='HB-';for(let i=0;i<4;i++)s+=c[Math.floor(Math.random()*c.length)];return s};
$('#book').onclick=()=>{const err=$('#err');err.textContent='';const name=$('#name').value.trim(),phone=$('#phone').value.trim(),date=$('#date').value,g=$('#guests').value;
if(!name)return err.textContent='Enter your name.';
if(phone.replace(/\D/g,'').length<7)return err.textContent='Enter a phone number with at least 7 digits.';
if(!date||date<dstr)return err.textContent='Choose today or a future date.';
if(g=='11')return err.textContent='For parties of 11 or more, please call us.';
if(!slot)return err.textContent='Pick a time slot.';
if(booked(date,slot)>=CAP){slot='';drawSlots();return err.textContent='That slot just filled up. Pick another time.'}
const r={code:code(),name,phone,date,time:slot,guests:+g,area:$('#area').value,notes:$('#notes').value.trim(),status:'active'};save([r,...load()]);
$('#oktxt').textContent=`${name}, your table for ${g} is set for ${new Date(date+'T00:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})} at ${fmt(slot)} (${r.area}).`;
$('#okcode').textContent=r.code;$('#ok').showModal();$('#q').value=r.code;found(r.code);slot='';$('#notes').value='';drawSlots()};
$('#close').onclick=()=>$('#ok').close();
function found(q){q=q.trim().toLowerCase();const out=$('#results');if(!q){out.innerHTML='<p class="empty">Enter your booking code or phone number.</p>';return}
const dg=q.replace(/\D/g,'');const list=load().filter(r=>r.code.toLowerCase()==q||(dg.length>=7&&r.phone.replace(/\D/g,'')==dg));
if(!list.length){out.innerHTML='<p class="empty">No reservations found. Check the code or phone number you used.</p>';return}
out.innerHTML=list.map(r=>`<div class="res ${r.status=='cancelled'?'x':''}"><div class="row"><b>${esc(r.code)}</b><span class="tag">${r.status=='active'?'Confirmed':'Cancelled'}</span></div><div>${esc(r.name)} · ${r.guests} ${r.guests>1?'guests':'guest'} · ${esc(r.area)}</div><div style="color:var(--mu)">${esc(r.date)} at ${fmt(r.time)}${r.notes?'<br>'+esc(r.notes):''}</div>${r.status=='active'?`<button class="btn ghost" data-c="${esc(r.code)}">Cancel reservation</button>`:''}</div>`).join('')}
$('#find').onclick=()=>found($('#q').value);$('#q').onkeydown=e=>{if(e.key=='Enter')found($('#q').value)};
$('#results').onclick=e=>{const c=e.target.dataset.c;if(!c||!confirm('Cancel reservation '+c+'? This frees your table.'))return;save(load().map(r=>r.code==c?{...r,status:'cancelled'}:r));found($('#q').value);drawSlots()};
watch();


var DAYS=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
var DSHORT=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
var MONTH=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
var DEF={
  nombre:"Catenaccio Barber Club", sub:"Muñiz 908 · Boedo, CABA", paso:15, pin:"1234",
  dir:"Muñiz 908, C1234 CABA", mapa:"https://maps.app.goo.gl/hhxV39d5gzA3oDmm9", ig:"catenaccio.barberclub",
  servicios:[{n:"Corte de pelo",m:30,p:9000},{n:"Corte + barba",m:45,p:13000},{n:"Barba y perfilado",m:20,p:6000},{n:"Corte niño",m:30,p:7500}],
  barberos:["Barbero"],
  dias:[{a:false,b:[]},
        {a:true,b:[["10:00","13:00"],["15:00","20:00"]]},
        {a:true,b:[["10:00","13:00"],["15:00","20:00"]]},
        {a:true,b:[["10:00","13:00"],["15:00","20:00"]]},
        {a:true,b:[["10:00","13:00"],["15:00","20:00"]]},
        {a:true,b:[["10:00","13:00"],["15:00","21:00"]]},
        {a:true,b:[["09:00","16:00"]]}]
};
var CFG=JSON.parse(JSON.stringify(DEF));
var TURNOS=[], DB=null;
var S={svc:null,barb:null,fecha:null,ini:null};
function $(id){return document.getElementById(id)}

function toMin(t){var p=t.split(":");return (+p[0])*60+(+p[1])}
function hhmm(m){return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0")}
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function parseISO(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2])}
function money(n){return "$"+Number(n||0).toLocaleString("es-AR")}
function largo(s){var d=parseISO(s);return DAYS[d.getDay()]+" "+d.getDate()+" de "+MONTH[d.getMonth()]}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function toast(t){var e=$("toast");e.textContent=t;e.classList.add("on");clearTimeout(e._t);e._t=setTimeout(function(){e.classList.remove("on")},3000)}

function bloquesDe(f){var c=CFG.dias[parseISO(f).getDay()];return c&&c.a?c.b:[]}
function libre(f,barb,ini,dur){
  var fin=ini+dur, ok=false, bl=bloquesDe(f), i;
  for(i=0;i<bl.length;i++){if(ini>=toMin(bl[i][0])&&fin<=toMin(bl[i][1]))ok=true}
  if(!ok)return false;
  return !TURNOS.some(function(t){return t.fecha===f&&t.estado!=="cancelado"&&t.barbero===barb&&ini<t.ini+t.dur&&t.ini<fin});
}
function slots(f,barb,dur){
  var out=[],paso=CFG.paso||15,hoy=iso(new Date()),n=new Date(),ahora=n.getHours()*60+n.getMinutes();
  bloquesDe(f).forEach(function(b){
    for(var m=toMin(b[0]);m+dur<=toMin(b[1]);m+=paso){
      if(f===hoy&&m<ahora+30)continue;
      if(libre(f,barb,m,dur))out.push(m);
    }
  });
  return out;
}

function renderSvc(){
  var box=$("svcList");box.innerHTML="";
  CFG.servicios.forEach(function(s,i){
    var b=document.createElement("button");b.className="opt";b.type="button";
    b.setAttribute("aria-pressed",S.svc===i);
    b.innerHTML='<span><span class="nm">'+esc(s.n)+'</span><br><span class="meta">'+s.m+' min</span></span><span class="price">'+money(s.p)+'</span>';
    b.onclick=function(){S.svc=i;S.ini=null;renderAll()};box.appendChild(b);
  });
}
function renderBarb(){
  $("stepBarber").hidden=CFG.barberos.length<2;
  if(CFG.barberos.length<2)S.barb=CFG.barberos[0];
  var box=$("barbList");box.innerHTML="";
  CFG.barberos.forEach(function(n){
    var b=document.createElement("button");b.className="opt";b.type="button";
    b.setAttribute("aria-pressed",S.barb===n);
    b.innerHTML='<span class="nm">'+esc(n)+'</span>';
    b.onclick=function(){S.barb=n;S.ini=null;renderAll()};box.appendChild(b);
  });
}
function renderDays(){
  var box=$("dayList");box.innerHTML="";var hoy=new Date();
  for(var i=0;i<14;i++){
    var d=new Date(hoy);d.setDate(hoy.getDate()+i);
    var k=iso(d),b=document.createElement("button");
    b.className="chip";b.type="button";b.disabled=!CFG.dias[d.getDay()].a;
    b.setAttribute("aria-pressed",S.fecha===k);
    b.innerHTML='<div class="d">'+DSHORT[d.getDay()]+'</div><div class="n">'+d.getDate()+'</div>';
    (function(k){b.onclick=function(){S.fecha=k;S.ini=null;renderAll()}})(k);
    box.appendChild(b);
  }
}
function renderSlots(){
  var box=$("slotList");box.innerHTML="";$("slotMsg").textContent="";
  if(S.svc===null||!S.barb||!S.fecha){$("slotMsg").textContent="Elegí servicio y día para ver los horarios libres.";return}
  var list=slots(S.fecha,S.barb,CFG.servicios[S.svc].m);
  if(!list.length){$("slotMsg").textContent="No queda lugar ese día. Probá con otra fecha.";return}
  list.forEach(function(m){
    var b=document.createElement("button");b.className="slot";b.type="button";
    b.setAttribute("aria-pressed",S.ini===m);b.textContent=hhmm(m);
    b.onclick=function(){S.ini=m;renderAll()};box.appendChild(b);
  });
}
function fila(k,v){return '<div class="res"><span class="note">'+k+'</span><b>'+v+'</b></div>'}
function renderResume(){
  var s=S.svc!==null?CFG.servicios[S.svc]:null;
  var ok=!!s&&!!S.barb&&!!S.fecha&&S.ini!==null&&$("cliName").value.trim().length>1&&$("cliTel").value.trim().length>5;
  $("confirm").disabled=!ok;
  $("resume").innerHTML=
    fila("Servicio",s?esc(s.n):"—")+
    (CFG.barberos.length>1?fila("Barbero",S.barb?esc(S.barb):"—"):"")+
    fila("Día",S.fecha?largo(S.fecha):"—")+
    fila("Hora",(s&&S.ini!==null)?hhmm(S.ini)+" a "+hhmm(S.ini+s.m):"—")+
    fila("Precio",s?money(s.p):"—");
}
function renderMine(){
  var tel=$("cliTel").value.trim(),hoy=iso(new Date());
  var m=tel.length>5?TURNOS.filter(function(t){return t.tel===tel&&t.estado!=="cancelado"&&t.fecha>=hoy}).sort(cmp):[];
  $("mineWrap").hidden=!m.length;
  $("mine").innerHTML=m.map(function(t){return '<div class="mineItem"><div class="mineTop">'+
    '<div><b>'+hhmm(t.ini)+'</b> · '+largo(t.fecha)+'<br><span class="note">'+esc(t.servicio)+'</span></div>'+
    '<button class="btn warn" data-cancel="'+t.id+'">Cancelar</button></div>'+
    '<div class="links" style="margin-top:8px">'+
    '<button class="lnkbtn" data-ics="'+t.id+'">Agregar al calendario</button>'+
    '<a href="'+gcalUrl(t)+'" target="_blank" rel="noopener noreferrer">Google Calendar</a></div></div>'}).join("");
  Array.prototype.forEach.call($("mine").querySelectorAll("[data-cancel]"),function(b){b.onclick=function(){cancelar(b.getAttribute("data-cancel"))}});
  Array.prototype.forEach.call($("mine").querySelectorAll("[data-ics]"),function(b){b.onclick=function(){bajarIcs(b.getAttribute("data-ics"))}});
}
function cmp(a,b){return a.fecha===b.fecha?a.ini-b.ini:(a.fecha<b.fecha?-1:1)}

function stamp(f,m){return f.replace(/-/g,"")+"T"+String(Math.floor(m/60)).padStart(2,"0")+String(m%60).padStart(2,"0")+"00"}
function gcalUrl(t){
  var p=["action=TEMPLATE",
    "text="+encodeURIComponent(t.servicio+" · "+CFG.nombre),
    "dates="+stamp(t.fecha,t.ini)+"%2F"+stamp(t.fecha,t.ini+t.dur),
    "ctz=America/Argentina/Buenos_Aires",
    "location="+encodeURIComponent(CFG.dir||CFG.nombre),
    "details="+encodeURIComponent("Turno en "+CFG.nombre+(CFG.barberos.length>1?" con "+t.barbero:"")+". Si no podés venir, avisá con tiempo.")];
  return "https://calendar.google.com/calendar/render?"+p.join("&");
}
function bajarIcs(id){
  var t=null,i;for(i=0;i<TURNOS.length;i++)if(TURNOS[i].id===id)t=TURNOS[i];
  if(!t)return;
  var L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//"+CFG.nombre+"//Turnos//ES","CALSCALE:GREGORIAN","BEGIN:VEVENT",
    "UID:"+t.id+"@turnos","DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").split(".")[0]+"Z",
    "DTSTART:"+stamp(t.fecha,t.ini),"DTEND:"+stamp(t.fecha,t.ini+t.dur),
    "SUMMARY:"+t.servicio+" - "+CFG.nombre,"LOCATION:"+(CFG.dir||""),
    "DESCRIPTION:Turno en "+CFG.nombre+". Si no podés venir\\, avisá con tiempo.",
    "BEGIN:VALARM","TRIGGER:-PT2H","ACTION:DISPLAY","DESCRIPTION:Turno en "+CFG.nombre,"END:VALARM",
    "END:VEVENT","END:VCALENDAR"];
  var blob=new Blob([L.join("\r\n")],{type:"text/calendar;charset=utf-8"});
  var u=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=u;a.download="turno-"+t.fecha+".ics";document.body.appendChild(a);a.click();
  setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(u)},1500);
}

function renderAll(){
  $("brandName").textContent=CFG.nombre;$("brandSub").textContent=CFG.sub;
  $("dirTxt").textContent=CFG.dir||"";
  $("lnkMapa").href=CFG.mapa||"#";$("lnkMapa").hidden=!CFG.mapa;
  $("lnkIg").href=CFG.ig?"https://www.instagram.com/"+CFG.ig+"/":"#";$("lnkIg").hidden=!CFG.ig;
  if(S.svc!==null&&!CFG.servicios[S.svc])S.svc=null;
  if(CFG.barberos.indexOf(S.barb)<0)S.barb=CFG.barberos.length===1?CFG.barberos[0]:null;
  renderSvc();renderBarb();renderDays();renderSlots();renderResume();renderMine();
  if(!$("admin").hidden)renderAdmin();
}

function confirmar(){
  var s=CFG.servicios[S.svc];
  if(!libre(S.fecha,S.barb,S.ini,s.m)){toast("Justo se ocupó ese horario. Elegí otro.");S.ini=null;renderAll();return}
  var t={id:"t"+Date.now().toString(36)+Math.random().toString(36).slice(2,6),tipo:"turno",fecha:S.fecha,ini:S.ini,dur:s.m,
    servicio:s.n,precio:s.p,barbero:S.barb,cliente:$("cliName").value.trim(),tel:$("cliTel").value.trim(),
    estado:"activo",creado:new Date().toISOString()};
  TURNOS.push(t);
  var done=function(){toast("Listo. Turno del "+largo(t.fecha)+" a las "+hhmm(t.ini));S.ini=null;renderAll()};
  if(DB){DB.collection("turnos").doc(t.id).set(t).then(done,function(){
    TURNOS=TURNOS.filter(function(x){return x.id!==t.id});
    toast("No se pudo guardar el turno. Probá de nuevo.");renderAll();})}
  else done();
}
function cancelar(id){
  var t=null,i;for(i=0;i<TURNOS.length;i++)if(TURNOS[i].id===id)t=TURNOS[i];
  if(!t)return;
  t.estado="cancelado";renderAll();toast("Turno cancelado");
  if(DB)DB.collection("turnos").doc(id).update({estado:"cancelado"}).catch(function(){});
}

function renderAdmin(){
  var f=$("agDate").value||iso(new Date());
  $("agTitle").textContent=largo(f);
  var list=TURNOS.filter(function(t){return t.fecha===f&&t.estado!=="cancelado"}).sort(function(a,b){return a.ini-b.ini});
  var turnos=list.filter(function(t){return t.tipo!=="bloqueo"});
  $("stTur").textContent=turnos.length;
  var hs=turnos.reduce(function(a,t){return a+t.dur},0)/60;
  $("stHs").textContent=(Math.round(hs*10)/10)+"h";
  $("stCaja").textContent=money(turnos.reduce(function(a,t){return a+(t.precio||0)},0));
  $("agenda").innerHTML=list.length?list.map(function(t){
    var esB=t.tipo==="bloqueo";
    return '<div class="row"><div class="hh">'+hhmm(t.ini)+'</div><div>'+
      '<div class="cl">'+(esB?'<span class="tag">Bloqueado</span>':esc(t.cliente))+'</div>'+
      '<div class="sv">'+(esB?"Hasta "+hhmm(t.ini+t.dur):esc(t.servicio)+" · "+t.dur+" min · "+money(t.precio)+(CFG.barberos.length>1?" · "+esc(t.barbero):""))+'</div>'+
      (esB?"":'<div class="sv">'+esc(t.tel)+'</div>')+
      '</div><button class="btn warn" data-del="'+t.id+'">'+(esB?"Liberar":"Cancelar")+'</button></div>';
  }).join(""):'<div class="empty">'+(bloquesDe(f).length?"Sin turnos todavía para este día.":"La barbería está cerrada este día.")+'</div>';
  Array.prototype.forEach.call($("agenda").querySelectorAll("[data-del]"),function(b){b.onclick=function(){cancelar(b.getAttribute("data-del"))}});
  var sel=$("blkWho"),prev=sel.value;
  sel.innerHTML=CFG.barberos.map(function(n){return '<option>'+esc(n)+'</option>'}).join("");
  if(CFG.barberos.indexOf(prev)>=0)sel.value=prev;
}

function renderCfg(){
  $("cfgName").value=CFG.nombre;$("cfgSub").value=CFG.sub;$("cfgStep").value=CFG.paso;
  $("cfgDir").value=CFG.dir||"";$("cfgMapa").value=CFG.mapa||"";$("cfgIg").value=CFG.ig||"";
  $("days").innerHTML=CFG.dias.map(function(d,i){
    var b1=d.b[0]||["",""],b2=d.b[1]||["",""],v=[b1[0],b1[1],b2[0],b2[1]];
    return '<div class="dayrow"><div class="dn"><input type="checkbox" style="width:auto" data-day="'+i+'" '+(d.a?"checked":"")+'> '+DAYS[i]+'</div>'+
      [0,1,2,3].map(function(j){return '<input type="time" data-h="'+i+'-'+j+'" value="'+v[j]+'">'}).join("")+'</div>';
  }).join("");
  $("svcEdit").innerHTML=CFG.servicios.map(function(s,i){
    return '<div class="editrow"><input data-s="'+i+'-n" value="'+esc(s.n)+'"><input data-s="'+i+'-m" type="number" min="5" step="5" value="'+s.m+'"><input data-s="'+i+'-p" type="number" min="0" step="500" value="'+s.p+'"><button class="btn warn" data-sdel="'+i+'">Quitar</button></div>';
  }).join("");
  $("barbEdit").innerHTML=CFG.barberos.map(function(n,i){
    return '<div class="editrow" style="grid-template-columns:1fr auto"><input data-b="'+i+'" value="'+esc(n)+'"><button class="btn warn" data-bdel="'+i+'">Quitar</button></div>';
  }).join("");
  Array.prototype.forEach.call($("svcEdit").querySelectorAll("[data-sdel]"),function(b){b.onclick=function(){
    var c=leerCfg();if(c.servicios.length>1){c.servicios.splice(+b.getAttribute("data-sdel"),1);CFG=c;renderCfg()}}});
  Array.prototype.forEach.call($("barbEdit").querySelectorAll("[data-bdel]"),function(b){b.onclick=function(){
    var c=leerCfg();if(c.barberos.length>1){c.barberos.splice(+b.getAttribute("data-bdel"),1);CFG=c;renderCfg()}}});
}
function leerCfg(){
  var c=JSON.parse(JSON.stringify(CFG));
  c.nombre=$("cfgName").value.trim()||"Barbería";
  c.sub=$("cfgSub").value.trim();
  c.paso=Math.max(5,Math.min(60,+$("cfgStep").value||15));
  c.dir=$("cfgDir").value.trim();
  var mp=$("cfgMapa").value.trim();c.mapa=/^https?:\/\//i.test(mp)?mp:"";
  c.ig=$("cfgIg").value.trim().replace(/^@/,"");
  c.dias=CFG.dias.map(function(d,i){
    var v=function(j){return document.querySelector('[data-h="'+i+'-'+j+'"]').value};
    var b=[];if(v(0)&&v(1))b.push([v(0),v(1)]);if(v(2)&&v(3))b.push([v(2),v(3)]);
    return {a:document.querySelector('[data-day="'+i+'"]').checked,b:b};
  });
  c.servicios=CFG.servicios.map(function(s,i){return {
    n:document.querySelector('[data-s="'+i+'-n"]').value.trim()||"Servicio",
    m:+document.querySelector('[data-s="'+i+'-m"]').value||30,
    p:+document.querySelector('[data-s="'+i+'-p"]').value||0}});
  c.barberos=CFG.barberos.map(function(n,i){return document.querySelector('[data-b="'+i+'"]').value.trim()||"Barbero"});
  return c;
}
function guardar(){
  CFG=leerCfg();renderCfg();renderAll();
  if(DB)DB.doc("config/negocio").set(CFG).then(function(){toast("Ajustes guardados")},function(){toast("No se pudieron guardar los ajustes.")});
  else toast("Ajustes guardados");
}
function bloquear(){
  var a=$("blkFrom").value,b=$("blkTo").value,f=$("agDate").value;
  if(!a||!b||toMin(b)<=toMin(a)){toast("El horario de fin tiene que ser posterior al de inicio.");return}
  var t={id:"b"+Date.now().toString(36),tipo:"bloqueo",fecha:f,ini:toMin(a),dur:toMin(b)-toMin(a),
    servicio:"Bloqueado",precio:0,barbero:$("blkWho").value,cliente:"—",tel:"",estado:"activo",creado:new Date().toISOString()};
  TURNOS.push(t);renderAll();toast("Horario bloqueado");
  if(DB)DB.collection("turnos").doc(t.id).set(t).catch(function(){});
}

$("tabCli").onclick=function(){$("tabCli").setAttribute("aria-selected","true");$("tabAdm").setAttribute("aria-selected","false");$("viewCli").hidden=false;$("viewAdm").hidden=true};
$("tabAdm").onclick=function(){$("tabAdm").setAttribute("aria-selected","true");$("tabCli").setAttribute("aria-selected","false");$("viewCli").hidden=true;$("viewAdm").hidden=false};
function abrirPanel(){$("gate").hidden=true;$("admin").hidden=false;if(!$("agDate").value)$("agDate").value=iso(new Date());renderCfg();renderAdmin()}
$("pinBtn").onclick=function(){
  if(!SB){$("pinMsg").textContent="Falta configurar Supabase en config.js.";return}
  var b=$("pinBtn");b.disabled=true;b.textContent="Entrando...";
  SB.auth.signInWithPassword({email:$("mail").value.trim(),password:$("pass").value}).then(function(r){
    b.disabled=false;b.textContent="Entrar";
    if(r.error){$("pinMsg").textContent="No pudimos entrar. Revisá el correo y la contraseña.";return}
    abrirPanel();
  });
};
$("pass").addEventListener("keydown",function(e){if(e.key==="Enter")$("pinBtn").click()});
$("salir").onclick=function(){if(SB)SB.auth.signOut();$("admin").hidden=true;$("gate").hidden=false;$("pass").value=""};
$("agDate").onchange=renderAdmin;
$("agPrev").onclick=function(){var d=parseISO($("agDate").value);d.setDate(d.getDate()-1);$("agDate").value=iso(d);renderAdmin()};
$("agNext").onclick=function(){var d=parseISO($("agDate").value);d.setDate(d.getDate()+1);$("agDate").value=iso(d);renderAdmin()};
$("blkBtn").onclick=bloquear;
$("save").onclick=guardar;
$("svcAdd").onclick=function(){var c=leerCfg();c.servicios.push({n:"Nuevo servicio",m:30,p:0});CFG=c;renderCfg()};
$("barbAdd").onclick=function(){var c=leerCfg();c.barberos.push("Nuevo barbero");CFG=c;renderCfg()};
$("confirm").onclick=confirmar;
$("cliName").addEventListener("input",renderResume);
$("cliTel").addEventListener("input",function(){renderResume();renderMine()});

renderAll();

var SB=null;

function chk(r){if(r&&r.error)throw r.error;return r}
function shim(sb){
  return {
    collection:function(){return{doc:function(id){return{
      set:function(t){return sb.from("turnos").upsert(t).then(chk)},
      update:function(patch){return sb.from("turnos").update(patch).eq("id",id).then(chk)}
    }}}},
    doc:function(){return{set:function(c){return sb.from("config").upsert({id:"negocio",data:c}).then(chk)}}}
  };
}
function modoMuestra(){
  $("offline").hidden=false;
  var d=new Date();for(var k=0;k<7&&!CFG.dias[d.getDay()].a;k++)d.setDate(d.getDate()+1);
  TURNOS=[{id:"d1",tipo:"turno",fecha:iso(d),ini:660,dur:45,servicio:"Corte + barba",precio:13000,barbero:CFG.barberos[0],cliente:"Ejemplo: Mart\u00edn Ruiz",tel:"11 5555 0000",estado:"activo"},
          {id:"d2",tipo:"turno",fecha:iso(d),ini:960,dur:30,servicio:"Corte de pelo",precio:9000,barbero:CFG.barberos[0],cliente:"Ejemplo: Leo D\u00edaz",tel:"11 5555 1111",estado:"activo"}];
  renderAll();
}
function traerTurnos(){
  var desde=iso(new Date());
  return SB.from("turnos").select("*").gte("fecha",desde).then(function(r){
    if(r.error)return;
    TURNOS=r.data||[];renderAll();
  });
}
function traerConfig(){
  return SB.from("config").select("data").eq("id","negocio").maybeSingle().then(function(r){
    if(r.error||!r.data||!r.data.data)return;
    CFG=Object.assign(JSON.parse(JSON.stringify(DEF)),r.data.data);
    if(!$("admin").hidden)renderCfg();
    renderAll();
  });
}

(function(){
  var url=window.SUPABASE_URL,key=window.SUPABASE_ANON_KEY;
  if(!url||!key||!window.supabase||url.indexOf("TU-")===0){modoMuestra();return}
  SB=window.supabase.createClient(url,key);
  DB=shim(SB);
  traerConfig();traerTurnos();
  SB.channel("turnos-live").on("postgres_changes",{event:"*",schema:"public",table:"turnos"},traerTurnos)
    .on("postgres_changes",{event:"*",schema:"public",table:"config"},traerConfig).subscribe();
  SB.auth.getSession().then(function(r){if(r.data&&r.data.session)abrirPanel()});
})();

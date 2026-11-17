// Wolne Płuco: aplikacja (PWA). Logowanie kodem z maila, postęp w Supabase.
(function(){
"use strict";
var C = window.WP_CONFIG || {};
var sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true } });

var LESSONS = [
  {n:1,t:"Pułapka",s:"Dlaczego rzucanie wydaje się trudne",
   key:["Przez 7 dni palisz normalnie i niczego nie ograniczasz.","Strach przed rzuceniem jest częścią pułapki, nie Twoją słabością.","Wychodzisz przez zrozumienie, nie przez siłę woli."],
   ex:"Zapisz jednym zdaniem, czego najbardziej boisz się, gdy myślisz o rzuceniu."},
  {n:2,t:"Mały potwór",s:"Głód, który nikotyna sama wywołuje i sama gasi",
   key:["Nikotyna sama wywołuje lekki głód i sama go gasi.","Ulga po papierosie to stan, w którym niepalący są przez cały dzień.","Mały potwór słabnie po kilku dniach bez nikotyny."],
   ex:"Przy jednym papierosie, buchu albo saszetce zauważ: czujesz przyjemność czy tylko ulgę?"},
  {n:3,t:"Duży potwór",s:"Przekonanie, że nikotyna coś Ci daje",
   key:["Duży potwór to wiara, że nikotyna coś Ci daje.","Zbudowały ją filmy, otoczenie i reklama, także e-papierosów i saszetek.","Nie walczysz z nim. Przestajesz mu wierzyć."],
   ex:"Policz, ile razy dziś zobaczysz papieros, e-papierosa albo saszetkę pokazane jako coś fajnego albo jako nagrodę."},
  {n:4,t:"Złudzenia",s:"Stres, nuda, skupienie, relaks",
   key:["Nikotyna nie pomaga na stres, nudę ani skupienie. Gasi tylko głód, który sama zrobiła.","Ten sam papieros nie może jednocześnie pobudzać i uspokajać.","Niepalący mają po prostu jedno zmartwienie mniej."],
   ex:"Zapal jednego papierosa (albo weź bucha, saszetkę) całkiem świadomie, bez telefonu i kawy. Zapytaj siebie: gdzie tu jest przyjemność?"},
  {n:5,t:"Z czego rezygnuję",s:"Z niczego. Zobacz, co odzyskujesz",
   key:["Nie rezygnujesz z niczego.","Odzyskujesz pieniądze, czas, spokój głowy i koniec ukrywania się.","Zdrowie to bonus. Przede wszystkim przestajesz być niewolnikiem."],
   ex:"Policz w kalkulatorze, ile wydasz na nikotynę przez rok, przez 10 lat i przez 30 lat. Na co wolisz wydać te pieniądze?",calc:true},
  {n:6,t:"Pułapki",s:"Silna wola, ograniczanie, „tylko jeden”",
   key:["Silna wola, ograniczanie i „tylko jeden” prowadzą z powrotem do nałogu.","Zamienniki mówią głowie, że coś straciłeś.","Przesiadka na e-papierosa albo saszetki to ta sama pułapka."],
   ex:"Obserwuj palaczy wokół siebie. Czy wyglądają na zrelaksowanych, czy na ludzi, którzy szybko robią coś, co muszą?"},
  {n:7,t:"Gotowość",s:"Dlaczego najlepszy moment to teraz",
   key:["Idealny moment nie przyjdzie. Najlepszy jest teraz.","Lekkie, puste uczucie w pierwszych dniach to umierający potwór.","Jesteś wolny w chwili, w której gasisz ostatniego papierosa."],
   ex:"Odpowiedz szczerze: czy jesteś pewny, że chcesz być wolny od nikotyny? Kiedy myślisz o ostatnim papierosie, czujesz bardziej smutek czy ekscytację?"}
];
/* Dni 8 do 28: krótka wiadomość codziennie po dniu zero. Pliki: audio/dzien-8.mp3 do dzien-28.mp3 */
var DAYS = {
  8:["Pierwszy poranek","Przy pierwszej myśli o nikotynie powiedz w myślach: „Hurra, jestem wolny”."],
  9:["Nie licz godzin","Zajrzyj raz do licznika i zobacz, ile już zostało w Twojej kieszeni."],
  10:["Kawa","Wypij poranną kawę tam, gdzie zwykle paliłeś. Zauważ, że niczego jej nie brakuje."],
  11:["Stres","Kiedy dziś poczujesz stres, zrób trzy spokojne oddechy i zobacz, że przechodzi bez nikotyny."],
  12:["Głód słabnie","Zapisz jedną rzecz, która jest dziś łatwiejsza niż pierwszego dnia."],
  13:["Weekend i alkohol","Zanim wyjdziesz na imprezę, powiedz sobie: „nie ma tylko jednego”."],
  14:["Tydzień wolności","Wróć do zdania z lekcji 1, w którym zapisałeś, czego się boisz. Ile z tego się sprawdziło?"],
  15:["Sen o papierosie","Jeśli śnił Ci się papieros, zapisz, co poczułeś po przebudzeniu."],
  16:["Ktoś częstuje","Powiedz dziś na głos, choćby do siebie: „nie, dzięki, nie palę”."],
  17:["Wieczór i nuda","Zauważ dziś jedną nudną chwilę i przejdź przez nią bez niczego w rękach."],
  18:["Zły dzień","Jeśli dziś jest zły dzień, nazwij jego prawdziwy powód jednym zdaniem."],
  19:["Jedzenie","Zanim dziś sięgniesz po przekąskę, zapytaj siebie: jestem głodny czy coś zapełniam?"],
  20:["Patrzysz na palaczy","Gdy dziś zobaczysz palacza, zauważ, czy czujesz zazdrość, czy ulgę, że to już nie Ty."],
  21:["Dwa tygodnie","Dokończ zdanie: „Nie wezmę nawet jednego, bo…”."],
  22:["Auto i telefon","Zauważ dziś jeden stary odruch i powiedz w myślach: „to tylko automat”."],
  23:["Pieniądze","Zdecyduj, na co wydasz pieniądze z pierwszego miesiąca wolności."],
  24:["„To tylko saszetka”","Jeśli w domu albo w aucie zostało coś z nikotyną, oddaj to albo wyrzuć dziś."],
  25:["Smak, węch i energia","Zapisz jedną rzecz, którą czujesz lepiej niż miesiąc temu."],
  26:["Bliscy","Spędź dziś z kimś bliskim czas, który wcześniej zabierała Ci nikotyna."],
  27:["Nie czekaj na olśnienie","Wieczorem sprawdź, ile razy dziś w ogóle pomyślałeś o nikotynie."],
  28:["Trzy tygodnie wolności","Napisz krótką wiadomość do siebie sprzed miesiąca. Co byś mu powiedział?"]
};
var FORMS = {
  pap:{label:"Papierosy", q:"Ile papierosów dziennie?", unit:"niezapalonych papierosów", min:5},
  vape:{label:"E-papieros", q:"Ile razy dziennie sięgasz po e-papierosa?", unit:"razy bez e-papierosa", min:5},
  snus:{label:"Saszetki", q:"Ile saszetek dziennie?", unit:"niewłożonych saszetek", min:0}
};
var ORDER = ["pap","vape","snus"];
var DNI = ["", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela"];

// Stan: P = profil z bazy, done = zaliczone lekcje, notes = notatki, meet = spotkania
var S = { user:null, P:null, done:{}, notes:{}, meet:null, blocked:false, deleted:false };
var app = document.getElementById("app"), au = document.getElementById("au");

function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }
function toast(msg){ var t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg; document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 3500); }
function fail(e){ console.error(e); toast("Coś poszło nie tak. Sprawdź internet i spróbuj jeszcze raz."); }
function doneCount(){ var c = 0; LESSONS.forEach(function(l){ if (S.done[l.n]) c++; }); return c; }
function nextLesson(){ for (var i = 0; i < LESSONS.length; i++) if (!S.done[LESSONS[i].n]) return LESSONS[i]; return null; }
function unlocked(n){ return n === 1 || !!S.done[n-1]; }
function formy(){ return (S.P && S.P.formy && S.P.formy.length) ? S.P.formy : ["pap"]; }
function ile(f){ return (S.P && S.P.ile && +S.P.ile[f]) || 0; }
function tydz(){ return (S.P && +S.P.tydz) || 0; }
function perDayAll(){ return formy().reduce(function(a, f){ return a + ile(f); }, 0); }
function minutesPerDay(){ return formy().reduce(function(a, f){ return a + ile(f) * FORMS[f].min; }, 0); }
function nicName(){ var f = formy(); return f.length > 1 ? "nikotyny" : {pap:"papierosa",vape:"e-papierosa",snus:"saszetek"}[f[0]]; }
function unitStats(days){ return formy().map(function(f){ return '<div class="stat"><b>' + Math.floor(days * ile(f)) + '</b><span>' + FORMS[f].unit + '</span></div>'; }).join(""); }
function fmtZl(v){ return Math.round(v).toLocaleString("pl-PL") + " zł"; }
function zeroAt(){ return S.P && S.P.zero_at ? new Date(S.P.zero_at).getTime() : null; }
/* Dzień programu po dniu zero, liczony po dacie kalendarzowej: dzień zero = 7, następny ranek = 8. */
function calDays(){ var z = zeroAt(); if (!z) return null; var a = new Date(z), b = new Date(); a.setHours(12,0,0,0); b.setHours(12,0,0,0); return Math.max(0, Math.round((b - a) / 86400000)); }
function progDay(){ var c = calDays(); return c === null ? null : 7 + c; }
function since(){ var z = zeroAt(); if (!z) return null; var ms = Date.now() - z; return {ms:ms, days: ms/86400000}; }
function icon(name){
  var p = {
    play:'<polygon points="7 4 20 12 7 20 7 4" fill="currentColor" stroke="none"></polygon>',
    pause:'<rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none"></rect><rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none"></rect>',
    back:'<path d="M15 18l-6-6 6-6"></path>',
    check:'<path d="M5 12l5 5L20 7"></path>',
    heart:'<path d="M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 6.5-7 11-7 11z"></path>',
    x:'<path d="M6 6l12 12M18 6L6 18"></path>'
  }[name];
  return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
}
function tabs(on){
  var t = [
    ["dzis","Dziś",'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'],
    ["lekcje","Lekcje",'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>'],
    ["licznik","Licznik",'<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>'],
    ["wiecej","Spotkania",'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>']
  ];
  return '<nav class="tabs" aria-label="Menu"><div class="in">' + t.map(function(x){
    return '<a href="#/' + x[0] + '" class="' + (on === x[0] ? "on" : "") + '"' + (on === x[0] ? ' aria-current="page"' : "") + '><svg viewBox="0 0 24 24" aria-hidden="true">' + x[2] + '</svg>' + x[1] + '</a>';
  }).join("") + '</div></nav>';
}
function fab(){ return zeroAt() ? '<a class="btn lime fab" href="#/chce">' + icon("heart") + 'SOS · chcę zapalić</a>' : ""; }
function header(pill){
  return '<div class="top"><div class="brand"><img src="icon-192.png" alt="">' + (S.P && S.P.imie ? "Cześć, " + esc(S.P.imie) : "Wolne Płuco") + '</div>' + (pill ? '<span class="pill">' + pill + '</span>' : "") + '</div>';
}
function legal(){ return '<p class="legal center"><a href="' + C.TERMS_URL + '">Regulamin</a> · <a href="' + C.PRIVACY_URL + '">Polityka prywatności</a></p>'; }

/* ---------- baza ---------- */
async function loadAll(){
  var uid = S.user.id;
  var r = await Promise.all([
    sb.from("profiles").select("*").eq("id", uid).maybeSingle(),
    sb.from("lesson_done").select("lesson,done_at").eq("user_id", uid),
    sb.from("lesson_notes").select("lesson,note").eq("user_id", uid),
    sb.from("spotkania").select("*").eq("id", 1).maybeSingle()
  ]);
  if (r[0].error) throw r[0].error;
  S.P = r[0].data;
  S.done = {}; (r[1].data || []).forEach(function(x){ S.done[x.lesson] = x.done_at; });
  S.notes = {}; (r[2].data || []).forEach(function(x){ S.notes[x.lesson] = x.note || ""; });
  S.meet = r[3].data || null;
}
async function saveProfile(patch){
  var r = await sb.from("profiles").update(patch).eq("id", S.user.id).select().single();
  if (r.error) { fail(r.error); return false; }
  S.P = r.data; return true;
}
var noteTimer = {};
function saveNote(n, text){
  S.notes[n] = text;
  clearTimeout(noteTimer[n]);
  noteTimer[n] = setTimeout(function(){
    sb.from("lesson_notes").upsert({ user_id: S.user.id, lesson: n, note: text.slice(0, 2000), updated_at: new Date().toISOString() }).then(function(r){ if (r.error) fail(r.error); });
  }, 700);
}

/* ---------- logowanie ---------- */
async function canLogin(email){
  var r = await sb.rpc("can_login", { p_email: email });
  return r.error ? true : r.data === true;
}
function vLogin(email, step){
  app.innerHTML = '<main>' +
    '<div class="brand"><img src="icon-192.png" alt="">Wolne Płuco</div>' +
    '<h1>Zaloguj się <em>bez hasła</em></h1>' +
    '<p class="muted">Wpisz e-mail, który podałeś przy zapisie. Wyślemy Ci 6-cyfrowy kod.</p>' +
    (step === "code"
      ? '<form id="cf" class="card" novalidate><p class="note">Kod wysłaliśmy na <b>' + esc(email) + '</b>. Sprawdź też folder Oferty lub Spam.</p>' +
        '<label class="f">Kod z e-maila<input class="code-input" type="text" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required></label>' +
        '<button class="btn block" type="submit" id="cb">Zaloguj</button><button class="btn line block" type="button" id="cback">Wpisz inny e-mail albo wyślij kod jeszcze raz</button></form>'
      : '<form id="lf" class="card" novalidate><label class="f">Twój e-mail<input type="email" name="email" autocomplete="email" inputmode="email" required value="' + esc(email || "") + '"></label>' +
        '<button class="btn block" type="submit" id="lb">Wyślij kod</button></form>') +
    legal() + '</main>';
  var lf = document.getElementById("lf"), cf = document.getElementById("cf");
  if (lf) {
    lf.email.focus();
    lf.onsubmit = async function(e){
      e.preventDefault();
      var em = lf.email.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) return toast("Sprawdź adres e-mail.");
      var b = document.getElementById("lb"); b.disabled = true; b.textContent = "Wysyłam…";
      if (!(await canLogin(em))) { b.disabled = false; b.textContent = "Wyślij kod"; return vNoAccess(em); }
      var r = await sb.auth.signInWithOtp({ email: em, options: { shouldCreateUser: true } });
      b.disabled = false; b.textContent = "Wyślij kod";
      if (r.error) return toast(/rate|seconds/i.test(r.error.message) ? "Kod był wysłany przed chwilą. Odczekaj minutę i spróbuj znowu." : "Nie udało się wysłać kodu. Spróbuj za chwilę.");
      vLogin(em, "code");
    };
  }
  if (cf) {
    cf.code.focus();
    document.getElementById("cback").onclick = function(){ vLogin(email); };
    cf.onsubmit = async function(e){
      e.preventDefault();
      var b = document.getElementById("cb"); b.disabled = true;
      var r = await sb.auth.verifyOtp({ email: email, token: cf.code.value.replace(/\D/g, ""), type: "email" });
      b.disabled = false;
      if (r.error) return toast("Kod jest błędny albo wygasł. Sprawdź najnowszy e-mail albo wyślij nowy kod.");
      boot();
    };
  }
}
function vNoAccess(email){
  app.innerHTML = '<main><div class="brand"><img src="icon-192.png" alt="">Wolne Płuco</div>' +
    '<h1>Ten e-mail nie ma <em>jeszcze dostępu</em></h1>' +
    '<p class="muted" style="line-height:1.55">Adres <b>' + esc(email) + '</b> nie jest na liście uczestników. Jeśli już zapłaciłeś, sprawdź, czy wpisujesz ten sam e-mail co przy zapisie, albo napisz do Tomasza.</p>' +
    '<a class="btn block" href="' + esc(C.LANDING_URL) + '">Dołącz do programu</a>' +
    '<button class="btn line block" type="button" id="nb">Wpisz inny e-mail</button></main>';
  document.getElementById("nb").onclick = function(){ vLogin(""); };
}

/* ---------- ekrany ---------- */
function vStart(){
  var sel = (S.P && S.P.formy) ? S.P.formy.slice() : ["pap"];
  var edit = !!(S.P && S.P.consent_health);
  app.innerHTML = '<main>' +
    '<div class="brand"><img src="icon-192.png" alt="">Wolne Płuco</div>' +
    '<h1>' + (edit ? "Twoje <em>dane</em>" : "Zacznijmy. <em>Bez presji.</em>") + '</h1>' +
    '<p class="muted">Kilka pytań, żeby licznik pokazywał Twoje liczby. Przez pierwszy tydzień palisz normalnie.</p>' +
    '<form id="f" class="card" novalidate>' +
      '<label class="f">Jak masz na imię?<input type="text" name="imie" autocomplete="given-name" maxlength="80" value="' + esc(S.P && S.P.imie) + '"></label>' +
      '<div style="display:flex;flex-direction:column;gap:6px;font-size:14px;font-weight:600"><span id="formaL">Czego używasz? Możesz zaznaczyć kilka.</span><div class="seg" role="group" aria-labelledby="formaL">' +
        ORDER.map(function(k){ var on = sel.indexOf(k) > -1; return '<button type="button" data-f="' + k + '" class="' + (on ? "on" : "") + '" aria-pressed="' + on + '">' + FORMS[k].label + '</button>'; }).join("") +
      '</div></div>' +
      ORDER.map(function(k){ return '<label class="f' + (sel.indexOf(k) > -1 ? "" : " hidden") + '" data-q="' + k + '">' + FORMS[k].q + ' Mniej więcej.<input type="number" name="ile_' + k + '" inputmode="numeric" min="1" max="300" value="' + (ile(k) || "") + '"></label>'; }).join("") +
      '<label class="f">Ile wydajesz na nikotynę tygodniowo (zł)?<input type="number" name="tydz" inputmode="numeric" min="1" max="5000" value="' + (tydz() || "") + '"></label>' +
      (edit ? "" :
      '<label class="check"><input type="checkbox" name="w18"><span>Mam ukończone 18 lat.</span></label>' +
      '<label class="check"><input type="checkbox" name="zgoda"><span>Zgadzam się na przetwarzanie moich danych o paleniu w aplikacji, zgodnie z <a href="' + C.PRIVACY_URL + '" target="_blank">polityką prywatności</a>. Akceptuję <a href="' + C.TERMS_URL + '" target="_blank">regulamin</a>.</span></label>' +
      '<p class="note">Jeśli jesteś w ciąży, masz chorobę serca lub płuc albo bierzesz leki, porozmawiaj o rzucaniu z lekarzem. Bezpłatna pomoc: Telefoniczna Poradnia Pomocy Palącym, 801 108 108.</p>') +
      '<p class="note hidden" id="err" role="alert" style="color:#B42318">Uzupełnij imię i liczby' + (edit ? "" : ", potwierdź wiek i zgodę") + '.</p>' +
      '<button class="btn block" type="submit" id="sb">' + (edit ? "Zapisz" : "Zaczynam") + '</button>' +
      (edit ? '<a class="btn line block" href="#/wiecej">Anuluj</a>' : "") +
    '</form></main>';
  var fm = document.getElementById("f");
  fm.querySelectorAll("[data-f]").forEach(function(b){ b.onclick = function(){
    var k = b.dataset.f, i = sel.indexOf(k);
    if (i > -1) { if (sel.length > 1) sel.splice(i, 1); } else sel.push(k);
    fm.querySelectorAll("[data-f]").forEach(function(x){ var on = sel.indexOf(x.dataset.f) > -1; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); });
    fm.querySelectorAll("[data-q]").forEach(function(l){ l.classList.toggle("hidden", sel.indexOf(l.dataset.q) < 0); });
  }; });
  fm.onsubmit = async function(e){
    e.preventDefault();
    var imie = fm.imie.value.trim(), t = +fm.tydz.value, counts = {}, ok = true;
    ORDER.forEach(function(k){ if (sel.indexOf(k) > -1) { var v = +fm["ile_" + k].value; if (!(v > 0)) ok = false; counts[k] = v; } });
    if (!imie || !ok || !(t > 0) || (!edit && (!fm.w18.checked || !fm.zgoda.checked))) { document.getElementById("err").classList.remove("hidden"); return; }
    var row = { imie: imie, formy: ORDER.filter(function(k){ return sel.indexOf(k) > -1; }), ile: counts, tydz: t };
    var btn = document.getElementById("sb"); btn.disabled = true;
    var r;
    if (edit) r = await sb.from("profiles").update(row).eq("id", S.user.id).select().single();
    else { row.id = S.user.id; row.email = S.user.email; row.consent_health = true; row.consent_at = new Date().toISOString(); r = await sb.from("profiles").upsert(row).select().single(); }
    btn.disabled = false;
    if (r.error) return fail(r.error);
    S.P = r.data; go(edit ? "#/wiecej" : "#/dzis");
  };
}

function vDzis(){
  var c = doneCount(), nx = nextLesson(), h = "";
  if (zeroAt()) {
    var d = since(), days = Math.floor(d.days);
    h += header("ETAP 2 · OCZYSZCZANIE");
    h += '<h1>Jesteś <em>wolny.</em></h1>';
    h += '<div class="card dark"><span class="eyebrow">Jesteś wolny od</span><div style="display:flex;align-items:baseline;gap:10px"><span style="font:400 64px/0.9 var(--serif)">' + days + '</span><span style="font-weight:700;font-size:18px">' + (days === 1 ? "dnia" : "dni") + '</span></div>' +
         '<div class="stats" style="margin-top:4px"><div class="stat" style="background:rgba(255,255,255,.08);border:0"><b style="font-size:28px;font-family:var(--sans);font-weight:800">' + Math.floor(d.days * perDayAll()) + '</b><span style="color:#CFCBF7">razy bez ' + nicName() + '</span></div><div class="stat" style="background:rgba(255,255,255,.08);border:0"><b style="font-size:28px;font-family:var(--sans);font-weight:800;color:var(--lime)">' + fmtZl(d.days * tydz() / 7) + '</b><span style="color:#CFCBF7">zostało w kieszeni</span></div></div></div>';
    var pd = progDay();
    if (pd === 7) {
      h += '<div class="card"><span class="eyebrow">Na dziś</span><h2>Mały potwór właśnie umiera</h2><p style="line-height:1.6;color:var(--body)">Lekkie, puste uczucie może się jeszcze pojawiać. To nie Ty go potrzebujesz, to potwór, którego przestałeś karmić. Kiedy przyjdzie, pomyśl: „Hurra, jestem wolny”.</p><p class="note">Jutro rano czeka tu na Ciebie pierwsza krótka wiadomość.</p></div>';
    } else if (DAYS[pd]) {
      h += '<div class="card dark"><span class="eyebrow">Wiadomość dnia · dzień ' + pd + ' · ok. 40 s</span><h2 style="color:#fff">' + esc(DAYS[pd][0]) + '</h2><a class="btn lime" style="align-self:flex-start" href="#/dzien/' + pd + '">' + icon("play") + 'Posłuchaj</a></div>';
      h += '<div class="card"><span class="eyebrow">Zadanie na dziś</span><p style="font-weight:700;line-height:1.4">' + esc(DAYS[pd][1]) + '</p></div>';
      h += '<a class="btn line block" href="#/lekcje">Wszystkie wiadomości</a>';
    } else {
      h += '<div class="card"><span class="eyebrow">Na dziś</span><h2>Trzy tygodnie za Tobą</h2><p style="line-height:1.6;color:var(--body)">Okres oczyszczania minął. Od teraz wiadomości przychodzą raz w tygodniu. Pamiętaj jedno: nie ma „tylko jednego”.</p></div>';
      h += '<a class="btn line block" href="#/lekcje">Wszystkie wiadomości</a>';
    }
    h += '<button class="btn line block" data-go="#/zero">Posłuchaj jeszcze raz nagrania z dnia zero</button>';
  } else if (nx) {
    var day = nx.n;
    h += header("ETAP 1 · DZIEŃ " + day + " Z 7");
    h += '<h1>' + (c === 0 ? "Dziś zaczynasz od <em>pułapki</em>" : "Lekcja " + day + ": <em>" + esc(nx.t.toLowerCase()) + "</em>") + '</h1>';
    h += '<div class="dots" aria-label="Zrobione lekcje: ' + c + ' z 7">' + LESSONS.map(function(l){ return '<i class="' + (S.done[l.n] ? "done" : (l.n === day ? "now" : "")) + '"></i>'; }).join("") + '</div>';
    h += '<div class="card dark"><span class="eyebrow">Lekcja dnia · ok. 2,5 min</span><h2 style="color:#fff">' + esc(nx.t) + ': ' + esc(nx.s.charAt(0).toLowerCase() + nx.s.slice(1)) + '</h2><p class="muted" style="line-height:1.5">Posłuchaj, a potem zrób jedno ćwiczenie. Palisz normalnie, niczego nie ograniczasz.</p><a class="btn lime" style="align-self:flex-start" href="#/lekcja/' + day + '">' + icon("play") + 'Zacznij lekcję</a></div>';
    h += '<div class="card"><span class="eyebrow">Ćwiczenie dnia</span><p style="font-weight:700;line-height:1.4">' + esc(nx.ex) + '</p></div>';
    if (c > 0) h += '<p class="note">Ostatnia zaliczona: lekcja ' + c + '. Najlepiej jedna lekcja dziennie, ale nikt Cię nie goni.</p>';
  } else {
    h += header("DZIEŃ ZERO");
    h += '<h1>Wszystkie lekcje za Tobą. <em>Czas na dzień zero.</em></h1>';
    h += '<div class="card dark"><span class="eyebrow">Dzień zero · ok. 2,5 min</span><h2 style="color:#fff">Ostatni papieros. Potem jesteś wolny.</h2><p class="muted" style="line-height:1.5">Znajdź spokojne miejsce i kilka minut dla siebie. Nagranie poprowadzi Cię krok po kroku.</p><a class="btn lime" style="align-self:flex-start" href="#/zero">Zaczynam dzień zero</a></div>';
  }
  if (S.meet && S.meet.dzien && S.meet.godzina) h += meetCard(true);
  app.innerHTML = '<main>' + h + '</main>' + fab() + tabs("dzis");
}

function vLekcje(){
  var h = '<h1>Twój <em>plan</em></h1><span class="eyebrow" style="margin-top:4px">Etap 1 · dni 1 do 7 · palisz normalnie</span>';
  var nx = nextLesson();
  h += LESSONS.map(function(l){
    var st = S.done[l.n] ? "done" : (nx && nx.n === l.n ? "now" : (unlocked(l.n) ? "" : "locked"));
    var inner = '<span class="n">' + (S.done[l.n] ? "✓" : l.n) + '</span><span><b>' + l.n + ". " + esc(l.t) + '</b><small>' + (st === "locked" ? "Odblokuje się po lekcji " + (l.n - 1) : esc(l.s)) + '</small></span>';
    return st === "locked" ? '<div class="lesson locked">' + inner + '</div>' : '<a class="lesson ' + st + '" style="text-decoration:none;color:inherit" href="#/lekcja/' + l.n + '">' + inner + '</a>';
  }).join("");
  var zeroOpen = doneCount() === 7 || !!zeroAt();
  h += (zeroOpen ? '<a href="#/zero" style="text-decoration:none">' : "<div>") + '<div class="card dark" style="flex-direction:row;align-items:center;gap:12px;padding:14px"><span style="flex:none;width:32px;height:32px;border-radius:50%;background:var(--lime);color:var(--lime-ink);display:flex;align-items:center;justify-content:center;font-weight:800">0</span><span><b style="display:block">Dzień zero: ostatni papieros</b><small class="muted">' + (zeroAt() ? "Za Tobą. Jesteś wolny." : (zeroOpen ? "Gotowy, kiedy Ty jesteś gotowy" : "Odblokuje się po 7 lekcjach")) + '</small></span></div>' + (zeroOpen ? "</a>" : "</div>");
  var pdl = progDay();
  if (pdl !== null && pdl >= 8) {
    h += '<span class="eyebrow" style="margin-top:8px">Etap 2 · dni 8 do 28 · wiadomość dnia</span>';
    for (var dn = Math.min(pdl, 28); dn >= 8; dn--) h += '<a class="lesson' + (dn === pdl ? " now" : " done") + '" style="text-decoration:none;color:inherit" href="#/dzien/' + dn + '"><span class="n">' + dn + '</span><span><b>Dzień ' + dn + '. ' + esc(DAYS[dn][0]) + '</b><small>' + (dn === pdl ? "Wiadomość na dziś" : "Posłuchaj jeszcze raz") + '</small></span></a>';
  }
  h += '<div class="stats"><div class="stat"><span class="eyebrow" style="font-size:11px">Dni 8 do 28</span><b style="font-size:24px;margin-top:6px">Oczyszczanie</b><span>Krótka wiadomość codziennie</span></div><div class="stat"><span class="eyebrow" style="font-size:11px">Dni 29 do 90</span><b style="font-size:24px;margin-top:6px">Wolność</b><span>Wiadomość raz w tygodniu</span></div></div>';
  app.innerHTML = '<main>' + h + '</main>' + fab() + tabs("lekcje");
}

function player(title){
  return '<div class="player"><div class="row"><button class="play" id="pp" type="button" aria-label="Odtwórz">' + icon("play") + '</button><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:15px">' + esc(title) + '</div><div class="note" style="color:#CFCBF7">Lektor · Wolne Płuco</div></div><button class="speed" id="sp" type="button" aria-label="Prędkość odtwarzania">1×</button></div>' +
    '<div class="bar" id="bar" role="slider" aria-label="Postęp nagrania" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0"><i id="fill"></i></div><div class="time"><span id="cur">0:00</span><span id="dur">0:00</span></div></div>';
}
function mmss(s){ s = Math.max(0, Math.floor(s || 0)); return Math.floor(s/60) + ":" + ("0" + (s % 60)).slice(-2); }
function bindPlayer(src){
  au.pause(); au.src = src; au.playbackRate = 1;
  var pp = document.getElementById("pp"), sp = document.getElementById("sp"), bar = document.getElementById("bar"), fill = document.getElementById("fill");
  function ui(){ if (!document.body.contains(pp)) return; pp.innerHTML = icon(au.paused ? "play" : "pause"); pp.setAttribute("aria-label", au.paused ? "Odtwórz" : "Pauza"); }
  function prog(){ if (!document.body.contains(fill)) return; var p = au.duration ? au.currentTime / au.duration * 100 : 0; fill.style.width = p + "%"; bar.setAttribute("aria-valuenow", Math.round(p)); document.getElementById("cur").textContent = mmss(au.currentTime); document.getElementById("dur").textContent = mmss(au.duration); }
  pp.onclick = function(){ if (au.paused) au.play().catch(function(){}); else au.pause(); };
  sp.onclick = function(){ var r = au.playbackRate === 1 ? 1.25 : (au.playbackRate === 1.25 ? 1.5 : 1); au.playbackRate = r; sp.textContent = String(r).replace(".", ",") + "×"; };
  bar.onclick = function(e){ var r = bar.getBoundingClientRect(); if (au.duration) au.currentTime = (e.clientX - r.left) / r.width * au.duration; };
  bar.onkeydown = function(e){ if (e.key === "ArrowRight") au.currentTime += 10; if (e.key === "ArrowLeft") au.currentTime -= 10; };
  au.onplay = au.onpause = ui; au.ontimeupdate = au.onloadedmetadata = prog; au.onended = ui;
  ui();
}

function vDzien(n){
  var pd = progDay(), d = DAYS[n];
  if (!d || pd === null || n > pd) return go("#/dzis");
  var h = '<div class="top"><button class="back" type="button" data-go="#/dzis" aria-label="Wróć">' + icon("back") + '</button><span class="pill">DZIEŃ ' + n + ' Z 28</span></div>';
  h += '<h1>' + esc(d[0]) + '</h1>';
  h += player("Dzień " + n + ": " + d[0]);
  h += '<div class="card"><span class="eyebrow">Zadanie na dziś</span><p style="font-weight:700;line-height:1.4">' + esc(d[1]) + '</p>' +
       '<label class="f" style="font-weight:500;color:var(--muted)">Twoja notatka (widzisz ją tylko Ty)<textarea id="nt" rows="3" maxlength="2000">' + esc(S.notes[n]) + '</textarea></label></div>';
  h += '<a class="btn line block" href="#/dzis">Wróć do dziś</a>';
  app.innerHTML = '<main>' + h + '</main>' + fab() + tabs("dzis");
  bindPlayer("audio/dzien-" + n + ".mp3");
  var nt = document.getElementById("nt"); nt.oninput = function(){ saveNote(n, nt.value); };
}

function vLekcja(n){
  var l = LESSONS[n-1]; if (!l || !unlocked(n)) return go("#/lekcje");
  var h = '<div class="top"><button class="back" type="button" data-go="#/lekcje" aria-label="Wróć do planu">' + icon("back") + '</button><span class="pill">LEKCJA ' + n + ' Z 7</span></div>';
  h += '<h1>' + esc(l.t) + '</h1><p class="muted" style="margin-top:-6px">' + esc(l.s) + '</p>';
  h += player("Lekcja " + n + ": " + l.t);
  h += '<div class="card"><span class="eyebrow">Najważniejsze</span><ul class="key">' + l.key.map(function(k){ return "<li>" + esc(k) + "</li>"; }).join("") + '</ul></div>';
  if (l.calc) h += '<div class="card soft"><span class="eyebrow">Kalkulator</span><label class="f">Ile wydajesz tygodniowo (zł)?<input type="number" id="cw" inputmode="numeric" value="' + (tydz() || "") + '"></label><div class="stats" id="cres"></div></div>';
  h += '<div class="card"><span class="eyebrow">Ćwiczenie dnia</span><p style="font-weight:700;line-height:1.4">' + esc(l.ex) + '</p>' +
       '<label class="f" style="font-weight:500;color:var(--muted)">Twoja notatka (widzisz ją tylko Ty)<textarea id="nt" rows="3" maxlength="2000">' + esc(S.notes[n]) + '</textarea></label></div>';
  h += S.done[n] ? '<div class="done-badge">' + icon("check") + 'Lekcja zaliczona</div><a class="btn line block" href="#/dzis">Wróć do dziś</a>'
                 : '<button class="btn block" id="fin" type="button">Zrobione, zaliczam lekcję</button>';
  app.innerHTML = '<main>' + h + '</main>' + tabs("lekcje");
  bindPlayer("audio/dzien-" + n + ".mp3");
  var nt = document.getElementById("nt"); nt.oninput = function(){ saveNote(n, nt.value); };
  if (l.calc) {
    var cw = document.getElementById("cw"), cres = document.getElementById("cres");
    var calc = function(){ var v = +cw.value || 0; cres.innerHTML = [["Rok",52],["10 lat",520],["30 lat",1560]].map(function(x, i){ return '<div class="stat' + (i === 2 ? " lime" : "") + '"' + (i === 2 ? ' style="grid-column:span 2"' : "") + '><b style="font-size:30px">' + fmtZl(v * x[1]) + '</b><span>' + x[0] + '</span></div>'; }).join(""); };
    cw.oninput = calc; calc();
  }
  var fin = document.getElementById("fin");
  if (fin) fin.onclick = async function(){
    fin.disabled = true;
    var r = await sb.from("lesson_done").upsert({ user_id: S.user.id, lesson: n });
    if (r.error) { fin.disabled = false; return fail(r.error); }
    S.done[n] = new Date().toISOString(); au.pause(); go("#/dzis");
  };
}

function vZero(){
  var open = doneCount() === 7 || zeroAt(); if (!open) return go("#/lekcje");
  var h = '<div class="top"><button class="back" type="button" data-go="#/dzis" aria-label="Wróć">' + icon("back") + '</button><span class="pill" style="background:var(--lime);color:var(--lime-ink)">DZIEŃ ZERO</span></div>';
  h += '<h1>Ostatni papieros. <em>Potem jesteś wolny.</em></h1>';
  h += player("Dzień zero");
  if (zeroAt()) {
    h += '<div class="card soft"><span class="eyebrow">Twoje postanowienie</span><p style="font-weight:700;line-height:1.45">' + esc(S.P.postanowienie || "Nie zapisałeś go, ale i tak jesteś wolny.") + '</p></div>';
  } else {
    h += '<div class="card"><span class="eyebrow">Krok 1</span><p style="font-weight:700">Czy jesteś pewny, że chcesz być wolny?</p><div class="seg" style="grid-template-columns:1fr 1fr"><button type="button" id="q1y">Tak</button><button type="button" id="q1n">Mam wątpliwości</button></div><p class="note hidden" id="doubt">To normalne. Wróć do lekcji, której dotyczy wątpliwość, albo przyjdź na spotkanie na żywo. Dzień zero poczeka.</p></div>';
    h += '<div class="card"><span class="eyebrow">Krok 2</span><label class="f">Twoje postanowienie, własnymi słowami<textarea id="post" rows="3" maxlength="600" placeholder="Np. Od dziś nie biorę nikotyny w żadnej postaci, bo nic mi nie daje.">' + esc(S.P.postanowienie) + '</textarea></label></div>';
    h += '<div class="card"><span class="eyebrow">Krok 3 i 4</span><p style="line-height:1.55;color:var(--body)">Ostatni papieros, buch albo saszetka. Powoli i świadomie. Potem gasisz i mówisz: „Jestem wolny”. Resztę paczek, e-papierosa, liquidy i saszetki oddajesz albo wyrzucasz.</p></div>';
    h += '<button class="btn lime block" id="free" type="button" disabled>Jestem wolny · startuję licznik</button><p class="note" id="freeHint">Przycisk włączy się po kroku 1.</p>';
  }
  app.innerHTML = '<main>' + h + '</main>' + tabs("dzis");
  bindPlayer("audio/dzien-0.mp3");
  if (!zeroAt()) {
    var free = document.getElementById("free"), post = document.getElementById("post");
    document.getElementById("q1y").onclick = function(){ this.classList.add("on"); document.getElementById("q1n").classList.remove("on"); document.getElementById("doubt").classList.add("hidden"); free.disabled = false; document.getElementById("freeHint").classList.add("hidden"); };
    document.getElementById("q1n").onclick = function(){ this.classList.add("on"); document.getElementById("q1y").classList.remove("on"); document.getElementById("doubt").classList.remove("hidden"); free.disabled = true; };
    free.onclick = async function(){
      free.disabled = true;
      if (await saveProfile({ zero_at: new Date().toISOString(), postanowienie: post.value.trim().slice(0, 600) || null })) { au.pause(); go("#/dzis"); }
      else free.disabled = false;
    };
  }
}

function vLicznik(){
  var h = '<h1>Twój <em>zysk</em></h1>';
  var d = since();
  if (!d) {
    h += '<div class="card"><p style="line-height:1.55;color:var(--body)">Licznik ruszy w dniu zero, po ostatnim papierosie. Do tego czasu nic nie liczysz i niczego nie ograniczasz.</p></div>';
    h += '<div class="card soft"><span class="eyebrow">Ile teraz wydajesz</span><div class="stats"><div class="stat"><b style="font-size:30px">' + fmtZl(tydz() * 52) + '</b><span>rocznie</span></div><div class="stat"><b style="font-size:30px">' + fmtZl(tydz() * 520) + '</b><span>przez 10 lat</span></div></div></div>';
  } else {
    var dt = new Date(zeroAt());
    h += '<p class="muted" style="margin-top:-4px">Liczone od ' + dt.toLocaleDateString("pl-PL", {day:"numeric", month:"long"}) + ', ' + dt.toLocaleTimeString("pl-PL", {hour:"2-digit", minute:"2-digit"}) + '</p>';
    var min = d.days * minutesPerDay(), hrs = min / 60;
    h += '<div class="stats"><div class="stat dark"><b>' + Math.floor(d.days) + '</b><span>dni wolności</span></div><div class="stat lime"><b>' + fmtZl(d.days * tydz() / 7) + '</b><span>zostało w kieszeni</span></div>' + unitStats(d.days) + (min > 0 ? '<div class="stat"><b>' + (hrs >= 1 ? Math.floor(hrs) + " h" : Math.floor(min) + " min") + '</b><span>czasu z powrotem</span></div>' : "") + '</div>';
    h += '<div class="card"><span class="eyebrow">W skali roku</span><div style="display:flex;justify-content:space-between;align-items:baseline"><span>Pieniądze</span><b style="font-size:20px">' + fmtZl(tydz() * 52) + '</b></div><p class="note">Na co je wydasz? Wakacje, nowe buty do biegania, prezent dla bliskich.</p></div>';
  }
  h += '<div class="card soft"><p class="note" style="color:var(--body)">Zdrowie to bonus. Lepszy oddech, smak i węch przychodzą z czasem, u każdego trochę inaczej.</p></div>';
  app.innerHTML = '<main>' + h + '</main>' + fab() + tabs("licznik");
}

var TRIG = [["kawa","Kawa"],["stres","Stres"],["alkohol","Alkohol"],["nuda","Nuda"],["auto","Auto"],["jedzenie","Po jedzeniu"],["inni","Ktoś pali obok"],["inne","Coś innego"]];
function vChce(){
  var h = '<div class="top"><span class="pill">SOS</span><button class="back" type="button" data-go="#/dzis" aria-label="Zamknij">' + icon("x") + '</button></div>' +
    '<span class="eyebrow" style="color:#3F6B0A;margin-top:6px">To fala. Minie za kilka minut</span><h1 style="font-size:38px">Zatrzymaj się <em>na minutę.</em></h1>';
  h += player("SOS: fala");
  h += '<div class="sos-tools"><a class="card tool" href="#/oddech"><b>Oddech</b><span>1 minuta z kołem</span></a><a class="card tool" href="#/kotwica"><b>Kotwica</b><span>autohipnoza, 7 min</span></a></div>';
  h += '<div class="card"><span class="note">Złącz kciuk z palcem wskazującym i powiedz w myślach:</span><p style="font:400 30px/1.1 var(--serif)">„Jestem wolny.”</p>' +
       (S.P && S.P.postanowienie ? '<p class="note" style="margin-top:6px">Twoje postanowienie: <b style="color:var(--ink)">' + esc(S.P.postanowienie) + '</b></p>' : "") + '</div>';
  h += '<div class="card" id="pass"><span class="eyebrow">Przeszło?</span><div class="seg" style="grid-template-columns:1fr 1fr"><button type="button" data-p="1">Tak, przeszło</button><button type="button" data-p="0">Jeszcze nie</button></div>' +
       '<div id="trig" class="hidden"><p style="font-weight:700;margin-top:6px">Co wywołało tę falę?</p><div class="chips">' + TRIG.map(function(t){ return '<button type="button" data-t="' + t[0] + '">' + t[1] + '</button>'; }).join("") + '</div></div>' +
       '<p class="note hidden" id="more">Zrób jeszcze minutę oddechu. Fala słabnie z każdą minutą, nawet jeśli tego jeszcze nie czujesz. <a href="#/oddech">Oddech</a></p>' +
       '<div id="sum" class="hidden"></div></div>';
  h += '<p class="note" style="text-align:center">Potrzebujesz rozmowy? Poradnia dla palących: <a href="tel:801108108" style="white-space:nowrap"><b>801 108 108</b></a></p>';
  app.innerHTML = '<main class="urge">' + h + '</main>';
  bindPlayer("audio/sos.mp3");
  au.play().catch(function(){});
  var passed = null;
  app.querySelectorAll("[data-p]").forEach(function(b){ b.onclick = function(){
    passed = b.dataset.p === "1";
    app.querySelectorAll("[data-p]").forEach(function(x){ x.classList.toggle("on", x === b); });
    document.getElementById("trig").classList.remove("hidden");
    document.getElementById("more").classList.toggle("hidden", passed);
  }; });
  app.querySelectorAll("[data-t]").forEach(function(b){ b.onclick = async function(){
    app.querySelectorAll("[data-t]").forEach(function(x){ x.disabled = true; x.classList.toggle("on", x === b); });
    var r = await sb.from("sos_events").insert({ user_id: S.user.id, przeszlo: passed, wyzwalacz: b.dataset.t });
    if (r.error) { app.querySelectorAll("[data-t]").forEach(function(x){ x.disabled = false; }); return fail(r.error); }
    sosSummary();
  }; });
}
async function sosSummary(){
  var box = document.getElementById("sum"); if (!box) return;
  var since = new Date(Date.now() - 7 * 86400000).toISOString();
  var r = await sb.from("sos_events").select("wyzwalacz,przeszlo,created_at").eq("user_id", S.user.id).gte("created_at", since);
  var rows = (r && r.data) || [], c = {};
  rows.forEach(function(x){ if (x.wyzwalacz) c[x.wyzwalacz] = (c[x.wyzwalacz] || 0) + 1; });
  var top = Object.keys(c).sort(function(a, b){ return c[b] - c[a]; })[0];
  var name = top ? TRIG.filter(function(t){ return t[0] === top; })[0][1].toLowerCase() : "";
  box.innerHTML = '<p style="font-weight:700;margin-top:8px">Zapisane. Dobra robota.</p><p class="note">Ostatnie 7 dni: ' + rows.length + ' ' + (rows.length === 1 ? "fala" : (rows.length % 10 >= 2 && rows.length % 10 <= 4 && (rows.length % 100 < 10 || rows.length % 100 >= 20) ? "fale" : "fal")) +
    (top && rows.length > 1 ? ', najczęściej: <b style="color:var(--ink)">' + esc(name) + '</b>. Kiedy wiesz, co uruchamia falę, łatwiej ją rozpoznać.' : ".") + '</p>' +
    '<button class="btn block" type="button" data-go="#/dzis" style="background:var(--ink);margin-top:8px">Jestem wolny, wracam do dnia</button>';
  box.classList.remove("hidden");
}

var BREATH = {
  spokoj: { name: "Spokój", info: "Wdech 4 sekundy, wydech 6. Dłuższy wydech uspokaja.", steps: [["Wdech", 4, 1], ["Wydech", 6, 0]] },
  kwadrat: { name: "Kwadrat", info: "4 sekundy wdech, 4 pauza, 4 wydech, 4 pauza. Dobre przy stresie.", steps: [["Wdech", 4, 1], ["Zatrzymaj", 4, 1], ["Wydech", 4, 0], ["Zatrzymaj", 4, 0]] },
  podwojny: { name: "Podwójny wdech", info: "Dwa wdechy nosem, jeden długi wydech ustami. Najszybszy reset.", steps: [["Wdech nosem", 2, .8], ["Jeszcze trochę", 1, 1], ["Długi wydech ustami", 6, 0]] }
};
function vOddech(){
  var k = S.breath || "spokoj", B = BREATH[k];
  var back = zeroAt() ? "#/chce" : "#/wiecej";
  var h = '<div class="top"><button class="back" type="button" data-go="' + back + '" aria-label="Wróć">' + icon("back") + '</button><span class="pill">ODDECH · 1 MIN</span></div>';
  h += '<h1>Oddychaj <em>ze mną.</em></h1>';
  h += '<div class="seg" role="group" aria-label="Rodzaj oddechu">' + Object.keys(BREATH).map(function(x){ return '<button type="button" data-b="' + x + '" class="' + (x === k ? "on" : "") + '">' + BREATH[x].name + '</button>'; }).join("") + '</div>';
  h += '<p class="note" style="text-align:center">' + B.info + '</p>';
  h += '<div class="breath"><div class="ring" id="ring"></div><div class="lbl"><b id="bl">Gotowy?</b><span id="bc"></span></div></div>';
  h += '<p class="note" id="bt" style="text-align:center">Kliknij start. Telefon delikatnie zawibruje przy każdej zmianie.</p>';
  h += '<button class="btn block" type="button" id="bgo">Start</button>';
  app.innerHTML = '<main>' + h + '</main>';
  app.querySelectorAll("[data-b]").forEach(function(b){ b.onclick = function(){ stopBreath(); S.breath = b.dataset.b; vOddech(); }; });
  var ring = document.getElementById("ring"), bl = document.getElementById("bl"), bc = document.getElementById("bc"), bt = document.getElementById("bt"), go_ = document.getElementById("bgo");
  go_.onclick = function(){
    if (S.bt) { stopBreath(); bl.textContent = "Gotowy?"; bc.textContent = ""; ring.style.transitionDuration = ".6s"; ring.style.transform = "scale(.55)"; go_.textContent = "Start"; return; }
    var total = 60, left = total, i = 0, t = 0;
    go_.textContent = "Stop";
    function step(){
      var s = B.steps[i % B.steps.length];
      bl.textContent = s[0]; t = s[1];
      ring.style.transitionDuration = s[1] + "s"; ring.style.transform = "scale(" + (.55 + .45 * s[2]) + ")";
      try { navigator.vibrate && navigator.vibrate(30); } catch(e){}
      i++;
    }
    step(); bc.textContent = t;
    S.bt = setInterval(function(){
      if (!document.body.contains(ring)) return stopBreath();
      left--; t--;
      bt.textContent = "Zostało " + mmss(left);
      if (left <= 0) {
        stopBreath(); bl.textContent = "Gotowe"; bc.textContent = ""; ring.style.transitionDuration = "1s"; ring.style.transform = "scale(.55)";
        bt.innerHTML = "Jak teraz? Możesz zrobić jeszcze jedną minutę.";
        go_.textContent = "Jeszcze raz"; return;
      }
      if (t <= 0) step();
      bc.textContent = t;
    }, 1000);
  };
}
function stopBreath(){ if (S.bt) { clearInterval(S.bt); S.bt = null; } }

function vKotwica(){
  var back = zeroAt() ? "#/chce" : "#/wiecej";
  var h = '<div class="top"><button class="back" type="button" data-go="' + back + '" aria-label="Wróć">' + icon("back") + '</button><span class="pill">AUTOHIPNOZA · 7 MIN</span></div>';
  h += '<h1>Kotwica <em>wolności</em></h1>';
  h += player("Kotwica wolności");
  h += '<div class="card"><span class="eyebrow">Jak słuchać</span><p style="line-height:1.6;color:var(--body)">Usiądź albo połóż się w spokojnym miejscu, najlepiej w słuchawkach. Przez pierwsze dni słuchaj raz dziennie. Nagranie ustawia gest: kciuk złączony z palcem wskazującym i „Jestem wolny”. Potem używasz go w każdej chwili, gdy przyjdzie fala.</p><p class="note"><b>Nie słuchaj podczas jazdy autem</b> ani przy pracy, która wymaga skupienia.</p></div>';
  app.innerHTML = '<main>' + h + '</main>' + tabs("");
  bindPlayer("audio/kotwica.mp3");
}

function meetCard(small){
  var m = S.meet;
  if (!m || !m.dzien || !m.godzina) return '<div class="card dark"><span class="eyebrow">Spotkania na żywo</span><h2 style="color:#fff">Termin pojawi się tutaj</h2><p class="muted" style="line-height:1.5">Co tydzień spotkanie z Tomaszem w Google Meet: pytania, wsparcie, autohipnoza.</p></div>';
  var when = DNI[m.dzien] + ", " + String(m.godzina).slice(0, 5) + " (czas polski)";
  return '<div class="card dark"><span class="eyebrow">Spotkanie na żywo</span><h2 style="color:#fff">' + esc(when.charAt(0).toUpperCase() + when.slice(1)) + '</h2>' +
    (m.temat ? '<p class="muted">' + esc(m.temat) + '</p>' : "") +
    (!small ? '<p class="muted" style="line-height:1.5">Google Meet, ok. ' + (m.czas_min || 60) + ' min. Możesz też tylko posłuchać.</p>' : "") +
    (m.link ? '<a class="btn lime" style="align-self:flex-start" href="' + esc(m.link) + '" target="_blank" rel="noopener">Dołącz do spotkania</a>' : "") + '</div>';
}

function vWiecej(){
  var h = '<h1>Spotkania <em>i pomoc</em></h1>';
  h += meetCard(false);
  h += '<div class="card"><span class="eyebrow">Ćwiczenia na trudną chwilę</span><p style="line-height:1.5;color:var(--body)">Możesz z nich korzystać w każdej chwili, także przed dniem zero.</p><div class="sos-tools"><a class="card tool" href="#/oddech"><b>Oddech</b><span>1 minuta z kołem</span></a><a class="card tool" href="#/kotwica"><b>Kotwica</b><span>autohipnoza, 7 min</span></a></div>' + (zeroAt() ? '<a class="btn line" style="align-self:flex-start" href="#/chce">Otwórz SOS</a>' : "") + '</div>';
  h += '<div class="card"><span class="eyebrow">Hipnoza 1:1</span><p style="line-height:1.5;color:var(--body)">Osobna sesja z Tomaszem, gdy chcesz pracy indywidualnej.</p><a class="btn line" style="align-self:flex-start" href="' + esc(C.INSTAGRAM_URL) + '" target="_blank" rel="noopener">Napisz w DM</a></div>';
  h += '<div class="card"><span class="eyebrow">Pomoc</span><p style="line-height:1.5;color:var(--body)">Telefoniczna Poradnia Pomocy Palącym: <a href="tel:801108108" style="white-space:nowrap"><b>801 108 108</b></a>. Jeśli jesteś w ciąży, masz chorobę serca lub płuc albo bierzesz leki, porozmawiaj o rzucaniu z lekarzem.</p></div>';
  if (zeroAt()) h += '<div class="card"><span class="eyebrow">Zapaliłem</span><p style="line-height:1.5;color:var(--body)">Nie ma „tylko jednego”, bo jeden papieros to powrót do pułapki. Posłuchaj jeszcze raz lekcji 6 i zacznij nowy dzień zero.</p><button class="btn line" style="align-self:flex-start" type="button" id="slip">Nowy dzień zero</button></div>';
  h += '<div class="card"><span class="eyebrow">Konto</span><p class="note">' + esc(S.user.email) + '<br>' + formy().map(function(f){ return FORMS[f].label.toLowerCase() + ": " + ile(f) + " dziennie"; }).join(", ") + ' · ' + fmtZl(tydz()) + ' tygodniowo</p>' +
       '<button class="btn line" style="align-self:flex-start" type="button" id="edit">Zmień dane</button>' +
       '<button class="btn line" style="align-self:flex-start" type="button" id="out">Wyloguj</button>' +
       '<button class="btn line" style="align-self:flex-start;color:#B42318" type="button" id="del">Usuń konto</button></div>';
  h += '<p class="note">Wolne Płuco to narzędzie wspierające. Nie zastępuje leczenia ani porady lekarskiej.</p>' + legal();
  app.innerHTML = '<main>' + h + '</main>' + fab() + tabs("wiecej");
  var slip = document.getElementById("slip");
  if (slip) slip.onclick = async function(){ if (confirmBox("Licznik zacznie się od nowa po nowym dniu zero. Kontynuować?") && await saveProfile({ zero_at: null })) go("#/lekcja/6"); };
  document.getElementById("edit").onclick = function(){ go("#/start"); };
  document.getElementById("out").onclick = function(){ sb.auth.signOut(); };
  document.getElementById("del").onclick = async function(){
    if (!confirmBox("Usunąć konto? Znikną Twoje dane, postęp i notatki. Tego nie da się cofnąć.")) return;
    var r = await sb.rpc("delete_my_account");
    if (r.error) return fail(r.error);
    S.deleted = true; await sb.auth.signOut({ scope: "local" }).catch(function(){});
    app.innerHTML = '<main><h1>Konto <em>usunięte</em></h1><p class="muted">Twoje dane zostały usunięte. Dziękuję, że byłeś w programie.</p></main>';
  };
}
function confirmBox(msg){ try { return window.confirm(msg); } catch(e){ return true; } }

/* ---------- start i nawigacja ---------- */
function go(h){ if (location.hash === h) render(); else location.hash = h; }
function render(){
  if (!S.user || !S.P) return;
  var r = (location.hash || "").replace(/^#\/?/, "").split("/");
  if (!S.P.consent_health && r[0] !== "start") return go("#/start");
  stopBreath();
  if (r[0] !== "lekcja" && r[0] !== "zero" && r[0] !== "dzien" && r[0] !== "chce" && r[0] !== "kotwica") au.pause();
  switch (r[0]) {
    case "start": vStart(); break;
    case "lekcje": vLekcje(); break;
    case "lekcja": vLekcja(+r[1]); break;
    case "zero": vZero(); break;
    case "dzien": vDzien(+r[1]); break;
    case "licznik": vLicznik(); break;
    case "chce": if (zeroAt()) vChce(); else go("#/oddech"); break;
    case "oddech": vOddech(); break;
    case "kotwica": vKotwica(); break;
    case "wiecej": vWiecej(); break;
    default: vDzis();
  }
  window.scrollTo(0, 0);
}
async function boot(){
  try {
    var s = (await sb.auth.getSession()).data.session;
    if (!s) return vLogin("");
    var acc = await sb.rpc("my_access");
    if (!acc.error && acc.data !== true) { S.blocked = true; var em = s.user.email; await sb.auth.signOut(); return vNoAccess(em); }
    S.user = s.user;
    await loadAll();
    if (!S.P) { S.P = { consent_health: false }; return vStart(); }
    render();
  } catch (e) { fail(e); app.innerHTML = '<main><h1>Brak połączenia</h1><p class="muted">Sprawdź internet i odśwież aplikację.</p><button class="btn" type="button" onclick="location.reload()">Spróbuj ponownie</button></main>'; }
}
sb.auth.onAuthStateChange(function(ev){
  if (ev === "SIGNED_OUT") { S.user = null; S.P = null; if (!S.deleted && !S.blocked) vLogin(""); S.blocked = false; }
});
app.addEventListener("click", function(e){ var t = e.target.closest("[data-go]"); if (t) { e.preventDefault(); go(t.getAttribute("data-go")); } });
window.addEventListener("hashchange", render);
boot();
})();

// Wolne Płuco: panel trenera (zgłoszenia, lista dostępu, uczestnicy, spotkania, statystyki strony)
(function(){
"use strict";
var C = window.WP_CONFIG || {};
var sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY, { auth: { persistSession: true, storageKey: "wp-admin" } });
var m = document.getElementById("m");
var D = { leads: [], acc: [], users: [], done: [], land: [], meet: null, lf: "aktywne", range: 30 };
var STATUS = { nowe: "Nowe", w_kontakcie: "W kontakcie", oplacone: "Opłacone", wyslany_dostep: "Dostęp wysłany", odrzucony: "Odrzucone" };
var DNI = ["", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }
function toast(msg){ var t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg; document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 4000); }
function d(s){ return s ? new Date(s).toLocaleString("pl-PL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""; }
function $(id){ return document.getElementById(id); }

/* ---------- logowanie trenera kodem ---------- */
function vLogin(email, step){
  m.innerHTML = '<div class="brand"><img src="icon-192.png" alt="">Wolne Płuco</div><h1>Panel <em>trenera</em></h1>' +
    (step === "code"
      ? '<form id="cf" class="card" style="max-width:440px"><p class="note">Kod wysłany na <b>' + esc(email) + '</b>.</p><label class="f">Kod z e-maila<input class="code-input" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6"></label><button class="btn block" type="submit">Zaloguj</button></form>'
      : '<form id="lf" class="card" style="max-width:440px"><label class="f">E-mail trenera<input type="email" name="email" autocomplete="email" value="' + esc(email || "") + '"></label><button class="btn block" type="submit">Wyślij kod</button></form>');
  if ($("lf")) $("lf").onsubmit = async function(e){
    e.preventDefault(); var em = this.email.value.trim().toLowerCase();
    var r = await sb.auth.signInWithOtp({ email: em, options: { shouldCreateUser: false } });
    if (r.error) return toast("Nie udało się wysłać kodu: " + r.error.message);
    vLogin(em, "code");
  };
  if ($("cf")) $("cf").onsubmit = async function(e){
    e.preventDefault();
    var r = await sb.auth.verifyOtp({ email: email, token: this.code.value.replace(/\D/g, ""), type: "email" });
    if (r.error) return toast("Kod jest błędny albo wygasł.");
    boot();
  };
}

/* ---------- dane ---------- */
async function all(q){ var out = [], from = 0; for (;;) { var r = await q().range(from, from + 999); if (r.error) throw r.error; out = out.concat(r.data || []); if (!r.data || r.data.length < 1000) return out; from += 1000; } }
async function load(){
  var res = await Promise.all([
    all(function(){ return sb.from("zgloszenia_palenie").select("*").order("created_at", { ascending: false }); }),
    all(function(){ return sb.from("access_list").select("*").order("created_at", { ascending: false }); }),
    all(function(){ return sb.from("profiles").select("id,email,imie,formy,ile,tydz,zero_at,created_at,is_admin").order("created_at"); }),
    all(function(){ return sb.from("lesson_done").select("user_id,lesson"); }),
    all(function(){ return sb.from("landing_events").select("event,zrodlo,urzadzenie,at"); }),
    sb.from("spotkania").select("*").eq("id", 1).maybeSingle()
  ]);
  D.leads = res[0]; D.acc = res[1]; D.users = res[2]; D.done = res[3]; D.land = res[4]; D.meet = res[5].data;
  var ss = await Promise.all([7, 30, 90].map(function(n){ return sb.rpc("sos_stats", { p_days: n }); }));
  D.sos = { 7: ss[0].data, 30: ss[1].data, 90: ss[2].data };
}

/* ---------- widok ---------- */
function render(){
  var since = Date.now() - D.range * 86400000;
  var land = D.land.filter(function(x){ return new Date(x.at).getTime() >= since; });
  var cnt = function(ev){ return land.filter(function(x){ return x.event === ev; }).length; };
  var wej = cnt("wejscie"), zap = cnt("zapis");
  var src = {}; land.filter(function(x){ return x.event === "wejscie"; }).forEach(function(x){ var k = x.zrodlo || "bezpośrednio"; src[k] = (src[k] || 0) + 1; });
  var srcTxt = Object.keys(src).sort(function(a, b){ return src[b] - src[a]; }).slice(0, 6).map(function(k){ return esc(k) + ": " + src[k]; }).join(" · ");
  var users = D.users.filter(function(u){ return !u.is_admin; });
  var lessons = {}; D.done.forEach(function(x){ lessons[x.user_id] = (lessons[x.user_id] || 0) + 1; });
  var free = users.filter(function(u){ return u.zero_at; }).length;
  var avgL = users.length ? (users.reduce(function(a, u){ return a + (lessons[u.id] || 0); }, 0) / users.length).toFixed(1).replace(".", ",") : "0";
  var newLeads = D.leads.filter(function(l){ return l.status === "nowe" || l.status === "w_kontakcie"; }).length;

  var h = '<div class="top"><div><span class="eyebrow">Wolne Płuco · program 90 dni</span><h1>Panel <em>trenera</em></h1></div>' +
    '<div class="row" style="display:flex;gap:8px"><select id="range" aria-label="Zakres"><option value="7">7 dni</option><option value="30">30 dni</option><option value="90">90 dni</option></select><button class="btn line slim" id="out" type="button">Wyloguj</button></div></div>';
  h += '<div class="kpis"><div class="stat"><b>' + users.length + '</b><span>uczestników</span></div><div class="stat"><b>' + free + '</b><span>po dniu zero</span></div><div class="stat"><b>' + avgL + '</b><span>średnio lekcji z 7</span></div><div class="stat lime"><b>' + newLeads + '</b><span>zgłoszeń do obsłużenia</span></div></div>';
  h += '<div class="card"><span class="eyebrow">Strona sprzedażowa · ostatnie ' + D.range + ' dni</span><div class="kpis"><div class="stat"><b>' + wej + '</b><span>wejść</span></div><div class="stat"><b>' + cnt("lekcja1") + '</b><span>odsłuchań lekcji 1</span></div><div class="stat"><b>' + cnt("dolaczam") + '</b><span>kliknięć „Dołączam”</span></div><div class="stat"><b>' + zap + '</b><span>zapisów' + (wej ? " (" + Math.round(zap / wej * 1000) / 10 + "%)" : "") + '</span></div></div>' +
    '<p class="note">' + (srcTxt || "Brak wejść w tym okresie.") + '</p><p class="note">Bez ciasteczek i bez adresu IP. Źródło: dopisek <b>?z=instagram</b> w linku albo strona, z której ktoś przyszedł.</p></div>';

  // SOS: tylko liczby zbiorcze, bez imion
  var SOSN = { kawa: "kawa", stres: "stres", alkohol: "alkohol", nuda: "nuda", auto: "auto", jedzenie: "po jedzeniu", inni: "ktoś pali obok", inne: "coś innego", brak: "bez odpowiedzi" };
  var sos = (D.sos && D.sos[D.range]) || null;
  if (sos) {
    var sTot = sos.reduce(function(a, x){ return a + Number(x.ile); }, 0), sOk = sos.reduce(function(a, x){ return a + Number(x.przeszlo); }, 0);
    h += '<div class="card"><span class="eyebrow">SOS · ostatnie ' + D.range + ' dni · zbiorczo, bez imion</span><div class="kpis"><div class="stat"><b>' + sTot + '</b><span>fal zapisanych</span></div><div class="stat"><b>' + (sTot ? Math.round(sOk / sTot * 100) : 0) + '%</b><span>„tak, przeszło”</span></div></div>' +
      (sTot ? sos.map(function(x){ var pr = Math.round(Number(x.ile) / sTot * 100); return '<div style="display:flex;justify-content:space-between;gap:10px;font-size:15px;padding:6px 0;border-top:1px solid #E6E4FC"><span>' + esc(SOSN[x.wyzwalacz] || x.wyzwalacz) + '</span><b>' + pr + '% · ' + x.ile + '</b></div>'; }).join("") : '<p class="note">Nikt jeszcze nie użył SOS w tym okresie.</p>') +
      '<p class="note">Co najczęściej wywołuje falę u uczestników. Dobry temat na spotkanie na żywo albo post. Pojedynczych osób panel nie pokazuje.</p></div>';
  }

  // zgłoszenia
  var leads = D.lf === "aktywne" ? D.leads.filter(function(l){ return l.status === "nowe" || l.status === "w_kontakcie" || l.status === "oplacone"; }) : D.leads;
  h += '<div class="card"><span class="eyebrow">Zgłoszenia ze strony</span><div style="display:flex;gap:8px"><button class="btn slim ' + (D.lf === "aktywne" ? "" : "line") + '" data-lf="aktywne" type="button">Do obsłużenia</button><button class="btn slim ' + (D.lf === "wszystkie" ? "" : "line") + '" data-lf="wszystkie" type="button">Wszystkie (' + D.leads.length + ')</button></div>' +
    (leads.length ? leads.map(leadCard).join("") : '<p class="note">Brak zgłoszeń do obsłużenia.</p>') +
    '<p class="note">„Opłacone, daj dostęp” dopisuje e-mail do listy dostępu i wysyła mail powitalny z linkiem do aplikacji. „Opłacone, wyślij przewodnik” wysyła PDF mailem w załączniku. Kto kupił przewodnik, płaci za program 50 zł zamiast 87 zł.</p></div>';

  // lista dostępu
  h += '<div class="card"><span class="eyebrow">Lista dostępu · kto może się zalogować</span>' +
    '<form id="accForm" style="display:flex;gap:8px;flex-wrap:wrap"><input type="email" id="accEmail" placeholder="e-mail" required style="flex:2;min-width:200px"><input type="text" id="accName" placeholder="imię (opcjonalnie)" style="flex:1;min-width:140px"><button class="btn slim" type="submit">Dodaj dostęp</button></form>' +
    '<div class="tablewrap"><table><thead><tr><th>E-mail</th><th>Imię</th><th>Od</th><th>Status</th><th></th></tr></thead><tbody>' +
    D.acc.map(function(a){ return '<tr><td>' + esc(a.email) + '</td><td>' + esc(a.imie) + '</td><td>' + d(a.created_at) + '</td><td>' + (a.revoked_at ? '<span class="tag no">odebrany</span>' : '<span class="tag ok">aktywny</span>') + '</td><td><button class="btn line slim" type="button" data-acc="' + esc(a.email) + '" data-rev="' + (a.revoked_at ? "0" : "1") + '">' + (a.revoked_at ? "Przywróć" : "Odbierz") + '</button></td></tr>'; }).join("") +
    '</tbody></table></div></div>';

  // uczestnicy
  h += '<div class="card"><span class="eyebrow">Uczestnicy</span><div class="tablewrap"><table><thead><tr><th>Imię</th><th>E-mail</th><th>Czego używa</th><th>Lekcje</th><th>Dzień zero</th><th>Dni wolności</th></tr></thead><tbody>' +
    (users.length ? users.map(function(u){ var days = u.zero_at ? Math.floor((Date.now() - new Date(u.zero_at)) / 86400000) : null;
      return '<tr><td>' + esc(u.imie) + '</td><td>' + esc(u.email) + '</td><td>' + esc((u.formy || []).map(function(f){ return ({pap:"papierosy",vape:"e-papieros",snus:"saszetki"})[f] + " " + ((u.ile || {})[f] || ""); }).join(", ")) + '</td><td>' + (lessons[u.id] || 0) + '/7</td><td>' + (u.zero_at ? d(u.zero_at) : "jeszcze nie") + '</td><td>' + (days == null ? "" : days) + '</td></tr>'; }).join("") : '<tr><td colspan="6">Na razie nikt nie założył konta.</td></tr>') +
    '</tbody></table></div><p class="note">Notatki z ćwiczeń widzi tylko uczestnik.</p></div>';

  // spotkania
  var mt = D.meet || {};
  h += '<form class="card" id="meetForm"><span class="eyebrow">Spotkania na żywo · widzą je uczestnicy w aplikacji</span><div class="grid2">' +
    '<label class="f">Dzień tygodnia<select id="mDay"><option value="">brak spotkań</option>' + DNI.slice(1).map(function(n, i){ return '<option value="' + (i + 1) + '"' + (mt.dzien === i + 1 ? " selected" : "") + '>' + n + '</option>'; }).join("") + '</select></label>' +
    '<label class="f">Godzina (czas polski)<input type="time" id="mTime" value="' + esc(mt.godzina ? String(mt.godzina).slice(0, 5) : "") + '"></label>' +
    '<label class="f">Ile trwa (minuty)<input type="number" id="mDur" min="15" max="240" step="5" value="' + (mt.czas_min || 60) + '"></label></div>' +
    '<label class="f">Link do Google Meet<input type="url" id="mLink" placeholder="https://meet.google.com/abc-defg-hij" value="' + esc(mt.link) + '"></label>' +
    '<label class="f">Temat najbliższego spotkania (opcjonalnie)<input type="text" id="mTopic" maxlength="200" value="' + esc(mt.temat) + '"></label>' +
    '<button class="btn" type="submit">Zapisz spotkanie</button></form>';

  m.innerHTML = h;
  $("range").value = String(D.range);
  $("range").onchange = function(){ D.range = +this.value; render(); };
  $("out").onclick = function(){ sb.auth.signOut().then(function(){ vLogin(""); }); };
  m.querySelectorAll("[data-lf]").forEach(function(b){ b.onclick = function(){ D.lf = b.dataset.lf; render(); }; });
  m.querySelectorAll("[data-st]").forEach(function(s){ s.onchange = function(){ setLead(+s.dataset.st, { status: s.value }); }; });
  m.querySelectorAll("[data-note]").forEach(function(t){ t.onchange = function(){ setLead(+t.dataset.note, { notatka: t.value.trim() || null }); }; });
  m.querySelectorAll("[data-give]").forEach(function(b){ b.onclick = function(){ give(+b.dataset.give, b.dataset.mail !== "0", b); }; });
  m.querySelectorAll("[data-pdf]").forEach(function(b){ b.onclick = function(){ sendPdf(+b.dataset.pdf, b); }; });
  m.querySelectorAll("[data-acc]").forEach(function(b){ b.onclick = function(){ revoke(b.dataset.acc, b.dataset.rev === "1"); }; });
  $("accForm").onsubmit = function(e){ e.preventDefault(); addAcc($("accEmail").value, $("accName").value); };
  $("meetForm").onsubmit = saveMeet;
}
function leadCard(l){
  var onList = D.acc.some(function(a){ return a.email === String(l.email).toLowerCase() && !a.revoked_at; });
  var pdf = l.oferta === "przewodnik";
  return '<div class="lead"><div class="row"><b style="font-size:16px">' + esc(l.imie) + '</b>' + (pdf ? '<span class="tag" style="background:#FFF4E5;color:#A15C00">Przewodnik PDF · 37 zł</span>' : '<span class="tag" style="background:#E3F6CF;color:#2F5A08">Program · 87 zł</span>') + '<span class="tag">' + (STATUS[l.status] || l.status) + '</span>' + (!pdf && onList ? '<span class="tag ok">ma dostęp</span>' : "") + '<span class="note">' + d(l.created_at) + (l.zrodlo ? " · " + esc(l.zrodlo) : "") + '</span></div>' +
    '<div class="row"><a href="mailto:' + esc(l.email) + '">' + esc(l.email) + '</a>' + (l.telefon ? ' · <a href="tel:' + esc(String(l.telefon).replace(/\s/g, "")) + '"><b>' + esc(l.telefon) + '</b></a>' : "") + (l.profil ? ' · ' + esc(l.profil) : "") + '</div>' +
    '<div class="note">' + [l.ile_dziennie ? "Dziennie: " + esc(l.ile_dziennie) : "", l.jak_dlugo ? "Od: " + esc(l.jak_dlugo) : ""].filter(Boolean).join(" · ") + '</div>' +
    (l.wiadomosc ? '<div style="color:var(--body);line-height:1.5">„' + esc(l.wiadomosc) + '”</div>' : "") +
    '<div class="row"><select data-st="' + l.id + '" aria-label="Status">' + Object.keys(STATUS).map(function(k){ return '<option value="' + k + '"' + (l.status === k ? " selected" : "") + '>' + STATUS[k] + '</option>'; }).join("") + '</select>' +
    (l.status === "wyslany_dostep" ? "" : pdf
      ? '<button class="btn lime slim" type="button" data-pdf="' + l.id + '">Opłacone, wyślij przewodnik</button>'
      : '<button class="btn lime slim" type="button" data-give="' + l.id + '">Opłacone, daj dostęp</button><button class="btn line slim" type="button" data-give="' + l.id + '" data-mail="0">Dostęp bez maila</button>') + '</div>' +
    '<input type="text" data-note="' + l.id + '" placeholder="Notatka (np. zadzwonić w piątek)" value="' + esc(l.notatka) + '" style="border:1px solid var(--line);border-radius:12px;padding:10px 12px"></div>';
}

/* ---------- akcje ---------- */
async function setLead(id, patch){
  var r = await sb.from("zgloszenia_palenie").update(patch).eq("id", id);
  if (r.error) return toast("Nie zapisano: " + r.error.message);
  var l = D.leads.find(function(x){ return x.id === id; }); Object.assign(l, patch); toast("Zapisane"); if (patch.status) render();
}
async function callFn(body){
  var s = (await sb.auth.getSession()).data.session;
  var r = await fetch(C.SUPABASE_URL.replace(/\/$/, "") + "/functions/v1/platnosci", {
    method: "POST", headers: { "Content-Type": "application/json", "apikey": C.SUPABASE_KEY, "Authorization": "Bearer " + s.access_token },
    body: JSON.stringify(body)
  });
  var j = await r.json().catch(function(){ return {}; });
  return { ok: r.ok, status: r.status, j: j };
}
async function sendPdf(id, btn){
  if (!window.confirm("Wysłać przewodnik PDF mailem? Zrób to dopiero po otrzymaniu płatności.")) return;
  btn.disabled = true;
  try {
    var x = await callFn({ action: "przewodnik", id: id });
    if (!x.ok || !x.j.ok) { btn.disabled = false; return toast("Nie wysłano: " + (x.j.error || x.j.mailErr || x.status) + (x.j.msg ? " " + x.j.msg : "")); }
    toast("Przewodnik wysłany mailem."); await load(); render();
  } catch (e) { btn.disabled = false; toast("Błąd połączenia z funkcją „platnosci”."); }
}
async function give(id, mail, btn){
  btn.disabled = true;
  var s = (await sb.auth.getSession()).data.session;
  try {
    var r = await fetch(C.SUPABASE_URL.replace(/\/$/, "") + "/functions/v1/platnosci", {
      method: "POST", headers: { "Content-Type": "application/json", "apikey": C.SUPABASE_KEY, "Authorization": "Bearer " + s.access_token },
      body: JSON.stringify({ action: "przyznaj", id: id, mail: mail })
    });
    var j = await r.json().catch(function(){ return {}; });
    if (!r.ok || !j.ok) { btn.disabled = false; return toast("Nie udało się: " + (j.error || r.status) + (j.msg ? " " + j.msg : "")); }
    toast(j.mail ? "Dostęp przyznany, mail wysłany." : (mail ? "Dostęp przyznany, ale mail nie wyszedł: " + (j.mailErr || "") : "Dostęp przyznany bez maila."));
    await load(); render();
  } catch (e) { btn.disabled = false; toast("Błąd połączenia z funkcją „platnosci”. Czy jest wdrożona?"); }
}
async function addAcc(email, imie){
  email = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return toast("Sprawdź e-mail.");
  var r = await sb.from("access_list").upsert({ email: email, imie: imie.trim() || null, zrodlo: "reczny", revoked_at: null, note: "dodany w panelu" });
  if (r.error) return toast("Nie dodano: " + r.error.message);
  toast("Dodano dostęp. Mail powitalny wyślij z karty zgłoszenia albo napisz sam."); await load(); render();
}
async function revoke(email, off){
  if (off && !window.confirm("Odebrać dostęp " + email + "? Ta osoba nie zaloguje się do aplikacji.")) return;
  var r = await sb.from("access_list").update({ revoked_at: off ? new Date().toISOString() : null }).eq("email", email);
  if (r.error) return toast("Nie zapisano: " + r.error.message);
  await load(); render();
}
async function saveMeet(e){
  e.preventDefault();
  var link = $("mLink").value.trim();
  if (link && !/^https:\/\/meet\.google\.com\//.test(link)) return toast("Link musi zaczynać się od https://meet.google.com/");
  var r = await sb.from("spotkania").update({ dzien: +$("mDay").value || null, godzina: $("mTime").value || null, czas_min: +$("mDur").value || 60, link: link || null, temat: $("mTopic").value.trim() || null, updated_at: new Date().toISOString() }).eq("id", 1);
  if (r.error) return toast("Nie zapisano: " + r.error.message);
  toast("Spotkanie zapisane. Uczestnicy zobaczą je w aplikacji.");
}

async function boot(){
  var s = (await sb.auth.getSession()).data.session;
  if (!s) return vLogin("");
  var me = await sb.from("profiles").select("is_admin").eq("id", s.user.id).maybeSingle();
  if (!me.data || !me.data.is_admin) {
    m.innerHTML = '<h1>Brak <em>dostępu</em></h1><p class="muted">To konto (' + esc(s.user.email) + ') nie ma uprawnień trenera. Najpierw zaloguj się raz w aplikacji i uzupełnij dane, potem nadaj sobie rolę trenera poleceniem SQL.</p><button class="btn line" id="o2" type="button">Wyloguj</button>';
    $("o2").onclick = function(){ sb.auth.signOut().then(function(){ vLogin(""); }); };
    return;
  }
  try { await load(); render(); } catch (e) { console.error(e); toast("Błąd wczytywania: " + (e.message || e)); }
}
boot();
})();

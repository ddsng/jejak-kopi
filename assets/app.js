/* =====================================================================
   Jejak Kopi — lapisan bersama: data, sinkronisasi GitHub, kerangka halaman
   Dipakai oleh semua halaman. Muat dengan <script src="assets/app.js"></script>
   ===================================================================== */

/* ---------- kunci penyimpanan lokal ---------- */
const K_DATA  = "jejakkopi.data.v1";
const K_TOKEN = "jejakkopi.token.v1";
const K_CFG   = "jejakkopi.cfg.v1";
const K_SHA   = "jejakkopi.sha.v1";

/* ---------- utilitas ---------- */
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g,
  c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const qs = k => new URLSearchParams(location.search).get(k) || "";
const ls = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); }
    catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch(e){ return false; } },
  del(k){ try{ localStorage.removeItem(k); }catch(e){} }
};

function fmtDate(s){
  if(!s) return "";
  const d = new Date(s); if(isNaN(d)) return s;
  return d.toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" });
}
function hariRoast(s){
  if(!s) return null;
  const d = new Date(s); if(isNaN(d)) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}
function toast(msg){
  let t = $("#toast");
  if(!t){ t = document.createElement("div"); t.id = "toast"; t.className = "toast";
    document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("on");
  clearTimeout(t._x); t._x = setTimeout(() => t.classList.remove("on"), 3000);
}

/* ---------- bendera negara ---------- */
const BENDERA = {
  "Indonesia":"🇮🇩","Ethiopia":"🇪🇹","Etiopia":"🇪🇹","Kenya":"🇰🇪","Colombia":"🇨🇴",
  "Kolombia":"🇨🇴","Brazil":"🇧🇷","Brasil":"🇧🇷","Guatemala":"🇬🇹","Costa Rica":"🇨🇷",
  "El Salvador":"🇸🇻","Honduras":"🇭🇳","Panama":"🇵🇦","Peru":"🇵🇪","Bolivia":"🇧🇴",
  "Ecuador":"🇪🇨","Ekuador":"🇪🇨","Mexico":"🇲🇽","Meksiko":"🇲🇽","Nicaragua":"🇳🇮",
  "Rwanda":"🇷🇼","Burundi":"🇧🇮","Tanzania":"🇹🇿","Uganda":"🇺🇬","DR Congo":"🇨🇩",
  "Yemen":"🇾🇪","India":"🇮🇳","Vietnam":"🇻🇳","Thailand":"🇹🇭","Laos":"🇱🇦",
  "Myanmar":"🇲🇲","China":"🇨🇳","Papua New Guinea":"🇵🇬","Timor-Leste":"🇹🇱",
  "Filipina":"🇵🇭","Philippines":"🇵🇭","Jamaica":"🇯🇲","Hawaii":"🇺🇸","Amerika Serikat":"🇺🇸"
};
const bendera = n => BENDERA[n] || "🌍";

const NEGARA_UMUM = ["Indonesia","Ethiopia","Kenya","Colombia","Brazil","Guatemala",
"Costa Rica","El Salvador","Honduras","Panama","Peru","Bolivia","Ecuador","Mexico",
"Nicaragua","Rwanda","Burundi","Tanzania","Uganda","DR Congo","Yemen","India","Vietnam",
"Thailand","Laos","Myanmar","China","Papua New Guinea","Timor-Leste","Filipina","Jamaica"];

/* ---------- emoji catatan rasa ---------- */
const RASA_EMOJI = [
  [/coklat|cokelat|chocolate|cocoa|kakao|cacao/i, "🍫"],
  [/citrus|sitrus|jeruk|lemon|lime|orange|grapefruit/i, "🍊"],
  [/floral|bunga|kembang|jasmine|melati|rose|mawar|lavender/i, "🌸"],
  [/berry|beri|strawberry|stroberi|raspberry|blueberry|blackberry|blackcurrant/i, "🫐"],
  [/caramel|karamel|toffee|butterscotch/i, "🍮"],
  [/honey|madu|maple/i, "🍯"],
  [/sugar|gula|aren|palm|brown sugar|molasses/i, "🟤"],
  [/nut|kacang|almond|hazelnut|walnut|peanut|pecan/i, "🥜"],
  [/spice|rempah|cinnamon|kayu manis|clove|cengkeh|cardamom|kapulaga|pepper|lada|ginger|jahe|nutmeg/i, "🌿"],
  [/herbal|herb|jamu|lemongrass|sereal|serai|mint/i, "🍃"],
  [/tea|teh|black tea|earl grey|bergamot/i, "🍵"],
  [/peach|persik|apricot|aprikot|nectarine|plum|cherry|ceri/i, "🍑"],
  [/apple|apel|pear|pir/i, "🍏"],
  [/grape|anggur|wine|winey|fermented|fermentasi/i, "🍷"],
  [/tropical|tropis|mango|mangga|pineapple|nanas|papaya|pepaya|passion|markisa|lychee|leci|coconut|kelapa/i, "🥭"],
  [/melon|semangka|watermelon/i, "🍈"],
  [/banana|pisang/i, "🍌"],
  [/vanilla|vanila|cream|krim|milk|susu|yoghurt|yogurt|butter|mentega|cheese|keju/i, "🥛"],
  [/earthy|tanah|woody|kayu|cedar|tobacco|tembakau|leather|peat|gambut|mushroom|jamur/i, "🪵"],
  [/roast|sangrai|toast|panggang|smoky|asap|burnt|gosong|malt|biscuit|biskuit|bread|roti|cereal/i, "🍞"],
  [/date|kurma|raisin|kismis|fig|prune|dried/i, "🍇"],
  [/savoury|savory|umami|salt|garam|soy/i, "🧂"],
  [/juicy|juicy|syrup|sirup|sweet|manis/i, "💧"],
  [/clean|bersih|balanced|seimbang|complex|kompleks|bright|cerah|crisp/i, "✨"]
];
function rasaEmoji(n){
  for(const [re, e] of RASA_EMOJI) if(re.test(n)) return e;
  return "◆";
}

const RASA_UMUM = ["Chocolate","Dark chocolate","Milk chocolate","Caramel","Brown sugar",
"Palm sugar","Honey","Citrus","Orange","Lemon","Grapefruit","Floral","Jasmine","Rose",
"Black tea","Bergamot","Berry","Strawberry","Blueberry","Blackcurrant","Cherry","Peach",
"Apricot","Plum","Green apple","Pear","Grape","Winey","Tropical","Mango","Pineapple",
"Passion fruit","Lychee","Coconut","Almond","Hazelnut","Peanut","Cinnamon","Clove",
"Cardamom","Herbal","Lemongrass","Vanilla","Creamy","Yoghurt","Malt","Toast","Biscuit",
"Nutty","Earthy","Woody","Tobacco","Smoky","Raisin","Date","Fig","Umami","Clean","Juicy",
"Balanced","Complex","Bright","Syrupy","Full body"];

const PROSES_UMUM = ["Washed","Full washed","Double washed","Semi-washed",
"Giling basah (wet-hulled)","Natural","Extended natural","Honey","White honey","Yellow honey",
"Red honey","Black honey","Pulped natural","Anaerobic natural","Anaerobic washed",
"Carbonic maceration","Lactic","Koji","Yeast inoculated","Thermal shock","Double fermentation",
"Wine","Monsooned","Decaf Swiss Water","Decaf sugarcane EA"];

const VARIETAS_UMUM = ["Typica","Bourbon","Red Bourbon","Yellow Bourbon","Pink Bourbon",
"Caturra","Catuai","Mundo Novo","Pacas","Pacamara","Villa Sarchi","Maragogipe","SL28","SL34",
"Kent","Java","Gesha","Wush Wush","Sidra","Heirloom","Kurume","Wolisho","Dega","74110","74112",
"74158","Timor Hybrid","Catimor","Sarchimor","Castillo","Colombia","Ruiru 11","Batian",
"Marsellesa","IAPAR 59","Obata","Sigararutang","Ateng","P88","Andungsari","Komasti","Gayo 1",
"Gayo 2","Lini S 795","Bergendal","Robusta","Liberica","Excelsa"];

const METODE_UMUM = ["V60","Kalita Wave","Origami","Chemex","Switch","Clever","Aeropress",
"French press","Vietnam drip","Moka pot","Espresso","Cold brew","Japanese iced","Tubruk",
"Syphon","Batch brew","Cupping","Kopi susu"];

/* =====================================================================
   STORE — arsip lokal + sinkronisasi ke GitHub
   ===================================================================== */
const Store = {
  data: { versi: 1, diperbarui: null, kopi: [] },
  cfg: null,
  token: "",
  sha: null,
  status: "idle",       // idle | busy | ok | dirty | err | off
  pesan: "",
  siap: false,

  /* --- konfigurasi repo, ditebak dari alamat situs --- */
  tebakRepo(){
    const h = location.hostname;
    if(!/\.github\.io$/i.test(h)) return null;
    const owner = h.replace(/\.github\.io$/i, "");
    const seg = location.pathname.split("/").filter(Boolean);
    const dirs = seg.length && /\.html?$/i.test(seg[seg.length - 1]) ? seg.slice(0, -1) : seg;
    return { owner, repo: dirs.length ? dirs[0] : h, branch: "main", path: "data.json" };
  },

  muatCfg(){
    const simpan = ls.get(K_CFG, null);
    this.cfg = simpan || this.tebakRepo() || { owner:"", repo:"", branch:"main", path:"data.json" };
    this.token = ls.get(K_TOKEN, "") || "";
    this.sha = ls.get(K_SHA, null);
  },
  simpanCfg(c){ this.cfg = Object.assign({}, this.cfg, c); ls.set(K_CFG, this.cfg); },
  simpanToken(t){ this.token = t || ""; if(t) ls.set(K_TOKEN, t); else ls.del(K_TOKEN); },
  bisaTulis(){ return !!(this.token && this.cfg && this.cfg.owner && this.cfg.repo); },

  /* --- daftar kopi aktif (tanpa yang dihapus) --- */
  kopi(){ return this.data.kopi.filter(k => !k.dihapus); },
  cari(id){ return this.data.kopi.find(k => k.id === id && !k.dihapus) || null; },

  /* --- baca cepat dari localStorage --- */
  muatLokal(){
    const d = ls.get(K_DATA, null);
    if(d && Array.isArray(d.kopi)) this.data = d;
    this.siap = true;
  },
  simpanLokal(){ ls.set(K_DATA, this.data); },

  /* --- tulis satu catatan --- */
  async simpan(rec){
    rec.updatedAt = Date.now();
    const i = this.data.kopi.findIndex(k => k.id === rec.id);
    if(i >= 0) this.data.kopi[i] = rec; else this.data.kopi.push(rec);
    this.data.diperbarui = new Date().toISOString();
    this.simpanLokal();
    this.tandaiKotor();
    return this.dorong();
  },
  async hapus(id){
    const i = this.data.kopi.findIndex(k => k.id === id);
    if(i >= 0) this.data.kopi[i] = { id, dihapus: true, updatedAt: Date.now() };
    this.data.diperbarui = new Date().toISOString();
    this.simpanLokal();
    this.tandaiKotor();
    return this.dorong();
  },

  tandaiKotor(){ ls.set("jejakkopi.kotor", true); this.setStatus("dirty", "belum terkirim"); },
  bersih(){ ls.del("jejakkopi.kotor"); },
  adaKotor(){ return !!ls.get("jejakkopi.kotor", false); },

  setStatus(s, pesan){
    this.status = s; this.pesan = pesan || "";
    document.dispatchEvent(new CustomEvent("sync", { detail:{ status:s, pesan } }));
  },

  /* --- gabungkan dua daftar: yang updatedAt-nya terbaru menang --- */
  gabung(a, b){
    const m = new Map();
    [].concat(a || [], b || []).forEach(x => {
      if(!x || !x.id) return;
      const cur = m.get(x.id);
      if(!cur || (x.updatedAt || 0) >= (cur.updatedAt || 0)) m.set(x.id, x);
    });
    return Array.from(m.values());
  },

  hdr(){
    return {
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Authorization": "Bearer " + this.token
    };
  },
  url(){
    const c = this.cfg;
    return "https://api.github.com/repos/" + encodeURIComponent(c.owner) + "/" +
      encodeURIComponent(c.repo) + "/contents/" + c.path.split("/").map(encodeURIComponent).join("/");
  },

  /* --- tarik dari GitHub --- */
  async tarik(diam){
    if(!diam) this.setStatus("busy", "menarik…");
    try{
      let remote = null;
      if(this.bisaTulis()){
        const r = await fetch(this.url() + "?ref=" + encodeURIComponent(this.cfg.branch),
          { headers: this.hdr(), cache: "no-store" });
        if(r.status === 404){ this.sha = null; ls.del(K_SHA); remote = { versi:1, kopi:[] }; }
        else if(!r.ok) throw new Error(await pesanGh(r));
        else {
          const j = await r.json();
          this.sha = j.sha; ls.set(K_SHA, j.sha);
          let teks = "";
          if(j.content) teks = b64decode(j.content);
          else if(j.download_url){ const d = await fetch(j.download_url, {cache:"no-store"}); teks = await d.text(); }
          remote = teks ? JSON.parse(teks) : { versi:1, kopi:[] };
        }
      } else {
        const r = await fetch("data.json?v=" + Date.now(), { cache: "no-store" });
        if(!r.ok) throw new Error("data.json tidak terbaca (" + r.status + ")");
        remote = await r.json();
      }
      this.data.kopi = this.gabung(remote.kopi, this.data.kopi);
      this.data.versi = 1;
      this.simpanLokal();
      if(this.adaKotor()) this.setStatus("dirty", "belum terkirim");
      else this.setStatus(this.bisaTulis() ? "ok" : "off", this.bisaTulis() ? "tersinkron" : "lokal saja");
      return true;
    }catch(e){
      this.setStatus(this.bisaTulis() ? "err" : "off", e.message || "gagal menarik");
      return false;
    }
  },

  /* --- dorong ke GitHub (gabung dulu supaya perangkat lain tidak tertimpa) --- */
  async dorong(){
    if(!this.bisaTulis()){ this.setStatus("off", "tersimpan di perangkat ini"); return false; }
    this.setStatus("busy", "mengirim…");
    for(let coba = 0; coba < 2; coba++){
      try{
        // 1. baca versi terbaru di repo
        let remote = { versi:1, kopi:[] }, sha = null;
        const r = await fetch(this.url() + "?ref=" + encodeURIComponent(this.cfg.branch),
          { headers: this.hdr(), cache: "no-store" });
        if(r.ok){
          const j = await r.json(); sha = j.sha;
          let teks = j.content ? b64decode(j.content) : "";
          if(!teks && j.download_url){ const d = await fetch(j.download_url, {cache:"no-store"}); teks = await d.text(); }
          if(teks) remote = JSON.parse(teks);
        } else if(r.status !== 404){ throw new Error(await pesanGh(r)); }

        // 2. gabungkan
        this.data.kopi = this.gabung(remote.kopi, this.data.kopi);
        this.data.diperbarui = new Date().toISOString();
        this.simpanLokal();

        // 3. tulis
        const isi = JSON.stringify(this.data, null, 2);
        const put = await fetch(this.url(), {
          method: "PUT",
          headers: Object.assign({ "Content-Type": "application/json" }, this.hdr()),
          body: JSON.stringify({
            message: "arsip: perbarui data.json (" + this.kopi().length + " kopi)",
            content: b64encode(isi),
            branch: this.cfg.branch,
            sha: sha || undefined
          })
        });
        if(put.status === 409 || put.status === 422){ continue; }   // ada yang mendahului, ulangi
        if(!put.ok) throw new Error(await pesanGh(put));
        const j2 = await put.json();
        if(j2.content && j2.content.sha){ this.sha = j2.content.sha; ls.set(K_SHA, this.sha); }
        this.bersih();
        this.setStatus("ok", "tersinkron");
        return true;
      }catch(e){
        this.setStatus("err", e.message || "gagal mengirim");
        return false;
      }
    }
    this.setStatus("err", "bentrok, coba lagi");
    return false;
  },

  /* --- siapkan halaman --- */
  async init(){
    this.muatCfg();
    this.muatLokal();
    if(this.bisaTulis()) this.setStatus(this.adaKotor() ? "dirty" : "ok",
      this.adaKotor() ? "belum terkirim" : "tersinkron");
    else this.setStatus("off", "lokal saja");
    document.dispatchEvent(new CustomEvent("data-siap"));
    const ok = await this.tarik(true);
    if(ok || this.data.kopi.length) document.dispatchEvent(new CustomEvent("data-baru"));
    if(this.adaKotor() && this.bisaTulis()) this.dorong();
  }
};

async function pesanGh(r){
  let t = "";
  try{ const j = await r.json(); t = j.message || ""; }catch(e){}
  if(r.status === 401) return "Token ditolak (401). Periksa token di Pengaturan.";
  if(r.status === 403) return "Akses ditolak (403). Izin token kurang, atau batas API tercapai.";
  if(r.status === 404) return "Repo atau berkas tidak ditemukan (404). Periksa owner/repo/branch.";
  return "GitHub " + r.status + (t ? ": " + t : "");
}

/* --- base64 aman untuk teks UTF-8 --- */
function b64encode(str){
  const bytes = new TextEncoder().encode(str);
  let bin = ""; const step = 0x8000;
  for(let i = 0; i < bytes.length; i += step)
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
  return btoa(bin);
}
function b64decode(b64){
  const bin = atob(String(b64).replace(/\s/g, ""));
  const bytes = new Uint8Array(bin.length);
  for(let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/* =====================================================================
   KERANGKA HALAMAN — header & bilah tab
   ===================================================================== */
function shell(opts){
  opts = opts || {};
  const head = $("#appTop");
  if(head){
    head.innerHTML = `<div class="top-row">
      ${opts.kembali
        ? `<a class="back" href="${esc(opts.kembali)}">‹ ${esc(opts.kembaliTeks || "kembali")}</a>`
        : `<div class="brand">Jejak <span>Kopi</span></div>`}
      <button class="sync" id="syncPill" data-s="off" title="Buka pengaturan sinkronisasi">
        <span class="dot"></span><span id="syncTxt">—</span></button>
    </div>`;
    $("#syncPill").addEventListener("click", () => { location.href = "pengaturan.html"; });
    // tampilkan status yang sudah diketahui saat ini
    $("#syncPill").dataset.s = Store.status === "idle" ? "off" : Store.status;
    $("#syncTxt").textContent = Store.pesan || "memuat…";
  }
  const tabs = $("#appTabs");
  if(tabs){
    const items = [
      ["index.html", "Negara", '<path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'],
      ["telusur.html", "Telusur", '<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>'],
      ["catat.html", "Catat", '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'],
      ["pengaturan.html", "Atur", '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>']
    ];
    const now = (location.pathname.split("/").pop() || "index.html");
    tabs.innerHTML = items.map(([href, label, path]) =>
      `<a class="tab" href="${href}" ${href === now || (now === "" && href === "index.html")
        ? 'aria-current="page"' : ""}>
        <svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>${label}</a>`).join("");
  }
  document.addEventListener("sync", e => {
    const p = $("#syncPill"), t = $("#syncTxt");
    if(!p || !t) return;
    p.dataset.s = e.detail.status;
    t.textContent = e.detail.pesan || e.detail.status;
  });
}

/* --- isi <datalist> --- */
function datalist(id, arr){
  const el = document.getElementById(id); if(!el) return;
  el.innerHTML = arr.map(v => `<option value="${esc(v)}"></option>`).join("");
}

/* --- daftarkan service worker (mode luring) --- */
if("serviceWorker" in navigator && location.protocol.startsWith("http")){
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

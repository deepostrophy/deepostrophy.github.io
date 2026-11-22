/* ============================================================================
   shared.js — DEEPostrophy-র শেয়ার্ড স্তর। index.html ও admin.html দুটোই এটি ব্যবহার করে।
   ভেতরে আছে: শেয়ার্ড CSS, Firebase কনফিগ, রঙ/kind তালিকা, কেন্দ্রীয় অনুবাদ অবজেক্ট (i18n),
   DB লেয়ার (Firestore / localStorage অ্যাডাপ্টার), Auth, স্টেট + টেমপ্লেট, অ্যানিমেশন ইঞ্জিন,
   রুটিং হেল্পার, ক্লিক সাউন্ড ও কাস্টম কার্সার ইঞ্জিন।
   এই ফাইলে কোনো কনটেন্ট নেই — সব লেখা ডেটা মালিক কন্ট্রোল প্যানেল থেকে আসে।
   admin.html-এ window.DEEO_ADMIN = true থাকলে মোজাইক/ড্রিফট/স্ট্যাগার অ্যানিমেশন চলবে না।
   ============================================================================ */

/* ---- শেয়ার্ড CSS — দুটি পেজই হুবহু একই ডিজাইন ---- */
const SHARED_CSS = String.raw`
  :root{
    --bg:#07070c; --bg-2:#0b0b14; --ink:#eef0ff; --muted:#a7a9c4; --faint:#71738f;
    --a1:#8b5cf6; --a2:#22d3ee;
    --glass:rgba(255,255,255,.045); --glass-strong:rgba(255,255,255,.07);
    --stroke:rgba(255,255,255,.10); --stroke-2:rgba(255,255,255,.18);
    --shadow:0 24px 60px -24px rgba(0,0,0,.7);
    --radius:22px; --radius-sm:14px; --ease:cubic-bezier(.22,.61,.36,1); --dur:520ms;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;font-family:"Noto Sans Bengali", system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink);line-height:1.6;
    -webkit-font-smoothing:antialiased;overflow-x:hidden;min-height:100vh;
    background:radial-gradient(1200px 620px at 12% -8%,rgba(139,92,246,.20),transparent 60%),radial-gradient(1000px 560px at 92% 6%,rgba(34,211,238,.14),transparent 55%),radial-gradient(900px 700px at 50% 118%,rgba(139,92,246,.12),transparent 60%),linear-gradient(180deg,var(--bg),var(--bg-2) 60%,var(--bg));background-attachment:fixed}
  a{color:inherit;text-decoration:none} img{max-width:100%;display:block}
  /* EN মোডে লাতিন টেক্সট পরিষ্কার দেখানোর ফন্ট */
  html[lang="en"] body{font-family:"Inter","Noto Sans Bengali", system-ui,-apple-system,"Segoe UI",sans-serif}
  .wrap{width:min(1180px,92vw);margin-inline:auto} .en{letter-spacing:.2px}
  code,.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}

  header.nav{position:sticky;top:0;z-index:50;backdrop-filter:saturate(150%) blur(16px);-webkit-backdrop-filter:saturate(150%) blur(16px);
    background:linear-gradient(180deg,rgba(7,7,12,.72),rgba(7,7,12,.35));border-bottom:1px solid var(--stroke)}
  .nav-inner{display:flex;align-items:center;gap:18px;height:70px}
  .brand{display:flex;align-items:center;gap:11px;font-weight:800;letter-spacing:.2px;cursor:pointer}
  .brand .dot{width:13px;height:13px;border-radius:50%;background:conic-gradient(from 210deg,var(--a1),var(--a2),var(--a1));box-shadow:0 0 18px 1px rgba(139,92,246,.7)}
  .brand .brand-mark{height:32px;width:auto;display:block;filter:drop-shadow(0 0 10px rgba(139,92,246,.35))}
  .brand .name{font-size:19px} .brand .name .glow{background:linear-gradient(92deg,var(--a1),var(--a2));-webkit-background-clip:text;background-clip:text;color:transparent}
  .nav-links{margin-left:auto;display:flex;gap:6px;align-items:center}
  .nav-links a{padding:9px 15px;border-radius:12px;color:var(--muted);font-weight:600;font-size:15px;transition:color .25s var(--ease),background .25s var(--ease)}
  .nav-links a:hover{color:var(--ink);background:var(--glass)} .nav-links a.active{color:var(--ink);background:var(--glass-strong);border:1px solid var(--stroke)}
  .burger{display:none;margin-left:auto;width:44px;height:40px;border-radius:12px;border:1px solid var(--stroke);background:var(--glass);color:var(--ink);cursor:pointer;font-size:20px}
  .nav-tools{margin-left:10px;display:flex;gap:8px;align-items:center}
  .nav-tool{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:999px;border:1px solid var(--stroke);background:var(--glass);color:var(--muted);
    font-family:inherit;font-size:12.5px;font-weight:700;letter-spacing:.02em;cursor:pointer;transition:color .22s var(--ease),border-color .22s var(--ease),background .22s var(--ease),transform .22s var(--ease)}
  .nav-tool:hover{color:var(--ink);border-color:var(--stroke-2);background:var(--glass-strong);transform:translateY(-1px)}
  .nav-tool svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;display:block}
  .nav-tool .lb{opacity:.42;transition:opacity .22s var(--ease),color .22s var(--ease)} .nav-tool .lb.on{opacity:1;color:var(--ink)}
  .nav-tool .sep{opacity:.3;font-weight:500}
  .nav-tool #sound-off-line{display:none} .nav-tool.muted #sound-on-wave{display:none} .nav-tool.muted #sound-off-line{display:block}
  @media(max-width:820px){ .nav-tools{gap:6px} .nav-tool{padding:0 10px;height:34px} }

  /* ---- ভাষা ড্রপডাউন — টগলের জায়গায়, উপরে সার্চ, প্রতিটি ভাষা নিজের লিপিতে ---- */
  .lang-dd{position:relative}
  .lang-dd .nav-tool{white-space:nowrap}
  .lang-dd .ld-cur{color:var(--ink);opacity:1}
  .lang-dd .ld-caret{font-size:11px;opacity:.6;margin-left:-2px}
  .lang-menu{position:absolute;top:calc(100% + 10px);right:0;width:236px;max-width:80vw;z-index:90;
    background:rgba(11,10,22,.92);backdrop-filter:saturate(150%) blur(18px);-webkit-backdrop-filter:saturate(150%) blur(18px);
    border:1px solid var(--stroke-2);border-radius:16px;box-shadow:var(--shadow);padding:8px;
    display:flex;flex-direction:column;gap:6px;animation:lmIn .18s var(--ease)}
  .lang-menu[hidden]{display:none}
  @keyframes lmIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
  .lm-search input{width:100%;height:34px;padding:0 12px;border-radius:10px;border:1px solid var(--stroke);
    background:var(--glass);color:var(--ink);font-family:inherit;font-size:13px;outline:none;transition:border-color .18s var(--ease),background .18s var(--ease)}
  .lm-search input:focus{border-color:var(--a1);background:var(--glass-strong)}
  .lm-list{list-style:none;margin:0;padding:0;max-height:262px;overflow:auto;display:flex;flex-direction:column;gap:2px}
  .lm-list li{display:flex;align-items:baseline;gap:8px;padding:8px 10px;border-radius:10px;cursor:pointer;transition:background .16s var(--ease)}
  .lm-list li:hover,.lm-list li.hi{background:var(--glass-strong);outline:none}
  .lm-list li .lm-native{font-size:14px;color:var(--ink);font-family:"Noto Sans Bengali","Noto Sans JP","Noto Sans Devanagari","Segoe UI",system-ui,sans-serif}
  .lm-list li .lm-latin{font-size:11.5px;color:var(--muted)}
  .lm-list li[aria-selected="true"]{background:linear-gradient(90deg,rgba(139,92,246,.24),rgba(34,211,238,.14))}
  .lm-list li[aria-selected="true"] .lm-native{color:var(--a2);font-weight:700}
  .lm-list li .lm-check{margin-left:auto;opacity:0;color:var(--a2);font-size:13px}
  .lm-list li[aria-selected="true"] .lm-check{opacity:1}
  .lm-empty{margin:0;padding:10px;text-align:center;font-size:12.5px;color:var(--muted)}
  .lm-empty[hidden]{display:none}
  @media(max-width:820px){ .lang-menu{width:210px} }

  /* ---- কাস্টম কার্সার (§৭) ---- */
  .cursor-on, .cursor-on *{cursor:none !important}
  #cursor{position:fixed;left:0;top:0;width:32px;height:32px;z-index:2147483000;pointer-events:none;opacity:0;
    transform:translate3d(-64px,-64px,0);will-change:transform;transition:opacity .16s var(--ease)}
  #cursor img{position:absolute;inset:0;width:100%;height:100%;-webkit-user-drag:none;user-select:none;
    transition:transform .14s var(--ease),filter .14s var(--ease)}
  #cursor .dot,#cursor .ring{position:absolute;left:50%;top:50%;border-radius:50%;display:none}
  #cursor .dot{width:9px;height:9px;margin:-4.5px 0 0 -4.5px;background:var(--a1);box-shadow:0 0 14px 3px rgba(139,92,246,.65)}
  #cursor .ring{width:24px;height:24px;margin:-12px 0 0 -12px;border:1.5px solid var(--a2)}
  #cursor.fallback img{display:none} #cursor.fallback .dot,#cursor.fallback .ring{display:block}
  #cursor.hot img{transform:scale(1.16);filter:brightness(1.3) drop-shadow(0 0 7px rgba(34,211,238,.5))}
  #cursor.hot.fallback .ring{transform:scale(1.16);filter:brightness(1.25)}
  #cursor.show{opacity:1}
  #cursor.no-anim,#cursor.no-anim img,#cursor.no-anim .ring{transition:none}
  @media(max-width:820px){
    .burger{display:block}
    .nav-links{position:fixed;inset:70px 4vw auto 4vw;flex-direction:column;align-items:stretch;background:rgba(11,11,20,.92);backdrop-filter:blur(18px);border:1px solid var(--stroke);border-radius:18px;padding:10px;gap:4px;box-shadow:var(--shadow);transform:translateY(-12px);opacity:0;pointer-events:none;transition:.28s var(--ease)}
    .nav-links.open{transform:translateY(0);opacity:1;pointer-events:auto} .nav-links a{padding:13px 15px}
  }

  .modebar{display:none;align-items:center;gap:10px;padding:9px 14px;border-bottom:1px solid var(--stroke);background:rgba(34,211,238,.06);font-size:13px;color:var(--muted)}
  .modebar.show{display:flex} .modebar .pill{margin-left:auto;font-weight:800;color:var(--a2)}

  main{display:block} .page{display:none;padding:44px 0 90px} .page.show{display:block}
  .eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--a2);letter-spacing:.3px}
  .eyebrow::before{content:"";width:22px;height:2px;background:linear-gradient(90deg,var(--a2),transparent);border-radius:2px}
  h1.hero{font-size:clamp(36px,8vw,88px);line-height:.98;font-weight:800;margin:14px 0 6px;letter-spacing:-1px;word-break:break-word}
  h1.hero .grad{background:linear-gradient(96deg,#fff 0%,var(--a1) 52%,var(--a2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
  .sub{font-size:clamp(16px,2.4vw,21px);color:var(--muted);max-width:60ch}
  .hero-row{display:flex;align-items:center;gap:clamp(12px,3vw,36px);flex-wrap:wrap}
  .hero-row h1.hero{flex:0 1 auto;min-width:0}
  .hero-anim{flex:1 1 260px;width:100%;max-width:400px;height:auto;aspect-ratio:6/5;pointer-events:none;user-select:none}
  @media(max-width:820px){.hero-anim{max-width:340px;flex-basis:100%;margin:0 auto}}
  .hero-grid{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px}
  .hero-copy{flex:1 1 320px;min-width:0}
  .hero-row{position:relative}
  .hero-row::before{content:"";position:absolute;left:-6%;top:-14%;width:70%;height:70%;background:radial-gradient(50% 50% at 35% 35%,rgba(139,92,246,.20),transparent 72%);filter:blur(26px);z-index:-1;pointer-events:none}
  h1.hero .grad{background:linear-gradient(96deg,#fff 0%,var(--a1) 40%,var(--a2) 70%,var(--a1) 100%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:heroShine 7s ease-in-out infinite}
  @keyframes heroShine{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
  .hero-feats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:26px;max-width:560px}
  .hero-feats .hf{display:flex;gap:11px;align-items:flex-start;padding:12px 13px;border:1px solid var(--stroke);border-radius:14px;background:var(--glass);transition:transform .25s var(--ease),border-color .25s var(--ease)}
  .hero-feats .hf:hover{transform:translateY(-3px);border-color:var(--stroke-2)}
  .hero-feats .hf .ic{font-size:20px;line-height:1.1}
  .hero-feats .hf .tx b{display:block;font-size:14px;font-weight:700}
  .hero-feats .hf .tx span{display:block;font-size:12px;color:var(--muted);margin-top:2px}
  .kicker-flash{animation:kickerFlash 2s ease-in-out infinite}
  @keyframes kickerFlash{0%,42%{opacity:1}50%{opacity:.12}58%,100%{opacity:1}}

  .btn{display:inline-flex;align-items:center;gap:9px;font-weight:700;font-size:15px;cursor:pointer;padding:12px 20px;border-radius:14px;border:1px solid var(--stroke);background:var(--glass);color:var(--ink);transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease),background .3s,border-color .3s}
  .btn:hover{transform:translateY(-2px);box-shadow:0 14px 30px -14px rgba(139,92,246,.6);border-color:var(--stroke-2)}
  .btn.primary{background:linear-gradient(96deg,var(--a1),var(--a2));border:none;color:#0a0a12;box-shadow:0 16px 40px -16px rgba(34,211,238,.5)}
  .btn.ghost{background:transparent} .btn.sm{padding:8px 14px;font-size:13.5px;border-radius:11px}
  .btn.disabled,.btn[disabled]{opacity:.5;pointer-events:none;filter:grayscale(.4)}
  .btn.full{width:100%;justify-content:center}

  .section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin:52px 0 22px;flex-wrap:wrap}
  .section-head h2{font-size:clamp(24px,4vw,34px);margin:0;font-weight:800;letter-spacing:-.3px} .section-head p{margin:6px 0 0;color:var(--muted)}

  .grid{display:grid;gap:20px;grid-template-columns:repeat(auto-fill,minmax(290px,1fr))}
  .grid.stores{grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
  .card{position:relative;border-radius:var(--radius);overflow:hidden;background:rgba(255,255,255,.06);border:1px solid var(--stroke);box-shadow:var(--shadow);transition:transform var(--dur) var(--ease),border-color var(--dur) var(--ease),box-shadow var(--dur) var(--ease);display:flex;flex-direction:column}
  .card:hover{transform:translateY(-6px);border-color:var(--stroke-2);box-shadow:0 40px 80px -32px rgba(0,0,0,.85),0 0 0 1px rgba(139,92,246,.25)}
  .cover{height:170px;position:relative;display:flex;align-items:flex-end;padding:16px;overflow:hidden}
  .cover .glow{position:absolute;inset:0} .cover .thumb{position:absolute;inset:0;object-fit:cover;width:100%;height:100%}
  .cover canvas.mosaic{position:absolute;inset:0;width:100%;height:100%;z-index:4;pointer-events:none}
  .cover .cover-anim{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;background:transparent;border:0;z-index:5}
  .cover .type{position:relative;z-index:6;font-size:12.5px;font-weight:700;color:#fff;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.2);padding:5px 11px;border-radius:999px}
  .card-body{padding:18px 18px 20px;display:flex;flex-direction:column;gap:11px;flex:1}
  .card-body h3{margin:0;font-size:20px;font-weight:800;letter-spacing:-.2px}
  .card-body .tagline{margin:-4px 0 0;color:var(--muted);font-size:14.5px;line-height:1.55}
  .langs{display:flex;flex-wrap:wrap;gap:7px;margin-top:2px}
  .chip{font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;border:1px solid var(--stroke);background:var(--glass);color:var(--muted)}
  .chip.en{font-family:ui-monospace,Menlo,monospace}
  .card-actions{display:flex;gap:9px;margin-top:auto;padding-top:6px;flex-wrap:wrap}
  .flag{position:absolute;left:14px;top:14px;z-index:6;font-size:11px;font-weight:800;letter-spacing:.3px;padding:4px 9px;border-radius:8px}
  .flag.feat{background:linear-gradient(96deg,var(--a1),var(--a2));color:#0a0a12} .flag.draft{background:rgba(0,0,0,.4);color:#ffd27a;border:1px solid rgba(255,210,122,.35)}

  /* --- v6.9.8 পরিসংখ্যান + রিঅ্যাকশন --- */
  .item-stat{display:flex;gap:14px;margin-top:10px;font-size:12.5px;color:var(--muted);font-weight:600}
  .item-stat .is-d,.item-stat .is-r{display:inline-flex;gap:5px;align-items:center}
  .item-stat b{color:var(--ink);font-weight:700}
  .stat-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
  .stat{flex:1 1 0;min-width:92px;display:flex;flex-direction:column;align-items:center;gap:2px;padding:12px 8px;
    border-radius:14px;background:var(--glass);border:1px solid var(--stroke)}
  .stat i{font-size:18px;font-style:normal}
  .stat b{font-size:20px;font-weight:800;background:linear-gradient(92deg,var(--a1),var(--a2));-webkit-background-clip:text;background-clip:text;color:transparent}
  .stat em{font-style:normal;font-size:11.5px;color:var(--muted)}
  .rx-bar{display:flex;gap:10px;flex-wrap:wrap;margin-top:4px}
  .rx{display:inline-flex;align-items:center;gap:7px;cursor:pointer;font-family:inherit;color:var(--ink);
    padding:8px 14px;border-radius:999px;background:var(--glass);border:1px solid var(--stroke);
    transition:transform .2s var(--ease),background .2s var(--ease),border-color .2s var(--ease)}
  .rx:hover{transform:translateY(-2px);border-color:var(--stroke-2)}
  .rx .rx-e{font-size:17px;line-height:1} .rx .rx-n{font-size:14px;font-weight:800}
  .rx.on{background:linear-gradient(92deg,rgba(139,92,246,.28),rgba(34,211,238,.18));border-color:var(--a1)}
  .rx[disabled]{opacity:.6;cursor:progress}
  @media (prefers-reduced-motion: reduce){.rx{transition:none}.rx:hover{transform:none}}

  .store-card{padding:22px;align-items:flex-start;gap:12px}
  .store-card .sicon{width:54px;height:54px;border-radius:16px;display:grid;place-items:center;font-size:26px;border:1px solid var(--stroke-2)}
  .store-card .skind{font-size:12px;font-weight:700;color:var(--a2)} .store-card h3{font-size:21px;margin:0}
  .store-card .sdesc{color:var(--muted);font-size:14px;margin:0;flex:1} .store-card .scount{font-size:13px;color:var(--faint);font-weight:700}

  .toolbar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
  .search{flex:1;min-width:220px;display:flex;align-items:center;gap:10px;background:var(--glass);border:1px solid var(--stroke);border-radius:14px;padding:11px 15px}
  .search input{flex:1;background:transparent;border:none;outline:none;color:var(--ink);font:inherit;font-size:15px}
  .search svg{width:18px;height:18px;stroke:var(--faint);fill:none;stroke-width:2}
  .filters{display:flex;gap:9px;flex-wrap:wrap}
  .filter{cursor:pointer;font-weight:700;font-size:14px;color:var(--muted);padding:9px 15px;border-radius:12px;border:1px solid var(--stroke);background:var(--glass);transition:.25s var(--ease)}
  .filter:hover{color:var(--ink)} .filter.on{color:#0a0a12;background:linear-gradient(96deg,var(--a1),var(--a2));border-color:transparent}

  .drift-wrap{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
  .drift-track{display:flex;gap:10px;width:max-content;will-change:transform;padding:2px 0} .drift-track .chip{white-space:nowrap;cursor:default}

  .empty{border:1px dashed var(--stroke-2);border-radius:var(--radius);padding:40px 24px;text-align:center;color:var(--muted);background:var(--glass)}
  .empty b{color:var(--ink);display:block;font-size:18px;margin-bottom:6px}
  .skeleton{border:1px solid var(--stroke);border-radius:var(--radius);background:var(--glass);position:relative;overflow:hidden;min-height:280px}
  .skeleton::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent);transform:translateX(-100%);animation:sh 1.2s infinite}
  @keyframes sh{to{transform:translateX(100%)}}

  .back{display:inline-flex;gap:8px;align-items:center;color:var(--muted);font-weight:700;margin-bottom:18px;cursor:pointer;transition:.25s var(--ease)}
  .back:hover{color:var(--ink);transform:translateX(-3px)}
  .detail-hero{border-radius:var(--radius);overflow:hidden;border:1px solid var(--stroke);background:var(--glass);box-shadow:var(--shadow);position:relative}
  .detail-cover{height:250px;position:relative;display:flex;align-items:flex-end;padding:26px;overflow:hidden}
  .detail-cover canvas.mosaic{position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none}
  .detail-cover .cover-anim{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;background:transparent;border:0;z-index:4}
  .detail-cover .title{position:relative;z-index:5} .detail-cover h2{margin:0;font-size:clamp(28px,6vw,50px);font-weight:800}
  .detail-cover p{margin:6px 0 0;color:rgba(255,255,255,.92);max-width:60ch}
  .detail-body{display:grid;grid-template-columns:1.6fr 1fr;gap:22px;margin-top:22px}
  @media(max-width:820px){.detail-body{grid-template-columns:1fr}}
  .panel{background:rgba(255,255,255,.06);border:1px solid var(--stroke);border-radius:var(--radius);padding:22px}
  .panel h3{margin:0 0 12px;font-size:18px;font-weight:800}
  .readme{white-space:pre-wrap;color:var(--muted);font-size:14.5px;line-height:1.8}
  .kv{display:flex;flex-direction:column;gap:12px} .kv .row{display:flex;justify-content:space-between;gap:12px;font-size:14px} .kv .row b{color:var(--muted);font-weight:600}
  .prose{color:var(--muted);font-size:16px;line-height:1.85;white-space:pre-wrap}

  .social{display:flex;flex-direction:column;gap:12px}
  .social a{display:flex;align-items:center;gap:12px;padding:14px 16px;border:1px solid var(--stroke);border-radius:14px;background:var(--glass);font-weight:700;transition:.25s var(--ease)}
  .social a:hover{transform:translateX(4px);border-color:var(--stroke-2)}
  .social .ic{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(96deg,var(--a1),var(--a2));color:#0a0a12;font-weight:800}
  .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:24px}
  @media(max-width:820px){.contact-grid{grid-template-columns:1fr}}

  /* অ্যাডমিন */
  .login{max-width:420px;margin:36px auto}
  .login .card{padding:28px;align-items:stretch}
  .badge-sec{display:inline-flex;gap:8px;align-items:center;font-size:12.5px;color:var(--faint);margin-top:14px;line-height:1.5}
  .tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px;border-bottom:1px solid var(--stroke);padding-bottom:10px}
  .tab{cursor:pointer;font-weight:700;font-size:14.5px;color:var(--muted);padding:9px 16px;border-radius:12px;border:1px solid transparent;background:transparent;transition:color .2s,background .2s}
  .tab:hover{color:var(--ink)} .tab.on{color:var(--ink);background:var(--glass-strong);border-color:var(--stroke)}
  .tab .cnt{font-size:11px;background:rgba(255,255,255,.1);border-radius:999px;padding:1px 7px;margin-left:6px}
  .admin-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px} .admin-bar .sp{flex:1}
  table.pm{width:100%;border-collapse:collapse;font-size:14px}
  table.pm th{text-align:left;color:var(--faint);font-weight:700;font-size:12.5px;padding:10px 12px;border-bottom:1px solid var(--stroke)}
  table.pm td{padding:12px;border-bottom:1px solid var(--stroke);vertical-align:middle}
  table.pm tr:hover td{background:rgba(255,255,255,.02)}
  .row-actions{display:flex;gap:6px;flex-wrap:wrap}
  .mini{font-size:12px;font-weight:700;padding:5px 9px;border-radius:9px;border:1px solid var(--stroke);background:var(--glass);color:var(--muted);cursor:pointer;transition:color .15s,border-color .15s}
  .mini:hover{color:var(--ink);border-color:var(--stroke-2)} .mini.danger:hover{color:#ff9a9a;border-color:rgba(255,154,154,.4)}
  .toggle{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700}
  .sw{width:38px;height:22px;border-radius:999px;background:rgba(255,255,255,.14);position:relative;cursor:pointer;transition:background .2s;border:1px solid var(--stroke);flex:none}
  .sw::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s}
  .sw.on{background:linear-gradient(96deg,var(--a1),var(--a2));border-color:transparent} .sw.on::after{transform:translateX(16px)}

  .field{display:flex;flex-direction:column;gap:7px;margin-bottom:15px}
  .field label{font-size:13.5px;font-weight:700;color:var(--muted)}
  .field input,.field textarea,select.pf{background:var(--glass);border:1px solid var(--stroke);border-radius:12px;padding:12px 14px;color:var(--ink);font:inherit;font-size:15px;outline:none;transition:border-color .2s,box-shadow .2s}
  .field input:focus,.field textarea:focus,select.pf:focus{border-color:var(--a2);box-shadow:0 0 0 3px rgba(34,211,238,.16)}
  .field textarea{resize:vertical;min-height:110px}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:14px} .three{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
  @media(max-width:560px){.two,.three{grid-template-columns:1fr}}
  .note{font-size:13px;color:var(--faint);line-height:1.6}
  .accent-swatches{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .sw-acc{width:34px;height:34px;border-radius:10px;border:2px solid transparent;cursor:pointer;position:relative}
  .sw-acc.on{outline:2px solid #fff;outline-offset:1px} .sw-acc input[type=color]{position:absolute;inset:0;opacity:0;cursor:pointer}
  .social-editor{display:flex;flex-direction:column;gap:10px}
  .social-editor .se-row{display:flex;gap:8px} .social-editor .se-row input{flex:1;background:var(--glass);border:1px solid var(--stroke);border-radius:10px;padding:9px 12px;color:var(--ink);font:inherit;outline:none}
  .img-preview{display:block;width:100%;height:74px;border-radius:12px;background-size:cover;background-position:center;border:1px solid var(--stroke);margin-top:8px}

  dialog.modal{border:1px solid var(--stroke-2);background:var(--bg-2);color:var(--ink);border-radius:var(--radius);padding:0;width:min(600px,94vw);box-shadow:var(--shadow)}
  dialog.modal::backdrop{background:rgba(0,0,0,.6);backdrop-filter:blur(4px)}
  .modal-head{display:flex;align-items:center;justify-content:space-between;padding:20px 22px;border-bottom:1px solid var(--stroke)} .modal-head h3{margin:0;font-size:19px}
  .modal-body{padding:22px;max-height:72vh;overflow:auto} .modal-foot{display:flex;gap:10px;justify-content:flex-end;padding:18px 22px;border-top:1px solid var(--stroke)}

  /* ▶ প্লে / iframe গেম মোডাল */
  .btn.play{background:linear-gradient(96deg,#22c55e,#a3e635);border:none;color:#06210f;box-shadow:0 16px 40px -16px rgba(34,197,94,.5)}
  dialog.modal.play-modal{width:min(1100px,96vw);max-height:92vh;padding:0}
  dialog.modal.play-modal[open]{display:flex;flex-direction:column}
  .play-modal .modal-head{padding:14px 18px} .play-modal .modal-head h3{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70vw}
  .play-modal .mh-tools{display:flex;gap:8px;flex:0 0 auto}
  .play-modal .modal-body{padding:0;flex:1 1 auto;min-height:58vh;max-height:none;position:relative;overflow:hidden;display:flex;background:#0a0a12}
  .play-modal iframe{flex:1 1 auto;width:100%;height:100%;min-height:58vh;border:0;display:block;background:#0a0a12;color-scheme:normal}
  .play-modal .modal-foot{padding:12px 18px;align-items:center;justify-content:space-between}
  .play-load{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#0a0a12;color:var(--muted);font-size:14px;z-index:2;transition:opacity .3s}
  .play-load.hide{opacity:0;pointer-events:none}
  .play-spin{width:46px;height:46px;border-radius:50%;border:4px solid rgba(255,255,255,.14);border-top-color:#22c55e;animation:playspin 1s linear infinite}
  @keyframes playspin{to{transform:rotate(360deg)}}
  dialog.play-modal:fullscreen{width:100vw;max-width:100vw;height:100vh;max-height:100vh;border-radius:0;border:none}
  dialog.play-modal:fullscreen::backdrop{display:none}
  dialog.play-modal:fullscreen .modal-body,dialog.play-modal:fullscreen iframe{min-height:0}
  @media (max-width:640px),(orientation:landscape) and (max-height:560px){
    dialog.modal.play-modal{width:100vw;max-width:100vw;height:100vh;height:100dvh;max-height:100dvh;margin:0;border:0;border-radius:0}
    .play-modal .modal-head{padding:8px 12px} .play-modal .modal-head h3{font-size:15px;max-width:55vw}
    .play-modal .modal-body{min-height:0;flex:1 1 auto}
    .play-modal iframe{min-height:0;height:100%}
    .play-modal .modal-foot{padding:8px 12px}
    dialog.modal.play-modal::backdrop{background:#000}
  }
  .reduce-motion .play-spin{animation:none;border-top-color:#22c55e}
  .grp{border-top:1px solid var(--stroke);margin:6px 0 14px;padding-top:14px} .grp > label{color:var(--a2);font-size:12.5px;text-transform:none;letter-spacing:.3px;font-weight:800;display:block;margin-bottom:10px}

  /* FAQ / হেল্পার */
  .helper-fab{position:fixed;right:22px;bottom:22px;z-index:60;width:58px;height:58px;border-radius:50%;border:1px solid var(--stroke-2);cursor:pointer;
    background:linear-gradient(120deg,var(--a1),var(--a2));color:#0a0a12;font-size:26px;display:grid;place-items:center;box-shadow:0 18px 40px -14px rgba(34,211,238,.6)}
  .helper-panel{position:fixed;right:22px;bottom:90px;z-index:60;width:min(380px,92vw);max-height:70vh;display:none;flex-direction:column;
    background:rgba(11,11,20,.96);border:1px solid var(--stroke-2);border-radius:20px;box-shadow:var(--shadow);overflow:hidden}
  .helper-panel.open{display:flex}
  .helper-panel .hh{padding:16px 18px;border-bottom:1px solid var(--stroke);display:flex;align-items:center;gap:8px}
  .helper-panel .hh h4{margin:0;font-size:16px} .helper-panel .hh .mini{margin-left:auto}
  .helper-panel .hb{padding:16px 18px;overflow:auto}
  .faq-q{padding:12px 14px;border:1px solid var(--stroke);border-radius:12px;background:var(--glass);margin-bottom:9px;cursor:pointer;font-weight:700;font-size:14.5px;transition:.2s var(--ease)}
  .faq-q:hover{border-color:var(--stroke-2)} .faq-a{color:var(--muted);font-size:14px;line-height:1.75;padding:2px 14px 12px;white-space:pre-wrap;display:none}
  .faq-item.open .faq-a{display:block}

  footer{border-top:1px solid var(--stroke);margin-top:30px;padding:28px 0;background:rgba(7,7,12,.4)}
  .foot{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;color:var(--faint);font-size:14px} .foot a:hover{color:var(--ink)}

  .boot{position:fixed;inset:0;z-index:80;display:grid;place-items:center;background:var(--bg);transition:opacity .4s} .boot.hide{opacity:0;pointer-events:none}
  .boot .ring{width:46px;height:46px;border-radius:50%;border:3px solid rgba(255,255,255,.15);border-top-color:var(--a2);animation:spin .8s linear infinite} @keyframes spin{to{transform:rotate(360deg)}}
  /* loader.svg-ভিত্তিক ইনলাইন লোডার (boot + ছোট ইনলাইন) — অ্যানিমেশন CSS এখানে, যাতে reduced-motion নিয়ন্ত্রণ করা যায় */
  .boot-inner{display:grid;place-items:center}
  .boot-anim{width:min(92vw,760px);height:auto;display:block;user-select:none;-webkit-user-drag:none}
  .dlr{display:block;line-height:0}
  .dlr-sq{fill:none;stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:400;stroke-dashoffset:400;transform-origin:100px 100px;animation:drawSquare 2.4s cubic-bezier(.65,0,.35,1) infinite}
  .dlr-logo{fill:#00A8FF;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-weight:800;font-size:46px;letter-spacing:-2px;text-anchor:middle;dominant-baseline:central;transform-origin:100px 104px;animation:pulseLogo 2.4s ease-in-out infinite}
  .dlr-ap{fill:#0082FF}
  @keyframes drawSquare{0%{stroke-dashoffset:400}50%{stroke-dashoffset:0}100%{stroke-dashoffset:-400}}
  @keyframes pulseLogo{0%,100%{transform:scale(.95);opacity:.85}50%{transform:scale(1.06);opacity:1}}
  .ldr-inline{display:inline-block;vertical-align:middle;line-height:0}

  /* টেক্সট মোজাইক */
  .mx{display:inline-block;white-space:pre-wrap} .mx .c{display:inline-block;will-change:transform,opacity}

  .reveal{opacity:0;transform:translateY(26px);transition:opacity var(--dur) var(--ease),transform var(--dur) var(--ease);transition-delay:calc(var(--i,0)*70ms)} .reveal.in{opacity:1;transform:none}

  /* --- Welcome overlay --- */
  .welcome{position:fixed;inset:0;z-index:2000;display:grid;place-items:center;text-align:center;padding:24px;
    background:radial-gradient(900px 600px at 50% 30%,rgba(139,92,246,.22),transparent 60%),linear-gradient(180deg,var(--bg),var(--bg-2));
    opacity:1;transition:opacity .5s var(--ease)}
  .welcome.gone{opacity:0;pointer-events:none}
  .welcome .wtitle{font-size:clamp(30px,7vw,64px);font-weight:800;letter-spacing:-1px;margin:0 0 6px}
  .welcome .wtitle .grad{background:linear-gradient(96deg,var(--a1),var(--a2));-webkit-background-clip:text;background-clip:text;color:transparent}
  .welcome .wsub{color:var(--muted);font-size:16px;margin:0 auto 26px;max-width:520px}
  .glow-btn{position:relative;border:none;cursor:pointer;color:#0a0a12;font-weight:800;font-size:17px;padding:15px 34px;border-radius:16px;
    background:linear-gradient(96deg,var(--a1),var(--a2));animation:glowPulse 2.4s ease-in-out infinite}
  @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,.45),0 16px 40px -16px rgba(34,211,238,.6)}50%{box-shadow:0 0 34px 6px rgba(139,92,246,.35),0 16px 40px -16px rgba(34,211,238,.7)}}
  .welcome .wskip{display:block;margin:18px auto 0;color:var(--muted);background:none;border:none;cursor:pointer;font-size:14px;text-decoration:underline}

  /* --- Navbar sign-in + avatar --- */
  .nav-signin{font-weight:700;font-size:13.5px;color:var(--ink);background:transparent;border:1px solid var(--stroke);border-radius:11px;padding:9px 14px;cursor:pointer;transition:.2s var(--ease)}
  .nav-signin:hover{border-color:var(--a2);color:#fff}
  .nav-avatar{width:38px;height:38px;border-radius:50%;border:1px solid var(--stroke-2);cursor:pointer;font-weight:800;font-size:15px;color:#0a0a12;
    background:linear-gradient(120deg,var(--a1),var(--a2));display:grid;place-items:center;padding:0}

  /* --- Auth modal --- */
  .auth-tabs{display:flex;gap:8px;margin-bottom:16px}
  .auth-tabs .tab.on{color:#0a0a12;background:linear-gradient(96deg,var(--a1),var(--a2));border-color:transparent}
  .linkbtn{background:none;border:none;color:var(--muted);cursor:pointer;font-size:14px;text-decoration:underline;padding:0}
  .linkbtn:hover{color:var(--ink)}

  /* --- Account --- */
  .acct-grid{display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));margin-top:22px}
  .acct-card{border:1px solid var(--stroke);border-radius:18px;background:rgba(255,255,255,.04);padding:20px;min-width:0}
  .acct-card h3{margin:0 0 4px;font-size:18px} .acct-card .sub{color:var(--muted);font-size:13px;margin:0 0 16px}
  .acct-row{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:9px 0;border-bottom:1px dashed rgba(255,255,255,.08);font-size:14px}
  .acct-row:last-child{border-bottom:none} .acct-row b{color:var(--muted);font-weight:600}
  .acct-big{display:flex;align-items:center;gap:14px;margin-bottom:14px} .acct-big>div:last-child{min-width:0} .acct-big .note{overflow-wrap:anywhere;word-break:break-word}
  .acct-big .av{flex:0 0 auto;width:52px;height:52px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:22px;color:#0a0a12;background:linear-gradient(120deg,var(--a1),var(--a2))}
  .verify-banner{display:flex;gap:12px;align-items:center;flex-wrap:wrap;border:1px solid rgba(255,210,122,.35);background:rgba(255,210,122,.08);color:#ffd27a;border-radius:14px;padding:12px 16px;margin-top:18px}
  .act-list{display:flex;flex-direction:column;gap:8px;max-height:240px;overflow:auto}
  .act-item{display:flex;justify-content:space-between;gap:10px;align-items:baseline;font-size:13.5px;padding:8px 10px;border:1px solid var(--stroke);border-radius:10px}
  .act-item .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap} .act-item .dt{color:var(--muted);flex:none}

  /* ---- মোবাইল/ট্যাবলেট UI অপটিমাইজেশন (additive; ডেস্কটপ-অপরিবর্তিত) ---- */
  html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
  a,button,.rx,.btn,.nav-tool,.nav-signin,.linkbtn,.faq-q,.tab{ -webkit-tap-highlight-color:transparent; touch-action:manipulation }
  @media(max-width:820px){
    .nav-tool{height:44px} .burger{height:44px;width:48px}
    .rx{min-height:44px;padding:10px 16px}
    .modal-body{max-height:72dvh} .modal-foot{padding-bottom:calc(18px + env(safe-area-inset-bottom))}
    .helper-panel{max-height:70dvh;bottom:calc(90px + env(safe-area-inset-bottom));right:calc(22px + env(safe-area-inset-right))}
    .helper-fab{bottom:calc(22px + env(safe-area-inset-bottom));right:calc(22px + env(safe-area-inset-right))}
    footer{padding-bottom:calc(28px + env(safe-area-inset-bottom))}
    .play-modal .modal-foot{padding-bottom:calc(12px + env(safe-area-inset-bottom))}
  }
  @media(max-width:600px){
    .nav-inner{gap:8px;height:60px}
    .brand .name{font-size:16px} .brand .brand-mark{height:28px}
    .nav-tools{gap:6px} .nav-tool{height:42px;padding:0 10px;font-size:12px}
    .nav-signin{padding:10px 12px;font-size:13px} .burger{height:42px;width:44px}
    .nav-links{inset:60px 3vw auto 3vw}
    .page{padding:26px 0 64px}
    .section-head h2{font-size:clamp(22px,6vw,30px)}
    .hero-feats{gap:10px} .hero-feats .hf{padding:11px 12px}
    .detail-cover{height:200px;padding:18px}
    .field input,.field textarea,select.pf,.search input,.lm-search input,#lang-search{font-size:16px}
    .wrap{width:min(1180px,94vw)}
  }
  @media(max-width:430px){ .brand .name{display:none} .brand{gap:0} .nav-inner{gap:6px} }

  @media (prefers-reduced-motion: reduce){
    html{scroll-behavior:auto}
    .reveal{opacity:1!important;transform:none!important;transition:none!important}
    .card:hover,.btn:hover,.social a:hover,.back:hover{transform:none}
    *{animation-duration:.001ms!important;transition-duration:.001ms!important}
    .drift-track{transform:none!important} .boot .ring{animation:none}
    .dlr-sq{animation:none!important;stroke-dashoffset:0!important} .dlr-logo{animation:none!important;transform:none!important;opacity:1!important}
  }
  /* ম্যানুয়াল টগল: .reduce-motion ক্লাস OS-এর media query-এর সমমান আচরণ করে */
  html.reduce-motion{scroll-behavior:auto}
  .reduce-motion .reveal{opacity:1!important;transform:none!important;transition:none!important}
  .reduce-motion .card:hover,.reduce-motion .btn:hover,.reduce-motion .social a:hover,.reduce-motion .back:hover{transform:none}
  .reduce-motion *{animation-duration:.001ms!important;transition-duration:.001ms!important}
  .reduce-motion .drift-track{transform:none!important} .reduce-motion .boot .ring{animation:none}
  .reduce-motion .dlr-sq{animation:none!important;stroke-dashoffset:0!important} .reduce-motion .dlr-logo{animation:none!important;transform:none!important;opacity:1!important}
`;
document.head.appendChild((function () { const st = document.createElement("style"); st.id = "shared-css"; st.textContent = SHARED_CSS; return st; })());

/* =========================================================
   কনফিগারেশন — এখানে নিজের Firebase মান বসান
   Firebase Console → Project settings → Your apps → SDK setup and configuration → Config
   সেখান থেকে apiKey, authDomain, projectId, storageBucket, appId ইত্যাদি কপি করে বসান।
   placeholder না বদলালে সাইট স্বয়ংক্রিয়ভাবে localStorage মোডে চলবে।
   ========================================================= */
const PLACEHOLDER = "__REPLACE_ME__";
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDzvggPAjR64TQ5EVDrSEsLlPddmSSQLIE",
  authDomain:        "deepoostrophy.firebaseapp.com",
  projectId:         "deepoostrophy",
  storageBucket:     "deepoostrophy.firebasestorage.app",
  messagingSenderId: "459815787681",
  appId:             "1:459815787681:web:b5e756aabf740c7a6764e0"
};
// Firebase v10 ES-module SDK এই ঠিকানা থেকে লোড হবে (নির্দিষ্ট ভার্সন):
const FB_VERSION = "10.12.5";
const FB_CDN = "https://www.gstatic.com/firebasejs/" + FB_VERSION + "/";
// মালিক একমাত্র অ্যাডমিন: নিজের Firebase Auth ইমেইল এখানে বসান (অথবা UID)।
const OWNER_EMAIL = "arafathhossainrifath230119@gmail.com"; // <-- Firebase Auth Users-এর হুবহু ইমেইল
const OWNER_UID   = "";                        // চাইলে UID দিন (খালি রাখলে শুধু ইমেইল মিলবে)

const KINDS = {
  apps:{label:"অ্যাপ", icon:"📱", c:["#4338ca","#8b5cf6"]},
  "ai-tools":{label:"AI টুলস", icon:"✨", c:["#6d28d9","#22d3ee"]},
  arts:{label:"কালারফুল আর্টস", icon:"🎨", c:["#7c3aed","#db2777"]},
  wallpapers:{label:"ওয়ালপেপার", icon:"🖼️", c:["#0ea5e9","#6366f1"]},
  images:{label:"ছবি", icon:"📷", c:["#14b8a6","#0ea5e9"]},
  songs:{label:"গান", icon:"🎵", c:["#db2777","#8b5cf6"]},
  movies:{label:"মুভি", icon:"🎬", c:["#f43f5e","#f59e0b"]},
  "py-ext":{label:"পাইথন এক্সটেনশন", icon:"🧩", c:["#0f766e","#a3e635"]},
  books:{label:"বইয়ের কপি", icon:"📚", c:["#b45309","#f59e0b"]},
  files:{label:"ফাইল সংরক্ষণ", icon:"🗂️", c:["#0e7490","#22d3ee"]},
  links:{label:"লিংক", icon:"🔗", c:["#1e1b4b","#7c3aed"]},
  custom:{label:"কাস্টম", icon:"🏷️", c:["#334155","#0891b2"]},
};
const ITEM_TYPES = ["অ্যাপ","AI টুল","আর্ট","ওয়ালপেপার","ছবি","গান","মুভি","পাইথন এক্সটেনশন","বইয়ের কপি","ফাইল","লিংক","অন্যান্য"];
const PALETTE = [
  "linear-gradient(120deg,#6d28d9,#8b5cf6 45%,#22d3ee)",
  "linear-gradient(120deg,#7c3aed,#db2777 60%,#f59e0b)",
  "linear-gradient(120deg,#0e7490,#22d3ee 60%,#a3e635)",
  "linear-gradient(120deg,#b45309,#f59e0b 60%,#fde68a)",
  "linear-gradient(120deg,#1e1b4b,#4338ca 55%,#7c3aed)",
  "linear-gradient(120deg,#0f172a,#334155 55%,#0891b2)",
  /* --- নতুন ১৮টি graphical gradient (মোট ২৪) — আগের ৬টি অক্ষুণ্ণ, শুধু append --- */
  "linear-gradient(120deg,#be123c,#db2777 55%,#a855f7)",
  "linear-gradient(120deg,#0f766e,#10b981 55%,#84cc16)",
  "linear-gradient(120deg,#0284c7,#3b82f6 50%,#6366f1)",
  "linear-gradient(120deg,#d97706,#f97316 55%,#ef4444)",
  "linear-gradient(120deg,#c026d3,#9333ea 55%,#4f46e5)",
  "linear-gradient(120deg,#06b6d4,#0ea5e9 55%,#2563eb)",
  "linear-gradient(120deg,#059669,#14b8a6 55%,#06b6d4)",
  "linear-gradient(120deg,#7c3aed,#a21caf 60%,#d946ef)",
  "linear-gradient(120deg,#4338ca,#2563eb 55%,#22d3ee)",
  "linear-gradient(120deg,#ec4899,#f43f5e 55%,#dc2626)",
  "linear-gradient(120deg,#65a30d,#16a34a 55%,#059669)",
  "linear-gradient(120deg,#ea580c,#f59e0b 55%,#facc15)",
  "linear-gradient(120deg,#1e293b,#4f46e5 60%,#8b5cf6)",
  "linear-gradient(120deg,#0c4a6e,#0891b2 55%,#2dd4bf)",
  "linear-gradient(120deg,#7f1d1d,#be185d 55%,#7e22ce)",
  "linear-gradient(120deg,#b45309,#d97706 50%,#fbbf24)",
  "linear-gradient(120deg,#1e1b4b,#6366f1 60%,#a5b4fc)",
  "linear-gradient(120deg,#fb7185,#f97316 55%,#fcd34d)",
];

/* =========================================================
   কেন্দ্রীয় অনুবাদ (i18n) — সাইটের একমাত্র অনুবাদ অবজেক্ট: I18N
   ৮টি ভাষা, সবগুলোতেই UI লেখা বদলায়। ডিফল্ট ভাষা English।
   প্রতিটি ভাষার টেবিলের key = বাংলা মূল লেখা (মার্কআপ বাংলাতেই লেখা, তাই এটিই উৎস), value = সেই ভাষার অনুবাদ।
   es/de/ja/fr/pt/hi টেবিল খালি — মালিক নিজেই এদের ফাঁকা ঘরে নিজ হাতে অনুবাদ লিখবেন (AI নয়)।
   কোনো ঘর খালি থাকলে সেই লেখা চুপচাপ ইংরেজিতে দেখায় — কোনো পপআপ/প্রম্পট আসে না।
   {name} / {n} / {msg} টাইপ placeholder সব ভাষাতেই হুবহু একই থাকে।
   নতুন UI লেখা যোগ করলে শুধু en টেবিলে এক লাইন দিন — বাকি ভাষা তখন সেটি ইংরেজিতেই দেখাবে, পরে মালিক অনুবাদ করবেন।
   মালিকের নিজস্ব কনটেন্ট (স্টোর/আইটেম/FAQ/সেটিংস/About লেখা) অনুবাদ হয় না।
   ========================================================= */
const LANG_KEY = "deeo.lang";
const I18N = {
  default: "en",
  /* dropdown-এ দেখানোর ক্রম + প্রতিটি ভাষার নিজের লিপিতে নাম (native) ও লাতিন নাম (name — সার্চের জন্য) */
  list: [
    { code: "en", native: "English",    name: "English" },
    { code: "bn", native: "বাংলা",        name: "Bangla" },
    { code: "es", native: "Español",    name: "Spanish" },
    { code: "de", native: "Deutsch",    name: "German" },
    { code: "ja", native: "日本語",       name: "Japanese" },
    { code: "fr", native: "Français",   name: "French" },
    { code: "pt", native: "Português",  name: "Portuguese" },
    { code: "hi", native: "हिन्दी",       name: "Hindi" }
  ],
  /* --- মালিক নিজে হাতে পূরণ করবেন: key = বাংলা মূল লেখা, value = ঐ ভাষার অনুবাদ ---
     খালি টেবিল = সব লেখা ইংরেজিতে দেখাবে (silent fallback)। একটা ঘরে কিছু লিখলে সেটাই চলবে। */
  es: {"মেনু":"Menú", "হোম":"Inicio", "যোগাযোগ":"Contacto", "সাইট দেখুন":"Ver el sitio", "স্টোর দেখুন":"Explorar la tienda",
    "হোমে ফিরুন":"Volver al inicio", "← হোমে ফিরুন":"← Volver al inicio", "← স্টোরে ফিরুন":"← Volver a la tienda", "সাহায্য":"Ayuda",
    "সাহায্য ও প্রশ্নোত্তর":"Ayuda y preguntas", "প্রশ্ন খুঁজুন…":"Buscar preguntas…", "ভাষা বদলান":"Cambiar idioma", "ভাষা খুঁজুন…":"Buscar idiomas…",
    "কোনো ভাষা মেলেনি":"Ningún idioma coincide", "শব্দ চালু":"Sonido activado", "শব্দ বন্ধ":"Sonido desactivado",
    "এই সাইট এখন <b>localStorage</b> মোডে চলছে। Firebase কনফিগ বসালেই Firestore/Auth-এ চলে যাবে।":"Este sitio funciona en modo <b>localStorage</b>. Añade la configuración de Firebase y pasará a Firestore/Auth.",
    "Firebase মোড সক্রিয়। সব ভিজিটর প্রকাশিত কন্টেন্ট দেখবেন।":"Modo Firebase activo. Todos los visitantes verán tu contenido publicado.",
    "FIREBASE":"FIREBASE", "LOCAL":"LOCAL", "ফিচারড আইটেম":"Elementos destacados", "স্টোরগুলোর বাছাই করা কাজ।":"Una selección de las tiendas.",
    "স্টোর":"Tienda", "স্টোর:":"Tienda:", "{label} স্টোর":"Tienda {label}",
    "প্রতিটি স্টোরে নিজস্ব ধরনের আইটেম সাজানো থাকে।":"Cada tienda guarda elementos de su propio tipo.",
    "এখনো কোনো স্টোর যোগ করা হয়নি।":"Aún no se han añadido tiendas.",
    "কন্ট্রোল প্যানেল থেকে আপনার প্রথম স্টোর তৈরি করুন — তারপর ভেতরে আইটেম বসান।":"Crea tu primera tienda en el panel de control, luego añade elementos dentro.",
    "কন্ট্রোল প্যানেল খুলুন":"Abrir panel de control", "কন্ট্রোল প্যানেল":"Panel de control",
    "নাম, বিবরণ বা ট্যাগ খুঁজুন…":"Busca nombre, descripción o etiqueta…", "ধরন":"Tipo", "আইটেম":"Elemento", "টি আইটেম":"elementos",
    "{n}টি আইটেম":"{n} elementos", "আইটেম · {n}টি":"Elementos · {n}", "এই স্টোরে এখনো কিছু যোগ করা হয়নি।":"Aún no hay nada en esta tienda.",
    "কন্ট্রোল প্যানেল থেকে আইটেম যোগ করুন।":"Añade elementos desde el panel de control.", "কোনো ধরন নেই।":"Sin tipos aún.", "★ ফিচারড":"★ Destacado",
    "খসড়া":"Borrador", "খুলুন":"Abrir", "সোর্স":"Fuente", "ডাউনলোড":"Descargar", "সোর্স কোড":"Código fuente", "লিংক ও ডাউনলোড":"Enlaces y descarga",
    "তথ্য":"Detalles", "বিবরণ":"Descripción", "ইনস্টল নির্দেশ":"Pasos de instalación", "README":"README", "লিংক":"Enlace",
    "এই আইটেমের কোনো লিংক যোগ করা হয়নি।":"No se han añadido enlaces para este elemento.",
    "আইটেমটি পাওয়া যায়নি বা প্রকাশিত নয়।":"Este elemento no existe o no está publicado.", "লেখক":"Autor", "বছর":"Año", "পরিচয়":"Identidad",
    "সংযোগ":"Conectar", "কোনো প্রজেক্ট, সহযোগিতা বা প্রশ্ন থাকলে লিখুন।":"Escríbeme sobre un proyecto, una colaboración o una pregunta.",
    "নাম":"Nombre", "আপনার নাম":"Tu nombre", "ইমেইল":"Correo", "আপনার ইমেইল":"Tu correo", "মেসেজ":"Mensaje",
    "কী জানাতে চান…":"¿Qué quieres compartir…", "পাঠান":"Enviar", "সরাসরি লিংক":"Enlaces directos",
    "যোগাযোগের লিংক যোগ করা হয়নি।":"Aún no hay enlaces de contacto.",
    "কন্ট্রোল প্যানেল → সাইট সেটিংস থেকে ইমেইল ও সোশ্যাল লিংক দিন।":"Añade tu correo y enlaces sociales en Panel → Ajustes del sitio.",
    "এই বিভাগে এখনো লেখা যোগ করা হয়নি।":"Aún no hay texto en esta sección.",
    "আপনার নাম সর্বোচ্চ ১০০ অক্ষরের হতে হবে।":"Tu nombre debe tener como máximo 100 caracteres.", "ইমেইল দিন।":"Introduce tu correo.",
    "ইমেইল সর্বোচ্চ ১০০ অক্ষরের হতে হবে।":"El correo debe tener como máximo 100 caracteres.",
    "সঠিক ইমেইল ঠিকানা দিন (@ সহ)।":"Introduce un correo válido (con @).", "মেসেজ লিখুন।":"Escribe un mensaje.",
    "মেসেজ সর্বোচ্চ ২০০০ অক্ষরের হতে পারে।":"El mensaje puede tener como máximo 2000 caracteres.",
    "ধন্যবাদ! মেসেজটি পাঠানো হয়েছে।":"¡Gracias! Tu mensaje ha sido enviado.", "পাঠানো যায়নি: {msg}":"No se pudo enviar: {msg}",
    "এই ঠিকানায় কিছু নেই।":"No hay nada en esta dirección.", "মালিকের জন্য সুরক্ষিত এলাকা":"Área segura para el propietario",
    "অ্যাডমিন লগইন":"Acceso de administrador",
    "শুধু মালিক স্টোর, আইটেম ও সেটিংস নিয়ন্ত্রণ করতে পারবেন।":"Solo el propietario puede gestionar tiendas, elementos y ajustes.",
    "পাসওয়ার্ড":"Contraseña", "প্রবেশ করুন":"Iniciar sesión", "প্রবেশ":"Entrar",
    "শুধু মালিকই এখানে ঢুকতে পারবেন।":"Solo el propietario puede acceder aquí.", "পাসকোড":"Código",
    "নতুন পাসকোড সেট করুন (৪+ অক্ষর)":"Define un nuevo código (4+ caracteres)", "আপনি মালিক নন।":"No eres el propietario.",
    "লগইন ব্যর্থ।":"Error de acceso.", "সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।":"Problema de conexión. Inténtalo de nuevo.",
    "ইমেইল যাচাই করুন। আপনার ইনবক্সে পাঠানো লিংকে ক্লিক করুন।":"Verifica tu correo. Haz clic en el enlace enviado a tu bandeja.",
    "যাচাই-লিংক আবার পাঠান":"Reenviar el enlace de verificación", "পাঠানো হচ্ছে…":"Enviando…",
    "যাচাই-লিংক পাঠানো হয়েছে ✅ ইনবক্স (না-থাকলে স্প্যাম) দেখুন, লিংকে ক্লিক করুন, তারপর আবার লগইন করুন।":"Enlace de verificación enviado ✅ Revisa tu bandeja (y spam), haz clic en el enlace y vuelve a iniciar sesión.",
    "ভুল পাসকোড।":"Código incorrecto.", "পাসকোড অন্তত ৪ অক্ষরের দিন।":"Introduce un código de al menos 4 caracteres.",
    "সাইট ব্যবস্থাপনা":"Gestión del sitio", "লগআউট":"Cerrar sesión", "সাইট সেটিংস":"Ajustes del sitio", "ডেটা":"Datos", "FAQ":"FAQ", "ক্রম":"Orden",
    "প্রকাশ":"Publicar", "অ্যাকশন":"Acciones", "সম্পাদনা":"Editar", "মুছুন":"Eliminar", "সংরক্ষণ":"Guardar", "বাতিল":"Cancelar",
    "প্রকাশিত":"Publicado", "ফিচার":"Destacado", "স্টোর ব্যবস্থাপনা":"Gestión de tiendas", "+ নতুন স্টোর":"+ Nueva tienda",
    "↑ ↓ দিয়ে ক্রম বদলান। “প্রকাশ” বন্ধ থাকলে স্টোরটি সাইটে দেখাবে না। স্টোর মুছলে তার ভেতরের সব আইটেমও মুছে যাবে।":"Usa ↑ ↓ para cambiar el orden. Una tienda con “Publicar” apagado permanece oculta. Eliminar una tienda borra también todos sus elementos.",
    "এখনো কোনো স্টোর নেই। “+ নতুন স্টোর” চেপে শুরু করুন।":"Sin tiendas aún. Pulsa “+ Nueva tienda” para empezar.",
    "“{name}” স্টোরটি মুছে ফেলবেন? ভেতরের সব আইটেমও মুছে যাবে।":"¿Eliminar la tienda “{name}”? También se borrarán todos sus elementos.",
    "স্টোর সম্পাদনা":"Editar tienda", "নতুন স্টোর":"Nueva tienda", "আইকন (একটি ইমোজি/অক্ষর)":"Icono (un emoji o letra)", "যেমন 📱":"ej. 📱",
    "এই স্টোরে কী কী থাকে…":"Qué contiene esta tienda…", "যেমন: আমার অ্যাপসমূহ":"ej. Mis apps", "+ নতুন আইটেম":"+ Nuevo elemento",
    "প্রথমে একটি স্টোর তৈরি করুন।":"Primero crea una tienda.",
    "আইটেম সবসময় কোনো না কোনো স্টোরের ভেতরে থাকে।":"Los elementos siempre viven dentro de una tienda.",
    "“হোমে ফিচার” দিলে আইটেমটি হোমের ফিচারড সেকশনে দেখাবে। বইয়ের কপির জন্য লেখক/বছর, এক্সটেনশনের জন্য ইনস্টল নির্দেশ ফিল্ড ভরে দিন।":"“Destacar en inicio” muestra el elemento en la sección destacada. Para copias de libros completa autor/año; para extensiones, los pasos de instalación.",
    "এই স্টোরে এখনো আইটেম নেই। “+ নতুন আইটেম” চেপে যোগ করুন।":"Sin elementos en esta tienda aún. Pulsa “+ Nuevo elemento” para añadir.",
    "“{name}” আইটেমটি মুছে ফেলবেন?":"¿Eliminar el elemento “{name}”?", "আইটেম সম্পাদনা":"Editar elemento", "নতুন আইটেম":"Nuevo elemento",
    "ধরন (type)":"Categoría", "কাস্টম টাইপের নাম":"Nombre del tipo personalizado", "যেমন: গেম, টেমপ্লেট, UI কিট…":"ej. Juegos, Plantillas, Kits UI…",
    "যেমন: Wallora":"ej. Wallora", "এক লাইনের পরিচয় (tagline)":"Lema de una línea", "সংক্ষিপ্ত বর্ণনা":"Descripción breve",
    "বিস্তারিত বিবরণ…":"Descripción detallada…", "ট্যাগ (কমা দিয়ে)":"Etiquetas (separadas por coma)", "বইয়ের কপি":"Copia del libro",
    "লেখকের নাম":"Nombre del autor", "এক্সটেনশন":"Extensión", "কীভাবে ইনস্টল করবেন…":"Cómo instalarlo…", "কভার":"Portada",
    "কভার রঙ":"Color de portada", "নিজের রঙ":"Color personalizado", "কভার ছবির লিংক":"Enlace de imagen de portada",
    "https://… (ছবির সরাসরি লিংক)":"https://… (enlace directo de imagen)", "ডাউনলোড ও লিংক":"Descarga y enlaces", "ডাউনলোড লিংক":"Enlace de descarga",
    "GitHub Release-এর asset লিংক বা যেকোনো সরাসরি ফাইল লিংক দিন।":"Pega un enlace de recurso de GitHub Release o cualquier enlace directo de archivo.",
    "সোর্স লিংক":"Enlace de fuente", "বিস্তারিত পাতায় দেখানোর নোট…":"Nota mostrada en la página de detalle…", "হোমে ফিচার":"Destacar en inicio",
    "প্রশ্নোত্তর (FAQ)":"Preguntas (FAQ)", "+ নতুন প্রশ্ন":"+ Nueva pregunta", "প্রশ্ন":"Pregunta",
    "এখনো কোনো প্রশ্ন নেই। “+ নতুন প্রশ্ন” চেপে যোগ করুন।":"Sin preguntas aún. Pulsa “+ Nueva pregunta” para añadir.", "প্রশ্নোত্তর":"Preguntas",
    "নতুন প্রশ্ন":"Nueva pregunta", "প্রশ্ন সম্পাদনা":"Editar pregunta", "উত্তর":"Respuesta",
    "যেমন: আপনি কী কী নিয়ে কাজ করেন?":"ej. ¿En qué tipo de trabajo te especializas?", "এখানে উত্তর লিখুন…":"Escribe la respuesta aquí…",
    "প্রশ্নটি মুছে ফেলবেন?":"¿Eliminar esta pregunta?",
    "এই প্রশ্নোত্তরগুলো সাইটের কোণার ভাসমান হেল্পারে দেখাবে। এগুলো আসল AI নয়, আগে থেকে লেখা উত্তর।":"Estas preguntas aparecen en el ayudante flotante de la esquina. Son respuestas preescritas, no IA real.",
    "কোনো প্রশ্ন পাওয়া যায়নি।":"No se encontraron preguntas.", "অন্য কিছু লিখে দেখুন।":"Prueba con otras palabras.",
    "মালিক এখনো FAQ যোগ করেননি।":"El propietario aún no ha añadido FAQ.", "যোগাযোগ মেসেজ":"Mensajes de contacto", "রিফ্রেশ":"Actualizar",
    "শুধু আপনি (মালিক) এই মেসেজ পড়তে পারবেন; সাধারণ দর্শক পাঠাতে পারবে কিন্তু কারও মেসেজ দেখতে পাবে না।":"Solo tú (el propietario) puedes leer estos mensajes; los visitantes pueden enviarlos pero nunca ver los de nadie.",
    "কোনো মেসেজ নেই।":"Sin mensajes.", "যোগাযোগ ফর্ম থেকে আসা মেসেজ এখানে দেখাবে।":"Los mensajes del formulario de contacto aparecen aquí.",
    "— কোনো স্টোর নেই —":"— sin tiendas —", "সাইটের নাম":"Nombre del sitio", "যোগাযোগের ইমেইল":"Correo de contacto",
    "হোমের পরিচয়ের লেখা (এক/দুই লাইন)":"Línea de identidad del inicio (una o dos líneas)", "আপনি কে, কী নিয়ে কাজ করেন…":"Quién eres y qué creas…",
    "খালি রাখলে হোমে এই লাইন দেখাবে না।":"Déjalo vacío para ocultar esta línea en el inicio.",
    "About DEEPostrophy বিভাগের লেখা":"Texto de la sección About DEEPostrophy", "লক্ষ্য, দক্ষতা ও পথচলা…":"Metas, habilidades y el camino…",
    "লেখা সংরক্ষণ":"Guardar el texto",
    "এই লেখাটি সাইটের About DEEPostrophy বিভাগেই দেখায় — অন্য কোথাও নয়।":"Este texto aparece solo en la sección About DEEPostrophy del sitio — en ningún otro lugar.",
    "ভাষা":"Idioma", "ডিফল্ট English; ভিজিটার নিজে বেছে নিলে সেটি মনে থাকে।":"Por defecto inglés; la elección del visitante se recuerda.",
    "অটো-ভাষা চালু":"Activar idioma automático",
    "ভিজিটার এখনো ভাষা বেয়ে না রাখলে তাঁর ব্রাউজারের ভাষাটি চুপচাপ প্রয়োগ হবে — কোনো প্রশ্ন বা পপআপ আসবে না।":"Si un visitante aún no ha elegido idioma, se aplica en silencio el de su navegador — sin preguntas ni ventanas.",
    "অনুবাদ (আপনার নিজের হাতে)":"Traducciones (a tu mano)",
    "৮টি ভাষা চালু; খালি থাকা ঘরগুলো স্বয়ংক্রিয়ভাবে English দেখায়।":"8 idiomas activos; los campos vacíos muestran inglés automáticamente.",
    "ভাষা তালিকা":"Lista de idiomas", "প্রতিটি UI লেখার অনুবাদ":"Traducción de cada texto de la interfaz", "সোশ্যাল লিংক":"Enlaces sociales",
    "+ লিংক যোগ করুন":"+ Añadir enlace",
    "শুধু আসল লিংক দিন (https:// বা mailto: দিয়ে শুরু)।":"Usa solo enlaces reales (que empiecen con https:// o mailto:).",
    "লেবেল (যেমন GitHub)":"Etiqueta (ej. GitHub)", "সেটিংস সংরক্ষণ":"Guardar ajustes", "সংরক্ষিত হয়েছে ✅":"Guardado ✅",
    "ডেটা রপ্তানি ও আমদানি":"Exportar e importar datos",
    "পুরো সাইটের ডেটা (স্টোর, আইটেম, FAQ, সেটিংস, মেসেজ) এক JSON ফাইলে সংরক্ষণ বা ফিরিয়ে আনুন।":"Guarda o restaura todo el sitio (tiendas, elementos, FAQ, ajustes, mensajes) como un archivo JSON.",
    "⬇ JSON রপ্তানি":"⬇ Exportar JSON", "⬆ JSON আমদানি":"⬆ Importar JSON", "আমদানি সফল ✅":"Importación exitosa ✅",
    "ফাইল পড়া যায়নি — সঠিক JSON দিন।":"No se pudo leer el archivo — proporciona JSON válido.",
    "লোকাল অ্যাডমিন পাসকোড":"Código local de administrador",
    "Firebase কনফিগ বসানো না থাকলে প্যানেলে ঢুকতে এই লোকাল পাসকোড লাগে (এটি ডিফল্ট নয় — আপনি নিজে সেট করেন)। Firebase চালু হলে এটি প্রযোজ্য থাকবে না।":"Sin configuración de Firebase este código local abre el panel (no es un valor por defecto — lo defines tú). Deja de aplicar cuando Firebase está activo.",
    "নতুন পাসকোড":"Nuevo código", "অন্তত ৪ অক্ষর":"Al menos 4 caracteres", "পাসকোড সেট / বদলান":"Definir / cambiar código",
    "পাসকোড অন্তত ৪ অক্ষর।":"El código necesita al menos 4 caracteres.", "লোকাল পাসকোড সেট হয়েছে ✅":"Código local definido ✅", "অ্যাপ":"App",
    "AI টুলস":"Herramientas de IA", "AI টুল":"Herramienta de IA", "কালারফুল আর্টস":"Artes coloridas", "আর্ট":"Arte",
    "পাইথন এক্সটেনশন":"Extensión de Python", "ফাইল সংরক্ষণ":"Almacenamiento de archivos", "ফাইল":"Archivo", "কাস্টম":"Personalizado",
    "অন্যান্য":"Otros", "ওয়ালপেপার":"Fondo de pantalla", "ছবি":"Imagen", "গান":"Canción", "মুভি":"Película",
    "Portfolio · App Store":"Portfolio · App Store", "ওয়েলকাম টু":"Bienvenido a",
    "আমি অ্যাপ, AI টুল আর ডিজাইন বানাই — পরিষ্কার, দ্রুত আর দেখতে সুন্দর।":"Creo apps, herramientas de IA y diseño — limpio, rápido y atractivo.",
    "যোগাযোগ করুন":"Contactar", "আর্ট ও ডিজাইন":"Arte y diseño", "পাইথন":"Python", "পরিষ্কার UI ও দ্রুত অভিজ্ঞতা":"UI limpio, experiencia rápida",
    "AI দিয়ে বাস্তব সমাধান":"Soluciones reales con IA", "রঙিন, চোখে জমে এমন কাজ":"Trabajo colorido que capta la mirada",
    "প্র্যাকটিক্যাল স্ক্রিপ্ট ও টুল":"Scripts y herramientas prácticas" , "পরিসংখ্যান ও রিঅ্যাকশন":"Estadísticas y reacciones", "মোট ডাউনলোড":"Descargas totales", "সেভ":"Guardados", "রিঅ্যাকশন":"Reacciones", "এখনো কোনো রিঅ্যাকশন নেই।":"Aún no hay reacciones.", "আপনিও প্রথম রিঅ্যাকশন দিতে পারেন।":"Sé el primero en reaccionar.", "রিঅ্যাকশন দিতে লগ-ইন করুন।":"Inicia sesión para reaccionar.", "ধন্যবাদ, রিঅ্যাকশন যোগ হয়েছে!":"¡Gracias, tu reacción fue añadida!", "প্রথম রিঅ্যাকশন দিন":"Añade la primera reacción", "আপনার রিঅ্যাকশন":"Tu reacción", "প্লে":"Jugar", "নতুন ট্যাবে খুলুন":"Abrir en nueva pestaña", "লোড হচ্ছে…":"Cargando…", "ফুল স্ক্রিন":"Pantalla completa", "বন্ধ করুন":"Cerrar" },
  de: {"মেনু":"Menü", "হোম":"Start", "যোগাযোগ":"Kontakt", "সাইট দেখুন":"Seite ansehen", "স্টোর দেখুন":"Store durchsuchen",
    "হোমে ফিরুন":"Zurück zur Startseite", "← হোমে ফিরুন":"← Zurück zur Startseite", "← স্টোরে ফিরুন":"← Zurück zum Store", "সাহায্য":"Hilfe",
    "সাহায্য ও প্রশ্নোত্তর":"Hilfe & FAQ", "প্রশ্ন খুঁজুন…":"Fragen suchen…", "ভাষা বদলান":"Sprache wechseln", "ভাষা খুঁজুন…":"Sprachen suchen…",
    "কোনো ভাষা মেলেনি":"Keine Sprache gefunden", "শব্দ চালু":"Ton an", "শব্দ বন্ধ":"Ton aus",
    "এই সাইট এখন <b>localStorage</b> মোডে চলছে। Firebase কনফিগ বসালেই Firestore/Auth-এ চলে যাবে।":"Diese Seite läuft im <b>localStorage</b>-Modus. Füge die Firebase-Konfiguration hinzu, um zu Firestore/Auth zu wechseln.",
    "Firebase মোড সক্রিয়। সব ভিজিটর প্রকাশিত কন্টেন্ট দেখবেন।":"Firebase-Modus aktiv. Alle Besucher sehen deine veröffentlichten Inhalte.",
    "FIREBASE":"FIREBASE", "LOCAL":"LOCAL", "ফিচারড আইটেম":"Ausgewählte Einträge",
    "স্টোরগুলোর বাছাই করা কাজ।":"Eine kuratierte Auswahl aus den Stores.", "স্টোর":"Store", "স্টোর:":"Store:", "{label} স্টোর":"{label}-Store",
    "প্রতিটি স্টোরে নিজস্ব ধরনের আইটেম সাজানো থাকে।":"Jeder Store enthält Einträge eigener Art.",
    "এখনো কোনো স্টোর যোগ করা হয়নি।":"Es wurden noch keine Stores hinzugefügt.",
    "কন্ট্রোল প্যানেল থেকে আপনার প্রথম স্টোর তৈরি করুন — তারপর ভেতরে আইটেম বসান।":"Erstelle deinen ersten Store im Bedienfeld und füge dann Einträge hinzu.",
    "কন্ট্রোল প্যানেল খুলুন":"Bedienfeld öffnen", "কন্ট্রোল প্যানেল":"Bedienfeld", "নাম, বিবরণ বা ট্যাগ খুঁজুন…":"Name, Beschreibung oder Tag suchen…",
    "ধরন":"Typ", "আইটেম":"Eintrag", "টি আইটেম":"Einträge", "{n}টি আইটেম":"{n} Einträge", "আইটেম · {n}টি":"Einträge · {n}",
    "এই স্টোরে এখনো কিছু যোগ করা হয়নি।":"Zu diesem Store wurde noch nichts hinzugefügt.",
    "কন্ট্রোল প্যানেল থেকে আইটেম যোগ করুন।":"Füge Einträge aus dem Bedienfeld hinzu.", "কোনো ধরন নেই।":"Noch keine Typen.", "★ ফিচারড":"★ Ausgewählt",
    "খসড়া":"Entwurf", "খুলুন":"Öffnen", "সোর্স":"Quelle", "ডাউনলোড":"Herunterladen", "সোর্স কোড":"Quellcode", "লিংক ও ডাউনলোড":"Links & Download",
    "তথ্য":"Details", "বিবরণ":"Beschreibung", "ইনস্টল নির্দেশ":"Installationsschritte", "README":"README", "লিংক":"Link",
    "এই আইটেমের কোনো লিংক যোগ করা হয়নি।":"Für diesen Eintrag wurden keine Links hinzugefügt.",
    "আইটেমটি পাওয়া যায়নি বা প্রকাশিত নয়।":"Dieser Eintrag wurde nicht gefunden oder ist nicht veröffentlicht.", "লেখক":"Autor", "বছর":"Jahr",
    "পরিচয়":"Identität", "সংযোগ":"Verbinden",
    "কোনো প্রজেক্ট, সহযোগিতা বা প্রশ্ন থাকলে লিখুন।":"Schreib mir über ein Projekt, eine Zusammenarbeit oder eine Frage.", "নাম":"Name",
    "আপনার নাম":"Dein Name", "ইমেইল":"E-Mail", "আপনার ইমেইল":"Deine E-Mail", "মেসেজ":"Nachricht", "কী জানাতে চান…":"Was möchtest du mitteilen…",
    "পাঠান":"Senden", "সরাসরি লিংক":"Direkte Links", "যোগাযোগের লিংক যোগ করা হয়নি।":"Es wurden noch keine Kontaktlinks hinzugefügt.",
    "কন্ট্রোল প্যানেল → সাইট সেটিংস থেকে ইমেইল ও সোশ্যাল লিংক দিন।":"Füge E-Mail und Social-Links unter Bedienfeld → Website-Einstellungen hinzu.",
    "এই বিভাগে এখনো লেখা যোগ করা হয়নি।":"Für diesen Abschnitt wurde noch kein Text hinzugefügt.",
    "আপনার নাম সর্বোচ্চ ১০০ অক্ষরের হতে হবে।":"Dein Name darf höchstens 100 Zeichen haben.", "ইমেইল দিন।":"Bitte gib deine E-Mail ein.",
    "ইমেইল সর্বোচ্চ ১০০ অক্ষরের হতে হবে।":"Die E-Mail darf höchstens 100 Zeichen haben.",
    "সঠিক ইমেইল ঠিকানা দিন (@ সহ)।":"Gib eine gültige E-Mail-Adresse ein (mit @).", "মেসেজ লিখুন।":"Bitte schreibe eine Nachricht.",
    "মেসেজ সর্বোচ্চ ২০০০ অক্ষরের হতে পারে।":"Die Nachricht darf höchstens 2000 Zeichen haben.",
    "ধন্যবাদ! মেসেজটি পাঠানো হয়েছে।":"Danke! Deine Nachricht wurde gesendet.", "পাঠানো যায়নি: {msg}":"Konnte nicht senden: {msg}",
    "এই ঠিকানায় কিছু নেই।":"Unter dieser Adresse gibt es nichts.", "মালিকের জন্য সুরক্ষিত এলাকা":"Sicherer Bereich für den Besitzer",
    "অ্যাডমিন লগইন":"Admin-Login",
    "শুধু মালিক স্টোর, আইটেম ও সেটিংস নিয়ন্ত্রণ করতে পারবেন।":"Nur der Besitzer kann Stores, Einträge und Einstellungen verwalten.",
    "পাসওয়ার্ড":"Passwort", "প্রবেশ করুন":"Anmelden", "প্রবেশ":"Eintreten",
    "শুধু মালিকই এখানে ঢুকতে পারবেন।":"Nur der Besitzer kann sich hier anmelden.", "পাসকোড":"Passcode",
    "নতুন পাসকোড সেট করুন (৪+ অক্ষর)":"Neuen Passcode festlegen (4+ Zeichen)", "আপনি মালিক নন।":"Du bist nicht der Besitzer.",
    "লগইন ব্যর্থ।":"Login fehlgeschlagen.", "সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।":"Verbindungsproblem. Bitte erneut versuchen.",
    "ইমেইল যাচাই করুন। আপনার ইনবক্সে পাঠানো লিংকে ক্লিক করুন।":"Bestätige deine E-Mail. Klicke auf den Link in deinem Posteingang.",
    "যাচাই-লিংক আবার পাঠান":"Bestätigungslink erneut senden", "পাঠানো হচ্ছে…":"Wird gesendet…",
    "যাচাই-লিংক পাঠানো হয়েছে ✅ ইনবক্স (না-থাকলে স্প্যাম) দেখুন, লিংকে ক্লিক করুন, তারপর আবার লগইন করুন।":"Bestätigungslink gesendet ✅ Siehe Posteingang (und Spam), klicke den Link und melde dich erneut an.",
    "ভুল পাসকোড।":"Falscher Passcode.", "পাসকোড অন্তত ৪ অক্ষরের দিন।":"Gib einen Passcode mit mindestens 4 Zeichen ein.",
    "সাইট ব্যবস্থাপনা":"Website-Verwaltung", "লগআউট":"Abmelden", "সাইট সেটিংস":"Website-Einstellungen", "ডেটা":"Daten", "FAQ":"FAQ",
    "ক্রম":"Reihenfolge", "প্রকাশ":"Veröffentlichen", "অ্যাকশন":"Aktionen", "সম্পাদনা":"Bearbeiten", "মুছুন":"Löschen", "সংরক্ষণ":"Speichern",
    "বাতিল":"Abbrechen", "প্রকাশিত":"Veröffentlicht", "ফিচার":"Ausgewählt", "স্টোর ব্যবস্থাপনা":"Store-Verwaltung", "+ নতুন স্টোর":"+ Neuer Store",
    "↑ ↓ দিয়ে ক্রম বদলান। “প্রকাশ” বন্ধ থাকলে স্টোরটি সাইটে দেখাবে না। স্টোর মুছলে তার ভেতরের সব আইটেমও মুছে যাবে।":"Nutze ↑ ↓ für die Reihenfolge. Ein Store mit ausgeschaltetem „Veröffentlichen“ bleibt verborgen. Löschen eines Stores entfernt auch alle Einträge darin.",
    "এখনো কোনো স্টোর নেই। “+ নতুন স্টোর” চেপে শুরু করুন।":"Noch keine Stores. Drücke „+ Neuer Store“ zum Starten.",
    "“{name}” স্টোরটি মুছে ফেলবেন? ভেতরের সব আইটেমও মুছে যাবে।":"Store „{name}“ löschen? Alle Einträge darin werden ebenfalls gelöscht.",
    "স্টোর সম্পাদনা":"Store bearbeiten", "নতুন স্টোর":"Neuer Store", "আইকন (একটি ইমোজি/অক্ষর)":"Symbol (ein Emoji oder Buchstabe)",
    "যেমন 📱":"z. B. 📱", "এই স্টোরে কী কী থাকে…":"Was dieser Store enthält…", "যেমন: আমার অ্যাপসমূহ":"z. B. Meine Apps",
    "+ নতুন আইটেম":"+ Neuer Eintrag", "প্রথমে একটি স্টোর তৈরি করুন।":"Erstelle zuerst einen Store.",
    "আইটেম সবসময় কোনো না কোনো স্টোরের ভেতরে থাকে।":"Einträge leben immer in einem Store.",
    "“হোমে ফিচার” দিলে আইটেমটি হোমের ফিচারড সেকশনে দেখাবে। বইয়ের কপির জন্য লেখক/বছর, এক্সটেনশনের জন্য ইনস্টল নির্দেশ ফিল্ড ভরে দিন।":"„Auf Startseite hervorheben“ zeigt den Eintrag im ausgewählten Abschnitt. Für Buchkopien Autor/Jahr, für Erweiterungen die Installationsschritte ausfüllen.",
    "এই স্টোরে এখনো আইটেম নেই। “+ নতুন আইটেম” চেপে যোগ করুন।":"Noch keine Einträge in diesem Store. Drücke „+ Neuer Eintrag“.",
    "“{name}” আইটেমটি মুছে ফেলবেন?":"Eintrag „{name}“ löschen?", "আইটেম সম্পাদনা":"Eintrag bearbeiten", "নতুন আইটেম":"Neuer Eintrag",
    "ধরন (type)":"Kategorie", "কাস্টম টাইপের নাম":"Name des benutzerdefinierten Typs",
    "যেমন: গেম, টেমপ্লেট, UI কিট…":"z. B. Spiele, Vorlagen, UI-Kits…", "যেমন: Wallora":"z. B. Wallora",
    "এক লাইনের পরিচয় (tagline)":"Einzeiliges Kennwort", "সংক্ষিপ্ত বর্ণনা":"Kurze Beschreibung", "বিস্তারিত বিবরণ…":"Detaillierte Beschreibung…",
    "ট্যাগ (কমা দিয়ে)":"Tags (durch Komma getrennt)", "বইয়ের কপি":"Buchkopie", "লেখকের নাম":"Name des Autors", "এক্সটেনশন":"Erweiterung",
    "কীভাবে ইনস্টল করবেন…":"Wie man es installiert…", "কভার":"Cover", "কভার রঙ":"Cover-Farbe", "নিজের রঙ":"Eigene Farbe",
    "কভার ছবির লিংক":"Cover-Bildlink", "https://… (ছবির সরাসরি লিংক)":"https://… (direktes Bild)", "ডাউনলোড ও লিংক":"Download & Links",
    "ডাউনলোড লিংক":"Download-Link",
    "GitHub Release-এর asset লিংক বা যেকোনো সরাসরি ফাইল লিংক দিন।":"Füge einen GitHub-Release-Asset-Link oder einen direkten Datei-Link ein.",
    "সোর্স লিংক":"Quellen-Link", "বিস্তারিত পাতায় দেখানোর নোট…":"Notiz auf der Detailseite…", "হোমে ফিচার":"Auf Startseite hervorheben",
    "প্রশ্নোত্তর (FAQ)":"Fragen (FAQ)", "+ নতুন প্রশ্ন":"+ Neue Frage", "প্রশ্ন":"Frage",
    "এখনো কোনো প্রশ্ন নেই। “+ নতুন প্রশ্ন” চেপে যোগ করুন।":"Noch keine Fragen. Drücke „+ Neue Frage“.", "প্রশ্নোত্তর":"Fragen",
    "নতুন প্রশ্ন":"Neue Frage", "প্রশ্ন সম্পাদনা":"Frage bearbeiten", "উত্তর":"Antwort",
    "যেমন: আপনি কী কী নিয়ে কাজ করেন?":"z. B. Woran arbeitest du?", "এখানে উত্তর লিখুন…":"Antwort hier schreiben…",
    "প্রশ্নটি মুছে ফেলবেন?":"Diese Frage löschen?",
    "এই প্রশ্নোত্তরগুলো সাইটের কোণার ভাসমান হেল্পারে দেখাবে। এগুলো আসল AI নয়, আগে থেকে লেখা উত্তর।":"Diese Fragen erscheinen im schwebenden Helfer in der Ecke. Es sind vorab geschriebene Antworten, keine echte KI.",
    "কোনো প্রশ্ন পাওয়া যায়নি।":"Keine Fragen gefunden.", "অন্য কিছু লিখে দেখুন।":"Versuche andere Worte.",
    "মালিক এখনো FAQ যোগ করেননি।":"Der Besitzer hat noch keine FAQ hinzugefügt.", "যোগাযোগ মেসেজ":"Kontachtnachrichten", "রিফ্রেশ":"Aktualisieren",
    "শুধু আপনি (মালিক) এই মেসেজ পড়তে পারবেন; সাধারণ দর্শক পাঠাতে পারবে কিন্তু কারও মেসেজ দেখতে পাবে না।":"Nur du (der Besitzer) kannst diese Nachrichten lesen; Besucher können sie senden, aber niemals die anderer sehen.",
    "কোনো মেসেজ নেই।":"Keine Nachrichten.", "যোগাযোগ ফর্ম থেকে আসা মেসেজ এখানে দেখাবে।":"Nachrichten aus dem Kontaktformular erscheinen hier.",
    "— কোনো স্টোর নেই —":"— keine Stores —", "সাইটের নাম":"Website-Name", "যোগাযোগের ইমেইল":"Kontakt-E-Mail",
    "হোমের পরিচয়ের লেখা (এক/দুই লাইন)":"Identitätszeile der Startseite (ein oder zwei Zeilen)",
    "আপনি কে, কী নিয়ে কাজ করেন…":"Wer du bist und was du baust…",
    "খালি রাখলে হোমে এই লাইন দেখাবে না।":"Leer lassen, um diese Zeile auf der Startseite zu verbergen.",
    "About DEEPostrophy বিভাগের লেখা":"Text für den Abschnitt About DEEPostrophy", "লক্ষ্য, দক্ষতা ও পথচলা…":"Ziele, Fähigkeiten und der Weg…",
    "লেখা সংরক্ষণ":"Text speichern",
    "এই লেখাটি সাইটের About DEEPostrophy বিভাগেই দেখায় — অন্য কোথাও নয়।":"Dieser Text erscheint nur im Abschnitt About DEEPostrophy — sonst nirgends.",
    "ভাষা":"Sprache", "ডিফল্ট English; ভিজিটার নিজে বেছে নিলে সেটি মনে থাকে।":"Standard ist Englisch; die Wahl des Besuchers wird gemerkt.",
    "অটো-ভাষা চালু":"Auto-Sprache aktivieren",
    "ভিজিটার এখনো ভাষা বেয়ে না রাখলে তাঁর ব্রাউজারের ভাষাটি চুপচাপ প্রয়োগ হবে — কোনো প্রশ্ন বা পপআপ আসবে না।":"Hat ein Besucher noch keine Sprache gewählt, wird still die Browsersprache angewendet — ohne Frage oder Popup.",
    "অনুবাদ (আপনার নিজের হাতে)":"Übersetzungen (per Hand)",
    "৮টি ভাষা চালু; খালি থাকা ঘরগুলো স্বয়ংক্রিয়ভাবে English দেখায়।":"8 Sprachen aktiv; leere Felder zeigen automatisch Englisch.",
    "ভাষা তালিকা":"Sprachliste", "প্রতিটি UI লেখার অনুবাদ":"Übersetzung jedes UI-Texts", "সোশ্যাল লিংক":"Social-Links",
    "+ লিংক যোগ করুন":"+ Link hinzufügen",
    "শুধু আসল লিংক দিন (https:// বা mailto: দিয়ে শুরু)।":"Nur echte Links (mit https:// oder mailto: beginnend).",
    "লেবেল (যেমন GitHub)":"Bezeichnung (z. B. GitHub)", "সেটিংস সংরক্ষণ":"Einstellungen speichern", "সংরক্ষিত হয়েছে ✅":"Gespeichert ✅",
    "ডেটা রপ্তানি ও আমদানি":"Daten exportieren & importieren",
    "পুরো সাইটের ডেটা (স্টোর, আইটেম, FAQ, সেটিংস, মেসেজ) এক JSON ফাইলে সংরক্ষণ বা ফিরিয়ে আনুন।":"Speichere oder stelle die gesamte Website (Stores, Einträge, FAQ, Einstellungen, Nachrichten) als eine JSON-Datei wieder her.",
    "⬇ JSON রপ্তানি":"⬇ JSON exportieren", "⬆ JSON আমদানি":"⬆ JSON importieren", "আমদানি সফল ✅":"Import erfolgreich ✅",
    "ফাইল পড়া যায়নি — সঠিক JSON দিন।":"Datei konnte nicht gelesen werden — gültiges JSON angeben.", "লোকাল অ্যাডমিন পাসকোড":"Lokaler Admin-Passcode",
    "Firebase কনফিগ বসানো না থাকলে প্যানেলে ঢুকতে এই লোকাল পাসকোড লাগে (এটি ডিফল্ট নয় — আপনি নিজে সেট করেন)। Firebase চালু হলে এটি প্রযোজ্য থাকবে না।":"Ohne Firebase-Konfiguration öffnet dieser lokale Passcode das Panel (kein Standardwert — du setzt ihn selbst). Mit aktivem Firebase gilt er nicht mehr.",
    "নতুন পাসকোড":"Neuer Passcode", "অন্তত ৪ অক্ষর":"Mindestens 4 Zeichen", "পাসকোড সেট / বদলান":"Passcode setzen / ändern",
    "পাসকোড অন্তত ৪ অক্ষর।":"Der Passcode braucht mindestens 4 Zeichen.", "লোকাল পাসকোড সেট হয়েছে ✅":"Lokaler Passcode gesetzt ✅", "অ্যাপ":"App",
    "AI টুলস":"KI-Werkzeuge", "AI টুল":"KI-Werkzeug", "কালারফুল আর্টস":"Bunte Kunst", "আর্ট":"Kunst", "পাইথন এক্সটেনশন":"Python-Erweiterung",
    "ফাইল সংরক্ষণ":"Dateispeicher", "ফাইল":"Datei", "কাস্টম":"Benutzerdefiniert", "অন্যান্য":"Sonstige", "ওয়ালপেপার":"Hintergrundbild", "ছবি":"Bild",
    "গান":"Lied", "মুভি":"Film", "Portfolio · App Store":"Portfolio · App Store", "ওয়েলকাম টু":"Willkommen bei",
    "আমি অ্যাপ, AI টুল আর ডিজাইন বানাই — পরিষ্কার, দ্রুত আর দেখতে সুন্দর।":"Ich baue Apps, KI-Werkzeuge und Design — sauber, schnell und schön.",
    "যোগাযোগ করুন":"Kontakt aufnehmen", "আর্ট ও ডিজাইন":"Kunst & Design", "পাইথন":"Python",
    "পরিষ্কার UI ও দ্রুত অভিজ্ঞতা":"Saubere UI, schnelle Erfahrung", "AI দিয়ে বাস্তব সমাধান":"Echte Lösungen mit KI",
    "রঙিন, চোখে জমে এমন কাজ":"Bunte Arbeit, ins Auge fallend", "প্র্যাকটিক্যাল স্ক্রিপ্ট ও টুল":"Praktische Skripte & Tools" , "পরিসংখ্যান ও রিঅ্যাকশন":"Statistik & Reaktionen", "মোট ডাউনলোড":"Downloads gesamt", "সেভ":"Speicherungen", "রিঅ্যাকশন":"Reaktionen", "এখনো কোনো রিঅ্যাকশন নেই।":"Noch keine Reaktionen.", "আপনিও প্রথম রিঅ্যাকশন দিতে পারেন।":"Sei der Erste, der reagiert.", "রিঅ্যাকশন দিতে লগ-ইন করুন।":"Melde dich an, um zu reagieren.", "ধন্যবাদ, রিঅ্যাকশন যোগ হয়েছে!":"Danke, deine Reaktion wurde hinzugefügt!", "প্রথম রিঅ্যাকশন দিন":"Erste Reaktion hinzufügen", "আপনার রিঅ্যাকশন":"Deine Reaktion", "প্লে":"Spielen", "নতুন ট্যাবে খুলুন":"In neuem Tab öffnen", "লোড হচ্ছে…":"Wird geladen…", "ফুল স্ক্রিন":"Vollbild", "বন্ধ করুন":"Schließen" },
  ja: {"মেনু":"メニュー", "হোম":"ホーム", "যোগাযোগ":"お問い合わせ", "সাইট দেখুন":"サイトを見る", "স্টোর দেখুন":"ストアを見る", "হোমে ফিরুন":"ホームへ戻る", "← হোমে ফিরুন":"← ホームへ戻る",
    "← স্টোরে ফিরুন":"← ストアへ戻る", "সাহায্য":"ヘルプ", "সাহায্য ও প্রশ্নোত্তর":"ヘルプとよくある質問", "প্রশ্ন খুঁজুন…":"質問を検索…", "ভাষা বদলান":"言語を変更",
    "ভাষা খুঁজুন…":"言語を検索…", "কোনো ভাষা মেলেনি":"該当する言語がありません", "শব্দ চালু":"音オン", "শব্দ বন্ধ":"音オフ",
    "এই সাইট এখন <b>localStorage</b> মোডে চলছে। Firebase কনফিগ বসালেই Firestore/Auth-এ চলে যাবে।":"このサイトは現在<b>localStorage</b>モードで動作しています。Firebase設定を追加するとFirestore/Authに切り替わります.",
    "Firebase মোড সক্রিয়। সব ভিজিটর প্রকাশিত কন্টেন্ট দেখবেন।":"Firebaseモードが有効です。すべての訪問者が公開コンテンツを見られます.", "FIREBASE":"FIREBASE", "LOCAL":"LOCAL",
    "ফিচারড আইটেম":"注目のアイテム", "স্টোরগুলোর বাছাই করা কাজ।":"ストアから厳選した作品.", "স্টোর":"ストア", "স্টোর:":"ストア：", "{label} স্টোর":"{label}ストア",
    "প্রতিটি স্টোরে নিজস্ব ধরনের আইটেম সাজানো থাকে।":"各ストアには独自の種類のアイテムが並びます.", "এখনো কোনো স্টোর যোগ করা হয়নি।":"まだストアが追加されていません.",
    "কন্ট্রোল প্যানেল থেকে আপনার প্রথম স্টোর তৈরি করুন — তারপর ভেতরে আইটেম বসান।":"コントロールパネルで最初のストアを作成し、中にアイテムを追加してください.",
    "কন্ট্রোল প্যানেল খুলুন":"コントロールパネルを開く", "কন্ট্রোল প্যানেল":"コントロールパネル", "নাম, বিবরণ বা ট্যাগ খুঁজুন…":"名前・説明・タグを検索…", "ধরন":"種類", "আইটেম":"アイテム",
    "টি আইটেম":"点のアイテム", "{n}টি আইটেম":"{n}点のアイテム", "আইটেম · {n}টি":"アイテム · {n}点", "এই স্টোরে এখনো কিছু যোগ করা হয়নি।":"このストアにはまだ何も追加されていません.",
    "কন্ট্রোল প্যানেল থেকে আইটেম যোগ করুন।":"コントロールパネルからアイテムを追加してください.", "কোনো ধরন নেই।":"種類がまだありません.", "★ ফিচারড":"★ 注目", "খসড়া":"下書き", "খুলুন":"開く",
    "সোর্স":"ソース", "ডাউনলোড":"ダウンロード", "সোর্স কোড":"ソースコード", "লিংক ও ডাউনলোড":"リンクとダウンロード", "তথ্য":"詳細", "বিবরণ":"説明", "ইনস্টল নির্দেশ":"インストール手順",
    "README":"README", "লিংক":"リンク", "এই আইটেমের কোনো লিংক যোগ করা হয়নি।":"このアイテムにはリンクが追加されていません.",
    "আইটেমটি পাওয়া যায়নি বা প্রকাশিত নয়।":"アイテムが見つからないか、公開されていません.", "লেখক":"著者", "বছর":"年", "পরিচয়":"紹介", "সংযোগ":"つながる",
    "কোনো প্রজেক্ট, সহযোগিতা বা প্রশ্ন থাকলে লিখুন।":"プロジェクト・協業・ご質問があればお気軽にどうぞ.", "নাম":"お名前", "আপনার নাম":"あなたの名前", "ইমেইল":"メール",
    "আপনার ইমেইল":"あなたのメールアドレス", "মেসেজ":"メッセージ", "কী জানাতে চান…":"伝えたいこと…", "পাঠান":"送信", "সরাসরি লিংক":"直接リンク",
    "যোগাযোগের লিংক যোগ করা হয়নি।":"連絡先リンクがまだ追加されていません.",
    "কন্ট্রোল প্যানেল → সাইট সেটিংস থেকে ইমেইল ও সোশ্যাল লিংক দিন।":"コントロールパネル → サイト設定でメールとSNSリンクを追加してください.",
    "এই বিভাগে এখনো লেখা যোগ করা হয়নি।":"このセクションにはまだ文章がありません.", "আপনার নাম সর্বোচ্চ ১০০ অক্ষরের হতে হবে।":"お名前は最大100文字までにしてください.",
    "ইমেইল দিন।":"メールアドレスを入力してください.", "ইমেইল সর্বোচ্চ ১০০ অক্ষরের হতে হবে।":"メールアドレスは最大100文字までにしてください.",
    "সঠিক ইমেইল ঠিকানা দিন (@ সহ)।":"有効なメールアドレス（@を含む）を入力してください.", "মেসেজ লিখুন।":"メッセージを入力してください.",
    "মেসেজ সর্বোচ্চ ২০০০ অক্ষরের হতে পারে।":"メッセージは最大2000文字です.", "ধন্যবাদ! মেসেজটি পাঠানো হয়েছে।":"ありがとうございます！送信しました.",
    "পাঠানো যায়নি: {msg}":"送信できませんでした: {msg}", "এই ঠিকানায় কিছু নেই।":"このアドレスには何もありません.", "মালিকের জন্য সুরক্ষিত এলাকা":"オーナー専用エリア",
    "অ্যাডমিন লগইন":"管理者ログイン", "শুধু মালিক স্টোর, আইটেম ও সেটিংস নিয়ন্ত্রণ করতে পারবেন।":"ストア・アイテム・設定を管理できるのはオーナーだけです.", "পাসওয়ার্ড":"パスワード",
    "প্রবেশ করুন":"ログイン", "প্রবেশ":"入る", "শুধু মালিকই এখানে ঢুকতে পারবেন।":"ここに入れるのはオーナーだけです.", "পাসকোড":"パスコード",
    "নতুন পাসকোড সেট করুন (৪+ অক্ষর)":"新しいパスコードを設定（4文字以上）", "আপনি মালিক নন।":"あなたはオーナーではありません.", "লগইন ব্যর্থ।":"ログインに失敗しました.",
    "সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।":"接続で問題が発生しました。もう一度お試しください.",
    "ইমেইল যাচাই করুন। আপনার ইনবক্সে পাঠানো লিংকে ক্লিক করুন।":"メールを確認し、受信トレイのリンクをクリックしてください.", "যাচাই-লিংক আবার পাঠান":"確認リンクを再送",
    "পাঠানো হচ্ছে…":"送信中…",
    "যাচাই-লিংক পাঠানো হয়েছে ✅ ইনবক্স (না-থাকলে স্প্যাম) দেখুন, লিংকে ক্লিক করুন, তারপর আবার লগইন করুন।":"確認リンクを送信しました ✅ 受信トレイ（なければ迷惑メール）を確認し、リンクをクリックしてから再ログインしてください.",
    "ভুল পাসকোড।":"パスコードが違います.", "পাসকোড অন্তত ৪ অক্ষরের দিন।":"4文字以上のパスコードを入力してください.", "সাইট ব্যবস্থাপনা":"サイト管理", "লগআউট":"ログアウト",
    "সাইট সেটিংস":"サイト設定", "ডেটা":"データ", "FAQ":"FAQ", "ক্রম":"並び順", "প্রকাশ":"公開", "অ্যাকশন":"操作", "সম্পাদনা":"編集", "মুছুন":"削除", "সংরক্ষণ":"保存",
    "বাতিল":"キャンセル", "প্রকাশিত":"公開済み", "ফিচার":"注目", "স্টোর ব্যবস্থাপনা":"ストア管理", "+ নতুন স্টোর":"+ 新規ストア",
    "↑ ↓ দিয়ে ক্রম বদলান। “প্রকাশ” বন্ধ থাকলে স্টোরটি সাইটে দেখাবে না। স্টোর মুছলে তার ভেতরের সব আইটেমও মুছে যাবে।":"↑ ↓ で並び順を変更します。「公開」がオフのストアはサイトに表示されません。ストアを削除すると中身のアイテムもすべて削除されます.",
    "এখনো কোনো স্টোর নেই। “+ নতুন স্টোর” চেপে শুরু করুন।":"まだストアがありません。「+ 新規ストア」を押して開始してください.",
    "“{name}” স্টোরটি মুছে ফেলবেন? ভেতরের সব আইটেমও মুছে যাবে।":"ストア「{name}」を削除しますか？中のアイテムもすべて削除されます.", "স্টোর সম্পাদনা":"ストア編集", "নতুন স্টোর":"新規ストア",
    "আইকন (একটি ইমোজি/অক্ষর)":"アイコン（絵文字または1文字）", "যেমন 📱":"例：📱", "এই স্টোরে কী কী থাকে…":"このストアの内容…", "যেমন: আমার অ্যাপসমূহ":"例：マイアプリ",
    "+ নতুন আইটেম":"+ 新規アイテム", "প্রথমে একটি স্টোর তৈরি করুন।":"最初にストアを作成してください.",
    "আইটেম সবসময় কোনো না কোনো স্টোরের ভেতরে থাকে।":"アイテムは必ずいずれかのストアの中にあります.",
    "“হোমে ফিচার” দিলে আইটেমটি হোমের ফিচারড সেকশনে দেখাবে। বইয়ের কপির জন্য লেখক/বছর, এক্সটেনশনের জন্য ইনস্টল নির্দেশ ফিল্ড ভরে দিন।":"「ホームで注目」にするとアイテムがホームの注目セクションに表示されます。書籍コピーは著者／年、拡張機能はインストール手順を入力してください.",
    "এই স্টোরে এখনো আইটেম নেই। “+ নতুন আইটেম” চেপে যোগ করুন।":"このストアにはまだアイテムがありません。「+ 新規アイテム」を押して追加してください.",
    "“{name}” আইটেমটি মুছে ফেলবেন?":"アイテム「{name}」を削除しますか？", "আইটেম সম্পাদনা":"アイテム編集", "নতুন আইটেম":"新規アイテム", "ধরন (type)":"カテゴリ",
    "কাস্টম টাইপের নাম":"カスタム種類の名称", "যেমন: গেম, টেমপ্লেট, UI কিট…":"例：ゲーム、テンプレート、UIキット…", "যেমন: Wallora":"例：Wallora",
    "এক লাইনের পরিচয় (tagline)":"一行の紹介文", "সংক্ষিপ্ত বর্ণনা":"短い説明", "বিস্তারিত বিবরণ…":"詳しい説明…", "ট্যাগ (কমা দিয়ে)":"タグ（カンマ区切り）",
    "বইয়ের কপি":"書籍コピー", "লেখকের নাম":"著者名", "এক্সটেনশন":"拡張機能", "কীভাবে ইনস্টল করবেন…":"インストール方法…", "কভার":"カバー", "কভার রঙ":"カバーのカラー",
    "নিজের রঙ":"カスタムカラー", "কভার ছবির লিংক":"カバー画像のリンク", "https://… (ছবির সরাসরি লিংক)":"https://…（画像の直接リンク）", "ডাউনলোড ও লিংক":"ダウンロードとリンク",
    "ডাউনলোড লিংক":"ダウンロードリンク", "GitHub Release-এর asset লিংক বা যেকোনো সরাসরি ফাইল লিংক দিন।":"GitHub Releaseのアセットリンク、または任意の直接ファイルリンクを貼り付けてください.",
    "সোর্স লিংক":"ソースリンク", "বিস্তারিত পাতায় দেখানোর নোট…":"詳細ページに表示するメモ…", "হোমে ফিচার":"ホームで注目", "প্রশ্নোত্তর (FAQ)":"よくある質問（FAQ）",
    "+ নতুন প্রশ্ন":"+ 新規質問", "প্রশ্ন":"質問", "এখনো কোনো প্রশ্ন নেই। “+ নতুন প্রশ্ন” চেপে যোগ করুন।":"まだ質問がありません。「+ 新規質問」を押して追加してください.",
    "প্রশ্নোত্তর":"よくある質問", "নতুন প্রশ্ন":"新規質問", "প্রশ্ন সম্পাদনা":"質問を編集", "উত্তর":"回答", "যেমন: আপনি কী কী নিয়ে কাজ করেন?":"例：どんな仕事をしていますか？",
    "এখানে উত্তর লিখুন…":"ここに回答を書く…", "প্রশ্নটি মুছে ফেলবেন?":"この質問を削除しますか？",
    "এই প্রশ্নোত্তরগুলো সাইটের কোণার ভাসমান হেল্পারে দেখাবে। এগুলো আসল AI নয়, আগে থেকে লেখা উত্তর।":"これらの質問はサイト隅のフローティングヘルパーに表示されます。本物のAIではなく、あらかじめ書かれた回答です.",
    "কোনো প্রশ্ন পাওয়া যায়নি।":"質問が見つかりませんでした.", "অন্য কিছু লিখে দেখুন।":"別の言葉でお試しください.", "মালিক এখনো FAQ যোগ করেননি।":"オーナーはまだFAQを追加していません.",
    "যোগাযোগ মেসেজ":"お問い合わせメッセージ", "রিফ্রেশ":"更新",
    "শুধু আপনি (মালিক) এই মেসেজ পড়তে পারবেন; সাধারণ দর্শক পাঠাতে পারবে কিন্তু কারও মেসেজ দেখতে পাবে না।":"読めるのはあなた（オーナー）だけです。訪問者は送信できますが、誰もメッセージを見られません.",
    "কোনো মেসেজ নেই।":"メッセージはありません.", "যোগাযোগ ফর্ম থেকে আসা মেসেজ এখানে দেখাবে।":"お問い合わせフォームからのメッセージがここに表示されます.", "— কোনো স্টোর নেই —":"— ストアなし —",
    "সাইটের নাম":"サイト名", "যোগাযোগের ইমেইল":"連絡先メール", "হোমের পরিচয়ের লেখা (এক/দুই লাইন)":"ホームの紹介文（1〜2行）", "আপনি কে, কী নিয়ে কাজ করেন…":"あなた自身と作るもの…",
    "খালি রাখলে হোমে এই লাইন দেখাবে না।":"空にするとホームにこの行は表示されません.", "About DEEPostrophy বিভাগের লেখা":"About DEEPostrophyセクションの文章",
    "লক্ষ্য, দক্ষতা ও পথচলা…":"目標・スキル・歩み…", "লেখা সংরক্ষণ":"文章を保存",
    "এই লেখাটি সাইটের About DEEPostrophy বিভাগেই দেখায় — অন্য কোথাও নয়।":"この文章はサイトのAbout DEEPostrophyセクションにのみ表示されます.", "ভাষা":"言語",
    "ডিফল্ট English; ভিজিটার নিজে বেছে নিলে সেটি মনে থাকে।":"既定は英語。訪問者が選んだ言語は記憶されます.", "অটো-ভাষা চালু":"自動言語を有効化",
    "ভিজিটার এখনো ভাষা বেয়ে না রাখলে তাঁর ব্রাউজারের ভাষাটি চুপচাপ প্রয়োগ হবে — কোনো প্রশ্ন বা পপআপ আসবে না।":"訪問者がまだ言語を選んでいなければ、ブラウザの言語が静かに適用されます。質問もポップアップも出ません.",
    "অনুবাদ (আপনার নিজের হাতে)":"翻訳（手作業）", "৮টি ভাষা চালু; খালি থাকা ঘরগুলো স্বয়ংক্রিয়ভাবে English দেখায়।":"8言語が有効。空の欄は自動的に英語を表示します.",
    "ভাষা তালিকা":"言語一覧", "প্রতিটি UI লেখার অনুবাদ":"UI文言の翻訳", "সোশ্যাল লিংক":"SNSリンク", "+ লিংক যোগ করুন":"+ リンクを追加",
    "শুধু আসল লিংক দিন (https:// বা mailto: দিয়ে শুরু)।":"実際のリンクのみ（https://かmailto:で始まるもの）.", "লেবেল (যেমন GitHub)":"ラベル（例：GitHub）",
    "সেটিংস সংরক্ষণ":"設定を保存", "সংরক্ষিত হয়েছে ✅":"保存しました ✅", "ডেটা রপ্তানি ও আমদানি":"データのエクスポートとインポート",
    "পুরো সাইটের ডেটা (স্টোর, আইটেম, FAQ, সেটিংস, মেসেজ) এক JSON ফাইলে সংরক্ষণ বা ফিরিয়ে আনুন।":"サイト全体（ストア、アイテム、FAQ、設定、メッセージ）をJSONファイル1つで保存・復元します.",
    "⬇ JSON রপ্তানি":"⬇ JSONを書き出す", "⬆ JSON আমদানি":"⬆ JSONを読み込む", "আমদানি সফল ✅":"読み込み成功 ✅",
    "ফাইল পড়া যায়নি — সঠিক JSON দিন।":"ファイルを読み取れませんでした。正しいJSONを指定してください.", "লোকাল অ্যাডমিন পাসকোড":"ローカル管理者パスコード",
    "Firebase কনফিগ বসানো না থাকলে প্যানেলে ঢুকতে এই লোকাল পাসকোড লাগে (এটি ডিফল্ট নয় — আপনি নিজে সেট করেন)। Firebase চালু হলে এটি প্রযোজ্য থাকবে না।":"Firebase設定がない場合、このローカルパスコードでパネルに入ります（既定値ではなく自分で設定します）。Firebase有効後は適用されません.",
    "নতুন পাসকোড":"新しいパスコード", "অন্তত ৪ অক্ষর":"4文字以上", "পাসকোড সেট / বদলান":"パスコードを設定／変更", "পাসকোড অন্তত ৪ অক্ষর।":"パスコードは4文字以上必要です.",
    "লোকাল পাসকোড সেট হয়েছে ✅":"ローカルパスコードを設定しました ✅", "অ্যাপ":"アプリ", "AI টুলস":"AIツール", "AI টুল":"AIツール", "কালারফুল আর্টস":"カラフルなアート", "আর্ট":"アート",
    "পাইথন এক্সটেনশন":"Python拡張機能", "ফাইল সংরক্ষণ":"ファイル保存", "ফাইল":"ファイル", "কাস্টম":"カスタム", "অন্যান্য":"その他", "ওয়ালপেপার":"壁紙", "ছবি":"画像",
    "গান":"音楽", "মুভি":"映像", "Portfolio · App Store":"Portfolio · App Store", "ওয়েলকাম টু":"ようこそ",
    "আমি অ্যাপ, AI টুল আর ডিজাইন বানাই — পরিষ্কার, দ্রুত আর দেখতে সুন্দর।":"アプリ・AIツール・デザインを作ります — クリーンで高速、見た目も美しく.", "যোগাযোগ করুন":"お問い合わせ",
    "আর্ট ও ডিজাইন":"アートとデザイン", "পাইথন":"Python", "পরিষ্কার UI ও দ্রুত অভিজ্ঞতা":"クリーンなUIと高速な体験", "AI দিয়ে বাস্তব সমাধান":"AIによる実践的な解決",
    "রঙিন, চোখে জমে এমন কাজ":"目を引くカラフルな作品", "প্র্যাকটিক্যাল স্ক্রিপ্ট ও টুল":"実用的なスクリプトとツール" , "পরিসংখ্যান ও রিঅ্যাকশন":"統計とリアクション", "মোট ডাউনলোড":"総ダウンロード数", "সেভ":"保存数", "রিঅ্যাকশন":"リアクション", "এখনো কোনো রিঅ্যাকশন নেই।":"リアクションはまだありません。", "আপনিও প্রথম রিঅ্যাকশন দিতে পারেন।":"最初にリアクションしてみましょう。", "রিঅ্যাকশন দিতে লগ-ইন করুন।":"リアクションするにはログインしてください。", "ধন্যবাদ, রিঅ্যাকশন যোগ হয়েছে!":"ありがとう、リアクションを追加しました！", "প্রথম রিঅ্যাকশন দিন":"最初のリアクション", "আপনার রিঅ্যাকশন":"あなたのリアクション", "প্লে":"プレイ", "নতুন ট্যাবে খুলুন":"新しいタブで開く", "লোড হচ্ছে…":"読み込み中…", "ফুল স্ক্রিন":"全画面", "বন্ধ করুন":"閉じる" },
  fr: {"মেনু":"Menu", "হোম":"Accueil", "যোগাযোগ":"Contact", "সাইট দেখুন":"Voir le site", "স্টোর দেখুন":"Parcourir la boutique",
    "হোমে ফিরুন":"Retour à l'accueil", "← হোমে ফিরুন":"← Retour à l'accueil", "← স্টোরে ফিরুন":"← Retour à la boutique", "সাহায্য":"Aide",
    "সাহায্য ও প্রশ্নোত্তর":"Aide et FAQ", "প্রশ্ন খুঁজুন…":"Rechercher une question…", "ভাষা বদলান":"Changer de langue",
    "ভাষা খুঁজুন…":"Rechercher une langue…", "কোনো ভাষা মেলেনি":"Aucune langue ne correspond", "শব্দ চালু":"Son activé", "শব্দ বন্ধ":"Son désactivé",
    "এই সাইট এখন <b>localStorage</b> মোডে চলছে। Firebase কনফিগ বসালেই Firestore/Auth-এ চলে যাবে।":"Ce site fonctionne en mode <b>localStorage</b>. Ajoutez la configuration Firebase pour passer à Firestore/Auth.",
    "Firebase মোড সক্রিয়। সব ভিজিটর প্রকাশিত কন্টেন্ট দেখবেন।":"Mode Firebase actif. Tous les visiteurs voient vos contenus publiés.",
    "FIREBASE":"FIREBASE", "LOCAL":"LOCAL", "ফিচারড আইটেম":"Éléments en vedette", "স্টোরগুলোর বাছাই করা কাজ।":"Une sélection des boutiques.",
    "স্টোর":"Boutique", "স্টোর:":"Boutique :", "{label} স্টোর":"Boutique {label}",
    "প্রতিটি স্টোরে নিজস্ব ধরনের আইটেম সাজানো থাকে।":"Chaque boutique contient des éléments de son propre type.",
    "এখনো কোনো স্টোর যোগ করা হয়নি।":"Aucune boutique n'a encore été ajoutée.",
    "কন্ট্রোল প্যানেল থেকে আপনার প্রথম স্টোর তৈরি করুন — তারপর ভেতরে আইটেম বসান।":"Créez votre première boutique dans le panneau de contrôle, puis ajoutez-y des éléments.",
    "কন্ট্রোল প্যানেল খুলুন":"Ouvrir le panneau de contrôle", "কন্ট্রোল প্যানেল":"Panneau de contrôle",
    "নাম, বিবরণ বা ট্যাগ খুঁজুন…":"Rechercher nom, description ou tag…", "ধরন":"Type", "আইটেম":"Élément", "টি আইটেম":"éléments",
    "{n}টি আইটেম":"{n} éléments", "আইটেম · {n}টি":"Éléments · {n}",
    "এই স্টোরে এখনো কিছু যোগ করা হয়নি।":"Rien n'a encore été ajouté à cette boutique.",
    "কন্ট্রোল প্যানেল থেকে আইটেম যোগ করুন।":"Ajoutez des éléments depuis le panneau de contrôle.", "কোনো ধরন নেই।":"Aucun type pour l'instant.",
    "★ ফিচারড":"★ En vedette", "খসড়া":"Brouillon", "খুলুন":"Ouvrir", "সোর্স":"Source", "ডাউনলোড":"Télécharger", "সোর্স কোড":"Code source",
    "লিংক ও ডাউনলোড":"Liens et téléchargement", "তথ্য":"Détails", "বিবরণ":"Description", "ইনস্টল নির্দেশ":"Étapes d'installation", "README":"README",
    "লিংক":"Lien", "এই আইটেমের কোনো লিংক যোগ করা হয়নি।":"Aucun lien n'a été ajouté pour cet élément.",
    "আইটেমটি পাওয়া যায়নি বা প্রকাশিত নয়।":"Cet élément est introuvable ou n'est pas publié.", "লেখক":"Auteur", "বছর":"Année", "পরিচয়":"Identité",
    "সংযোগ":"Connecter", "কোনো প্রজেক্ট, সহযোগিতা বা প্রশ্ন থাকলে লিখুন।":"Écrivez-moi pour un projet, une collaboration ou une question.",
    "নাম":"Nom", "আপনার নাম":"Votre nom", "ইমেইল":"E-mail", "আপনার ইমেইল":"Votre e-mail", "মেসেজ":"Message",
    "কী জানাতে চান…":"Que souhaitez-vous partager…", "পাঠান":"Envoyer", "সরাসরি লিংক":"Liens directs",
    "যোগাযোগের লিংক যোগ করা হয়নি।":"Aucun lien de contact n'a été ajouté.",
    "কন্ট্রোল প্যানেল → সাইট সেটিংস থেকে ইমেইল ও সোশ্যাল লিংক দিন।":"Ajoutez e-mail et liens sociaux dans Panneau → Paramètres du site.",
    "এই বিভাগে এখনো লেখা যোগ করা হয়নি।":"Aucun texte n'a encore été ajouté à cette section.",
    "আপনার নাম সর্বোচ্চ ১০০ অক্ষরের হতে হবে।":"Votre nom doit contenir au maximum 100 caractères.", "ইমেইল দিন।":"Veuillez saisir votre e-mail.",
    "ইমেইল সর্বোচ্চ ১০০ অক্ষরের হতে হবে।":"L'e-mail doit contenir au maximum 100 caractères.",
    "সঠিক ইমেইল ঠিকানা দিন (@ সহ)।":"Saisissez une adresse e-mail valide (avec @).", "মেসেজ লিখুন।":"Veuillez écrire un message.",
    "মেসেজ সর্বোচ্চ ২০০০ অক্ষরের হতে পারে।":"Le message peut contenir au maximum 2000 caractères.",
    "ধন্যবাদ! মেসেজটি পাঠানো হয়েছে।":"Merci ! Votre message a été envoyé.", "পাঠানো যায়নি: {msg}":"Envoi impossible : {msg}",
    "এই ঠিকানায় কিছু নেই।":"Rien à cette adresse.", "মালিকের জন্য সুরক্ষিত এলাকা":"Espace sécurisé pour le propriétaire",
    "অ্যাডমিন লগইন":"Connexion admin",
    "শুধু মালিক স্টোর, আইটেম ও সেটিংস নিয়ন্ত্রণ করতে পারবেন।":"Seul le propriétaire gère les boutiques, éléments et paramètres.",
    "পাসওয়ার্ড":"Mot de passe", "প্রবেশ করুন":"Se connecter", "প্রবেশ":"Entrer",
    "শুধু মালিকই এখানে ঢুকতে পারবেন।":"Seul le propriétaire peut se connecter ici.", "পাসকোড":"Code secret",
    "নতুন পাসকোড সেট করুন (৪+ অক্ষর)":"Définir un nouveau code (4+ caractères)", "আপনি মালিক নন।":"Vous n'êtes pas le propriétaire.",
    "লগইন ব্যর্থ।":"Échec de connexion.", "সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।":"Problème de connexion. Réessayez.",
    "ইমেইল যাচাই করুন। আপনার ইনবক্সে পাঠানো লিংকে ক্লিক করুন।":"Vérifiez votre e-mail. Cliquez sur le lien envoyé dans votre boîte de réception.",
    "যাচাই-লিংক আবার পাঠান":"Renvoyer le lien de vérification", "পাঠানো হচ্ছে…":"Envoi en cours…",
    "যাচাই-লিংক পাঠানো হয়েছে ✅ ইনবক্স (না-থাকলে স্প্যাম) দেখুন, লিংকে ক্লিক করুন, তারপর আবার লগইন করুন।":"Lien de vérification envoyé ✅ Consultez la boîte (et les indésirables), cliquez sur le lien, puis reconnectez-vous.",
    "ভুল পাসকোড।":"Code incorrect.", "পাসকোড অন্তত ৪ অক্ষরের দিন।":"Saisissez un code d'au moins 4 caractères.", "সাইট ব্যবস্থাপনা":"Gestion du site",
    "লগআউট":"Se déconnecter", "সাইট সেটিংস":"Paramètres du site", "ডেটা":"Données", "FAQ":"FAQ", "ক্রম":"Ordre", "প্রকাশ":"Publier",
    "অ্যাকশন":"Actions", "সম্পাদনা":"Modifier", "মুছুন":"Supprimer", "সংরক্ষণ":"Enregistrer", "বাতিল":"Annuler", "প্রকাশিত":"Publié",
    "ফিচার":"En vedette", "স্টোর ব্যবস্থাপনা":"Gestion des boutiques", "+ নতুন স্টোর":"+ Nouvelle boutique",
    "↑ ↓ দিয়ে ক্রম বদলান। “প্রকাশ” বন্ধ থাকলে স্টোরটি সাইটে দেখাবে না। স্টোর মুছলে তার ভেতরের সব আইটেমও মুছে যাবে।":"Utilisez ↑ ↓ pour changer l'ordre. Une boutique avec « Publier » désactivé reste masquée. Supprimer une boutique supprime aussi tous ses éléments.",
    "এখনো কোনো স্টোর নেই। “+ নতুন স্টোর” চেপে শুরু করুন।":"Aucune boutique pour l'instant. Appuyez sur « + Nouvelle boutique ».",
    "“{name}” স্টোরটি মুছে ফেলবেন? ভেতরের সব আইটেমও মুছে যাবে।":"Supprimer la boutique « {name} » ? Tous ses éléments seront aussi supprimés.",
    "স্টোর সম্পাদনা":"Modifier la boutique", "নতুন স্টোর":"Nouvelle boutique", "আইকন (একটি ইমোজি/অক্ষর)":"Icône (un emoji ou une lettre)",
    "যেমন 📱":"ex. 📱", "এই স্টোরে কী কী থাকে…":"Ce que contient cette boutique…", "যেমন: আমার অ্যাপসমূহ":"ex. Mes applis",
    "+ নতুন আইটেম":"+ Nouvel élément", "প্রথমে একটি স্টোর তৈরি করুন।":"Créez d'abord une boutique.",
    "আইটেম সবসময় কোনো না কোনো স্টোরের ভেতরে থাকে।":"Les éléments vivent toujours dans une boutique.",
    "“হোমে ফিচার” দিলে আইটেমটি হোমের ফিচারড সেকশনে দেখাবে। বইয়ের কপির জন্য লেখক/বছর, এক্সটেনশনের জন্য ইনস্টল নির্দেশ ফিল্ড ভরে দিন।":"« Mettre en avant » affiche l'élément dans la section vedette. Pour une copie de livre remplissez auteur/année ; pour une extension, les étapes d'installation.",
    "এই স্টোরে এখনো আইটেম নেই। “+ নতুন আইটেম” চেপে যোগ করুন।":"Aucun élément dans cette boutique. Appuyez sur « + Nouvel élément ».",
    "“{name}” আইটেমটি মুছে ফেলবেন?":"Supprimer l'élément « {name} » ?", "আইটেম সম্পাদনা":"Modifier l'élément", "নতুন আইটেম":"Nouvel élément",
    "ধরন (type)":"Catégorie", "কাস্টম টাইপের নাম":"Nom du type personnalisé", "যেমন: গেম, টেমপ্লেট, UI কিট…":"ex. Jeux, Modèles, Kits UI…",
    "যেমন: Wallora":"ex. Wallora", "এক লাইনের পরিচয় (tagline)":"Accroche en une ligne", "সংক্ষিপ্ত বর্ণনা":"Description courte",
    "বিস্তারিত বিবরণ…":"Description détaillée…", "ট্যাগ (কমা দিয়ে)":"Tags (séparés par des virgules)", "বইয়ের কপি":"Copie du livre",
    "লেখকের নাম":"Nom de l'auteur", "এক্সটেনশন":"Extension", "কীভাবে ইনস্টল করবেন…":"Comment l'installer…", "কভার":"Couverture",
    "কভার রঙ":"Couleur de couverture", "নিজের রঙ":"Couleur personnalisée", "কভার ছবির লিংক":"Lien de l'image de couverture",
    "https://… (ছবির সরাসরি লিংক)":"https://… (lien direct de l'image)", "ডাউনলোড ও লিংক":"Téléchargement et liens",
    "ডাউনলোড লিংক":"Lien de téléchargement",
    "GitHub Release-এর asset লিংক বা যেকোনো সরাসরি ফাইল লিংক দিন।":"Collez un lien d'asset GitHub Release ou tout lien direct de fichier.",
    "সোর্স লিংক":"Lien source", "বিস্তারিত পাতায় দেখানোর নোট…":"Note affichée sur la page de détail…", "হোমে ফিচার":"Mettre en avant",
    "প্রশ্নোত্তর (FAQ)":"Questions (FAQ)", "+ নতুন প্রশ্ন":"+ Nouvelle question", "প্রশ্ন":"Question",
    "এখনো কোনো প্রশ্ন নেই। “+ নতুন প্রশ্ন” চেপে যোগ করুন।":"Aucune question pour l'instant. Appuyez sur « + Nouvelle question ».",
    "প্রশ্নোত্তর":"Questions", "নতুন প্রশ্ন":"Nouvelle question", "প্রশ্ন সম্পাদনা":"Modifier la question", "উত্তর":"Réponse",
    "যেমন: আপনি কী কী নিয়ে কাজ করেন?":"ex. Sur quoi travaillez-vous ?", "এখানে উত্তর লিখুন…":"Écrivez la réponse ici…",
    "প্রশ্নটি মুছে ফেলবেন?":"Supprimer cette question ?",
    "এই প্রশ্নোত্তরগুলো সাইটের কোণার ভাসমান হেল্পারে দেখাবে। এগুলো আসল AI নয়, আগে থেকে লেখা উত্তর।":"Ces questions apparaissent dans l'assistant flottant du coin. Ce sont des réponses préécrites, pas une vraie IA.",
    "কোনো প্রশ্ন পাওয়া যায়নি।":"Aucune question trouvée.", "অন্য কিছু লিখে দেখুন।":"Essayez d'autres mots.",
    "মালিক এখনো FAQ যোগ করেননি।":"Le propriétaire n'a pas encore ajouté de FAQ.", "যোগাযোগ মেসেজ":"Messages de contact", "রিফ্রেশ":"Rafraîchir",
    "শুধু আপনি (মালিক) এই মেসেজ পড়তে পারবেন; সাধারণ দর্শক পাঠাতে পারবে কিন্তু কারও মেসেজ দেখতে পাবে না।":"Vous seul (le propriétaire) pouvez lire ces messages ; les visiteurs peuvent les envoyer mais ne voient jamais ceux des autres.",
    "কোনো মেসেজ নেই।":"Aucun message.", "যোগাযোগ ফর্ম থেকে আসা মেসেজ এখানে দেখাবে।":"Les messages du formulaire de contact apparaissent ici.",
    "— কোনো স্টোর নেই —":"— aucune boutique —", "সাইটের নাম":"Nom du site", "যোগাযোগের ইমেইল":"E-mail de contact",
    "হোমের পরিচয়ের লেখা (এক/দুই লাইন)":"Ligne d'identité de l'accueil (une ou deux lignes)",
    "আপনি কে, কী নিয়ে কাজ করেন…":"Qui vous êtes et ce que vous créez…",
    "খালি রাখলে হোমে এই লাইন দেখাবে না।":"Laissez vide pour masquer cette ligne sur l'accueil.",
    "About DEEPostrophy বিভাগের লেখা":"Texte de la section About DEEPostrophy", "লক্ষ্য, দক্ষতা ও পথচলা…":"Objectifs, compétences et parcours…",
    "লেখা সংরক্ষণ":"Enregistrer le texte",
    "এই লেখাটি সাইটের About DEEPostrophy বিভাগেই দেখায় — অন্য কোথাও নয়।":"Ce texte n'apparaît que dans la section About DEEPostrophy du site — nulle part ailleurs.",
    "ভাষা":"Langue", "ডিফল্ট English; ভিজিটার নিজে বেছে নিলে সেটি মনে থাকে।":"Par défaut anglais ; le choix du visiteur est mémorisé.",
    "অটো-ভাষা চালু":"Activer la langue auto",
    "ভিজিটার এখনো ভাষা বেয়ে না রাখলে তাঁর ব্রাউজারের ভাষাটি চুপচাপ প্রয়োগ হবে — কোনো প্রশ্ন বা পপআপ আসবে না।":"Si un visiteur n'a pas encore choisi de langue, celle de son navigateur est appliquée en silence — sans question ni popup.",
    "অনুবাদ (আপনার নিজের হাতে)":"Traductions (à la main)",
    "৮টি ভাষা চালু; খালি থাকা ঘরগুলো স্বয়ংক্রিয়ভাবে English দেখায়।":"8 langues actives ; les champs vides affichent l'anglais automatiquement.",
    "ভাষা তালিকা":"Liste des langues", "প্রতিটি UI লেখার অনুবাদ":"Traduction de chaque texte de l'interface", "সোশ্যাল লিংক":"Liens sociaux",
    "+ লিংক যোগ করুন":"+ Ajouter un lien",
    "শুধু আসল লিংক দিন (https:// বা mailto: দিয়ে শুরু)।":"Utilisez seulement des liens réels (commençant par https:// ou mailto:).",
    "লেবেল (যেমন GitHub)":"Libellé (ex. GitHub)", "সেটিংস সংরক্ষণ":"Enregistrer les paramètres", "সংরক্ষিত হয়েছে ✅":"Enregistré ✅",
    "ডেটা রপ্তানি ও আমদানি":"Export et import de données",
    "পুরো সাইটের ডেটা (স্টোর, আইটেম, FAQ, সেটিংস, মেসেজ) এক JSON ফাইলে সংরক্ষণ বা ফিরিয়ে আনুন।":"Enregistrez ou restaurez tout le site (boutiques, éléments, FAQ, paramètres, messages) dans un seul fichier JSON.",
    "⬇ JSON রপ্তানি":"⬇ Exporter en JSON", "⬆ JSON আমদানি":"⬆ Importer un JSON", "আমদানি সফল ✅":"Import réussi ✅",
    "ফাইল পড়া যায়নি — সঠিক JSON দিন।":"Fichier illisible — fournissez un JSON valide.", "লোকাল অ্যাডমিন পাসকোড":"Code admin local",
    "Firebase কনফিগ বসানো না থাকলে প্যানেলে ঢুকতে এই লোকাল পাসকোড লাগে (এটি ডিফল্ট নয় — আপনি নিজে সেট করেন)। Firebase চালু হলে এটি প্রযোজ্য থাকবে না।":"Sans configuration Firebase, ce code local ouvre le panneau (ce n'est pas un défaut — vous le définissez). Il ne s'applique plus une fois Firebase activé.",
    "নতুন পাসকোড":"Nouveau code", "অন্তত ৪ অক্ষর":"Au moins 4 caractères", "পাসকোড সেট / বদলান":"Définir / changer le code",
    "পাসকোড অন্তত ৪ অক্ষর।":"Le code nécessite au moins 4 caractères.", "লোকাল পাসকোড সেট হয়েছে ✅":"Code local défini ✅", "অ্যাপ":"Appli",
    "AI টুলস":"Outils IA", "AI টুল":"Outil IA", "কালারফুল আর্টস":"Arts colorés", "আর্ট":"Art", "পাইথন এক্সটেনশন":"Extension Python",
    "ফাইল সংরক্ষণ":"Stockage de fichiers", "ফাইল":"Fichier", "কাস্টম":"Personnalisé", "অন্যান্য":"Autres", "ওয়ালপেপার":"Fond d'écran", "ছবি":"Image",
    "গান":"Chanson", "মুভি":"Film", "Portfolio · App Store":"Portfolio · App Store", "ওয়েলকাম টু":"Bienvenue sur",
    "আমি অ্যাপ, AI টুল আর ডিজাইন বানাই — পরিষ্কার, দ্রুত আর দেখতে সুন্দর।":"Je crée des applis, des outils IA et du design — propre, rapide et beau.",
    "যোগাযোগ করুন":"Me contacter", "আর্ট ও ডিজাইন":"Art et design", "পাইথন":"Python", "পরিষ্কার UI ও দ্রুত অভিজ্ঞতা":"UI propre, expérience rapide",
    "AI দিয়ে বাস্তব সমাধান":"Solutions concrètes avec l'IA", "রঙিন, চোখে জমে এমন কাজ":"Un travail coloré qui accroche l'œil",
    "প্র্যাকটিক্যাল স্ক্রিপ্ট ও টুল":"Scripts et outils pratiques" , "পরিসংখ্যান ও রিঅ্যাকশন":"Statistiques et réactions", "মোট ডাউনলোড":"Téléchargements au total", "সেভ":"Enregistrements", "রিঅ্যাকশন":"Réactions", "এখনো কোনো রিঅ্যাকশন নেই।":"Aucune réaction pour l'instant.", "আপনিও প্রথম রিঅ্যাকশন দিতে পারেন।":"Soyez la première personne à réagir.", "রিঅ্যাকশন দিতে লগ-ইন করুন।":"Connectez-vous pour réagir.", "ধন্যবাদ, রিঅ্যাকশন যোগ হয়েছে!":"Merci, votre réaction a été ajoutée !", "প্রথম রিঅ্যাকশন দিন":"Ajouter la première réaction", "আপনার রিঅ্যাকশন":"Votre réaction", "প্লে":"Jouer", "নতুন ট্যাবে খুলুন":"Ouvrir dans un nouvel onglet", "লোড হচ্ছে…":"Chargement…", "ফুল স্ক্রিন":"Plein écran", "বন্ধ করুন":"Fermer" },
  pt: {"মেনু":"Menu", "হোম":"Início", "যোগাযোগ":"Contato", "সাইট দেখুন":"Ver o site", "স্টোর দেখুন":"Explorar a loja", "হোমে ফিরুন":"Voltar ao início",
    "← হোমে ফিরুন":"← Voltar ao início", "← স্টোরে ফিরুন":"← Voltar à loja", "সাহায্য":"Ajuda", "সাহায্য ও প্রশ্নোত্তর":"Ajuda e perguntas",
    "প্রশ্ন খুঁজুন…":"Buscar perguntas…", "ভাষা বদলান":"Mudar de idioma", "ভাষা খুঁজুন…":"Buscar idiomas…",
    "কোনো ভাষা মেলেনি":"Nenhum idioma corresponde", "শব্দ চালু":"Som ligado", "শব্দ বন্ধ":"Som desligado",
    "এই সাইট এখন <b>localStorage</b> মোডে চলছে। Firebase কনফিগ বসালেই Firestore/Auth-এ চলে যাবে।":"Este site está no modo <b>localStorage</b>. Adicione a configuração do Firebase e ele passará para Firestore/Auth.",
    "Firebase মোড সক্রিয়। সব ভিজিটর প্রকাশিত কন্টেন্ট দেখবেন।":"Modo Firebase ativo. Todos os visitantes veem o seu conteúdo publicado.",
    "FIREBASE":"FIREBASE", "LOCAL":"LOCAL", "ফিচারড আইটেম":"Itens em destaque", "স্টোরগুলোর বাছাই করা কাজ।":"Uma seleção das lojas.", "স্টোর":"Loja",
    "স্টোর:":"Loja:", "{label} স্টোর":"Loja {label}", "প্রতিটি স্টোরে নিজস্ব ধরনের আইটেম সাজানো থাকে।":"Cada loja guarda itens do seu próprio tipo.",
    "এখনো কোনো স্টোর যোগ করা হয়নি।":"Nenhuma loja foi adicionada ainda.",
    "কন্ট্রোল প্যানেল থেকে আপনার প্রথম স্টোর তৈরি করুন — তারপর ভেতরে আইটেম বসান।":"Crie a sua primeira loja no painel de controle e depois adicione itens dentro dela.",
    "কন্ট্রোল প্যানেল খুলুন":"Abrir painel de controle", "কন্ট্রোল প্যানেল":"Painel de controle",
    "নাম, বিবরণ বা ট্যাগ খুঁজুন…":"Busque nome, descrição ou tag…", "ধরন":"Tipo", "আইটেম":"Item", "টি আইটেম":"itens", "{n}টি আইটেম":"{n} itens",
    "আইটেম · {n}টি":"Itens · {n}", "এই স্টোরে এখনো কিছু যোগ করা হয়নি।":"Nada foi adicionado a esta loja ainda.",
    "কন্ট্রোল প্যানেল থেকে আইটেম যোগ করুন।":"Adicione itens pelo painel de controle.", "কোনো ধরন নেই।":"Nenhum tipo ainda.", "★ ফিচারড":"★ Destaque",
    "খসড়া":"Rascunho", "খুলুন":"Abrir", "সোর্স":"Fonte", "ডাউনলোড":"Baixar", "সোর্স কোড":"Código-fonte", "লিংক ও ডাউনলোড":"Links e download",
    "তথ্য":"Detalhes", "বিবরণ":"Descrição", "ইনস্টল নির্দেশ":"Etapas de instalação", "README":"README", "লিংক":"Link",
    "এই আইটেমের কোনো লিংক যোগ করা হয়নি।":"Nenhum link foi adicionado para este item.",
    "আইটেমটি পাওয়া যায়নি বা প্রকাশিত নয়।":"Este item não foi encontrado ou não está publicado.", "লেখক":"Autor", "বছর":"Ano", "পরিচয়":"Identidade",
    "সংযোগ":"Conectar", "কোনো প্রজেক্ট, সহযোগিতা বা প্রশ্ন থাকলে লিখুন।":"Escreva-me sobre um projeto, uma colaboração ou uma dúvida.", "নাম":"Nome",
    "আপনার নাম":"Seu nome", "ইমেইল":"E-mail", "আপনার ইমেইল":"Seu e-mail", "মেসেজ":"Mensagem", "কী জানাতে চান…":"O que você gostaria de compartilhar…",
    "পাঠান":"Enviar", "সরাসরি লিংক":"Links diretos", "যোগাযোগের লিংক যোগ করা হয়নি।":"Nenhum link de contato foi adicionado ainda.",
    "কন্ট্রোল প্যানেল → সাইট সেটিংস থেকে ইমেইল ও সোশ্যাল লিংক দিন।":"Adicione e-mail e links sociais em Painel → Configurações do site.",
    "এই বিভাগে এখনো লেখা যোগ করা হয়নি।":"Nenhum texto foi adicionado a esta seção ainda.",
    "আপনার নাম সর্বোচ্চ ১০০ অক্ষরের হতে হবে।":"O seu nome deve ter no máximo 100 caracteres.", "ইমেইল দিন।":"Informe o seu e-mail.",
    "ইমেইল সর্বোচ্চ ১০০ অক্ষরের হতে হবে।":"O e-mail deve ter no máximo 100 caracteres.",
    "সঠিক ইমেইল ঠিকানা দিন (@ সহ)।":"Informe um e-mail válido (com @).", "মেসেজ লিখুন।":"Escreva uma mensagem.",
    "মেসেজ সর্বোচ্চ ২০০০ অক্ষরের হতে পারে।":"A mensagem pode ter no máximo 2000 caracteres.",
    "ধন্যবাদ! মেসেজটি পাঠানো হয়েছে।":"Obrigado! A mensagem foi enviada.", "পাঠানো যায়নি: {msg}":"Não foi possível enviar: {msg}",
    "এই ঠিকানায় কিছু নেই।":"Nada existe neste endereço.", "মালিকের জন্য সুরক্ষিত এলাকা":"Área segura para o proprietário",
    "অ্যাডমিন লগইন":"Login do administrador",
    "শুধু মালিক স্টোর, আইটেম ও সেটিংস নিয়ন্ত্রণ করতে পারবেন।":"Somente o proprietário pode gerenciar lojas, itens e configurações.",
    "পাসওয়ার্ড":"Senha", "প্রবেশ করুন":"Entrar", "প্রবেশ":"Entrar", "শুধু মালিকই এখানে ঢুকতে পারবেন।":"Somente o proprietário pode entrar aqui.",
    "পাসকোড":"Código", "নতুন পাসকোড সেট করুন (৪+ অক্ষর)":"Defina um novo código (4+ caracteres)", "আপনি মালিক নন।":"Você não é o proprietário.",
    "লগইন ব্যর্থ।":"Falha no login.", "সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।":"Problema de conexão. Tente novamente.",
    "ইমেইল যাচাই করুন। আপনার ইনবক্সে পাঠানো লিংকে ক্লিক করুন।":"Verifique o e-mail. Clique no link enviado para a sua caixa de entrada.",
    "যাচাই-লিংক আবার পাঠান":"Reenviar o link de verificação", "পাঠানো হচ্ছে…":"Enviando…",
    "যাচাই-লিংক পাঠানো হয়েছে ✅ ইনবক্স (না-থাকলে স্প্যাম) দেখুন, লিংকে ক্লিক করুন, তারপর আবার লগইন করুন।":"Link de verificação enviado ✅ Veja a caixa de entrada (e o spam), clique no link e entre novamente.",
    "ভুল পাসকোড।":"Código incorreto.", "পাসকোড অন্তত ৪ অক্ষরের দিন।":"Informe um código com pelo menos 4 caracteres.",
    "সাইট ব্যবস্থাপনা":"Gestão do site", "লগআউট":"Sair", "সাইট সেটিংস":"Configurações do site", "ডেটা":"Dados", "FAQ":"FAQ", "ক্রম":"Ordem",
    "প্রকাশ":"Publicar", "অ্যাকশন":"Ações", "সম্পাদনা":"Editar", "মুছুন":"Excluir", "সংরক্ষণ":"Salvar", "বাতিল":"Cancelar", "প্রকাশিত":"Publicado",
    "ফিচার":"Destaque", "স্টোর ব্যবস্থাপনা":"Gestão das lojas", "+ নতুন স্টোর":"+ Nova loja",
    "↑ ↓ দিয়ে ক্রম বদলান। “প্রকাশ” বন্ধ থাকলে স্টোরটি সাইটে দেখাবে না। স্টোর মুছলে তার ভেতরের সব আইটেমও মুছে যাবে।":"Use ↑ ↓ para mudar a ordem. Uma loja com “Publicar” desligado fica oculta. Excluir uma loja apaga também todos os itens dela.",
    "এখনো কোনো স্টোর নেই। “+ নতুন স্টোর” চেপে শুরু করুন।":"Nenhuma loja ainda. Toque em “+ Nova loja” para começar.",
    "“{name}” স্টোরটি মুছে ফেলবেন? ভেতরের সব আইটেমও মুছে যাবে।":"Excluir a loja “{name}”? Todos os itens dela também serão excluídos.",
    "স্টোর সম্পাদনা":"Editar loja", "নতুন স্টোর":"Nova loja", "আইকন (একটি ইমোজি/অক্ষর)":"Ícone (um emoji ou letra)", "যেমন 📱":"ex. 📱",
    "এই স্টোরে কী কী থাকে…":"O que esta loja contém…", "যেমন: আমার অ্যাপসমূহ":"ex. Meus apps", "+ নতুন আইটেম":"+ Novo item",
    "প্রথমে একটি স্টোর তৈরি করুন।":"Crie uma loja primeiro.",
    "আইটেম সবসময় কোনো না কোনো স্টোরের ভেতরে থাকে।":"Os itens sempre vivem dentro de uma loja.",
    "“হোমে ফিচার” দিলে আইটেমটি হোমের ফিচারড সেকশনে দেখাবে। বইয়ের কপির জন্য লেখক/বছর, এক্সটেনশনের জন্য ইনস্টল নির্দেশ ফিল্ড ভরে দিন।":"“Destaque na página inicial” mostra o item na seção de destaques. Para cópias de livro preencha autor/ano; para extensões, as etapas de instalação.",
    "এই স্টোরে এখনো আইটেম নেই। “+ নতুন আইটেম” চেপে যোগ করুন।":"Nenhum item nesta loja ainda. Toque em “+ Novo item” para adicionar.",
    "“{name}” আইটেমটি মুছে ফেলবেন?":"Excluir o item “{name}”?", "আইটেম সম্পাদনা":"Editar item", "নতুন আইটেম":"Novo item", "ধরন (type)":"Categoria",
    "কাস্টম টাইপের নাম":"Nome do tipo personalizado", "যেমন: গেম, টেমপ্লেট, UI কিট…":"ex. Jogos, Modelos, Kits de UI…", "যেমন: Wallora":"ex. Wallora",
    "এক লাইনের পরিচয় (tagline)":"Frase de uma linha", "সংক্ষিপ্ত বর্ণনা":"Descrição curta", "বিস্তারিত বিবরণ…":"Descrição detalhada…",
    "ট্যাগ (কমা দিয়ে)":"Tags (separadas por vírgula)", "বইয়ের কপি":"Cópia do livro", "লেখকের নাম":"Nome do autor", "এক্সটেনশন":"Extensão",
    "কীভাবে ইনস্টল করবেন…":"Como instalá-la…", "কভার":"Capa", "কভার রঙ":"Cor da capa", "নিজের রঙ":"Cor personalizada",
    "কভার ছবির লিংক":"Link da imagem da capa", "https://… (ছবির সরাসরি লিংক)":"https://… (link direto da imagem)", "ডাউনলোড ও লিংক":"Download e links",
    "ডাউনলোড লিংক":"Link de download",
    "GitHub Release-এর asset লিংক বা যেকোনো সরাসরি ফাইল লিংক দিন।":"Cole um link de asset do GitHub Release ou qualquer link direto de arquivo.",
    "সোর্স লিংক":"Link do código", "বিস্তারিত পাতায় দেখানোর নোট…":"Nota exibida na página de detalhes…", "হোমে ফিচার":"Destaque na página inicial",
    "প্রশ্নোত্তর (FAQ)":"Perguntas (FAQ)", "+ নতুন প্রশ্ন":"+ Nova pergunta", "প্রশ্ন":"Pergunta",
    "এখনো কোনো প্রশ্ন নেই। “+ নতুন প্রশ্ন” চেপে যোগ করুন।":"Nenhuma pergunta ainda. Toque em “+ Nova pergunta” para adicionar.",
    "প্রশ্নোত্তর":"Perguntas", "নতুন প্রশ্ন":"Nova pergunta", "প্রশ্ন সম্পাদনা":"Editar pergunta", "উত্তর":"Resposta",
    "যেমন: আপনি কী কী নিয়ে কাজ করেন?":"ex. Com que tipo de trabalho você atua?", "এখানে উত্তর লিখুন…":"Escreva a resposta aqui…",
    "প্রশ্নটি মুছে ফেলবেন?":"Excluir esta pergunta?",
    "এই প্রশ্নোত্তরগুলো সাইটের কোণার ভাসমান হেল্পারে দেখাবে। এগুলো আসল AI নয়, আগে থেকে লেখা উত্তর।":"Essas perguntas aparecem no assistente flutuante no canto. São respostas pré-escritas, não IA de verdade.",
    "কোনো প্রশ্ন পাওয়া যায়নি।":"Nenhuma pergunta encontrada.", "অন্য কিছু লিখে দেখুন।":"Tente outras palavras.",
    "মালিক এখনো FAQ যোগ করেননি।":"O proprietário ainda não adicionou FAQ.", "যোগাযোগ মেসেজ":"Mensagens de contato", "রিফ্রেশ":"Atualizar",
    "শুধু আপনি (মালিক) এই মেসেজ পড়তে পারবেন; সাধারণ দর্শক পাঠাতে পারবে কিন্তু কারও মেসেজ দেখতে পাবে না।":"Somente você (o proprietário) pode ler estas mensagens; visitantes podem enviá-las, mas nunca ver as de outra pessoa.",
    "কোনো মেসেজ নেই।":"Nenhuma mensagem.", "যোগাযোগ ফর্ম থেকে আসা মেসেজ এখানে দেখাবে।":"As mensagens do formulário de contato aparecem aqui.",
    "— কোনো স্টোর নেই —":"— sem lojas —", "সাইটের নাম":"Nome do site", "যোগাযোগের ইমেইল":"E-mail de contato",
    "হোমের পরিচয়ের লেখা (এক/দুই লাইন)":"Linha de identidade da página inicial (uma ou duas linhas)",
    "আপনি কে, কী নিয়ে কাজ করেন…":"Quem você é e o que constrói…",
    "খালি রাখলে হোমে এই লাইন দেখাবে না।":"Deixe vazio para ocultar esta linha na página inicial.",
    "About DEEPostrophy বিভাগের লেখা":"Texto da seção About DEEPostrophy", "লক্ষ্য, দক্ষতা ও পথচলা…":"Objetivos, habilidades e a jornada…",
    "লেখা সংরক্ষণ":"Salvar o texto",
    "এই লেখাটি সাইটের About DEEPostrophy বিভাগেই দেখায় — অন্য কোথাও নয়।":"Este texto aparece apenas na seção About DEEPostrophy do site — em nenhum outro lugar.",
    "ভাষা":"Idioma", "ডিফল্ট English; ভিজিটার নিজে বেছে নিলে সেটি মনে থাকে।":"Padrão é inglês; a escolha do visitante é lembrada.",
    "অটো-ভাষা চালু":"Ativar idioma automático",
    "ভিজিটার এখনো ভাষা বেয়ে না রাখলে তাঁর ব্রাউজারের ভাষাটি চুপচাপ প্রয়োগ হবে — কোনো প্রশ্ন বা পপআপ আসবে না।":"Se o visitante ainda não escolheu idioma, o idioma do navegador é aplicado silenciosamente — sem perguntas nem pop-ups.",
    "অনুবাদ (আপনার নিজের হাতে)":"Traduções (feitas por você)",
    "৮টি ভাষা চালু; খালি থাকা ঘরগুলো স্বয়ংক্রিয়ভাবে English দেখায়।":"8 idiomas ativos; campos vazios mostram inglês automaticamente.",
    "ভাষা তালিকা":"Lista de idiomas", "প্রতিটি UI লেখার অনুবাদ":"Tradução de cada texto da interface", "সোশ্যাল লিংক":"Links sociais",
    "+ লিংক যোগ করুন":"+ Adicionar link",
    "শুধু আসল লিংক দিন (https:// বা mailto: দিয়ে শুরু)।":"Use apenas links reais (começando com https:// ou mailto:).",
    "লেবেল (যেমন GitHub)":"Rótulo (ex. GitHub)", "সেটিংস সংরক্ষণ":"Salvar configurações", "সংরক্ষিত হয়েছে ✅":"Salvo ✅",
    "ডেটা রপ্তানি ও আমদানি":"Exportar e importar dados",
    "পুরো সাইটের ডেটা (স্টোর, আইটেম, FAQ, সেটিংস, মেসেজ) এক JSON ফাইলে সংরক্ষণ বা ফিরিয়ে আনুন।":"Salve ou restaure o site inteiro (lojas, itens, FAQ, configurações, mensagens) em um único arquivo JSON.",
    "⬇ JSON রপ্তানি":"⬇ Exportar JSON", "⬆ JSON আমদানি":"⬆ Importar JSON", "আমদানি সফল ✅":"Importação bem-sucedida ✅",
    "ফাইল পড়া যায়নি — সঠিক JSON দিন।":"O arquivo não pôde ser lido — forneça um JSON válido.",
    "লোকাল অ্যাডমিন পাসকোড":"Código local do administrador",
    "Firebase কনফিগ বসানো না থাকলে প্যানেলে ঢুকতে এই লোকাল পাসকোড লাগে (এটি ডিফল্ট নয় — আপনি নিজে সেট করেন)। Firebase চালু হলে এটি প্রযোজ্য থাকবে না।":"Sem configuração do Firebase, este código local abre o painel (não é padrão — você mesmo define). Ele deixa de se aplicar quando o Firebase está ativo.",
    "নতুন পাসকোড":"Novo código", "অন্তত ৪ অক্ষর":"Pelo menos 4 caracteres", "পাসকোড সেট / বদলান":"Definir / alterar código",
    "পাসকোড অন্তত ৪ অক্ষর।":"O código precisa de pelo menos 4 caracteres.", "লোকাল পাসকোড সেট হয়েছে ✅":"Código local definido ✅", "অ্যাপ":"App",
    "AI টুলস":"Ferramentas de IA", "AI টুল":"Ferramenta de IA", "কালারফুল আর্টস":"Artes coloridas", "আর্ট":"Arte", "পাইথন এক্সটেনশন":"Extensão Python",
    "ফাইল সংরক্ষণ":"Armazenamento de arquivos", "ফাইল":"Arquivo", "কাস্টম":"Personalizado", "অন্যান্য":"Outros", "ওয়ালপেপার":"Papel de parede",
    "ছবি":"Imagem", "গান":"Música", "মুভি":"Filme", "Portfolio · App Store":"Portfolio · App Store", "ওয়েলকাম টু":"Bem-vindo a",
    "আমি অ্যাপ, AI টুল আর ডিজাইন বানাই — পরিষ্কার, দ্রুত আর দেখতে সুন্দর।":"Crio apps, ferramentas de IA e design — limpos, rápidos e bonitos.",
    "যোগাযোগ করুন":"Entrar em contato", "আর্ট ও ডিজাইন":"Arte e design", "পাইথন":"Python",
    "পরিষ্কার UI ও দ্রুত অভিজ্ঞতা":"Interface limpa, experiência rápida", "AI দিয়ে বাস্তব সমাধান":"Soluções reais com IA",
    "রঙিন, চোখে জমে এমন কাজ":"Trabalho colorido que prende o olhar", "প্র্যাকটিক্যাল স্ক্রিপ্ট ও টুল":"Scripts e ferramentas práticas" , "পরিসংখ্যান ও রিঅ্যাকশন":"Estatísticas e reações", "মোট ডাউনলোড":"Downloads totais", "সেভ":"Salvamentos", "রিঅ্যাকশন":"Reações", "এখনো কোনো রিঅ্যাকশন নেই।":"Nenhuma reação ainda.", "আপনিও প্রথম রিঅ্যাকশন দিতে পারেন।":"Seja o primeiro a reagir.", "রিঅ্যাকশন দিতে লগ-ইন করুন।":"Entre para reagir.", "ধন্যবাদ, রিঅ্যাকশন যোগ হয়েছে!":"Obrigado, sua reação foi adicionada!", "প্রথম রিঅ্যাকশন দিন":"Adicionar a primeira reação", "আপনার রিঅ্যাকশন":"Sua reação", "প্লে":"Jogar", "নতুন ট্যাবে খুলুন":"Abrir em nova aba", "লোড হচ্ছে…":"Carregando…", "ফুল স্ক্রিন":"Tela cheia", "বন্ধ করুন":"Fechar" },
  hi: {"মেনু":"मेनू", "হোম":"होम", "যোগাযোগ":"संपर्क", "সাইট দেখুন":"साइट देखें", "স্টোর দেখুন":"स्टोर देखें", "হোমে ফিরুন":"होम पर लौटें",
    "← হোমে ফিরুন":"← होम पर लौटें", "← স্টোরে ফিরুন":"← स्टोर पर लौटें", "সাহায্য":"सहायता", "সাহায্য ও প্রশ্নোত্তর":"सहायता और प्रश्नोत्तर",
    "প্রশ্ন খুঁজুন…":"प्रश्न खोजें…", "ভাষা বদলান":"भाषा बदलें", "ভাষা খুঁজুন…":"भाषा खोजें…", "কোনো ভাষা মেলেনি":"कोई भाषा मेल नहीं खाती",
    "শব্দ চালু":"आवाज़ चालू", "শব্দ বন্ধ":"आवाज़ बंद",
    "এই সাইট এখন <b>localStorage</b> মোডে চলছে। Firebase কনফিগ বসালেই Firestore/Auth-এ চলে যাবে।":"यह साइट अभी <b>localStorage</b> मोड में चल रही है. Firebase कॉन्फ़िग जोड़ते ही यह Firestore/Auth पर चली जाएगी.",
    "Firebase মোড সক্রিয়। সব ভিজিটর প্রকাশিত কন্টেন্ট দেখবেন।":"Firebase मोड सक्रिय है. सभी आगंतुक आपका प्रकाशित सामग्री देखेंगे.",
    "FIREBASE":"FIREBASE", "LOCAL":"LOCAL", "ফিচারড আইটেম":"विशेष आइटम", "স্টোরগুলোর বাছাই করা কাজ।":"स्टोर से चुनिंदा काम.", "স্টোর":"स्टोर",
    "স্টোর:":"स्टोर:", "{label} স্টোর":"{label} स्टोर", "প্রতিটি স্টোরে নিজস্ব ধরনের আইটেম সাজানো থাকে।":"हर स्टोर में अपने प्रकार के आइटम होते हैं.",
    "এখনো কোনো স্টোর যোগ করা হয়নি।":"अभी कोई स्टोर नहीं जोड़ा गया है.",
    "কন্ট্রোল প্যানেল থেকে আপনার প্রথম স্টোর তৈরি করুন — তারপর ভেতরে আইটেম বসান।":"कंट्रोल पैनल से अपना पहला स्टोर बनाएँ — फिर उसके अंदर आइटम जोड़ें.",
    "কন্ট্রোল প্যানেল খুলুন":"कंट्रोल पैनल खोलें", "কন্ট্রোল প্যানেল":"कंट्रोल पैनल", "নাম, বিবরণ বা ট্যাগ খুঁজুন…":"नाम, विवरण या टैग खोजें…",
    "ধরন":"प्रकार", "আইটেম":"आइटम", "টি আইটেম":"आइटम", "{n}টি আইটেম":"{n} आइटम", "আইটেম · {n}টি":"आइटम · {n}",
    "এই স্টোরে এখনো কিছু যোগ করা হয়নি।":"इस स्टोर में अभी कुछ नहीं जोड़ा गया है.",
    "কন্ট্রোল প্যানেল থেকে আইটেম যোগ করুন।":"कंट्रोल पैनल से आइटम जोड़ें.", "কোনো ধরন নেই।":"अभी कोई प्रकार नहीं.", "★ ফিচারড":"★ विशेष",
    "খসড়া":"ड्राफ़्ट", "খুলুন":"खोलें", "সোর্স":"स्रोत", "ডাউনলোড":"डाउनलोड", "সোর্স কোড":"स्रोत कोड", "লিংক ও ডাউনলোড":"लिंक और डाउनलोड",
    "তথ্য":"विवरण", "বিবরণ":"विवरण", "ইনস্টল নির্দেশ":"इंस्टॉल निर्देश", "README":"README", "লিংক":"लिंक",
    "এই আইটেমের কোনো লিংক যোগ করা হয়নি।":"इस आइटम के लिए कोई लिंक नहीं जोड़ा गया है.",
    "আইটেমটি পাওয়া যায়নি বা প্রকাশিত নয়।":"यह आइटम नहीं मिला या प्रकाशित नहीं है.", "লেখক":"लेखक", "বছর":"वर्ष", "পরিচয়":"परिचय", "সংযোগ":"जुड़ें",
    "কোনো প্রজেক্ট, সহযোগিতা বা প্রশ্ন থাকলে লিখুন।":"किसी प्रोजेक्ट, सहयोग या सवाल के लिए लिखें.", "নাম":"नाम", "আপনার নাম":"आपका नाम",
    "ইমেইল":"ईमेल", "আপনার ইমেইল":"आपका ईमेल", "মেসেজ":"संदेश", "কী জানাতে চান…":"आप क्या बताना चाहेंगे…", "পাঠান":"भेजें", "সরাসরি লিংক":"सीधे लिंक",
    "যোগাযোগের লিংক যোগ করা হয়নি।":"अभी कोई संपर्क लिंक नहीं जोड़ा गया है.",
    "কন্ট্রোল প্যানেল → সাইট সেটিংস থেকে ইমেইল ও সোশ্যাল লিংক দিন।":"कंट्रोल पैनल → साइट सेटिंग्स में अपना ईमेल और सोशल लिंक डालें.",
    "এই বিভাগে এখনো লেখা যোগ করা হয়নি।":"इस अनुभाग में अभी कोई लेख नहीं जोड़ा गया है.",
    "আপনার নাম সর্বোচ্চ ১০০ অক্ষরের হতে হবে।":"आपका नाम अधिकतम 100 अक्षर का होना चाहिए.", "ইমেইল দিন।":"कृपया ईमेल दर्ज करें.",
    "ইমেইল সর্বোচ্চ ১০০ অক্ষরের হতে হবে।":"ईमेल अधिकतम 100 अक्षर का होना चाहिए.", "সঠিক ইমেইল ঠিকানা দিন (@ সহ)।":"सही ईमेल पता दर्ज करें (@ के साथ).",
    "মেসেজ লিখুন।":"कृपया संदेश लिखें.", "মেসেজ সর্বোচ্চ ২০০০ অক্ষরের হতে পারে।":"संदेश अधिकतम 2000 अक्षर का हो सकता है.",
    "ধন্যবাদ! মেসেজটি পাঠানো হয়েছে।":"धन्यवाद! संदेश भेज दिया गया है.", "পাঠানো যায়নি: {msg}":"भेजा नहीं जा सका: {msg}",
    "এই ঠিকানায় কিছু নেই।":"इस पते पर कुछ नहीं है.", "মালিকের জন্য সুরক্ষিত এলাকা":"मालिक के लिए सुरक्षित क्षेत्र", "অ্যাডমিন লগইন":"एडमिन लॉगिन",
    "শুধু মালিক স্টোর, আইটেম ও সেটিংস নিয়ন্ত্রণ করতে পারবেন।":"केवल मालिक ही स्टोर, आइटम और सेटिंग्स प्रबंधित कर सकता है.", "পাসওয়ার্ড":"पासवर्ड",
    "প্রবেশ করুন":"साइन इन करें", "প্রবেশ":"प्रवेश", "শুধু মালিকই এখানে ঢুকতে পারবেন।":"यहाँ केवल मालिक ही साइन इन कर सकता है.", "পাসকোড":"पासकोड",
    "নতুন পাসকোড সেট করুন (৪+ অক্ষর)":"नया पासकोड सेट करें (4+ अक्षर)", "আপনি মালিক নন।":"आप मालिक नहीं हैं.", "লগইন ব্যর্থ।":"लॉगिन विफल.",
    "সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।":"कनेक्शन में समस्या. फिर से कोशिश करें.",
    "ইমেইল যাচাই করুন। আপনার ইনবক্সে পাঠানো লিংকে ক্লিক করুন।":"अपना ईमेल सत्यापित करें. इनबॉक्स में भेजे गए लिंक पर क्लिक करें.",
    "যাচাই-লিংক আবার পাঠান":"सत्यापन लिंक फिर भेजें", "পাঠানো হচ্ছে…":"भेजा जा रहा है…",
    "যাচাই-লিংক পাঠানো হয়েছে ✅ ইনবক্স (না-থাকলে স্প্যাম) দেখুন, লিংকে ক্লিক করুন, তারপর আবার লগইন করুন।":"सत्यापन लिंक भेज दिया गया ✅ इनबॉक्स (न हो तो स्पैम) देखें, लिंक पर क्लिक करें, फिर दोबारा लॉगिन करें.",
    "ভুল পাসকোড।":"ग़लत पासकोड.", "পাসকোড অন্তত ৪ অক্ষরের দিন।":"कम से कम 4 अक्षर का पासकोड दर्ज करें.", "সাইট ব্যবস্থাপনা":"साइट प्रबंधन",
    "লগআউট":"लॉग आउट", "সাইট সেটিংস":"साइट सेटिंग्स", "ডেটা":"डेटा", "FAQ":"FAQ", "ক্রম":"क्रम", "প্রকাশ":"प्रकाशित", "অ্যাকশন":"क्रियाएँ",
    "সম্পাদনা":"संपादित करें", "মুছুন":"हटाएँ", "সংরক্ষণ":"सहेजें", "বাতিল":"रद्द करें", "প্রকাশিত":"प्रकाशित", "ফিচার":"विशेष",
    "স্টোর ব্যবস্থাপনা":"स्टोर प्रबंधन", "+ নতুন স্টোর":"+ नया स्टोर",
    "↑ ↓ দিয়ে ক্রম বদলান। “প্রকাশ” বন্ধ থাকলে স্টোরটি সাইটে দেখাবে না। স্টোর মুছলে তার ভেতরের সব আইটেমও মুছে যাবে।":"क्रम बदलने के लिए ↑ ↓ उपयोग करें. “प्रकाशित” बंद होने पर स्टोर साइट पर नहीं दिखेगा. स्टोर हटाने पर उसके अंदर के सभी आइटम भी हट जाएँगे.",
    "এখনো কোনো স্টোর নেই। “+ নতুন স্টোর” চেপে শুরু করুন।":"अभी कोई स्टोर नहीं. शुरू करने के लिए “+ नया स्टोर” दबाएँ.",
    "“{name}” স্টোরটি মুছে ফেলবেন? ভেতরের সব আইটেমও মুছে যাবে।":"स्टोर “{name}” हटाएँ? अंदर के सभी आइटम भी हट जाएँगे.",
    "স্টোর সম্পাদনা":"स्टोर संपादित करें", "নতুন স্টোর":"नया स्टोर", "আইকন (একটি ইমোজি/অক্ষর)":"आइकन (एक इमोजी/अक्षर)", "যেমন 📱":"जैसे 📱",
    "এই স্টোরে কী কী থাকে…":"इस स्टोर में क्या है…", "যেমন: আমার অ্যাপসমূহ":"जैसे: मेरे ऐप्स", "+ নতুন আইটেম":"+ नया आइटम",
    "প্রথমে একটি স্টোর তৈরি করুন।":"पहले एक स्टोर बनाएँ.",
    "আইটেম সবসময় কোনো না কোনো স্টোরের ভেতরে থাকে।":"आइटम हमेशा किसी न किसी स्टोर के अंदर रहते हैं.",
    "“হোমে ফিচার” দিলে আইটেমটি হোমের ফিচারড সেকশনে দেখাবে। বইয়ের কপির জন্য লেখক/বছর, এক্সটেনশনের জন্য ইনস্টল নির্দেশ ফিল্ড ভরে দিন।":"“होम पर विशेष” चुनने पर आइटम होम के विशेष अनुभाग में दिखेगा. किताब की कॉपी के लिए लेखक/वर्ष, एक्सटेंशन के लिए इंस्टॉल निर्देश भरें.",
    "এই স্টোরে এখনো আইটেম নেই। “+ নতুন আইটেম” চেপে যোগ করুন।":"इस स्टोर में अभी आइटम नहीं. जोड़ने के लिए “+ नया आइटम” दबाएँ.",
    "“{name}” আইটেমটি মুছে ফেলবেন?":"आइटम “{name}” हटाएँ?", "আইটেম সম্পাদনা":"आइटम संपादित करें", "নতুন আইটেম":"नया आइटम", "ধরন (type)":"श्रेणी",
    "কাস্টম টাইপের নাম":"कस्टम प्रकार का नाम", "যেমন: গেম, টেমপ্লেট, UI কিট…":"जैसे: गेम, टेम्पलेट, UI किट…", "যেমন: Wallora":"जैसे: Wallora",
    "এক লাইনের পরিচয় (tagline)":"एक पंक्ति का परिचय", "সংক্ষিপ্ত বর্ণনা":"संक्षिप्त विवरण", "বিস্তারিত বিবরণ…":"विस्तृत विवरण…",
    "ট্যাগ (কমা দিয়ে)":"टैग (अल्पविराम से) ", "বইয়ের কপি":"किताब की कॉपी", "লেখকের নাম":"लेखक का नाम", "এক্সটেনশন":"एक्सटेंशन",
    "কীভাবে ইনস্টল করবেন…":"कैसे इंस्टॉल करें…", "কভার":"कवर", "কভার রঙ":"कवर का रंग", "নিজের রঙ":"अपना रंग", "কভার ছবির লিংক":"कवर छवि का लिंक",
    "https://… (ছবির সরাসরি লিংক)":"https://… (छवि का सीधा लिंक)", "ডাউনলোড ও লিংক":"डाउनलोड और लिंक", "ডাউনলোড লিংক":"डाउनलोड लिंक",
    "GitHub Release-এর asset লিংক বা যেকোনো সরাসরি ফাইল লিংক দিন।":"GitHub Release की asset लिंक या कोई भी सीधी फ़ाइल लिंक डालें.",
    "সোর্স লিংক":"स्रोत लिंक", "বিস্তারিত পাতায় দেখানোর নোট…":"विवरण पृष्ठ पर दिखने वाला नोट…", "হোমে ফিচার":"होम पर विशेष",
    "প্রশ্নোত্তর (FAQ)":"प्रश्नोत्तर (FAQ)", "+ নতুন প্রশ্ন":"+ नया प्रश्न", "প্রশ্ন":"प्रश्न",
    "এখনো কোনো প্রশ্ন নেই। “+ নতুন প্রশ্ন” চেপে যোগ করুন।":"अभी कोई प्रश्न नहीं. जोड़ने के लिए “+ नया प्रश्न” दबाएँ.", "প্রশ্নোত্তর":"प्रश्नोत्तर",
    "নতুন প্রশ্ন":"नया प्रश्न", "প্রশ্ন সম্পাদনা":"प्रश्न संपादित करें", "উত্তর":"उत्तर",
    "যেমন: আপনি কী কী নিয়ে কাজ করেন?":"जैसे: आप किन चीज़ों पर काम करते हैं?", "এখানে উত্তর লিখুন…":"यहाँ उत्तर लिखें…",
    "প্রশ্নটি মুছে ফেলবেন?":"यह प्रश्न हटाएँ?",
    "এই প্রশ্নোত্তরগুলো সাইটের কোণার ভাসমান হেল্পারে দেখাবে। এগুলো আসল AI নয়, আগে থেকে লেখা উত্তর।":"ये प्रश्न साइट के कोने वाले फ़्लोटिंग हेल्पर में दिखेंगे. ये असली AI नहीं, पहले से लिखे उत्तर हैं.",
    "কোনো প্রশ্ন পাওয়া যায়নি।":"कोई प्रश्न नहीं मिला.", "অন্য কিছু লিখে দেখুন।":"दूसरे शब्द आज़माएँ.",
    "মালিক এখনো FAQ যোগ করেননি।":"मालिक ने अभी FAQ नहीं जोड़े हैं.", "যোগাযোগ মেসেজ":"संपर्क संदेश", "রিফ্রেশ":"रिफ़्रेश",
    "শুধু আপনি (মালিক) এই মেসেজ পড়তে পারবেন; সাধারণ দর্শক পাঠাতে পারবে কিন্তু কারও মেসেজ দেখতে পাবে না।":"केवल आप (मालिक) ये संदेश पढ़ सकते हैं; आगंतुक भेज सकते हैं पर किसी का संदेश नहीं देख सकते.",
    "কোনো মেসেজ নেই।":"कोई संदेश नहीं.", "যোগাযোগ ফর্ম থেকে আসা মেসেজ এখানে দেখাবে।":"संपर्क फ़ॉर्म के संदेश यहाँ दिखेंगे.",
    "— কোনো স্টোর নেই —":"— कोई स्टोर नहीं —", "সাইটের নাম":"साइट का नाम", "যোগাযোগের ইমেইল":"संपर्क ईमेल",
    "হোমের পরিচয়ের লেখা (এক/দুই লাইন)":"होम का परिचय लेख (एक/दो पंक्तियाँ)", "আপনি কে, কী নিয়ে কাজ করেন…":"आप कौन हैं, क्या बनाते हैं…",
    "খালি রাখলে হোমে এই লাইন দেখাবে না।":"खाली छोड़ने पर होम पर यह पंक्ति नहीं दिखेगी.",
    "About DEEPostrophy বিভাগের লেখা":"About DEEPostrophy अनुभाग का लेख", "লক্ষ্য, দক্ষতা ও পথচলা…":"लक्ष्य, कौशल और यात्रा…",
    "লেখা সংরক্ষণ":"लेख सहेजें",
    "এই লেখাটি সাইটের About DEEPostrophy বিভাগেই দেখায় — অন্য কোথাও নয়।":"यह लेख केवल साइट के About DEEPostrophy अनुभाग में दिखता है — कहीं और नहीं.",
    "ভাষা":"भाषा", "ডিফল্ট English; ভিজিটার নিজে বেছে নিলে সেটি মনে থাকে।":"डिफ़ॉल्ट अंग्रेज़ी; आगंतुक की चुनि याद रखी जाती है.",
    "অটো-ভাষা চালু":"ऑटो-भाषा चालू",
    "ভিজিটার এখনো ভাষা বেয়ে না রাখলে তাঁর ব্রাউজারের ভাষাটি চুপচাপ প্রয়োগ হবে — কোনো প্রশ্ন বা পপআপ আসবে না।":"जिसने अभी भाषा नहीं चुनी, उसके ब्राउज़र की भाषा चुपचाप लागू हो जाएगी — कोई सवाल या पॉपअप नहीं.",
    "অনুবাদ (আপনার নিজের হাতে)":"अनुवाद (आपके हाथ से)",
    "৮টি ভাষা চালু; খালি থাকা ঘরগুলো স্বয়ংক্রিয়ভাবে English দেখায়।":"8 भाषाएँ सक्रिय; खाली खाने अपने आप अंग्रेज़ी दिखाते हैं.",
    "ভাষা তালিকা":"भाषा सूची", "প্রতিটি UI লেখার অনুবাদ":"हर UI लेख का अनुवाद", "সোশ্যাল লিংক":"सोशल लिंक", "+ লিংক যোগ করুন":"+ लिंक जोड़ें",
    "শুধু আসল লিংক দিন (https:// বা mailto: দিয়ে শুরু)।":"केवल असली लिंक डालें (https:// या mailto: से शुरू).",
    "লেবেল (যেমন GitHub)":"लेबल (जैसे GitHub)", "সেটিংস সংরক্ষণ":"सेटिंग्स सहेजें", "সংরক্ষিত হয়েছে ✅":"सहेजा गया ✅",
    "ডেটা রপ্তানি ও আমদানি":"डेटा निर्यात और आयात",
    "পুরো সাইটের ডেটা (স্টোর, আইটেম, FAQ, সেটিংস, মেসেজ) এক JSON ফাইলে সংরক্ষণ বা ফিরিয়ে আনুন।":"पूरी साइट का डेटा (स्टोर, आइटम, FAQ, सेटिंग्स, संदेश) एक JSON फ़ाइल में सहेजें या बहाल करें.",
    "⬇ JSON রপ্তানি":"⬇ JSON निर्यात", "⬆ JSON আমদানি":"⬆ JSON आयात", "আমদানি সফল ✅":"आयात सफल ✅",
    "ফাইল পড়া যায়নি — সঠিক JSON দিন।":"फ़ाइल पढ़ी नहीं जा सकी — सही JSON दें.", "লোকাল অ্যাডমিন পাসকোড":"लोकल एडमिन पासकोड",
    "Firebase কনফিগ বসানো না থাকলে প্যানেলে ঢুকতে এই লোকাল পাসকোড লাগে (এটি ডিফল্ট নয় — আপনি নিজে সেট করেন)। Firebase চালু হলে এটি প্রযোজ্য থাকবে না।":"Firebase कॉन्फ़िग न होने पर पैनल खुलने के लिए यह लोकल पासकोड चाहिए (यह डिफ़ॉल्ट नहीं — आप स्वयं सेट करते हैं). Firebase चालू होने पर यह लागू नहीं रहेगा.",
    "নতুন পাসকোড":"नया पासकोड", "অন্তত ৪ অক্ষর":"कम से कम 4 अक्षर", "পাসকোড সেট / বদলান":"पासकोड सेट / बदलें",
    "পাসকোড অন্তত ৪ অক্ষর।":"पासकोड कम से कम 4 अक्षर का हो.", "লোকাল পাসকোড সেট হয়েছে ✅":"लोकल पासकोड सेट हुआ ✅", "অ্যাপ":"ऐप", "AI টুলস":"AI टूल्स",
    "AI টুল":"AI टूल", "কালারফুল আর্টস":"रंगीन कलाकृतियाँ", "আর্ট":"कला", "পাইথন এক্সটেনশন":"पायथन एक्सटेंशन", "ফাইল সংরক্ষণ":"फ़ाइल स्टोरेज",
    "ফাইল":"फ़ाइल", "কাস্টম":"कस्टम", "অন্যান্য":"अन्य", "ওয়ালপেপার":"वॉलपेपर", "ছবি":"छवि", "গান":"गाना", "মুভি":"फ़िल्म",
    "Portfolio · App Store":"Portfolio · App Store", "ওয়েলকাম টু":"में आपका स्वागत है",
    "আমি অ্যাপ, AI টুল আর ডিজাইন বানাই — পরিষ্কার, দ্রুত আর দেখতে সুন্দর।":"मैं ऐप, AI टूल और डिज़ाइन बनाता हूँ — साफ़, तेज़ और सुंदर.",
    "যোগাযোগ করুন":"संपर्क करें", "আর্ট ও ডিজাইন":"कला और डिज़ाइन", "পাইথন":"Python", "পরিষ্কার UI ও দ্রুত অভিজ্ঞতা":"साफ़ UI और तेज़ अनुभव",
    "AI দিয়ে বাস্তব সমাধান":"AI से ठोस समाधान", "রঙিন, চোখে জমে এমন কাজ":"रंगीन, नज़र खींचने वाला काम",
    "প্র্যাকটিক্যাল স্ক্রিপ্ট ও টুল":"व्यावहारिक स्क्रिप्ट और टूल" , "পরিসংখ্যান ও রিঅ্যাকশন":"आँकड़े और प्रतिक्रियाएँ", "মোট ডাউনলোড":"कुल डाउनलोड", "সেভ":"सहेजे गए", "রিঅ্যাকশন":"प्रतिक्रियाएँ", "এখনো কোনো রিঅ্যাকশন নেই।":"अभी कोई प्रतिक्रिया नहीं।", "আপনিও প্রথম রিঅ্যাকশন দিতে পারেন।":"पहली प्रतिक्रिया आप दें।", "রিঅ্যাকশন দিতে লগ-ইন করুন।":"प्रतिक्रिया देने के लिए लॉगिन करें।", "ধন্যবাদ, রিঅ্যাকশন যোগ হয়েছে!":"धन्यवाद, आपकी प्रतिक्रिया जुड़ गई!", "প্রথম রিঅ্যাকশন দিন":"पहली प्रतिक्रिया दें", "আপনার রিঅ্যাকশন":"आपकी प्रतिक्रिया", "প্লে":"खेलें", "নতুন ট্যাবে খুলুন":"नए टैब में खोलें", "লোড হচ্ছে…":"लोड हो रहा है…", "ফুল স্ক্রিন":"पूरा स्क्रीन", "বন্ধ করুন":"बंद करें" },
  /* --- English (ডিফল্ট) — এখানেই সব UI লেখার মূল অনুবাদ, বাকি ভাষা এখান থেকেই fallback পায় --- */
  en: {
    /* --- নেভিগেশন / চোম্ব --- */
    "মেনু":"Menu", "হোম":"Home", "যোগাযোগ":"Contact", "সাইট দেখুন":"View the site",
    "স্টোর দেখুন":"Browse the store", "হোমে ফিরুন":"Back to home",
    "← হোমে ফিরুন":"← Back to home", "← স্টোরে ফিরুন":"← Back to store",
    "সাহায্য":"Help", "সাহায্য ও প্রশ্নোত্তর":"Help & FAQ", "প্রশ্ন খুঁজুন…":"Search questions…",
    "ভাষা বদলান":"Change language", "ভাষা খুঁজুন…":"Search languages…", "কোনো ভাষা মেলেনি":"No language matches", "শব্দ চালু":"Sound on", "শব্দ বন্ধ":"Sound off",
    /* --- মোড বার --- */
    "এই সাইট এখন <b>localStorage</b> মোডে চলছে। Firebase কনফিগ বসালেই Firestore/Auth-এ চলে যাবে।":"This site is running in <b>localStorage</b> mode. Add the Firebase config and it switches to Firestore/Auth.",
    "Firebase মোড সক্রিয়। সব ভিজিটর প্রকাশিত কন্টেন্ট দেখবেন।":"Firebase mode active. Every visitor sees your published content.",
    "FIREBASE":"FIREBASE", "LOCAL":"LOCAL",
    /* --- হোম --- */
    "ফিচারড আইটেম":"Featured items", "স্টোরগুলোর বাছাই করা কাজ।":"A curated selection from the stores.",
    "স্টোর":"Store", "স্টোর:":"Store:", "{label} স্টোর":"{label} Store", "প্রতিটি স্টোরে নিজস্ব ধরনের আইটেম সাজানো থাকে।":"Each store keeps items of its own kind.",
    "এখনো কোনো স্টোর যোগ করা হয়নি।":"No stores have been added yet.",
    "কন্ট্রোল প্যানেল থেকে আপনার প্রথম স্টোর তৈরি করুন — তারপর ভেতরে আইটেম বসান।":"Create your first store in the control panel, then add items inside it.",
    "কন্ট্রোল প্যানেল খুলুন":"Open control panel", "কন্ট্রোল প্যানেল":"Control panel",
    /* --- স্টোর / আইটেম --- */
    "নাম, বিবরণ বা ট্যাগ খুঁজুন…":"Search name, description or tag…",
    "ধরন":"Type", "আইটেম":"Item", "টি আইটেম":"items", "{n}টি আইটেম":"{n} items", "আইটেম · {n}টি":"Items · {n}",
    "এই স্টোরে এখনো কিছু যোগ করা হয়নি।":"Nothing has been added to this store yet.",
    "কন্ট্রোল প্যানেল থেকে আইটেম যোগ করুন।":"Add items from the control panel.",
    "কোনো ধরন নেই।":"No types yet.",
    "★ ফিচারড":"★ Featured", "খসড়া":"Draft", "খুলুন":"Open", "সোর্স":"Source", "ডাউনলোড":"Download",
    "সোর্স কোড":"Source code", "লিংক ও ডাউনলোড":"Links & download", "তথ্য":"Details", "বিবরণ":"Description",
    "ইনস্টল নির্দেশ":"Install steps", "README":"README", "লিংক":"Link",
    "এই আইটেমের কোনো লিংক যোগ করা হয়নি।":"No links have been added for this item.",
    "আইটেমটি পাওয়া যায়নি বা প্রকাশিত নয়।":"This item was not found or is not published.",
    "লেখক":"Author", "বছর":"Year",
    /* --- about / contact --- */
    "পরিচয়":"Identity", "সংযোগ":"Connect",
    "কোনো প্রজেক্ট, সহযোগিতা বা প্রশ্ন থাকলে লিখুন।":"Write to me about a project, a collaboration or a question.",
    "নাম":"Name", "আপনার নাম":"Your name", "ইমেইল":"Email", "আপনার ইমেইল":"Your email",
    "মেসেজ":"Message", "কী জানাতে চান…":"What would you like to share…", "পাঠান":"Send",
    "সরাসরি লিংক":"Direct links", "যোগাযোগের লিংক যোগ করা হয়নি।":"No contact links have been added yet.",
    "কন্ট্রোল প্যানেল → সাইট সেটিংস থেকে ইমেইল ও সোশ্যাল লিংক দিন।":"Add your email and social links in Control panel → Site settings.",
    "এই বিভাগে এখনো লেখা যোগ করা হয়নি।":"Nothing has been written for this section yet.",
    "আপনার নাম সর্বোচ্চ ১০০ অক্ষরের হতে হবে।":"Your name must be at most 100 characters.",
    "ইমেইল দিন।":"Please enter your email.",
    "ইমেইল সর্বোচ্চ ১০০ অক্ষরের হতে হবে।":"Email must be at most 100 characters.",
    "সঠিক ইমেইল ঠিকানা দিন (@ সহ)।":"Enter a valid email address (with @).",
    "মেসেজ লিখুন।":"Please write a message.",
    "মেসেজ সর্বোচ্চ ২০০০ অক্ষরের হতে পারে।":"Message can be at most 2000 characters.",
    "ধন্যবাদ! মেসেজটি পাঠানো হয়েছে।":"Thank you! Your message has been sent.",
    "পাঠানো যায়নি: {msg}":"Could not send: {msg}",
    /* --- ৪০৪ --- */
    "এই ঠিকানায় কিছু নেই।":"Nothing lives at this address.",
    /* --- অ্যাডমিন লগইন --- */
    "মালিকের জন্য সুরক্ষিত এলাকা":"Secure area for the owner", "অ্যাডমিন লগইন":"Admin login",
    "শুধু মালিক স্টোর, আইটেম ও সেটিংস নিয়ন্ত্রণ করতে পারবেন।":"Only the owner can manage stores, items and settings.",
    "পাসওয়ার্ড":"Password", "প্রবেশ করুন":"Sign in", "প্রবেশ":"Enter",
    "শুধু মালিকই এখানে ঢুকতে পারবেন।":"Only the owner can sign in here.",
    "পাসকোড":"Passcode", "নতুন পাসকোড সেট করুন (৪+ অক্ষর)":"Set a new passcode (4+ characters)",
    "আপনি মালিক নন।":"You are not the owner.", "লগইন ব্যর্থ।":"Login failed.",
    "সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।":"Connection problem. Please try again.",
    "ইমেইল যাচাই করুন। আপনার ইনবক্সে পাঠানো লিংকে ক্লিক করুন।":"Verify your email. Click the link sent to your inbox.",
    "যাচাই-লিংক আবার পাঠান":"Send the verification link again", "পাঠানো হচ্ছে…":"Sending…",
    "যাচাই-লিংক পাঠানো হয়েছে ✅ ইনবক্স (না-থাকলে স্প্যাম) দেখুন, লিংকে ক্লিক করুন, তারপর আবার লগইন করুন।":"Verification link sent ✅ Check your inbox (and spam), click the link, then sign in again.",
    "পাঠানো যায়নি: {msg}":"Could not send: {msg}",
    "ভুল পাসকোড।":"Wrong passcode.", "পাসকোড অন্তত ৪ অক্ষরের দিন।":"Enter a passcode of at least 4 characters.",
    /* --- অ্যাডমিন প্যানেল --- */
    "সাইট ব্যবস্থাপনা":"Site management", "লগআউট":"Log out",
    "সাইট সেটিংস":"Site settings", "ডেটা":"Data", "FAQ":"FAQ", "ক্রম":"Order", "প্রকাশ":"Publish", "অ্যাকশন":"Actions",
    "সম্পাদনা":"Edit", "মুছুন":"Delete", "সংরক্ষণ":"Save", "বাতিল":"Cancel", "প্রকাশিত":"Published", "ফিচার":"Featured",
    "স্টোর ব্যবস্থাপনা":"Store management", "+ নতুন স্টোর":"+ New store",
    "↑ ↓ দিয়ে ক্রম বদলান। “প্রকাশ” বন্ধ থাকলে স্টোরটি সাইটে দেখাবে না। স্টোর মুছলে তার ভেতরের সব আইটেমও মুছে যাবে।":"Use ↑ ↓ to change the order. A store with “Publish” off stays hidden. Deleting a store also deletes every item inside it.",
    "এখনো কোনো স্টোর নেই। “+ নতুন স্টোর” চেপে শুরু করুন।":"No stores yet. Press “+ New store” to start.",
    "“{name}” স্টোরটি মুছে ফেলবেন? ভেতরের সব আইটেমও মুছে যাবে।":"Delete the store “{name}”? All items inside it will be deleted too.",
    "স্টোর সম্পাদনা":"Edit store", "নতুন স্টোর":"New store",
    "আইকন (একটি ইমোজি/অক্ষর)":"Icon (one emoji or letter)", "যেমন 📱":"e.g. 📱",
    "এই স্টোরে কী কী থাকে…":"What this store contains…", "যেমন: আমার অ্যাপসমূহ":"e.g. My apps",
    "+ নতুন আইটেম":"+ New item", "প্রথমে একটি স্টোর তৈরি করুন।":"Create a store first.",
    "আইটেম সবসময় কোনো না কোনো স্টোরের ভেতরে থাকে।":"Items always live inside a store.",
    "“হোমে ফিচার” দিলে আইটেমটি হোমের ফিচারড সেকশনে দেখাবে। বইয়ের কপির জন্য লেখক/বছর, এক্সটেনশনের জন্য ইনস্টল নির্দেশ ফিল্ড ভরে দিন।":"“Feature on home” shows the item in the featured section. For book copies fill author/year, for extensions fill the install steps.",
    "এই স্টোরে এখনো আইটেম নেই। “+ নতুন আইটেম” চেপে যোগ করুন।":"No items in this store yet. Press “+ New item” to add one.",
    "“{name}” আইটেমটি মুছে ফেলবেন?":"Delete the item “{name}”?",
    "আইটেম সম্পাদনা":"Edit item", "নতুন আইটেম":"New item", "ধরন (type)":"Category",
    "কাস্টম টাইপের নাম":"Custom type name", "যেমন: গেম, টেমপ্লেট, UI কিট…":"e.g. Games, Templates, UI kits…",
    "যেমন: Wallora":"e.g. Wallora", "এক লাইনের পরিচয় (tagline)":"One-line tagline", "সংক্ষিপ্ত বর্ণনা":"Short description",
    "বিস্তারিত বিবরণ…":"Detailed description…", "ট্যাগ (কমা দিয়ে)":"Tags (comma separated)",
    "বইয়ের কপি":"Book copy", "লেখকের নাম":"Author name", "এক্সটেনশন":"Extension", "কীভাবে ইনস্টল করবেন…":"How to install it…",
    "কভার":"Cover", "কভার রঙ":"Cover color", "নিজের রঙ":"Custom color",
    "কভার ছবির লিংক":"Cover image link", "https://… (ছবির সরাসরি লিংক)":"https://… (direct image link)",
    "ডাউনলোড ও লিংক":"Download & links", "ডাউনলোড লিংক":"Download link",
    "GitHub Release-এর asset লিংক বা যেকোনো সরাসরি ফাইল লিংক দিন।":"Paste a GitHub Release asset link or any direct file link.",
    "সোর্স লিংক":"Source link", "বিস্তারিত পাতায় দেখানোর নোট…":"Note shown on the detail page…", "হোমে ফিচার":"Feature on home",
    /* --- FAQ প্যানে / হেল্পার --- */
    "প্রশ্নোত্তর (FAQ)":"Questions (FAQ)", "+ নতুন প্রশ্ন":"+ New question", "প্রশ্ন":"Question",
    "এখনো কোনো প্রশ্ন নেই। “+ নতুন প্রশ্ন” চেপে যোগ করুন।":"No questions yet. Press “+ New question” to add one.",
    "প্রশ্নোত্তর":"Questions", "নতুন প্রশ্ন":"New question", "প্রশ্ন সম্পাদনা":"Edit question",
    "উত্তর":"Answer", "যেমন: আপনি কী কী নিয়ে কাজ করেন?":"e.g. What kind of work do you do?",
    "এখানে উত্তর লিখুন…":"Write the answer here…", "প্রশ্নটি মুছে ফেলবেন?":"Delete this question?",
    "এই প্রশ্নোত্তরগুলো সাইটের কোণার ভাসমান হেল্পারে দেখাবে। এগুলো আসল AI নয়, আগে থেকে লেখা উত্তর।":"These questions appear in the floating helper at the corner. They are pre-written answers, not real AI.",
    "কোনো প্রশ্ন পাওয়া যায়নি।":"No questions found.", "অন্য কিছু লিখে দেখুন।":"Try a different wording.", "মালিক এখনো FAQ যোগ করেননি।":"The owner has not added any FAQ yet.",
    /* --- মেসেজ --- */
    "যোগাযোগ মেসেজ":"Contact messages", "রিফ্রেশ":"Refresh",
    "শুধু আপনি (মালিক) এই মেসেজ পড়তে পারবেন; সাধারণ দর্শক পাঠাতে পারবে কিন্তু কারও মেসেজ দেখতে পাবে না।":"Only you (the owner) can read these messages; visitors can send them but never see anyone's message.",
    "কোনো মেসেজ নেই।":"No messages.", "যোগাযোগ ফর্ম থেকে আসা মেসেজ এখানে দেখাবে।":"Messages from the contact form appear here.",
    "— কোনো স্টোর নেই —":"— no stores —",
    /* --- সেটিংস --- */
    "সাইটের নাম":"Site name", "যোগাযোগের ইমেইল":"Contact email",
    "হোমের পরিচয়ের লেখা (এক/দুই লাইন)":"Home identity line (one or two lines)", "আপনি কে, কী নিয়ে কাজ করেন…":"Who you are and what you build…",
    "খালি রাখলে হোমে এই লাইন দেখাবে না।":"Leave it empty to hide this line on the home page.",
    "About DEEPostrophy বিভাগের লেখা":"Text for the About DEEPostrophy section", "লক্ষ্য, দক্ষতা ও পথচলা…":"Goals, skills and the journey…",
    "লেখা সংরক্ষণ":"Save the text", "এই লেখাটি সাইটের About DEEPostrophy বিভাগেই দেখায় — অন্য কোথাও নয়।":"This text appears only in the About DEEPostrophy section of the site — nowhere else.",
    "About DEEPostrophy বিভাগের লেখা":"About DEEPostrophy text", "লক্ষ্য, দক্ষতা ও পথচলা…":"Goals, skills and journey…",
    "ভাষা":"Language", "ডিফল্ট English; ভিজিটার নিজে বেছে নিলে সেটি মনে থাকে।":"Default is English; a visitor's own choice is remembered.",
    "অটো-ভাষা চালু":"Enable auto language", "ভিজিটার এখনো ভাষা বেয়ে না রাখলে তাঁর ব্রাউজারের ভাষাটি চুপচাপ প্রয়োগ হবে — কোনো প্রশ্ন বা পপআপ আসবে না।":"If a visitor has not chosen a language yet, their browser language is applied silently — no prompt or popup.",
    "অনুবাদ (আপনার নিজের হাতে)":"Translations (your own hand)", "৮টি ভাষা চালু; খালি থাকা ঘরগুলো স্বয়ংক্রিয়ভাবে English দেখায়।":"8 languages are active; empty fields automatically show English.",
    "ভাষা তালিকা":"Language list", "প্রতিটি UI লেখার অনুবাদ":"Translation of each UI string",
    "সোশ্যাল লিংক":"Social links", "+ লিংক যোগ করুন":"+ Add link",
    "শুধু আসল লিংক দিন (https:// বা mailto: দিয়ে শুরু)।":"Use real links only (starting with https:// or mailto:).",
    "লেবেল (যেমন GitHub)":"Label (e.g. GitHub)", "সেটিংস সংরক্ষণ":"Save settings", "সংরক্ষিত হয়েছে ✅":"Saved ✅",
    /* --- ডেটা --- */
    "ডেটা রপ্তানি ও আমদানি":"Data export & import",
    "পুরো সাইটের ডেটা (স্টোর, আইটেম, FAQ, সেটিংস, মেসেজ) এক JSON ফাইলে সংরক্ষণ বা ফিরিয়ে আনুন।":"Save or restore the whole site (stores, items, FAQ, settings, messages) as one JSON file.",
    "⬇ JSON রপ্তানি":"⬇ Export JSON", "⬆ JSON আমদানি":"⬆ Import JSON",
    "আমদানি সফল ✅":"Import successful ✅", "ফাইল পড়া যায়নি — সঠিক JSON দিন।":"The file could not be read — provide valid JSON.",
    "লোকাল অ্যাডমিন পাসকোড":"Local admin passcode",
    "Firebase কনফিগ বসানো না থাকলে প্যানেলে ঢুকতে এই লোকাল পাসকোড লাগে (এটি ডিফল্ট নয় — আপনি নিজে সেট করেন)। Firebase চালু হলে এটি প্রযোজ্য থাকবে না।":"Without a Firebase config this local passcode opens the panel (it is not a default — you set it yourself). It no longer applies once Firebase is enabled.",
    "নতুন পাসকোড":"New passcode", "অন্তত ৪ অক্ষর":"At least 4 characters", "পাসকোড সেট / বদলান":"Set / change passcode",
    "পাসকোড অন্তত ৪ অক্ষর।":"The passcode needs at least 4 characters.", "লোকাল পাসকোড সেট হয়েছে ✅":"Local passcode set ✅",
    /* --- kind / type লেবেল --- */
    "অ্যাপ":"App", "AI টুলস":"AI tools", "AI টুল":"AI tool", "কালারফুল আর্টস":"Colorful arts", "আর্ট":"Art",
    "পাইথন এক্সটেনশন":"Python extension", "ফাইল সংরক্ষণ":"File storage", "ফাইল":"File", "কাস্টম":"Custom", "অন্যান্য":"Other",
    "ওয়ালপেপার":"Wallpaper", "ছবি":"Image", "গান":"Song", "মুভি":"Movie",
    /* --- হিরো / ওয়েলকাম --- */
    "Portfolio · App Store":"Portfolio · App Store",
    "ওয়েলকাম টু":"Welcome to",
    "আমি অ্যাপ, AI টুল আর ডিজাইন বানাই — পরিষ্কার, দ্রুত আর দেখতে সুন্দর।":"Build apps, AI tools and design — clean, fast and easy on the eyes.",
    "যোগাযোগ করুন":"Get in touch",
    "আর্ট ও ডিজাইন":"Art & design", "পাইথন":"Python",
    "পরিষ্কার UI ও দ্রুত অভিজ্ঞতা":"Clean UI, fast experience", "AI দিয়ে বাস্তব সমাধান":"Real solutions with AI",
    "রঙিন, চোখে জমে এমন কাজ":"Colorful work that catches the eye", "প্র্যাকটিক্যাল স্ক্রিপ্ট ও টুল":"Practical scripts & tools",
    /* --- v6.9.8: পরিসংখ্যান + রিঅ্যাকশন --- */
    "পরিসংখ্যান ও রিঅ্যাকশন":"Stats & reactions", "মোট ডাউনলোড":"Total downloads", "সেভ":"Saves", "রিঅ্যাকশন":"Reactions",
    "এখনো কোনো রিঅ্যাকশন নেই।":"No reactions yet.", "আপনিও প্রথম রিঅ্যাকশন দিতে পারেন।":"Be the first to react.",
    "রিঅ্যাকশন দিতে লগ-ইন করুন।":"Sign in to react.", "ধন্যবাদ, রিঅ্যাকশন যোগ হয়েছে!":"Thanks, your reaction was added!",
    "প্রথম রিঅ্যাকশন দিন":"Add the first reaction", "আপনার রিঅ্যাকশন":"Your reaction", "প্লে":"Play", "নতুন ট্যাবে খুলুন":"Open in new tab", "লোড হচ্ছে…":"Loading…", "ফুল স্ক্রিন":"Full screen", "বন্ধ করুন":"Close"
  }
};

/* শুধু তালিকাভুক্ত ৮টি কোডই গ্রাহ্য; আগে বেছে রাখা (deeo.lang) ভাষাই চলবে, না থাকলে ডিফল্ট English */
const LANG_CODES = {};
I18N.list.forEach(l => { LANG_CODES[l.code] = true; });
let LANG = I18N.default;
try { const saved = localStorage.getItem(LANG_KEY); if (LANG_CODES[saved]) LANG = saved; } catch (e) {}

/* উৎস-লেখা (বাংলা key) -> নির্বাচিত ভাষার মান; খালি/না-থাকলে চুপচাপ ইংরেজি, তাও না থাকলে উৎস */
function valueFor(code, key){
  if (code === "bn") return key;
  const tab = I18N[code];
  const v = tab && tab[key];
  if (v !== undefined && v !== "") return v;
  return I18N.en[key] !== undefined ? I18N.en[key] : key;
}
/* যেকোনো ভাষার প্রদর্শিত লেখা -> উৎস বাংলা key (ভাষা A থেকে B-তে সরাসরি পাল্টানোর জন্য) */
const KEY_OF = {};
(function buildKeyIndex(){
  const put = (val, key) => { if (val !== undefined && val !== "" && KEY_OF[val] === undefined) KEY_OF[val] = key; };
  for (const k in I18N.en) { put(k, k); put(I18N.en[k], k); }          // উৎস + ইংরেজি
  for (const l of I18N.list) { const tab = I18N[l.code]; if (!tab || l.code === "en") continue;
    for (const k in tab) put(tab[k], k); }                              // মালিক-পূরণ করা বাকি ভাষা
})();
const t  = s => valueFor(LANG, s);
const tr = (s, vars) => { let o = valueFor(LANG, s);
  if (vars) for (const k in vars) o = o.split("{" + k + "}").join(String(vars[k])); return o; };
const I18N_ATTRS = ["placeholder", "title", "aria-label", "alt"];
/* DOM-এর লেখা (যেকোনো ভাষায়) উৎসে ফিরিয়ে আবার নির্বাচিত ভাষায় অনুবাদ; অজানা লেখা = undefined (মালিকের কনটেন্ট অক্ষুণ্ণ) */
function i18nLookup(text){ const k = KEY_OF[text]; return k === undefined ? undefined : valueFor(LANG, k); }
function applyI18n(root){
  if (!root || !root.closest) return;
  if (root.closest("[data-i18n-keep]")) return;
  const hits = [];
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode(n){
      if (n.nodeType === 3) {
        const p = n.parentElement;
        if (!p || p.nodeName === "SCRIPT" || p.nodeName === "STYLE" || p.closest("[data-i18n-keep]")) return NodeFilter.FILTER_REJECT;
        return i18nLookup(n.textContent.trim()) !== undefined ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
      if (n.closest("[data-i18n-keep]")) return NodeFilter.FILTER_SUBTREES;
      for (const a of I18N_ATTRS) { const v = n.getAttribute(a); if (v !== null && i18nLookup(v.trim()) !== undefined) return NodeFilter.FILTER_ACCEPT; }
      return NodeFilter.FILTER_SKIP;
    }
  });
  let n; while ((n = w.nextNode())) hits.push(n);
  for (const node of hits) {
    if (node.nodeType === 3) {
      const raw = node.textContent, key = raw.trim(), val = i18nLookup(key);
      if (val !== undefined && val !== key) node.textContent = raw.replace(key, val);
    } else {
      for (const a of I18N_ATTRS) {
        const raw = node.getAttribute(a); if (raw === null) continue;
        const key = raw.trim(), val = i18nLookup(key);
        if (val !== undefined && val !== key) node.setAttribute(a, raw.replace(key, val));
      }
    }
  }
}

/* DOM-এ পরে বসা টেক্সটও অনুবাদ হয়; observer শুধু body তৈরি হওয়ার পর বসে */
const i18nQueue = new Set();
let i18nTimer = 0;
function i18nFlush(){
  i18nTimer = 0;
  const nodes = [...i18nQueue]; i18nQueue.clear();
  for (const el of nodes) if (el && el.isConnected) applyI18n(el);
}
function attachI18nObserver(){
  if (attachI18nObserver.done) return; attachI18nObserver.done = true;
  new MutationObserver(recs => {
  for (const r of recs) {
    if (r.type === "childList") r.addedNodes.forEach(n => i18nQueue.add(n.nodeType === 1 ? n : n.parentElement));
    else i18nQueue.add(r.target.nodeType === 1 ? r.target : r.target.parentElement);
  }
  if (!i18nTimer) i18nTimer = setTimeout(i18nFlush, 0);
}).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: I18N_ATTRS });
}

function unmosaic(el){
  if (!el) return;
  const kids = [...el.childNodes];
  const hasC = kids.some(k => k.nodeType === 1 && k.classList && k.classList.contains("c"));
  if (!hasC) { el.removeAttribute("data-mx-done"); return; }
  if (kids.some(k => k.nodeType === 1 && !(k.classList && k.classList.contains("c")))) return;
  el.textContent = el.textContent;
  el.removeAttribute("data-mx-done");
}
function currentLangNative(){ const l = I18N.list.filter(x => x.code === LANG)[0]; return (l || I18N.list[0]).native; }
function langOptionNodes(){ const ul = $("lang-list"); return ul ? [...ul.children] : []; }
function markLangSelected(){ langOptionNodes().forEach(li => li.setAttribute("aria-selected", li.dataset.code === LANG ? "true" : "false")); }
function buildLangMenu(){
  const ul = $("lang-list"); if (!ul) return;
  ul.innerHTML = I18N.list.map(function (l) {
    return '<li role="option" data-code="' + l.code + '" tabindex="-1">' +
      '<span class="lm-native" data-i18n-keep>' + esc(l.native) + '</span>' +
      '<span class="lm-latin en" data-i18n-keep>' + esc(l.name) + '</span>' +
      '<span class="lm-check">✓</span></li>';
  }).join("");
  markLangSelected();
}
function filterLangs(q){
  q = (q || "").trim().toLowerCase();
  let shown = 0;
  langOptionNodes().forEach(function (li){
    const l = I18N.list.filter(x => x.code === li.dataset.code)[0];
    const hay = ((l ? (l.native + " " + l.name) : "") + " " + li.dataset.code).toLowerCase();
    const on = !q || hay.indexOf(q) !== -1;
    li.style.display = on ? "" : "none"; if (on) shown++;
  });
  const empty = $("lang-empty"); if (empty) empty.hidden = shown > 0;
}
function updateLangBtn(){
  const cur = $("lang-cur"); if (cur) cur.textContent = currentLangNative();
  const b = $("lang-btn");
  if (b) { const lbl = t("ভাষা বদলান"); b.setAttribute("title", lbl); b.setAttribute("aria-label", lbl); }
  const m = $("lang-menu"); if (m && !m.hidden) markLangSelected();
}
function refreshSelectLabels(){
  /* ড্রপডাউন দুটি শুধু মালিক প্যানেলে — পাবলিক পেজে কিছু করাই হয় না */
  [["s-kind", "fillKindSelect"], ["i-category", "fillItemTypeSelect"]].forEach(function (p) {
    const el = $(p[0]); if (!el || typeof window[p[1]] !== "function") return;
    const keep = el.value; window[p[1]](); if (keep) el.value = keep;
  });
}

function setLang(next, persist){
  LANG = LANG_CODES[next] ? next : I18N.default;
  if (persist !== false) { try { localStorage.setItem(LANG_KEY, LANG); } catch (e) {} }
  document.documentElement.lang = LANG;
  document.documentElement.dir = "ltr";
  document.title = (S.settings && S.settings.siteName) || document.title;   // সাইটের নাম মালিকের কনটেন্ট — অনুবাদ হয় না
  updateLangBtn(); updateSoundBtn(); refreshSelectLabels();
  document.querySelectorAll("[data-mx-done]").forEach(unmosaic);
  applyI18n(document.body);   // আগে স্ক্যান, নাহলে মোজাইক স্প্যান ভেঙে ফেলে
  route();
}

/* ব্রাউজারের ভাষা থেকে মিলতে-পরা ভাষার কোড, না মিললে ডিফল্ট */
function detectLang(){
  const nav = ((navigator.language || navigator.userLanguage || "en") + "").toLowerCase();
  const hit = I18N.list.filter(l => l.code === "en" ? nav.startsWith("en") : nav.startsWith(l.code))[0];
  return hit ? hit.code : I18N.default;
}
function hasVisitorLangChoice(){ try { return !!localStorage.getItem(LANG_KEY); } catch (e) { return false; } }
/* auto-language সেটিং: মালিক চালু করলে + ভিজিটর আগে ভাষা বেয়ে রাখেননি → ব্রাউজারের ভাষা চুপচাপ প্রয়োগ (কোনো প্রম্পট নেই, localStorage-ও লেখে না) */
function applyAutoLang(){
  if (!S || !S.settings || !S.settings.autoLang) return;
  if (hasVisitorLangChoice()) return;
  const d = detectLang();
  if (d !== LANG) setLang(d, false);
}

/* =========================================================
   DB লেয়ার — সব পড়া-লেখা এখান দিয়ে। adapter বদলেই Firebase।
   ========================================================= */
let reduce = (function(){ try{ const s=localStorage.getItem("deeo.motion"); if(s==="reduce") return true; if(s==="full") return false; }catch(e){} return matchMedia("(prefers-reduced-motion: reduce)").matches; })();
const $ = id => document.getElementById(id);
/* ---- loader.svg-ভিত্তিক ইনলাইন লোডার (boot + ছোট) ----
   assets/loader.svg-এর আর্টওয়ার্কই ইনলাইন করা হয় (gradient/blur একই), তবে ক্লাস ও ID
   নেমস্পেস করা যাতে একই পেজে একাধিক লোডার সংঘর্ষ না করে; অ্যানিমেশন CSS SHARED_CSS-এ,
   ফলে prefers-reduced-motion-এ স্থির ছবি হিসেবে দেখানো যায়। */
let __dlrUid = 0;
function loaderSvg(size, uid){
  const s = Math.max(16, Math.round(size||40)), g = "deepoGrad-"+uid, f = "glow-"+uid;
  return '<svg class="dlr" viewBox="0 0 200 200" width="'+s+'" height="'+s+'" aria-hidden="true" focusable="false">'
    + '<defs>'
    + '<linearGradient id="'+g+'" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38BDF8"/><stop offset="50%" stop-color="#818CF8"/><stop offset="100%" stop-color="#C084FC"/></linearGradient>'
    + '<filter id="'+f+'" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.5" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>'
    + '</defs>'
    + '<rect class="dlr-sq" x="50" y="50" width="100" height="100" rx="12" stroke="url(#'+g+')" filter="url(#'+f+')"/>'
    + '<text class="dlr-logo" x="102" y="108" filter="url(#'+f+')">D<tspan class="dlr-ap">\'</tspan></text>'
    + '</svg>';
}
/* পুরো-স্ক্রিন বুট লোডার: #boot-এ আধুনিক ব্র্যান্ডেড boot animation বসায়; লোড শেষে .hide দিয়ে মিলিয়ে যায় */
function renderBootLoader(){ const b=$("boot"); if(b) b.innerHTML='<img class="boot-anim" src="assets/boot-animation.svg" alt="DEEPostrophy" draggable="false">'; }
/* ছোট ইনলাইন লোডার (≈৪০px): কোনো কন্টেইনারে বসানো/সরানো যায় */
function showLoader(el, size){
  if(!el) return null;
  const px = Math.round(size||40), host = document.createElement("span");
  host.className = "ldr-inline"; host.style.width = px+"px"; host.style.height = px+"px";
  host.innerHTML = loaderSvg(px, "x"+(++__dlrUid));
  el.innerHTML = ""; el.appendChild(host); el.style.display = "";
  return host;
}
function hideLoader(el){ if(el){ el.innerHTML=""; el.style.display="none"; } }
/* বাটনে ক্লিক-ভিত্তিক সেভ: চলাকালীন বাটনের জায়গায় ছোট লোডার, শেষে আগের অবস্থা ফিরিয়ে আনে */
async function withLoader(btn, fn){
  if(!btn) return await fn();
  const orig = btn.innerHTML, wasDisabled = btn.disabled;
  btn.disabled = true; btn.style.opacity = ".75";
  btn.innerHTML = '<span class="ldr-inline" style="width:22px;height:22px">'+loaderSvg(22,"b"+(++__dlrUid))+'</span>';
  try { return await fn(); }
  finally { btn.innerHTML = orig; btn.disabled = wasDisabled; btn.style.opacity = ""; }
}
const esc = s => (s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = () => "x"+Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const isValidUrl = s => typeof s==="string" && /^(https?:\/\/|mailto:|data:)/i.test(s.trim());
const splitList = s => (s||"").split(",").map(x=>x.trim()).filter(Boolean);
const isConfigured = () => Object.values(FIREBASE_CONFIG).every(v => v && v !== PLACEHOLDER);
// Firestore Timestamp বা সংখ্যা — দুটোকেই তুলনীয় মিলিসেকেন্ডে বদলায় (messages sort-এর জন্য)।
const tsNum = t => t && typeof t.toMillis==="function" ? t.toMillis() : (typeof t==="number" ? t : 0);

let FB = null;   // {app,auth,db, api:{...}}  (Storage ব্যবহার হয় না)
let MODE = isConfigured() ? "fs" : "ls";

/* ---- localStorage অ্যাডাপ্টার ---- */
const LS = (()=>{
  const KEY="deeo.state.v3";
  const blank = ()=>({stores:[],items:[],settings:{siteName:"DEEPostrophy",identity:"",about:"",email:"",social:[],autoLang:false},faq:[],messages:[]});
  let st;
  function norm(d){ const b=blank(); d=d&&typeof d==="object"?d:{};
    for(const k of ["stores","items","faq","messages"]) if(!Array.isArray(d[k])) d[k]=b[k];
    d.settings=Object.assign(b.settings,d.settings||{}); if(!Array.isArray(d.settings.social)) d.settings.social=[];
    d.stores.forEach((s,i)=>{ if(typeof s.order!=="number") s.order=i; });
    d.items.forEach((it,i)=>{ if(typeof it.order!=="number") it.order=i; if(!it.links) it.links={source:"",download:"",play:""}; if(it.overlay==null) it.overlay=""; if(!Array.isArray(it.tags)) it.tags=[]; });
    return d; }
  function persist(){ try{ localStorage.setItem(KEY, JSON.stringify(st)); }catch(e){} }
  return {
    async read(){ if(!st) st=norm(JSON.parse(localStorage.getItem(KEY)||"null")); return JSON.parse(JSON.stringify(st)); },
    async write(kind,obj){ await this.read(); const arr=st[kind]; const i=obj.id?arr.findIndex(x=>x.id===obj.id):-1;
      if(i>=0) arr[i]=Object.assign(arr[i],obj); else arr.push(obj); persist(); return arr[i>=0?i:arr.length-1]; },
    async remove(kind,id){ await this.read(); st[kind]=st[kind].filter(x=>x.id!==id); persist(); },
    async setSettings(s){ await this.read(); st.settings=Object.assign(st.settings,s); persist(); return st.settings; },
    async replaceAll(d){ st=norm(d); persist(); },
    async removeStoreCascade(storeId){ await this.read(); st.stores=st.stores.filter(s=>s.id!==storeId); st.items=st.items.filter(i=>i.storeId!==storeId); persist(); },
    async reorder(kind,list){ await this.read(); list.forEach((id,i)=>{ const x=st[kind].find(o=>o.id===id); if(x) x.order=i; }); persist(); },
  };
})();

/* ---- Firestore অ্যাডাপ্টার (config থাকলে) ---- */
const FS = {
  async read(){
    const { collection, getDocs, doc, getDoc, query, where } = FB.api;
    const snap = async (name, publishedOnly) => {
      const ref = collection(FB.db, name);
      const qs = publishedOnly ? await getDocs(query(ref, where("published","==",true))) : await getDocs(ref);
      const out = []; qs.forEach(d=>out.push(Object.assign({id:d.id}, d.data()))); return out;
    };
    const mine = Auth.isAdmin();
    const [stores, items, faq] = await Promise.all([snap("stores",!mine), snap("items",!mine), snap("faq",false)]);
    const settings = (await getDoc(doc(FB.db,"settings","site"))).data() || {};
    let messages = []; if(mine){ messages = (await snap("messages",false)).sort((a,b)=>tsNum(b.ts)-tsNum(a.ts)); }
    return { stores, items, settings, faq, messages };
  },
  async write(kind,obj){ const { doc, setDoc } = FB.api; const ref = doc(FB.db, kind, obj.id); const data=Object.assign({},obj); delete data.id; await setDoc(ref, data, {merge:true}); return obj; },
  async remove(kind,id){ const { doc, deleteDoc } = FB.api; await deleteDoc(doc(FB.db,kind,id)); },
  async setSettings(s){ const { doc, setDoc } = FB.api; await setDoc(doc(FB.db,"settings","site"), s, {merge:true}); return s; },
  async replaceAll(d){ await this.write("settings", Object.assign({id:"site"}, d.settings));
    for(const s of d.stores) await this.write("stores", s);
    for(const it of d.items) await this.write("items", it);
    for(const f of (d.faq||[])) await this.write("faq", f); },
  async removeStoreCascade(storeId){ const { collection, getDocs, deleteDoc, doc } = FB.api; await this.remove("stores",storeId);
    const q = await getDocs(collection(FB.db,"items")); const del=[]; q.forEach(d=>{ if(d.data().storeId===storeId) del.push(deleteDoc(doc(FB.db,"items",d.id))); }); await Promise.all(del); },
  async reorder(kind,list){ const { doc, updateDoc } = FB.api; await Promise.all(list.map((id,i)=>updateDoc(doc(FB.db,kind,id),{order:i}))); },
};

const DB = {
  get adapter(){ return MODE==="fs" ? FS : LS; },
  read(){ return this.adapter.read(); },
  writeStore(o){ return this.adapter.write("stores", o); },
  writeItem(o){ return this.adapter.write("items", o); },
  writeFaq(o){ return this.adapter.write("faq", o); },
  addMessage(o){ return this.adapter.write("messages", o); },
  removeStore(id){ return this.adapter.removeStoreCascade(id); },
  removeItem(id){ return this.adapter.remove("items", id); },
  removeFaq(id){ return this.adapter.remove("faq", id); },
  setSettings(s){ return this.adapter.setSettings(s); },
  replaceAll(d){ return this.adapter.replaceAll(d); },
  reorder(kind,list){ return this.adapter.reorder(kind, list); },
  exportJson(){ return S.raw ? JSON.stringify(S.raw, null, 2) : "{}"; },
};

/* (লোকাল → GitHub আপলোড ইঞ্জিন v6-তে সরানো হয়েছে — ফাইল/ছবি বাইরের লিংক থেকে আসে।) */

/* =========================================================
   Auth লেয়ার — fs: Firebase Auth; ls: লোকাল পাসকোড
   ========================================================= */
const Auth = {
  user:null,
  currentUser(){ return this.user; },
  isAdmin(){ if(MODE==="fs"){ const u=this.user; if(!u) return false; const match=(OWNER_EMAIL && u.email===OWNER_EMAIL) || (OWNER_UID && u.uid===OWNER_UID); return !!(match && u.emailVerified); } return !!this.user; },
  async onChange(cb){ if(MODE==="fs"){ FB.api.onAuthStateChanged(FB.auth, u=>{ this.user=u; cb(); }); } else { try{ this.user=JSON.parse(localStorage.getItem("deeo.localuser")||"null"); }catch(e){ this.user=null; } cb(); } },
  async signIn(cred){
    if(MODE==="fs"){ const { signInWithEmailAndPassword } = FB.api; const uc = await signInWithEmailAndPassword(FB.auth, cred.email, cred.pass); this.user = uc.user;
      const match = (OWNER_EMAIL && uc.user.email===OWNER_EMAIL) || (OWNER_UID && uc.user.uid===OWNER_UID);
      if(!match) return {notOwner:true};
      if(!uc.user.emailVerified) return {needVerify:true};
      return {ok:true};
    }
    // ls: পাসকোড
    const saved = localStorage.getItem("deeo.adminpass");
    if(!saved){ // প্রথমবার সেট
      if((cred.pass||"").length<4) return {err:"পাসকোড অন্তত ৪ অক্ষরের দিন।"};
      localStorage.setItem("deeo.adminpass", btoa(cred.pass)); this.user={local:true}; return {ok:true, first:true};
    }
    if(btoa(cred.pass)===saved){ this.user={local:true}; return {ok:true}; }
    return {err:"ভুল পাসকোড।"};
  },
  /* নতুন দর্শক অ্যাকাউন্ট — fs: Firebase; ls: লোকাল pseudo */
  async signUp(cred){
    if(MODE==="fs"){
      const { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } = FB.api;
      const uc = await createUserWithEmailAndPassword(FB.auth, cred.email, cred.pass);
      if(cred.name){ try{ await updateProfile(uc.user,{displayName:cred.name}); }catch(e){} }
      try{ await sendEmailVerification(uc.user); }catch(e){}
      this.user = uc.user;
      return {ok:true, needVerify:!uc.user.emailVerified};
    }
    if((cred.pass||"").length<4) return {err:"Password must be at least 4 characters."};
    const u={ local:true, email:cred.email||"", displayName:cred.name||"", emailVerified:true, uid:"local", metadata:{creationTime:new Date().toISOString()} };
    this.user=u; try{ localStorage.setItem("deeo.localuser", JSON.stringify(u)); }catch(e){}
    return {ok:true};
  },
  async sendVerification(){ if(MODE==="fs"){ const { sendEmailVerification }=FB.api; const u=FB.auth.currentUser; if(u){ try{ await sendEmailVerification(u); }catch(e){} } } },
  async updateName(name){ if(MODE==="fs"){ const { updateProfile }=FB.api; const u=FB.auth.currentUser; if(u){ await updateProfile(u,{displayName:name}); this.user=u; } } else { const u=this.user||{}; u.displayName=name; this.user=u; try{ localStorage.setItem("deeo.localuser",JSON.stringify(u)); }catch(e){} } },
  async updatePassword(np){ if(MODE==="fs"){ const { updatePassword }=FB.api; const u=FB.auth.currentUser; if(u) await updatePassword(u,np); } },
  async updateEmail(ne){ if(MODE==="fs"){ const { updateEmail }=FB.api; const u=FB.auth.currentUser; if(u){ await updateEmail(u,ne); this.user=u; } } },
  async deleteAccount(){ if(MODE==="fs"){ const { deleteUser }=FB.api; const u=FB.auth.currentUser; if(u) await deleteUser(u); this.user=null; } else { this.user=null; try{ localStorage.removeItem("deeo.localuser"); localStorage.removeItem("deeo.activity"); }catch(e){} } },
  async signOut(){ if(MODE==="fs"){ const { signOut }=FB.api; await signOut(FB.auth); } this.user=null; try{ localStorage.removeItem("deeo.localuser"); }catch(e){} },
};

/* =========================================================
   Activity — দর্শকের নিজের ডাউনলোড/সেভ/মেসেজ হিস্ট্রি (users/{uid})
   ========================================================= */
const Activity = {
  _cache:null,
  _uid(){ const u=Auth.user; return u ? (MODE==="fs" ? u.uid : "local") : null; },
  async load(){ const k=this._uid(); if(!k){ this._cache={downloads:[],saved:[],messages:[]}; return this._cache; }
    if(MODE==="fs"){ const { doc, getDoc }=FB.api; let d={}; try{ const snap=await getDoc(doc(FB.db,"users",k)); if(snap.exists()) d=snap.data()||{}; }catch(e){} this._cache=d; }
    else { try{ this._cache=JSON.parse(localStorage.getItem("deeo.activity")||"{}"); }catch(e){ this._cache={}; } }
    this._cache.downloads=this._cache.downloads||[]; this._cache.saved=this._cache.saved||[]; this._cache.messages=this._cache.messages||[]; this._cache.reactions=this._cache.reactions||{};
    return this._cache;
  },
  async save(){ const k=this._uid(); if(!k) return; const data=this._cache||{downloads:[],saved:[],messages:[]};
    if(MODE==="fs"){ const { doc, setDoc }=FB.api; try{ await setDoc(doc(FB.db,"users",k), data, {merge:true}); }catch(e){} }
    else { try{ localStorage.setItem("deeo.activity", JSON.stringify(data)); }catch(e){} }
  },
  async logDownload(name,url){ if(!Auth.user) return; const d=await this.load(); d.downloads.unshift({name, url, ts:Date.now()}); d.downloads=d.downloads.slice(0,200); await this.save(); },
  async logMessage(name,body){ if(!Auth.user) return; const d=await this.load(); d.messages.unshift({name, body, ts:Date.now()}); d.messages=d.messages.slice(0,200); await this.save(); },
  async toggleSave(item){ if(!Auth.user) return null; const d=await this.load(); const i=d.saved.findIndex(x=>x.id===item.id); let saved; if(i>=0){ d.saved.splice(i,1); saved=false; } else { d.saved.unshift({ id:item.id, name:item.name, storeId:item.storeId, ts:Date.now() }); saved=true; } d.saved=d.saved.slice(0,200); await this.save(); return saved; },
  async isSaved(id){ if(!Auth.user) return false; const d=await this.load(); return (d.saved||[]).some(x=>x.id===id); },
  async list(){ return await this.load(); },
  async clear(){ if(!Auth.user) return; this._cache={downloads:[],saved:[],messages:[]}; await this.save(); },
};

/* =========================================================
   Stats — প্রতি আইটেমের aggregate ডাউনলোড / সেভ / রিঅ্যাকশন
   fs: Firestore stats/{itemId} + users/{uid}.reactions; ls: localStorage
   এক-ক্লিকে একটাই রিঅ্যাকশন; পাল্টালে আগেরটা থেকে -1, নতুনে +1 (transaction)।
   ========================================================= */
const REACTS = ["❤️","🔥","👍"];
const GUEST_REACT_KEY = "deeo.guestreact";      /* {itemId: emoji} — লগ-ইন ছাড়া ডিভাইস-গার্ড */
const Stats = {
  _map:{},                                       /* itemId → {downloads,saves,reactions:{emoji:n}} */
  _subs:new Set(),
  /* রিঅ্যাকশন বদলালে রেন্ডার আবার চালায় */
  subscribe(fn){ this._subs.add(fn); return ()=>this._subs.delete(fn); },
  emit(id){ this._subs.forEach(f=>{ try{ f(id); }catch(e){} }); },
  _blank(id){ return this._map[id]={ id, downloads:0, saves:0, reactions:{} }; },
  get(id){ return this._map[id] || this._blank(id); },
  /* মোট রিঅ্যাকশন সংখ্যা */
  totalReact(id){ const r=this.get(id).reactions||{}; return REACTS.reduce((a,e)=>a+(r[e]||0),0); },
  /* এই ভিজিটর এই আইটেমে কোন রিঅ্যাকশন দিয়েছেন */
  myReact(id){
    if(MODE==="fs"){ const d=Activity._cache; const mine=d&&d.reactions; if(mine&&mine[id]) return mine[id]; }
    try{ const g=JSON.parse(localStorage.getItem(GUEST_REACT_KEY)||"{}"); return g[id]||""; }catch(e){ return ""; }
  },
  _setMyReact(id,emoji){
    if(MODE==="fs" && Auth.user){ Activity.load().then(d=>{ d.reactions=d.reactions||{}; if(emoji) d.reactions[id]=emoji; else delete d.reactions[id]; return Activity.save(); }).catch(()=>{}); }
    try{ const g=JSON.parse(localStorage.getItem(GUEST_REACT_KEY)||"{}"); if(emoji) g[id]=emoji; else delete g[id]; localStorage.setItem(GUEST_REACT_KEY, JSON.stringify(g)); }catch(e){}
  },
  async loadOne(id){
    if(MODE!=="fs"){ try{ const m=JSON.parse(localStorage.getItem("deeo.stats")||"{}"); this._map[id]=m[id]||this._blank(id); }catch(e){ this._blank(id); } return this._map[id]; }
    const { doc, getDoc }=FB.api; try{ const snap=await getDoc(doc(FB.db,"stats",id)); if(snap.exists()){ const d=snap.data()||{}; this._map[id]={ id, downloads:+d.downloads||0, saves:+d.saves||0, reactions:(d.reactions&&typeof d.reactions==="object")?d.reactions:{} }; } else this._blank(id); }catch(e){ this._blank(id); }
    return this._map[id];
  },
  /* স্টোর/হোম খোলার সময় একসাথে অনেক আইটেমের পরিসংখ্যান */
  async loadMany(ids){
    ids=(ids||[]).filter(Boolean); if(!ids.length) return;
    if(MODE!=="fs"){ try{ const m=JSON.parse(localStorage.getItem("deeo.stats")||"{}"); ids.forEach(id=>{ this._map[id]=m[id]||this._blank(id); }); }catch(e){ ids.forEach(id=>this._blank(id)); } return; }
    const { collection, doc, getDocs, query:qFn, where, documentId }=FB.api;
    /* Firestore where-in ৩০-এর বেশি চলে না → চেঙ্ক করি */
    for(let i=0;i<ids.length;i+=28){
      const chunk=ids.slice(i,i+28);
      try{ const q=await getDocs(qFn(collection(FB.db,"stats"), where(documentId(),"in",chunk))); q.forEach(d=>{ const dd=d.data()||{}; this._map[d.id]={ id:d.id, downloads:+dd.downloads||0, saves:+dd.saves||0, reactions:(dd.reactions&&typeof dd.reactions==="object")?dd.reactions:{} }; }); }catch(e){ chunk.forEach(id=>{ if(!this._map[id]) this._blank(id); }); }
    }
  },
  _lsBump(id, mut){
    const m=JSON.parse(localStorage.getItem("deeo.stats")||"{}"); const cur=m[id]||{ id, downloads:0, saves:0, reactions:{} };
    mut(cur); cur.downloads=Math.max(0,cur.downloads|0); cur.saves=Math.max(0,cur.saves|0);
    REACTS.forEach(e=>{ cur.reactions[e]=Math.max(0,(cur.reactions[e]||0)|0); if(!cur.reactions[e]) delete cur.reactions[e]; });
    m[id]=cur; this._map[id]=cur; try{ localStorage.setItem("deeo.stats", JSON.stringify(m)); }catch(e){}
  },
  /* fs মোডে তাৎক্ষণিক UI-এর জন্য শুধু মেমোরি-ক্যাশে ঠিক করা (localStorage ছুঁবে না) */
  _optBump(id, mut){
    const cur=this._map[id]?JSON.parse(JSON.stringify(this._map[id])):{ id, downloads:0, saves:0, reactions:{} };
    mut(cur); cur.downloads=Math.max(0,cur.downloads|0); cur.saves=Math.max(0,cur.saves|0);
    REACTS.forEach(e=>{ cur.reactions[e]=Math.max(0,(cur.reactions[e]||0)|0); if(!cur.reactions[e]) delete cur.reactions[e]; });
    this._map[id]=cur;
  },
  /* একটাই রাইট পাথ: ফুল-ডক transaction → rules সর্বদা সম্পূর্ণ valid ডক দেখে */
  async _txWrite(id, mutator){
    if(!id) return false;
    if(MODE!=="fs"){ this._lsBump(id, mutator); this.emit(id); return true; }   /* ls = localStorage-ই সত্য */
    this._optBump(id, mutator);                                                  /* fs = optimistic UI */
    const { doc, runTransaction }=FB.api;
    try{
      await runTransaction(FB.db, async tx=>{
        const ref=doc(FB.db,"stats",id); const snap=await tx.get(ref);
        const base=snap.exists()?snap.data():{};
        const c={ id, downloads:+base.downloads||0, saves:+base.saves||0, reactions:Object.assign({}, base.reactions||{}) };
        mutator(c);
        c.downloads=Math.max(0,Math.min(1e7,c.downloads|0)); c.saves=Math.max(0,Math.min(1e7,c.saves|0));
        REACTS.forEach(e=>{ const v=Math.max(0,(c.reactions[e]||0)|0); if(v) c.reactions[e]=v; else delete c.reactions[e]; });
        tx.set(ref, c, { merge:false });
      });
    }catch(e){ return false; }
    this.emit(id); return true;
  },
  async bumpDownload(id){ await this._txWrite(id, c=>c.downloads=(c.downloads||0)+1); },
  /* save toggled → delta +1/-1; aggregate + নিজের হিস্ট্রি দুটোই সামলায় */
  async bumpSave(id, delta){ if(delta) await this._txWrite(id, c=>{ c.saves=Math.max(0,(c.saves||0)+delta); }); },
  /* একটি রিঅ্যাকশন বেছে নিন; ইতিমধ্যে একইটা দিলে সরে যান (toggle) */
  async react(id, emoji){
    if(!id || !REACTS.includes(emoji)) return { ok:false };
    const prev=this.myReact(id);
    const on = prev!==emoji;
    const ok = await this._txWrite(id, c=>{
      if(prev) c.reactions[prev]=Math.max(0,(c.reactions[prev]||0)-1);
      if(on) c.reactions[emoji]=(c.reactions[emoji]||0)+1;
    });
    if(ok) this._setMyReact(id, on?emoji:"");
    else if(MODE==="fs") await this.loadOne(id);             /* ব্যর্থ হলে সার্ভার-সত্য কারেক্ট করো */
    return { ok, on };
  },
};

/* =========================================================
   স্টেট + রেন্ডার
   ========================================================= */
const S = { stores:[], items:[], settings:{}, faq:[], messages:[], raw:null, loaded:false };

function applyRaw(raw){
  S.raw = raw;
  S.stores = [...(raw.stores||[])].sort((a,b)=>a.order-b.order);
  S.items  = [...(raw.items||[])].sort((a,b)=>a.order-b.order);
  S.settings = raw.settings||{};
  S.faq = [...(raw.faq||[])].sort((a,b)=>a.order-b.order);
  S.messages = [...(raw.messages||[])].sort((a,b)=>tsNum(b.ts)-tsNum(a.ts));
  S.loaded = true;
}
async function loadData(){ applyRaw(await DB.read()); }
const pubStores = ()=> S.stores.filter(s=>s.published);
const itemsOf = sid => S.items.filter(i=>i.storeId===sid);
const pubItemsOf = sid => itemsOf(sid).filter(i=>i.published);
const countItems = sid => pubItemsOf(sid).length;
const featItems = ()=> S.items.filter(i=>i.published && i.featured);
const storeById = id => S.stores.find(s=>s.id===id);
const itemById = id => S.items.find(i=>i.id===id);

/* ---- টেমপ্লেট ---- */
function coverInner(it){
  const img = it.coverImage && isValidUrl(it.coverImage);
  const grad = it.coverColor || PALETTE[0];
  const base = img ? `<img class="thumb" data-i18n-keep crossorigin="anonymous" src="${esc(it.coverImage)}" alt="${esc(it.name)}" onerror="this.style.display='none'">` : `<div class="glow" style="background:${esc(grad)}"></div>`;
  const overlay = animOff ? "" : `<canvas class="mosaic" data-grad="${img?"":esc(grad)}" data-img="${img?esc(it.coverImage):""}"></canvas>`;
  const svg = (it.overlay && isValidUrl(it.overlay)) ? `<object class="cover-anim" type="image/svg+xml" data="${esc(it.overlay)}" aria-hidden="true" tabindex="-1"></object>` : "";
  return `<div class="cover">${base}${overlay}${svg}<span class="type">${esc(t(it.category||"আইটেম"))}</span></div>`;
}
function tagsHtml(tags){ return (tags||[]).slice(0,4).map(x=>`<span class="chip en" data-i18n-keep>${esc(x)}</span>`).join(""); }
function flagsHtml(it){ let f=""; if(it.featured) f+='<span class="flag feat">★ ফিচারড</span>'; if(!it.published) f+='<span class="flag draft">খসড়া</span>'; return f; }
function itemCardHtml(it,i){
  const dl=it.links&&isValidUrl(it.links.download), src=it.links&&isValidUrl(it.links.source), play=it.links&&isValidUrl(it.links.play);
  return `<article class="card reveal" style="--i:${i%8}">${flagsHtml(it)}${coverInner(it)}
    <div class="card-body"><h3 data-i18n-keep>${esc(it.name)}</h3><p class="tagline" data-i18n-keep>${esc(it.tagline||it.description)}</p>
      <div class="langs">${tagsHtml(it.tags)}</div>
      <div class="card-actions"><a class="btn sm primary" href="#item/${it.id}" data-link>খুলুন</a>${play?`<button class="btn sm play" type="button" data-play data-id="${esc(it.id)}" data-url="${esc(it.links.play)}" data-name="${esc(it.name)}">▶ <span>প্লে</span></button>`:""}
        ${src?`<a class="btn sm ghost en" href="${esc(it.links.source)}" target="_blank" rel="noopener">সোর্স</a>`:""}
        ${dl?`<a class="btn sm ghost" href="${esc(it.links.download)}" target="_blank" rel="noopener" data-download data-id="${esc(it.id)}" data-name="${esc(it.name)}">ডাউনলোড</a>`:""}</div>
      <div class="item-stat" data-stat="${esc(it.id)}">${cardStatInner(it.id)}</div></div></article>`;
}

/* =========================================================
   Stats UI — কার্ডে ছোট কাউন্ট, ডিটেইলে সম্পূর্ণ + রিঅ্যাকশন বার
   ========================================================= */
function fmtNum(n){ n=n|0; if(n>=1e6) return (n/1e6).toFixed(n>=1e7?0:1).replace(/\.0$/,"")+"M"; if(n>=1e3) return (n/1e3).toFixed(n>=1e4?0:1).replace(/\.0$/,"")+"k"; return String(n); }
/* কার্ডের পড়ার-মাত্রার সারি (রিঅ্যাকশন নয়, শুধু সংখ্যা) */
function cardStatInner(id){ const s=Stats.get(id); const tot=Stats.totalReact(id); return `<span class="is-d">⬇ ${fmtNum(s.downloads)}</span><span class="is-r">❤ ${fmtNum(tot)}</span>`; }
/* রিঅ্যাকশন বারের ভেতরের মার্কআপ */
function reactBarInner(id){ const my=Stats.myReact(id); const rr=Stats.get(id).reactions||{};
  return REACTS.map(e=>`<button class="rx${my===e?" on":""}" type="button" data-rx="${e}" data-item="${esc(id)}" aria-pressed="${my===e?"true":"false"}"><span class="rx-e">${e}</span><span class="rx-n">${fmtNum(rr[e]||0)}</span></button>`).join(""); }
/* বিস্তারিত পাতার সম্পূর্ণ ব্লক */
function detailStatsHtml(it){ const s=Stats.get(it.id);
  return `<div class="stat-row">
      <span class="stat"><i>⬇</i><b data-cd="${esc(it.id)}">${fmtNum(s.downloads)}</b><em>${esc(t("মোট ডাউনলোড"))}</em></span>
      <span class="stat"><i>★</i><b data-cs="${esc(it.id)}">${fmtNum(s.saves)}</b><em>${esc(t("সেভ"))}</em></span>
      <span class="stat"><i>❤</i><b data-cr="${esc(it.id)}">${fmtNum(Stats.totalReact(it.id))}</b><em>${esc(t("রিঅ্যাকশন"))}</em></span>
    </div>
    <div class="rx-bar" data-rxbar="${esc(it.id)}">${reactBarInner(it.id)}</div>`; }
/* ক্যাশ থেকে পুরো DOM সতেজ করে */
function refreshStatsDOM(){
  document.querySelectorAll("[data-stat]").forEach(el=>{ el.innerHTML=cardStatInner(el.getAttribute("data-stat")); });
  document.querySelectorAll("[data-rxbar]").forEach(el=>{ el.innerHTML=reactBarInner(el.getAttribute("data-rxbar")); });
  document.querySelectorAll("[data-cd]").forEach(el=>{ el.textContent=fmtNum(Stats.get(el.getAttribute("data-cd")).downloads); });
  document.querySelectorAll("[data-cs]").forEach(el=>{ el.textContent=fmtNum(Stats.get(el.getAttribute("data-cs")).saves); });
  document.querySelectorAll("[data-cr]").forEach(el=>{ el.textContent=fmtNum(Stats.totalReact(el.getAttribute("data-cr"))); });
}
/* একবারই: রিঅ্যাকশন ক্লিক + Stats পরিবর্তনে রি-রেন্ডার */
function initStatsUI(){
  document.addEventListener("click", async (e)=>{
    const b=e.target.closest(".rx"); if(!b) return;
    const id=b.getAttribute("data-item"), emoji=b.getAttribute("data-rx");
    /* লগ-ইন না থাকলেও চলে (গেস্ট like) — শুধু আইডেন্টিটি localStorage-গার্ড */
    b.disabled=true;
    try{ await Stats.react(id, emoji); }finally{ b.disabled=false; }
  });
  Stats.subscribe(()=>refreshStatsDOM());
}

/* ---- অ্যানিমেশন: fade/reveal + drift + mosaic ---- */
let io, driftSet=new Set(), driftRAF=0;
/* মালিক প্যানেলে (window.DEEO_ADMIN) মোজাইক/ড্রিফট/স্ট্যাগার চলে না */
let animOff = reduce || !!window.DEEO_ADMIN;
/* রিডিউসড-মোশন টগল — state + CSS ক্লাস + localStorage একসাথে; JS ইঞ্জিনও সাথে সাথে থামে */
function setMotion(reduced){
  reduce = !!reduced; animOff = reduce || !!window.DEEO_ADMIN;
  document.documentElement.classList.toggle("reduce-motion", reduce);
  try{ localStorage.setItem("deeo.motion", reduce?"reduce":"full"); }catch(e){}
  if(reduce){ if(driftRAF){ cancelAnimationFrame(driftRAF); driftRAF=0; } document.querySelectorAll("canvas.mosaic").forEach(c=>c.remove()); mxReset(); }
}
document.documentElement.classList.toggle("reduce-motion", reduce);
/* ড্রিফট লুপ demand-driven — স্ক্রল বা অবস্থান বদলাচ্ছে তখনই, স্থির হলে বন্ধ */
function driftStep(){
  driftRAF = 0; let moving = false;
  driftSet.forEach(t => {
    const s = t._d; if (!s || s.vis === false) return;              // পর্দার বাইরে — ছোঁয়া হয় না
    const shown = Math.tanh(s.raw / 320) * 150, d = shown - s.x;
    if (Math.abs(d) > 0.05) { s.x += d * 0.12; t.style.transform = "translateX(" + s.x.toFixed(2) + "px)"; moving = true; }
    else if (s.x !== shown) { s.x = shown; t.style.transform = "translateX(" + s.x.toFixed(2) + "px)"; }
  });
  if (moving) driftRAF = requestAnimationFrame(driftStep);            // সব স্থির — লুপ থামল
}
function driftKick(){ if (animOff || driftRAF) return; driftRAF = requestAnimationFrame(driftStep); }
const driftIO = animOff ? null : new IntersectionObserver(es => {
  es.forEach(en => { const t = en.target; if (!t._d) return; t._d.vis = en.isIntersecting; if (en.isIntersecting) driftKick(); });
}, { rootMargin: "120px 0px" });
function ensureDrift(t){ if(animOff||!t||t._d) return; t._d={raw:0,x:0,lastY:scrollY,vis:true};
  addEventListener("scroll",()=>{ const y=scrollY; const d=y-t._d.lastY; t._d.lastY=y; if(d) t._d.raw+=d*0.4; driftKick(); },{passive:true});
  driftSet.add(t); if(driftIO) driftIO.observe(t); }
function observeReveals(){
  document.querySelectorAll(".reveal:not(.in)").forEach(el=>{ if(animOff){el.classList.add("in");} else io.observe(el); });
  observeCoverMosaic();
}
function initDrift(){ if(animOff) return; document.querySelectorAll("[data-drift]").forEach(ensureDrift); driftKick(); }

/* ---- মোজাইক বাজেট: একসাথে সর্বোচ্চ ৪টি; পর্দার বাইরে থাকলে থামে ---- */
const MX_LIMIT = 4;
let mxBusy = 0;
const mxPending = [];
const mxLive = new Set();
function mxState(el){ return el._mx || (el._mx = { vis: true, running: false, finished: false, stop: null }); }
const mxIO = animOff ? null : new IntersectionObserver(es => {
  es.forEach(en => {
    const el = en.target, s = mxState(el);
    s.vis = en.isIntersecting;
    if (en.isIntersecting) mxPump();
    else if (s.running && s.stop) s.stop();          // বাইরে গেলে চলমানটিও থামে
  });
}, { rootMargin: "80px 0px" });
function mxRequest(el, kind){
  const s = mxState(el);
  if (s.running || mxPending.indexOf(el) >= 0) return;
  if (s.finished && el.hasAttribute("data-mx-done")) return;   // সত্যিই শেষ
  s.finished = false;                                           // লেখা/ব্র্যান্ড বদলালে আবার চলবে
  el._mxKind = kind;
  mxPending.push(el);
  if (mxIO) mxIO.observe(el); else s.vis = true;
  mxPump();
}
function mxPump(){
  let guard = mxPending.length;
  while (mxBusy < MX_LIMIT && mxPending.length && guard-- > 0) {
    const i = mxPending.findIndex(el => el.isConnected && mxState(el).vis);
    if (i < 0) break;
    const el = mxPending.splice(i, 1)[0];
    const before = mxBusy;
    mxStartCover(el);                                          // মোজাইক শুধু কভার/কার্ড ছবিতেই
    if (mxBusy === before) { mxPending.push(el); break; }   // জায়গা মাপা যায়নি — পরের রেণ্ডারে আবার চেষ্টা
  }
}
function mxFreed(el){
  const s = mxState(el);
  s.running = false; s.finished = true; s.stop = null;
  mxLive.delete(el); mxBusy = Math.max(0, mxBusy - 1);
  if (mxIO) mxIO.unobserve(el);
  mxPump();
}
function mxReset(){
  mxPending.length = 0;
  [...mxLive].forEach(el => { const s = mxState(el); if (s.stop) s.stop(); });
  mxBusy = 0;
}
/* অক্ষর-ভাঙা টেক্সট মোজাইক বাদ — মোজাইক শুধু কভার ছবিতেই চলে */

/* ক্যানভাস টাইল-মোজাইক (কভার) */
function extractColors(css){ const m=(css||"").match(/#[0-9a-fA-F]{3,6}/g); if(!m) return ["#8b5cf6","#22d3ee"]; if(m.length===1) return [m[0],m[0]]; return [m[0], m[m.length-1]]; }
function lerpHex(a,b,t){ const pa=parseInt(a.slice(1),16), pb=parseInt(b.slice(1),16); const r=Math.round(((pa>>16)&255)+(((pb>>16)&255)-((pa>>16)&255))*t); const g=Math.round(((pa>>8)&255)+(((pb>>8)&255)-((pa>>8)&255))*t); const bb=Math.round((pa&255)+((pb&255)-(pa&255))*t); return `rgb(${r},${g},${bb})`; }
function observeCoverMosaic(){
  if(animOff) return;                                             // মোজাইক নেই: reduced-motion বা মালিক প্যানেল
  document.querySelectorAll("canvas.mosaic:not([data-init])").forEach(cv=>{ cv.setAttribute("data-init","1"); mxRequest(cv, "cover"); });
  mxPump();
}
function mxStartCover(cv){
  const cover = cv.parentElement;
  if (!cover || !cover.clientWidth) { mxState(cv).finished = false; return; }   // মাপ নেই — পরে আবার চেষ্টা হবে
  const s = mxState(cv); s.running = true; mxBusy++; mxLive.add(cv);
  const isMobile = innerWidth < 640;
  const grad=cv.dataset.grad, imgsrc=cv.dataset.img;
  const W=cover.clientWidth, H=cover.clientHeight; cv.width=W; cv.height=H;
  const ctx=cv.getContext("2d");
  const [c1,c2]=extractColors(grad||PALETTE[0]);
  let img=null; if(imgsrc){ img=new Image(); img.crossOrigin="anonymous"; img.src=imgsrc; }

  /* টাইল ~১২–১৬px; মোবাইলে বড় টাইল = কম টুকরো। বড় কভারে সংখ্যা সীমায় ধরা হয় */
  let T = isMobile ? 26 : 14;
  const MAX = isMobile ? 80 : 320;
  while (Math.ceil(W/T) * Math.ceil(H/T) > MAX && T < 200) T += 2;
  const cols=Math.max(1,Math.ceil(W/T)), rows=Math.max(1,Math.ceil(H/T));
  const tw=W/cols, th=H/rows;

  /* প্রতিটি টুকরো এলোমেলো দিক থেকে, এলোমেলো সময়ে, ঘুরতে-বেড়ে বসে */
  const SPAN = 430;                                                  // বিলম্বের সীমা (ms)
  const tiles=[];
  for(let r=0;r<rows;r++)for(let cc=0;cc<cols;cc++){
    const a=Math.random()*Math.PI*2, d=26+Math.random()*58;
    tiles.push({ sx:cc*tw, sy:r*th, cx:cc*tw+tw/2, cy:r*th+th/2,
      jx:Math.cos(a)*d, jy:Math.sin(a)*d,
      rot:(Math.random()*2-1)*Math.PI/2,                             // ±৯০° ঘোরে
      sc:1.7+Math.random()*1.1,                                      // বড় থেকে ছোট হয়ে বসে
      dl:Math.random()*SPAN,                                         // কখন উড়বে
      pd:300+Math.random()*170,                                      // উড়ে বেড়ায় ৩০০–৪৭০ms
      fill:lerpHex(c1,c2,(cc*tw+tw/2)/W) });
  }
  const dur = SPAN + 470;                                            // পুরো effect <১s (৯০০ms)
  const t0=performance.now();
  let raf = 0, ended = false;
  const finish = () => {
    if (ended) return; ended = true;
    if (raf) cancelAnimationFrame(raf);
    cv.style.opacity = "0"; setTimeout(() => cv.remove(), 120);
    cv.setAttribute("data-mx-done","1");
    mxFreed(cv);
  };
  s.stop = finish;
  (function step(now){
    if (ended) return;
    if (!cv.isConnected) { finish(); return; }                                // কার্ড সরে গেলে লুপও থামে
    const el = now - t0;
    const useImg = !!(img && img.complete && img.naturalWidth);
    const ix = useImg ? img.naturalWidth / W : 0, iy = useImg ? img.naturalHeight / H : 0;
    ctx.clearRect(0,0,W,H);
    for(const t of tiles){
      const lp = (el - t.dl) / t.pd; if (lp <= 0) continue;                   // এখনো আসেনি
      const e = lp >= 1 ? 1 : 1 - Math.pow(1 - lp, 3);
      ctx.save();
      ctx.globalAlpha = e;
      ctx.translate(t.cx + t.jx*(1-e), t.cy + t.jy*(1-e));
      ctx.rotate(t.rot*(1-e));
      const k = t.sc + (1 - t.sc)*e; ctx.scale(k,k);
      if (useImg){
        const sx=t.sx*ix, sy=t.sy*iy, sw=Math.min(tw*ix, img.naturalWidth-sx), sh=Math.min(th*iy, img.naturalHeight-sy);
        if (sw > 0 && sh > 0) ctx.drawImage(img, sx, sy, sw, sh, -tw/2, -th/2, tw+0.6, th+0.6);
      } else { ctx.fillStyle = t.fill; ctx.fillRect(-tw/2,-th/2,tw+0.6,th+0.6); }
      ctx.restore();
    }
    if(el < dur) raf = requestAnimationFrame(step); else finish();
  })(t0);
}

/* reveal — পর্দার বাইরে গেলে .in সরে যায়, ফিরলে যেদিক থেকেই হোক আবার চলে */
io = new IntersectionObserver((ents) => ents.forEach(en => {
  en.target.classList.toggle("in", en.isIntersecting);
}), { threshold: .12, rootMargin: "0px 0px -6% 0px" });

/* ---- রুটিং হেল্পার — PAGES ও route() প্রতিটি পেজ নিজের ফাইলে বানায় ---- */
function showPage(n){ PAGES.forEach(p => $("page-" + p).classList.toggle("show", p === n)); }
function setActiveNav(h){ document.querySelectorAll("#navlinks a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === h)); }
function refreshBrand(){
  const nm = S.settings.siteName || "DEEPostrophy";
  const bn = $("brand-name"); if (bn) bn.textContent = nm;
  const ht = $("home-title"); if (!ht) return;                    /* বড় শিরোনাম শুধু হোমে */
  const parts = nm.split(/(?=[A-Z])/);
  ht.innerHTML = parts.length > 1 ? esc(parts[0]) + '<span class="grad">' + esc(parts.slice(1).join("")) + "</span>" : '<span class="grad">' + esc(nm) + "</span>";
  ht.removeAttribute("data-mx-done");
}
addEventListener("hashchange", ()=>{ document.querySelectorAll("[data-mx-done]").forEach(e=>e.removeAttribute("data-mx-done")); document.querySelectorAll("canvas.mosaic").forEach(c=>c.remove()); mxReset(); route(); });

/* ---- শেয়ার্ড বাইন্ডিং — বোতাম না থাকলে চুপচাপ এড়িয়ে যায় ---- */
function bindCommon(){
  const bg = $("burger"); if (bg) bg.addEventListener("click", () => $("navlinks").classList.toggle("open"));
document.addEventListener("click", e=>{ const b=e.target.closest("[data-goto]"); if(b){ location.hash="#"+b.dataset.goto; } });
document.addEventListener("click", e=>{ const a=e.target.closest("a[data-scroll]"); if(!a) return;
  const el=document.getElementById((a.getAttribute("href")||"").slice(1)); if(!el) return;
  e.preventDefault(); el.scrollIntoView({behavior: reduce?"auto":"smooth", block:"start"}); });
}
function openLangMenu(){
  const m = $("lang-menu"), b = $("lang-btn"); if (!m) return;
  buildLangMenu();
  m.hidden = false; if (b) b.setAttribute("aria-expanded", "true");
  const s = $("lang-search"); if (s) { s.value = ""; filterLangs(""); }
  const em = $("lang-empty"); if (em) em.hidden = true;
  if (s) setTimeout(() => { try { s.focus(); } catch (e) {} }, 0);
}
function closeLangMenu(){
  const m = $("lang-menu"), b = $("lang-btn"); if (!m || m.hidden) return;
  m.hidden = true; if (b) b.setAttribute("aria-expanded", "false");
  langOptionNodes().forEach(li => li.classList.remove("hi"));
}
function toggleLangMenu(){ const m = $("lang-menu"); if (!m) return; m.hidden ? openLangMenu() : closeLangMenu(); }
function moveLangHighlight(dir){
  const vis = langOptionNodes().filter(li => li.style.display !== "none"); if (!vis.length) return;
  let i = vis.findIndex(li => li.classList.contains("hi"));
  i = dir > 0 ? (i + 1 + vis.length) % (vis.length || 1) : (i - 1 + vis.length) % (vis.length || 1);
  if (i < 0) i = 0;
  langOptionNodes().forEach(li => li.classList.remove("hi"));
  vis[i].classList.add("hi"); vis[i].scrollIntoView({ block: "nearest" });
}
function bindLangBtn(){
  const b = $("lang-btn"); if (!b) return;
  b.setAttribute("aria-haspopup", "listbox"); b.setAttribute("aria-expanded", "false");
  b.addEventListener("click", e => { e.stopPropagation(); toggleLangMenu(); });
  const m = $("lang-menu");
  if (m) {
    m.addEventListener("click", e => {
      e.stopPropagation();
      const li = e.target.closest("li[data-code]"); if (!li) return;
      setLang(li.dataset.code); closeLangMenu(); if (b) b.focus();
    });
    const s = $("lang-search");
    if (s) s.addEventListener("input", () => filterLangs(s.value));
    m.addEventListener("keydown", e => {
      if (e.key === "ArrowDown")      { e.preventDefault(); moveLangHighlight(1); }
      else if (e.key === "ArrowUp")   { e.preventDefault(); moveLangHighlight(-1); }
      else if (e.key === "Enter")     { e.preventDefault();
        const pick = m.querySelector("li.hi") || m.querySelector('li[aria-selected="true"]') || langOptionNodes().filter(li => li.style.display !== "none")[0];
        if (pick) { setLang(pick.dataset.code); closeLangMenu(); if (b) b.focus(); } }
    });
  }
  /* বাইরে ক্লিক বা Esc — প্যানেল বন্ধ */
  document.addEventListener("click", () => closeLangMenu());
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLangMenu(); });
}

async function loadFirebase(){
  try{
    const [appM,authM,dbM] = await Promise.all([
      import(FB_CDN+"firebase-app.js"), import(FB_CDN+"firebase-auth.js"), import(FB_CDN+"firebase-firestore.js")
    ]);
    const app=appM.initializeApp(FIREBASE_CONFIG);
    const auth=authM.getAuth(app);
    const db=dbM.getFirestore(app);
    FB={app,auth,db,api:{ ...authM, ...dbM }};
    return true;
  }catch(ex){ console.error("Firebase load failed",ex); return false; }
}

/* =========================================================
   ক্লিক সাউন্ড — Web Audio, কোনো অডিও ফাইল নেই, ডিফল্ট বন্ধ
   ========================================================= */
const SOUND_KEY = "deeo.sound";
let SOUND = false;
try { SOUND = localStorage.getItem(SOUND_KEY) === "on"; } catch (e) {}
let audioCtx = null;
function ensureAudio(){
  if (audioCtx) return audioCtx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try { audioCtx = new AC(); } catch (e) { audioCtx = null; }
  return audioCtx;
}
function clickPop(){
  if (!SOUND || reduce) return;                       // শব্দ বন্ধ বা অ্যানিমেশন কমানো থাকলে নীরব
  const ctx = ensureAudio(); if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();        // প্রথম ক্লিকেই জেস্টার আছে
  const now = ctx.currentTime;
  const osc = ctx.createOscillator(), gain = ctx.createGain(), filt = ctx.createBiquadFilter();
  osc.type = "sine";
  osc.frequency.setValueAtTime(620, now);
  osc.frequency.exponentialRampToValueAtTime(230, now + 0.07);   // নরম “পপ”
  filt.type = "lowpass"; filt.frequency.setValueAtTime(1800, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.13, now + 0.010);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.14);
}
function updateSoundBtn(){
  const b = $("sound-btn"); if (!b) return;
  const lbl = t(SOUND ? "শব্দ চালু" : "শব্দ বন্ধ");
  b.setAttribute("title", lbl); b.setAttribute("aria-label", lbl);
  b.setAttribute("aria-pressed", SOUND ? "true" : "false");
  b.classList.toggle("muted", !SOUND);
}
function bindSoundBtn(){
  const b = $("sound-btn"); if (!b) return;
  b.addEventListener("click", () => {
  SOUND = !SOUND;
  try { localStorage.setItem(SOUND_KEY, SOUND ? "on" : "off"); } catch (e) {}
  if (SOUND) { ensureAudio(); clickPop(); }           // চালু করার সঙ্গে সঙ্গে একটা হালকা নিশ্চিতকরণ শব্দ
  updateSoundBtn();
});
}
/* শুধু বোতাম ও লিংকে — hover-এ নয় */
document.addEventListener("click", e => {
  if (!SOUND || reduce) return;
  if (e.target.closest("#sound-btn")) return;
  if (e.target.closest("button, a")) clickPop();
}, true);

/* =========================================================
   কাস্টম কার্সার (§৭) — cursor:none + মাউস-ট্র্যাকিং এলিমেন্ট
   ১৪টি স্টেট assets/cursors/ থেকে; ছবি না মিললে ভায়োলেট ডট + সায়ান রিং
   ========================================================= */
const CURSOR_DIR = "assets/cursors/";
const CURSOR_STATES = {
  arrow:     { f: "arrow.png",        h: [5, 4] },
  link:      { f: "link.png",         h: [10, 3], hot: 1 },
  text:      { f: "text.png",         h: [16, 16] },
  precision: { f: "precision.png",    h: [16, 16] },
  move:      { f: "move.png",         h: [16, 16] },
  help:      { f: "help.png",         h: [5, 4] },
  unavail:   { f: "no-drop.png",      h: [16, 16] },
  ew:        { f: "ew-resize.png",    h: [16, 16] },
  ns:        { f: "ns-resize.png",    h: [16, 16] },
  north:     { f: "up-resize.png",    h: [15, 6] },
  nesw:      { f: "nesw-resize.png",  h: [16, 16] },
  nwse:      { f: "nwse-resize.png",  h: [16, 16] },
  busy:      { f: "busy.apng",        h: [16, 16], anim: 1 },
  working:   { f: "working.apng",     h: [16, 16], anim: 1 }
};
const cursorBox = document.createElement("div");
cursorBox.id = "cursor";
cursorBox.setAttribute("aria-hidden", "true");
cursorBox.innerHTML = '<img alt="" draggable="false"/><span class="dot"></span><span class="ring"></span>';
let cursorImg = null, cursorReady = false, curState = "arrow", curTarget = null;
let mouseX = -80, mouseY = -80, busyCount = 0;
let cursorRaf = 0, cursorPaintedSize = 0, cursorPosX = null, cursorPosY = null, cursorOn = false;
const cursorFiles = {};
const cursorSel = {
  text: 'input[type="text"],input[type="password"],input[type="email"],input[type="number"],input[type="search"],input[type="tel"],input[type="url"],textarea,[contenteditable="true"],#search,#faq-search',
  precision: 'input[type="color"],.sw-acc,#i-accents',
  unavail: '[disabled],.disabled,[aria-disabled="true"]',
  help: '#helper-fab,[data-cursor="help"]',
  link: 'a,button,select,summary,[role="button"],.nav-tool,.sw,.filter,.tab,.mini,.btn',
  move: '[data-drift],[data-cursor="move"]'
};
function cursorDetect(t){
  if (!t || !t.closest) return "arrow";
  if (busyCount > 0) return "busy";                                     // লোড চলছে — সবচেয়ে আগে
  const bl = document.getElementById("boot");
  if (bl && !bl.classList.contains("hide")) return "working";           // বুট লোডার চলছে
  const ov = t.closest("[data-cursor]");
  if (ov && CURSOR_STATES[ov.getAttribute("data-cursor")]) return ov.getAttribute("data-cursor");
  if (t.closest(cursorSel.unavail)) return "unavail";
  if (t.closest(cursorSel.precision)) return "precision";
  if (t.closest(cursorSel.text)) return "text";
  if (t.closest(cursorSel.help)) return "help";
  if (t.closest(cursorSel.link)) return "link";
  if (t.closest(cursorSel.move)) return "move";
  return "arrow";
}
function cursorSize(){ return innerWidth < 640 ? 26 : 32; }   // মোবাইলে একটু ছোট
/* APNG শুধু দরকার হলেই নামে — বুট/ডেটা লোড ছাড়া কখনো চলবে না; reduce থাকলে স্ট্যাটিকই থাকবে */
function cursorLoad(k){
  if (reduce || !CURSOR_STATES[k] || cursorFiles[k] !== undefined) return;
  const im = new Image();
  im.onload = () => { cursorFiles[k] = true; if (k === curState) cursorPaint(); };
  im.onerror = () => { cursorFiles[k] = false; };
  im.src = CURSOR_DIR + CURSOR_STATES[k].f;
}
function cursorPaint(){
  if (!cursorReady) return;
  const st = CURSOR_STATES[curState] || CURSOR_STATES.arrow;
  const size = cursorSize(), scale = size / 32;
  if (size !== cursorPaintedSize) { cursorPaintedSize = size; cursorBox.style.width = size + "px"; cursorBox.style.height = size + "px"; }
  if (st.anim) cursorLoad(curState);
  const src = CURSOR_DIR + st.f;
  if (cursorFiles[curState]) {
    cursorBox.classList.remove("fallback");
    if (cursorImg.getAttribute("src") !== src) cursorImg.setAttribute("src", src);   // সত্যিই বদলালেই বদলায়
  } else cursorBox.classList.add("fallback");
  const org = (st.h[0] * scale).toFixed(2) + "px " + (st.h[1] * scale).toFixed(2) + "px";
  if (cursorImg.style.transformOrigin !== org) cursorImg.style.transformOrigin = org;
  cursorBox.classList.toggle("hot", !!st.hot);
  cursorPlace();
}
function cursorPlace(){
  const st = CURSOR_STATES[curState] || CURSOR_STATES.arrow;
  const scale = cursorSize() / 32;
  const x = mouseX - st.h[0] * scale, y = mouseY - st.h[1] * scale;
  if (x === cursorPosX && y === cursorPosY) return;                                   // একই জায়গা — কিছু লেখা হয় না
  cursorPosX = x; cursorPosY = y;
  cursorBox.style.transform = "translate3d(" + x + "px," + y + "px,0)";
}
/* প্রতি ফ্রেমে একবার — প্রতি mousemove ইভেন্টে নয় */
function cursorApply(){
  if (!cursorReady) return;
  const next = cursorDetect(curTarget);
  if (next !== curState) { curState = next; cursorPaint(); }                           // অবস্থা বদলালেই পেইন্ট
  else cursorPlace();
}
function cursorTick(){ if (cursorRaf || !cursorReady) return; cursorRaf = requestAnimationFrame(() => { cursorRaf = 0; cursorApply(); }); }
function cursorHover(t){ curTarget = t; cursorTick(); }
/* পেজ লোডের সময় ডিফল্ট কার্সারই থাকে; প্রথম মাউস-অবস্থান জানা গেলে তবেই cursor:none হয় */
function cursorActivate(){ if (cursorOn || !cursorReady) return; cursorOn = true; document.body.classList.add("cursor-on"); }
/* ---- মোডাল ও কার্সার ---- <dialog> ব্রাউজারের টপ-লেয়ারে ওঠে, তাই কার্সার এলিমেন্টটিকেও খোলা মোডালের ভেতরে নিতে হয় */
const cursorDialogStack = [];                                   // যে ক্রমে খোলা হয়েছে — DOM ক্রম নয়, z-order
function cursorHostSync(){
  if (!cursorReady) return;
  for (let i = cursorDialogStack.length - 1; i >= 0; i--) if (!cursorDialogStack[i].open) cursorDialogStack.splice(i, 1);
  const host = cursorDialogStack[cursorDialogStack.length - 1] || document.body;   // সবচেয়ে উপরের খোলা স্তর
  if (cursorBox.parentElement !== host) host.appendChild(cursorBox);                // সব বন্ধ হলে আবার পেজের স্তরে
}
(function cursorDialogHooks(){
  if (!window.HTMLDialogElement) return;
  const D = HTMLDialogElement.prototype, prev = { sm: D.showModal, sh: D.show, cl: D.close };
  const push = d => { const i = cursorDialogStack.indexOf(d); if (i >= 0) cursorDialogStack.splice(i, 1); cursorDialogStack.push(d); cursorHostSync(); };
  D.showModal = function(){ prev.sm.apply(this, arguments); push(this); };
  D.show = function(){ prev.sh.apply(this, arguments); push(this); };
  D.close = function(){ prev.cl.apply(this, arguments); const i = cursorDialogStack.indexOf(this); if (i >= 0) cursorDialogStack.splice(i, 1); cursorHostSync(); };
  document.addEventListener("close", cursorHostSync, true);                // Esc / form দিয়ে বন্ধ হলেও ধরা পড়ে
})();
function initCursor(){
  if (!matchMedia("(pointer:fine)").matches) return;          // টাচ/হাইব্রিড ডিভাইসে ডিফল্ট কার্সারই থাকবে
  document.body.appendChild(cursorBox);
  cursorImg = cursorBox.querySelector("img");
  if (reduce) cursorBox.classList.add("no-anim");
  Object.keys(CURSOR_STATES).forEach(k => {                   // স্ট্যাটিক PNG আগে থেকেই, অ্যানিমেটেড পরে
    if (CURSOR_STATES[k].anim) return;                          // APNG বুট/লোডের সময়ই চাই, আগে লোড করবে না
    const im = new Image();
    im.onload = () => { cursorFiles[k] = true; if (k === curState) cursorPaint(); };   // লোড শেষে সঙ্গে সঙ্গে ছবি বসাও
    im.onerror = () => { cursorFiles[k] = false; if (k === curState) cursorPaint(); };
    im.src = CURSOR_DIR + CURSOR_STATES[k].f;
  });
  cursorReady = true;
  addEventListener("mousemove", e => {
    mouseX = e.clientX; mouseY = e.clientY; curTarget = e.target;
    cursorActivate();                                                       // প্রথম অবস্থান জানা গেলেই কার্সার চালু
    if (!cursorBox.classList.contains("show")) cursorBox.classList.add("show");
    cursorTick();
  }, { passive: true });
  document.documentElement.addEventListener("mouseleave", () => {                       // সাইটের বাইরে — ডিফল্ট কার্সার ফিরে আসে
    cursorBox.classList.remove("show"); document.body.classList.remove("cursor-on"); cursorOn = false;
    if (cursorRaf) { cancelAnimationFrame(cursorRaf); cursorRaf = 0; }
  });
  document.documentElement.addEventListener("mouseenter", () => {
    if (!cursorReady) return; cursorActivate(); cursorBox.classList.add("show"); cursorPaint();
  });
  addEventListener("resize", cursorPaint, { passive: true });
  cursorPaint();
}
/* ব্যস্ত থাকলে কার্সার স্টেট */
function cursorBusy(on){ busyCount = Math.max(0, busyCount + (on ? 1 : -1)); if (!curTarget) curTarget = document.body; cursorTick(); }
function cursorWrapDB(){
  Object.keys(DB).forEach(k => {
    const orig = DB[k]; if (typeof orig !== "function") return;
    DB[k] = function(){ const r = orig.apply(DB, arguments);
      if (r && typeof r.then === "function") { cursorBusy(true); return r.finally(() => cursorBusy(false)); }
      return r; };
  });
}

/* =========================================================
   শেয়ার্ড বুট — প্রতিটি পেজ নিজের boot() থেকে এটি ডাকে
   ========================================================= */
async function bootShared(){
  document.documentElement.lang = LANG;
  attachI18nObserver(); bindCommon(); bindLangBtn(); bindSoundBtn();
  initCursor();
  if (isConfigured()) { const ok = await loadFirebase(); MODE = ok ? "fs" : "ls"; }
  await new Promise(res => Auth.onChange(res));
  await loadData();
  /* সাইন-ইন থাকলে নিজের রিঅ্যাকশন মনে রাখতে Activity লোড + সব প্রকাশিত আইটেমের পরিসংখ্যান */
  if(Auth.user){ try{ await Activity.load(); }catch(e){} }
  try{ await Stats.loadMany(S.items.filter(i=>i.published).map(i=>i.id)); }catch(e){}
  initStatsUI();
  applyAutoLang();
  applyI18n(document.body);
  updateLangBtn();
  cursorWrapDB();
}

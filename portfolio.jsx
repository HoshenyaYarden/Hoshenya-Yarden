import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Instagram, Facebook, Youtube, Linkedin, Globe, Mail,
  Pencil, X, Plus, Trash2, Check, Camera, Loader2
} from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');`;

const DEFAULT_META = {
  name: "שם הצלם/ת",
  tagline: "צילום אנשים ורגעים",
  about:
    "כתבו כאן כמה משפטים על עצמכם: מה מרכז את העבודה שלכם, איזה סוג צילום אתם הכי אוהבים, ואיפה אפשר לפגוש אתכם. אפשר לערוך את הטקסט הזה בכל רגע דרך מצב העריכה.",
  location: "תל אביב",
  since: "2022",
  email: "you@example.com",
  socials: [
    { platform: "instagram", url: "" },
    { platform: "facebook", url: "" },
  ],
};

const EMPTY_SLOTS = 6;

const SOCIAL_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  website: Globe,
};

const SOCIAL_LABELS = {
  instagram: "אינסטגרם",
  facebook: "פייסבוק",
  youtube: "יוטיוב",
  linkedin: "לינקדאין",
  website: "אתר",
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function useStorage() {
  const [ready, setReady] = useState(false);
  const [meta, setMeta] = useState(DEFAULT_META);
  const [gallery, setGallery] = useState([]); // [{id, caption, category, url}]
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        let m = DEFAULT_META;
        let g = [];
        try {
          const metaRes = await window.storage.get("site-meta", false);
          if (metaRes?.value) m = { ...DEFAULT_META, ...JSON.parse(metaRes.value) };
        } catch (e) {}
        try {
          const galRes = await window.storage.get("gallery-index", false);
          if (galRes?.value) g = JSON.parse(galRes.value);
        } catch (e) {}
        setMeta(m);
        setGallery(g);
      } catch (e) {
        setError("לא הצלחנו לטעון את הנתונים השמורים.");
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const saveMeta = useCallback(async (next) => {
    setMeta(next);
    try {
      await window.storage.set("site-meta", JSON.stringify(next), false);
    } catch (e) {
      setError("שמירת הפרטים נכשלה.");
    }
  }, []);

  const saveGallery = useCallback(async (next) => {
    setGallery(next);
    try {
      await window.storage.set("gallery-index", JSON.stringify(next), false);
    } catch (e) {
      setError("שמירת הגלריה נכשלה.");
    }
  }, []);

  return { ready, meta, gallery, saveMeta, saveGallery, error, setError };
}

export default function Portfolio() {
  const { ready, meta, gallery, saveMeta, saveGallery, error, setError } = useStorage();
  const [editing, setEditing] = useState(false);
  const [draftMeta, setDraftMeta] = useState(meta);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => setDraftMeta(meta), [meta]);
  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 150);
    return () => clearTimeout(t);
  }, []);

  const total = gallery.length;

  const handleAddFiles = async (files) => {
    const items = [];
    for (const file of Array.from(files)) {
      const dataUrl = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      items.push({ id: uid(), url: dataUrl, caption: "", category: "" });
    }
    await saveGallery([...gallery, ...items]);
  };

  const updateItem = (id, patch) => {
    saveGallery(gallery.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id) => {
    saveGallery(gallery.filter((it) => it.id !== id));
  };

  const commitMeta = () => saveMeta(draftMeta);

  const updateSocial = (idx, url) => {
    const next = { ...draftMeta, socials: draftMeta.socials.map((s, i) => (i === idx ? { ...s, url } : s)) };
    setDraftMeta(next);
    saveMeta(next);
  };

  const heroUrl = gallery[0]?.url;

  if (!ready) {
    return (
      <div style={{ background: "#121110", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="#928C7E" size={28} />
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ background: "#121110", color: "#F2EEE6", fontFamily: "'Inter', sans-serif", minHeight: "100vh", position: "relative" }}>
      <style>{`
        ${FONT_IMPORT}
        .oswald { font-family: 'Oswald', sans-serif; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        .grain::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.05;
          z-index: 50;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .develop { animation: develop 1.1s ease-out both; }
        @keyframes develop {
          0% { opacity: 0; filter: contrast(0.6) brightness(0.5); }
          100% { opacity: 1; filter: contrast(1) brightness(1); }
        }
        .frame-tile { transition: transform 0.35s ease, filter 0.35s ease; }
        .frame-tile:hover { transform: translateY(-3px); }
        .frame-tile:hover .caption-overlay { opacity: 1; }
        .caption-overlay { opacity: 0; transition: opacity 0.25s ease; }
        input.gt, textarea.gt {
          background: transparent;
          border: 1px solid #3A362F;
          color: #F2EEE6;
          padding: 6px 10px;
          border-radius: 2px;
          font-family: inherit;
          width: 100%;
        }
        input.gt:focus, textarea.gt:focus { outline: none; border-color: #C1442D; }
        .fab { transition: background 0.2s ease, transform 0.2s ease; }
        .fab:hover { transform: scale(1.06); }
        ::selection { background: #C1442D; color: #F2EEE6; }
      `}</style>

      <div className="grain" style={{ position: "fixed", inset: 0, pointerEvents: "none" }} />

      {/* ERROR TOAST */}
      {error && (
        <div style={{ position: "fixed", top: 16, insetInlineStart: 16, zIndex: 60, background: "#1B1917", border: "1px solid #C1442D", padding: "8px 14px", borderRadius: 4 }} className="mono">
          <span style={{ fontSize: 13 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ marginInlineStart: 10, color: "#928C7E" }}><X size={14} /></button>
        </div>
      )}

      {/* HERO */}
      <section style={{ position: "relative", height: "92vh", minHeight: 480, overflow: "hidden", borderBottom: "1px solid #3A362F" }}>
        {heroUrl ? (
          <img
            src={heroUrl}
            alt=""
            className={heroLoaded ? "develop" : ""}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.15) contrast(1.05)" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg,#1B1917,#121110)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Camera color="#3A362F" size={64} />
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(18,17,16,0.15) 0%, rgba(18,17,16,0.75) 100%)" }} />

        <div className="mono" style={{ position: "absolute", top: 20, insetInlineStart: 24, fontSize: 12, letterSpacing: 2, color: "#C1442D" }}>
          {String(total).padStart(2, "0")} FRAMES
        </div>

        <div style={{ position: "absolute", bottom: 48, insetInlineStart: 24, insetInlineEnd: 24 }}>
          {editing ? (
            <input className="gt oswald" style={{ fontSize: 44, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}
              value={draftMeta.name} onChange={(e) => setDraftMeta({ ...draftMeta, name: e.target.value })} onBlur={commitMeta} />
          ) : (
            <h1 className="oswald" style={{ fontSize: 44, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>{meta.name}</h1>
          )}
          {editing ? (
            <input className="gt mono" style={{ fontSize: 14, color: "#928C7E", marginTop: 8 }}
              value={draftMeta.tagline} onChange={(e) => setDraftMeta({ ...draftMeta, tagline: e.target.value })} onBlur={commitMeta} />
          ) : (
            <p className="mono" style={{ fontSize: 14, color: "#D8D2C4", marginTop: 6, letterSpacing: 0.5 }}>{meta.tagline}</p>
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section style={{ maxWidth: 920, margin: "0 auto", padding: "72px 24px", display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
        <div className="mono" style={{ fontSize: 12, color: "#C1442D", letterSpacing: 2 }}>אודות</div>
        {editing ? (
          <textarea className="gt" rows={4} style={{ fontSize: 17, lineHeight: 1.7 }}
            value={draftMeta.about} onChange={(e) => setDraftMeta({ ...draftMeta, about: e.target.value })} onBlur={commitMeta} />
        ) : (
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "#E5E1D6", maxWidth: 680 }}>{meta.about}</p>
        )}
        <div className="mono" style={{ fontSize: 12, color: "#928C7E", display: "flex", gap: 18, flexWrap: "wrap" }}>
          {editing ? (
            <>
              <span>פעיל/ה מאז <input className="gt" style={{ display: "inline", width: 70 }} value={draftMeta.since} onChange={(e) => setDraftMeta({ ...draftMeta, since: e.target.value })} onBlur={commitMeta} /></span>
              <span>מבוסס/ת ב<input className="gt" style={{ display: "inline", width: 100 }} value={draftMeta.location} onChange={(e) => setDraftMeta({ ...draftMeta, location: e.target.value })} onBlur={commitMeta} /></span>
            </>
          ) : (
            <>
              <span>פעיל/ה מאז {meta.since}</span>
              <span>·</span>
              <span>מבוסס/ת ב{meta.location}</span>
            </>
          )}
        </div>
      </section>

      {/* GALLERY */}
      <section style={{ borderTop: "1px solid #3A362F" }}>
        <div style={{ padding: "40px 24px 12px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 className="oswald" style={{ fontSize: 22, textTransform: "uppercase", letterSpacing: 2, margin: 0 }}>גיליון עבודות</h2>
          {editing && (
            <button onClick={() => fileInputRef.current?.click()} className="mono fab"
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#C1442D", color: "#F2EEE6", border: "none", padding: "8px 14px", borderRadius: 3, fontSize: 12, cursor: "pointer" }}>
              <Plus size={14} /> הוספת תמונות
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files?.length && handleAddFiles(e.target.files)} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {(gallery.length ? gallery : Array.from({ length: EMPTY_SLOTS }).map((_, i) => ({ id: `empty-${i}`, empty: true }))).map((item, idx) => {
            const frameNo = total - idx;
            return (
              <div key={item.id} className="frame-tile" style={{ position: "relative", aspectRatio: "4/5", borderInlineEnd: "1px solid #3A362F", borderBottom: "1px solid #3A362F", overflow: "hidden" }}>
                {item.empty ? (
                  <div onClick={() => editing && fileInputRef.current?.click()} style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: editing ? "pointer" : "default", color: "#3A362F" }}>
                    <Camera size={22} />
                    <span className="mono" style={{ fontSize: 11 }}>ריק — הוסיפו תמונה</span>
                  </div>
                ) : (
                  <>
                    <img src={item.url} alt={item.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.1)" }} />
                    <div className="caption-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(18,17,16,0) 45%, rgba(18,17,16,0.9) 100%)", display: "flex", alignItems: "flex-end", padding: 12 }}>
                      {editing ? (
                        <input className="gt mono" style={{ fontSize: 12 }} placeholder="כיתוב"
                          value={item.caption} onChange={(e) => updateItem(item.id, { caption: e.target.value })} />
                      ) : (
                        item.caption && <span className="mono" style={{ fontSize: 12, color: "#F2EEE6" }}>{item.caption}</span>
                      )}
                    </div>
                    <div className="mono" style={{ position: "absolute", top: 8, insetInlineStart: 8, fontSize: 11, color: "#C1442D", background: "rgba(18,17,16,0.55)", padding: "2px 6px" }}>
                      #{String(frameNo).padStart(2, "0")}
                    </div>
                    {editing && (
                      <button onClick={() => removeItem(item.id)} style={{ position: "absolute", top: 8, insetInlineEnd: 8, background: "rgba(18,17,16,0.65)", border: "none", color: "#F2EEE6", borderRadius: 3, padding: 4, cursor: "pointer" }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CONTACT */}
      <section style={{ borderTop: "1px solid #3A362F", padding: "56px 24px 80px", textAlign: "center" }}>
        <div className="mono" style={{ fontSize: 12, color: "#C1442D", letterSpacing: 2, marginBottom: 14 }}>יצירת קשר</div>
        {editing ? (
          <input className="gt mono" style={{ maxWidth: 320, margin: "0 auto 20px", textAlign: "center" }}
            value={draftMeta.email} onChange={(e) => setDraftMeta({ ...draftMeta, email: e.target.value })} onBlur={commitMeta} />
        ) : (
          <a href={`mailto:${meta.email}`} className="oswald" style={{ fontSize: 24, color: "#F2EEE6", textDecoration: "none", display: "block", marginBottom: 24 }}>
            {meta.email}
          </a>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
          {draftMeta.socials.map((s, i) => {
            const Icon = SOCIAL_ICONS[s.platform] || Globe;
            return editing ? (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon size={16} color="#928C7E" />
                <input className="gt mono" style={{ width: 170, fontSize: 12 }} placeholder={`${SOCIAL_LABELS[s.platform]} URL`}
                  value={s.url} onChange={(e) => updateSocial(i, e.target.value)} />
              </div>
            ) : (
              s.url && (
                <a key={i} href={s.url} target="_blank" rel="noreferrer" style={{ color: "#D8D2C4" }}>
                  <Icon size={20} />
                </a>
              )
            );
          })}
        </div>

        <div className="mono" style={{ fontSize: 11, color: "#3A362F", marginTop: 56 }}>© {new Date().getFullYear()} {meta.name}</div>
      </section>

      {/* EDIT TOGGLE */}
      <button
        className="fab"
        onClick={() => setEditing((v) => !v)}
        style={{
          position: "fixed", bottom: 22, insetInlineEnd: 22, zIndex: 55,
          background: editing ? "#C1442D" : "#1B1917", border: "1px solid #3A362F",
          color: "#F2EEE6", width: 48, height: 48, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}
        title={editing ? "סיום עריכה" : "עריכת האתר"}
      >
        {editing ? <Check size={18} /> : <Pencil size={16} />}
      </button>
    </div>
  );
}

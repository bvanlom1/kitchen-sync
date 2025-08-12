import React, { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Plus, Minus, Trash2, Barcode, Loader2, CheckCircle2, XCircle, Bell, CookingPot, RefreshCw, Download, ShoppingCart, ListChecks, Sparkles, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabase";

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl shadow-md p-4 bg-white border border-gray-200 ${className}`}>{children}</div>
);
const SectionTitle = ({ children }) => <h2 className="text-lg font-semibold tracking-tight mb-2">{children}</h2>;
const Pill = ({ children, className = "" }) => <span className={`px-2 py-0.5 rounded-full text-xs border ${className}`}>{children}</span>;

const DEFAULT_SHELFLIFE = { produce:5, dairy:7, meat:3, seafood:2, pantry:365, frozen:120, bakery:3, beverage:180, other:30 };
const addDays=(d,days)=>{const dt=new Date(d);dt.setDate(dt.getDate()+days);return dt;};
const fmt=(d)=>new Date(d).toLocaleDateString();

const SIZE_UNITS = ["ct","g","kg","ml","L","oz","lb","cup","tbsp","tsp"];

function SizePicker({ onConfirm }) {
  const [val, setVal] = useState("");
  const [unit, setUnit] = useState("ct");
  return (
    <div className="p-3 border rounded-xl bg-white shadow-sm">
      <div className="text-sm font-medium mb-2">Specify package size</div>
      <div className="flex items-center gap-2">
        <input type="number" step="0.01" value={val} onChange={e=>setVal(e.target.value)} placeholder="e.g., 64" className="px-3 py-2 border rounded-xl w-28"/>
        <select value={unit} onChange={e=>setUnit(e.target.value)} className="px-3 py-2 border rounded-xl">
          {SIZE_UNITS.map(u=><option key={u} value={u}>{u}</option>)}
        </select>
        <button onClick={()=>onConfirm(Number(val)||0, unit)} className="px-3 py-2 rounded-xl bg-gray-900 text-white text-sm">Save</button>
      </div>
    </div>
  );
}

const keywords=(s)=> s.toLowerCase().replace(/olive oil/g,'olive').split(/[^a-z0-9]+/).filter(Boolean);
const play = (path) => { const a = new Audio(path); a.play().catch(()=>{}); };

// --- Barcode product lookup ---
async function lookupByBarcode(barcode) {
  try {
    const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    if (!r.ok) throw new Error("Network error");
    const data = await r.json();
    if (data && data.product) {
      const p = data.product;
      return {
        gtin: barcode,
        name: p.product_name || p.generic_name || "Unknown product",
        brand: (p.brands || "").split(",")[0] || "",
        quantity: p.quantity || "",
        category: (p.categories_tags && p.categories_tags[0]?.split(":")[1]) || "other",
      };
    }
  } catch {}
  return null;
}

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; } catch { return initial; }
  });
  useEffect(()=>{ try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }, [key, state]);
  return [state, setState];
}

function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setPromptEvent(e); setVisible(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  if (!visible || !promptEvent) return null;
  return (
    <div className="fixed bottom-3 inset-x-0 px-3 z-50">
      <div className="mx-auto max-w-md bg-white border rounded-2xl shadow-lg p-3 flex items-center gap-3">
        <img src="/icons/icon-96.png" alt="" className="w-8 h-8 rounded-lg" />
        <div className="text-sm">
          <div className="font-semibold">Install Pantry?</div>
          <div className="text-gray-500">Add to your home screen for offline use.</div>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="px-3 py-1.5 rounded-xl border" onClick={() => setVisible(false)}>Not now</button>
          <button className="px-3 py-1.5 rounded-xl bg-[var(--brand)] text-white inline-flex items-center gap-1"
            onClick={async () => { await promptEvent.prompt(); setVisible(false); }}>
            <Download className="w-4 h-4" /> Install
          </button>
        </div>
      </div>
    </div>
  );
}


function UseIngredientsModal({ recipe, onUse, onClose }) {
  const [checked, setChecked] = useState(new Set());
  if (!recipe) return null;
  const ing = [...(recipe.usedIngredients||[]),(recipe.missedIngredients||[])].map(x=>x.name.toLowerCase());
  return (
    <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center sm:justify-center p-3 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-md">
        <div className="text-lg font-semibold mb-2">What did you use?</div>
        <div className="max-h-64 overflow-auto space-y-1 mb-3">
          {Array.from(new Set(ing)).map((name) => (
  <label key={name} className="flex items-center gap-2 text-sm">
    <input
      type="checkbox"
      checked={checked.has(name)}
      onChange={(e) => {
        const next = new Set(checked);
        if (e.target.checked) next.add(name);
        else next.delete(name);
        setChecked(next);
      }}
    />
    <span className="capitalize">{name}</span>
  </label>
))}`); }
    for (const u of singleUnlocks.slice(0,5)) { const key = u.ingredient.toLowerCase(); if (byName.has(key)) byName.get(key).reasons.push(`unlocks ${u.unlocks} rec.`); }
    for (const p of pairUnlocks.slice(0,5)) { for (const ing of p.pair) { const key = ing.toLowerCase(); if (byName.has(key)) byName.get(key).reasons.push(`pair ${p.pair.join('+')} → ${p.unlocks}`); } }
    // Budget filter: greedy by unlock weight/price
    const scored = entries.map(e => {
      const unlocks = (singleUnlocks.find(s => s.ingredient===e.name)?.unlocks || 0)
        + pairUnlocks.filter(p => p.pair.includes(e.name)).reduce((a,b)=>a+b.unlocks,0);
      const weight = (1 + unlocks) / Math.max(1, e.price);
      return { ...e, unlocks, weight, subtotal: e.price * e.qty };
    }).sort((a,b)=> b.weight - a.weight);
    let sum = 0; const kept = [];
    for (const it of scored) {
      if (sum + it.subtotal <= Number(weeklyBudget)) { kept.push(it); sum += it.subtotal; }
    }
    return { kept, total: sum, budget: Number(weeklyBudget) };
  }
  const shopping = useMemo(buildShoppingList, [lowOrExpiring, singleUnlocks, pairUnlocks, weeklyBudget]);

  // Share & Supabase sync
  function shareShoppingList() {
    const lines = shopping.kept.map(i => `• ${i.name} x${i.qty} ($${i.price})`).join("\n");
    const text = `Pantry shopping list (budget $${shopping.budget}, total $${shopping.total}):\n${lines}`;
    if (navigator.share) navigator.share({ title: "Pantry Shopping List", text });
    else { navigator.clipboard.writeText(text); alert("Copied shopping list to clipboard!"); }
  }

  async function syncToSupabase() {
    if (!supabase) return alert("Supabase env not set");
    // delete existing for group then insert fresh
    await supabase.from("shopping_list").delete().eq("user_group", household);
    const rows = shopping.kept.map(i => ({ user_group: household, name: i.name, qty: i.qty, reasons: i.reasons || [], checked: false }));
    const { error } = await supabase.from("shopping_list").insert(rows);
    if (error) alert("Sync error: " + error.message); else alert("Synced to shared list!");
  }

  // Weekly Plan generator
  function generateWeeklyPlan() {
    // Pick top recipes that have minimal missing ingredients to match dinners count
    const candidates = (apiResults || []).slice().sort((a,b) => (a.missedIngredientCount||0)-(b.missedIngredientCount||0));
    const plan = candidates.slice(0, Number(dinners));
    const lines = plan.map(p => `• ${p.title} (need ${p.missedIngredientCount})`).join("\n");
    const text = `Weekly plan (${dinners} dinners):\n${lines}`;
    if (navigator.share) navigator.share({ title: "Weekly Meal Plan", text });
    else { navigator.clipboard.writeText(text); alert("Weekly plan copied!"); }
    play("/sounds/success.wav");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <InstallPrompt />
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <img src="/icons/icon-96.png" alt="" className="w-8 h-8 rounded-lg" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pantry</h1>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={simpleMode} onChange={e=>setSimpleMode(e.target.checked)} /> Simple</label>
            <button onClick={resetAll} className="px-3 py-1.5 rounded-xl border bg-white hover:bg-gray-50 text-sm inline-flex items-center gap-1">
              <RefreshCw className="w-4 h-4"/> Reset
            </button>
          </div>
        </header>

        <AnimatePresence>
          {notif && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Card className="bg-green-50 border-green-200 mb-4">
                <div className="flex items-center gap-2 text-green-900"><CheckCircle2 className="w-5 h-5"/> {notif}</div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {useModalRecipe && <UseIngredientsModal recipe={useModalRecipe} onUse={deductForIngredients} onClose={closeUseModal} />}
        
        {items.length>0 && (
          <div className="mb-4">
            <Card>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Weekly Reality Check</div>
                <button className="text-sm underline" onClick={()=>{
                  const lows = items.filter(x=> (x.qty<=1) || (new Date(x.expiry)<=addDays(new Date(),7)));
                  if (lows.length===0) return alert("Looks good! 👍");
                  const names = lows.map(x=>x.name).join(", ");
                  if (confirm(`Still have these?\\n${names}\\n\\nTap OK to mark any that are actually out.`)) {
                    // naive: mark 0 remaining for first 2 as example; real UI would be a checklist
                    const ids = lows.slice(0,2).map(x=>x.id);
                    setItems(prev=>prev.map(x=> ids.includes(x.id)?{...x, remaining:0, qty:0}:x));
                  }
                }}>Start</button>
              </div>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            {pendingSizeFor && (
              <Card>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Specify size for new item</div>
                  <button className="text-sm underline" onClick={()=>setPendingSizeFor(null)}>Skip</button>
                </div>
                <SizePicker onConfirm={(val,unit)=>{ setItems(prev=>prev.map(x=>x.id===pendingSizeFor?{...x,sizeValue:val,sizeUnit:unit,remaining:val||x.remaining}:x)); setPendingSizeFor(null); }} />
              </Card>
            )}
            <BarcodeScanner onDetected={addByBarcode} />

            <Card>
              <SectionTitle>Staples</SectionTitle>
              <div className="grid gap-2">
                {staples.length===0 && <div className="text-sm text-gray-500">No staples yet.</div>}
                {staples.slice(0,8).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-xl border">
                    <div className="font-medium truncate">{s.name}</div>
                    <div className="text-xs text-gray-500">Remaining: {Math.round(s.remaining ?? s.qty)} {s.sizeUnit||s.unit}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between gap-2 mb-3">
                <SectionTitle><span className="inline-flex items-center gap-2"><Barcode className="w-5 h-5"/> Manual Add</span></SectionTitle>
              </div>
              <form onSubmit={addManual} className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <input name="name" placeholder="Item name (e.g., Milk)" className="col-span-2 md:col-span-2 px-3 py-2 border rounded-xl" />
                <input name="brand" placeholder="Brand" className="px-3 py-2 border rounded-xl" />
                <input name="gtin" placeholder="Barcode (optional)" className="px-3 py-2 border rounded-xl" />
                <select name="category" className="px-3 py-2 border rounded-xl">
                  {Object.keys(DEFAULT_SHELFLIFE).map((k) => (<option key={k} value={k}>{k}</option>))}
                </select>
                <input name="qty" type="number" min="1" step="1" defaultValue={1} className="px-3 py-2 border rounded-xl" />
                <input name="unit" placeholder="unit (e.g., ct, lb)" className="px-3 py-2 border rounded-xl" />
                <input name="shelfDays" type="number" placeholder="shelf days" className="px-3 py-2 border rounded-xl" />
                <input name="notedQuantity" placeholder="label (e.g., 2% milk)" className="px-3 py-2 border rounded-xl" />
                <input name="sizeValue" type="number" step="0.01" placeholder="size (e.g., 64)" className="px-3 py-2 border rounded-xl" />
                <select name="sizeUnit" className="px-3 py-2 border rounded-xl">{SIZE_UNITS.map(u=>(<option key={u} value={u}>{u}</option>))}</select>
                <button type="submit" className="col-span-2 md:col-span-1 px-3 py-2 rounded-xl bg-gray-900 text-white inline-flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <Plus className="w-4 h-4"/>} Add
                </button>
              </form>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <SectionTitle>Inventory</SectionTitle>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="px-3 py-1.5 border rounded-xl w-48" />
              </div>
              <div className="mt-3 grid gap-2">
                {filtered.length === 0 && (<div className="text-sm text-gray-500">No items yet. Scan a barcode or add manually.</div>)}
                {filtered.map((i) => (
                  <motion.div layout key={i.id} className="flex items-center justify-between p-2 rounded-xl border" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{i.name} {i.brand ? <span className="text-gray-500">· {i.brand}</span> : null}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <Pill className="border-gray-200">{i.category}</Pill>
                        <span>Added {fmt(i.addedAt)}</span>
                        <span>Expires {fmt(i.expiry)}</span>
                        {i.notedQuantity && <span>Size: {i.notedQuantity}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="range" min="0" max="100" step="25" title="Quick deduct" onChange={(e)=>{
                        const pct = Number(e.target.value);
                        setItems(prev=>prev.map(x=>x.id===i.id?{...x, remaining: Math.max(0, (x.remaining||x.qty) * (1 - pct/100))}:x));
                      }} className="w-24" />
                      <button onClick={() => adjustQty(i.id, -1)} className="p-1.5 rounded-lg border"><Minus className="w-4 h-4"/></button>
                      <span className="w-8 text-center tabular-nums">{i.qty}</span>
                      <button onClick={() => adjustQty(i.id, 1)} className="p-1.5 rounded-lg border"><Plus className="w-4 h-4"/></button>
                      <button onClick={() => removeItem(i.id)} className="p-1.5 rounded-lg border text-red-600"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <SectionTitle><span className="inline-flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> Next Shop</span></SectionTitle>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm"><Wallet className="w-4 h-4"/> Budget: ${weeklyBudget}</div>
                <input type="range" min="20" max="250" value={weeklyBudget} onChange={(e)=>setWeeklyBudget(Number(e.target.value))} className="w-full" />
                <div className="text-xs text-gray-500">We’ll prioritize ingredients that unlock the most meals per dollar.</div>
              </div>
            </Card>

            <Card>
              <SectionTitle><span className="inline-flex items-center gap-2"><Bell className="w-5 h-5"/> Low & Expiring</span></SectionTitle>
              <div className="space-y-2">
                {/* Kept simple visually; influences the Shopping List below */}
                {items.filter((i)=>i.qty<=1 || new Date(i.expiry)<=addDays(new Date(),7)).slice(0,6).map(i=>(
                  <div key={i.id} className="flex items-center justify-between p-2 rounded-xl border">
                    <div className="min-w-0"><div className="font-medium truncate">{i.name}</div><div className="text-xs text-gray-500">Qty {i.qty} • Exp {fmt(i.expiry)}</div></div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <SectionTitle><span className="inline-flex items-center gap-2"><CookingPot className="w-5 h-5"/> Recipe Ideas</span></SectionTitle>
              <div className="space-y-2">
                {apiBusy && <div className="text-sm text-gray-500">Fetching recipes…</div>}
                {!apiBusy && apiError && <div className="text-sm text-red-600">Recipe API error: {apiError}</div>}
                {!apiBusy && !apiError && apiResults.slice(0,5).map((r) => (
                  <div key={r.id} className="p-2 rounded-xl border hover:bg-gray-50">
                    <a href={`https://spoonacular.com/recipes/${encodeURIComponent(r.title)}-${r.id}`} target="_blank" rel="noreferrer" className="block">

                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-gray-500">Have {r.usedIngredientCount} • Missing {r.missedIngredientCount}</div>
                    </a>
                    <div className="mt-2">
                      <button onClick={()=>openUseModal(r)} className="px-2 py-1 rounded-lg border text-xs">Mark cooked</button>
                    </div>
                  </div>
                ))}
                {!SPOONACULAR_KEY && <div className="text-xs text-gray-400 mt-2">Add a Spoonacular key in <code>.env</code> to enable live recipes.</div>}
                {/* Weekly Plan */}
                <div className="mt-3 p-2 rounded-xl bg-slate-50 border">
                  <div className="text-sm font-medium mb-1">Weekly Plan</div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    Dinners: <input type="number" min="2" max="7" value={dinners} onChange={e=>setDinners(Number(e.target.value))} className="w-16 px-2 py-1 border rounded-lg" />
                    <button onClick={generateWeeklyPlan} className="px-3 py-1.5 rounded-xl bg-[var(--brand)] text-white inline-flex items-center gap-1"><Sparkles className="w-4 h-4"/> Plan</button>
                  </div>
                  <div className="text-xs text-gray-500">We’ll propose quick-win dinners using what you already have.</div>
                </div>
              </div>
            </Card>

            {!simpleMode && (
              <Card>
                <SectionTitle><span className="inline-flex items-center gap-2"><ListChecks className="w-5 h-5"/> Shopping List</span></SectionTitle>
                <div className="space-y-2">
                  {shopping.kept.length === 0 && <div className="text-sm text-gray-500">Increase budget or scan more items to see recommendations.</div>}
                  {shopping.kept.map(i => (
                    <motion.div key={i.name} className="p-2 rounded-xl border flex items-center justify-between" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                      <div className="capitalize font-medium">{i.name}</div>
                      <div className="text-xs text-gray-600">x{i.qty} • ${i.price} ea</div>
                    </motion.div>
                  ))}
                  <div className="text-sm font-medium">Total: ${shopping.total} / ${shopping.budget}</div>
                  <div className="flex gap-2">
                    <button onClick={shareShoppingList} className="px-3 py-1.5 rounded-xl border bg-white hover:bg-gray-50 text-sm">Share</button>
                    <button onClick={syncToSupabase} className="px-3 py-1.5 rounded-xl bg-gray-900 text-white text-sm">Sync</button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        <footer className="mt-6 text-xs text-gray-500">
          <p>Notes: Budget suggestions use rough defaults; connect store APIs later for accuracy. Enable Supabase env vars to share lists across devices.</p>
        </footer>
      </div>
    </div>
  );
}

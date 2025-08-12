# Pantry (PWA)
Installable & offline-ready pantry tracker.
## Dev
npm install
npm run dev
## Deploy
Push to GitHub → Vercel New Project → Deploy → Add to Home Screen on Android.

---

## Recipe API (Spoonacular)
1. Create `.env` (copy from `.env.example`) and add:
   ```
   VITE_SPOONACULAR_KEY=YOUR_KEY
   ```
2. Restart dev server.
3. The app will fetch real recipes based on your pantry and compute
   *Buy X → unlock Y recipes* suggestions.


## Shopping List & Two-Item Unlocks
- **Shopping List** auto-combines low/expiring refills (aims for par=2) plus top unlock ingredients.
- **Two-item unlocks** shows the best ingredient pairs that unlock the most recipes.


## Simple Mode, Fast Fix, Next Shop
- **Simple Mode** hides advanced panels by default for a cleaner first-use experience.
- **Fast Fix** shows quick-win recipes with ≤1 missing ingredient.
- **Next Shop** highlights items you'll likely need within a week and lets you share the shopping list.


## New Features
- **Weekly Plan**: choose number of dinners and auto-generate a shareable plan from recipes with minimal missing ingredients.
- **Budget-Aware Next Shop**: drag a slider to set your weekly budget; we prioritize ingredients that unlock the most meals per dollar.
- **Shared Shopping List (Supabase)**: sync list to a shared table and subscribe from multiple devices.

### Supabase Setup
Create a project, then add env vars in Vercel:
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```
Create a table:
```sql
create table shopping_list (
  id uuid primary key default gen_random_uuid(),
  user_group text not null,
  name text not null,
  qty int default 1,
  reasons text[] default '{}',
  checked boolean default false,
  inserted_at timestamp with time zone default now()
);
```
Enable realtime:
```sql
alter publication supabase_realtime add table shopping_list;
```
You can change the group id in-app (default `household-vanlom`).

### Sounds & Animations
- Button presses and add actions play short auditory cues (can be muted later).
- UI elements animate using framer-motion; cards, plan, and list entries have subtle motion for a polished, game-like feel.


## Roadmap: Auto-Decay & Habit Learning
- **Auto-decay models** for staples (milk, bread, bananas, oil): estimate daily usage and decrement automatically with lightweight confirmations.
- **Habit learning** per household: personalize consumption rates (e.g., milk/week, butter/month) and adjust shopping recommendations.
- **Confidence scoring** and easy overrides when manual adjustments disagree with predictions.


## Inventory Tuning
- **Per-ingredient deduction defaults** (e.g., oil 10%, milk 25%, spices 5%). You can override by adjusting remaining amount or using Quick Deduct.
- **Per-item Par Level**: each item has a target par (default 2). Shopping list recommends quantities to reach par based on what you have left.

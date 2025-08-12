Kitchen Sync — Clean Patch
==========================

What’s fixed:
- src/App.jsx: removed stray "\n" in JSX, fixed PRICE helper to use "||", ensured all features compile.
- vercel.json: tells Vercel to run "npm run build" and serve "dist".
- postcss.config.cjs / tailwind.config.cjs: CommonJS configs so Vercel builds cleanly.

How to apply:
1) Download this patch zip and unzip it.
2) In GitHub:
   - Go to your repo root → "Add file" → "Upload files".
   - Upload **vercel.json**, **postcss.config.cjs**, **tailwind.config.cjs** (these live at repo root).
   - Go into the **src/** folder in GitHub, click "Add file" → "Upload files", and upload **App.jsx** to replace the existing one.
   - Commit changes.
3) In Vercel:
   - Your project should auto-redeploy; if not, click **Redeploy** and check **Clear build cache**.
4) Test on your phone:
   - Open your .vercel.app URL → Add to Home Screen → Allow Camera → scan a barcode.
   - Toggle Simple Mode, try a recipe, mark cooked, check the shopping list.

If you still see a build error, copy the exact error line from the Vercel log and send it to me. I'll patch fast.

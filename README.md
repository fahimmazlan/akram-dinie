# Walimatulurus Akram & Dinie — e-invite

Static wedding invitation (one `index.html`) hosted on **Vercel**, with guest wishes (Ucapan) saved to a **Google Sheet**.

```
index.html                  the invitation
bg-floral-tall.webp         floral frame (cream)
bg-floral-cover-tall.webp   floral frame (cover, navy)
song.mp3                    background music (chorus clip)
og-image.jpg                WhatsApp / social preview picture
favicon.svg                 browser tab icon
vercel.json                 caching for images & music
apps-script/Code.gs         Google Sheet backend (paste into Apps Script, not used by Vercel)
```

---

## Step 1 — Google Sheet for wishes (about 10 min)

1. Go to **sheets.google.com**, create a blank sheet, name it e.g. `Ucapan Akram & Dinie`.
2. Menu **Extensions → Apps Script**.
3. Delete everything in `Code.gs`, paste the whole of `apps-script/Code.gs` from this folder, click **Save** (disk icon).
4. Set the couple's PIN: click the **gear icon (Project Settings)** → scroll to **Script properties** → **Add script property**
   - Property: `ADMIN_PIN`
   - Value: your PIN, e.g. `310126` (don't use something obvious)
   - **Save script properties**
5. Back in the editor, pick the function **`setup`** in the dropdown at the top and click **Run**.
   Google will ask for permission → choose your account → *Advanced* → *Go to … (unsafe)* → **Allow**.
   (This is your own script; the warning appears for every personal script.) A tab called **Ucapan** appears in the sheet.
6. **Deploy → New deployment** → gear icon next to "Select type" → **Web app**
   - Description: `ucapan`
   - Execute as: **Me**
   - Who has access: **Anyone**
   - **Deploy** → copy the **Web app URL** (looks like `https://script.google.com/macros/s/AKfy…/exec`).

> If you edit `Code.gs` later: **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. The URL stays the same.

## Step 2 — Put the URL in `index.html`

Open `index.html`, search for `PASTE_YOUR_APPS_SCRIPT_URL_HERE` and replace it with your Web app URL:

```js
const SHEET_API = "https://script.google.com/macros/s/AKfy…/exec";
```

While you're there (optional):
- **Phone numbers** — just below, fill in `phone: ""` for each contact (e.g. `"012-345 6789"`). Empty = hidden buttons.
- **Preview link** — near the top, two lines contain `akram-dinie.vercel.app`. If your Vercel link ends up different, change both.

## Step 3 — GitHub

1. github.com → **New repository** → name `akram-dinie` → Public or Private both fine → **Create**.
2. **uploading an existing file** → drag in *everything in this folder* (including the `apps-script` folder) → **Commit changes**.
   (Or with git: `git init && git add . && git commit -m "e-invite" && git branch -M main && git remote add origin <repo-url> && git push -u origin main`)

## Step 4 — Vercel

1. vercel.com → **Add New… → Project** → **Import** the `akram-dinie` repo.
2. Framework Preset: **Other**. Leave Build Command and Output Directory empty.
3. **Deploy**. After ~30 s you get `https://akram-dinie.vercel.app` (or similar).
4. To change the link name: Project → **Settings → Domains** → edit the `.vercel.app` name (then update the 2 preview lines in step 2 and push).

Every later change you push to GitHub goes live automatically in about a minute.

---

## Links to share

| Who | Link |
|---|---|
| Guests (WhatsApp) | `https://akram-dinie.vercel.app` |
| Couple only | `https://akram-dinie.vercel.app/#pengantin` → enter PIN |

**Ruang Pengantin (`#pengantin`)** shows the Hadir / Tidak hadir / Belum pasti count, the total number of wishes, and every wish with its attendance (newest first). Tap **MUAT SEMULA** to refresh, **KUNCI** to lock it again.

The PIN is stored in Google (Script properties), **not** in the website code, so it isn't visible in the public GitHub repo.

## Managing wishes in the Google Sheet

- Columns: **Masa · Nama · Ucapan · Kehadiran · Papar**
- To **hide** a wish from the public Ucapan list, change its **Papar** cell from `YA` to `TIDAK` (it still counts in the couple's page).
- To **delete** a wish, delete the row.
- **File → Download → Excel** to keep a copy.

## Test before sharing

1. Open the Vercel link on your phone → Buka Jemputan → music + slow scroll.
2. Ucapan tab → send a test wish → it appears in the list and in the Google Sheet.
3. Open `/#pengantin` → enter PIN → the test wish shows with its attendance.
4. Delete the test row in the sheet.
5. Paste the link into a WhatsApp chat to yourself → the preview card should show the navy floral picture.
   (WhatsApp caches previews; if it shows nothing the first time, wait a few minutes and try again.)

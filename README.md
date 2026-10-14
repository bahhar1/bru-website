# Brü website (demo)

Build a custom can, add it to a cart, check out into a subscription, then skip / pause / resume / cancel.
No real payments or accounts. Orders are saved to `backend/data.json` (stand-in for MongoDB).

## Run it (Windows PowerShell): two terminals

**Terminal 1: backend**
```powershell
cd C:\Users\moham\Downloads\BRU
.venv\Scripts\Activate.ps1
cd backend
pip install -r requirements.txt
python app.py
```

**Terminal 2: frontend** (needs Node.js from nodejs.org)
```powershell
cd C:\Users\moham\Downloads\BRU\frontend
npm install
npm run dev
```

Open http://localhost:5173

## Pages
- `/`               landing page (problem, solution, product, plans)
- `/build`          Build your Brü: pick base, milk, sweetness, flavor, name, plan
- `/cart`           change packs or plan, remove items
- `/checkout`       name, email, delivery frequency (no payment)
- `/subscription`   skip, pause, resume, cancel
- `/insights`       live popularity of every recipe (the "data on every order" slide)

## Changing things
- Prices, plans, menu options: `backend/pricing.py`
- Colors and can colors: `frontend/src/theme.js` and `frontend/src/styles.css`
- Photos: `frontend/public/images/`
- Switch to MongoDB later: rewrite only `backend/storage.py`
- Reset all demo orders: stop the backend and delete `backend/data.json`

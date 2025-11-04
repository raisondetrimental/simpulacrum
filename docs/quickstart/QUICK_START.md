# Quick Start Guide - Capital Partners Database System

## System Requirements
- Python 3.x installed
- Node.js and npm installed
- Windows OS (for Excel COM automation features)

---

## Starting the System

### Step 1: Start the Backend API Server

Open a **Command Prompt** or **PowerShell** window:

```bash
cd "C:\Users\Cameron Thomas\Documents\Dashboard Website\api"
python excel_api.py
```

**You should see:**
```
Starting Excel API server...
Excel file: ...
JSON output: ...
========================================
 * Running on http://127.0.0.1:5000
```

**⚠️ IMPORTANT:** Keep this window open! The API must be running for the database pages to work.

---

### Step 2: Start the Frontend Development Server

Open a **second** Command Prompt or PowerShell window:

```bash
cd "C:\Users\Cameron Thomas\Documents\Dashboard Website\web"
npm run dev
```

**You should see:**
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### Step 3: Access the Application

Open your web browser and go to:
```
http://localhost:5173
```

Navigate to **Tools** → **Capital Partners (View)** or **Capital Partners (Edit)**

---

## Using the System

### View Page (Read-Only)
- **Path:** Tools → Capital Partners (View)
- Use filter toggles to narrow down partners by investment criteria
- Click toggles to cycle: — (no filter) → Y → N → —
- Multiple filters work with AND logic (all must match)

### Edit Page
- **Path:** Tools → Capital Partners (Edit)

**Two editing methods:**

1. **Form-Based Editing:**
   - Select a partner from the dropdown OR choose "+ New Capital Partner"
   - Fill in the form fields
   - Click "Save Changes" or "Add Partner"
   - Changes save immediately to the database

2. **Inline Editing:**
   - Click "Enable Inline Editing" button
   - Click Y/N cells to cycle: Y → N → blank → Y
   - Click Relationship cells to cycle: Strong → Medium → Weak → blank
   - Click "Save Changes" when done

---

## Color Coding

- **Y values:** Light green
- **N values:** Light red
- **Strong relationship:** Light green
- **Medium relationship:** Amber/yellow
- **Weak relationship:** Light red

---

## Stopping the System

1. Stop the frontend: Press `Ctrl + C` in the web terminal
2. Stop the backend: Press `Ctrl + C` in the API terminal

---

## Troubleshooting

### "Failed to fetch" error
- **Cause:** Backend API is not running
- **Solution:** Start the API server (Step 1 above)
- **Check:** Verify API is running on http://127.0.0.1:5000

### Changes don't appear after saving
- **Cause:** API server might not be running or crashed
- **Solution:**
  1. Check the API terminal window for errors
  2. Restart the API server if needed
  3. Refresh the browser page

### Port already in use
- **Error:** "Address already in use" on port 5000 or 5173
- **Solution:**
  - Find and close the other process using that port
  - Or change the port in the respective config files

### Data not loading
- **Check:** Make sure `institutions.json` exists in the project root
- **Check:** API server shows "healthy" status
- **Solution:** Visit http://127.0.0.1:5000/api/health to verify API status

---

## Data Storage

All changes are saved to:
```
C:\Users\Cameron Thomas\Documents\Dashboard Website\institutions.json
```

Automatic backups are created as:
```
institutions.json.bak
```

---

## Quick Command Reference

**Start Backend:**
```bash
cd api
python excel_api.py
```

**Start Frontend:**
```bash
cd web
npm run dev
```

**Access Application:**
```
http://localhost:5173
```

**API Health Check:**
```
http://127.0.0.1:5000/api/health
```

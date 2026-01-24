Run script to install, build, and run frontend + backend

From project root run (PowerShell):

```powershell
PowerShell -ExecutionPolicy Bypass -File .\scripts\run_all.ps1
```

What it does:
- Installs frontend dependencies (retries with `--legacy-peer-deps` if needed)
- Installs backend dependencies (`backend` folder)
- Builds the frontend (`npm run build`)
- Starts the backend (`npm run start`) in a new terminal
- Starts the frontend preview (`npm run preview`) in a new terminal

Notes:
- If you prefer the dev server instead of preview, run `npm run dev` in the project root manually.
- On first run you may need to allow script execution or run PowerShell as Administrator.

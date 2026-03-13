# Quick Start Guide

## Server Status

✅ **ML Server is RUNNING on port 8010**

To verify:
```bash
# Check if server is running
netstat -ano | findstr :8010

# Test the server
curl http://127.0.0.1:8010/api/health
```

## Starting the Servers

### 1. ML Server (Port 8010) - REQUIRED
```bash
cd ML
python run_server.py
```

Or use the batch file:
```bash
cd ML
start_server.bat
```

### 2. Frontend (Port 5173 or similar)
```bash
cd Frontend
npm run dev
```

### 3. Backend Node.js (Port 3000 or similar)
```bash
cd Backend
node server.js
```

## Troubleshooting Connection Errors

### Error: `ERR_CONNECTION_REFUSED` on port 8010

**Solution:** Start the ML server:
```bash
cd ML
python run_server.py
```

The server should show:
```
Starting ThinkMap ML Service on http://127.0.0.1:8010
INFO:     Uvicorn running on http://127.0.0.1:8010
```

### Error: Server starts but requests fail

1. **Check server logs** - Look for errors in the terminal where the server is running
2. **Verify MongoDB** - Ensure MongoDB is accessible (check `.env` file)
3. **Check CORS** - The server allows all origins, so CORS shouldn't be an issue
4. **Browser cache** - Try hard refresh (Ctrl+Shift+R) or clear cache

### Verify Server is Working

Test the health endpoint:
```bash
# PowerShell
Invoke-WebRequest -Uri "http://127.0.0.1:8010/api/health"

# Should return: {"status":"ok","service":"ThinkMap Unified ML API"}
```

## Current Status

- ✅ ML Server: Running on port 8010
- ✅ Health endpoint: Responding correctly
- ✅ All features integrated: Feature3, Feature7, Feature8
- ✅ MongoDB: Connected

## Next Steps

1. Ensure ML server is running (it is now!)
2. Refresh your browser
3. Try submitting an answer again

The connection should work now!

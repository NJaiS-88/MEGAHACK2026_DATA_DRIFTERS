# Database Consolidation Fix

## Issue
Two MongoDB databases were being created:
1. `thinkmap_ai` - from ML service default config
2. `megahack` - from MongoDB URI or Backend

## Solution
All collections now use the **`megahack`** database only.

## Changes Made

### 1. Updated Default Database Name
**File:** `ML/feature3_student_knowledge_tracking/config.py`
- Changed `MONGO_DB_NAME` default from `"thinkmap_ai"` to `"megahack"`

### 2. Enhanced Database Connection Logic
**File:** `ML/feature3_student_knowledge_tracking/database.py`
- Added logic to detect and remove database name from MongoDB URI path
- Always uses the configured `MONGO_DB_NAME` (`megahack`) regardless of what's in the URI
- Added logging to show which database is being used

### 3. Updated Environment Example
**File:** `env.example`
- Added `MONGO_DB_NAME=megahack` to example configuration

## Collections in `megahack` Database

All these collections are now in the `megahack` database:
- `concepts` - Concept definitions
- `questions` - Question bank
- `student_attempts` - All question attempts with full feature outputs
- `student_knowledge` - User knowledge states per concept
- `users` - User accounts (from Backend)
- `books` - User books (from Backend)
- `quizresults` - Quiz results (from Backend)

## Configuration

Set in `.env` file:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/megahack?appName=Cluster0
MONGO_DB_NAME=megahack
```

**Note:** Even if your `MONGODB_URI` has a database name in it, the code will use `MONGO_DB_NAME` setting instead.

## Verification

After restarting the ML server, you should see:
```
[Database] Using database name: 'megahack' (all collections will be in this database)
[Database] Connected to database: 'megahack'
```

All new data will go to the `megahack` database only.

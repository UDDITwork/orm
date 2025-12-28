# Setup Guide - Online Reputation Management Tool

## Quick Start

### Step 1: Install Dependencies

**Location:** `/ORM` (root directory)
**Command:** `npm run install-all`
**Run from:** `/ORM`

This will install dependencies for root, server, and client.

### Step 2: Configure Environment Variables

**Location:** `server/.env`
**Action:** Create this file and add your API keys

Copy `server/.env.example` to `server/.env` and fill in your API keys:

```env
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_claude_api_key_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
YELP_API_KEY=your_yelp_api_key_here
CLIENT_URL=http://localhost:3000
```

### Step 3: Start the Application

**Location:** `/ORM` (root directory)
**Command:** `npm run dev`
**Run from:** `/ORM`

This starts both the backend (port 5000) and frontend (port 3000) servers.

---

## Getting Free API Keys

### 1. OpenAI API Key (Recommended)
- **URL:** https://platform.openai.com/api-keys
- **Steps:**
  1. Sign up or log in to OpenAI
  2. Go to API Keys section
  3. Create a new secret key
  4. Copy and paste into `OPENAI_API_KEY` in `.env`
- **Free Tier:** $5 credit for new users

### 2. Anthropic Claude API Key (Recommended)
- **URL:** https://console.anthropic.com/
- **Steps:**
  1. Sign up or log in to Anthropic
  2. Navigate to API Keys
  3. Create a new API key
  4. Copy and paste into `ANTHROPIC_API_KEY` in `.env`
- **Free Tier:** Limited free credits available

### 3. Google Places API Key (Optional - for real review scraping)
- **URL:** https://console.cloud.google.com/apis/credentials
- **Steps:**
  1. Create a Google Cloud account
  2. Create a new project
  3. Enable "Places API"
  4. Create credentials (API Key)
  5. Copy and paste into `GOOGLE_PLACES_API_KEY` in `.env`
- **Free Tier:** $200 free credit monthly

### 4. Yelp Fusion API Key (Optional - for real review scraping)
- **URL:** https://www.yelp.com/developers/documentation/v3/authentication
- **Steps:**
  1. Create a Yelp account
  2. Go to "Create App"
  3. Fill in app details
  4. Get your API Key
  5. Copy and paste into `YELP_API_KEY` in `.env`
- **Free Tier:** 5,000 calls per day

---

## Running Without API Keys

The application will work without API keys, but with limited functionality:
- ✅ Basic SEO analysis (mock data)
- ✅ Sentiment analysis (using local NLP library)
- ✅ Charts and visualizations
- ❌ Advanced AI recommendations (will use fallback)
- ❌ Real review scraping (will use mock data)

---

## Troubleshooting

### Port Already in Use
If port 5000 or 3000 is already in use:
1. Change `PORT` in `server/.env` to a different port (e.g., 5001)
2. Update `CLIENT_URL` if you change the backend port
3. Or stop the process using those ports

### Module Not Found Errors
Run the install command again:
```bash
npm run install-all
```

### CORS Errors
Make sure `CLIENT_URL` in `server/.env` matches your frontend URL (default: http://localhost:3000)

---

## Development Commands

### Run Backend Only
**Location:** `server/`
**Command:** `npm run dev`
**Run from:** `server/`

### Run Frontend Only
**Location:** `client/`
**Command:** `npm start`
**Run from:** `client/`

### Run Both (Recommended)
**Location:** `/ORM` (root)
**Command:** `npm run dev`
**Run from:** `/ORM`

---

## Next Steps

1. Open http://localhost:3000 in your browser
2. Enter a company name to analyze
3. View comprehensive analysis results with charts and recommendations

Enjoy analyzing online reputations! 🚀


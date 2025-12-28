# Online Reputation Management (ORM) Tool

A comprehensive web-based application for analyzing and managing online reputation, SEO scores, and customer sentiment analysis.

## Features

- 🔍 **Company Analysis**: Search and analyze any company's online presence
- 📊 **SEO Scoring**: Comprehensive SEO analysis with detailed breakdowns
- 💬 **Sentiment Analysis**: AI-powered sentiment analysis of customer reviews
- 📈 **Dynamic Charts**: Visual representation of metrics and trends
- 🤖 **AI Recommendations**: Actionable insights powered by OpenAI and Claude
- ⭐ **Review Analysis**: Scrape and analyze reviews from multiple platforms

## Tech Stack

### Frontend
- React 18
- Recharts for data visualization
- Modern CSS with gradients and animations

### Backend
- Node.js with Express
- OpenAI API integration
- Anthropic Claude API integration
- Natural language processing for sentiment analysis

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- API Keys:
  - OpenAI API Key (optional but recommended)
  - Anthropic Claude API Key (optional but recommended)
  - Google Places API Key (for review scraping - optional)
  - Yelp API Key (for review scraping - optional)

### Installation

1. **Install all dependencies:**
```bash
npm run install-all
```

Or install separately:
```bash
# Root dependencies
npm install

# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

2. **Configure environment variables:**

Create `server/.env` file:
```env
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_claude_api_key_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
YELP_API_KEY=your_yelp_api_key_here
CLIENT_URL=http://localhost:3000
```

3. **Start the application:**

**Option 1: Run both servers concurrently**
```bash
npm run dev
```

**Option 2: Run separately**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

## API Endpoints

### Company Analysis
- `POST /api/company/analyze` - Analyze a company
- `GET /api/company/search/:name` - Search for companies

### Reviews
- `POST /api/reviews/scrape` - Scrape reviews from platforms
- `POST /api/reviews/analyze-sentiment` - Analyze review sentiments
- `GET /api/reviews/platforms` - Get available platforms

### SEO
- `POST /api/seo/analyze` - Analyze SEO metrics
- `POST /api/seo/score` - Calculate SEO score

### Comprehensive Analysis
- `POST /api/analysis/comprehensive` - Get full analysis report
- `POST /api/analysis/recommendations` - Generate AI recommendations

## Free API Keys You Can Get

1. **OpenAI API**: https://platform.openai.com/api-keys
2. **Anthropic Claude API**: https://console.anthropic.com/
3. **Google Places API**: https://console.cloud.google.com/apis/credentials
4. **Yelp Fusion API**: https://www.yelp.com/developers/documentation/v3/authentication

## Project Structure

```
ORM/
├── server/
│   ├── routes/          # API routes
│   ├── services/       # Business logic
│   ├── index.js        # Server entry point
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── package.json
```

## Features in Detail

### SEO Analysis
- On-page SEO scoring
- Technical SEO evaluation
- Content quality analysis
- Backlink assessment
- Domain authority calculation

### Sentiment Analysis
- Positive/negative/neutral classification
- AI-powered insights
- Review theme extraction
- Trend analysis over time

### Dynamic Metrics
- Overall reputation score
- Real-time calculations
- Visual scorecards
- Comparative analysis

## Development

The application uses mock data for demonstration. To integrate with real APIs:

1. Update `server/services/reviewService.js` to use actual Google Places/Yelp APIs
2. Enhance `server/services/seoService.js` with real web scraping
3. Configure API keys in `server/.env`

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!


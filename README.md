# CalorieSense AI - Nutrition Tracking Application

AI-powered nutrition tracking application that analyzes food images and tracks your daily calorie and macro intake.

## Features

- 📸 **Food Image Recognition** - Upload food photos for instant AI-powered nutrition analysis
- 📊 **Nutrition Dashboard** - Track daily calories, protein, carbs, and fat intake
- 🎯 **Goal Tracking** - Set and monitor your nutrition goals
- 🤖 **AI Insights** - Get personalized health recommendations

## Tech Stack

### Backend
- FastAPI (Python)
- OpenAI GPT-4o Vision (for food recognition)
- TensorFlow/MobileNetV2 (for food validation)
- OpenAI GPT-3.5-turbo (for insights)

### Frontend
- React + TypeScript
- Vite
- TailwindCSS + shadcn/ui
- Framer Motion
- Recharts

## Setup Instructions

### Prerequisites
- Python 3.13+
- Node.js 18+
- OpenAI API Key

### Backend Setup

1. Navigate to backend directory:
```bash
cd "C:\Users\ajith\Calorie AI\backend"
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Make sure `.env` file has your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the backend server:
```bash
python main.py
```

Backend will run on: `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd "C:\Users\ajith\Calorie AI\frontend"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on: `http://localhost:5173`

## API Endpoints

### 1. POST `/analyze-image`
Upload a food image to get nutrition data.

**Request:** 
- Content-Type: `multipart/form-data`
- Body: `file` (image file)

**Response:**
```json
{
  "food_name": "banana",
  "calories": 105,
  "protein": 1,
  "carbs": 27,
  "fat": 0,
  "portion_size": "medium"
}
```

### 2. POST `/get-insight`
Get personalized health tips based on your macros.

**Request:**
```json
{
  "protein": 50,
  "carbs": 150,
  "goal": 2000
}
```

**Response:**
```json
{
  "insight": "Great work on hitting your protein target! Consider adding more healthy fats..."
}
```

### 3. POST `/process-analytics`
Calculate nutrition analytics from meal history.

**Request:**
```json
[
  {
    "name": "Banana",
    "calories": 105,
    "date": "2026-01-05"
  },
  {
    "name": "Chicken Breast",
    "calories": 250,
    "date": "2026-01-05"
  }
]
```

**Response:**
```json
{
  "average_calories": 177,
  "daily_average": 355,
  "highest_calorie_day": "2026-01-05",
  "highest_calories": 355
}
```

## Usage

1. **Start Backend**: Run `python main.py` in the backend directory
2. **Start Frontend**: Run `npm run dev` in the frontend directory
3. **Open Browser**: Navigate to `http://localhost:5173`
4. **Upload Food**: Click "Upload Food" button and select a food image
5. **Track Nutrition**: View your daily nutrition dashboard with charts
6. **Monitor Progress**: See your calorie and macro breakdown

## Project Structure

```
Calorie AI/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── contexts/        # React context providers
    │   └── pages/           # Page components
    ├── package.json         # Node dependencies
    └── .env                 # Frontend environment variables
```

## Important Notes

- The backend uses **OpenAI API only** (no Google API required)
- Make sure both servers are running simultaneously
- Backend must be on port 8000, frontend expects this
- Food images should be clear and well-lit for best results

## Troubleshooting

**Backend won't start?**
- Check if port 8000 is already in use
- Verify OpenAI API key is set in backend/.env

**Frontend can't connect to backend?**
- Ensure backend is running on http://localhost:8000
- Check frontend/.env has correct VITE_BACKEND_URL

**Image analysis fails?**
- Verify OpenAI API key has credits
- Check image file is a valid format (JPG, PNG)
- Ensure image clearly shows food items

## Credits

Built with ❤️ using OpenAI GPT-4o Vision API

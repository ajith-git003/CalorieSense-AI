# CalorieSense AI

CalorieSense AI is an AI-powered nutrition tracking application that helps users
analyze food intake, estimate calories and macros, and track nutrition goals
using computer vision and large language models.

This project focuses on building a reliable, backend-controlled AI system
for real-world health and fitness use cases.

---

## What This Project Solves

Tracking nutrition accurately is time-consuming and often requires manual input.

CalorieSense AI enables users to:
- Upload food images for automatic calorie and macro estimation
- Track daily intake of calories, protein, carbohydrates, and fat
- Monitor nutrition goals over time
- Receive AI-generated insights based on actual consumption data

---

## Key Features

- Image-based food recognition with validation
- Calorie and macro estimation per meal
- Daily and historical nutrition analytics
- Nutrition goal configuration and tracking
- AI-generated health insights based on user data

---

## System Design 

1. User uploads a food image
2. Backend validates the image to ensure it contains food
3. Valid images are processed by a vision-enabled language model
4. Structured nutrition data is generated in JSON format
5. Analytics are calculated from meal history
6. Insights and metrics are returned to the frontend

The AI is treated as a controlled component with structured inputs and outputs.

---

## Project Structure 

```text
frontend/        # User interface and visualizations
backend/         # API, image processing, AI logic, analytics
docs/            # Architecture and setup documentation
```


---

## Tech Stack

### Frontend
- React + TypeScript
- Tailwind CSS
- Recharts
- Framer Motion
- Deployed on Vercel

### Backend
- FastAPI (Python)
- OpenAI (Vision + LLMs)
- TensorFlow / MobileNetV2 (image validation)
- Pandas for analytics
- Deployed on Render

---

## Deployment

- Frontend hosted on Vercel
- Backend hosted on Render
- Secrets managed using environment variables

Live Demo:
👉 https://calorie-sense-ai-c.vercel.app/

---

## Purpose

This project was built as part of my AI engineering portfolio to demonstrate:
- Computer vision integration with LLMs
- Backend-controlled AI workflows
- Structured AI outputs for analytics
- End-to-end system design and deployment

---

## License

This project is intended for educational and portfolio purposes.

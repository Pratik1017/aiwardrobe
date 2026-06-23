# Google Cloud Vision API Setup Guide

## 🤖 AI Image Analysis Integration

The AL Closet project now uses **Google Cloud Vision API** to automatically analyze clothing images and detect:
- **Clothing Type** (shirt, pants, dress, jacket, etc.)
- **Dominant Color** (blue, red, black, etc.)
- **Category** (top, bottom, ethnic, footwear, etc.)

## 📋 Prerequisites

- Google Cloud Platform (GCP) account (free tier available)
- Active billing enabled (though Vision API has free monthly quota: 1000 images/month)
- `gcloud` CLI installed (optional but recommended)

## 🔧 Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the **Project** dropdown at the top
3. Click **NEW PROJECT**
4. Enter name: `AL Closet`
5. Click **CREATE**
6. Wait for project creation (may take 1-2 minutes)

### 2. Enable Vision API

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **"Cloud Vision API"**
3. Click on it
4. Click **ENABLE** button
5. Wait for it to be enabled

### 3. Create Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **CREATE CREDENTIALS** button
3. Select **Service Account**
4. Fill in:
   - **Service account name**: `al-closet-vision`
   - **Service account ID**: (auto-generated)
   - **Description**: `Service account for AL Closet image analysis`
5. Click **CREATE AND CONTINUE**
6. Grant roles:
   - Search and select: **Basic Editor** (or **Viewer** for read-only)
   - Click **CONTINUE**
7. Click **DONE**

### 4. Generate Service Account Key (JSON)

1. In **Credentials** page, find your service account under "Service Accounts"
2. Click on the service account name
3. Go to **KEYS** tab
4. Click **ADD KEY** → **Create new key**
5. Choose **JSON** format
6. Click **CREATE**
7. A JSON file will download automatically

### 5. Add Credentials to Backend

1. Copy the downloaded JSON file
2. Place it in: `/server/config/google-cloud-key.json`
   ```bash
   cp ~/Downloads/your-service-account-key.json ~/path/to/server/config/google-cloud-key.json
   ```

### 6. Update Environment Variables

Update `/server/.env`:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/al-closet
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
GOOGLE_APPLICATION_CREDENTIALS=./config/google-cloud-key.json
```

### 7. Install Dependencies

```bash
cd server
npm install
```

This will install `@google-cloud/vision` package

## ✅ Testing AI Image Analysis

### Test with the UI

1. Start both servers:
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev
   
   # Terminal 2 - Frontend
   cd client && npm start
   ```

2. Open `http://localhost:3000`

3. Sign up/Login

4. Click **Upload**

5. Upload a clothing image

6. Watch the AI detect:
   - ✅ Clothing type (shirt, pants, dress, etc.)
   - ✅ Dominant color (blue, red, black, etc.)
   - ✅ Category (top, bottom, formal, casual, etc.)
   - ✅ Confidence score
   - ✅ All detected labels

### Test via cURL

```bash
# First get auth token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"password"}'

# Copy the token from response

# Then upload with image
curl -X POST http://localhost:5000/api/clothing/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "type=" \
  -F "color=" \
  -F "category="
```

## 🎯 How AI Analysis Works

### Image Analysis Pipeline

1. **Label Detection**
   - Google Vision identifies what's in the image
   - Labels like: "Clothing", "Shirt", "Blue", "Formal", etc.

2. **Type Detection**
   - Labels are mapped to clothing types:
     - "T-shirt" → `shirt`
     - "Jeans" → `pants`
     - "Dress" → `dress`
     - "Kurta" → `kurta`
     - etc.

3. **Color Detection**
   - Vision API extracts dominant colors
   - RGB values are converted to color names:
     - RGB(255, 0, 0) → `red`
     - RGB(0, 0, 255) → `blue`
     - RGB(0, 0, 0) → `black`
     - etc.

4. **Category Mapping**
   - Type is mapped to category:
     - `shirt` → `top`
     - `pants` → `bottom`
     - `kurta` → `ethnic`
     - `shoes` → `footwear`
     - etc.

### Fallback Behavior

If AI analysis fails:
- Returns sensible defaults (type: `shirt`, color: `neutral`)
- Error message in response
- User can still upload and manually edit

## 📊 Confidence Scores

Each analysis includes a confidence score (0-1):
- **0.9+** - Very confident
- **0.7-0.9** - Confident
- **0.5-0.7** - Moderate confidence
- **<0.5** - Low confidence

Display confidence percentage in UI.

## 💰 Pricing

**Google Cloud Vision API Pricing** (as of 2024):
- **Free tier**: 1,000 images/month (includes Label Detection + Image Properties)
- **Paid**: $1.50 per 1,000 images after free tier

For 1000 images/month, the cost is **FREE** with their generous quota!

## 🚨 Troubleshooting

### Error: "GOOGLE_APPLICATION_CREDENTIALS not found"
- Ensure JSON file is placed at: `/server/config/google-cloud-key.json`
- Check file path in `.env`

### Error: "Permission denied on Vision API"
- Ensure Vision API is **ENABLED** in Google Cloud Console
- Ensure service account has **Editor** or **Viewer** role

### Error: "Invalid service account credentials"
- Download a fresh JSON key file
- Ensure you're using the right project

### Image analysis is slow (>10 seconds)
- First request might be slow (cold start)
- Subsequent requests should be faster
- Consider caching results

### Color detection inaccurate
- The Vision API's color detection is based on pixel analysis
- It detects the actual dominant color in the image
- User can override if they want a different color

## 🔐 Security Notes

⚠️ **IMPORTANT:**
- Never commit `google-cloud-key.json` to git (already in `.gitignore`)
- Never share your service account key
- Rotate keys periodically
- Use restricted service accounts with minimal permissions

## 📈 Next Steps

### Optional Enhancements

1. **Caching**: Cache analysis results to reduce API calls
2. **Batch Processing**: Process multiple images at once
3. **Confidence Threshold**: Only auto-save if confidence > 80%
4. **User Feedback**: Let users rate if AI detection was correct
5. **Retraining**: Use feedback to improve future detections

## 🎓 Learning Resources

- [Google Cloud Vision API Docs](https://cloud.google.com/vision/docs)
- [Node.js Vision Library](https://github.com/googleapis/nodejs-vision)
- [Vision API Quickstart](https://cloud.google.com/vision/docs/quickstart-client-libraries)

## ✨ Features

### What AI Detection Can Do

✅ Detect clothing types accurately
✅ Identify dominant colors
✅ Assign categories automatically
✅ Provide confidence scores
✅ Extract relevant labels
✅ Work with various clothing styles (western, ethnic, etc.)

### Limitations

- Requires clear, well-lit images
- May struggle with very dark/light images
- Accessories might be misidentified as clothing
- Pattern detection is not available
- Size/fit detection is not available

## 💡 Pro Tips

1. **Better Results**: Upload clear, well-lit images
2. **Override When Needed**: User can always override AI detection
3. **Confidence Indicator**: Show users the confidence score
4. **Batch Upload**: Users can upload multiple items in succession
5. **Feedback Loop**: Save user corrections to improve future detections

---

**Your AL Closet is now powered by Google Cloud Vision! 🚀**

For issues, check your Google Cloud Console logs or refer to the troubleshooting section above.

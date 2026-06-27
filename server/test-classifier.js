require('dotenv').config();
const ai = require('./services/aiService');
const https = require('https');

const testImageUrl = 'https://res.cloudinary.com/dpjkhg7dr/image/upload/v1782383763/al-closet/xghrgvkyclnwnbd5hw5m.jpg';

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

(async () => {
  try {
    console.log('Downloading test image...');
    const imageBuffer = await downloadImage(testImageUrl);
    console.log(`Image size: ${(imageBuffer.length / 1024).toFixed(1)} KB`);

    console.log('\n=== CLASSIFYING WITH WEIGHTED VOTING ===');
    const result = await ai.analyzeClothingImage(imageBuffer);
    console.log('\nFinal result:');
    console.log('  Type:', result.type);
    console.log('  Color:', result.color);
    console.log('  Category:', result.category);
    console.log('  Confidence:', (result.confidence * 100).toFixed(1) + '%');
    console.log('  Method:', result.classificationMethod);
  } catch (err) {
    console.error('Test failed:', err.message);
  }
  process.exit(0);
})();

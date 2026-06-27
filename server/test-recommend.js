require('dotenv').config();
const mongoose = require('mongoose');
const Clothing = require('./models/Clothing');
const rs = require('./services/recommendationService');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Get ALL items (not just 10)
  const items = await Clothing.find({ isDonated: false }).lean();
  console.log('Found', items.length, 'items');
  
  // Show breakdown
  const types = {};
  items.forEach(i => { types[i.type] = (types[i.type] || 0) + 1; });
  console.log('Type breakdown:', JSON.stringify(types));

  const weather = { temp: 33, condition: 'cloudy', description: 'overcast clouds', humidity: 54, city: 'Nagpur' };
  
  console.log('\n=== CASUAL EVENING TEST ===');
  const result = await rs.recommendOutfit(items, weather, 'casual', { style: 'casual', favoriteColors: ['blue', 'black'] }, [], 'male', 22);
  
  if (result.error) {
    console.log('ERROR:', result.error);
  } else if (result.partial) {
    console.log('PARTIAL result - not enough items');
    console.log('Reasoning:', result.reasonText);
    console.log('Weather Tip:', JSON.stringify(result.weatherTip));
    console.log('Time:', JSON.stringify(result.timeContext));
  } else {
    console.log('SUCCESS!');
    console.log('Score:', result.score);
    console.log('Confidence:', result.confidencePercent + '%');
    console.log('Type:', result.type);
    console.log('Season:', result.seasonContext);
    console.log('Time:', JSON.stringify(result.timeContext));
    console.log('Weather Tip:', JSON.stringify(result.weatherTip));
    console.log('Reasoning:', result.reasonText);
    if (result.top) console.log('Top:', result.top.name, '-', result.top.color, '-', result.top.type);
    if (result.bottom) console.log('Bottom:', result.bottom.name, '-', result.bottom.color, '-', result.bottom.type);
    if (result.outerwear) console.log('Outerwear:', result.outerwear.name);
    if (result.footwear) console.log('Footwear:', result.footwear.name);
    if (result.accessories) console.log('Accessories:', result.accessories.map(a => a.name).join(', '));
  }
  
  process.exit(0);
})();

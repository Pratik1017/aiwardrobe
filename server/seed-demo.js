require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Clothing = require('./models/Clothing');
const OutfitHistory = require('./models/OutfitHistory');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to:', mongoose.connection.db.databaseName);

    // 1. Create new user account
    const existingUser = await User.findOne({ email: 'pratikdeshmukh7077@gmail.com' });
    let newUser;

    if (existingUser) {
      console.log('User already exists, updating password...');
      existingUser.password = 'Pratik@1017';
      await existingUser.save();
      newUser = existingUser;
    } else {
      console.log('Creating new user...');
      newUser = await User.create({
        name: 'Pratik Deshmukh',
        username: 'Pratik1017',
        email: 'pratikdeshmukh7077@gmail.com',
        password: 'Pratik@1017',
        gender: 'male',
        role: 'user',
        preferences: {
          style: 'casual',
          favoriteColors: ['blue', 'black', 'white']
        }
      });
    }

    console.log(`User ready: ${newUser.name} (${newUser._id})`);

    // 2. Get ALL clothing items from ALL users
    const allClothing = await Clothing.find({}).lean();
    console.log(`\nFound ${allClothing.length} total clothing items in DB`);

    // 3. Duplicate all items that don't belong to this user
    const otherItems = allClothing.filter(c => c.user.toString() !== newUser._id.toString());
    const myItems = allClothing.filter(c => c.user.toString() === newUser._id.toString());
    console.log(`Items already owned by Pratik: ${myItems.length}`);
    console.log(`Items from other users to duplicate: ${otherItems.length}`);

    let duplicated = 0;
    for (const item of otherItems) {
      // Check if we already have a duplicate (by name + imageUrl)
      const exists = await Clothing.findOne({
        user: newUser._id,
        imageUrl: item.imageUrl
      });

      if (!exists) {
        await Clothing.create({
          user: newUser._id,
          name: item.name,
          type: item.type,
          color: item.color,
          category: item.category,
          size: item.size || 'One Size',
          imageUrl: item.imageUrl,
          cloudinaryId: item.cloudinaryId || `seed-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          description: item.description || undefined,
          brand: item.brand || undefined,
          purchaseDate: item.purchaseDate || undefined,
          tags: item.tags || [],
          gender: item.gender || 'male',
          isDonated: false,
          condition: item.condition || null
        });
        duplicated++;
      }
    }

    console.log(`Duplicated ${duplicated} items for Pratik`);

    // 4. Count final items
    const finalCount = await Clothing.countDocuments({ user: newUser._id });
    console.log(`\nPratik now has ${finalCount} clothing items!`);

    // 5. Create some outfit history entries
    const pratikItems = await Clothing.find({ user: newUser._id, isDonated: false }).lean();
    if (pratikItems.length >= 2) {
      const occasions = ['casual', 'formal', 'party', 'work', 'date night'];
      const weathers = ['clear', 'cloudy', 'rainy', 'sunny', 'cold'];

      // Create 5 outfit history entries
      for (let i = 0; i < Math.min(5, Math.floor(pratikItems.length / 2)); i++) {
        const items = [
          pratikItems[i * 2]._id,
          pratikItems[i * 2 + 1]._id
        ];
        const daysAgo = (i + 1) * 3;
        const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        await OutfitHistory.create({
          user: newUser._id,
          clothingItems: items,
          occasion: occasions[i],
          weather: weathers[i],
          date: date,
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        });
      }
      console.log('Created 5 outfit history entries');
    }

    console.log('\n✅ DONE! Login with:');
    console.log('   Email:    pratikdeshmukh7077@gmail.com');
    console.log('   Password: Pratik@1017');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

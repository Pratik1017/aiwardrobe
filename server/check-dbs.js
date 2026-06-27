require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = mongoose.connection.db.admin();
  const dbs = await admin.listDatabases();

  console.log('=== ALL DATABASES IN CLUSTER ===');
  for (const dbInfo of dbs.databases) {
    console.log(`\nDB: ${dbInfo.name} (${dbInfo.sizeOnDisk} bytes)`);
    const dbConn = mongoose.connection.useDb(dbInfo.name).db;
    const collections = await dbConn.listCollections().toArray();
    for (const col of collections) {
      const count = await dbConn.collection(col.name).countDocuments();
      console.log(`  - ${col.name}: ${count} documents`);
    }
  }

  // Specifically check for the items the user mentioned
  console.log('\n=== SEARCHING FOR USER 69e87bc8d0f9bc6990d4400d ===');
  for (const dbInfo of dbs.databases) {
    const dbConn = mongoose.connection.useDb(dbInfo.name).db;
    const collections = await dbConn.listCollections().toArray();
    for (const col of collections) {
      try {
        const items = await dbConn.collection(col.name).find({
          user: new mongoose.Types.ObjectId('69e87bc8d0f9bc6990d4400d')
        }).toArray();
        if (items.length > 0) {
          console.log(`\nFound ${items.length} docs in ${dbInfo.name}.${col.name}:`);
          items.forEach(i => console.log(JSON.stringify(i, null, 2)));
        }
      } catch(e) { /* skip */ }
    }
  }

  process.exit(0);
})();

const app = require("./app");
const seedAdmin = require("./config/seeder");


const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
   await seedAdmin();
});


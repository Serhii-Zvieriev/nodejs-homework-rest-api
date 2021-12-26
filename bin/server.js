const mongoose = require("mongoose");
const app = require("../app");

const { DB_HOST, PORT = 3000 } = process.env;

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Database connection successful, \nServer running. Use our API on port: ${PORT}`
      );
    });
  })
  .catch((error) => {
    console.log(error.massage);
    process.exit(1);
  });

const express = require("express");
const bodyParser = require("body-parser");
const gridRoute = require("./api/routes/grid.routes");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/grid/", gridRoute);
app.listen(3500, () => {
  console.log("app is running...");
});

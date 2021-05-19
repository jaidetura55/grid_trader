const express = require("express");
const router = express.Router();
const gridController = require("../controllers/grid.controller");

router.post("/add", gridController.addNewGrid);
router.post("/stop", gridController.stopGrid);
router.post("/cancel/orders", gridController.cancelOrders);
router.post("/update", gridController.updateNewGrid);
module.exports = router;

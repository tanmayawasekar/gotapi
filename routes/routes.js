// Routes.js
const express = require('express');
const router = express.Router();
const dependencies = require('./routeDependencies');

router.get('/',function (req, res) {
  res.send('ok');
});

router.get('/list', dependencies.battleList.getBattleLocation);

router.get('/count', dependencies.battleList.totalBattles);

router.get('/stats', dependencies.battleList.getBattleStats);

module.exports = router;

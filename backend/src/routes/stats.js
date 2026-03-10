const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let cachedStats = null;

function computeStats(items) {
  if (!items.length) {
    return { total: 0, averagePrice: 0 };
  }
  return {
    total: items.length,
    averagePrice: items.reduce((acc, cur) => acc + cur.price, 0) / items.length,
  };
}

async function refreshStats() {
  const raw = await fs.promises.readFile(DATA_PATH, 'utf8');
  const items = JSON.parse(raw);
  cachedStats = computeStats(items);
  return cachedStats;
}

// Invalidate cache when items.json changes (write/create/rename)
fs.watch(DATA_PATH, (eventType) => {
  if (eventType === 'change' || eventType === 'rename') {
    cachedStats = null;
  }
});

// GET /api/stats — returns cached stats when valid, recomputes on cache miss or after file change
router.get('/', async (req, res, next) => {
  try {
    if (cachedStats === null) {
      await refreshStats();
    }
    res.json(cachedStats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
const router = require('express').Router();
const ctrl = require('../controllers/queries.controller');

router.get('/q4', ctrl.getQuery4Result);
router.get('/q5', ctrl.getQuery5Result);
router.get('/q6', ctrl.getQuery6Result);

module.exports = router;

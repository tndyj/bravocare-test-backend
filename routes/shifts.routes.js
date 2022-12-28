const router = require('express').Router();
const ctrl = require('../controllers/shifts.controller');

router.get('/', ctrl.getAllShifts);
router.get('/compare', ctrl.compareShifts);

module.exports = router;

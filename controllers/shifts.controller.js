const moment = require('moment');
const client = require('../pg');

const MAX_OVERLAP_SAME_FACILITY_MINS = 30;
const MAX_OVERLAP_DIFF_FACILITY_MINS = 0;

function getAllShifts(req, res, next) {
  client
    .query(
      `select q.*, f.facility_name from question_one_shifts q
      join facilities f on q.facility_id=f.facility_id`
    )
    .then((result) => res.json(result.rows))
    .catch(next);
}

/**
 * total overlap mins
 * maximum overlap threshold
 * whether or not two shifts overlap is exceeding threshold
 */
function compareShifts(req, res, next) {
  const { shift_ids } = req.query;

  if (!Array.isArray(shift_ids) || shift_ids.length !== 2) {
    return res.status(422).json({ error: 'Should send two shift ids' });
  }

  client
    .query(
      'select * from question_one_shifts where shift_id in ($1, $2) order by shift_date, start_time, end_time',
      shift_ids
    )
    .then((result) => {
      if (result.rows.length !== 2) {
        return res.status(404).json({ error: 'Can not find shifts' });
      }

      const [shiftA, shiftB] = result.rows;
      const dateA = moment(shiftA.shift_date);
      const dateB = moment(shiftB.shift_date);
      const endA = moment(`${dateA.format('YYYY-MM-DD')} ${shiftA.end_time}`);
      const startB = moment(
        `${dateB.format('YYYY-MM-DD')} ${shiftB.start_time}`
      );
      const endB = moment(`${dateB.format('YYYY-MM-DD')} ${shiftB.end_time}`);
      const diff = startB.isAfter(endA)
        ? 0
        : endA.isAfter(endB)
        ? endB.diff(startB, 'minutes')
        : endA.diff(startB, 'minutes');
      const isSameFacility = shiftA.facility_id === shiftB.facility_id;
      const threshold = isSameFacility
        ? MAX_OVERLAP_SAME_FACILITY_MINS
        : MAX_OVERLAP_DIFF_FACILITY_MINS;

      return res.json({
        overlap_minutes: diff,
        max_overlap_threshold: threshold,
        exceeds_overlap_threshold: diff > threshold,
      });
    })
    .catch(next);
}

module.exports = {
  getAllShifts,
  compareShifts,
};

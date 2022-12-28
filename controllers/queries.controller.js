const client = require('../pg');

function getQuery4Result(req, res, next) {
  client
    .query(
      `select f.facility_id, j1.nurse_type_needed, (sum(j1.total_number_nurses_needed) - sum(j1.hired_count)) as total from
        (
          select j.job_id, j.nurse_type_needed, j.facility_id, j.total_number_nurses_needed, count(n.nurse_id) as hired_count from jobs as j
          left join nurse_hired_jobs as n on j.job_id = n.job_id
          group by j.job_id
        ) as j1
      left join facilities as f on j1.facility_id = f.facility_id 
      group by f.facility_id, j1.nurse_type_needed
      order by f.facility_id, j1.nurse_type_needed`
    )
    .then((result) => res.json(result.rows))
    .catch(next);
}

function getQuery5Result(req, res, next) {
  client
    .query(
      `select n1.nurse_id, n1.nurse_name, n1.nurse_type, (n2.total_jobs-n1.joined_count) as available_jobs from
      (
        select n.nurse_id, n.nurse_name, n.nurse_type, count(job_id) as joined_count from nurses n
        left join nurse_hired_jobs h on n.nurse_id = h.nurse_id
        group by n.nurse_id
      ) as n1 
      left join 
      (
        select n.nurse_id, count(j.job_id) as total_jobs from nurses as n
        left join jobs j on n.nurse_type=j.nurse_type_needed
        group by n.nurse_id
      ) as n2 on n1.nurse_id=n2.nurse_id`
    )
    .then((result) => res.json(result.rows))
    .catch(next);
}

function getQuery6Result(req, res, next) {
  client
    .query(
      `select distinct n.nurse_name from nurse_jobs_view n
        where n.facility_id in
        (
          select facility_id from nurse_jobs_view
          where nurse_id=$1
        ) and n.nurse_id <> $1`,
      [req.query.nurse_id]
    )
    .then((result) => res.json(result.rows.map((r) => r.nurse_name)))
    .catch(next);
}

module.exports = {
  getQuery4Result,
  getQuery5Result,
  getQuery6Result,
};

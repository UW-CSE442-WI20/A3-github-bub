(
# number of events per day in 2019
SELECT max(created_at) AS datetime, EXTRACT(DAYOFYEAR FROM created_at) AS day_of_year, EXTRACT(WEEK from created_at) AS week, EXTRACT(DAYOFWEEK from created_at) AS day_of_week, COUNT(*) as event_count
FROM `githubarchive.year.2019`
WHERE EXTRACT(YEAR FROM created_at) = 2019
GROUP BY day_of_year, week, day_of_week
ORDER BY day_of_year ASC
)

UNION ALL

(
# number of events per day in 2019 from 2018 dataset
SELECT max(created_at) AS datetime, EXTRACT(DAYOFYEAR FROM created_at) AS day_of_year, EXTRACT(WEEK from created_at) AS week, EXTRACT(DAYOFWEEK from created_at) AS day_of_week, COUNT(*) as event_count
FROM `githubarchive.year.2018`
WHERE EXTRACT(YEAR FROM created_at) = 2019
GROUP BY day_of_year, week, day_of_week
ORDER BY day_of_year ASC
)


SELECT *
FROM
(

(
# number of events per day in 2019
SELECT
    EXTRACT(DAYOFYEAR FROM created_at) AS day_of_year,
    EXTRACT(DAY FROM created_at) AS day_of_month,
    EXTRACT(DAYOFWEEK FROM created_at) AS day_of_week,
    EXTRACT(WEEK FROM created_at) AS week_,
    EXTRACT(MONTH FROM created_at) AS month_,
    EXTRACT(QUARTER FROM created_at) AS quarter_,
    EXTRACT(YEAR FROM created_at) AS year_,
    COUNT(*) as event_count
FROM `githubarchive.year.2019`
GROUP BY day_of_year, day_of_month, day_of_week, week_, month_, quarter_, year_
)

UNION ALL

(
# number of events per day in 2018
SELECT
    EXTRACT(DAYOFYEAR FROM created_at) AS day_of_year,
    EXTRACT(DAY FROM created_at) AS day_of_month,
    EXTRACT(DAYOFWEEK FROM created_at) AS day_of_week,
    EXTRACT(WEEK FROM created_at) AS week_,
    EXTRACT(MONTH FROM created_at) AS month_,
    EXTRACT(QUARTER FROM created_at) AS quarter_,
    EXTRACT(YEAR FROM created_at) AS year_,
    COUNT(*) as event_count
FROM `githubarchive.year.2018`
GROUP BY day_of_year, day_of_month, day_of_week, week_, month_, quarter_, year_
)

)
ORDER BY day_of_year ASC
;

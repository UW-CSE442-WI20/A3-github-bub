# number of distinct users (generating any events) per day in 2019
select EXTRACT(DAY from created_at) as day, EXTRACT(WEEK from created_at) as week, EXTRACT(DAYOFWEEK from created_at) as day_of_week, count(distinct actor.id) as cnt
from `githubarchive.year.2019`
group by day, week, day_of_week
order by day asc
;

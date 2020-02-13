with ctperrepoperday as
(
select EXTRACT(DAYOFYEAR from created_at) as day, repo.name as reponame, COUNT(*) as evtct
from `githubarchive.year.2019`
where type = 'PushEvent'
group by day, reponame
)

select c1.day as day, c1.maxevtct as maxevtct, c2.reponame as reponame
from
(
select day, MAX(evtct) as maxevtct
from ctperrepoperday
group by day
) c1
inner join ctperrepoperday c2 on c1.day = c2.day and c1.maxevtct = c2.evtct
order by day asc
;

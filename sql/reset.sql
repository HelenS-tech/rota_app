/*full reset*/

update shifts
set "claimedBy" = '[]'::jsonb;

update shifts
set
  "recentlyCancelled" = false,
  "cancelledBy" = null,
  "cancelledAt" = null;

update claim_schedule
set completed = false;

/*is run clear*/

select id, date, role, time, "claimedBy"
from shifts
where jsonb_array_length("claimedBy") > 0;


/*set  month date*/

update month_release
set opens_at = now() + interval '30 minutes'
where year = 2026
  and month = 6;
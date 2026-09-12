alter table public.meetings
  add column if not exists semester_id uuid references public.semesters(id) on delete restrict;

update public.meetings as meeting
set semester_id = semester.id
from public.semesters as semester
where meeting.semester_id is null
  and meeting.date between semester.starts_on and semester.ends_on;

create index if not exists meetings_semester_idx on public.meetings(semester_id);

do $$
begin
  if exists (select 1 from public.meetings where semester_id is null) then
    raise notice 'Some existing meetings could not be linked to a semester. Assign them before using them in semester reports.';
  end if;
end $$;

-- Add editable About page and footer content to the public settings record.
alter table public.landing_page_settings
  add column if not exists about_heading text not null default 'About UNIMA Gavel Club',
  add column if not exists about_content text not null default 'The UNIMA Toastmasters Gavel Club is a student-led community at the University of Malawi built around one goal: helping members become confident, capable communicators and leaders.\n\nThrough regular meetings, prepared and impromptu speeches, evaluation, and rotating leadership roles, members practice real skills in a supportive environment, skills that carry far beyond the meeting room.\n\nWhatever brought you here, whether overcoming a fear of public speaking, sharpening your leadership, or simply finding a community of ambitious peers, there is a place for you at Gavel Club.',
  add column if not exists about_image text,
  add column if not exists about_image_alt text not null default 'Students at a leadership meeting',
  add column if not exists footer_description text not null default 'A student community at the University of Malawi focused on developing communication, public speaking, leadership and confidence.',
  add column if not exists footer_address text not null default 'University of Malawi, Zomba, Malawi',
  add column if not exists footer_email text not null default 'gavelclub@unima.ac.mw',
  add column if not exists footer_phone_1 text,
  add column if not exists footer_phone_2 text,
  add column if not exists footer_copyright text not null default 'UNIMA Toastmasters Gavel Club. All rights reserved.';

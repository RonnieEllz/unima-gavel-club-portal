# UNIMA Gavel Club Portal User Guide

This guide explains how to use the portal as a member, meeting organizer, and administrator. It follows the actual flows built into the application and is intended for everyday club operations.

## 1. What the system does

The portal is a membership and engagement platform for the UNIMA Gavel Club. It supports:

- Member registration and login
- Member profile management
- Meeting creation and check-in
- Attendance tracking
- Administrative review of members
- News and updates publishing
- Story publishing
- Photo gallery uploads
- Reports and exports
- Role-based administration

The main public pages include the landing page, about page, stories, and updates. Members log in to access their personal dashboard and club activity.

---

## 2. Accessing the system

### Public access

Visitors can:

- View the home page
- Learn about the club from the About page
- Read stories and updates
- Join the club by creating a member account
- Log in if they already have an account

### Member access

1. Open the site from your deployed Vercel URL.
2. Go to the Join page.
3. Fill in the required registration details.
4. Submit the form.
5. Log in from the Login page.

### Admin access

Once a user has been assigned an admin role in the database, they can access the Admin Dashboard from the main navigation.

The system supports these roles:

- Super Admin: full access
- Administrator: members, meetings, attendance, and content
- Operations Administrator: members, meetings, attendance, reports, and exports
- Treasurer: payment management only
- Content Administrator: updates, stories, and gallery only

---

## 3. How members use the portal

### Registering a new account

1. Go to the Join page.
2. Enter your details.
3. Submit the form.
4. Confirm your account through the normal Supabase authentication flow.
5. After registration, your account may remain pending until an admin approves it.

### Logging in

1. Go to the Login page.
2. Enter your email and password.
3. You will be redirected to your dashboard.

### Using the dashboard

The dashboard is the member area. From there, members can:

- View personal profile information
- See upcoming meetings
- Review attendance history
- Update profile details
- Access club information and announcements

### Updating a profile

1. Open the Dashboard.
2. Go to Profile.
3. Update the fields you need.
4. Save the changes.

### Checking in for a meeting

1. Open the meeting page or dashboard meeting area.
2. Select an active meeting.
3. Complete the check-in process while the meeting status is open.
4. Confirm attendance.

Only meetings that are currently open for check-in will accept member attendance entries.

---

## 4. How admins manage the club

### Accessing the admin area

1. Log in with an admin account.
2. Open the Admin Dashboard.
3. Use the admin navigation to access each area.

The admin pages are organized by function:

- Members
- Meetings
- Attendance
- Reports
- Updates
- Stories
- Gallery
- Administrators
- Settings
- Semesters

---

## 5. Admin workflow for members

### Approving a new member

1. Open the Admin Dashboard.
2. Go to Members.
3. Find the member who is still pending.
4. Change their status from pending to active.
5. Save the change.

Once approved, the member can fully use the available member features.

### Reviewing member records

From the members section, admins can:

- View member details
- Check statuses
- Manage access-related records
- Identify active and pending members

---

## 6. Admin workflow for meetings

### Creating a meeting

1. Go to Meetings.
2. Fill in the meeting details.
3. Save the meeting.

### Opening and closing check-in

1. Go to the meeting list.
2. Click Open Check-in when the meeting begins.
3. Members can then check in.
4. When the meeting ends, click Close Check-in.
5. Attendance becomes final.

This keeps attendance records accurate and prevents late or duplicate check-ins after meetings are closed.

---

## 7. Admin workflow for attendance

Attendance tracking is one of the key club functions.

### What admins do

- Create meetings
- Open attendance for a meeting
- Review who checked in
- Fix attendance records when needed
- Export attendance data for reporting

### Correcting attendance

If needed, the system includes attendance correction tools to adjust records after a meeting has been closed.

---

## 8. Managing content and club updates

### Publishing an update

1. Go to Updates.
2. Create a new post.
3. Add a title, content, and any supporting details.
4. Publish it.

Use updates for club announcements, reminders, and communications.

### Publishing a story

1. Go to Stories.
2. Create a story entry.
3. Add title, body, and relevant metadata.
4. If needed, attach a cover image that was uploaded through the gallery.
5. Publish the story.

### Uploading gallery photos

1. Go to Gallery.
2. Upload the image file.
3. Use the uploaded image in stories or other content blocks.

This is especially useful for club events, sessions, and member highlights.

---

## 9. Reports and exports

The admin area includes reporting tools for club operations.

### Common reports

- Member reports
- Attendance reports
- Exportable lists for administrative use

Use the reports area to prepare summaries, review participation, and support club operations.

---

## 10. Managing administrators

Only Super Admins should manage administrator assignments.

### Adding an administrator

1. Go to Administrators.
2. Select an active member.
3. Assign a role.
4. Save the change.

This is where the club can give specific people access to administrative sections such as meetings, attendance, content, or full platform administration.

Assign the Treasurer role to users who should manage payment status without access to wider operations. Treasurers use the Payments page to search members and mark them paid or unpaid.

The Payments page also supports exports for all members, paid members, or unpaid members. For batch changes, select the members, choose the new payment status, and confirm with the Treasurer's password.

---

## 11. Recommended day-to-day process

For most clubs, the standard cycle looks like this:

1. New members register.
2. Admin approves them.
3. Members log in and update their profiles.
4. Admin creates meetings.
5. Members check in when the meeting is open.
6. Admin closes check-in when the meeting ends.
7. Admin reviews attendance and reports.
8. Admin publishes updates and stories.
9. Gallery assets are uploaded when needed.

This creates a clean operational rhythm for the club.

---

## 12. Security and access guidance

The system uses Supabase authentication and database-level Row Level Security. This means:

- Members cannot access other members' private data.
- Admin areas are restricted by role permissions.
- The service role key must stay server-only and should not be exposed in the browser.

The middleware helps with navigation protection, but the main enforcement is done by the database policies.

---

## 13. Common support questions

### I cannot log in

- Confirm your account exists.
- Check the password.
- Ask an admin whether your account is active.
- Confirm you are using the live site URL.

### I cannot see the admin dashboard

- Check whether your account has an admin role.
- Ask a Super Admin to assign the correct role.

### Members cannot check in

- Confirm the meeting is open for check-in.
- Check whether the member is approved and active.
- Confirm the meeting has not already been closed.

### Content is not appearing

- Check whether the relevant record was published.
- Confirm the gallery asset exists and the link is valid.
- Check whether the page or section has the correct permission setup.

---

## 14. Best practices

- Approve members quickly so they can fully participate.
- Open and close attendance at the correct times.
- Keep the gallery organized and descriptive.
- Publish updates regularly.
- Review reports monthly to track engagement.
- Keep admin roles limited to the right people.

---

## 15. Final note

This system is designed to be practical for a Toastmasters or public speaking club environment. The easiest way to run it well is to keep the workflow simple: approve members, run meetings, track attendance, publish updates, and maintain clean admin roles.

If you want, this guide can also be turned into a shorter staff handbook, a public-facing member guide, or a page inside the application itself.

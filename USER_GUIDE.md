    # UNIMA Gavel Club Portal User Guide

This guide explains how the system works for all users, from ordinary members to Super Admins. It is designed as a practical handover document so that club leaders can understand the platform, its roles, responsibilities, and operational flow without needing to inspect the code.

---

## 1. Purpose of the system

The Gavel Club Portal is the club's main digital system for managing:

- member registration and approval
- member profile updates
- club meetings and attendance
- semester tracking
- communication and updates
- story and gallery content
- reports and exports
- administrator access and permissions
- payment tracking and membership management

The platform supports both the public-facing website and the club's internal admin tools.

---

## 2. User types and access overview

The system separates users into three main groups:

1. Public visitors
2. Regular club members
3. Administrators

### Public visitors
Public visitors can browse:

- the home page
- the About page
- stories and updates
- club information and announcements

They cannot see member-only data or admin pages.

### Regular members
Regular members can:

- create and manage their own account
- log in to their dashboard
- update profile information
- view upcoming meetings
- check in to meetings when the meeting is open
- review their own attendance history
- view club updates and stories
- view payment instructions if configured

Regular members cannot manage the admin system or other members' information.

### Administrators
Administrators can manage club operations depending on their assigned role. The portal supports the following admin roles:

- Super Admin
- Administrator
- Operations Administrator
- Treasurer
- Content Administrator

---

## 3. Role definitions and responsibilities

### 3.1 Regular member
A regular member is a person whose account is approved and active. They can:

- access the dashboard
- update their profile
- view updates and stories
- join club meetings and check in
- view their attendance record
- receive reminders and club information

They do not have admin privileges.

### 3.2 Pending member
A pending member is a user whose account has been created but not yet approved. In this state, the member may be in the review process and cannot yet fully operate as a club member. A club admin must approve the account before the member becomes active.

### 3.3 Active member
An active member is approved and can fully use the member features of the portal. Active status is necessary for most operational features, including meeting attendance check-in.

### 3.4 Inactive, rejected, and alumni members
These members are not active participants in the current club cycle. Their records remain in the system for history and reporting, but they are not treated as active members for operational purposes such as live attendance tracking.

### 3.5 Administrator
Administrators supervise the club's operational systems. They can:

- approve new members
- manage member records
- create and open meetings
- review attendance and exports
- manage content and gallery items
- review reports and settings
- view audit history
- manage semesters
- reset passwords when required

This role is operationally broad but still cannot assign or remove admin roles unless they are a Super Admin.

### 3.6 Operations Administrator
This role focuses on live club operations. Responsibilities include:

- member administration
- meeting oversight
- attendance tracking
- reports and exports
- operational data management

This role is not intended for broad system control, payment access, or full content management.

### 3.7 Treasurer
The Treasurer is a payment-focused role. They can:

- review payment information
- update membership payment status
- export payment lists
- manage payment workflows

They do not manage members at the same level as general admins, and they do not manage settings, semesters, or content.

### 3.8 Content Administrator
This role manages public communication and club visibility. They can:

- create updates
- publish stories
- upload gallery images
- manage content used on public pages

They do not manage member status, attendance, meetings, or system settings.

### 3.9 Super Admin
The Super Admin has full platform authority. This person can:

- approve or reject members
- manage all admin roles
- manage meetings and attendance
- manage reports and exports
- manage settings and semesters
- manage the public website content
- view audit trails and admin activity
- configure the platform at the highest level

This is the system owner role and should be held by a trusted club leader or administrator.

---

## 4. How the access system works

The application uses two main checks:

1. Membership status check
2. Administrative role check

### 4.1 Membership status check
The system treats membership status differently from admin role. A user may be approved, pending, inactive, alumni, or rejected. The operational functions depend on whether the user is active.

For example:

- active members can view and use member operational tools
- pending members are not yet fully active
- inactive or alumni members are not considered active participants in the running semester

### 4.2 Administrative role check
Each admin section is tied to a role. The system checks the user's role before allowing access to specific admin pages or actions.

Examples:

- only Super Admins can manage administrators
- only roles with payment access can enter payment management pages
- only administrators and Super Admins can manage semesters and settings
- content access is limited to content-related roles

This keeps responsibilities separated and limits risk.

---

## 5. Member workflow

### 5.1 Registering a new account

1. Open the site.
2. Go to the Join page.
3. Complete the required fields.
4. Submit the registration form.
5. Confirm the account using the normal authentication flow.
6. Wait for admin approval before full access is granted.

### 5.2 Logging in

1. Go to the Login page.
2. Enter the email and password.
3. The system redirects the user to the dashboard.

### 5.3 Dashboard overview
The dashboard shows:

- the member greeting and profile summary
- membership status
- current payment status
- meeting attendance counts for the active semester
- progress toward badges
- next meeting information
- updates and stories
- WhatsApp link when applicable

### 5.4 Updating profile information

1. Open the dashboard.
2. Go to the Profile page.
3. Make the needed changes.
4. Save the record.

### 5.5 Meeting check-in

1. Open the Meetings section.
2. Select an open meeting.
3. Confirm the meeting is still accepting attendance.
4. Complete the check-in process.

Attendance is only accepted while a meeting is open.

---

## 6. Admin workflow

### 6.1 Accessing the admin area

1. Log in with an admin account.
2. Open the Admin Dashboard.
3. Use the role-specific navigation to manage the appropriate section.

### 6.2 Approving members

1. Open the Members page.
2. Find the pending member.
3. Change their membership status to active.
4. Save the record.

This action enables the member to use the full member-facing features.

### 6.3 Managing meetings

1. Go to Meetings.
2. Create the meeting with the relevant details.
3. Open check-in when the meeting begins.
4. Close check-in when the meeting ends.
5. Review attendance after closing.

### 6.4 Managing attendance
Attendance management includes:

- reviewing attendance records
- correcting errors if needed
- exporting attendance data
- checking participation trends

### 6.5 Managing reports and exports
Reports are used to review:

- attendance change over time
- member participation
- meeting records
- operational summaries
- payment-related lists

This is useful for monthly club reviews and leadership reporting.

### 6.6 Managing content
Content managers can create:

- updates
- stories
- gallery images
- site announcements

This keeps public communication current and attractive.

---

## 7. Semester management

Semesters are one of the most important operational features in the system. The club uses semesters to separate active club cycles and keep attendance reporting consistent.

### 7.1 Why semesters matter
Semesters help the platform:

- assign meetings to a specific term
- track participation for a current cycle
- show the club's live operational summary
- separate past periods from the current one
- support member progression and review

### 7.2 Semester lifecycle
A semester usually follows this flow:

1. Create semester
2. Set the date range
3. Activate the semester
4. Run meetings during that period
5. Close the semester when it ends
6. Review progress and move to the next term

### 7.3 Creating a semester
Only administrators or Super Admins can create semesters. The process requires:

- semester name
- start date
- end date

The system warns if dates overlap with an existing semester.

### 7.4 Activating a semester
When a semester is activated:

- it becomes the active club term
- live attendance and reports shift to that semester
- meeting records are linked to the active semester

This is the operational term that controls current club activity.

### 7.5 Closing a semester
Closing a semester marks the end of the active term. This may trigger progression checks for members or status updates. It is important to close semesters only after the end of the club cycle is confirmed.

### 7.6 Best practice

- keep one active semester at a time
- avoid overlapping dates
- review the active semester before running reports
- close the semester at the end of the session cycle

---

## 8. Achievement badges and member progress

The dashboard includes achievement badges to motivate member participation. These are based on attendance during the active semester.

### 8.1 Badge logic
The system calculates progress by counting meetings attended in the current semester. The badge list includes:

- First Step
- Consistent Presence
- Halfway Hero
- Committed Member
- Semester Champion
- Perfect Attendance

### 8.2 How badges are earned
Examples:

- attend 1 meeting to earn First Step
- attend 3 meetings to earn Consistent Presence
- attend 10 meetings to earn Semester Champion
- attend every completed meeting to earn Perfect Attendance

The dashboard displays the current target and the last earned achievement.

### 8.3 Why badges matter
Badges are useful because they:

- encourage regular attendance
- create member motivation
- give a quick visual indicator of progress
- support club engagement and healthy participation

---

## 9. Public website management

Public website content is managed from the Admin Dashboard in the Settings area. The main parts are:

- Landing page
- About page
- Footer
- Announcement banner
- WhatsApp group link
- Custom sections

For detailed editing instructions, see [PUBLIC_SITE_GUIDE.md](PUBLIC_SITE_GUIDE.md).

---

## 10. Payments and membership financial tracking

The payment module is used to track membership fees and payment status. Responsibilities are determined by the assigned admin role.

### Treasurer access
The Treasurer can:

- review payment status
- mark members as paid or unpaid
- export payment reports
- manage payment updates from the payments section

### Payment data and reporting
The system supports export options for:

- all members
- paid members
- unpaid members

Payment updates may require confirmation through the user's password for security.

---

## 11. Security and governance

The platform uses secure authentication and role-based access controls. This means:

- members cannot access other members' private information
- admin pages are protected by permission checks
- admin roles are limited by assignment and access policy
- only trusted users should receive admin rights
- the service-role key must remain server-side and never be exposed in the browser

The middleware and database policies work together to reinforce access control.

---

## 12. Operational best practices

The easiest way to keep the system healthy is to follow a simple routine:

1. approve new members quickly
2. create the semester before the club cycle begins
3. create and schedule meetings
4. open attendance when the meeting starts
5. close attendance when the meeting ends
6. review attendance records after each session
7. publish updates and stories regularly
8. keep public website content accurate
9. review reports and payment status regularly
10. keep admin roles limited to trusted people

---

## 13. Common issues and fixes

### I cannot log in
- confirm the account exists
- confirm the password is correct
- check whether the account is pending or inactive
- confirm the correct site URL is being used

### I cannot see the admin dashboard
- confirm the user has an admin role
- ask a Super Admin to assign the correct role
- check whether the user is on the correct account

### Members cannot check in
- confirm the meeting is open
- confirm the member is active
- confirm the meeting has not already been closed

### My dashboard shows no attendance
- check whether the current semester is active
- check whether meetings were created in the current term
- confirm the member attended a valid meeting

### Public website content is outdated
- update the landing page or About page in the Settings area
- update the footer contact details
- review the announcement banner and the WhatsApp link

---

## 14. Handover checklist for the next administrator

Before handing the system over to a new admin, confirm the following:

- at least one Super Admin exists
- admin roles are assigned appropriately
- one active semester is set up
- the meeting calendar is active
- payment information is correct
- public site content is current
- WhatsApp link is configured
- gallery and stories are updated as needed
- reports and exports are working
- the admin knows where to edit public content and manage roles

---

## 15. Final note

This platform is designed to support a real club environment rather than a simple static website. The system depends on a healthy rhythm: approve members, create and run meetings, track attendance, manage semesters, publish updates, and keep admin responsibilities clear.

The most important operational principle is simple: keep the club information current, keep admin access controlled, and treat the active semester as the center of the club's operational calendar.

For public site content editing, use [PUBLIC_SITE_GUIDE.md](PUBLIC_SITE_GUIDE.md). For system setup and broader handover details, use [SYSTEM_HANDOVER_GUIDE.md](SYSTEM_HANDOVER_GUIDE.md).

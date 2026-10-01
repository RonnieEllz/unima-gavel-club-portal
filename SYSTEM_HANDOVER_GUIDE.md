# System Handover Guide

This document is the complete operational handover for the UNIMA Gavel Club Portal. It is intended for the club, administrators, and future maintainers who need to understand how the system works, who controls what, and how to keep the system running safely and consistently.

---

## 1. System overview

The platform is a club management and member engagement system for the UNIMA Gavel Club. It combines:

- a public-facing website
- member registration and login
- active member management
- meetings and attendance tracking
- semester-based operational reporting
- communication and content publishing
- payment tracking
- administrator role management

The system supports day-to-day club work without requiring separate spreadsheets or manual tracking.

---

## 2. Main system areas

### Public site
The public site includes:

- landing page
- About page
- stories and updates
- club announcement banner
- gallery and custom content blocks
- footer contact information

### Member area
The member area includes:

- dashboard
- profile management
- meeting access
- attendance history
- progress badges
- payment information

### Admin area
The admin area includes:

- members
- meetings
- attendance
- reports
- updates
- stories
- gallery
- administrators
- settings
- semesters
- payments

---

## 3. User roles and permissions

The system is protected by both membership status and admin role permissions.

### 3.1 Ordinary member
An ordinary member is a valid and approved club member. They can:

- log in
- access the dashboard
- manage personal details
- review attendance and meeting status
- see ongoing club information
- check in to open meetings
- view updates and stories

They cannot access admin areas or manage other members.

### 3.2 Pending member
This is the in-review state before a member is fully approved. The account may exist but the user is not yet operationally active.

### 3.3 Active member
This is the fully approved member state. Active members can use most day-to-day member-facing features.

### 3.4 Inactive, rejected, or alumni member
These records remain in the system as historical or non-active records. They are not treated as active participants for current operations.

### 3.5 Administrator
An Administrator can manage day-to-day club operations and content, with limits depending on the assigned role.

They can:

- approve members
- create and manage meetings
- track attendance
- review reports
- manage content and gallery items
- view settings and operational data
- manage semesters and system records
- reset member passwords when needed

### 3.6 Operations Administrator
This role is focused on running regular operations. It is designed for meeting and attendance management, reports, and exports.

### 3.7 Treasurer
This role is limited to payment tracking and payment administration. It is not a full operations authority.

### 3.8 Content Administrator
This role is limited to publication and public communication content.

### 3.9 Super Admin
This is the highest role. It has full authority over the system. Only a trusted person should hold this role.

The app enforces these permissions through the role-policy logic and the database access rules.

---

## 4. Role access model in practical terms

The system checks two separate things:

1. Is the user active in the club?
2. What admin role does the user have?

Examples:

- A member must be active to check in to meetings.
- A user must have a matching admin role to access admin sections.
- Only Super Admins can create or change administrator assignments.
- Treasurers are limited to payment features.
- Content Administrators do not manage operational or payment modules.

This separation keeps the system safe and ensures each person works only within their scope.

---

## 5. Membership lifecycle

The system is designed around a clear membership lifecycle:

1. New user registers
2. User account is created
3. User remains pending until review
4. Admin approves the member
5. Member becomes active
6. Member uses member features
7. Member can later become inactive, alumni, or rejected depending on club decisions

The club should review pending members regularly and approve them quickly so they can participate without delay.

---

## 6. Semester management

Semesters are central to the club's operational system. They separate the club year into workable periods and keep reports current.

### 6.1 Why semesters matter
Semesters help the system:

- bind meetings to a club term
- define active-cycle attendance
- show live member progress and attendance summaries
- support reports and historical comparison
- allow easier handover between club terms

### 6.2 Creating a semester
Only administrators and Super Admins can create semesters. The system requires:

- semester name
- start date
- end date

It also warns when date ranges overlap with previous semesters.

### 6.3 Activating a semester
The active semester controls current operations. Once a semester is activated:

- it becomes the live club term
- meeting summaries and dashboards use that term
- active member participation is tracked against it

### 6.4 Closing a semester
When the semester ends, the admin closes it. This marks the end of the operational cycle and allows the next term to begin cleanly.

### 6.5 Best practice

- keep one active semester at a time
- avoid overlapping semester ranges
- review the term before publishing reports
- complete a semester only after the club cycle has ended

---

## 7. Meetings and attendance

Meeting management is a core part of the club workflow.

### 7.1 Creating meetings
Admins create meetings with details such as:

- title
- date
- time
- venue
- relevant semester association

### 7.2 Open and close attendance
A meeting is only useful while attendance is active. The admin opens check-in at the beginning of the session and closes it at the end.

This prevents:

- late attendance entries
- duplicate check-ins
- inaccurate reporting

### 7.3 Attendance logic
The system only accepts attendance when:

- the meeting is active
- the member is active and approved
- the meeting is still open

This is enforced through the member and meeting logic in the application.

### 7.4 Attendance correction
If a mistake is found after a meeting closes, admins can adjust the attendance records when needed.

---

## 8. Achievement badges

The dashboard includes achievement badges that show member progress across the active semester. These badges are based on the number of meetings attended.

### Badge list
The system includes badges such as:

- First Step
- Consistent Presence
- Halfway Hero
- Committed Member
- Semester Champion
- Perfect Attendance

### Badge purpose
Badges are meant to:

- encourage regular attendance
- motivate members to stay engaged
- create visible progress appreciation
- support club culture and participation

### How they are calculated
The app compares attendance totals to meeting counts and meeting completion in the active semester. A member who attends every completed relevant meeting can earn the Perfect Attendance badge.

---

## 9. Public website management

Public-facing content is managed from the Settings section of the admin dashboard.

### Main public content areas

- Landing page
- About page
- Footer
- Announcement banner
- WhatsApp group link
- Custom sections

### Editing permissions
Only Administrator and Super Admin roles can edit public site content.

For detailed editing instructions, see [PUBLIC_SITE_GUIDE.md](PUBLIC_SITE_GUIDE.md).

---

## 10. Content publishing

The content system includes:

- updates
- stories
- gallery images
- custom landing sections

### Updates
Use updates for club announcements, reminders, and general information.

### Stories
Use stories for narrative content, club experiences, and member highlights.

### Gallery
Use the gallery to upload images and then reuse them across stories and marketing text.

### Announcement banner
The announcement banner is used for urgent or important public-facing notices.

---

## 11. Reports and exports

The admin system includes reporting and exports for operational use. These are especially useful for:

- attendance trends
- member participation summaries
- semester reports
- payment tracking
- operational reviews

Reports should be reviewed regularly so the club can act on participation and engagement data instead of relying on memory.

---

## 12. Payments and fee tracking

The system supports member payment tracking and transparency.

### Supported payment workflows
- review payment states
- mark members as paid or unpaid
- export payment lists
- manage payment details for membership instructions

### Role restrictions
Only payment-enabled roles can manage payment workflows. Treasurer is the main payment role.

---

## 13. Administrator responsibilities

### Routine admin work
The admin team should regularly:

- approve new members
- create and run meetings
- open and close check-in
- review attendance
- publish updates
- keep stories and gallery current
- confirm payment records
- check the dashboard for operational issues

### Security responsibility
Admin rights must be limited to trusted individuals. The system should not be managed casually or shared widely across unconfirmed staff.

---

## 14. Handover checklist

Before handing the project to a new operator, confirm the following:

- there is at least one Super Admin
- all admin roles are assigned appropriately
- a current semester is active
- meetings are being created for the active term
- the announcement banner is updated
- the About page and footer contain accurate information
- gallery and stories are current
- payment details are correct
- reporting and exports are working
- the next administrator knows where to edit public content

---

## 15. Important technical notes

### Database and security
The system uses Supabase and applies access restrictions at the database layer. This means the main enforcement does not depend only on UI restrictions.

### Middleware and route checks
The frontend and middleware are helpful for access control and navigation, but actual access guarantees come from the protected data layer and the role checks in the server logic.

### Environment and deployment
The project depends on environment values for database and authentication configuration. These must remain in the deployment environment and not be committed to insecure public sources.

---

## 16. Common troubleshooting

### Member cannot log in
- confirm the member account exists
- confirm the password is correct
- check the membership status
- confirm the correct site is being used

### Member cannot check in
- confirm the meeting is open
- confirm the member is active
- confirm the meeting was assigned to the current semester

### Admin cannot access a section
- confirm the role is correct
- confirm the administrator assignment exists
- confirm the user is logged in to the correct account

### Public page is outdated
- update the relevant settings area
- review the active announcement and footer contact details

### Semester not working as expected
- check whether an active semester exists
- confirm date ranges are valid
- review whether there are overlapping periods

---

## 17. Recommended operational rhythm

The easiest way to keep the system healthy is:

1. approve members quickly
2. create a semester before the club cycle starts
3. schedule meetings
4. open attendance during meetings
5. close attendance after the meeting
6. review attendance and reports
7. publish updates and stories
8. keep public content and contacts current
9. review payment status as needed
10. maintain role assignments carefully

---

## 18. Final handover summary

This system is not just a website. It is a club operations platform that manages membership, meeting activity, payment information, public communication, and administrator governance. The key to successful operation is simple:

- active membership drives member access
- clear admin roles drive system access
- semesters define the operational cycle
- badges support engagement and motivation
- public settings keep the club website accurate and attractive

If the club keeps the workflow disciplined and roles clearly assigned, the platform will continue to serve as a practical and reliable operational system.

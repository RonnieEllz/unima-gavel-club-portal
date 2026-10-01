# Public Site Editing Guide

This guide explains how to edit the public pages of the Gavel Club portal, including the landing page, About page, footer, announcement banner, and custom sections. Use this document when you need to keep the public-facing website current without changing the member or admin system logic.

## Index

- [1. Where public content is managed](#1-where-public-content-is-managed)
- [2. Who can edit public pages](#2-who-can-edit-public-pages)
- [3. Editing the landing page](#3-editing-the-landing-page)
- [4. Editing the About page](#4-editing-the-about-page)
- [5. Editing the footer](#5-editing-the-footer)
- [6. Editing the announcement banner](#6-editing-the-announcement-banner)
- [7. Editing the WhatsApp link](#7-editing-the-whatsapp-link)
- [8. Adding custom sections](#8-adding-custom-sections)
- [9. Save and confirmation flow](#9-save-and-confirmation-flow)
- [10. Common problems and fixes](#10-common-problems-and-fixes)
- [11. Recommended editing workflow](#11-recommended-editing-workflow)
- [12. Summary](#12-summary)

---

## 1. Where public content is managed

Public-facing content is edited from the Admin Dashboard:

1. Log in with an Administrator or Super Admin account.
2. Open the Admin Dashboard.
3. Go to Settings.
4. Use the sections for:
   - Landing page
   - About Page
   - Footer
   - Landing page announcement
   - WhatsApp group link
   - Custom sections

The public website content is controlled in the Settings area, not in the member dashboard.

---

## 2. Who can edit public pages

Only the following roles can edit public site settings:

- Administrator
- Super Admin

The app validates the user's role before allowing updates. If a user does not have an administrator role, they cannot edit public site content.

---

## 3. Editing the landing page

### Open the landing page editor

Go to:

Admin Dashboard -> Settings -> Landing page

### Fields you can update

#### Hero section
- eyebrow text
- main title
- short description
- hero image

#### Introduction section
- introduction heading
- introduction content
- introduction image
- image alt text

#### Visible sections
Use the checkboxes to show or hide:
- announcement banner
- introduction
- upcoming meeting
- latest stories
- latest updates
- photo gallery

#### SEO fields
- SEO title
- SEO description
- social sharing image

#### Custom sections
You can also add additional blocks to the landing page such as:
- membership information
- club values
- event notices
- special announcements

### Good practice
- separate paragraphs with a blank line for cleaner layouts
- keep alt text descriptive for accessibility
- save after each change

---

## 4. Editing the About page

### Open the About page editor

Go to:

Admin Dashboard -> Settings -> About Page

### Fields you can edit

- about heading
- about content
- about image
- about image alt text

### Best practice
Keep the About page focused on:

- the club mission
- the purpose of the organization
- member value and outcomes
- the club's culture and goals

Use blank lines between paragraphs to maintain readability.

---

## 5. Editing the footer

### Open the footer editor

Go to:

Admin Dashboard -> Settings -> Footer

### Fields you can edit

- footer description
- address
- email
- phone numbers
- Instagram URL
- TikTok URL
- copyright text

### What the footer is used for
The footer appears across public pages and usually includes:

- club description
- contact details
- address or location
- social media links
- copyright notice

### Best practice
Keep the footer accurate and brief. Update it whenever contact details or club information changes.

---

## 6. Editing the announcement banner

### Open the announcement editor

Go to:

Admin Dashboard -> Settings -> Landing page announcement

### What it does
The banner is used for:

- membership reminders
- event notices
- club updates
- urgent public information

Keep the text short, clear, and relevant.

---

## 7. Editing the WhatsApp link

### Open the WhatsApp settings

Go to:

Admin Dashboard -> Settings -> WhatsApp link

### What it does
The WhatsApp link allows interested members to join the club communication group.

Use a valid URL such as:

https://chat.whatsapp.com/...

Do not leave it blank.

---

## 8. Adding custom sections

### Open the custom section manager

Go to:

Admin Dashboard -> Settings -> Custom sections

### What custom sections do
Custom sections let you add extra content blocks to the landing page. These are useful for:

- membership categories
- club background
- program highlights
- leadership messaging
- calls to action

### Fields for each section

- section title
- section content
- optional image
- image alt text
- display order
- visibility toggle

Use display order to control the order in which sections appear.

---

## 9. Save and confirmation flow

When saving public content, the system:

1. validates the form values
2. checks admin permissions
3. confirms the settings password if required
4. saves the content to the database
5. refreshes the relevant public views

If there is an error, the system normally shows a clear message explaining what needs to be fixed.

---

## 10. Common problems and fixes

### I cannot edit the public page
Possible reasons:

- your account does not have an admin role
- your account is not assigned to Administrator or Super Admin
- the content area is restricted by permissions

Ask a Super Admin to confirm your role assignment.

### My changes do not appear
Check:

- the form saved successfully
- the correct section was edited
- the page was refreshed
- the section is not hidden behind a visible toggle

### The footer has outdated information
Update the footer fields in the Footer settings section.

### The About page is too long or messy
Shorten the text and separate paragraphs clearly to improve readability.

---

## 11. Recommended editing workflow

For a clean public site:

1. update the landing page hero and introduction text
2. review the announcement banner
3. update the About page to reflect club purpose and message
4. check the footer contact details
5. add or remove custom sections as needed
6. review the public page after saving

This keeps the website clear, professional, and easy for visitors to understand.

---

## 12. Summary

The public pages are managed from the admin Settings area. The main content sections are:

- Landing page
- About page
- Footer
- Announcement banner
- WhatsApp group link
- Custom sections

Only administrators and Super Admins should edit this content. Keep the information accurate, brief, and current so members and visitors always see the right club details.

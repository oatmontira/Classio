# Google Stitch Design Prompt

## Prompt หลักสำหรับ Google Stitch

ออกแบบเว็บแอปพลิเคชันชื่อ **SubmitHub** สำหรับจัดการการมอบหมายงานและการส่งงานของนักศึกษาในรายวิชาต่างๆ ระบบต้องรองรับผู้ใช้งาน 3 บทบาทคือ **Admin, Teacher, Student** โดยแต่ละบทบาทมี Dashboard และเมนูที่แตกต่างกันตามสิทธิ์การใช้งาน

เป้าหมายของดีไซน์คือทำให้การสร้างงาน ส่งงาน ตรวจงาน และติดตามสถานะงานเป็นเรื่องง่าย ชัดเจน และเป็นระบบ เหมาะกับสถาบันการศึกษา อาจารย์ และนักศึกษา ใช้งานได้ดีทั้ง desktop, tablet และ mobile browser

ให้สร้างดีไซน์เป็น **responsive web application** ไม่ใช่ landing page หน้าแรกหลัง login ควรเป็น Dashboard ที่ใช้งานได้ทันที

## Product Context

เว็บนี้ใช้สำหรับ:

- Admin จัดการผู้ใช้ รายวิชา และภาพรวมระบบ
- Teacher สร้างงานมอบหมาย ตรวจงาน ให้คะแนน และ feedback
- Student ดูงานที่ต้องส่ง ส่งงาน และติดตามคะแนนหรือ feedback

ระบบรองรับการส่งงานหลายรูปแบบ:

- PDF
- รูปภาพ เช่น JPG, PNG, WEBP
- Link URL
- Video หรือ video link

สถานะสำคัญที่ต้องแสดงใน UI:

- ยังไม่ส่ง
- ส่งแล้ว
- ส่งช้า
- ตรวจแล้ว
- เปิดรับ
- ปิดรับ
- เลยกำหนด
- ยังไม่เผยแพร่

## Visual Direction

ออกแบบให้เป็นเว็บแอปเพื่อการศึกษาและการทำงานจริง ภาพรวมควรดู:

- สะอาด
- ทันสมัย
- น่าเชื่อถือ
- อ่านง่าย
- ใช้งานซ้ำทุกวันได้โดยไม่ล้าสายตา
- เหมาะกับข้อมูลจำนวนมาก เช่น ตาราง รายการงาน สถานะ และสถิติ

หลีกเลี่ยงดีไซน์แบบ marketing website, hero section ขนาดใหญ่, layout ที่เน้นภาพสวยมากกว่าการใช้งานจริง หรือการ์ดลอยซ้อนกันเยอะเกินไป

## Color Palette

ใช้โทนสีหลัก: **ขาว, น้ำเงิน, ฟ้า, ม่วง**

แนะนำ palette:

- Background: `#F8FAFC`
- Surface / Card: `#FFFFFF`
- Primary Blue: `#2563EB`
- Deep Blue: `#1E40AF`
- Sky Blue: `#38BDF8`
- Purple Accent: `#7C3AED`
- Text Primary: `#0F172A`
- Text Secondary: `#64748B`
- Border: `#E2E8F0`
- Success: `#16A34A`
- Warning: `#F59E0B`
- Error: `#DC2626`
- Muted: `#94A3B8`

ควรใช้สีขาวเป็นพื้นหลังหลัก น้ำเงินเป็น primary action สีฟ้าเป็น highlight และสีม่วงเป็น accent เฉพาะจุด เช่น chart, tag, active state บางส่วน ห้ามทำให้ทั้งเว็บกลายเป็นสีม่วงหรือ gradient เยอะเกินไป

## Typography

ใช้ font ที่อ่านภาษาไทยได้ดี เช่น:

- Noto Sans Thai
- Prompt
- IBM Plex Sans Thai

แนวทาง typography:

- Heading ชัดเจน แต่ไม่ใหญ่แบบ landing page
- Body text อ่านง่าย
- ตารางและรายการต้องสแกนเร็ว
- ใช้ font weight เพื่อจัดลำดับข้อมูล
- หลีกเลี่ยงตัวอักษรแน่นหรือเล็กเกินไป

## Layout Requirements

### Desktop

- ใช้ left sidebar สำหรับ navigation หลัก
- Top bar มี search, notification icon, user profile และ role badge
- Content area กว้าง อ่านง่าย
- Dashboard ใช้ grid สำหรับ summary cards, charts และ task lists
- ตารางต้องมี filter, search และ status badge

### Tablet

- Sidebar อาจย่อเป็น icon rail
- Content grid ปรับเป็น 2 columns
- Table อาจเปลี่ยนเป็น compact layout

### Mobile

- ใช้ bottom navigation หรือ collapsible menu
- Dashboard summary cards เรียงเป็น single column
- ตารางควรแปลงเป็น list cards ที่อ่านง่าย
- ปุ่ม action หลักควรอยู่ในตำแหน่งที่กดง่าย
- Upload form ต้องใช้งานง่ายบนมือถือ

## Navigation Structure

### Shared Navigation

- Dashboard
- Courses
- Assignments
- Notifications
- Profile

### Admin Navigation

- Dashboard
- Users
- Courses
- Enrollments
- Assignments
- Submissions
- Reports
- Settings

### Teacher Navigation

- Dashboard
- My Courses
- Assignments
- Submissions
- Grading
- Students
- Notifications
- Profile

### Student Navigation

- Dashboard
- My Courses
- To Submit
- Submitted Work
- Grades
- Notifications
- Profile

## Required Screens

สร้างดีไซน์หน้าจอหลักต่อไปนี้ให้ครบ โดยเน้น MVP ก่อน

### 1. Login

หน้าจอเข้าสู่ระบบสำหรับทุก role

Elements:

- Logo / product name: SubmitHub
- Email input
- Password input
- Login button
- Forgot password link
- Optional role hint หรือ demo role selector สำหรับงาน prototype
- Clean educational visual background แบบ subtle ไม่ใช่ภาพ hero ใหญ่

State:

- Empty state
- Validation error
- Loading state หลัง login

### 2. Admin Dashboard

Dashboard สำหรับผู้ดูแลระบบ

Content:

- Summary cards:
  - Total Users
  - Teachers
  - Students
  - Courses
  - Assignments
  - Submissions
- Chart แสดง submission activity รายสัปดาห์
- Recent courses
- Recent submissions
- User role distribution
- Quick actions:
  - Add User
  - Create Course
  - Assign Teacher

### 3. User Management

หน้าจัดการผู้ใช้สำหรับ Admin

Content:

- User table
- Search by name, email, student code, teacher code
- Role filter: Admin, Teacher, Student
- Status filter: Active, Disabled
- Add user button
- Row actions: view, edit, disable
- Role badge
- Status badge

Create/Edit user form:

- Full name
- Email
- Role
- Student code หรือ Teacher code
- Status

### 4. Course List

หน้ารายการรายวิชา

Content:

- Course cards หรือ table layout
- Course code
- Course name
- Teacher
- Semester
- Academic year
- Number of students
- Number of assignments
- Status
- Search and filter
- Create course button สำหรับ Admin

### 5. Course Detail

หน้ารายละเอียดรายวิชา

Content:

- Course header พร้อม course code, name, teacher, semester
- Tabs:
  - Overview
  - Assignments
  - Students
  - Submissions
- Summary:
  - Students enrolled
  - Active assignments
  - Pending submissions
  - Graded submissions
- Assignment list ภายในรายวิชา
- Student enrollment list

### 6. Teacher Dashboard

Dashboard สำหรับอาจารย์

Content:

- My courses
- Assignments currently open
- Submissions waiting for review
- Upcoming deadlines
- Submission status chart
- Quick actions:
  - Create Assignment
  - Review Submissions
  - View Students

ควรทำให้ Teacher เห็นทันทีว่างานไหนต้องตรวจและรายวิชาไหนมีงานใกล้ครบกำหนด

### 7. Assignment List

หน้ารายการงานมอบหมาย

Content:

- Assignment table หรือ list
- Assignment title
- Course
- Due date
- Submission types allowed
- Published status
- Submission progress เช่น 24/38 submitted
- Grading progress เช่น 12 pending review
- Status badge: Draft, Open, Closed, Overdue
- Filter by course, status, due date
- Create assignment button สำหรับ Teacher

### 8. Create/Edit Assignment

ฟอร์มสร้างและแก้ไขงานมอบหมาย

Fields:

- Assignment title
- Course selector
- Description rich text area
- Max score
- Open date/time
- Due date/time
- Allowed submission types:
  - PDF checkbox
  - Image checkbox
  - Link checkbox
  - Video checkbox
- Allow resubmission toggle
- Late submission policy selector
- Publish toggle

UX:

- Form แบ่ง section ชัดเจน
- มี preview summary ด้านขวาบน desktop
- บน mobile ให้ preview อยู่ด้านล่าง
- มี validation message ใกล้ช่องที่ผิด

### 9. Assignment Detail

หน้ารายละเอียดงาน

Teacher view:

- Assignment title, course, due date, max score
- Submission status summary
- Student submission table
- Buttons: Edit Assignment, Review Submissions, Close Assignment

Student view:

- Assignment title, course, teacher, due date
- Description
- Allowed file types
- Submission status
- Submit / Edit Submission button
- Score and feedback ถ้าตรวจแล้ว

### 10. Student Dashboard

Dashboard สำหรับนักศึกษา

Content:

- Summary cards:
  - To submit
  - Due soon
  - Submitted
  - Graded
- Priority list: งานใกล้ครบกำหนด
- My courses
- Recent feedback
- Calendar หรือ deadline timeline

ควรทำให้นักศึกษาเห็นทันทีว่างานอะไรต้องส่งก่อน

### 11. Submission Form

หน้าส่งงานของนักศึกษา

Content:

- Assignment summary ด้านบน
- Due date พร้อม countdown หรือ due status
- Submission type selector:
  - Upload PDF
  - Upload Image
  - Add Link
  - Add Video Link / Upload Video
- Drag and drop upload area
- File preview list
- Link input with URL validation
- Optional note textarea
- Submit button
- Save draft button ถ้าเหมาะสม

States:

- Before upload
- Uploading with progress
- Upload success
- Upload error
- File type not allowed
- Late submission warning

### 12. Submission Review / Grading

หน้าตรวจงานสำหรับ Teacher

Layout:

- Left panel: student list พร้อม status
- Main panel: submitted files / link preview
- Right panel: grading form

Content:

- Student name, code, submitted time
- Late badge ถ้าส่งช้า
- File preview cards
- Open link button
- Download file button
- Score input
- Feedback textarea
- Save grade button
- Mark as reviewed button

ต้องทำให้ตรวจงานหลายคนต่อเนื่องได้เร็ว

### 13. Grade & Feedback

หน้าดูคะแนนสำหรับ Student

Content:

- Course
- Assignment
- Score / max score
- Feedback from teacher
- Submitted files or link
- Submitted time
- Reviewed time
- Status badge

### 14. Notifications

หน้าการแจ้งเตือน

Notification examples:

- งานใหม่ถูกเผยแพร่
- งานใกล้ครบกำหนด
- มีนักศึกษาส่งงานใหม่
- งานได้รับคะแนนแล้ว
- งานเลยกำหนด

Design:

- Unread state
- Read state
- Notification type icon
- Timestamp

### 15. Profile

หน้าข้อมูลผู้ใช้

Content:

- Name
- Email
- Role
- Student code หรือ Teacher code
- Profile photo placeholder
- Basic account settings

## Component Requirements

ใช้ component ต่อไปนี้ในดีไซน์:

- Sidebar navigation
- Top bar
- Search input
- Filter dropdown
- Segmented control
- Status badges
- Summary metric cards
- Data table
- Responsive list cards
- Modal หรือ side panel สำหรับ quick create
- Tabs
- Date picker fields
- File upload dropzone
- Progress indicator
- Toast notification
- Empty state
- Error state
- Confirmation dialog

## Status Badge Design

ออกแบบ status badge ให้แยกได้ชัด:

- ยังไม่ส่ง: gray
- ส่งแล้ว: blue
- ส่งช้า: orange
- ตรวจแล้ว: green
- เลยกำหนด: red
- Draft / ยังไม่เผยแพร่: gray outline
- Open / เปิดรับ: blue or green
- Closed / ปิดรับ: slate

## Icon Direction

ใช้ icon ที่สื่อความหมายชัดเจน:

- Dashboard
- Courses / book
- Assignment / clipboard
- Upload
- File PDF
- Image
- Link
- Video
- Users
- Graduation cap / student
- Teacher
- Notification bell
- Score / check circle
- Calendar / deadline
- Edit
- Download

## UX Priorities

1. ผู้ใช้ต้องรู้ทันทีว่าต้องทำอะไรต่อ
2. Teacher ต้องเห็นงานที่รอตรวจและสถานะการส่งของนักศึกษาเร็วที่สุด
3. Student ต้องเห็น deadline และสถานะการส่งของตนเองชัดเจน
4. Admin ต้องจัดการข้อมูลได้ด้วยตารางที่ค้นหาและกรองได้ดี
5. ทุกฟอร์มต้องมี validation และ error state
6. ทุก action สำคัญควรมี confirmation หรือ success feedback
7. Upload experience ต้องชัดเจน มี progress และผลลัพธ์หลัง upload

## Responsive Behavior

ออกแบบอย่างน้อย 3 breakpoint:

- Desktop: 1440px
- Tablet: 768px
- Mobile: 390px

สำหรับ mobile:

- ลด sidebar เป็น bottom navigation หรือ hamburger menu
- ตารางเปลี่ยนเป็น stacked cards
- ปุ่ม primary action ต้องมองเห็นง่าย
- upload area ต้องกดเลือกไฟล์ได้ชัด
- หลีกเลี่ยง text แน่นเกินไป

## Sample Content

ใช้ข้อมูลตัวอย่างต่อไปนี้ใน mockup:

Courses:

- CS101 Introduction to Programming
- IT204 Web Application Development
- DS310 Data Visualization
- ENG102 Academic Writing

Teachers:

- Asst. Prof. Narin S.
- Dr. Kanya P.
- Ajarn Thanawat R.

Students:

- Nicha Boonmee, 661234001
- Poom Rattanakul, 661234002
- Sirin Chaiyaporn, 661234003
- Tanapol Wongsawat, 661234004

Assignments:

- Lab 03: Form Validation
- Final Project Proposal
- Data Chart Analysis
- Research Summary PDF

Submission examples:

- `lab03-validation.pdf`
- `wireframe-homepage.png`
- `https://drive.google.com/...`
- `https://youtube.com/...`

## Design Output Expectations

ให้สร้าง UI ที่ดูเหมือนระบบจริงพร้อมใช้งาน ไม่ใช่ wireframe เปล่า ควรมีรายละเอียดดังนี้:

- สีและ typography สมบูรณ์
- spacing สม่ำเสมอ
- component state ชัดเจน
- dashboard มีข้อมูลตัวอย่าง
- form มี field ครบ
- table มี row ตัวอย่าง
- upload UI มีหลาย state
- responsive layout เห็นได้ชัด

## Important Constraints

- ห้ามออกแบบเป็น landing page
- ห้ามใช้ hero section เป็นหน้าหลัก
- ห้ามใช้ gradient หนักหรือพื้นหลังรก
- ห้ามทำ dashboard เป็น card ซ้อน card หลายชั้น
- ห้ามทำสีทั้งเว็บเป็นม่วงหรือฟ้าอย่างเดียว
- ห้ามละเลย mobile layout
- ห้ามใช้ placeholder text เยอะเกินไป ให้ใช้ข้อมูลตัวอย่างจริงจากบริบทการศึกษา
- UI ต้องรองรับภาษาไทยได้ แม้ข้อมูลตัวอย่างบางส่วนเป็นภาษาอังกฤษ

## Short Prompt Version

Design a responsive web app called **SubmitHub** for university assignment submission management. It has 3 roles: Admin, Teacher, Student. Admin manages users and courses. Teacher creates assignments, reviews submissions, grades work, and gives feedback. Student views assignments, uploads PDF/images, submits links or videos, and checks status, scores, and feedback.

Use a clean modern education/productivity UI, not a landing page. Main colors: white, blue, sky blue, and purple accent. Use dashboards, tables, status badges, forms, upload dropzones, notifications, and responsive layouts. Create screens for Login, Admin Dashboard, User Management, Course List, Course Detail, Teacher Dashboard, Assignment List, Create/Edit Assignment, Assignment Detail, Student Dashboard, Submission Form, Submission Review/Grading, Grade & Feedback, Notifications, and Profile. Prioritize clear deadlines, submission status, role-based navigation, easy upload flow, and fast teacher grading workflow.


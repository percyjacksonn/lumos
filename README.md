<div align="center">

<img src="assets/lumos-hero.svg" width="100%" alt="Lumos - Find it. Save it. Study it."/>

### 📚 A study-material sharing portal, built by students for students

<p>
  <img src="https://img.shields.io/badge/Status-In%20Development-F0523A?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Project-2nd%20Year%20CSE-3AACFF?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Platform-Web-9b6df0?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Hosting-Free-2FAE73?style=for-the-badge"/>
</p>

<a href="https://percyjacksonn.github.io/lumos-/"><b>🌐 Open Lumos</b></a>
&nbsp;•&nbsp;
<a href="#-contribute-to-lumos"><b>⬆️ How to contribute</b></a>
&nbsp;•&nbsp;
<a href="#-set-up-your-own-lumos"><b>🛠️ Run your own</b></a>

</div>

<br>

> _"Finding your study material shouldn't become a study session itself."_ 😭

Notes, question papers and lab manuals end up scattered across WhatsApp groups, Google Classroom and random drives.
**Lumos puts them in one organised place**, sorted by **department → year → semester → subject**.

<div align="center">

`🔎 FIND` &nbsp;➜&nbsp; `🧭 BROWSE` &nbsp;➜&nbsp; `📄 PREVIEW` &nbsp;➜&nbsp; `❤️ SAVE` &nbsp;➜&nbsp; `🎓 STUDY`

</div>

---

## ✨ What you can do

| | |
|---|---|
| 🧭 **Browse by path** | Pick your department, year, semester and subject. Every level is one tap. |
| 🗂️ **Seven categories** | Notes · Previous Year Papers · Important Questions · Assignments · Lab Materials · Syllabus · Reference |
| 🔢 **Unit-wise notes** | Notes, Important Questions and Assignments are grouped by **Unit 1-8**. Lab materials simply say *Lab Materials*. |
| 🔎 **Smart search** | Type `DBMS` and find *Database Management Systems*. Search works on names, course codes and initials. |
| 📄 **Preview in the browser** | Open the PDF right on the page, or download it. |
| ❤️ **Save for later** | Heart any resource. Your saved notes and download history follow your account. |
| 👤 **Real accounts** | Sign up with email and password, or log in with a 6-digit email code. Pick an avatar and a display name. You stay signed in on refresh. |
| ⬆️ **Contribution portal** | Authorised contributors upload PDFs. The admin reviews them before they go live. |

---

## ⬆️ Contribute to Lumos

<div align="center">
<img src="assets/lumos-flow.svg" width="100%" alt="Log in, enter the secret code, upload a PDF, the admin reviews it, then it becomes a live card"/>
</div>

**Only the Lumos admin and people who have the secret code can contribute.** Anyone can open the Contribute page and read how it works. Uploading needs a login and the code.

```mermaid
flowchart LR
    A([Visitor opens Contribute]) --> B{Logged in?}
    B -- No --> C[Log in or sign up]
    C --> D
    B -- Yes --> D{Secret code correct?}
    D -- "Wrong, 3rd time" --> X[Blocked for 30 min + admin email]
    D -- Wrong --> D
    D -- Correct --> E[Upload PDF + details]
    E --> F[(Supabase Storage + resources table)]
    F --> G{Admin review}
    G -- Approve --> H([Live Lumos card])
    G -- Reject --> I([Hidden])
```

---

## 🔒 How it is kept safe

| Area | What protects it |
|---|---|
| **Secret code** | Stored only as a bcrypt hash in a table the browser can't read. Never in the repo. |
| **Who can approve or delete** | Enforced by Supabase **Row Level Security**, not by hiding buttons. A normal user calling the API directly is refused. |
| **Uploads** | Only into your own folder, **PDF only**, **25 MB max**, no overwriting existing files. |
| **Pending files** | Not listed and not downloadable through the site until the admin approves them. |
| **Passwords** | Handled entirely by Supabase Auth. Lumos never stores them. |
| **Emails** | Sent from the database with a key kept in Supabase. No code or password is ever emailed. |

---

## 🛠️ Tech stack

<div align="center">

<img src="https://skillicons.dev/icons?i=html,css,js,git,github" /><br><br>

<img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white"/>
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
<img src="https://img.shields.io/badge/GitHub%20Pages-181717?style=for-the-badge&logo=github&logoColor=white"/>

</div>

```mermaid
flowchart TD
    U[🌐 Browser<br/>HTML · CSS · JavaScript] -->|login, data| S[(☁️ Supabase)]
    S --> A[Auth<br/>accounts + sessions]
    S --> P[(Postgres<br/>resources · profiles · saved)]
    S --> B[Storage<br/>study-materials PDFs]
    P -->|trigger| M[✉️ Email alert to admin]
```

No framework and no build step: plain HTML, CSS and JavaScript talking to Supabase, hosted free on GitHub Pages.

---


---

## 📁 Project files

```
lumos-/
├── index.html        the page shell
├── style.css         the whole look: doodle cards, colours, animations
├── script.js         browsing, search, login, profile, saved, downloads
├── contribute.js     the contribution portal + admin review page
└── images/           screenshots used in this README
```

---

## 🛠️ Set up your own Lumos

<details>
<summary><b>Click to open the steps</b> (about 20 minutes, all free)</summary>

<br>

1. **Clone it**
   ```bash
   git clone https://github.com/percyjacksonn/lumos-.git
   cd lumos-
   ```
2. **Create a free project** at [supabase.com](https://supabase.com). Under *Project Settings → API* copy the project URL and the public (publishable) key.
3. **Paste them into `script.js`** at the top (`supabaseUrl` and `supabaseKey`). Never paste a `service_role` key into the website.
4. **Create a bucket** called `study-materials` in *Storage* and set it to **Public**.
5. **Run the database setup** in *SQL Editor → Create a new snippet*, one file per snippet and in order: the base setup (profiles, saved, downloads), then the contribution setup, then your secrets file (access code, your admin email, email key).
6. **Turn on email alerts (optional)** with a free [Resend](https://resend.com) key.
7. **Open `index.html`** with VS Code Live Server, or publish the repo with *Settings → Pages*.

> 🔑 Keep the file that holds your access code and email key **out of GitHub**.

</details>

---

## 🍴 Fork & improve

Want to experiment? Fork the repo and build on top of it. Found a bug or have an idea? Open an issue or send a pull request. Pull requests and kind suggestions are always welcome. 💛

---



<div align="center">

**Made with 💛**

<sub>⭐ If Lumos helped you study, give it a star.</sub>

</div>

<img src="https://capsule-render.vercel.app/api?type=waving&color=F0523A&height=120&section=footer" width="100%"/>

# Revan Josh - Professional Portfolio

A modern, highly responsive, and dynamic personal portfolio built for showcasing Web Development, UI/UX Design, and Graphic Design projects. This portfolio doesn't just look premium on the frontend—it is powered by a custom **Supabase Backend** that dynamically serves project data, allowing seamless updates via a private Admin Dashboard.

## 🚀 Live Demo
[View Live Portfolio](https://suriyag1614.github.io/Revz-Portfolio/)

## ✨ Key Features
- **Dynamic Project Serving:** Projects are stored in a Supabase Postgres database and fetched dynamically, removing the need to hardcode HTML for every new project.
- **Private Admin Dashboard:** A fully functional, authenticated dashboard (`admin.html`) where the site owner can securely add, categorize, and upload projects directly to the database.
- **Automated Web/App Previews:** Built-in integration with the `mshots` API automatically generates live web screenshots for Web & App projects simply by providing a URL.
- **Responsive CSS Grid Layouts:** Flawless scaling from 4K desktop monitors down to mobile devices, featuring touch-friendly Swiper carousels and smooth micro-animations.
- **Native Web Share API:** Fully integrated mobile sharing functionality.
- **Glassmorphism UI:** Premium styling featuring subtle backdrop filters and curated dark-mode color palettes.

## 🛠️ Tech Stack
- **Frontend:** HTML5, Vanilla CSS3, JavaScript (ES6+)
- **Backend/Database:** [Supabase](https://supabase.com/) (PostgreSQL & Storage)
- **Authentication:** Supabase Auth
- **Libraries:**
  - [Swiper.js](https://swiperjs.com/) - Touch sliders
  - [MixItUp](https://www.kunkalabs.com/mixitup/) - Category filtering
  - [Iconscout Unicons](https://iconscout.com/unicons) & [Boxicons](https://boxicons.com/)

## ⚙️ Local Setup
To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/Suriyag1614/Revz-Portfolio.git
   ```
2. Open the project folder.
3. (Optional) Run via a local server like VS Code's "Live Server" extension to ensure CORS policies allow Supabase data fetching.
4. Setup your Supabase configuration inside `js/supabase-config.js` with your own `SUPABASE_URL` and `SUPABASE_KEY` if forking.

## 🔒 Admin Access (For Owner)
Navigate to `/admin.html` to access the private CMS dashboard. 
*Note: This route is secured by Supabase Row Level Security (RLS) policies and requires authorized credentials to submit forms or view the dashboard.*

---
*Developed & Designed by **Revan Josh. J***

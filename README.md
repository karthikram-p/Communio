# Communio – Online Skill Exchange Platform

Communio is a modern full-stack social platform designed for collaborative skill sharing, networking, and project/team formation with a special focus on hackathons, project ideas, and community engagement. The platform features personalized course and learning path recommendations powered by content-based filtering using TF-IDF, cosine similarity, and Gemini API.

---

## Features

- **Authentication & User Profiles:** Secure registration/login with JWT, editable profiles (avatar, bio, skills), and follow/unfollow users.
- **Real-time Notifications & Messaging:** Stay updated with notifications and interact via direct and community chats.
- **Project Ideas & Team Formation:** Share project ideas, form teams for hackathons, and join communities.
- **Saved Posts & Advanced Search:** Save favorite posts and quickly search users, communities, and skills.
- **Personalized Course Recommendations:** Integrated external skill development platform providing personalized course and learning path suggestions using content-based filtering with TF-IDF, cosine similarity, and Gemini API.
- **Responsive UI:** Built with React and Tailwind CSS for smooth experience across all devices.

---

## Tech Stack

- **Frontend:** React, Tailwind CSS, Vite, DaisyUI, React Query, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JWT with protected routes
- **Course Recommendations:** Python, Streamlit, TF-IDF, cosine similarity
- **Storage & Media:** Cloudinary for image uploads
- **Other:** Emoji navigation, SVG icons

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (local or Atlas cluster)
- Cloudinary account

---

### Setup Backend

1. Clone the repository and navigate to the backend folder:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the backend root with the following variables:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
3. Start the backend server:
   ```bash
   npm run dev
   ```

### Setup Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   npm install
   ```
2. Create a `.env` file in the frontend root (if needed) for any environment variables (e.g., API base URLs).
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## Folder Structure (Example)

```
communio/
├── backend/
├── frontend/
└── README.md
```

---

## Contribution

Feel free to open issues or submit pull requests to improve the platform!

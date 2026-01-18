# AI Studio Application Rules

This document outlines the core technologies and best practices for developing and modifying the "Atleta Pro - Elite Performance Tracker" application.

## Tech Stack Overview

*   **Frontend Framework:** React with TypeScript for building dynamic user interfaces.
*   **Styling:** Tailwind CSS is used exclusively for all styling, ensuring a utility-first approach and consistent design.
*   **Routing:** A custom, state-based routing system (`currentScreen` in `App.tsx`) manages navigation between different application views.
*   **Mapping:** Leaflet.js is utilized for interactive maps, displaying activity routes and real-time GPS tracking.
*   **Backend & Database:** Firebase provides authentication services and serves as the NoSQL database (Firestore) for user profiles and activity data.
*   **AI Integration:** The Google Gemini API (`@google/generative-ai`) is integrated for generating personalized AI insights for users.
*   **Charting & Data Visualization:** Recharts is employed for creating responsive and interactive data charts to display user statistics.
*   **Screenshot Capture:** `html2canvas` is used to capture DOM elements as images, primarily for generating shareable workout cards.
*   **Icons:** Material Symbols Outlined from Google Fonts are used for all iconography within the application.
*   **Build Tool:** Vite is the chosen build tool, providing a fast development experience and optimized production builds.

## Library Usage Guidelines

To maintain consistency and efficiency, please adhere to the following rules when introducing new features or modifying existing ones:

*   **UI Components:** Always create new React components in TypeScript (`.tsx` files) within the `src/components` directory.
*   **Styling:** Use Tailwind CSS classes for all styling. Avoid inline styles or creating new `.css` files unless absolutely necessary for global overrides (which should be minimal).
*   **Navigation:** Continue to use the existing `currentScreen` state and `navigate` function in `App.tsx` for routing. Do not introduce `react-router-dom` or similar routing libraries unless the current system becomes a significant bottleneck for complex routing needs.
*   **Maps:** For any new map-related features, use Leaflet.js. Do not introduce other mapping libraries.
*   **Backend/Auth/DB:** All backend interactions, including user authentication and data storage, must be handled via Firebase (Auth and Firestore). Do not introduce other backend services or database solutions.
*   **AI Features:** For any new AI-driven functionalities, leverage the `@google/generative-ai` library.
*   **Charts:** When visualizing data, use Recharts.
*   **Image Generation:** If you need to capture a visual representation of a component or screen, use `html2canvas`.
*   **Icons:** Use icons from the Material Symbols Outlined library.
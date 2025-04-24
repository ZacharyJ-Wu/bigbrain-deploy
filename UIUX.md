UI/UX Report
Overview
This document outlines the user experience (UX) and user interface (UI) design decisions made throughout the development of the application. Special attention has been given to creating a usable, intuitive, and visually consistent interface, in line with the principles discussed in the UI/UX lectures.

Clear Navigation & Routing

The app uses React Router v6 to handle navigation with intuitive URL paths such as:

/dashboard for the admin view

/game/:gameId for editing a specific game

/play/:playerId/waiting for lobby view

/play/:playerId for active gameplay

The routes are organized and distinct, which helps users know where they are and what to expect.

Consistent UI Design

The app uses Material UI (MUI) components for layout and elements such as buttons, dialogs, text fields, cards, and typography.

This creates a consistent visual language across all pages, with:

Clear headings (<Typography variant="h4">)

Appropriate use of Grid layout for responsive design

Visual feedback like CircularProgress when loading, and Alert for error handling

Good Visual Hierarchy

Components such as game cards in the dashboard are displayed using a card layout with images, titles, and actions (Edit, Start, Stop, Delete), which makes it easy for admins to scan and interact with their games.

The hierarchy between headings, body text, and buttons has been well maintained through MUI’s typographic scale.

Modal Dialogs for Focused Tasks

Creating a game and starting a game session are handled through modals (<Dialog>), keeping the user in context and avoiding unnecessary page navigation.

Modals help to focus the user’s attention on the immediate task (e.g., entering a game name or copying a session link).

Error Handling & Feedback

All asynchronous actions (fetch, POST, etc.) have try-catch handling with meaningful error feedback via Alert components.

For example, trying to join a session with an invalid ID will show an error banner.

This reduces user frustration and helps them recover from mistakes.

Responsive Design Considerations

The layout uses MUI’s Grid system to ensure that cards and forms render appropriately on different screen sizes.

Images and iframes are styled with max-width: 100% to ensure responsiveness in question media.

Summary
Overall, I have made an effort to:

Ensure users always know where they are and what to do.

Provide meaningful feedback on interactions.

Use consistent UI elements and layout patterns to minimize learning curve.

Keep the interface clean and intuitive across both the admin and player experiences.

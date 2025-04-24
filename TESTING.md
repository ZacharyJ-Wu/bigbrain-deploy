🧪 Testing Strategy
This project adopts two testing strategies:

Component Testing – using Vitest with React Testing Library.

UI (End-to-End) Testing – using Cypress.

1. 🧩 Component Testing (Vitest + React Testing Library)
   Component tests are located in the src/**test**/ folder and follow the naming convention \*.test.jsx.

✅ Covered Components
LoginPage

Renders email and password input fields

Submits form successfully and triggers navigation

Dashboard

Renders correct number of question buttons

Navigates to the correct question editing page on button click

WaitingScreen

Displays “Waiting for the host...” message

Includes a functional “Leave” button

▶️ Run Component Tests
Run all component tests with:

npm run test

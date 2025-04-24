Bonus Feature: Waiting Lobby
Feature Overview
As a bonus feature, I implemented a waiting lobby (WaitingScreen.jsx) that enhances the user experience for participants joining a game session. This lobby serves as an intermediary interface where players wait for the host to begin the game.

Functionality
Dynamic Route Handling:
The route /play/:playerId/waiting is used for this screen, where the playerId is dynamically assigned upon joining a session.

Session Polling:
The page polls the server every 3 seconds using the /play/:playerId/status endpoint to check if the game has started (atQuestion !== null).

Automatic Transition:
Once the host advances the game to the first question, the screen automatically redirects the player to the game page (/play/:playerId) without requiring a manual refresh or action.

Design Rationale
This approach ensures that players are not confused or stuck before the game starts.

It offers a clear visual indication ("Waiting for the game to start...") and uses a progress spinner to enhance feedback.

The transition logic makes the experience smooth and removes uncertainty for players who may not know what to do after joining.

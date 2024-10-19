# Becca

Becca is a web application designed to help users create, customize, and study flashcards in an interactive and collaborative way. The platform allows users to customize card layouts, test themselves with quizzes, and even engage in multiplayer quiz games. The goal is to facilitate learning through an engaging flashcard creation and study process.

## Features

- Create, edit, and organize flashcards
- Customize flashcard styles and layouts
- Provide suggestive terms when creating flashcards
- Search public card sets with keywords
- Favorite card sets for easy access
- Self-assessment with multiple choice or matching quizzes
- Multiplayer quiz games for collaborative learning
- Responsive design for mobile and desktop

## Technologies Used

- **Frontend**: React, Vite, Styled Components
  - React is used for building a dynamic UI.
  - Vite provides fast development server startup and hot module replacement.
  - Styled Components helps manage CSS-in-JS with scoped and dynamic styles.
- **Backend**: Firebase (Firestore, Firebase Authentication)

  - Firebase Firestore stores user data and flashcards in real-time.
  - Firebase Authentication is used for secure user login (including Google login).

- **Deployment**: Firebase Hosting
  - The project is deployed with Firebase Hosting for fast, global content delivery.

## Run Locally

To run the project locally, follow these steps:

1. Clone the project

```bash
  git clone https://github.com/Ellielee308/becca.git
```

2. Go to the project directory

```bash
  cd becca
```

3. Install dependencies

```bash
  npm install
```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and visit:
   ```
   http://localhost:5173
   ```

## Usage

1. Register or log in using your Google account or the website's account registration.
2. Create a new card set by navigating to the "New Card Set" page.
3. Select a style and layout template for the card set.
4. Add cards by specifying content for both the front and back fields.
5. Test yourself with quizzes or invite friends to join a multiplayer quiz game.

## Authors

For any questions or inquiries, feel free to contact me:

- Email: as152808@gmail.com
- GitHub: [Ellielee308](https://github.com/Ellielee308)

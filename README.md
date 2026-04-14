# What to Eat Today

A small static food diary app that saves meals to Firebase Firestore.

## Project Structure

- `index.html`: the UI and inline styles
- `app.js`: Firebase setup, form submission, live list rendering, and delete actions
- `firebase-config.js`: older unused Firebase setup file

## Features

- Add a meal with date, meal time, name, category, location, rating, and optional image URL
- Save entries to the `food_diary` Firestore collection
- Show entries in real time with newest dates first
- Delete entries from the list

## Run Locally

This app does not use a build step. It is a static site that loads Firebase from CDN.

Use any simple local server from the project root. Example:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Firebase Notes

- The app currently keeps Firebase config directly in `app.js`
- Firestore must allow the browser to read and write the `food_diary` collection
- If Firestore rules block access, the page will show an error in the list area

## Known Cleanup

- `firebase-config.js` is not used by `index.html`
- Styles are still inline in `index.html`
- There are no tests yet

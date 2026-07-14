# Video Communication & Virtual Collaboration Platform

A production-ready, feature-rich collaboration platform similar to Microsoft Teams, Zoom, and Slack. It incorporates real-time chat, video conferencing, audio calls, collaborative tools, and admin dashboards.

## Project Structure

This project is organized into two primary subdirectories:

* `/server`: The Node.js, Express, and TypeScript backend application. Following MVC architecture.
* `/client`: The React, TypeScript, and Tailwind CSS frontend application.

### Directory Layout

```text
/ (Project Root)
├── .gitignore
├── .prettierrc
├── README.md
├── package.json
├── server/
│   ├── src/
│   │   ├── config/             # DB, Mail, Cloudinary configs
│   │   ├── controllers/        # Express controllers (MVC)
│   │   ├── middleware/         # Auth, validation, error handler
│   │   ├── models/             # Mongoose models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Socket, WebRTC, storage logic
│   │   ├── utils/              # Helper functions
│   │   └── app.ts              # Express app entry
│   ├── tsconfig.json
│   └── package.json
└── client/
    ├── src/
    │   ├── assets/             # Images, static media
    │   ├── components/         # Reusable UI components
    │   ├── context/            # React context
    │   ├── features/           # Redux slices, modular features
    │   ├── hooks/              # Custom hooks
    │   ├── pages/              # Router page components
    │   ├── services/           # API and socket clients
    │   ├── store/              # Redux store config
    │   └── App.tsx             # Main React entry
    ├── tsconfig.json
    ├── tailwind.config.js
    └── package.json
```

## Setup & Running locally

The instructions for setting up and running the server and client will be detailed in the respective directories as they are built.

To install dependencies for both applications from the root, run:
```bash
npm run install:all
```

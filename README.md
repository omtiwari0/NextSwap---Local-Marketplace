# NearSwap

NearSwap is a React Native application built with Expo, utilizing TypeScript, React Navigation, and NativeWind for styling. This project aims to provide a seamless experience for users looking to swap assets easily.

## Features

- Email OTP authentication (server + JWT)
- Create and browse real listings (PostgreSQL via Prisma)
- Image uploads via Cloudinary
- Chats with unread counts and realtime messages (Socket.IO)
- Inline profile editing with avatar
- Responsive UI (Expo + NativeWind)

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- Expo CLI (install via npm: `npm install -g expo-cli`)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/NearSwap.git
   ```

2. Navigate to the project directory:

   ```
   cd NearSwap
   ```

3. Install dependencies:

   ```
   npm install
   ```

### Configure and run the API server

1) Create a `.env` file in `server/` with values like:

```
PORT=4000
JWT_SECRET=replace_me
DATABASE_URL=postgresql://user:password@localhost:5432/nearswap
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=app_password
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
# Optional: allow your Expo dev origins (comma-separated)
CLIENT_ORIGIN=http://localhost:8081,http://localhost:8082
```

2) Install and run:

```
cd server
npm install
npx prisma migrate dev
npm run dev
```

You should see: `API on http://localhost:4000` and the root `GET /` responding with "NearSwap API is running."

### Run the app (Expo)

1) Add a `.env` file in the app root with your API URL (defaults to http://localhost:4000):

```
EXPO_PUBLIC_API_URL=http://localhost:4000
```

2) Start Expo:

```
npm install
npm run start
```

Open the DevTools and choose web/Android/iOS as needed.

### Folder Structure

The project is organized as follows:

```
NearSwap
├── src
│   ├── components       # Reusable components
│   ├── hooks            # Custom hooks
│   ├── navigation       # Navigation setup
│   ├── screens          # Application screens
│   ├── services         # API and service functions
│   ├── store            # Redux store and slices
│   ├── types            # TypeScript types and interfaces
│   └── utils            # Utility functions and constants
├── assets               # Images and fonts
├── server               # Node/Express API (Prisma, OTP, Cloudinary, Socket.IO)
└── README.md           # Project documentation

## Notes

- Real products only: mock product and order data files have been removed; the app fetches from the API exclusively.
- If listings do not appear, check the console for `[NearSwap API] Using base URL:` to confirm the app is pointing to your server, and verify the server `/listings` endpoint returns data.
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
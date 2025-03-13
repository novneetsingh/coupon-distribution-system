# Round-Robin Coupon Distribution System

A web application that distributes coupons to guest users in a round-robin manner, with mechanisms to prevent users from exploiting the system to claim multiple coupons.

## Features

- **Coupon Distribution**: Maintains a list of available coupons and assigns them sequentially to users to ensure even distribution.
- **Guest Access**: Allows users to access the system without requiring login or account creation.
- **Abuse Prevention**: 
  - IP Tracking: Records each user's IP address upon claiming a coupon, restricting subsequent claims from the same IP for one hour.
  - Cookie Tracking: Uses cookies to monitor coupon claims from the same browser session.
- **User Feedback**: Provides clear messages indicating successful coupon claims or informs users of the time remaining before they can claim another.
- **Admin Panel**: Allows administrators to view coupon statistics, create new coupons, and filter coupons by status.

## Tech Stack

- **Frontend**: React, React Router, Axios, React Hot Toast
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: IP-based and cookie-based tracking
- **Styling**: Tailwind CSS

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd coupon-distribution-system
   ```

2. Install dependencies:
   ```
   cd server
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=3000
   DATABASE_URL=mongodb://localhost:27017/coupon-system
   FRONTEND_URL=http://localhost:5173
   ```

4. Start the server:
   ```
   npm start
   ```

### Frontend Setup

1. Install dependencies:
   ```
   cd ../
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_BACKEND_URL=http://localhost:3000
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Abuse Prevention Implementation

### IP Tracking

The system tracks user IPs to prevent multiple claims from the same network:

1. **How it works**: Each user's IP address is recorded in the database when they claim a coupon.
2. **Restriction period**: Users from the same IP cannot claim another coupon for one hour.
3. **Implementation**: Using MongoDB with TTL (Time To Live) index, IP records automatically expire after one hour.

Example code:
```javascript
// MongoDB Schema with TTL index
const claimedIPSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // Expires after 1 hour
});
```

### Cookie Tracking

The system uses cookies to prevent users from claiming multiple coupons by refreshing the page:

1. **How it works**: When a user claims a coupon, a cookie is set in their browser.
2. **Cookie duration**: The cookie remains active for one hour, during which the user cannot claim another coupon.
3. **Implementation**: Express.js cookie handling with a 1-hour expiry.

Example code:
```javascript
// Setting a cookie when a coupon is claimed
res.cookie("couponClaimed", true, { maxAge: 3600000 }); // 1 hour
```

## API Documentation

### Coupon Endpoints

- `POST /coupon/claim`: Claim a coupon
- `POST /coupon/create`: Create a new coupon
- `POST /coupon/create-multiple`: Create multiple coupons
- `GET /coupon`: Get all coupons (filterable by status)
- `GET /coupon/stats`: Get statistics about claimed IPs

## License

MIT

## Author

[Your Name]

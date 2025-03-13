# Round-Robin Coupon Distribution System

A web application that distributes coupons to guest users in a round-robin manner, with mechanisms to prevent users from exploiting the system to claim multiple coupons.

## Live Demo

- **Frontend**: [https://coupon-distribution-system.onrender.com](https://coupon-distribution-system.onrender.com/)
- **Backend**: [https://coupon-distribution.onrender.com](https://coupon-distribution.onrender.com)
- **Repository**: [https://github.com/novneetsingh/coupon-distribution-system](https://github.com/novneetsingh/coupon-distribution-system)

## Features

- **Coupon Distribution**: Maintains a list of available coupons and assigns them sequentially to users to ensure even distribution.
- **Guest Access**: Allows users to access the system without requiring login or account creation.
- **Abuse Prevention**:
  - IP Tracking: Records each user's IP address upon claiming a coupon, restricting subsequent claims from the same IP for one hour.
  - Cookie Tracking: Uses cookies to monitor coupon claims from the same browser session.
- **User Feedback**: Provides clear messages indicating successful coupon claims or informs users of the time remaining before they can claim another.
- **Admin Panel**: Allows administrators to view coupon statistics, create new coupons, and filter coupons by status.

## Tech Stack

### Frontend

- **React**: UI library for building component-based interfaces
- **React Router**: For client-side routing between Home and Admin pages
- **Axios**: For making HTTP requests to the backend API
- **React Hot Toast**: For displaying toast notifications
- **TailwindCSS**: For responsive UI styling

### Backend

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework for handling HTTP requests
- **MongoDB**: NoSQL database for storing coupons and IP tracking data
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB
- **UUID**: For generating unique coupon codes

### Security & Abuse Prevention

- **IP-based tracking**: Using TTL indexes in MongoDB for automatic expiry
- **Cookie-based restrictions**: HTTP-only cookies with appropriate SameSite settings
- **CORS configuration**: Proper cross-origin resource sharing setup

## Implementation Details

### Backend Structure

The backend follows a modular architecture:

- `/models`: MongoDB schemas for Coupon and ClaimedIP
- `/controllers`: Business logic for coupon operations
- `/routes`: API endpoint definitions
- `/config`: Database connection configuration

Key controller functions:

- `createCoupons`: Creates multiple unique coupons at once
- `getAllCoupons`: Retrieves coupons with optional filtering
- `getDashboardStats`: Provides combined statistics for the admin dashboard
- `claimCoupon`: Handles coupon claiming with abuse prevention

### Frontend Structure

The React frontend is organized as:

- `/Components`: Reusable UI components
  - `Home.jsx`: User-facing page for claiming coupons
    - Displays coupon claim button
    - Shows success message with claimed coupon code
    - Handles error states and displays remaining time
  - `Admin.jsx`: Administrator page for coupon management
    - Dashboard with statistics cards
    - Coupon generation form
    - Filterable coupon list
  - `Navbar.jsx`: Navigation component for routing
- `App.jsx`: Main component with routing setup
- `main.jsx`: Entry point with global configurations

### Database Models

#### ClaimedIP Model

```javascript
const claimedIPSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // Auto-expires after 1 hour
});
```

#### Coupon Model

```javascript
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  isClaimed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
```

### Abuse Prevention Implementation

#### IP Tracking

The system implements a sophisticated IP tracking mechanism:

1. **IP Extraction**: Handles various proxy scenarios

```javascript
let clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
if (clientIP?.includes(",")) {
  clientIP = clientIP.split(",")[0].trim();
}
```

2. **TTL Index**: Automatic cleanup of expired records

```javascript
createdAt: { type: Date, default: Date.now, expires: 3600 } // 1-hour expiry
```

#### Cookie Protection

Cross-origin compatible cookie settings:

```javascript
res.cookie("couponClaimed", true, {
  maxAge: 3600000,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
});
```

### API Documentation

#### Coupon Endpoints

| Endpoint                  | Method | Description             | Request Body                               | Response                                    |
| ------------------------- | ------ | ----------------------- | ------------------------------------------ | ------------------------------------------- |
| `/coupon/claim`           | POST   | Claim a coupon          | None                                       | `{ message, data: coupon, timeRemaining? }` |
| `/coupon/create`          | POST   | Create multiple coupons | `{ count }`                                | `{ message, data: coupons }`                |
| `/coupon`                 | GET    | Get all coupons         | Query: `?status=[all\|claimed\|unclaimed]` | `{ data: coupons }`                         |
| `/coupon/dashboard-stats` | GET    | Get combined statistics | None                                       | `{ data: coupons  }`                        |

### Error Handling

The application implements comprehensive error handling:

1. **Rate Limiting**:

```javascript
if (claimedIP) {
  const timeRemaining = Math.max(
    0,
    Math.floor((expiryTime - currentTime) / 1000)
  );
  return res.status(429).json({
    message: "You have already claimed a coupon. Please try again later.",
    timeRemaining: timeRemaining,
  });
}
```

2. **User Feedback**:

```javascript
if (error.response?.status === 429) {
  const timeRemaining = error.response.data.timeRemaining;
  const formattedTime = formatTime(timeRemaining);
  setError(
    `You have already claimed a coupon. Please try again after ${formattedTime}.`
  );
}
```

## Author

[Novneet Singh](https://github.com/novneetsingh)

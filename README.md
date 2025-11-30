# Campus Cab Pool

A student cab-pooling platform where students can match with nearby students traveling on similar routes.

## Tech Stack

### Frontend
- React.js with TypeScript
- React Router v6
- TailwindCSS for styling
- Axios for API requests
- Socket.io-client for real-time chat

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Socket.io for real-time chat

## Project Structure

```
campus-cab-pool/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.ts
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend root with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/campus_cab_pool
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend root with the following variable:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

**Note**: The frontend uses a proxy to forward API requests to the backend server running on port 5000.

## API Documentation

### Authentication

#### Register a new user
- **POST** `/api/auth/register`
- **Body**: 
  ```json
  {
    "name": "string",
    "email": "string"
    "password": "string",
    "phone": "string",
    "gender": "string", // Optional
    "year": "string", // Optional
    "branch": "string" // Optional
  }
  ```

#### Login
- **POST** `/api/auth/login`
- **Body**: 
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

#### Get current user
- **GET** `/api/auth/me`
- **Headers**: `Authorization: Bearer <token>`

#### Logout
- **GET** `/api/auth/logout`

### User Management

#### Get all users (Admin only)
- **GET** `/api/users`
- **Headers**: `Authorization: Bearer <token>`

#### Get a user (Admin only)
- **GET** `/api/users/:id`
- **Headers**: `Authorization: Bearer <token>`

#### Update user profile
- **PUT** `/api/users/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: User fields to update

#### Delete user (Admin only)
- **DELETE** `/api/users/:id`
- **Headers**: `Authorization: Bearer <token>`

#### Update user location
- **PUT** `/api/users/location`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
  ```json
  {
    "coordinates": [longitude, latitude]
  }
  ```

### Pool Requests

#### Create a pool request
- **POST** `/api/pool/create`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
  ```json
  {
    "pickupLocation": {
      "address": "string",
      "coordinates": [longitude, latitude]
    },
    "dropLocation": {
      "address": "string",
      "coordinates": [longitude, latitude]
    },
    "dateTime": "ISO Date String",
    "preferredGender": "string", // Optional: Male, Female, Any
    "seatsNeeded": "number", // Default: 1
    "mode": "string" // Instant or Scheduled
  }
  ```

#### Get user's pool requests
- **GET** `/api/pool/requests`
- **Headers**: `Authorization: Bearer <token>`

#### Get a specific pool request
- **GET** `/api/pool/:id`
- **Headers**: `Authorization: Bearer <token>`

#### Delete a pool request
- **DELETE** `/api/pool/:id`
- **Headers**: `Authorization: Bearer <token>`

#### Match pool requests
- **POST** `/api/pool/match`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
  ```json
  {
    "pickupLocation": {
      "address": "string",
      "coordinates": [longitude, latitude]
    },
    "dropLocation": {
      "address": "string",
      "coordinates": [longitude, latitude]
    },
    "dateTime": "ISO Date String",
    "preferredGender": "string" // Optional
  }
  ```

### Group Management

#### Create a group
- **POST** `/api/group/create`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
  ```json
  {
    "groupName": "string",
    "route": {
      "pickup": {
        "address": "string",
        "coordinates": [longitude, latitude]
      },
      "drop": {
        "address": "string",
        "coordinates": [longitude, latitude]
      }
    },
    "seatCount": "number" // 2-4
  }
  ```

#### Get user's groups
- **GET** `/api/group/mygroups`
- **Headers**: `Authorization: Bearer <token>`

#### Get group details
- **GET** `/api/group/:groupId`
- **Headers**: `Authorization: Bearer <token>`

#### Join a group
- **POST** `/api/group/join/:groupId`
- **Headers**: `Authorization: Bearer <token>`

#### Leave a group
- **POST** `/api/group/leave/:groupId`
- **Headers**: `Authorization: Bearer <token>`

#### Lock a group (Admin only)
- **PATCH** `/api/group/lock/:groupId`
- **Headers**: `Authorization: Bearer <token>`

### Chat

#### Send a message
- **POST** `/api/chat/send`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
  ```json
  {
    "groupId": "string",
    "content": "string",
    "messageType": "string" // text, image, location
  }
  ```

#### Get chat history
- **GET** `/api/chat/history/:groupId`
- **Headers**: `Authorization: Bearer <token>`

#### Mark message as read
- **PUT** `/api/chat/read/:messageId`
- **Headers**: `Authorization: Bearer <token>`

### Admin

#### Get all users
- **GET** `/api/admin/users`
- **Headers**: `Authorization: Bearer <token>`

#### Ban/unban user
- **PUT** `/api/admin/users/:id/ban`
- **Headers**: `Authorization: Bearer <token>`

#### Get all groups
- **GET** `/api/admin/groups`
- **Headers**: `Authorization: Bearer <token>`

#### Delete group
- **DELETE** `/api/admin/groups/:id`
- **Headers**: `Authorization: Bearer <token>`

#### Get all pool requests
- **GET** `/api/admin/pool-requests`
- **Headers**: `Authorization: Bearer <token>`

#### Send announcement
- **POST** `/api/admin/announcement`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
  ```json
  {
    "title": "string",
    "content": "string"
  }
  ```

## Matching Algorithm

The matching algorithm works by finding students with similar routes based on:

1. **Pickup Location**: Within 3km radius
2. **Drop Location**: Within 3-5km radius
3. **Travel Time**: Difference less than 25 minutes
4. **Gender Preference**: Matched according to user preference
5. **Group Capacity**: Group not full (max 4 members)

The algorithm calculates a match score based on:
- Time similarity
- Distance similarity (pickup and drop)
- Overall compatibility

## Real-time Chat

The application uses Socket.io for real-time chat functionality within groups. Features include:
- Instant messaging
- Message history
- User typing indicators
- Join/leave notifications

## Fare Calculator

The fare calculator allows users to:
- Enter total fare amount
- Automatically divide by member count
- Display individual share
- Show "You owe X" amount

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus_cab_pool
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

## Development

### Backend
- Build: `npm run build`
- Start: `npm start`
- Dev: `npm run dev`

### Frontend
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License.
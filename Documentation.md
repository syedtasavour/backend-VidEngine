# VidEngine API Documentation

## Getting Started

### Clone the Repository
To start using the VidEngine backend, clone the repository and install dependencies:

```bash
git clone https://github.com/your-repo/VidEngine-backend.git
cd VidEngine
npm install
```
 

## Documentation & Resources

- **Postman Collection:** [#](#)
- **API Base URL:** [http://localhost:3000/api/v1/](http://localhost:3000/api/v1/)
- **GitHub Repository:** [https://github.com/syedtasavour/VidEngine](https://github.com/syedtasavour/VidEngine)

 
### Set Up Environment Variables
Create a `.env` file in the root directory and configure the required environment variables:

```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Start the Server
Run the server in development mode:

```bash
npm run dev
```

To start the server in production mode:

```bash
npm start
```

---

## Overview

- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Database:** MongoDB with Mongoose ODM  
- **Authentication:** JWT (JSON Web Tokens)  
- **File Storage:** Cloudinary  
- **File Handling:** Multer  

---

## API Reference

### **Authentication & User Management**

#### Register User
**POST** `/users/register`
- **Required fields:** `fullName`, `email`, `username`, `password`, `avatar`
- **Optional:** `coverImage`

#### Login User
**POST** `/users/login`
- **Required:** `username/email`, `password`
- **Returns:** JWT tokens in cookies

#### Logout User
**POST** `/users/logout`
- **Requires:** Authentication

#### Refresh Access Token
**POST** `/users/refresh-token`
- **Required:** Refresh token in cookie

#### Change Password
**POST** `/users/change-password`
- **Required:** `oldPassword`, `newPassword`

#### Get Current User
**GET** `/users/current-user`

#### Update Account
**PATCH** `/users/update-account`
- **Fields:** `fullName`, `email`

#### Update Avatar
**PATCH** `/users/avatar`
- **Required:** Avatar file

#### Update Cover Image
**PATCH** `/users/cover-image`
- **Required:** Cover image file

#### Get Channel Profile
**GET** `/users/c/:username`
- **Returns:** Channel details with subscriber counts

#### Get Watch History
**GET** `/users/history`
- **Returns:** User’s video watch history

---

## **Video Management**

#### Upload Video
**POST** `/videos`
- **Required:** `videoFile`, `thumbnail`, `title`, `description`
- **Optional:** `isPublished`

#### Get All Videos
**GET** `/videos`
- **Query params:** `page`, `limit`, `query`, `sortBy`, `sortType`, `userId`

#### Get Video by ID
**GET** `/videos/:videoId`

#### Update Video
**PATCH** `/videos/:videoId`
- **Fields:** `title`, `description`, `thumbnail`, `isPublished`

#### Delete Video
**DELETE** `/videos/:videoId`

#### Toggle Publish Status
**PATCH** `/videos/:videoId/publish`
- **Required:** `isPublished` (boolean)

---

## **Playlist Management**

#### Create Playlist
**POST** `/playlist`
- **Required:** `name`, `description`

#### Get User Playlists
**GET** `/playlist/user/:userId`
- **Query params:** `page`, `limit`

#### Get Playlist by ID
**GET** `/playlist/:playlistId`

#### Add Video to Playlist
**POST** `/playlist/:playlistId/videos/:videoId`

#### Remove Video from Playlist
**DELETE** `/playlist/:playlistId/videos/:videoId`

#### Delete Playlist
**DELETE** `/playlist/:playlistId`

#### Update Playlist
**PATCH** `/playlist/:playlistId`
- **Fields:** `name`, `description`

---

## **Comments**

#### Add Comment
**POST** `/comment/:videoId`
- **Required:** `content`

#### Get Video Comments
**GET** `/comment/:videoId`
- **Query params:** `page`, `limit`

#### Update Comment
**PATCH** `/comment/c/:commentId`
- **Required:** `content`

#### Delete Comment
**DELETE** `/comment/c/:commentId`

---

## **Likes**

#### Toggle Video Like
**POST** `/likes/toggle/v/:videoId`

#### Toggle Comment Like
**POST** `/likes/toggle/c/:commentId`

#### Toggle Tweet Like
**POST** `/likes/toggle/t/:tweetId`

#### Get Liked Videos
**GET** `/likes/videos`
- **Query params:** `page`, `limit`

---

## **Subscriptions**

#### Toggle Channel Subscription
**POST** `/subscription/:channelId`

#### Get Channel Subscribers
**GET** `/subscription/:subscriberId`

#### Get Subscribed Channels
**GET** `/subscription/c/:channelId`

---

## **Tweets**

#### Create Tweet
**POST** `/tweets`
- **Required:** `content`

#### Get User Tweets
**GET** `/tweets/:userId`
- **Query params:** `page`, `limit`

#### Update Tweet
**PATCH** `/tweets/:tweetId`
- **Required:** `content`

#### Delete Tweet
**DELETE** `/tweets/:tweetId`

---

## **Dashboard**

#### Get Channel Stats
**GET** `/dashboard/stats/:channelId`
- **Returns:** Video count, subscriber count, total likes

#### Get Channel Videos
**GET** `/dashboard/videos`
- **Query params:** `channelId`, `page`, `limit`

---

## **Health Check**

#### Check API Health
**GET** `/healthcheck`

---

## **Middleware**

- **Authentication:** `verifyJWT`
- **File Upload:** `multer`
- **Authorization:** `isOwner`, `isPlaylistOwner`, `isCommentOwner`, `isTweetOwner`
- **Error Handling:** `ApiError class`, `asyncHandler wrapper`

---

## **Features & Capabilities**

- **Authentication:** JWT-based with secure password hashing
- **File Handling:** Cloudinary file uploads (videos, images)
- **Security:** CORS protection, rate limiting, input sanitization
- **Data Management:** Pagination, sorting, filtering, aggregates
- **Additional Features:** Watch history tracking, channel stats


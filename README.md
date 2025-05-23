# CloudSpace

CloudSpace is an Intelligent Multi-Cloud Backup System that provides secure and efficient file backup solutions across multiple cloud storage providers.

## Project Overview

CloudSpace is a full-stack application that consists of three main components:

1. **Frontend**: A modern web interface built with React and Vite
2. **Backend**: A Node.js/Express server handling API requests and cloud storage operations
3. **Agent**: A desktop application for local file management and backup operations

## Features

- Multi-cloud storage support (Dropbox, MEGA, Cloudinary)
- Secure file encryption and backup
- User authentication and authorization
- Real-time backup status monitoring
- Cross-platform desktop agent
- Modern and responsive web interface

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Modern JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Various cloud storage SDKs

### Agent
- Electron.js
- Node.js
- Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn package manager
- Cloud storage provider accounts (Dropbox, MEGA, Cloudinary)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cloudspace.git
cd cloudspace
```

2. Install dependencies for each component:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Agent
cd ../agent
npm install
```

3. Set up environment variables:
   - Create `.env` files in both backend and agent directories
   - Configure necessary API keys and credentials

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Start the agent:
```bash
cd agent
npm start
```

## Project Structure

```
cloudspace/
├── backend/           # Backend server
│   ├── configs/      # Configuration files
│   ├── controllers/  # Route controllers
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   └── utils/        # Utility functions
├── frontend/         # React web application
│   ├── src/         # Source files
│   └── public/      # Static assets
└── agent/           # Desktop application
    ├── assets/      # Application assets
    └── src/         # Source files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

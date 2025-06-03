InsightQA: Streamlined Assessment Platform
InsightQA is a modern platform designed to simplify and enhance the process of conducting assessments. This README provides instructions to set up and run the application locally.
Prerequisites
Ensure you have the following installed:

Node.js (version 16 or higher recommended)
Yarn (package manager)
A compatible code editor (e.g., VS Code)

Installation Steps
1. Install Dependencies
Run the following command to install all required dependencies for InsightQA:
yarn install

This installs the project's dependencies as defined in package.json.
2. Build the Application
Compile the application for production with the following command:
yarn build

This generates an optimized build in the dist or build directory (depending on your configuration).
3. Start the Application
Launch the application locally using:
yarn start

This starts the development server, typically accessible at http://localhost:3000 (check your terminal for the exact URL).
Additional Notes

Ensure environment variables are configured in a .env file if required.
For production deployments, refer to the platform-specific deployment guide.
If you encounter issues, check the troubleshooting section or consult the project documentation.

Troubleshooting

Dependency errors: Ensure the correct Node.js version is installed and run yarn install --force to resolve.
Port conflicts: If http://localhost:3000 is unavailable, check for other running services or specify a different port via the .env file.



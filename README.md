# WMS Frontend

This is the frontend application for the Warehouse Management System (WMS). It is built with React, TypeScript, and Vite, and communicates with the WMS backend APIs.

## Features

- **Authentication:** Login and user session management via JWT.
- **Dashboard:** Overview of system activity.
- **Inventory Management:** Receive, transfer, and dispatch stock. View real-time inventory levels.
- **Stock Movements:** View comprehensive history of all stock movements and transactions.
- **Products:** Create, read, update, and delete products (SKU, details, low stock alerts).
- **Warehouses & Locations:** Manage warehouse facilities and their internal storage locations.
- **Roles & Permissions:** Administrative interface to manage system roles and granular permissions.

## Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Routing:** [React Router](https://reactrouter.com/)
- **Data Fetching:** [React Query (TanStack Query)](https://tanstack.com/query/latest) & [Axios](https://axios-http.com/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Linting:** [Oxlint](https://oxc.rs/docs/guide/usage/linter.html)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository and navigate to the project folder:
   ```bash
   cd wms_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory (you can copy from a `.env.example` if available) and set the API base URL.
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```
   *Note: Ensure this matches the URL where your Laravel/NestJS backend is running.*

### Running the Development Server

Start the Vite development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173` (or the port specified in your console output).

## Build for Production

To create a production-ready build:

```bash
npm run build
```
This command compiles the TypeScript code and bundles the application into the `dist` folder. You can preview the production build locally using:
```bash
npm run preview
```

## Linting

To run the linter and check for code quality issues:

```bash
npm run lint
```

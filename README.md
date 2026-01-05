# Auntie's Kitchen Frontend

This project is the frontend for the "Auntie's Kitchen" application, a comprehensive platform for managing restaurant operations. It includes features for customers, kitchen staff, cashiers, and administrators.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Key Functionality](#key-functionality)
- [Contributing](#contributing)

## Features

*   **User Authentication:** Secure login, registration, and OTP verification.
*   **Customer Dashboard:** Allows customers to view menus and place orders.
*   **Admin Dashboard:** Provides administrators with tools to manage users, staff, menus, and orders.
*   **Kitchen Dashboard:** A dedicated view for kitchen staff to manage incoming orders.
*   **Cashier Dashboard:** A dedicated view for cashiers to handle payments and orders.
*   **Role-Based Access Control:** Different dashboards and functionalities based on user roles (customer, admin, kitchen, cashier).

## Technologies Used

*   **Angular:** A powerful framework for building dynamic single-page applications.
*   **TypeScript:** A typed superset of JavaScript that enhances code quality and maintainability.
*   **RxJS:** A library for reactive programming using Observables, used for managing asynchronous operations.
*   **HTML & CSS:** For structuring and styling the application.

## Project Structure

The project follows a standard Angular CLI structure:

```
/
├── src/
│   ├── app/
│   │   ├── admin/             # Components for the admin dashboard
│   │   ├── auth/              # Services for authentication
│   │   ├── customer-dashboard/ # Components for the customer view
│   │   ├── kitchen-dashboard/ # Components for the kitchen view
│   │   ├── cashier-dashboard/ # Components for the cashier view
│   │   ├── login/             # Login component
│   │   ├── register/          # Registration component
│   │   ├── otp-verification/  # OTP verification component
│   │   ├── orders/            # Components and services for managing orders
│   │   ├── menu/              # Components and services for managing the menu
│   │   ├── app.routes.ts      # Main application routing
│   │   └── ...
│   ├── assets/              # Static assets like images and styles
│   └── ...
├── angular.json             # Angular CLI configuration
├── package.json             # Project dependencies and scripts
└── ...
```

## Getting Started

### Prerequisites

*   Node.js and npm (Node Package Manager)
*   Angular CLI (`npm install -g @angular/cli`)

### Installation

1.  Clone the repository:
    ```sh
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```sh
    cd aunties-kitchen-frontend
    ```
3.  Install the dependencies:
    ```sh
    npm install
    ```

### Running the Application

1.  Start the development server:
    ```sh
    ng serve
    ```
2.  Open your browser and navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Key Functionality

The application is divided into several key functional areas based on user roles:

*   **/login, /register, /verify-otp:** Handles user authentication and onboarding.
*   **/customer-dashboard:** The main view for customers to browse the menu and place orders.
*   **/admin-dashboard:** The central hub for administrators, with access to:
    *   **/admin/users:** Manage customer accounts.
    *   **/admin/staff:** Manage staff accounts (kitchen, cashier).
    *   **/admin/menu:** Add, edit, or remove menu items.
    *   **/admin/orders:** View and manage all orders in the system.
*   **/admin/kitchen-dashboard:** A specialized view for kitchen staff to see and update the status of orders.
*   **/admin/cashier-dashboard:** A specialized view for cashiers to process payments.

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

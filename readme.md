# Todo Application

This is a MERN stack-based Todo application that includes user authentication, task management, and trash management features.
![image](https://github.com/user-attachments/assets/00002b4f-a8ed-4215-a674-92afc2ff9f9a)
![image](https://github.com/user-attachments/assets/7f5e0320-6bce-4efa-b87a-cebc4fd43342)



## Features
- **User Authentication**: Users can log in and register.
- **Task Management**: Users can add, edit, complete and delete tasks.
- **Trash Management**: Deleted tasks are moved to the trash and can be managed.
<!-- - **Routing**: Client-side routing using `react-router-dom`.
- **Notifications**: Real-time notifications using `react-toastify`. -->

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/midhunk0/todo.git
    ```
2. Navigate to the project directory:
    ```sh
    cd todo
    ```
3. Install client dependencies:
    ```sh
    cd client
    npm install
    ```
4. Install server dependencies:
    ```sh
    cd ../server
    npm install
    ```

## Usage

1. Start the backend server:
    ```sh
    cd server
    npm start
    ```
2. Start the frontend development server:
    ```sh
    cd ../client
    npm start
    ```
3. Open your browser and navigate to `http://localhost:3000`.

## Project Structure

- `client/src/components/auth`: Contains authentication components (`Login` and `Register`).
- `client/src/components/pages`: Contains page components (`Todo` and `Trash`).
- `client/src/App.js`: Main application component with routing and notification configuration.
- `client/src/App.css`: Global styles for the application.
- `server`: Contains the backend code with Express and MongoDB setup.

## Dependencies

- React
- React Router DOM
- React Toastify
- Express
- MongoDB
- Mongoose

## License

This project is licensed under the MIT License.

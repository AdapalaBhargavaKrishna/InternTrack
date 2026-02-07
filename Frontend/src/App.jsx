import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ViewStatus from "./pages/student/ViewStatus";
// import FacultyRecords from "./pages/faculty/Faculty";
import FacultyDashboard from "./pages/faculty/Dashboard";
import StudentDashboard from "./pages/student/Dashboard";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/faculty" element={<FacultyDashboard />} />

          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/viewstatus" element={<ViewStatus />} />
        </Routes>
      </Router>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#333",
            border: "1px solid #e5e5e5",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
          },

          success: {
            duration: 3000,
            style: {
              background: "#f0f9f4",
              color: "#0f5132",
              border: "1px solid #badbcc",
            },
            iconTheme: {
              primary: "#198754",
              secondary: "#fff",
            },
          },

          error: {
            duration: 5000,
            style: {
              background: "#f8d7da",
              color: "#721c24",
              border: "1px solid #f1aeb5",
            },
            iconTheme: {
              primary: "#dc3545",
              secondary: "#fff",
            },
          },

          loading: {
            style: {
              background: "#e7f1ff",
              color: "#084298",
              border: "1px solid #9ec5fe",
            },
            iconTheme: {
              primary: "#0d6efd",
              secondary: "#e7f1ff",
            },
          },
        }}
      />
    </div>
  );
};

export default App;

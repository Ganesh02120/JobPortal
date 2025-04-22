import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar";
import JobListings from "./pages/JobListings";
import ApplicationForm from "./components/ApplicationForm";
import JobDescriptionPage from "./components/JobDescription";
import JobPosting from "./pages/AddJobs";
import Login from "./pages/Login";
import JobApplicants from "./pages/JobApplicants";
import Homepage from "./pages/Home";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check token on page reload
  useState(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/joblistings" element={<JobListings />} />
        <Route path="/jobapply/:id" element={<ApplicationForm />} />
        <Route path="/jobdescription/:id" element={<JobDescriptionPage />} />

        {/* Protected Routes */}
        <Route
          path="/addjobs"
          element={
            isAuthenticated ? <JobPosting /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/applicants"
          element={
            isAuthenticated ? <JobApplicants /> : <Navigate to="/jobapplicants" replace />
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

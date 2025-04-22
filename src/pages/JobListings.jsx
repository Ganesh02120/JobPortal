import { useState, useEffect } from "react";
import { Briefcase, IndianRupee, MapPin, Bookmark } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [role, setRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 3; // Change this number if needed

  const Navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const params = new URLSearchParams();
        params.append("page", currentPage);
        params.append("limit", pageSize);
        if (city) params.append("city", city);
        if (category) params.append("category", category);
        if (role) params.append("role", role);

        const api = `http://156.67.111.32:3120/api/jobPortal/getAllJobPostings?${params.toString()}`;
        const response = await axios.get(api, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setJobs(response.data.jobPostings || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, [currentPage, city, category, role]);

  const handleNavigation = (Id) => {
    Navigate(`/jobdescription/${Id}`);
  };

  const handleApply = (Id) => {
    Navigate(`/jobapply/${Id}`);
  };

  const removeHtmlTags = (str) => {
    if (!str) return "";
    return str.replace(/<\/?[^>]+(>|$)/g, "");
  };

  return (
    <div className="bg-gray-100 min-h-screen px-4 sm:px-10 py-10">
  {/* Logo */}
  <div className="flex items-center mb-6">
    {/* <img src="/logo1.png" alt="logo" className="w-32 sm:w-40" /> */}
  </div>

  {/* Layout */}
  <div className="flex flex-col md:flex-row gap-6">
    {/* Filters */}
    <div className="md:w-1/4 w-full space-y-4">
      <select
        className="border border-gray-300 py-2 px-3 w-full rounded text-gray-800"
        onChange={(e) => setCity(e.target.value)}
      >
        <option value="">Filter by City</option>
        <option value="Bengaluru">Bengaluru</option>
        <option value="Mumbai">Mumbai</option>
      </select>

      <select
        className="border border-gray-300 py-2 px-3 w-full rounded text-gray-800"
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Filter by Category</option>
        <option value="Manual Testing">Manual Testing</option>
        <option value="Automation Testing">Automation Testing</option>
      </select>

      <select
        className="border border-gray-300 py-2 px-3 w-full rounded text-gray-800"
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">Filter by Role</option>
        <option value="SDET">SDET</option>
        <option value="Lead Tester">Lead Tester</option>
      </select>
    </div>

    {/* Job Listings */}
    <div className="md:w-3/4 w-full space-y-4">
      {jobs && jobs.length > 0 ? (
        jobs.map((job, index) => (
          <div
  key={index}
  className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition cursor-pointer"
  onClick={() => handleNavigation(job.Id)}
>
  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
    {/* Job Info */}
    <div className="space-y-1">
      <p className="text-lg font-semibold text-gray-900">
        {removeHtmlTags(job.Title)}
      </p>
      <p className="text-sm text-gray-600">{job.JobType}</p>
      <div className="flex flex-wrap gap-4 text-gray-500 text-sm mt-1">
        <span className="flex items-center gap-1">
          <Briefcase size={14} /> {job.Experience}
        </span>
        <span className="flex items-center gap-1">
          <IndianRupee size={14} /> Not Disclosed
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={14} /> {job.City}, {job.State}
        </span>
      </div>
    </div>

    {/* Apply Button */}
    <button
      className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-600"
      onClick={(e) => {
        e.stopPropagation();
        handleApply(job.Id);
      }}
    >
      Apply Now
    </button>
  </div>
</div>

        ))
      ) : (
        <p className="text-center text-gray-500">No jobs available</p>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 pt-6">
        <button
          className={`px-4 py-2 border rounded ${
            currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "hover:underline"
          }`}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="font-semibold">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className={`px-4 py-2 border rounded ${
            currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "hover:underline"
          }`}
          onClick={() => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  </div>
</div>
)
}
export default JobListings;

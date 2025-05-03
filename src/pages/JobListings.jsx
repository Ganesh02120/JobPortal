import { useState, useEffect } from "react";
import { Briefcase, IndianRupee, MapPin, X, Search } from "lucide-react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ cities: [], departments: [], jobTypes: [], experiences: [], salaries: [] });
  const [filters, setFilters] = useState({ cities: [], departments: [], jobTypes: [], experiences: [], salaries: [] });
  const [pendingFilters, setPendingFilters] = useState({ cities: [], departments: [], jobTypes: [], experiences: [], salaries: [] });
  const [openFilters, setOpenFilters] = useState({ cities: true, departments: true, jobTypes: false, experiences: false, salaries: false });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 5;

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const syncFiltersToUrl = (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, values]) => {
      values.forEach(val => params.append(key, val));
    });
    setSearchParams(params);
  };

  useEffect(() => {
    const initialFilters = {};
    for (const [key, values] of searchParams.entries()) {
      if (!initialFilters[key]) initialFilters[key] = [];
      initialFilters[key].push(values);
    }
    setFilters(prev => ({ ...prev, ...initialFilters }));
    setPendingFilters(prev => ({ ...prev, ...initialFilters }));
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await axios.get(
        "http://156.67.111.32:3120/api/jobportal/getAllJobPostings",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            JobType: filters.jobTypes,
            City: filters.cities,
            Department: filters.departments,
            Experience: filters.experiences,
            Salary: filters.salaries,
          },
        }
      );

      const data = response.data.jobPostings || [];
      setAllJobs(data);

      const cities = [...new Set(data.map(job => job.City).filter(Boolean))];
      const departments = [...new Set(data.map(job => job.Department).filter(Boolean))];
      const jobTypes = [...new Set(data.map(job => job.JobType).filter(Boolean))];
      const experiences = [...new Set(data.map(job => job.ExperienceRequired || job.Experience).filter(Boolean))];
      const salaries = [...new Set(data.map(job => job.SalaryRange || job.Salary).filter(Boolean))];

      setFilterOptions({ cities, departments, jobTypes, experiences, salaries });

      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      setJobs(data.slice(start, end));
      setTotalPages(Math.ceil(data.length / pageSize));
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncFiltersToUrl(filters);
    fetchJobs();
  }, [filters, currentPage]);

  const toggleFilter = (key, value) => {
    setPendingFilters(prev => {
      const list = new Set(prev[key]);
      list.has(value) ? list.delete(value) : list.add(value);
      return { ...prev, [key]: Array.from(list) };
    });
  };

  const toggleFilterSection = (key) => {
    setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNavigation = (Id) => navigate(`/jobdescription/${Id}`);
  const handleApply = (Id) => navigate(`/jobapply/${Id}`);
  const removeHtmlTags = (str) => str?.replace(/<[^>]*>?/gm, "") || "";

  const clearFilters = () => {
    setPendingFilters({ cities: [], departments: [], jobTypes: [], experiences: [], salaries: [] });
    setFilters({ cities: [], departments: [], jobTypes: [], experiences: [], salaries: [] });
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setFilters({ ...pendingFilters });
    setCurrentPage(1);
  };

  const renderFilterSection = (title, key, options) => (
    <div className="mb-6">
      <h4
        className="text-md font-semibold text-blue-600 mb-2 uppercase tracking-wide cursor-pointer flex justify-between items-center"
        onClick={() => toggleFilterSection(key)}
      >
        {title}
        <span className="text-gray-400">{openFilters[key] ? '-' : '+'}</span>
      </h4>
      {openFilters[key] && (
        <div className="flex flex-wrap gap-2">
          {options.map((option, i) => (
            <button
              key={i}
              onClick={() => toggleFilter(key, option)}
              className={`px-3 py-1 rounded-full border text-sm font-medium transition duration-200 ${pendingFilters[key].includes(option) ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-500" : "bg-white hover:bg-gray-100 border-gray-300 text-gray-700"}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pt-24 px-4 sm:px-10 pb-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4 w-full p-6 bg-white shadow rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
            <button onClick={clearFilters} className="text-sm text-red-600 hover:underline">Clear</button>
          </div>
          {renderFilterSection("City", "cities", filterOptions.cities)}
          {renderFilterSection("Department", "departments", filterOptions.departments)}
          {renderFilterSection("Job Type", "jobTypes", filterOptions.jobTypes)}
          {renderFilterSection("Experience", "experiences", filterOptions.experiences)}
          {renderFilterSection("Salary", "salaries", filterOptions.salaries)}
          <button onClick={applyFilters} className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition">
            Apply Filters
          </button>
        </aside>

        <main className="lg:w-3/4 w-full space-y-6">
          {Object.entries(filters).some(([_, v]) => v.length > 0) && (
            <div className="flex flex-wrap gap-3">
              {Object.entries(filters).flatMap(([key, values]) =>
                values.map(value => (
                  <span key={`${key}-${value}`} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {value}
                    <X size={14} className="ml-2 cursor-pointer" onClick={() => toggleFilter(key, value)} />
                  </span>
                ))
              )}
            </div>
          )}

          {loading ? (
            <p className="text-center text-gray-600">Loading jobs...</p>
          ) : jobs.length > 0 ? (
            jobs.map((job, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg border shadow hover:shadow-md transition cursor-pointer"
                onClick={() => handleNavigation(job.Id)}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{removeHtmlTags(job.Title)}</h3>
                    <p className="text-sm text-gray-600">{job.JobType}</p>
                    <div className="flex flex-wrap gap-4 text-gray-500 text-sm mt-2">
                      <span className="flex items-center gap-1"><Briefcase size={14} /> {job.ExperienceRequired || job.Experience}</span>
                      <span className="flex items-center gap-1"><IndianRupee size={14} /> {job.SalaryRange || job.Salary || "Not Disclosed"}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {job.City}, {job.State}</span>
                    </div>
                  </div>
                  <button
                    className="bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-md hover:bg-blue-700"
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

          <div className="flex justify-center items-center gap-6 pt-6">
            <button
              className={`px-4 py-2 border rounded ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "hover:underline"}`}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="font-medium text-gray-800">Page {currentPage} of {totalPages}</span>
            <button
              className={`px-4 py-2 border rounded ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "hover:underline"}`}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default JobListings;
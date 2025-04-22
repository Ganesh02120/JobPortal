import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  EyeIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

const JobApplicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const { Id } = useParams();

  useEffect(() => {
    const fetchApplicants = async () => {
      const api = "http://156.67.111.32:3120/api/jobPortal/getAllApplications";
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("No token found, please log in.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(api, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (
          response.data.Status === "Success" &&
          Array.isArray(response.data.Applications)
        ) {
          setApplicants(response.data.Applications);
        } else {
          setError("Unexpected response format");
          setApplicants([]);
        }
      } catch (error) {
        setError("Failed to load applicants.");
        console.error("API Error:", error.response || error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicants();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-blue-800 text-center sm:text-left">
        Job Applicants
      </h1>

      {isLoading ? (
        <p className="text-gray-500 text-center">Loading applicants...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-md overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Total Applicants: {applicants.length}
          </h2>

          <div className="hidden sm:block">
            <table className="min-w-full border border-gray-300 text-sm sm:text-base">
              <thead className="bg-blue-200">
                <tr>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Email</th>
                  <th className="border p-2 text-left hidden sm:table-cell">
                    Phone
                  </th>
                  <th className="border p-2 text-left">Job Applied</th>
                  <th className="border p-2 text-left hidden md:table-cell">
                    Job ID
                  </th>
                  <th className="border p-2 text-left">Resume</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(applicants) && applicants.length > 0 ? (
                  applicants.map((app, index) => (
                    <tr key={index} className="text-left border-b hover:bg-blue-50">
                      <td className="border p-2">{app.Candidate?.FullName || "N/A"}</td>
                      <td className="border p-2">{app.Candidate?.Email || "N/A"}</td>
                      <td className="border p-2 hidden sm:table-cell">{app.Candidate?.PhoneNumber || "N/A"}</td>
                      <td className="border p-2">{app?.JobTitle || "N/A"}</td>
                      <td className="border p-2 hidden md:table-cell text-center">
                        <span className="px-2 py-1 rounded bg-blue-500 text-white text-xs sm:text-sm">
                          {app?.JobId || "Unknown"}
                        </span>
                      </td>
                      <td className="border p-2 flex items-center gap-2">
                        {app.Candidate?.ResumeUrl ? (
                          <>
                            <button onClick={() => setPreviewUrl(app.Candidate.ResumeUrl)} className="text-green-600 hover:text-green-800">
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <a href={app.Candidate.ResumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800" download>
                              <ArrowDownTrayIcon className="h-5 w-5" />
                            </a>
                          </>
                        ) : (
                          <span className="text-gray-400">Not Available</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-gray-500">No applicants found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicants;

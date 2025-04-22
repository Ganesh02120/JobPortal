import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DOMPurify from "dompurify";
import { ShareIcon, XMarkIcon } from "@heroicons/react/24/solid";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaWhatsapp,
  FaEnvelope,
  FaCopy,
} from "react-icons/fa";

function JobDescriptionPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [jobData, setJobData] = useState(null);
  
  
  const { id } = useParams();
  console.log(id)
  const sanitizeJobData = (data) => {
    if (!data) return {};

    return Object.keys(data).reduce((acc, key) => {
      if (typeof data[key] === "object" && data[key] !== null) {
        // Recursively sanitize nested objects (like `address`)
        acc[key] = sanitizeJobData(data[key]);
      } else {
        acc[key] = DOMPurify.sanitize(data[key] || "");
      }
      return acc;
    }, {});
  };
  const cleanData = sanitizeJobData(jobData); // Sanitize all fields

  const removePTags = (data) => {
    if (typeof data === "string") {
      // Remove all <p> and </p> tags from the string
      return data.replace(/<p>/g, "").replace(/<\/p>/g, "");
    }
    if (Array.isArray(data)) {
      return data.map(removePTags);
    }
    if (typeof data === "object" && data !== null) {
      const processed = {};
      for (const key in data) {
        processed[key] = removePTags(data[key]);
      }
      return processed;
    }
    return data;
  };

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const jobUrl = window.location.href; // Get current job URL
  // Social Media Share Links
  const socialLinks = [
    {
      name: "Facebook",
      icon: <FaFacebook className="text-blue-600" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${jobUrl}`,
    },
    {
      name: "Twitter",
      icon: <FaTwitter className="text-blue-400" />,
      url: `https://twitter.com/intent/tweet?url=${jobUrl}&text=Check out this job!`,
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin className="text-blue-700" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${jobUrl}`,
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp className="text-green-600" />,
      url: `https://api.whatsapp.com/send?text=Check out this job! ${jobUrl}`,
    },
    {
      name: "Email",
      icon: <FaEnvelope className="text-red-500" />,
      url: `mailto:?subject=Job Opportunity&body=Check out this job: ${jobUrl}`,
    },
  ];
  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(jobUrl);
    alert("Link copied to clipboard!");
  };

  useEffect(() => {
    
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          alert("No authentication token found. Please log in again.");
          navigate("/login"); // Redirect to login
          return;
        }
     
        const response = await axios.get(
          `http://156.67.111.32:3120/api/jobPortal/getJobPostingById/${id}`,
         
          { headers: { Authorization: `Bearer ${token}`,"Content-Type": "application/json",} },
        );
        if (response.data) {
          setJobData(response.data);
          console.log("Job data loaded successfully:", response.data);
        } else {
          alert("No job data found.");
        }
      } catch (error) {
        console.error("Error fetching job:", error.response?.data || error.message);
        alert(`Failed to load job data: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
   
    if (id) fetchJob();
  }, [id]);
  // Handle Save Changes (POST API)
  const handleSave = async () => {
    try {
      const api = `http://156.67.111.32:3120/api/jobportal/updateJobPosting/${id}`;
      const token = localStorage.getItem("authToken");

      if (!token) {
        alert("You must be logged in to edit this job.");
        return;
      }

      // Process jobData to remove <p> tags from all fields
      const processedData = removePTags(jobData);

      await axios.put(
        api,
        processedData, // Send the processed data without <p> tags
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Job details updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error(
        "Error updating job:",
        error.response?.data || error.message
      );
      alert("Failed to update job. Please try again.");
    }
  };
  const handleApply = (id) => {
    navigate(`/jobapply/${id}`);
  };

  // If still loading, show a spinner or message

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <img src="/Spinner.gif" alt="Loading..." className="w-20 h-20" />
      </div>
    );
  }

  // If no data found, show an error message
  if (!jobData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 text-lg">
          Job not found or data unavailable.
        </p>
      </div>
    );    
  }
  return (
    <div className="flex flex-col min-h-screen bg-white py-20">
      {/* Job Title Section */}
      <div className="flex items-start justify-between pb-4 px-4 sm:px-6 lg:px-20 xl:px-72">
        <div className="flex-grow">
          {isEditing ? (
            <ReactQuill
              value={jobData?.Title || ""}
              onChange={(value) => setJobData({ ...jobData, Title: value })}
              className="bg-white rounded-md"
            />
          ) : (
            <h1
              className="font-bold text-2xl"
              dangerouslySetInnerHTML={{ __html: cleanData.Title }}
            />
          )}
        </div>

        <div className="ml-4">
          {!isEditing ? (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
              onClick={() => setIsEditing(true)}
            >
              Edit Job Description
            </button>
          ) : (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md"
              onClick={handleSave}
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="pb-4 px-4 sm:px-6 lg:px-20 xl:px-72">
        {isEditing ? (
          <>
            {/* City Input */}
            <ReactQuill
              name="city"
              value={jobData?.address?.City || ""}
              onChange={(value) =>
                setJobData({
                  ...jobData,
                  address: { ...jobData.address, City: value },
                })
              }
              className="text-gray-500 px-2 py-1 rounded-md w-full mb-2"
            />

            {/* State Input */}
            <ReactQuill
              name="state"
              value={jobData?.address?.State || ""}
              onChange={(value) =>
                setJobData({
                  ...jobData,
                  address: { ...jobData.address, State: value },
                })
              }
              className="text-gray-500 px-2 py-1 rounded-md w-full mb-2"
            />

            {/* Country Input */}
            <ReactQuill
              name="country"
              value={jobData?.address?.Country || ""}
              onChange={(value) =>
                setJobData({
                  ...jobData,
                  address: { ...jobData.address, Country: value },
                })
              }
              className="text-gray-500 px-2 py-1 rounded-md w-full mb-2"
            />

            {/* Status Input */}
            <ReactQuill
              name="status"
              value={jobData?.Status || ""}
              onChange={(value) => setJobData({ ...jobData, Status: value })}
              className="text-gray-500 px-2 py-1 rounded-md w-full"
            />
          </>
        ) : (
          <>
            {/* Display City, State, Country, and Status in one line */}
            <span style={{ whiteSpace: "nowrap" }}>
              <strong>City:</strong>
              <span dangerouslySetInnerHTML={{ __html: cleanData.City }} />
              <strong> State:</strong>{" "}
              <span dangerouslySetInnerHTML={{ __html: cleanData.State }} />
              <strong> Country:</strong>{" "}
              <span dangerouslySetInnerHTML={{ __html: cleanData.Country }} />
            </span>
          </>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mt-4 px-4 sm:px-6 lg:px-20 xl:px-72 pb-4">
        <button
          className="border border-blue-600 text-white-600 px-10 py-2 rounded-md hover:bg-blue-50 w-full sm:w-auto"
          onClick={() => navigate("/joblist")}
        >
          View All Jobs
        </button>
        <button
          className="bg-blue-600 text-white px-10 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto"
          onClick={() => handleApply(id)}
        >
          Apply
        </button>
      </div>

      <hr className="md:mx-72 border-gray-300 py-2" />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 px-4 sm:px-6 lg:px-20 xl:px-72">
        <div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700  sm:w-auto"
            onClick={() => setIsOpen(true)}
          >
            <ShareIcon className="h-5 w-5 mr-2" /> Share this job
          </button>
          {/* Share Modal */}
          {isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Share this job</h2>
                  <button onClick={() => setIsOpen(false)}>
                    <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                  </button>
                </div>

                {/* Share Options */}
                <div className="mt-4 space-y-3">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 border   hover:bg-gray-100"
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </a>
                  ))}

                  {/* Copy Link */}
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 p-2 border   hover:bg-gray-100 w-full"
                  >
                    <FaCopy className="text-gray-500" />
                    <span>Copy Link</span>
                  </button>
                </div>

                {/* Close Button */}
                <button
                  className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-black py-2  "
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Edit Button */}
      </div>

      {/* Job Details */}
      <div className="mt-6 px-4 sm:px-6 md:px-72">
        <h3 className="text-lg font-semibold">Job Description:</h3>
        {isEditing ? (
          <ReactQuill
            name="description"
            value={jobData?.Description || ""}
            onChange={(value) => setJobData({ ...jobData, Description: value })}
            className="w-full p-2"
          />
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: cleanData.Description }}
            className="text-gray-700"
          />
        )}
      </div>

      {/* Experience */}
      <div className="mt-6 px-4 sm:px-6 md:px-72">
        <h3 className="text-lg font-semibold">Experience:</h3>
        {isEditing ? (
          <ReactQuill
            name="ExperienceRequired"
            value={jobData?.ExperienceRequired || ""}
            onChange={(value) =>
              setJobData({ ...jobData, ExperienceRequired: value })
            }
            className="w-full p-2"
          />
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: cleanData.Experience }}
            className="text-gray-700"
          />
        )}
      </div>

      {/* Department */}
      <div className="mt-6 px-4 sm:px-6 md:px-72">
        <h3 className="text-lg font-semibold">Department:</h3>
        {isEditing ? (
          <ReactQuill
            name="department"
            value={jobData?.Department || ""}
            onChange={(value) => setJobData({ ...jobData, Department: value })}
            className="w-full p-2"
          />
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: cleanData.Department }}
            className="text-gray-700"
          />
        )}
      </div>

      {/* Job Type */}
      <div className="mt-6 px-4 sm:px-6 md:px-72">
        <h3 className="text-lg font-semibold">Job Type:</h3>
        {isEditing ? (
          <ReactQuill
            name="jobType"
            value={jobData?.JobType || ""}
            onChange={(value) => setJobData({ ...jobData, JobType: value })}
            className="w-full p-2"
          />
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: cleanData.JobType }}
            className="text-gray-700"
          />
        )}
      </div>
      {/* Salary Range */}
      <div className="mt-6 px-4 sm:px-6 md:px-72">
        <h3 className="text-lg font-semibold">Salary Range:</h3>
        {isEditing ? (
          <ReactQuill
            name="salaryRange"
            value={jobData?.SalaryRange || ""}
            onChange={(value) => setJobData({ ...jobData, SalaryRange: value })}
            className="w-full p-2"
          />
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: cleanData.Salary }}
            className="text-gray-700"
          />
        )}
      </div>
      {/* Job Responsibilities */}
      <div className="mt-6 px-4 sm:px-6 md:px-72">
        <h3 className="text-lg font-semibold">Job Responsibilities:</h3>
        {isEditing ? (
          <ReactQuill
            name="jobResponsibilities"
            value={jobData?.JobResponsibilities || ""}
            onChange={(value) =>
              setJobData({ ...jobData,JobResponsibilities: value })
            }
            className="w-full p-2"
          />
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: cleanData.JobResponsibilities }}
            className="text-gray-700"
          />
          
        )}
      </div>

      {/* Educational Qualifications */}
      <div className="mt-6 px-4 sm:px-6 md:px-72">
        <h3 className="text-lg font-semibold">Education Qualification:</h3>
        {isEditing ? (
          <ReactQuill
            name="EduQualifications"
            value={jobData?.EduQualifications || ""}
            onChange={(value) =>
              setJobData({ ...jobData, EduQualifications: value })
            }
            className="w-full p-2"
          />
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: cleanData.EduQualifications }}
            className="text-gray-700"
          />
        )}
      </div>

      {/* Skills Section */}
      <div className="mb-6 mt-6 px-4 sm:px-6   md:px-72">
        <h2 className="text-xl font-semibold">Skills Required:</h2>
        {/* {console.log(jobData.SkillsRequired)} */}
        {isEditing ? (
          <ReactQuill
            name="SkillsRequired"
            value={jobData?.SkillsRequired}
            onChange={(value) =>
              setJobData({ ...jobData, SkillsRequired:value })
            }
            className=" p-2  rounded-md w-full h-24 resize-none"
          />
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: cleanData.SkillsRequired }}
            className="text-gray-700"
          />
        )}
      </div>
    </div>
  );
}

export default JobDescriptionPage;
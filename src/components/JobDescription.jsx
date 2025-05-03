import { useState, useEffect, useCallback, useRef } from "react";
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
  const [isSaving, setIsSaving] = useState(false);
  const [editModeData, setEditModeData] = useState(null);
  const quillRef = useRef(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success"); // 'success' or 'error'

  const { id } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const jobUrl = window.location.href;

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
    setPopupMessage("Link copied to clipboard!");
    setPopupType("success");
    setIsPopupOpen(true);
  };

  // Sanitize job data with DOMPurify
  const sanitizeJobData = (data) => {
    if (!data) return {};

    return Object.keys(data).reduce((acc, key) => {
      if (typeof data[key] === "object" && data[key] !== null) {
        acc[key] = sanitizeJobData(data[key]);
      } else {
        acc[key] = DOMPurify.sanitize(data[key] || "", {
          ALLOWED_TAGS: [
            "b",
            "i",
            "u",
            "strong",
            "em",
            "ul",
            "ol",
            "li",
            "p",
            "br",
            "span",
            "div",
          ],
          ALLOWED_ATTR: ["style"],
        });
      }
      return acc;
    }, {});
  };

  const cleanData = sanitizeJobData(jobData);
  console.log("Sanitized cleanData:", cleanData);

  // Modified removePTags to preserve list tags
  const removePTags = (data) => {
    if (typeof data === "string") {
      return data.replace(/<p>(?!<ul>|<ol>)/g, "").replace(/<\/p>/g, "");
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

  // ReactQuill modules
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  const handleEditClick = useCallback(() => {
    setEditModeData(JSON.parse(JSON.stringify(jobData)));
    setIsEditing(true);
  }, [jobData]);

  const handleInputChange = useCallback((field, value) => {
    setEditModeData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  }, []);

  const handleAddressChange = useCallback((field, value) => {
    setEditModeData((prevData) => ({
      ...prevData,
      address: {
        ...prevData.address,
        [field]: value,
      },
    }));
  }, []);

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setPopupMessage("No authentication token found. Please log in again.");
          setPopupType("error");
          setIsPopupOpen(true);
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://156.67.111.32:3120/api/jobPortal/getJobPostingById/${id}`,
          {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          }
        );
        if (response.data) {
          console.log("API Response:", response.data);
          setJobData({
            ...response.data,
            address: {
              City: response.data.City || response.data.city || response.data.address?.City || "",
              State: response.data.State || response.data.state || response.data.address?.State || "",
              Country: response.data.Country || response.data.country || response.data.address?.Country || "",
            },
            Experience: response.data.Experience || response.data.experience || "",
            Salary: response.data.Salary || response.data.salary || "",
          });
        } else {
          setPopupMessage("No job data found.");
          setPopupType("error");
          setIsPopupOpen(true);
        }
      } catch (error) {
        console.error("Error fetching job:", error.response?.data || error.message);
        setPopupMessage(`Failed to load job data: ${error.response?.data?.message || error.message}`);
        setPopupType("error");
        setIsPopupOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchJob();
  }, [id, navigate]);

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      const api = `http://156.67.111.32:3120/api/jobportal/updateJobPosting/${id}`;
      const token = localStorage.getItem("authToken");

      if (!token) {
        setPopupMessage("You must be logged in to edit this job.");
        setPopupType("error");
        setIsPopupOpen(true);
        return;
      }

      const processedData = removePTags(editModeData);
      console.log("Data being sent to API:", processedData);

      await axios.put(api, processedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJobData(editModeData);
      setPopupMessage("Job details updated successfully!");
      setPopupType("success");
      setIsPopupOpen(true);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating job:", error.response?.data || error.message);
      setPopupMessage("Failed to update job. Please try again.");
      setPopupType("error");
      setIsPopupOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApply = (id) => {
    navigate(`/jobapply/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <img src="/Spinner.gif" alt="Loading..." className="w-20 h-20" />
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 text-lg">Job not found or data unavailable.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full bg-white shadow-md rounded-lg p-6">
        {/* Job Title Section */}
        <div className="flex flex-col sm:flex-row items-start justify-between mb-6">
          <div className="flex-grow">
            {isEditing ? (
              <input
                type="text"
                value={editModeData?.Title || ""}
                onChange={(e) => handleInputChange("Title", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                placeholder="Job Title"
              />
            ) : (
              <h1
                className="text-2xl font-bold text-gray-900"
                dangerouslySetInnerHTML={{ __html: cleanData.Title || "No Title" }}
              />
            )}
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4">
            {!isEditing && (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleEditClick}
              >
                Edit Job Description
              </button>
            )}
          </div>
        </div>

        {/* Location Section */}
        <div className="mb-6">
          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">City</h3>
                <input
                  type="text"
                  name="city"
                  value={editModeData?.address?.City || ""}
                  onChange={(e) => handleAddressChange("City", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">State</h3>
                <input
                  type="text"
                  name="state"
                  value={editModeData?.address?.State || ""}
                  onChange={(e) => handleAddressChange("State", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="State"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Country</h3>
                <input
                  type="text"
                  name="country"
                  value={editModeData?.address?.Country || ""}
                  onChange={(e) => handleAddressChange("Country", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Country"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Status</h3>
                <select
                  value={editModeData?.Status || ""}
                  onChange={(e) => handleInputChange("Status", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="text-gray-700">
              <span className="inline-flex items-center">
                <strong className="mr-2">City:</strong>
                <span
                  dangerouslySetInnerHTML={{ __html: cleanData?.address?.City || "N/A" }}
                />
              </span>
              <span className="inline-flex items-center ml-4">
                <strong className="mr-2">State:</strong>
                <span
                  dangerouslySetInnerHTML={{ __html: cleanData?.address?.State || "N/A" }}
                />
              </span>
              <span className="inline-flex items-center ml-4">
                <strong className="mr-2">Country:</strong>
                <span
                  dangerouslySetInnerHTML={{ __html: cleanData?.address?.Country || "N/A" }}
                />
              </span>
            </div>
          )}
        </div>

        {/* Buttons (View Mode Only) */}
        {!isEditing && (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                className="border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => navigate("/joblistings")}
              >
                View All Jobs
              </button>
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => handleApply(id)}
              >
                Apply
              </button>
            </div>

            <hr className="border-gray-300 my-6" />

            {/* Share Button */}
            <div className="mb-6">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setIsOpen(true)}
              >
                <ShareIcon className="h-5 w-5 mr-2" /> Share this job
              </button>
              {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Share this job</h2>
                      <button onClick={() => setIsOpen(false)}>
                        <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {socialLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 border border-gray-200 rounded-md hover:bg-gray-100"
                        >
                          {link.icon}
                          <span className="text-gray-700">{link.name}</span>
                        </a>
                      ))}
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 p-2 border border-gray-200 rounded-md hover:bg-gray-100 w-full"
                      >
                        <FaCopy className="text-gray-500" />
                        <span className="text-gray-700">Copy Link</span>
                      </button>
                    </div>
                    <button
                      className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Job Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Description</h3>
          {isEditing ? (
            <div>
              <ReactQuill
                ref={quillRef}
                value={editModeData?.Description || ""}
                onChange={(value) => handleInputChange("Description", value)}
                modules={modules}
                className="w-full bg-white border border-gray-300 rounded-md"
              />
            </div>
          ) : (
            <div
              className="text-gray-700 quill-content"
              dangerouslySetInnerHTML={{ __html: cleanData.Description || "No description available" }}
            />
          )}
        </div>

        {/* Experience */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Experience</h3>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={editModeData?.Experience || ""}
                onChange={(e) => handleInputChange("Experience", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Experience"
              />
            </div>
          ) : (
            <div
              className="text-gray-700 quill-content"
              dangerouslySetInnerHTML={{ __html: cleanData.Experience || "No experience specified" }}
            />
          )}
        </div>

        {/* Department */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Department</h3>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={editModeData?.Department || ""}
                onChange={(e) => handleInputChange("Department", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Department"
              />
            </div>
          ) : (
            <div
              className="text-gray-700 quill-content"
              dangerouslySetInnerHTML={{ __html: cleanData.Department || "No department specified" }}
            />
          )}
        </div>

        {/* Job Type */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Type</h3>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={editModeData?.JobType || ""}
                onChange={(e) => handleInputChange("JobType", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Job Type"
              />
            </div>
          ) : (
            <div
              className="text-gray-700 quill-content"
              dangerouslySetInnerHTML={{ __html: cleanData.JobType || "No job type specified" }}
            />
          )}
        </div>

        {/* Salary Range */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Salary Range</h3>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={editModeData?.Salary || ""}
                onChange={(e) => handleInputChange("Salary", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Salary Range"
              />
            </div>
          ) : (
            <div
              className="text-gray-700 quill-content"
              dangerouslySetInnerHTML={{ __html: cleanData.Salary || "No salary range specified" }}
            />
          )}
        </div>

        {/* Job Responsibilities */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Responsibilities</h3>
          {isEditing ? (
            <div>
              <ReactQuill
                ref={quillRef}
                value={editModeData?.JobResponsibilities || ""}
                onChange={(value) => handleInputChange("JobResponsibilities", value)}
                modules={modules}
                className="w-full bg-white border border-gray-300 rounded-md"
              />
            </div>
          ) : (
            <div
              className="text-gray-700 quill-content"
              dangerouslySetInnerHTML={{ __html: cleanData.JobResponsibilities || "No responsibilities specified" }}
            />
          )}
        </div>

        {/* Educational Qualifications */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Education Qualification</h3>
          {isEditing ? (
            <div>
              <textarea
                value={editModeData?.EduQualifications || ""}
                onChange={(e) => handleInputChange("EduQualifications", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="Education Qualification"
                rows={4}
              />
            </div>
          ) : (
            <div
              className="text-gray-700 quill-content"
              dangerouslySetInnerHTML={{ __html: cleanData.EduQualifications || "No qualifications specified" }}
            />
          )}
        </div>

        {/* Skills Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills Required</h3>
          {isEditing ? (
            <div>
              <ReactQuill
                ref={quillRef}
                value={editModeData?.SkillsRequired || ""}
                onChange={(value) => handleInputChange("SkillsRequired", value)}
                modules={modules}
                className="w-full bg-white border border-gray-300 rounded-md"
              />
            </div>
          ) : (
            <div
              className="text-gray-700 quill-content"
              dangerouslySetInnerHTML={{ __html: cleanData.SkillsRequired || "No skills specified" }}
            />
          )}
        </div>

        {/* Save Changes Button (Edit Mode Only) */}
        {isEditing && (
          <div className="flex justify-center gap-4 mt-6 mb-6">
            <button
              className={`bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isSaving ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              onClick={() => navigate("/joblistings")}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Success Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <div className="flex justify-center mb-4">
              {popupType === "success" ? (
                <span className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              ) : (
                <span className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </span>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {popupType === "success" ? "Success" : "Error"}
            </h2>
            <p className="text-gray-600 mb-4">{popupMessage}</p>
            <button
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              onClick={() => {
                setIsPopupOpen(false);
                if (popupType === "error" && popupMessage.includes("Please log in")) {
                  navigate("/login");
                }
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Inline CSS for Quill content */}
      <style jsx>{`
        .quill-content ul {
          list-style-type: disc;
          margin-left: 20px;
        }
        .quill-content ol {
          list-style-type: decimal;
          margin-left: 20px;
        }
        .quill-content li {
          margin-bottom: 8px;
        }
        .quill-content b,
        .quill-content strong {
          font-weight: bold;
        }
        .quill-content i,
        .quill-content em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

export default JobDescriptionPage;
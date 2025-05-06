import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import DOMPurify from "dompurify";

export default function AddJobs() {
  const [jobDetails, setJobDetails] = useState({
    Title: "",
    Description: "",
    Department: "",
    JdDocumentUrl: "",
    Country: "",
    State: "",
    City: "",
    SalaryRange: "",
    ExperienceRequired: "",
    JobType: "",
    EduQualifications: "",
    JobResponsibilities: "",
    SkillsRequired: "",
    Status: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  const handleChange = (field, value) => {
    setJobDetails((prev) => ({ ...prev, [field]: value }));
  };

  const sanitizeInput = (value, isRichText = false) => {
    if (isRichText) {
      return DOMPurify.sanitize(value, {
        ALLOWED_TAGS: ["b", "i", "u", "strong", "em", "ul", "ol", "li", "p", "br", "span", "div"],
        ALLOWED_ATTR: ["style"],
      });
    }
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] }).trim();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await axios.post("http://156.67.111.32:3120/api/jobportal/jobPostings", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (uploadResponse.data?.fileUrl) {
        setJobDetails((prev) => ({ ...prev, JdDocumentUrl: uploadResponse.data.fileUrl }));
      }
    } catch (err) {
      console.error("Upload Error:", err.response || err); // No UI error shown
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      const data = {
        Title: sanitizeInput(jobDetails.Title),
        Description: sanitizeInput(jobDetails.Description, true),
        Department: sanitizeInput(jobDetails.Department),
        JdDocumentUrl: sanitizeInput(jobDetails.JdDocumentUrl),
        Country: sanitizeInput(jobDetails.Country),
        State: sanitizeInput(jobDetails.State),
        City: sanitizeInput(jobDetails.City),
        SalaryRange: sanitizeInput(jobDetails.SalaryRange),
        ExperienceRequired: sanitizeInput(jobDetails.ExperienceRequired),
        JobType: sanitizeInput(jobDetails.JobType),
        EduQualifications: sanitizeInput(jobDetails.EduQualifications),
        JobResponsibilities: sanitizeInput(jobDetails.JobResponsibilities, true),
        SkillsRequired: sanitizeInput(jobDetails.SkillsRequired, true),
        Status: sanitizeInput(jobDetails.Status),
      };

      const api = "http://156.67.111.32:3120/api/jobportal/jobPostings";
      const response = await axios.post(api, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        alert("Job posted successfully!");
        resetForm();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setJobDetails({
      Title: "",
      Description: "",
      Department: "",
      JdDocumentUrl: "",
      Country: "",
      State: "",
      City: "",
      SalaryRange: "",
      ExperienceRequired: "",
      JobType: "",
      EduQualifications: "",
      JobResponsibilities: "",
      SkillsRequired: "",
      Status: "",
    });
    setSuccess(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Post a New Job</h2>

        {/* Job Title */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Job Title</h3>
          <input
            type="text"
            value={jobDetails.Title}
            onChange={(e) => handleChange("Title", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="Enter job title"
          />
        </div>

        {/* Location */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Location</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["City", "State", "Country"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1">{field}</label>
                <input
                  type="text"
                  value={jobDetails[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder={`Enter ${field.toLowerCase()}`}
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={jobDetails.Status}
                onChange={(e) => handleChange("Status", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">Select Status</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rich Text Fields */}
        {[
          ["Description", "Job Description"],
          ["JobResponsibilities", "Job Responsibilities"],
          ["SkillsRequired", "Skills Required"],
        ].map(([field, label]) => (
          <div className="mb-6" key={field}>
            <h3 className="text-lg font-semibold mb-2">{label}</h3>
            <ReactQuill
              value={jobDetails[field]}
              onChange={(value) => handleChange(field, value)}
              modules={modules}
              className="w-full border border-gray-300 rounded-md"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </div>
        ))}

        {/* Other Inputs */}
        {[
          ["ExperienceRequired", "Experience Required"],
          ["Department", "Department"],
          ["SalaryRange", "Salary Range"],
        ].map(([field, label]) => (
          <div className="mb-6" key={field}>
            <h3 className="text-lg font-semibold mb-2">{label}</h3>
            <input
              type="text"
              value={jobDetails[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </div>
        ))}

        {/* Educational Qualifications */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Educational Qualifications</h3>
          <textarea
            value={jobDetails.EduQualifications}
            onChange={(e) => handleChange("EduQualifications", e.target.value)}
            rows="5"
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="Enter educational qualifications"
          />
        </div>

        {/* Job Type */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Job Type</h3>
          <select
            value={jobDetails.JobType}
            onChange={(e) => handleChange("JobType", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          >
            <option value="">Select Job Type</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Job Description Document</h3>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        {/* Success Message */}
        {success && (
          <p className="text-green-600 text-center mb-4">Job posted successfully!</p>
        )}

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Posting..." : "Post Job"}
          </button>
          <button
            onClick={resetForm}
            className="bg-gray-300 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-400"
          >
            Reset Form
          </button>
        </div>
      </div>
    </div>
  );
}

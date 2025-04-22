import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import DOMPurify from "dompurify";


export default function JobPosting() {
  const [JobDetails, setJobDetails] = useState({
    Title: "",
    Description: "",
    Department: "",
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
    JdDocumentUrl: null,
  });

  const [Loading, setLoading] = useState(false);
  const [Error, setError] = useState(null);
  const [Success, setSuccess] = useState(false);
  const handleChange = (field, value) => {
    setJobDetails((prev) => ({ ...prev, [field]: value }));
  };

  const sanitizeInput = (html) => {
    return DOMPurify.sanitize(html)
      .replace(/<[^>]+>/g, "")
      .trim();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setJobDetails((prev) => ({ ...prev, JdDocument: file }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      Object.entries(JobDetails).forEach(([key, value]) => {
        if (key === "JdDocument" && value) {
          formData.append(key, value);
        } else {
          formData.append(key, sanitizeInput(value));
        }
      });

      const api = "http://156.67.111.32:3120/api/jobportal/jobPostings";
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      const response = await axios.post(api, formData, {
        headers: {
          "Content-Type": "multipart/form-data;",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        alert("Job posted successfully!");
        setJobDetails({
          Title: "",
          Description: "",
          Department: "",
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
          JdDocumentUrl: null,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to post job. Please try again."
      );
      console.error("API Error:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800">
        Job Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="font-semibold text-gray-700"> Job Title</label>
            <input
              type="text"
              value={JobDetails.Title}
              onChange={(e) => handleChange("Title", e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-2 mt-1 w-full focus:outline-none focus:border-blue-500 hover:border-blue-500 transition duration-200"
            />
          </div>
          <div>
            <label className="font-semibold text-gray-700">City</label>
            <input
              type="text"
              value={JobDetails.City}
              onChange={(e) => handleChange("City", e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-2 mt-1 w-full focus:outline-none focus:border-blue-500 hover:border-blue-500 transition duration-200"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Salary Range</label>
            <input
              type="text"
              value={JobDetails.SalaryRange}
              onChange={(e) => handleChange("SalaryRange", e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-2 mt-1 w-full focus:outline-none focus:border-blue-500 hover:border-blue-500 transition duration-200"
            />
          </div>
          <div>
            <label className="font-semibold text-gray-700">
              Experience Required
            </label>
            <input
              type="text"
              value={JobDetails.ExperienceRequired}
              onChange={(e) =>
                handleChange("ExperienceRequired", e.target.value)
              }
              className="bg-white border border-gray-300 rounded px-3 py-2 mt-1 w-full focus:outline-none focus:border-blue-500 hover:border-blue-500 transition duration-200"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-semibold text-gray-700">Job Type</label>
            <select value={JobDetails.JobType} onChange={(e) => handleChange("JobType", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
              <option value="">Select</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <div>
  <label className="font-semibold text-gray-700">Country</label>
  <input
    type="text"
    value={JobDetails.Country}
    onChange={(e) => handleChange("Country", e.target.value)}
    className="bg-white border border-gray-300 rounded px-3 py-2 mt-1 w-full focus:outline-none focus:border-blue-500 hover:border-blue-500 transition duration-200"
  />
</div>

          <div>
            <label className="font-semibold text-gray-700">State</label>
            <input
              type="text"
              value={JobDetails.statetate}
              onChange={(e) => handleChange("State", e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-2 mt-1 w-full focus:outline-none focus:border-blue-500 hover:border-blue-500 transition duration-200"
            />
          </div>
          <div>
            <label className="font-semibold text-gray-700">Status</label>
            <select value={JobDetails.Status} onChange={(e) => handleChange("Status", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
              <option value="">Select Status</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div>
  <label className="font-semibold text-gray-700">Qualifications</label>
  <div className="border-gray-300 rounded-lg hover:border-blue-500 transition-colors duration-200">
    <ReactQuill
      value={JobDetails.EduQualifications}
      onChange={(value) => handleChange("EduQualifications", value)}
      className=" mb-20 rounded-lg h-[100px]"
    />
  </div>
</div>

<div>
  <label className="font-semibold text-gray-700">Skills</label>
  <div className="border-gray-300 rounded-lg hover:border-blue-500 transition-colors duration-200">
    <ReactQuill
      value={JobDetails.SkillsRequired}
      onChange={(value) => handleChange("SkillsRequired", value)}
      className="mb-20 rounded-lg h-[150px]"
    />
  </div>
</div>

      <div>
        <label className="font-semibold text-gray-700">Responsibilities</label>
        <div className="border-gray-300 rounded-lg hover:border-blue-500 transition-colors duration-200">
        <ReactQuill
          value={JobDetails.JobResponsibilities}
          onChange={(value) => handleChange("JobResponsibilities", value)}
          className="mb-20 rounded-lg h-[150px]"
        />
      </div>
      </div>
      <div>
        <label className="font-semibold text-gray-700">Description</label>
        <div className=" border-gray-300 rounded-lg hover:border-blue-500 transition-colors duration-200">
        <ReactQuill
          value={JobDetails.Description}
          onChange={(value) => handleChange("Description", value)}
          className="mb-20 rounded-lg h-[150px]"
        />
      </div>
      </div>
      <div>
        <label className="font-semibold text-gray-700">Department</label>
        <div className="border-gray-300 rounded-lg hover:border-blue-500 transition-colors duration-200">
        <ReactQuill
          value={JobDetails.Department}
          onChange={(value) => handleChange("Department", value)}
          className="mb-20 rounded-lg h-[100px]"
        />
      </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Upload JD Document (PDF or DOCX)
        </label>
        <div className="border border-gray-300 rounded p-3 bg-white hover:border-blue-500 transition-colors duration-200">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-700 file:bg-blue-100 file:text-blue-700 file:font-semibold file:border-0 file:px-4 file:py-2 file:rounded file:cursor-pointer hover:file:bg-blue-200"
          />
        </div>
      </div>

      {Error && <p className="text-red-500 text-center">{Error}</p>}
      {Success && (
        <p className="text-green-500 text-center">Job posted successfully!</p>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={Loading}
          className="w-1/4 bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition"
        >
          {Loading ? "Posting..." : "Post Job"}
        </button>
      </div>
    </div>
  );
}


import { useState, useEffect } from "react";
import axios from "axios";
import logo from "../assets/logo.png";

import * as pdfjs from "pdfjs-dist/webpack";

import mammoth from "mammoth";
import ReCAPTCHA from "react-google-recaptcha";
import { CloudArrowUpIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useParams } from "react-router-dom";

// Manually set the PDF worker path
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function ApplicationForm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEducationExpanded, setIsEducationExpanded] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const { Id } = useParams(); // ✅ Get Job ID from URL
  // console.log(Id);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",

    jobId: Id,
    resumeUrl: "",
    country: "",
    state: "",
    city: "",
    comments: "",
    educations: "",
    skills: "",
    currentSalary: "",
    expectedSalary: "",
    offerInHand: "",
    noticePeriod: "",
    totalRelevantExperience: "",
  });
  // ✅ Ensure Job ID updates if API fetches data
  useEffect(() => {
    setFormData((prev) => ({ ...prev, jobId: Id }));
  }, [Id]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  // const handleFileChange = async (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;
  //   console.log(file);

  //   const fileType = file.name.split(".").pop().toLowerCase();
  //   if (fileType === "pdf") {
  //     extractDataFromPDF(file);
  //   } else if (fileType === "docx") {
  //     extractDataFromDocx(file);
  //   } else {
  //     alert("Only PDF or DOCX files are supported!");
  //   }
  // };

  // const handleFileChange = async (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   console.log("Selected File:", file);

  //   const fileType = file.name.split(".").pop().toLowerCase();
  //   if (fileType === "pdf") {
  //     await extractDataFromPDF(file);
  //   } else if (fileType === "docx") {
  //     await extractDataFromDocx(file);
  //   } else {
  //     alert("Only PDF or DOCX files are supported!");
  //     return;
  //   }

  //   // ✅ Store file in state separately (without replacing resumeUrl)
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     resumeFile: file, // Keep the actual file in state
  //   }));
  // };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file); // ✅ Store file separately
    setUploadedFileName(file.name);

    const fileType = file.name.split(".").pop().toLowerCase();
    let extractedText = "";

    if (fileType === "pdf") {
      extractedText = await extractDataFromPDF(file);
    } else if (fileType === "docx") {
      extractedText = await extractDataFromDocx(file);
    } else {
      alert("Only PDF or DOCX files are supported!");
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      extractedText, // Store extracted text
    }));

    console.log("Updated FormData:", { extractedText });
  };

  // ✅ IMPROVED PDF TEXT EXTRACTION (Handles fragments better)
  const extractDataFromPDF = async (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
      let extractedText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        extractedText += pageText + "\n";
      }

      processExtractedText(extractedText);
    };
    reader.readAsArrayBuffer(file);
  };

  // ✅ IMPROVED DOCX TEXT EXTRACTION
  const extractDataFromDocx = async (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const result = await mammoth.extractRawText({
        arrayBuffer: reader.result,
      });
      processExtractedText(result.value);
    };
    reader.readAsArrayBuffer(file);
  };

  // ✅ SMART TEXT PROCESSING (Handles Missing Labels & Formats)
  const processExtractedText = (text) => {
    let extractedData = { ...formData }; // Keep existing data

    // ✅ Extract Full Name
    const namePattern = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2}\b/; // Matches "John Doe" or "John A. Doe"
    const nameMatch = text.match(namePattern);
    extractedData.fullName = nameMatch ? nameMatch[0] : "";

    // ✅ Extract Email
    const emailMatch = text.match(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i
    );
    extractedData.email = emailMatch ? emailMatch[0] : "";

    // ✅ Extract Phone Number
    const phoneMatch = text.match(/\b\d{10,12}\b/);
    extractedData.phoneNumber = phoneMatch ? phoneMatch[0] : "";

    // ✅ Extract Profile Link
    const profileLinkMatch = text.match(/https?:\/\/[^\s]+/g);
    extractedData.profileLink = profileLinkMatch ? profileLinkMatch[0] : "";

    // ✅ Extract Education Info
    const educationMatches = text.match(
      /(B\.?Tech|Bachelors|Master|MBA|MCA|BCA|Engineering|Graduation|Degree)\s*in\s*(.+?)(\n|$)/i
    );
    if (educationMatches) {
      extractedData.degree = educationMatches[1];
      extractedData.specialization = educationMatches[2];
    }

    // ✅ Extract City
    const cityMatch = text.match(/(City|Location|Address):?\s*(.+)/i);
    if (cityMatch) {
      extractedData.city = cityMatch[2].split(",")[0].trim();
    } else {
      // Try to match a city from a known city list
      const knownCities = [
        "New York",
        "Los Angeles",
        "Chicago",
        "Houston",
        "Miami",
        "Bangalore",
        "Mumbai",
        "Delhi",
        "London",
        "Varanasi",
        "Toronto",
        "Sydney",
      ];
      for (let city of knownCities) {
        if (text.includes(city)) {
          extractedData.city = city;
          break;
        }
      }
    }

    // ✅ Update Form Data with Extracted Values
    setFormData(extractedData);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("authToken");
      const apiUrl = "http://156.67.111.32:3120/api/jobPortal/jobApplication";

      const formPayload = new FormData();

      console.log("Before submission, formData:", formData);

      // ✅ Ensure resumeUrl is appended separately
      if (uploadedFile) {
        formPayload.append("resumeUrl", uploadedFile);
      } else {
        console.error("resumeUrl file is missing:", uploadedFile);
      }

      // ✅ Append extracted text separately
      if (formData.extractedText) {
        formPayload.append("extractedText", formData.extractedText);
      }

      // ✅ Append other form fields
      Object.keys(formData).forEach((key) => {
        if (key !== "resumeUrl" && key !== "extractedText") {
          formPayload.append(key, formData[key]);
        }
      });

      console.log("Submitting FormData:");
      for (let pair of formPayload.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axios.post(apiUrl, formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201 || response.status === 200) {
        alert("Application submitted successfully!");
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          jobId: 1,
          extractedText: "",
          resumeFileName: "",
          country: "",
          state: "",
          city: "",
          comments: "",
          educations: "",
          skills: "",
          currentSalary: "",
          expectedSalary: "",
          offerInHand: "",
          noticePeriod: "",
          totalRelevantExperience: "",
          profileLink: "",
        });

        setUploadedFile(null);
        setUploadedFileName(""); // Reset file name in UI
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    }
  };

  // Captcha handle
  const handleCaptchaChange = (value) => {
    if (value) {
      setIsVerified(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen ">
      {/* Header Section */}
      <header className="   py-4  md:pl-[400px] sm:flex justify-start px-3">
       
      </header>
      <hr />

      <div className="flex justify-center flex-grow mt-6 px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg max-w-lg sm:max-w-2xl w-full">
          <h2 className=" md:text-2xl sm:text-sm font-semibold text-center sm:text-start mb-4  ">
            Software Development Engineer in Test - SDET (KOL/BLR)
          </h2>
          <p className="text-center sm:text-start text-gray-500 pb-2 px-3">
            SUBMIT YOUR APPLICATION
          </p>
          <hr />

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* File Upload */}
            <label className="border-dashed border-2 border-gray-300 w-full flex flex-col items-center p-6 cursor-pointer hover:bg-gray-50">
              <CloudArrowUpIcon className="h-10 w-10 text-gray-400" />
              <span className="text-gray-500">
                Drag files here or click to upload
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                name="resumeUrl"
              />
            </label>

            {/* Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="fullName"
                placeholder="Name"
                className="border-b border-gray-300 p-2 w-full"
                onChange={handleChange}
                value={formData.fullName}
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                className="border-b border-gray-300 p-2 w-full"
                onChange={handleChange}
                value={formData.city}
              />
              <input
                className="border-b border-gray-300 p-2 w-full"
                type="text"
                name="jobId"
                value={formData.jobId}
                readOnly
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="border-b border-gray-300 p-2 w-full"
                onChange={handleChange}
                value={formData.email}
              />
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone"
                className="border-b border-gray-300 p-2 w-full"
                onChange={handleChange}
                value={formData.phoneNumber}
              />
            </div>
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <h3 className="text-lg font-semibold">
                Resume and Contact Details
              </h3>
              {isExpanded ? (
                <ChevronDownIcon className="h-6 w-6 text-gray-500" />
              ) : (
                <PlusIcon className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {/* Expandable Section */}
            {isExpanded && (
              <div className="mt-4 space-y-4 transition-all duration-300">
                {/* Profile Links */}
                <input
                  type="text"
                  placeholder="Resume Links"
                  className="border-b border-gray-300 p-2 w-full"
                  value={formData.resumeUrl}
                  name="resumeUrl"
                  onChange={handleChange}
                />

                {/* Experience & Company */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center border-b border-gray-300 p-2">
                    <input
                      type="text"
                      placeholder="Experience"
                      className="w-full outline-none"
                      onChange={handleChange}
                      value={formData.experience}
                    />
                    <span className="ml-2 text-black">YRS</span>
                  </div>
                  <div className="flex items-center border-b border-gray-300 p-2">
                    <input
                      type="text"
                      placeholder="Experience"
                      className="w-full outline-none"
                      onChange={handleChange}
                      value={formData.experienceMonths}
                      name="experienceMonths"
                    />
                    <span className="ml-2 text-black">MTHS</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Current Company"
                    className="border-b border-gray-300 p-2 w-full"
                    onChange={handleChange}
                    value={formData.currentCompany}
                    name="currentCompany"
                  />
                </div>

                {/* Designation & Salary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Current Designation"
                    className="border-b border-gray-300 p-2 w-full"
                    onChange={handleChange}
                    value={formData.designation}
                    name="designation"
                  />
                  <div className="flex items-center border-b border-gray-300 p-2">
                    <span className="mr-2 text-black">INR</span>
                    <input
                      type="text"
                      placeholder="Current Salary (Ex: 400,000)"
                      className="w-full outline-none"
                      onChange={handleChange}
                      value={formData.currentSalary}
                      name="currentSalary"
                    />
                    <span className="ml-2 text-black">PA</span>
                  </div>
                </div>

                {/* Desired Salary & Preferred City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center border-b border-gray-300 p-2">
                    <span className="mr-2 text-black">INR</span>
                    <input
                      type="text"
                      placeholder="ExpectedSalary"
                      className="w-full outline-none"
                      onChange={handleChange}
                      value={formData.expectedSalary}
                      name="expectedSalary"
                    />
                    <span className="ml-2 text-black">PA</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Preferred City"
                    className="border-b border-gray-300 p-2 w-full"
                    onChange={handleChange}
                    value={formData.preferredCity}
                  />
                </div>

                {/* Days to Join */}
                <input
                  type="text"
                  placeholder="Days to Join"
                  className="border-b border-gray-300 p-2 w-full"
                  onChange={handleChange}
                  value={formData.daysToJoin}
                />
              </div>
            )}
            {/* Education Section */}
            <div
              className="flex justify-between items-center cursor-pointer mt-6"
              onClick={() => setIsEducationExpanded(!isEducationExpanded)}
            >
              <h3 className="text-lg font-semibold">Education</h3>
              {isEducationExpanded ? (
                <ChevronDownIcon className="h-6 w-6 text-gray-500" />
              ) : (
                <PlusIcon className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {isEducationExpanded && (
              <div className="mt-4 space-y-4 transition-all duration-300">
                {/* Degree, Specialization, Institute */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Education"
                    className="border-b border-gray-300 p-2 w-full"
                    onChange={handleChange}
                    value={formData.educations}
                    name="educations"
                  />
                  <input
                    type="text"
                    placeholder="Specialization"
                    className="border-b border-gray-300 p-2 w-full"
                    onChange={handleChange}
                    value={formData.specialization}
                  />
                  <input
                    type="text"
                    placeholder="Institute"
                    className="border-b border-gray-300 p-2 w-full"
                    onChange={handleChange}
                    value={formData.institutes}
                  />
                </div>

                {/* Percentage, Marks, Graduation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center border-b border-gray-300 p-2">
                    <input
                      type="text"
                      placeholder="Percent"
                      className="w-full outline-none"
                      onChange={handleChange}
                      value={formData.Percent}
                    />
                  </div>
                  <div className="flex items-center border-b border-gray-300 p-2">
                    <input
                      type="number"
                      placeholder="Marks"
                      className="w-full outline-none"
                      onChange={handleChange}
                      value={formData.marks}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center border-b border-gray-300 p-2">
                    <input
                      type="date"
                      placeholder="Start Date "
                      className="w-full outline-none"
                      onChange={handleChange}
                      value={formData.graduationYear}
                    />
                  </div>
                  <div className="flex items-center border-b border-gray-300 p-2">
                    <input
                      type="date"
                      placeholder="End Date"
                      className="w-full outline-none"
                      onChange={handleChange}
                      value={formData.name}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Skype, Best Time to Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Skills"
                className="border-b border-gray-300 p-2 w-full"
                onChange={handleChange}
                value={formData.skills}
                name="skills"
              />
              <input
                type="text"
                placeholder="Relevent Experience"
                className="border-b border-gray-300 p-2 w-full"
                value={formData.totalRelevantExperience}
                onChange={handleChange}
                name="totalRelevantExperience"
              />
            </div>

            {/* Cover Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Noticeperiod"
                className="border-b border-gray-300 p-2 w-full"
                value={formData.noticePeriod}
                onChange={handleChange}
                name="noticePeriod"
              />
              <input
                type="text"
                placeholder="offer In Hand"
                className="border-b border-gray-300 p-2 w-full"
                value={formData.offerInHand}
                onChange={handleChange}
                name="offerInHand"
              />
            </div>

            <div className="flex flex-col items-start space-y-4 p-4">
              <ReCAPTCHA
                sitekey="6LccBPAqAAAAAOFmc-xdfnXZ12MxZRxxbpficDHf" // Replace with your actual site key
                onChange={handleCaptchaChange}
              />
              <button
                className={`px-16 py-2 rounded-md text-white ${
                  isVerified
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-700  "
                }`}
                disabled={!isVerified}
              >
                Submit
              </button>
              {/* <button
                className="px-16 py-2 rounded-md text-white bg-green-500 hover:bg-green-600">
                  Submit
                </button> */}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ApplicationForm;
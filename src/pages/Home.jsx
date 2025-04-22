import React from "react";
import {
  FaSearch,
  FaBuilding,
  FaLaptopCode,
  FaChartLine,
  FaUsers,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const categories = [
  { icon: <FaLaptopCode />, label: "IT Jobs" },
  { icon: <FaBuilding />, label: "MNC Jobs" },
  { icon: <FaChartLine />, label: "Marketing" },
  { icon: <FaUsers />, label: "HR & Admin" },
];

const companies = [
  "https://logos-world.net/wp-content/uploads/2020/12/Infosys-Logo.png",
  "https://1000logos.net/wp-content/uploads/2021/05/Wipro-logo.png",
  "https://upload.wikimedia.org/wikipedia/commons/7/79/TCS_Logo.svg",
  "https://1000logos.net/wp-content/uploads/2020/08/Capgemini-Logo-2004.png",
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans bg-gradient-to-b from-[#F5F6FF] to-white">
     {/* Hero Section */}
<section className="bg-white text-blue-900 py-40 px-6 md:px-20">
  <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
    Nest Your Dreams. Find Your Job.
  </h1>
  <p className="text-lg mb-6 text-center">
    Discover roles that match your passion and skills.
  </p>
  <div className="bg-white rounded-lg overflow-hidden flex items-center max-w-3xl mx-auto shadow-lg border">
    <input
      type="text"
      placeholder="Search jobs by title, skills or company"
      className="flex-grow px-4 py-3 text-black outline-none"
    />
    <button className="bg-[#7366FF] hover:bg-[#5f4ddc] text-white px-6 py-2 rounded-md flex items-center gap-2">
      <FaSearch />
      Search
    </button>
  </div>
</section>

      {/* Categories */}
      <section className="py-14 px-6 md:px-20">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          Popular Job Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="text-[#7366FF] text-3xl mb-3">{cat.icon}</div>
              <p className="font-medium text-gray-700">{cat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-10 px-6 md:px-20 bg-white">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Top Companies Hiring
        </h2>
        <div className="flex gap-6 overflow-x-auto no-scrollbar py-2 justify-center">
          {companies.map((logo, idx) => (
            <div
              key={idx}
              className="min-w-[150px] h-[80px] bg-gray-100 rounded-xl flex items-center justify-center shadow-sm p-2 hover:shadow-lg transition-all"
            >
              <img
                src={logo}
                alt="Company logo"
                className="max-h-full object-contain"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 md:px-20 bg-[#F5F6FF] text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
          Get Hired Faster
        </h2>
        <p className="text-gray-600 mb-6">
          Create your profile and get discovered by top companies
        </p>
        <button className="bg-[#7366FF] text-white px-8 py-3 rounded-full text-lg hover:bg-[#5f4ddc] transition-all">
          Register Now
        </button>
      </section>
    </div>
  );
};

export default HomePage;

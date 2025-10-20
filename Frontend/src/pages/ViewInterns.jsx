import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Edit2,
  Trash2,
  Download,
  Search,
  Filter,
  User,
  Building,
  Calendar,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const ViewInterns = () => {
  const [interns, setInterns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const sampleData = [
    {
      id: 1,
      studentName: "John Doe",
      rollNumber: "CS2023001",
      department: "Computer Science",
      email: "john.doe@college.edu",
      companyName: "Google",
      location: "Mountain View, CA",
      startDate: "2024-01-15",
      endDate: "2024-04-15",
      duration: "3 months (13 weeks)",
      stipend: "50000",
      mentorName: "Sarah Wilson",
      mentorContact: "sarah.wilson@google.com",
      mentorRole: "Senior Software Engineer",
    },
    {
      id: 2,
      studentName: "Jane Smith",
      rollNumber: "EE2023002",
      department: "Electrical Engineering",
      email: "jane.smith@college.edu",
      companyName: "Tesla",
      location: "Fremont, CA",
      startDate: "2024-02-01",
      endDate: "2024-05-01",
      duration: "3 months (13 weeks)",
      stipend: "45000",
      mentorName: "Mike Johnson",
      mentorContact: "mike.johnson@tesla.com",
      mentorRole: "Electrical Engineer Lead",
    },
    ...Array.from({ length: 25 }, (_, i) => ({
      id: i + 3,
      studentName: `Student ${i + 3}`,
      rollNumber: `DEP2023${String(i + 3).padStart(3, "0")}`,
      department: [
        "Computer Science",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
      ][i % 4],
      email: `student${i + 3}@college.edu`,
      companyName: [
        `Tech Corp`,
        "Auto Industries",
        "Build Solutions",
        "Energy Ltd",
      ][i % 4],
      location: [
        "New York, NY",
        "San Francisco, CA",
        "Chicago, IL",
        "Austin, TX",
      ][i % 4],
      startDate: "2024-01-15",
      endDate: "2024-04-15",
      duration: "3 months (13 weeks)",
      stipend: (40000 + i * 2000).toString(),
      mentorName: `Mentor ${i + 1}`,
      mentorContact: `mentor${i + 1}@company.com`,
      mentorRole: "Senior Engineer",
    })),
  ];

  useEffect(() => {
    setInterns(sampleData);
  }, []);

  const departments = [
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Business Administration",
    "Information Technology",
  ];

  const itemsPerPageOptions = [5, 10, 20, 50];

  const filteredInterns = interns.filter((intern) => {
    const matchesSearch =
      intern.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.mentorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = filterDepartment
      ? intern.department === filterDepartment
      : true;

    return matchesSearch && matchesDepartment;
  });

  const totalItems = filteredInterns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInterns = filteredInterns.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDepartment, itemsPerPage]);

  const handleDelete = (id) => {
    setInterns(interns.filter((intern) => intern.id !== id));
    setDeleteConfirm(null);
  };

  const handleEdit = (intern) => {
    setEditingId(intern.id);
    setEditFormData(intern);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = () => {
    setInterns(
      interns.map((intern) =>
        intern.id === editingId ? { ...editFormData } : intern
      )
    );
    setEditingId(null);
    setEditFormData({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleAddNew = () => {
    window.location.href = "/add";
  };

  const handleExportExcel = () => {
    const csvContent = [
      [
        "Student Name",
        "Roll Number",
        "Department",
        "Email",
        "Company Name",
        "Location",
        "Start Date",
        "End Date",
        "Duration",
        "Stipend (₹)",
        "Mentor Name",
        "Mentor Contact",
        "Mentor Role",
      ],
      ...filteredInterns.map((intern) => [
        intern.studentName,
        intern.rollNumber,
        intern.department,
        intern.email,
        intern.companyName,
        intern.location,
        intern.startDate,
        intern.endDate,
        intern.duration,
        intern.stipend,
        intern.mentorName,
        intern.mentorContact,
        intern.mentorRole,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "internship_records.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent mb-4">
            Internship Records
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            View and manage all internship records in the system
          </p>

          <Link
            to={"/add"}
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-white border px-6 font-medium text-black transition-all duration-300"
          >
            <span className="absolute inset-0 rounded-md bg-green-700 scale-y-0 origin-bottom transition-transform duration-300 group-hover:scale-y-100"></span>
            <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
              Add Internship
            </span>
            <span className="absolute inset-0 rounded-md border border-green-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
            <span className="absolute z-20 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Add Internship
            </span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, roll number, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="pl-12 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
                  Show
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="w-24 px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                >
                  {itemsPerPageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportExcel}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
            >
              <Download className="w-5 h-5" />
              <span>Export Excel</span>
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Company Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Internship Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Stipend
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Mentor Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentInterns.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">No internship records found</p>
                      <p className="text-sm">
                        Try adjusting your search or filters
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddNew}
                        className="mt-4 flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium mx-auto"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add First Record</span>
                      </motion.button>
                    </td>
                  </tr>
                ) : (
                  currentInterns.map((intern) => (
                    <motion.tr
                      key={intern.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      {editingId === intern.id ? (
                        <>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <input
                                type="text"
                                name="studentName"
                                value={editFormData.studentName}
                                onChange={handleEditChange}
                                placeholder="Student Name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="text"
                                name="rollNumber"
                                value={editFormData.rollNumber}
                                onChange={handleEditChange}
                                placeholder="Roll Number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <select
                                name="department"
                                value={editFormData.department}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                  <option key={dept} value={dept}>
                                    {dept}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="email"
                                name="email"
                                value={editFormData.email}
                                onChange={handleEditChange}
                                placeholder="Email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <input
                                type="text"
                                name="companyName"
                                value={editFormData.companyName}
                                onChange={handleEditChange}
                                placeholder="Company Name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="text"
                                name="location"
                                value={editFormData.location}
                                onChange={handleEditChange}
                                placeholder="Location"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <input
                                type="date"
                                name="startDate"
                                value={editFormData.startDate}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="date"
                                name="endDate"
                                value={editFormData.endDate}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="text"
                                name="duration"
                                value={editFormData.duration}
                                onChange={handleEditChange}
                                placeholder="Duration"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <input
                              type="number"
                              name="stipend"
                              value={editFormData.stipend}
                              onChange={handleEditChange}
                              placeholder="Stipend in ₹"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <input
                                type="text"
                                name="mentorName"
                                value={editFormData.mentorName}
                                onChange={handleEditChange}
                                placeholder="Mentor Name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="text"
                                name="mentorContact"
                                value={editFormData.mentorContact}
                                onChange={handleEditChange}
                                placeholder="Contact Info"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="text"
                                name="mentorRole"
                                value={editFormData.mentorRole}
                                onChange={handleEditChange}
                                placeholder="Role"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSaveEdit}
                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-900">
                                {intern.studentName}
                              </div>
                              <div className="text-sm text-gray-600">
                                Roll No: {intern.rollNumber}
                              </div>
                              <div className="text-sm text-blue-600">
                                {intern.department}
                              </div>
                              <div className="text-sm text-gray-500">
                                {intern.email}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-900">
                                {intern.companyName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {intern.location}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-sm text-gray-900">
                                <Calendar className="w-4 h-4" />
                                <span>{intern.duration}</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                From: {intern.startDate}
                              </div>
                              <div className="text-sm text-gray-500">
                                To: {intern.endDate}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-semibold text-green-600">
                              ₹{intern.stipend}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-900">
                                {intern.mentorName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {intern.mentorContact}
                              </div>
                              <div className="text-sm text-blue-600">
                                {intern.mentorRole}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEdit(intern)}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setDeleteConfirm(intern.id)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </>
                      )}
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
                {totalItems} records
              </div>

              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500 mr-4">
                    {itemsPerPage} per page
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <motion.button
                          key={pageNum}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => goToPage(pageNum)}
                          className={`w-10 h-10 rounded-lg border transition-colors ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </motion.button>
                      );
                    })}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirm Delete
                  </h3>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this internship record? This
                  action cannot be undone.
                </p>
                <div className="flex space-x-3 justify-end">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ViewInterns;

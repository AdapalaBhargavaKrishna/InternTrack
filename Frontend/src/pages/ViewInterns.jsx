import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import API from "../api";
import toast from "react-hot-toast";
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

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const ViewInterns = () => {
  const [allInterns, setAllInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const departments = [
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Business Administration",
    "Information Technology",
  ];

  const itemsPerPageOptions = [5, 10, 20, 50];

  useEffect(() => {
    const validateToken = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await API.post("/auth/validate", { token });
        if (!res.data.valid) {
          navigate("/login");
        }
      } catch (err) {
        navigate("/login");
      }
    };
    validateToken();
  }, []);

  const fetchAllInterns = async () => {
    setLoading(true);
    try {
      const response = await API.get("/internships");
      setAllInterns(response.data);
      toast.success(`Loaded ${response.data.length} records`);
    } catch (error) {
      console.error("Failed to fetch interns:", error);
      toast.error("Failed to load records");
      setAllInterns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllInterns();
  }, []);

  const filteredInterns = allInterns.filter((intern) => {
    const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
    const matchesSearch =
      !debouncedSearchTerm ||
      (intern.studentName &&
        intern.studentName.toLowerCase().includes(lowerSearchTerm)) ||
      (intern.rollNumber &&
        intern.rollNumber.toLowerCase().includes(lowerSearchTerm)) ||
      (intern.companyName &&
        intern.companyName.toLowerCase().includes(lowerSearchTerm)) ||
      (intern.mentorName &&
        intern.mentorName.toLowerCase().includes(lowerSearchTerm));

    const matchesDepartment =
      !filterDepartment || intern.department === filterDepartment;

    return matchesSearch && matchesDepartment;
  });

  const totalItems = filteredInterns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInterns = filteredInterns.slice(startIndex, endIndex);

  useEffect(() => {
    const newTotalPages = Math.ceil(filteredInterns.length / itemsPerPage) || 1;
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    } else if (currentPage < 1) {
      setCurrentPage(1);
    }
  }, [filteredInterns.length, itemsPerPage, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterDepartment]);

  const handleDelete = async (id) => {
    try {
      await API.delete(`internships/${id}`);
      toast.success("Record deleted successfully!");
      setDeleteConfirm(null);
      setAllInterns((prevInterns) =>
        prevInterns.filter((intern) => intern._id !== id)
      );
    } catch (error) {
      console.error("Failed to delete record:", error);
      toast.error("Failed to delete record");
    }
  };

  const handleEdit = (intern) => {
    setEditingId(intern._id);
    setEditFormData({
      ...intern,
      startDate: intern.startDate
        ? new Date(intern.startDate).toISOString().split("T")[0]
        : "",
      endDate: intern.endDate
        ? new Date(intern.endDate).toISOString().split("T")[0]
        : "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      const payload = { ...editFormData };
      delete payload._id;
      delete payload.__v;
      delete payload.createdAt;
      delete payload.updatedAt;

      const response = await API.put(`internships/${editingId}`, payload);
      toast.success("Record updated successfully!");

      setAllInterns((prevInterns) =>
        prevInterns.map((intern) =>
          intern._id === editingId ? { ...response.data } : intern
        )
      );

      setEditingId(null);
      setEditFormData({});
    } catch (error) {
      console.error(
        "Failed to update record:",
        error.response?.data || error.message
      );
      toast.error(
        `Failed to update record: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleAddNew = () => {
    window.location.href = "/add";
  };

  const handleExportExcel = async () => {
    const dataToExport = filteredInterns;

    if (dataToExport.length === 0) {
      toast.error("No data to export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Internship Records");

    worksheet.columns = [
      { header: "Student Name", key: "studentName", width: 25 },
      { header: "Roll Number", key: "rollNumber", width: 15 },
      { header: "Department", key: "department", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Company Name", key: "companyName", width: 25 },
      { header: "Location", key: "location", width: 20 },
      {
        header: "Start Date",
        key: "startDate",
        width: 15,
        style: { numFmt: "yyyy-mm-dd" },
      },
      {
        header: "End Date",
        key: "endDate",
        width: 15,
        style: { numFmt: "yyyy-mm-dd" },
      },
      { header: "Duration", key: "duration", width: 20 },
      {
        header: "Stipend (₹)",
        key: "stipend",
        width: 15,
        style: { numFmt: '"₹"#,##0' },
      },
      { header: "Mentor Name", key: "mentorName", width: 25 },
      { header: "Mentor Contact", key: "mentorContact", width: 30 },
      { header: "Mentor Role", key: "mentorRole", width: 25 },
    ];

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2563EB" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    dataToExport.forEach((intern) => {
      worksheet.addRow({
        ...intern,
        startDate: intern.startDate ? new Date(intern.startDate) : null,
        endDate: intern.endDate ? new Date(intern.endDate) : null,
        stipend: intern.stipend != null ? Number(intern.stipend) : null,
      });
    });

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "internship_records.xlsx");
      toast.success("Excel file downloaded successfully!");
    } catch (error) {
      console.error("Error generating Excel file:", error);
      toast.error("Failed to generate Excel file");
    }
  };

  const goToPage = (page) => {
    const maxPages = totalPages > 0 ? totalPages : 1;
    const newPage = Math.max(1, Math.min(page, maxPages));
    setCurrentPage(newPage);
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const displayStartIndex = Math.min(
    (currentPage - 1) * itemsPerPage + 1,
    totalItems
  );
  const displayEndIndex = Math.min(startIndex + itemsPerPage, totalItems);

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
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-white border px-6 font-medium text-black transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <span className="absolute inset-0 rounded-md bg-green-600 scale-y-0 origin-bottom transition-transform duration-300 group-hover:scale-y-100"></span>
            <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
              <Plus className="inline w-4 h-4 mr-2" /> Add Internship
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name, roll#, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
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
              disabled={filteredInterns.length === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow hover:shadow-md"
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
            <table className="w-full min-w-[1100px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Company Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Internship Period
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
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex justify-center items-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-4 text-lg">Loading Records...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentInterns.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">No internship records found</p>
                      <p className="text-sm">
                        {searchTerm || filterDepartment
                          ? "Try adjusting your search or filters."
                          : "Click below to add the first record."}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddNew}
                        className="mt-4 flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium mx-auto"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add Internship Record</span>
                      </motion.button>
                    </td>
                  </tr>
                ) : (
                  currentInterns.map((intern) => (
                    <motion.tr
                      key={intern._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      {editingId === intern._id ? (
                        <>
                          <td className="px-6 py-4 align-top">
                            <div className="space-y-2 w-48">
                              <input
                                type="text"
                                name="studentName"
                                value={editFormData.studentName || ""}
                                onChange={handleEditChange}
                                placeholder="Student Name"
                                className="input-edit"
                              />
                              <input
                                type="text"
                                name="rollNumber"
                                value={editFormData.rollNumber || ""}
                                onChange={handleEditChange}
                                placeholder="Roll Number"
                                className="input-edit"
                              />
                              <select
                                name="department"
                                value={editFormData.department || ""}
                                onChange={handleEditChange}
                                className="input-edit"
                              >
                                <option value="">Select Dept</option>
                                {departments.map((dept) => (
                                  <option key={dept} value={dept}>
                                    {dept}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="email"
                                name="email"
                                value={editFormData.email || ""}
                                onChange={handleEditChange}
                                placeholder="Email"
                                className="input-edit"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="space-y-2 w-48">
                              <input
                                type="text"
                                name="companyName"
                                value={editFormData.companyName || ""}
                                onChange={handleEditChange}
                                placeholder="Company Name"
                                className="input-edit"
                              />
                              <input
                                type="text"
                                name="location"
                                value={editFormData.location || ""}
                                onChange={handleEditChange}
                                placeholder="Location"
                                className="input-edit"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="space-y-2 w-40">
                              <input
                                type="date"
                                name="startDate"
                                value={editFormData.startDate || ""}
                                onChange={handleEditChange}
                                className="input-edit"
                              />
                              <input
                                type="date"
                                name="endDate"
                                value={editFormData.endDate || ""}
                                onChange={handleEditChange}
                                className="input-edit"
                              />
                              <input
                                type="text"
                                name="duration"
                                value={editFormData.duration || ""}
                                onChange={handleEditChange}
                                placeholder="Duration"
                                className="input-edit"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="w-24">
                              <input
                                type="number"
                                name="stipend"
                                value={editFormData.stipend || ""}
                                onChange={handleEditChange}
                                placeholder="Stipend ₹"
                                className="input-edit"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="space-y-2 w-48">
                              <input
                                type="text"
                                name="mentorName"
                                value={editFormData.mentorName || ""}
                                onChange={handleEditChange}
                                placeholder="Mentor Name"
                                className="input-edit"
                              />
                              <input
                                type="text"
                                name="mentorContact"
                                value={editFormData.mentorContact || ""}
                                onChange={handleEditChange}
                                placeholder="Contact Info"
                                className="input-edit"
                              />
                              <input
                                type="text"
                                name="mentorRole"
                                value={editFormData.mentorRole || ""}
                                onChange={handleEditChange}
                                placeholder="Role"
                                className="input-edit"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="flex space-x-2 pt-1">
                              <button
                                onClick={handleSaveEdit}
                                className="btn-save"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="btn-cancel"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                          <style>{`.input-edit { width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 0.375rem; font-size: 0.875rem; line-height: 1.25rem; transition: border-color 0.2s; } .input-edit:focus { outline: none; border-color: #3b82f6; ring: 1px; ring-color: #3b82f6;} .btn-save { padding: 6px 12px; background-color: #16a34a; color: white; border-radius: 0.375rem; font-size: 0.875rem; transition: background-color 0.2s; } .btn-save:hover { background-color: #15803d; } .btn-cancel { padding: 6px 12px; background-color: #6b7280; color: white; border-radius: 0.375rem; font-size: 0.875rem; transition: background-color 0.2s; } .btn-cancel:hover { background-color: #4b5563; }`}</style>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 align-top whitespace-nowrap">
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
                              <div className="text-sm text-gray-500 break-all">
                                {intern.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-900">
                                {intern.companyName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {intern.location}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-sm text-gray-900">
                                <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                <span>{intern.duration}</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                From:{" "}
                                {intern.startDate
                                  ? new Date(
                                      intern.startDate
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                To:{" "}
                                {intern.endDate
                                  ? new Date(
                                      intern.endDate
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top whitespace-nowrap">
                            <div className="font-semibold text-green-600">
                              ₹{intern.stipend != null ? intern.stipend : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top whitespace-nowrap">
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
                          <td className="px-6 py-4 align-top whitespace-nowrap">
                            <div className="flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(intern)}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                              >
                                <Edit2 className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setDeleteConfirm(intern._id)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
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
                {totalItems > 0
                  ? `Showing ${displayStartIndex + 1} to ${Math.min(
                      displayEndIndex,
                      totalItems
                    )} of ${totalItems} records`
                  : "No records to show"}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                  <div className="flex items-center space-x-1">
                    {(() => {
                      const pageNumbers = [];
                      const maxVisiblePages = 5;
                      const halfVisible = Math.floor(maxVisiblePages / 2);
                      let startPage = 1;
                      let endPage = totalPages;
                      if (totalPages > maxVisiblePages) {
                        startPage = Math.max(currentPage - halfVisible, 1);
                        endPage = Math.min(
                          startPage + maxVisiblePages - 1,
                          totalPages
                        );
                        if (endPage === totalPages) {
                          startPage = Math.max(
                            totalPages - maxVisiblePages + 1,
                            1
                          );
                        }
                        if (startPage === 1 && endPage < totalPages) {
                          endPage = Math.min(
                            startPage + maxVisiblePages - 1,
                            totalPages
                          );
                        }
                      }
                      if (startPage > 1) {
                        pageNumbers.push(
                          <motion.button
                            key={1}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => goToPage(1)}
                            className={`page-btn ${
                              currentPage === 1
                                ? "page-btn-active"
                                : "page-btn-inactive"
                            }`}
                          >
                            1
                          </motion.button>
                        );
                        if (startPage > 2)
                          pageNumbers.push(
                            <span
                              key="start-ellipsis"
                              className="px-2 py-1 text-gray-500"
                            >
                              ...
                            </span>
                          );
                      }
                      for (let i = startPage; i <= endPage; i++) {
                        pageNumbers.push(
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => goToPage(i)}
                            className={`page-btn ${
                              currentPage === i
                                ? "page-btn-active"
                                : "page-btn-inactive"
                            }`}
                          >
                            {i}
                          </motion.button>
                        );
                      }
                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1)
                          pageNumbers.push(
                            <span
                              key="end-ellipsis"
                              className="px-2 py-1 text-gray-500"
                            >
                              ...
                            </span>
                          );
                        pageNumbers.push(
                          <motion.button
                            key={totalPages}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => goToPage(totalPages)}
                            className={`page-btn ${
                              currentPage === totalPages
                                ? "page-btn-active"
                                : "page-btn-inactive"
                            }`}
                          >
                            {totalPages}
                          </motion.button>
                        );
                      }
                      return pageNumbers;
                    })()}
                    <style>{`.page-btn { width: 2.25rem; height: 2.25rem; display: inline-flex; align-items: center; justify-content: center; border-radius: 0.375rem; border: 1px solid transparent; font-size: 0.875rem; transition: background-color 0.2s, border-color 0.2s, color 0.2s; } .page-btn-active { background-color: #2563eb; color: white; border-color: #2563eb; font-weight: 600; } .page-btn-inactive { border-color: #d1d5db; color: #374151; } .page-btn-inactive:hover { background-color: #f3f4f6; }`}</style>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
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
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: -20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 10, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirm Delete
                  </h3>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this internship record? This
                  action cannot be undone.
                </p>
                <div className="flex space-x-3 justify-end">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDeleteConfirm(null)}
                    className="px-5 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleDelete(deleteConfirm)}
                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete
                  </motion.button>
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

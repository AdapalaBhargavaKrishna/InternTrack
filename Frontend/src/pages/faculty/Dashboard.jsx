import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import API from "../../api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Edit2,
  Trash2,
  Download,
  Search,
  Filter,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  FileText,
  GraduationCap,
  Building2,
  MapPin,
  CalendarDays,
  UserCircle,
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

const Dashboard = () => {
  const [allInterns, setAllInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [statusUpdateId, setStatusUpdateId] = useState(null);
  const [statusFormData, setStatusFormData] = useState({ status: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const departments = [
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Business Administration",
    "Information Technology",
  ];

  const statusOptions = [
    { value: "all", label: "All Status", icon: FileText, color: "gray" },
    { value: "pending", label: "Pending", icon: Clock, color: "yellow" },
    { value: "approved", label: "Approved", icon: CheckCircle, color: "green" },
    { value: "rejected", label: "Rejected", icon: XCircle, color: "red" },
  ];

  const itemsPerPageOptions = [5, 10, 20, 50];

  useEffect(() => {
    const validateToken = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login?u=faculty");
        return;
      }
      try {
        const res = await API.post("/auth/validate", { token });
        if (!res.data.valid) {
          navigate("/login?u=faculty");
        }
      } catch (err) {
        navigate("/login?u=faculty");
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

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock,
          label: "Pending Review",
        };
      case "approved":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
          label: "Approved",
        };
      case "rejected":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
          label: "Rejected",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Clock,
          label: "Pending",
        };
    }
  };

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

    const matchesStatus = filterStatus === "all" || intern.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
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
  }, [debouncedSearchTerm, filterDepartment, filterStatus]);

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

  const handleStatusUpdate = (intern) => {
    setStatusUpdateId(intern._id);
    setStatusFormData({
      status: intern.status || "pending",
    });
  };

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveStatus = async () => {
    try {
      const payload = {
        status: statusFormData.status,
      };
      console.log(payload);
      console.log(statusUpdateId);
      const response = await API.put(`internships/${statusUpdateId}`, payload);
      toast.success("Status updated successfully!");

      setAllInterns((prevInterns) =>
        prevInterns.map((intern) =>
          intern._id === statusUpdateId ? { ...intern, ...response.data } : intern
        )
      );

      setStatusUpdateId(null);
      setStatusFormData({ status: "" });
    } catch (error) {
      console.error(
        "Failed to update status:",
        error.response?.data || error.message
      );
      toast.error(
        `Failed to update status: ${error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleCancelStatusUpdate = () => {
    setStatusUpdateId(null);
    setStatusFormData({ status: "" });
  };

  const handleAddNew = () => {
    navigate("/add");
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
      { header: "Status", key: "status", width: 15 },
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const toggleExpand = (id) => {
    setExpandedRecord(expandedRecord === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent mb-4">
            Faculty Dashboard - Internship Records
          </h1>
          <p className="text-gray-600 text-lg mb-6 max-w-3xl mx-auto">
            Review and manage student internship submissions. Update status.
          </p>
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
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-4 text-lg text-gray-600">Loading Records...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentInterns.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="text-center">
                        <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium text-gray-700 mb-2">No records found</p>
                        <p className="text-gray-500">
                          {searchTerm || filterDepartment || filterStatus !== "all"
                            ? "Try adjusting your search or filters."
                            : "No internship records submitted yet."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentInterns.map((intern) => {
                    const statusConfig = getStatusConfig(intern.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <>
                        <motion.tr
                          key={intern._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          {statusUpdateId === intern._id ? (
                            // Status Update Mode
                            <td colSpan="5" className="px-6 py-4">
                              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                                  <Edit2 className="w-5 h-5 mr-2" />
                                  Update Internship Status
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Current Status
                                    </label>
                                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                                      <StatusIcon className="w-4 h-4 mr-2" />
                                      {statusConfig.label}
                                    </div>
                                    <div className="mt-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Student Information
                                      </label>
                                      <div className="text-sm text-gray-600 space-y-1">
                                        <div><span className="font-medium">Name:</span> {intern.studentName}</div>
                                        <div><span className="font-medium">Roll No:</span> {intern.rollNumber}</div>
                                        <div><span className="font-medium">Department:</span> {intern.department}</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Update Status *
                                      </label>
                                      <select
                                        name="status"
                                        value={statusFormData.status}
                                        onChange={handleStatusChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                      </select>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-2">
                                      <button
                                        onClick={handleCancelStatusUpdate}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={handleSaveStatus}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                      >
                                        Update Status
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          ) : (
                            // View Mode
                            <>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{intern.studentName}</div>
                                    <div className="text-sm text-gray-500">{intern.rollNumber}</div>
                                    <div className="text-xs text-blue-600">{intern.department}</div>
                                    <div className="text-xs text-gray-500">{intern.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-green-600" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{intern.companyName}</div>
                                    <div className="text-sm text-gray-500 flex items-center">
                                      <MapPin className="w-3 h-3 mr-1" /> {intern.location}
                                    </div>
                                    <div className="text-sm font-medium text-green-600">
                                      ₹{intern.stipend != null ? intern.stipend.toLocaleString() : "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm text-gray-700">
                                    <CalendarDays className="w-4 h-4 mr-2 text-gray-400" />
                                    {intern.duration || "N/A"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatDate(intern.startDate)} - {formatDate(intern.endDate)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col space-y-2">
                                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusConfig.label}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => toggleExpand(intern._id)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    title={expandedRecord === intern._id ? "Hide Details" : "View Details"}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleStatusUpdate(intern)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Update Status"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setDeleteConfirm(intern._id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Record"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </td>
                            </>
                          )}
                        </motion.tr>

                        {/* Expanded Details Row */}
                        {expandedRecord === intern._id && statusUpdateId !== intern._id && (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 bg-gray-50">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Student Information */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                    <UserCircle className="w-4 h-4 mr-2" /> Student Information
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Name</span>
                                      <span className="font-medium">{intern.studentName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Roll Number</span>
                                      <span className="font-medium">{intern.rollNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Department</span>
                                      <span className="font-medium">{intern.department}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Email</span>
                                      <span className="font-medium">{intern.email}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Company Information */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                    <Building2 className="w-4 h-4 mr-2" /> Company Information
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Company Name</span>
                                      <span className="font-medium">{intern.companyName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Location</span>
                                      <span className="font-medium">{intern.location}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Duration</span>
                                      <span className="font-medium">{intern.duration}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Stipend</span>
                                      <span className="font-medium text-green-600">
                                        ₹{intern.stipend != null ? intern.stipend.toLocaleString() : "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Mentor Information */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                    <UserCircle className="w-4 h-4 mr-2" /> Mentor Information
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Name</span>
                                      <span className="font-medium">{intern.mentorName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Contact</span>
                                      <span className="font-medium">{intern.mentorContact}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Role</span>
                                      <span className="font-medium">{intern.mentorRole}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white p-4 rounded-lg border border-gray-200 md:col-span-3">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" /> Status
                                  </h4>
                                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                                    <div className="mb-4 md:mb-0">
                                      <div className="flex items-center space-x-2">
                                        <div className={`px-4 py-2 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                                          <StatusIcon className="inline w-4 h-4 mr-2" />
                                          {statusConfig.label}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          Last updated: {intern.updatedAt ? formatDate(intern.updatedAt) : "N/A"}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Submitted on: {intern.createdAt ? formatDate(intern.createdAt) : "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && currentInterns.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Showing {displayStartIndex + 1} to {Math.min(displayEndIndex, totalItems)} of {totalItems} records
                  </div>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {itemsPerPageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option} per page
                      </option>
                    ))}
                  </select>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
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
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg ${currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          )}
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
                initial={{ scale: 0.9, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this internship record? This action cannot be undone.
                </p>
                <div className="flex space-x-3 justify-end">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-5 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

export default Dashboard;
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../api";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import {
    Edit2,
    Trash2,
    User,
    X,
    Plus,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    MessageSquare,
    Building2,
    MapPin,
    GraduationCap,
    UserCircle,
    CalendarDays,
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

const ViewStatus = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [expandedRecord, setExpandedRecord] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const navigate = useNavigate();

    const studentRollNumber = sessionStorage.getItem("rollNumber");
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const statusOptions = [
        { value: "all", label: "All Status" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "under_review", label: "Under Review" },
    ];

    const itemsPerPageOptions = [5, 10, 20, 50];

    const fetchStudentInternships = async () => {
        if (!studentRollNumber) {
            toast.error("Please login first");
            navigate("/login?u=student");
            return;
        }

        setLoading(true);
        try {
            const response = await API.get(`/internships/${studentRollNumber}`);

            if (Array.isArray(response.data)) {
                setInternships(response.data);
                toast.success(`Loaded ${response.data.length} internship records`);
            } else if (response.data && typeof response.data === 'object') {
                setInternships([response.data]);
                toast.success("Loaded 1 internship record");
            } else {
                setInternships([]);
                toast.info("No internship records found");
            }
        } catch (error) {
            console.error("Failed to fetch internships:", error);

            if (error.response?.status === 404) {
                setInternships([]);
                toast.info("No internship records found. Add your first one!");
            } else if (error.response?.status === 401) {
                toast.error("Session expired. Please login again");
                navigate("/login?u=student");
            } else {
                toast.error("Failed to load records. Please try again.");
                setInternships([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentInternships();
    }, [studentRollNumber, navigate]);

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
            case "under_review":
                return {
                    color: "bg-blue-100 text-blue-800 border-blue-200",
                    icon: AlertCircle,
                    label: "Under Review",
                };
            default:
                return {
                    color: "bg-gray-100 text-gray-800 border-gray-200",
                    icon: Clock,
                    label: "Pending",
                };
        }
    };

    const filteredInterns = internships.filter((intern) => {
        const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
        const matchesSearch =
            !debouncedSearchTerm ||
            intern.companyName.toLowerCase().includes(lowerSearchTerm) ||
            intern.location.toLowerCase().includes(lowerSearchTerm) ||
            intern.mentorName.toLowerCase().includes(lowerSearchTerm);

        const matchesStatus = filterStatus === "all" || intern.status === filterStatus;

        return matchesSearch && matchesStatus;
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
    }, [debouncedSearchTerm, filterStatus]);

    const handleDelete = async (id) => {
        try {
            await API.delete(`/internships/${id}`);
            toast.success("Internship record deleted successfully!");
            setDeleteConfirm(null);
            fetchStudentInternships();
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
            const payload = {
                studentName: editFormData.studentName,
                rollNumber: editFormData.rollNumber,
                department: editFormData.department,
                email: editFormData.email,
                companyName: editFormData.companyName,
                location: editFormData.location,
                startDate: editFormData.startDate,
                endDate: editFormData.endDate,
                stipend: editFormData.stipend,
                mentorName: editFormData.mentorName,
                mentorContact: editFormData.mentorContact,
                mentorRole: editFormData.mentorRole,
                status: "pending",
            };
            console.log(editingId)
            const response = await API.put(`/internships/${editingId}`, payload);
            toast.success("Record updated successfully! Status set to pending for review.");

            setInternships(prev =>
                prev.map(intern =>
                    intern._id === editingId ? response.data : intern
                )
            );

            setEditingId(null);
            setEditFormData({});
        } catch (error) {
            console.error("Failed to update record:", error);
            toast.error(
                `Failed to update: ${error.response?.data?.message || error.message}`
            );
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditFormData({});
    };

    const handleAddNew = () => {
        navigate("/student");
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

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const toggleExpand = (id) => {
        setExpandedRecord(expandedRecord === id ? null : id);
    };

    const refreshData = () => {
        fetchStudentInternships();
    };

    const calculateDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return "N/A";

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) return "Invalid date range";

        const timeDiff = end.getTime() - start.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const weeks = Math.floor(daysDiff / 7);
        const months = (daysDiff / 30.44).toFixed(1);

        if (weeks >= 4) {
            return `${months} months (${weeks} weeks)`;
        } else {
            return `${weeks} weeks (${daysDiff} days)`;
        }
    };

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
                        to={"/student"}
                        className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-white border px-6 font-medium text-black transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        <span className="absolute inset-0 rounded-md bg-green-600 scale-y-0 origin-bottom transition-transform duration-300 group-hover:scale-y-100"></span>
                        <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                            <Plus className="inline w-4 h-4 mr-2" /> Add Internship
                        </span>
                    </Link>
                </motion.div>

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg text-gray-600">Loading your internship records...</p>
                    </div>
                ) : internships.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                        <User className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                        <h3 className="text-2xl font-bold text-gray-700 mb-3">No Internship Records Found</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            You haven't submitted any internship records yet. Start by adding your first internship experience.
                        </p>
                        <button
                            onClick={handleAddNew}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-neutral-300 transition-colors font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Add Your First Internship
                        </button>
                    </div>
                ) : (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Company
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Duration
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Stipend
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
                                        {currentInterns.map((intern) => {
                                            const statusConfig = getStatusConfig(intern.status);
                                            const StatusIcon = statusConfig.icon;
                                            const duration = intern.duration || calculateDuration(intern.startDate, intern.endDate);

                                            return (
                                                <tr key={intern._id} className="hover:bg-gray-50">
                                                    {editingId === intern._id ? (
                                                        <td colSpan="5" className="px-6 py-4">
                                                            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                                                <h3 className="text-lg font-semibold text-blue-800 mb-4">Edit Internship Record</h3>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                                                        <input
                                                                            type="text"
                                                                            name="companyName"
                                                                            value={editFormData.companyName || ""}
                                                                            onChange={handleEditChange}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                                                        <input
                                                                            type="text"
                                                                            name="location"
                                                                            value={editFormData.location || ""}
                                                                            onChange={handleEditChange}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                                                        <input
                                                                            type="date"
                                                                            name="startDate"
                                                                            value={editFormData.startDate || ""}
                                                                            onChange={handleEditChange}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                                                        <input
                                                                            type="date"
                                                                            name="endDate"
                                                                            value={editFormData.endDate || ""}
                                                                            onChange={handleEditChange}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stipend (₹)</label>
                                                                        <input
                                                                            type="number"
                                                                            name="stipend"
                                                                            value={editFormData.stipend || ""}
                                                                            onChange={handleEditChange}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mentor Name</label>
                                                                        <input
                                                                            type="text"
                                                                            name="mentorName"
                                                                            value={editFormData.mentorName || ""}
                                                                            onChange={handleEditChange}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mentor Contact</label>
                                                                        <input
                                                                            type="text"
                                                                            name="mentorContact"
                                                                            value={editFormData.mentorContact || ""}
                                                                            onChange={handleEditChange}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mentor Role</label>
                                                                        <input
                                                                            type="text"
                                                                            name="mentorRole"
                                                                            value={editFormData.mentorRole || ""}
                                                                            onChange={handleEditChange}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                                    <p className="text-sm text-yellow-700">
                                                                        <AlertCircle className="inline w-4 h-4 mr-1" />
                                                                        <strong>Note:</strong> After editing, the status will be reset to "Pending" for faculty review.
                                                                    </p>
                                                                </div>
                                                                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                                                                    <button
                                                                        onClick={handleCancelEdit}
                                                                        className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={handleSaveEdit}
                                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                                    >
                                                                        Save Changes
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    ) : (
                                                        <>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                                                                        <Building2 className="w-6 h-6 text-blue-600" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-semibold text-gray-900">{intern.companyName}</div>
                                                                        <div className="text-sm text-gray-600 flex items-center gap-1">
                                                                            <MapPin className="w-4 h-4" />
                                                                            {intern.location}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center text-gray-700">
                                                                        <CalendarDays className="w-4 h-4 mr-2 text-gray-400" />
                                                                        {duration}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {formatDate(intern.startDate)} - {formatDate(intern.endDate)}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="font-semibold text-green-600">
                                                                    {intern.stipend ? `₹${intern.stipend.toLocaleString()}` : "Not specified"}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col gap-1">
                                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                                                                        <StatusIcon className="w-4 h-4" />
                                                                        {statusConfig.label}
                                                                    </div>
                                                                    {intern.feedback && (
                                                                        <button
                                                                            onClick={() => toggleExpand(intern._id)}
                                                                            className="text-xs text-gray-600 hover:text-blue-600 flex items-center gap-1"
                                                                        >
                                                                            <MessageSquare className="w-3 h-3" />
                                                                            View Feedback
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => toggleExpand(intern._id)}
                                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                                        title="View Details"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleEdit(intern)}
                                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                        title="Edit Record"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setDeleteConfirm(intern._id)}
                                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Delete Record"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-sm text-gray-600">
                                            Showing {Math.min(startIndex + 1, totalItems)} to {Math.min(endIndex, totalItems)} of {totalItems} records
                                        </div>
                                        <div className="flex items-center gap-2">
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
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={goToFirstPage}
                                                    disabled={currentPage === 1}
                                                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                                                >
                                                    <ChevronsLeft className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={goToPreviousPage}
                                                    disabled={currentPage === 1}
                                                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <span className="px-3 text-sm text-gray-600">
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                                <button
                                                    onClick={goToNextPage}
                                                    disabled={currentPage === totalPages}
                                                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={goToLastPage}
                                                    disabled={currentPage === totalPages}
                                                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                                                >
                                                    <ChevronsRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        <AnimatePresence>
                            {expandedRecord && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                                    onClick={() => setExpandedRecord(null)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.9, y: 20 }}
                                        className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {(() => {
                                            const intern = internships.find(i => i._id === expandedRecord);
                                            if (!intern) return null;
                                            const statusConfig = getStatusConfig(intern.status);
                                            const StatusIcon = statusConfig.icon;

                                            return (
                                                <div>
                                                    <div className="flex justify-between items-start mb-6">
                                                        <h3 className="text-2xl font-bold text-gray-800">Internship Details</h3>
                                                        <button
                                                            onClick={() => setExpandedRecord(null)}
                                                            className="p-2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                                                        <div className="bg-gray-50 rounded-xl p-4">
                                                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                                <Building2 className="w-5 h-5" />
                                                                Company Information
                                                            </h4>
                                                            <div className="space-y-2">
                                                                <div>
                                                                    <span className="text-gray-600">Company:</span>
                                                                    <p className="font-medium">{intern.companyName}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Location:</span>
                                                                    <p className="font-medium">{intern.location}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Duration:</span>
                                                                    <p className="font-medium">{intern.duration}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Stipend:</span>
                                                                    <p className="font-medium text-green-600">
                                                                        {intern.stipend ? `₹${intern.stipend.toLocaleString()}` : "Not specified"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-xl p-4">
                                                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                                <AlertCircle className="w-5 h-5" />
                                                                Status Information
                                                            </h4>
                                                            <div className="space-y-3">
                                                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                                                                    <StatusIcon className="w-5 h-5" />
                                                                    {statusConfig.label}
                                                                </div>
                                                                {intern.feedback && (
                                                                    <div>
                                                                        <span className="text-gray-600">Admin Feedback:</span>
                                                                        <p className="mt-1 p-3 bg-white rounded-lg border border-gray-200">
                                                                            {intern.feedback}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                <div className="text-sm text-gray-500">
                                                                    Submitted: {formatDate(intern.createdAt)}
                                                                    <br />
                                                                    Last updated: {formatDate(intern.updatedAt)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                                                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                                <UserCircle className="w-5 h-5" />
                                                                Mentor Information
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div>
                                                                    <span className="text-gray-600">Name</span>
                                                                    <p className="font-medium">{intern.mentorName}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Contact</span>
                                                                    <p className="font-medium">{intern.mentorContact}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Role</span>
                                                                    <p className="font-medium">{intern.mentorRole}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                                        <button
                                                            onClick={() => handleEdit(intern)}
                                                            className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                                                        >
                                                            Edit Record
                                                        </button>
                                                        <button
                                                            onClick={() => setExpandedRecord(null)}
                                                            className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                                                        >
                                                            Close
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}

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

export default ViewStatus;
// import { motion } from "framer-motion";
// import { Edit, Plus, Trash2, FileText } from "lucide-react";
// import { useEffect, useMemo, useRef, useState } from "react";
// import toast from "react-hot-toast";
// import Select from "react-select";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

// import {
//   useDeleteEmployeeMutation,
//   useGetAllEmployeeQuery,
//   useGetAllEmployeeWithoutQueryQuery,
//   useInsertEmployeeMutation,
//   useUpdateEmployeeMutation,
// } from "../../features/employee/employee";
// import { useGetAllSalaryQuery } from "../../features/salary/salary";

// const EmployeeTable = () => {
//   const role = localStorage.getItem("role");
//   const userId = localStorage.getItem("userId");

//   // ----------------------------
//   // Modals
//   // ----------------------------
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isEditModalOpen1, setIsEditModalOpen1] = useState(false);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);

//   // Invoice (single)
//   const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
//   const [invoiceEmployee, setInvoiceEmployee] = useState(null);
//   const invoiceRef = useRef(null);

//   // Invoice (bulk)
//   const [selectedIds, setSelectedIds] = useState([]);
//   const [isBulkInvoiceOpen, setIsBulkInvoiceOpen] = useState(false);
//   const bulkInvoiceRef = useRef(null);

//   // ----------------------------
//   // Employee state
//   // ----------------------------
//   const [currentEmployee, setCurrentEmployee] = useState(null);

//   const emptyEmployee = {
//     name: "",
//     employee_id: "",
//     basic_salary: "",
//     incentive: "",
//     holiday_payment: "", // holiday days count
//     total_salary: "",
//     advance: "",
//     late: "",
//     early_leave: "",
//     absent: "",
//     friday_absent: "",
//     unapproval_absent: "",
//     net_salary: "",
//     note: "",
//     remarks: "",
//   };

//   const [createEmployee, setCreateEmployee] = useState(emptyEmployee);

//   // list + filter states
//   const [employees, setEmployees] = useState([]);
//   const [employeesAll, setEmployeesAll] = useState([]);

//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [name, setName] = useState("");

//   // ✅ Per-page user selectable
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [startPage, setStartPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [pagesPerSet, setPagesPerSet] = useState(10);

//   // ----------------------------
//   // Fine meta (IMPORTANT FIX)
//   // ----------------------------
//   // ✅ fine অবশ্যই object হবে, না হলে fine.late undefined হবে
//   const [fine, setFine] = useState({
//     late: 0,
//     early_leave: 0,
//     absent: 0,
//     friday_absent: 0,
//     unapproval_absent: 0,
//   });

//   const {
//     data: fineData,
//     isLoading: fineLoading,
//     error: fineError,
//   } = useGetAllSalaryQuery();

//   useEffect(() => {
//     if (fineError) {
//       console.error("Error fetching fine meta", fineError);
//       return;
//     }
//     if (!fineLoading && fineData?.data) {
//       // ✅ তোমার API shape অনুযায়ী adjust:
//       // যদি fineData.data = {late:..., absent:...} -> সরাসরি বসবে
//       // যদি array আসে -> প্রথমটা নাও
//       const payload = Array.isArray(fineData.data)
//         ? fineData.data[0]
//         : fineData.data;

//       setFine((prev) => ({
//         late: Number(payload?.late ?? prev.late ?? 0),
//         early_leave: Number(payload?.early_leave ?? prev.early_leave ?? 0),
//         absent: Number(payload?.absent ?? prev.absent ?? 0),
//         friday_absent: Number(
//           payload?.friday_absent ?? prev.friday_absent ?? 0,
//         ),
//         unapproval_absent: Number(
//           payload?.unapproval_absent ?? prev.unapproval_absent ?? 0,
//         ),
//       }));
//     }
//   }, [fineData, fineLoading, fineError]);

//   // ----------------------------
//   // Salary Calculation
//   // ----------------------------
//   const calcSalary = (p) => {
//     const basic_salary = Number(p.basic_salary) || 0;
//     const incentive = Number(p.incentive) || 0;
//     const holiday_days = Number(p.holiday_payment) || 0;
//     const advance = Number(p.advance) || 0;

//     const late = Number(p.late) || 0;
//     const early_leave = Number(p.early_leave) || 0;
//     const absent = Number(p.absent) || 0;
//     const friday_absent = Number(p.friday_absent) || 0;
//     const unapproval_absent = Number(p.unapproval_absent) || 0;

//     const perDay = basic_salary / 30;

//     const holiday_salary = perDay * holiday_days;
//     const total_salary = basic_salary + holiday_salary + incentive;

//     // ✅ cut amount (BDT) - fine values should be BDT (or points) per incident/day
//     const lateCut = late * (Number(fine.late) || 0);
//     const earlyLeaveCut = early_leave * (Number(fine.early_leave) || 0);
//     const absentCut = absent * (Number(fine.absent) || 0);
//     const fridayAbsentCut = friday_absent * (Number(fine.friday_absent) || 0);
//     const unapprovalAbsentCut =
//       unapproval_absent * (Number(fine.unapproval_absent) || 0);

//     const totalCutAmount =
//       lateCut +
//       earlyLeaveCut +
//       absentCut +
//       fridayAbsentCut +
//       unapprovalAbsentCut;

//     const net_salary = total_salary - totalCutAmount - advance;

//     const safe = (n) => (Number.isFinite(n) ? n : 0);

//     return {
//       perDay: safe(perDay),
//       total_salary: safe(total_salary),
//       cutAmount: safe(totalCutAmount),
//       net_salary: Math.max(safe(net_salary), 0),
//     };
//   };

//   const updateCreateField = (key, value) => {
//     setCreateEmployee((prev) => {
//       const next = { ...prev, [key]: value };
//       const s = calcSalary(next);
//       return {
//         ...next,
//         total_salary: s.total_salary.toFixed(2),
//         net_salary: s.net_salary.toFixed(2),
//       };
//     });
//   };

//   const updateCurrentField = (key, value) => {
//     setCurrentEmployee((prev) => {
//       const next = { ...prev, [key]: value };
//       const s = calcSalary(next);
//       return {
//         ...next,
//         total_salary: s.total_salary.toFixed(2),
//         net_salary: s.net_salary.toFixed(2),
//       };
//     });
//   };

//   // ----------------------------
//   // Queries
//   // ----------------------------
//   const {
//     data: dataAll,
//     isLoading: isLoadingAll,
//     isError: isErrorAll,
//     error: errorAll,
//   } = useGetAllEmployeeWithoutQueryQuery();

//   useEffect(() => {
//     if (isErrorAll) {
//       console.error("Error fetching employees", errorAll);
//       return;
//     }
//     if (!isLoadingAll && dataAll?.data) {
//       setEmployeesAll(dataAll.data);
//     }
//   }, [dataAll, isLoadingAll, isErrorAll, errorAll]);

//   useEffect(() => {
//     const updatePagesPerSet = () => {
//       if (window.innerWidth < 640) setPagesPerSet(5);
//       else if (window.innerWidth < 1024) setPagesPerSet(7);
//       else setPagesPerSet(10);
//     };
//     updatePagesPerSet();
//     window.addEventListener("resize", updatePagesPerSet);
//     return () => window.removeEventListener("resize", updatePagesPerSet);
//   }, []);

//   // filter change হলে page 1
//   useEffect(() => {
//     setCurrentPage(1);
//     setStartPage(1);
//   }, [startDate, endDate, name, itemsPerPage]);

//   const queryArgs = {
//     page: currentPage,
//     limit: itemsPerPage,
//     startDate: startDate || undefined,
//     endDate: endDate || undefined,
//     name: name?.trim() ? name.trim() : undefined,
//   };

//   const { data, isLoading, isError, error, refetch } =
//     useGetAllEmployeeQuery(queryArgs);

//   useEffect(() => {
//     if (isError) {
//       console.error("Error fetching employee data", error);
//       return;
//     }
//     if (!isLoading && data?.data) {
//       setEmployees(data.data);
//       setTotalPages(Math.ceil((data?.meta?.total || 0) / itemsPerPage) || 1);
//     }
//   }, [data, isLoading, isError, error, currentPage, itemsPerPage]);

//   // ----------------------------
//   // Options
//   // ----------------------------
//   const employeeOptions = useMemo(() => {
//     return (employeesAll || []).map((e) => ({
//       value: e.name,
//       label: e.name,
//     }));
//   }, [employeesAll]);

//   // ----------------------------
//   // Modal Handlers
//   // ----------------------------
//   const handleEditClick = (employee) => {
//     const normalized = {
//       ...employee,
//       name: employee.name ?? "",
//       employee_id: employee.employee_id ?? "",
//       basic_salary: employee.basic_salary ?? "",
//       incentive: employee.incentive ?? "",
//       holiday_payment: employee.holiday_payment ?? "",
//       total_salary: employee.total_salary ?? "",
//       advance: employee.advance ?? "",
//       late: employee.late ?? "",
//       early_leave: employee.early_leave ?? "",
//       absent: employee.absent ?? "",
//       friday_absent: employee.friday_absent ?? "",
//       unapproval_absent: employee.unapproval_absent ?? "",
//       net_salary: employee.net_salary ?? "",
//       note: employee.note ?? "",
//       remarks: employee.remarks ?? "",
//       userId: userId,
//     };

//     const s = calcSalary(normalized);
//     setCurrentEmployee({
//       ...normalized,
//       total_salary: s.total_salary.toFixed(2),
//       net_salary: s.net_salary.toFixed(2),
//     });

//     setIsEditModalOpen(true);
//   };

//   const handleEditClick1 = (employee) => {
//     const normalized = {
//       ...employee,
//       name: employee.name ?? "",
//       employee_id: employee.employee_id ?? "",
//       note: employee.note ?? "",
//       remarks: employee.remarks ?? "",
//       userId: userId,
//     };

//     setCurrentEmployee(normalized);
//     setIsEditModalOpen1(true);
//   };

//   const closeEditModal = () => setIsEditModalOpen(false);
//   const closeEditModal1 = () => setIsEditModalOpen1(false);
//   const openAddModal = () => setIsAddModalOpen(true);
//   const closeAddModal = () => setIsAddModalOpen(false);

//   // ----------------------------
//   // Mutations
//   // ----------------------------
//   const [insertEmployee] = useInsertEmployeeMutation();
//   const [updateEmployee] = useUpdateEmployeeMutation();
//   const [deleteEmployee] = useDeleteEmployeeMutation();

//   const handleCreateEmployee = async (e) => {
//     e.preventDefault();
//     try {
//       const s = calcSalary(createEmployee);

//       const payload = {
//         ...createEmployee,
//         name: createEmployee.name || "",
//         employee_id: createEmployee.employee_id || "",
//         note: createEmployee.note || "",
//         remarks: createEmployee.remarks || "",

//         basic_salary: Number(createEmployee.basic_salary) || 0,
//         incentive: Number(createEmployee.incentive) || 0,
//         holiday_payment: Number(createEmployee.holiday_payment) || 0,

//         advance: Number(createEmployee.advance) || 0,
//         late: Number(createEmployee.late) || 0,
//         early_leave: Number(createEmployee.early_leave) || 0,
//         absent: Number(createEmployee.absent) || 0,
//         friday_absent: Number(createEmployee.friday_absent) || 0,
//         unapproval_absent: Number(createEmployee.unapproval_absent) || 0,

//         total_salary: s.total_salary,
//         net_salary: s.net_salary,
//         userId: userId,
//       };

//       const res = await insertEmployee(payload).unwrap();
//       if (res.success) {
//         toast.success("Successfully created employee");
//         setIsAddModalOpen(false);
//         setCreateEmployee(emptyEmployee);
//         refetch?.();
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Create failed!");
//     }
//   };

//   const handleUpdateEmployee = async () => {
//     if (!currentEmployee) return;
//     try {
//       const s = calcSalary(currentEmployee);

//       const updatedEmployee = {
//         name: currentEmployee.name || "",
//         employee_id: currentEmployee.employee_id || "",
//         note: currentEmployee.note || "",
//         remarks: currentEmployee.remarks || "",

//         basic_salary: Number(currentEmployee.basic_salary) || 0,
//         incentive: Number(currentEmployee.incentive) || 0,
//         holiday_payment: Number(currentEmployee.holiday_payment) || 0,

//         advance: Number(currentEmployee.advance) || 0,
//         late: Number(currentEmployee.late) || 0,
//         early_leave: Number(currentEmployee.early_leave) || 0,
//         absent: Number(currentEmployee.absent) || 0,
//         friday_absent: Number(currentEmployee.friday_absent) || 0,
//         unapproval_absent: Number(currentEmployee.unapproval_absent) || 0,

//         total_salary: s.total_salary,
//         net_salary: s.net_salary,
//         status: currentEmployee.status,
//         userId: userId,
//       };

//       const res = await updateEmployee({
//         id: currentEmployee.Id,
//         data: updatedEmployee,
//       }).unwrap();

//       if (res.success) {
//         toast.success("Successfully updated employee!");
//         setIsEditModalOpen(false);
//         refetch?.();
//       } else {
//         toast.error("Update failed!");
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Update failed!");
//     }
//   };

//   // This is your "Delete modal save" (actually update note/status)
//   const handleUpdateEmployee1 = async () => {
//     if (!currentEmployee) return;
//     try {
//       const updatedEmployee = {
//         name: currentEmployee.name || "",
//         employee_id: currentEmployee.employee_id || "",
//         note: currentEmployee.note || "",
//         status: currentEmployee.status,
//         userId: userId,
//       };

//       const res = await updateEmployee({
//         id: currentEmployee.Id,
//         data: updatedEmployee,
//       }).unwrap();

//       if (res.success) {
//         toast.success("Successfully updated!");
//         setIsEditModalOpen1(false);
//         refetch?.();
//       } else {
//         toast.error("Update failed!");
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Update failed!");
//     }
//   };

//   const handleDeleteEmployee = async (id) => {
//     const confirmDelete = window.confirm(
//       "Do you want to delete this employee?",
//     );
//     if (!confirmDelete) return toast.info("Delete action was cancelled.");

//     try {
//       const res = await deleteEmployee(id).unwrap();
//       if (res.success) {
//         toast.success("Employee deleted successfully!");
//         refetch?.();
//       } else {
//         toast.error("Delete failed!");
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Delete failed!");
//     }
//   };

//   // ----------------------------
//   // Pagination
//   // ----------------------------
//   const clearFilters = () => {
//     setStartDate("");
//     setEndDate("");
//     setName("");
//   };

//   const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     if (pageNumber < startPage) setStartPage(pageNumber);
//     else if (pageNumber > endPage) setStartPage(pageNumber - pagesPerSet + 1);
//   };

//   const handlePreviousSet = () =>
//     setStartPage((prev) => Math.max(prev - pagesPerSet, 1));

//   const handleNextSet = () =>
//     setStartPage((prev) =>
//       Math.min(prev + pagesPerSet, totalPages - pagesPerSet + 1),
//     );

//   // ----------------------------
//   // Invoice: single
//   // ----------------------------
//   const openInvoice = (emp) => {
//     setInvoiceEmployee(emp);
//     setIsInvoiceOpen(true);
//   };

//   const closeInvoice = () => {
//     setIsInvoiceOpen(false);
//     setInvoiceEmployee(null);
//   };

//   const downloadInvoicePDF = async () => {
//     try {
//       if (!invoiceRef.current || !invoiceEmployee) return;

//       if (document.fonts?.ready) await document.fonts.ready;

//       const canvas = await html2canvas(invoiceRef.current, {
//         scale: 3,
//         useCORS: true,
//         allowTaint: true,
//         backgroundColor: "#ffffff",
//         logging: false,
//         scrollX: 0,
//         scrollY: -window.scrollY,

//         // ✅ FIX: remove oklch from cloned DOM
//         onclone: (clonedDoc) => {
//           clonedDoc.documentElement.style.background = "#ffffff";
//           clonedDoc.body.style.background = "#ffffff";

//           const style = clonedDoc.createElement("style");
//           style.setAttribute("data-html2canvas-fix", "true");
//           style.innerHTML = `
//             #invoiceCapture, #invoiceCapture * {
//               color: #000 !important;
//               background: transparent !important;
//               background-color: transparent !important;
//               border-color: #d1d5db !important;
//               box-shadow: none !important;
//               text-shadow: none !important;
//               filter: none !important;
//               outline: none !important;
//             }
//             #invoiceCapture { background: #fff !important; background-color: #fff !important; }
//             #invoiceCapture *::before,
//             #invoiceCapture *::after {
//               color: #000 !important;
//               background: transparent !important;
//               background-color: transparent !important;
//               border-color: #d1d5db !important;
//               box-shadow: none !important;
//               text-shadow: none !important;
//               filter: none !important;
//               outline: none !important;
//             }
//           `;
//           clonedDoc.head.appendChild(style);
//         },
//       });

//       const imgData = canvas.toDataURL("image/jpeg", 0.98);
//       const pdf = new jsPDF("p", "mm", "a4");

//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();

//       const imgWidth = pdfWidth;
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;

//       let heightLeft = imgHeight;
//       let position = 0;

//       pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
//       heightLeft -= pdfHeight;

//       while (heightLeft > 0) {
//         position -= pdfHeight;
//         pdf.addPage();
//         pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
//         heightLeft -= pdfHeight;
//       }

//       const fileName = `Invoice_${invoiceEmployee?.employee_id || "EMP"}_${Date.now()}.pdf`;
//       pdf.save(fileName);
//     } catch (err) {
//       console.error(err);
//       toast.error("PDF download failed! Console এ error দেখুন.");
//     }
//   };

//   // ----------------------------
//   // Bulk selection (table checkbox)
//   // ----------------------------
//   const toggleSelect = (id) => {
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
//     );
//   };

//   const isAllSelectedOnPage = useMemo(() => {
//     const idsOnPage = (employees || []).map((e) => e.Id);
//     return (
//       idsOnPage.length > 0 && idsOnPage.every((id) => selectedIds.includes(id))
//     );
//   }, [employees, selectedIds]);

//   const toggleSelectAllOnPage = () => {
//     const idsOnPage = (employees || []).map((e) => e.Id);
//     setSelectedIds((prev) => {
//       const allSelected = idsOnPage.every((id) => prev.includes(id));
//       if (allSelected) return prev.filter((id) => !idsOnPage.includes(id));
//       return Array.from(new Set([...prev, ...idsOnPage]));
//     });
//   };

//   const selectedEmployees = useMemo(() => {
//     // employeesAll না থাকলে employees থেকে fallback
//     const all =
//       Array.isArray(employeesAll) && employeesAll.length
//         ? employeesAll
//         : employees;
//     const map = new Map((all || []).map((e) => [e.Id, e]));
//     return selectedIds.map((id) => map.get(id)).filter(Boolean);
//   }, [selectedIds, employeesAll, employees]);

//   // ----------------------------
//   // Bulk invoice PDF (multi invoice in one PDF)
//   // ----------------------------
//   const downloadBulkInvoicePDF = async () => {
//     try {
//       if (!bulkInvoiceRef.current || selectedEmployees.length === 0) return;

//       if (document.fonts?.ready) await document.fonts.ready;

//       const pdf = new jsPDF("p", "mm", "a4");
//       const pageW = pdf.internal.pageSize.getWidth();
//       const pageH = pdf.internal.pageSize.getHeight();

//       const invoiceNodes =
//         bulkInvoiceRef.current.querySelectorAll(".invoice-page");

//       for (let i = 0; i < invoiceNodes.length; i++) {
//         const node = invoiceNodes[i];

//         const canvas = await html2canvas(node, {
//           scale: 3,
//           useCORS: true,
//           allowTaint: true,
//           backgroundColor: "#ffffff",
//           logging: false,
//           scrollX: 0,
//           scrollY: -window.scrollY,
//         });

//         const imgData = canvas.toDataURL("image/jpeg", 0.98);
//         const imgH = (canvas.height * pageW) / canvas.width;

//         let heightLeft = imgH;
//         let position = 0;

//         if (i > 0) pdf.addPage();

//         pdf.addImage(imgData, "JPEG", 0, position, pageW, imgH);
//         heightLeft -= pageH;

//         while (heightLeft > 0) {
//           position -= pageH;
//           pdf.addPage();
//           pdf.addImage(imgData, "JPEG", 0, position, pageW, imgH);
//           heightLeft -= pageH;
//         }
//       }

//       pdf.save(`Invoices_${Date.now()}.pdf`);
//     } catch (err) {
//       console.error(err);
//       toast.error("Bulk PDF download failed!");
//     }
//   };

//   // ✅ Bulk print (direct print)
//   const printBulkInvoices = () => {
//     if (!bulkInvoiceRef.current || selectedEmployees.length === 0) return;

//     const html = bulkInvoiceRef.current.innerHTML;

//     const printWindow = window.open("", "_blank", "width=900,height=650");
//     if (!printWindow) {
//       toast.error("Popup blocked! Allow popups then try again.");
//       return;
//     }

//     printWindow.document.open();
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Print Invoices</title>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 12px; }
//             .invoice-page { page-break-after: always; border: 1px solid #e5e7eb; padding: 16px; margin-bottom: 16px; }
//             table { width: 100%; border-collapse: collapse; }
//             td { border: 1px solid #d1d5db; padding: 8px; }
//             hr { margin: 14px 0; }
//           </style>
//         </head>
//         <body>
//           ${html}
//           <script>
//             window.onload = function() {
//               window.print();
//               window.onafterprint = function() { window.close(); }
//             }
//           </script>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//   };

//   return (
//     <motion.div
//       className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.2 }}
//     >
//       <div className="my-6 flex flex-wrap gap-3 items-center justify-start">
//         <button
//           className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-28 justify-center"
//           onClick={openAddModal}
//         >
//           Add <Plus size={18} className="ms-2" />
//         </button>

//         {/* ✅ Bulk actions */}
//         <button
//           className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded disabled:opacity-60"
//           onClick={() => setIsBulkInvoiceOpen(true)}
//           disabled={selectedIds.length === 0}
//         >
//           Print Selected ({selectedIds.length})
//         </button>

//         <button
//           className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded disabled:opacity-60"
//           onClick={() => setSelectedIds([])}
//           disabled={selectedIds.length === 0}
//         >
//           Clear Selection
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center mb-6 w-full justify-center mx-auto">
//         <div className="flex flex-col">
//           <label className="text-sm text-gray-400 mb-1">From</label>
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-100"
//           />
//         </div>

//         <div className="flex flex-col">
//           <label className="text-sm text-gray-400 mb-1">To</label>
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-100"
//           />
//         </div>

//         <div className="flex items-center justify-center mt-6">
//           <Select
//             options={employeeOptions}
//             value={employeeOptions.find((o) => o.value === name) || null}
//             onChange={(selected) => setName(selected?.value || "")}
//             placeholder="Select Employee"
//             isClearable
//             className="text-black w-full"
//           />
//         </div>

//         {/* ✅ Per page dropdown */}
//         <div className="flex flex-col">
//           <label className="text-sm text-gray-400 mb-1">Per Page</label>
//           <select
//             value={itemsPerPage}
//             onChange={(e) => {
//               setItemsPerPage(Number(e.target.value));
//               setCurrentPage(1);
//               setStartPage(1);
//             }}
//             className="px-3 py-[10px] rounded-lg bg-gray-900 border border-gray-700 text-gray-100"
//           >
//
//             <option value={10}>10</option>
//             <option value={20}>20</option>
//             <option value={50}>50</option>
//             <option value={100}>100</option>
//           </select>
//         </div>

//         <button
//           className="flex items-center mt-6 bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-36 justify-center mx-auto"
//           onClick={clearFilters}
//         >
//           Clear Filters
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-700">
//           <thead>
//             <tr>
//               {/* ✅ select all on this page */}
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 <input
//                   type="checkbox"
//                   checked={isAllSelectedOnPage}
//                   onChange={toggleSelectAllOnPage}
//                 />
//               </th>

//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Employee
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Employee ID
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Basic Salary
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Incentive
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Holiday Days
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Advance
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Late (Days)
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Early (Days)
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Absent (Days)
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Friday Absent (Days)
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Unapproval Absent (Days)
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Total Salary
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Net Salary
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Note
//               </th>

//               {(role === "superAdmin" || role === "admin") && (
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                   Actions
//                 </th>
//               )}
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-gray-700">
//             {(employees || []).map((emp) => (
//               <motion.tr
//                 key={emp.Id}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 {/* ✅ row checkbox */}
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   <input
//                     type="checkbox"
//                     checked={selectedIds.includes(emp.Id)}
//                     onChange={() => toggleSelect(emp.Id)}
//                   />
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
//                   {emp.name}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {emp.employee_id}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(emp.basic_salary || 0).toFixed(2)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(emp.incentive || 0).toFixed(2)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(emp.holiday_payment || 0)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(emp.advance || 0)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(emp.late || 0)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(emp.early_leave || 0)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(emp.absent || 0)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(emp.friday_absent || 0)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(emp.unapproval_absent || 0)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(emp.total_salary || 0).toFixed(2)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(emp.net_salary || 0).toFixed(2)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {emp.note}
//                 </td>

//                 {(role === "superAdmin" || role === "admin") && (
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <button
//                       onClick={() => openInvoice(emp)}
//                       className="text-green-500 hover:text-green-300"
//                       title="Invoice"
//                     >
//                       <FileText size={18} />
//                     </button>

//                     <button
//                       onClick={() => handleEditClick(emp)}
//                       className="text-indigo-600 hover:text-indigo-900 ms-4"
//                       title="Edit"
//                     >
//                       <Edit size={18} />
//                     </button>

//                     {role === "superAdmin" ||
//                     role === "admin" ||
//                     emp.status === "Approved" ? (
//                       <button
//                         onClick={() => handleDeleteEmployee(emp.Id)}
//                         className="text-red-600 hover:text-red-900 ms-4"
//                         title="Delete"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     ) : (
//                       <button
//                         onClick={() => handleEditClick1(emp)}
//                         className="text-red-600 hover:text-red-900 ms-4"
//                         title="Delete Request / Note"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     )}
//                   </td>
//                 )}
//               </motion.tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center justify-center space-x-2 mt-6">
//         <button
//           onClick={handlePreviousSet}
//           disabled={startPage === 1}
//           className="px-3 py-2 text-white bg-indigo-600 rounded-md disabled:bg-gray-400"
//         >
//           Prev
//         </button>

//         {[...Array(endPage - startPage + 1)].map((_, index) => {
//           const pageNum = startPage + index;
//           return (
//             <button
//               key={pageNum}
//               onClick={() => handlePageChange(pageNum)}
//               className={`px-3 py-2 text-black rounded-md ${
//                 pageNum === currentPage
//                   ? "bg-white"
//                   : "bg-indigo-500 hover:bg-indigo-400"
//               }`}
//             >
//               {pageNum}
//             </button>
//           );
//         })}

//         <button
//           onClick={handleNextSet}
//           disabled={endPage === totalPages}
//           className="px-3 py-2 text-white bg-indigo-600 rounded-md disabled:bg-gray-400"
//         >
//           Next
//         </button>
//       </div>

//       {/* -------------------- Edit Modal -------------------- */}
//       {isEditModalOpen && currentEmployee && (
//         <div className="fixed top-36 inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <motion.div
//             className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-3/4 lg:w-2/3"
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="text-lg font-semibold text-white">
//               Edit Employee Salary Calculation
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
//               <div>
//                 <label className="block text-sm text-white">
//                   Employee Name:
//                 </label>
//                 <input
//                   type="text"
//                   value={currentEmployee.name}
//                   onChange={(e) =>
//                     setCurrentEmployee({
//                       ...currentEmployee,
//                       name: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">Employee Id:</label>
//                 <input
//                   type="number"
//                   value={currentEmployee.employee_id}
//                   onChange={(e) =>
//                     setCurrentEmployee({
//                       ...currentEmployee,
//                       employee_id: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">
//                   Basic Salary:
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={currentEmployee.basic_salary}
//                   onChange={(e) =>
//                     updateCurrentField("basic_salary", e.target.value)
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">Incentive:</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={currentEmployee.incentive}
//                   onChange={(e) =>
//                     updateCurrentField("incentive", e.target.value)
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">
//                   Holiday Days:
//                 </label>
//                 <input
//                   type="number"
//                   value={currentEmployee.holiday_payment}
//                   onChange={(e) =>
//                     updateCurrentField("holiday_payment", e.target.value)
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">Advance:</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={currentEmployee.advance}
//                   onChange={(e) =>
//                     updateCurrentField("advance", e.target.value)
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">Late (days):</label>
//                 <input
//                   type="number"
//                   value={currentEmployee.late}
//                   onChange={(e) => updateCurrentField("late", e.target.value)}
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">
//                   Early Leave (days):
//                 </label>
//                 <input
//                   type="number"
//                   value={currentEmployee.early_leave}
//                   onChange={(e) =>
//                     updateCurrentField("early_leave", e.target.value)
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">
//                   Absent (days):
//                 </label>
//                 <input
//                   type="number"
//                   value={currentEmployee.absent}
//                   onChange={(e) => updateCurrentField("absent", e.target.value)}
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">
//                   Friday Absent (days):
//                 </label>
//                 <input
//                   type="number"
//                   value={currentEmployee.friday_absent}
//                   onChange={(e) =>
//                     updateCurrentField("friday_absent", e.target.value)
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">
//                   Unapproval Absent (days):
//                 </label>
//                 <input
//                   type="number"
//                   value={currentEmployee.unapproval_absent}
//                   onChange={(e) =>
//                     updateCurrentField("unapproval_absent", e.target.value)
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">
//                   Total Salary:
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={currentEmployee.total_salary}
//                   readOnly
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent opacity-80"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">Net Salary:</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={currentEmployee.net_salary}
//                   readOnly
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent opacity-80"
//                 />
//               </div>

//               <div className="md:col-span-3">
//                 <label className="block text-sm text-white">Remarks:</label>
//                 <textarea
//                   value={currentEmployee.remarks}
//                   onChange={(e) =>
//                     setCurrentEmployee({
//                       ...currentEmployee,
//                       remarks: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                   rows={3}
//                 />
//               </div>

//               {role === "superAdmin" ? (
//                 <div className="mt-4 ">
//                   <label className="block text-sm text-white">Status</label>
//                   <select
//                     value={currentEmployee.status || ""}
//                     onChange={(e) =>
//                       setCurrentEmployee({
//                         ...currentEmployee,
//                         status: e.target.value,
//                       })
//                     }
//                     className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                     required
//                   >
//                     <option value="">Select Status</option>
//                     <option value="Approved">Approved</option>
//                     <option value="Pending">Pending</option>
//                   </select>
//                 </div>
//               ) : (
//                 <div className="mt-4 md:col-span-3">
//                   <label className="block text-sm text-white">Note:</label>
//                   <textarea
//                     value={currentEmployee?.note || ""}
//                     onChange={(e) =>
//                       setCurrentEmployee({
//                         ...currentEmployee,
//                         note: e.target.value,
//                       })
//                     }
//                     className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                   />
//                 </div>
//               )}
//             </div>

//             <div className="mt-6 flex justify-end">
//               <button
//                 className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
//                 onClick={handleUpdateEmployee}
//               >
//                 Save
//               </button>
//               <button
//                 type="button"
//                 className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
//                 onClick={closeEditModal}
//               >
//                 Cancel
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}

//       {/* -------------------- "Delete" Modal (note/status update) -------------------- */}
//       {isEditModalOpen1 && currentEmployee && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <motion.div
//             className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-3/4 lg:w-2/3"
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="text-lg font-semibold text-white">
//               Delete Employee
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
//               {role === "superAdmin" ? (
//                 <div className="mt-4">
//                   <label className="block text-sm text-white">Status</label>
//                   <select
//                     value={currentEmployee.status || ""}
//                     onChange={(e) =>
//                       setCurrentEmployee({
//                         ...currentEmployee,
//                         status: e.target.value,
//                       })
//                     }
//                     className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                     required
//                   >
//                     <option value="">Select Status</option>
//                     <option value="Approved">Approved</option>
//                     <option value="Pending">Pending</option>
//                   </select>
//                 </div>
//               ) : (
//                 <div className="mt-4 md:col-span-3">
//                   <label className="block text-sm text-white">Note:</label>
//                   <textarea
//                     value={currentEmployee?.note || ""}
//                     onChange={(e) =>
//                       setCurrentEmployee({
//                         ...currentEmployee,
//                         note: e.target.value,
//                       })
//                     }
//                     className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                   />
//                 </div>
//               )}
//             </div>

//             <div className="mt-6 flex justify-end">
//               <button
//                 className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
//                 onClick={handleUpdateEmployee1}
//               >
//                 Save
//               </button>
//               <button
//                 type="button"
//                 className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
//                 onClick={closeEditModal1}
//               >
//                 Cancel
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}

//       {/* -------------------- Add Modal -------------------- */}
//       {isAddModalOpen && (
//         <div className="fixed inset-0 top-36 z-10 flex items-center justify-center bg-black bg-opacity-50">
//           <motion.div
//             className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-3/4 lg:w-3/4"
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="text-lg font-semibold text-white">
//               Employee Salary Calculation
//             </h2>

//             <form
//               onSubmit={handleCreateEmployee}
//               className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4"
//             >
//               <div>
//                 <label className="block text-sm text-white">
//                   Employee Name:
//                 </label>
//                 <input
//                   type="text"
//                   value={createEmployee.name}
//                   onChange={(e) =>
//                     setCreateEmployee({
//                       ...createEmployee,
//                       name: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">Employee Id:</label>
//                 <input
//                   type="number"
//                   value={createEmployee.employee_id}
//                   onChange={(e) =>
//                     setCreateEmployee({
//                       ...createEmployee,
//                       employee_id: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">
//                   Basic Salary:
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createEmployee.basic_salary}
//                   onChange={(e) =>
//                     updateCreateField("basic_salary", e.target.value)
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">Incentive:</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createEmployee.incentive}
//                   onChange={(e) =>
//                     updateCreateField("incentive", e.target.value)
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">
//                   Holiday Days:
//                 </label>
//                 <input
//                   type="number"
//                   value={createEmployee.holiday_payment}
//                   onChange={(e) =>
//                     updateCreateField("holiday_payment", e.target.value)
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">Advance:</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createEmployee.advance}
//                   onChange={(e) => updateCreateField("advance", e.target.value)}
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">Late (days):</label>
//                 <input
//                   type="number"
//                   value={createEmployee.late}
//                   onChange={(e) => updateCreateField("late", e.target.value)}
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">
//                   Early Leave (days):
//                 </label>
//                 <input
//                   type="number"
//                   value={createEmployee.early_leave}
//                   onChange={(e) =>
//                     updateCreateField("early_leave", e.target.value)
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">
//                   Absent (days):
//                 </label>
//                 <input
//                   type="number"
//                   value={createEmployee.absent}
//                   onChange={(e) => updateCreateField("absent", e.target.value)}
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">
//                   Friday Absent (days):
//                 </label>
//                 <input
//                   type="number"
//                   value={createEmployee.friday_absent}
//                   onChange={(e) =>
//                     updateCreateField("friday_absent", e.target.value)
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">
//                   Unapproval Absent (days):
//                 </label>
//                 <input
//                   type="number"
//                   value={createEmployee.unapproval_absent}
//                   onChange={(e) =>
//                     updateCreateField("unapproval_absent", e.target.value)
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">
//                   Total Salary:
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createEmployee.total_salary}
//                   readOnly
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent opacity-80"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-white">Net Salary:</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createEmployee.net_salary}
//                   readOnly
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent opacity-80"
//                 />
//               </div>

//               <div className="md:col-span-3">
//                 <label className="block text-sm text-white">Remarks:</label>
//                 <textarea
//                   value={createEmployee.remarks}
//                   onChange={(e) =>
//                     setCreateEmployee({
//                       ...createEmployee,
//                       remarks: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
//                   rows={3}
//                 />
//               </div>

//               <div className="md:col-span-3 mt-2 flex justify-end">
//                 <button
//                   type="submit"
//                   className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
//                 >
//                   Save
//                 </button>
//                 <button
//                   type="button"
//                   className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
//                   onClick={closeAddModal}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </motion.div>
//         </div>
//       )}

//       {/* -------------------- Single Invoice Modal -------------------- */}
//       {isInvoiceOpen && invoiceEmployee && (
//         <div className="fixed top-52 inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
//           <motion.div
//             className="bg-gray-900 rounded-lg p-4 shadow-lg w-full max-w-3xl border border-gray-700"
//             initial={{ opacity: 0, y: -30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.25 }}
//           >
//             <div className="flex items-center justify-between mb-3">
//               <h2 className="text-white font-semibold text-lg">
//                 Salary Invoice
//               </h2>

//               <div className="flex gap-2">
//                 <button
//                   onClick={downloadInvoicePDF}
//                   className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
//                 >
//                   Download PDF
//                 </button>

//                 <button
//                   onClick={closeInvoice}
//                   className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>

//             <div
//               id="invoiceCapture"
//               ref={invoiceRef}
//               className="bg-white text-black rounded p-6"
//             >
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h3 className="text-xl font-bold">Holy Gift</h3>
//                   <p className="text-sm">Address line</p>
//                   <p className="text-sm">Phone: +880 9647-555333</p>
//                 </div>

//                 <div className="text-right">
//                   <h3 className="text-xl font-bold">INVOICE</h3>
//                   <p className="text-sm">
//                     Date: {new Date().toLocaleDateString()}
//                   </p>
//                   <p className="text-sm">
//                     Invoice No: {invoiceEmployee.employee_id}-
//                     {String(Date.now()).slice(-6)}
//                   </p>
//                 </div>
//               </div>

//               <hr className="my-4" />

//               <div className="flex justify-between gap-3 text-sm">
//                 <p>
//                   <b>Employee:</b> {invoiceEmployee.name}
//                 </p>
//                 <p>
//                   <b>Employee ID:</b> {invoiceEmployee.employee_id}
//                 </p>
//               </div>

//               <hr className="my-4" />

//               <table className="w-full text-sm border border-gray-300">
//                 <tbody>
//                   <tr className="border-b">
//                     <td className="p-2 font-semibold">Basic Salary</td>
//                     <td className="p-2 text-right">
//                       {Number(invoiceEmployee.basic_salary || 0).toFixed(2)}
//                     </td>
//                   </tr>
//                   <tr className="border-b">
//                     <td className="p-2 font-semibold">Incentive</td>
//                     <td className="p-2 text-right">
//                       {Number(invoiceEmployee.incentive || 0).toFixed(2)}
//                     </td>
//                   </tr>
//                   <tr className="border-b">
//                     <td className="p-2 font-semibold">Holiday Days</td>
//                     <td className="p-2 text-right">
//                       {Number(invoiceEmployee.holiday_payment || 0)}
//                     </td>
//                   </tr>
//                   <tr className="border-b">
//                     <td className="p-2 font-semibold">Advance</td>
//                     <td className="p-2 text-right">
//                       -{Number(invoiceEmployee.advance || 0).toFixed(2)}
//                     </td>
//                   </tr>

//                   <tr className="border-b">
//                     <td className="p-2 font-semibold">Late (days)</td>
//                     <td className="p-2 text-right">
//                       {Number(invoiceEmployee.late || 0)}
//                     </td>
//                   </tr>
//                   <tr className="border-b">
//                     <td className="p-2 font-semibold">Early Leave (days)</td>
//                     <td className="p-2 text-right">
//                       {Number(invoiceEmployee.early_leave || 0)}
//                     </td>
//                   </tr>
//                   <tr className="border-b">
//                     <td className="p-2 font-semibold">Absent (days)</td>
//                     <td className="p-2 text-right">
//                       {Number(invoiceEmployee.absent || 0)}
//                     </td>
//                   </tr>
//                   <tr className="border-b">
//                     <td className="p-2 font-semibold">Friday Absent (days)</td>
//                     <td className="p-2 text-right">
//                       {Number(invoiceEmployee.friday_absent || 0)}
//                     </td>
//                   </tr>
//                   <tr className="border-b">
//                     <td className="p-2 font-semibold">
//                       Unapproval Absent (days)
//                     </td>
//                     <td className="p-2 text-right">
//                       {Number(invoiceEmployee.unapproval_absent || 0)}
//                     </td>
//                   </tr>

//                   <tr className="border-b">
//                     <td className="p-2 font-semibold">Total Salary</td>
//                     <td className="p-2 text-right">
//                       {Number(invoiceEmployee.total_salary || 0).toFixed(2)}
//                     </td>
//                   </tr>
//                   <tr>
//                     <td className="p-2 font-bold text-lg">Net Salary</td>
//                     <td className="p-2 text-right font-bold text-lg">
//                       {Number(invoiceEmployee.net_salary || 0).toFixed(2)}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>

//               <p className="text-xs mt-4 text-gray-600">
//                 <span className="font-bold">Note: </span>
//                 {invoiceEmployee.note}
//               </p>

//               <div className="mt-10 grid grid-cols-2 gap-10 text-sm">
//                 <div className="border-t border-gray-400 pt-2 text-center">
//                   Employee Signature
//                 </div>
//                 <div className="border-t border-gray-400 pt-2 text-center">
//                   Authorized Signature
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       )}

//       {/* -------------------- Bulk Invoice Modal -------------------- */}
//       {isBulkInvoiceOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
//           <motion.div
//             className="bg-gray-900 rounded-lg p-4 shadow-lg w-full max-w-5xl border border-gray-700"
//             initial={{ opacity: 0, y: -30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.25 }}
//           >
//             <div className="flex items-center justify-between mb-3 md:mt-20 lg:mt-28">
//               <h2 className="text-white font-semibold text-lg">
//                 Selected Invoices ({selectedEmployees.length})
//               </h2>

//               <div className="flex gap-2">
//                 <button
//                   onClick={printBulkInvoices}
//                   className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded disabled:opacity-60"
//                   disabled={selectedEmployees.length === 0}
//                 >
//                   Print
//                 </button>

//                 <button
//                   onClick={downloadBulkInvoicePDF}
//                   className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded disabled:opacity-60"
//                   disabled={selectedEmployees.length === 0}
//                 >
//                   Download PDF
//                 </button>

//                 <button
//                   onClick={() => setIsBulkInvoiceOpen(false)}
//                   className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>

//             <div className="bg-white p-4 rounded max-h-[75vh] overflow-auto">
//               <div ref={bulkInvoiceRef}>
//                 {selectedEmployees.map((emp) => (
//                   <div
//                     key={emp.Id}
//                     className="invoice-page bg-white text-black rounded p-6 mb-6 border border-gray-200"
//                   >
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <h3 className="text-xl font-bold">Holy Gift</h3>
//                         <p className="text-sm">Address line</p>
//                         <p className="text-sm">Phone: +880 9647-555333</p>
//                       </div>

//                       <div className="text-right">
//                         <h3 className="text-xl font-bold">INVOICE</h3>
//                         <p className="text-sm">
//                           Date: {new Date().toLocaleDateString()}
//                         </p>
//                         <p className="text-sm">
//                           Invoice No: {emp.employee_id}-
//                           {String(Date.now()).slice(-6)}
//                         </p>
//                       </div>
//                     </div>

//                     <hr className="my-4" />

//                     <div className="flex justify-between gap-3 text-sm">
//                       <p>
//                         <b>Employee:</b> {emp.name}
//                       </p>
//                       <p>
//                         <b>Employee ID:</b> {emp.employee_id}
//                       </p>
//                     </div>

//                     <hr className="my-4" />

//                     <table className="w-full text-sm border border-gray-300">
//                       <tbody>
//                         <tr className="border-b">
//                           <td className="p-2 font-semibold">Basic Salary</td>
//                           <td className="p-2 text-right">
//                             {Number(emp.basic_salary || 0).toFixed(2)}
//                           </td>
//                         </tr>
//                         <tr className="border-b">
//                           <td className="p-2 font-semibold">Incentive</td>
//                           <td className="p-2 text-right">
//                             {Number(emp.incentive || 0).toFixed(2)}
//                           </td>
//                         </tr>
//                         <tr className="border-b">
//                           <td className="p-2 font-semibold">Holiday Days</td>
//                           <td className="p-2 text-right">
//                             {Number(emp.holiday_payment || 0)}
//                           </td>
//                         </tr>
//                         <tr className="border-b">
//                           <td className="p-2 font-semibold">Advance</td>
//                           <td className="p-2 text-right">
//                             -{Number(emp.advance || 0).toFixed(2)}
//                           </td>
//                         </tr>

//                         <tr className="border-b">
//                           <td className="p-2 font-semibold">Late (days)</td>
//                           <td className="p-2 text-right">
//                             {Number(emp.late || 0)}
//                           </td>
//                         </tr>
//                         <tr className="border-b">
//                           <td className="p-2 font-semibold">
//                             Early Leave (days)
//                           </td>
//                           <td className="p-2 text-right">
//                             {Number(emp.early_leave || 0)}
//                           </td>
//                         </tr>
//                         <tr className="border-b">
//                           <td className="p-2 font-semibold">Absent (days)</td>
//                           <td className="p-2 text-right">
//                             {Number(emp.absent || 0)}
//                           </td>
//                         </tr>
//                         <tr className="border-b">
//                           <td className="p-2 font-semibold">
//                             Friday Absent (days)
//                           </td>
//                           <td className="p-2 text-right">
//                             {Number(emp.friday_absent || 0)}
//                           </td>
//                         </tr>
//                         <tr className="border-b">
//                           <td className="p-2 font-semibold">
//                             Unapproval Absent (days)
//                           </td>
//                           <td className="p-2 text-right">
//                             {Number(emp.unapproval_absent || 0)}
//                           </td>
//                         </tr>

//                         <tr className="border-b">
//                           <td className="p-2 font-semibold">Total Salary</td>
//                           <td className="p-2 text-right">
//                             {Number(emp.total_salary || 0).toFixed(2)}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="p-2 font-bold text-lg">Net Salary</td>
//                           <td className="p-2 text-right font-bold text-lg">
//                             {Number(emp.net_salary || 0).toFixed(2)}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>

//                     <p className="text-xs mt-4 text-gray-600">
//                       <span className="font-bold">Note: </span>
//                       {emp.note || ""}
//                     </p>

//                     <div className="mt-10 grid grid-cols-2 gap-10 text-sm">
//                       <div className="border-t border-gray-400 pt-2 text-center">
//                         Employee Signature
//                       </div>
//                       <div className="border-t border-gray-400 pt-2 text-center">
//                         Authorized Signature
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </motion.div>
//   );
// };

// export default EmployeeTable;

import { motion } from "framer-motion";
import { Edit, Plus, Trash2, FileText, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  useDeleteEmployeeMutation,
  useGetAllEmployeeQuery,
  useGetAllEmployeeWithoutQueryQuery,
  useInsertEmployeeMutation,
  useUpdateEmployeeMutation,
} from "../../features/employee/employee";
import { useGetAllSalaryQuery } from "../../features/salary/salary";

const EmployeeTable = () => {
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  // ----------------------------
  // Modals
  // ----------------------------
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditModalOpen1, setIsEditModalOpen1] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Invoice (single)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceEmployee, setInvoiceEmployee] = useState(null);
  const invoiceRef = useRef(null);

  // Invoice (bulk)
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkInvoiceOpen, setIsBulkInvoiceOpen] = useState(false);
  const bulkInvoiceRef = useRef(null);

  // ----------------------------
  // Employee state
  // ----------------------------
  const [currentEmployee, setCurrentEmployee] = useState(null);

  const emptyEmployee = {
    name: "",
    employee_id: "",
    basic_salary: "",
    incentive: "",
    holiday_payment: "",
    total_salary: "",
    advance: "",
    late: "",
    early_leave: "",
    absent: "",
    friday_absent: "",
    unapproval_absent: "",
    net_salary: "",
    note: "",
    remarks: "",
  };

  const [createEmployee, setCreateEmployee] = useState(emptyEmployee);

  // list + filter states
  const [employees, setEmployees] = useState([]);
  const [employeesAll, setEmployeesAll] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [name, setName] = useState("");

  // ✅ Per-page user selectable
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);

  // ----------------------------
  // Fine meta
  // ----------------------------
  const [fine, setFine] = useState({
    late: 0,
    early_leave: 0,
    absent: 0,
    friday_absent: 0,
    unapproval_absent: 0,
  });

  const {
    data: fineData,
    isLoading: fineLoading,
    error: fineError,
  } = useGetAllSalaryQuery();

  useEffect(() => {
    if (fineError) {
      console.error("Error fetching fine meta", fineError);
      return;
    }
    if (!fineLoading && fineData?.data) {
      const payload = Array.isArray(fineData.data)
        ? fineData.data[0]
        : fineData.data;

      setFine((prev) => ({
        late: Number(payload?.late ?? prev.late ?? 0),
        early_leave: Number(payload?.early_leave ?? prev.early_leave ?? 0),
        absent: Number(payload?.absent ?? prev.absent ?? 0),
        friday_absent: Number(
          payload?.friday_absent ?? prev.friday_absent ?? 0,
        ),
        unapproval_absent: Number(
          payload?.unapproval_absent ?? prev.unapproval_absent ?? 0,
        ),
      }));
    }
  }, [fineData, fineLoading, fineError]);

  // ----------------------------
  // Salary Calculation
  // ----------------------------
  const calcSalary = (p) => {
    const basic_salary = Number(p.basic_salary) || 0;
    const incentive = Number(p.incentive) || 0;
    const holiday_days = Number(p.holiday_payment) || 0;
    const advance = Number(p.advance) || 0;

    const late = Number(p.late) || 0;
    const early_leave = Number(p.early_leave) || 0;
    const absent = Number(p.absent) || 0;
    const friday_absent = Number(p.friday_absent) || 0;
    const unapproval_absent = Number(p.unapproval_absent) || 0;

    const perDay = basic_salary / 30;

    const holiday_salary = perDay * holiday_days;
    const total_salary = basic_salary + holiday_salary + incentive;

    const lateAbsentCount = Math.floor(late / 3);
    const earlyAbsentCount = Math.floor(early_leave / 3);

    const lateCut = lateAbsentCount * (Number(fine.late) * perDay);
    const earlyLeaveCut =
      earlyAbsentCount * (Number(fine.early_leave) * perDay);
    const absentCut = absent * (Number(fine.absent) * perDay);
    const fridayAbsentCut =
      friday_absent * (Number(fine.friday_absent) * perDay);
    const unapprovalAbsentCut =
      unapproval_absent * (Number(fine.unapproval_absent) * perDay);

    const totalCutAmount =
      lateCut +
      earlyLeaveCut +
      absentCut +
      fridayAbsentCut +
      unapprovalAbsentCut;

    const net_salary = total_salary - totalCutAmount - advance;

    const safe = (n) => (Number.isFinite(n) ? n : 0);

    return {
      perDay: safe(perDay),
      total_salary: safe(total_salary),
      cutAmount: safe(totalCutAmount),
      net_salary: Math.max(safe(net_salary), 0),
    };
  };

  const updateCreateField = (key, value) => {
    setCreateEmployee((prev) => {
      const next = { ...prev, [key]: value };
      const s = calcSalary(next);
      return {
        ...next,
        total_salary: s.total_salary.toFixed(2),
        net_salary: s.net_salary.toFixed(2),
      };
    });
  };

  const updateCurrentField = (key, value) => {
    setCurrentEmployee((prev) => {
      const next = { ...prev, [key]: value };
      const s = calcSalary(next);
      return {
        ...next,
        total_salary: s.total_salary.toFixed(2),
        net_salary: s.net_salary.toFixed(2),
      };
    });
  };

  // ----------------------------
  // Queries
  // ----------------------------
  const {
    data: dataAll,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    error: errorAll,
  } = useGetAllEmployeeWithoutQueryQuery();

  useEffect(() => {
    if (isErrorAll) {
      console.error("Error fetching employees", errorAll);
      return;
    }
    if (!isLoadingAll && dataAll?.data) {
      setEmployeesAll(dataAll.data);
    }
  }, [dataAll, isLoadingAll, isErrorAll, errorAll]);

  useEffect(() => {
    const updatePagesPerSet = () => {
      if (window.innerWidth < 640) setPagesPerSet(5);
      else if (window.innerWidth < 1024) setPagesPerSet(7);
      else setPagesPerSet(10);
    };
    updatePagesPerSet();
    window.addEventListener("resize", updatePagesPerSet);
    return () => window.removeEventListener("resize", updatePagesPerSet);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setStartPage(1);
  }, [startDate, endDate, name, itemsPerPage]);

  const queryArgs = {
    page: currentPage,
    limit: itemsPerPage,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    name: name?.trim() ? name.trim() : undefined,
  };

  const { data, isLoading, isError, error, refetch } =
    useGetAllEmployeeQuery(queryArgs);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching employee data", error);
      return;
    }
    if (!isLoading && data?.data) {
      setEmployees(data.data);
      setTotalPages(Math.ceil((data?.meta?.total || 0) / itemsPerPage) || 1);
    }
  }, [data, isLoading, isError, error, currentPage, itemsPerPage]);

  // ----------------------------
  // Options
  // ----------------------------
  const employeeOptions = useMemo(() => {
    return (employeesAll || []).map((e) => ({
      value: e.name,
      label: e.name,
    }));
  }, [employeesAll]);

  // ----------------------------
  // Modal Handlers
  // ----------------------------
  const handleEditClick = (employee) => {
    const normalized = {
      ...employee,
      name: employee.name ?? "",
      employee_id: employee.employee_id ?? "",
      basic_salary: employee.basic_salary ?? "",
      incentive: employee.incentive ?? "",
      holiday_payment: employee.holiday_payment ?? "",
      total_salary: employee.total_salary ?? "",
      advance: employee.advance ?? "",
      late: employee.late ?? "",
      early_leave: employee.early_leave ?? "",
      absent: employee.absent ?? "",
      friday_absent: employee.friday_absent ?? "",
      unapproval_absent: employee.unapproval_absent ?? "",
      net_salary: employee.net_salary ?? "",
      note: employee.note ?? "",
      remarks: employee.remarks ?? "",
      userId: userId,
    };

    const s = calcSalary(normalized);
    setCurrentEmployee({
      ...normalized,
      total_salary: s.total_salary.toFixed(2),
      net_salary: s.net_salary.toFixed(2),
    });

    setIsEditModalOpen(true);
  };

  const handleEditClick1 = (employee) => {
    const normalized = {
      ...employee,
      name: employee.name ?? "",
      employee_id: employee.employee_id ?? "",
      note: employee.note ?? "",
      remarks: employee.remarks ?? "",
      userId: userId,
    };

    setCurrentEmployee(normalized);
    setIsEditModalOpen1(true);
  };

  const closeEditModal = () => setIsEditModalOpen(false);
  const closeEditModal1 = () => setIsEditModalOpen1(false);
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  // ----------------------------
  // Mutations
  // ----------------------------
  const [insertEmployee] = useInsertEmployeeMutation();
  const [updateEmployee] = useUpdateEmployeeMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      const s = calcSalary(createEmployee);

      const payload = {
        ...createEmployee,
        name: createEmployee.name || "",
        employee_id: createEmployee.employee_id || "",
        note: createEmployee.note || "",
        remarks: createEmployee.remarks || "",

        basic_salary: Number(createEmployee.basic_salary) || 0,
        incentive: Number(createEmployee.incentive) || 0,
        holiday_payment: Number(createEmployee.holiday_payment) || 0,

        advance: Number(createEmployee.advance) || 0,
        late: Number(createEmployee.late) || 0,
        early_leave: Number(createEmployee.early_leave) || 0,
        absent: Number(createEmployee.absent) || 0,
        friday_absent: Number(createEmployee.friday_absent) || 0,
        unapproval_absent: Number(createEmployee.unapproval_absent) || 0,

        total_salary: s.total_salary,
        net_salary: s.net_salary,
        userId: userId,
      };

      const res = await insertEmployee(payload).unwrap();
      if (res.success) {
        toast.success("Successfully created employee");
        setIsAddModalOpen(false);
        setCreateEmployee(emptyEmployee);
        refetch?.();
      }
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  const handleUpdateEmployee = async () => {
    if (!currentEmployee) return;
    try {
      const s = calcSalary(currentEmployee);

      const updatedEmployee = {
        name: currentEmployee.name || "",
        employee_id: currentEmployee.employee_id || "",
        note: currentEmployee.note || "",
        remarks: currentEmployee.remarks || "",

        basic_salary: Number(currentEmployee.basic_salary) || 0,
        incentive: Number(currentEmployee.incentive) || 0,
        holiday_payment: Number(currentEmployee.holiday_payment) || 0,

        advance: Number(currentEmployee.advance) || 0,
        late: Number(currentEmployee.late) || 0,
        early_leave: Number(currentEmployee.early_leave) || 0,
        absent: Number(currentEmployee.absent) || 0,
        friday_absent: Number(currentEmployee.friday_absent) || 0,
        unapproval_absent: Number(currentEmployee.unapproval_absent) || 0,

        total_salary: s.total_salary,
        net_salary: s.net_salary,
        status: currentEmployee.status,
        userId: userId,
      };

      const res = await updateEmployee({
        id: currentEmployee.Id,
        data: updatedEmployee,
      }).unwrap();

      if (res.success) {
        toast.success("Successfully updated employee!");
        setIsEditModalOpen(false);
        refetch?.();
      } else {
        toast.error("Update failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const handleUpdateEmployee1 = async () => {
    if (!currentEmployee) return;
    try {
      const updatedEmployee = {
        name: currentEmployee.name || "",
        employee_id: currentEmployee.employee_id || "",
        note: currentEmployee.note || "",
        status: currentEmployee.status,
        userId: userId,
      };

      const res = await updateEmployee({
        id: currentEmployee.Id,
        data: updatedEmployee,
      }).unwrap();

      if (res.success) {
        toast.success("Successfully updated!");
        setIsEditModalOpen1(false);
        refetch?.();
      } else {
        toast.error("Update failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const handleDeleteEmployee = async (id) => {
    const confirmDelete = window.confirm(
      "Do you want to delete this employee?",
    );
    if (!confirmDelete) return toast.info("Delete action was cancelled.");

    try {
      const res = await deleteEmployee(id).unwrap();
      if (res.success) {
        toast.success("Employee deleted successfully!");
        refetch?.();
      } else {
        toast.error("Delete failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  // ----------------------------
  // Pagination
  // ----------------------------
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setName("");
  };

  const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (pageNumber < startPage) setStartPage(pageNumber);
    else if (pageNumber > endPage) setStartPage(pageNumber - pagesPerSet + 1);
  };

  const handlePreviousSet = () =>
    setStartPage((prev) => Math.max(prev - pagesPerSet, 1));

  const handleNextSet = () =>
    setStartPage((prev) =>
      Math.min(prev + pagesPerSet, totalPages - pagesPerSet + 1),
    );

  // ----------------------------
  // Invoice: single
  // ----------------------------
  const openInvoice = (emp) => {
    setInvoiceEmployee(emp);
    setIsInvoiceOpen(true);
  };

  const closeInvoice = () => {
    setIsInvoiceOpen(false);
    setInvoiceEmployee(null);
  };

  const downloadInvoicePDF = async () => {
    try {
      if (!invoiceRef.current || !invoiceEmployee) return;

      if (document.fonts?.ready) await document.fonts.ready;

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        onclone: (clonedDoc) => {
          clonedDoc.documentElement.style.background = "#ffffff";
          clonedDoc.body.style.background = "#ffffff";

          const style = clonedDoc.createElement("style");
          style.setAttribute("data-html2canvas-fix", "true");
          style.innerHTML = `
            #invoiceCapture, #invoiceCapture * {
              color: #000 !important;
              background: transparent !important;
              background-color: transparent !important;
              border-color: #d1d5db !important;
              box-shadow: none !important;
              text-shadow: none !important;
              filter: none !important;
              outline: none !important;
            }
            #invoiceCapture { background: #fff !important; background-color: #fff !important; }
            #invoiceCapture *::before,
            #invoiceCapture *::after {
              color: #000 !important;
              background: transparent !important;
              background-color: transparent !important;
              border-color: #d1d5db !important;
              box-shadow: none !important;
              text-shadow: none !important;
              filter: none !important;
              outline: none !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `Invoice_${invoiceEmployee?.employee_id || "EMP"}_${Date.now()}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error(err);
      toast.error("PDF download failed! Console এ error দেখুন.");
    }
  };

  // ----------------------------
  // Bulk selection (table checkbox)
  // ----------------------------
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const isAllSelectedOnPage = useMemo(() => {
    const idsOnPage = (employees || []).map((e) => e.Id);
    return (
      idsOnPage.length > 0 && idsOnPage.every((id) => selectedIds.includes(id))
    );
  }, [employees, selectedIds]);

  const toggleSelectAllOnPage = () => {
    const idsOnPage = (employees || []).map((e) => e.Id);
    setSelectedIds((prev) => {
      const allSelected = idsOnPage.every((id) => prev.includes(id));
      if (allSelected) return prev.filter((id) => !idsOnPage.includes(id));
      return Array.from(new Set([...prev, ...idsOnPage]));
    });
  };

  const selectedEmployees = useMemo(() => {
    const all =
      Array.isArray(employeesAll) && employeesAll.length
        ? employeesAll
        : employees;
    const map = new Map((all || []).map((e) => [e.Id, e]));
    return selectedIds.map((id) => map.get(id)).filter(Boolean);
  }, [selectedIds, employeesAll, employees]);

  // ----------------------------
  // Bulk invoice PDF
  // ----------------------------
  const downloadBulkInvoicePDF = async () => {
    try {
      if (!bulkInvoiceRef.current || selectedEmployees.length === 0) return;

      if (document.fonts?.ready) await document.fonts.ready;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const invoiceNodes =
        bulkInvoiceRef.current.querySelectorAll(".invoice-page");

      for (let i = 0; i < invoiceNodes.length; i++) {
        const node = invoiceNodes[i];

        const canvas = await html2canvas(node, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          scrollX: 0,
          scrollY: -window.scrollY,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.98);
        const imgH = (canvas.height * pageW) / canvas.width;

        let heightLeft = imgH;
        let position = 0;

        if (i > 0) pdf.addPage();

        pdf.addImage(imgData, "JPEG", 0, position, pageW, imgH);
        heightLeft -= pageH;

        while (heightLeft > 0) {
          position -= pageH;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, position, pageW, imgH);
          heightLeft -= pageH;
        }
      }

      pdf.save(`Invoices_${Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
      toast.error("Bulk PDF download failed!");
    }
  };

  const printBulkInvoices = () => {
    if (!bulkInvoiceRef.current || selectedEmployees.length === 0) return;

    const html = bulkInvoiceRef.current.innerHTML;

    const printWindow = window.open("", "_blank", "width=900,height=650");
    if (!printWindow) {
      toast.error("Popup blocked! Allow popups then try again.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Invoices</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 12px; }
            .invoice-page { page-break-after: always; border: 1px solid #e5e7eb; padding: 16px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            td { border: 1px solid #d1d5db; padding: 8px; }
            hr { margin: 14px 0; }
          </style>
        </head>
        <body>
          ${html}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ----------------------------
  // ✅ React-select styles (light)
  // ----------------------------
  const selectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        minHeight: 44,
        borderRadius: 12,
        borderColor: state.isFocused ? "#c7d2fe" : "#e2e8f0", // indigo-200 / slate-200
        boxShadow: state.isFocused
          ? "0 0 0 4px rgba(99, 102, 241, 0.15)"
          : "none",
        "&:hover": { borderColor: state.isFocused ? "#c7d2fe" : "#cbd5e1" },
      }),
      valueContainer: (base) => ({ ...base, padding: "0 12px" }),
      placeholder: (base) => ({ ...base, color: "#64748b" }), // slate-500
      singleValue: (base) => ({ ...base, color: "#0f172a" }), // slate-900
      menu: (base) => ({
        ...base,
        borderRadius: 12,
        overflow: "hidden",
        zIndex: 60,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? "rgba(99, 102, 241, 0.12)"
          : state.isFocused
            ? "#f8fafc"
            : "#fff",
        color: "#0f172a",
      }),
    }),
    [],
  );

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="my-6 flex flex-wrap gap-3 items-center justify-start">
        <button
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white transition px-4 py-2 rounded-xl shadow-sm"
          onClick={openAddModal}
        >
          Add <Plus size={18} />
        </button>

        {/* ✅ Bulk actions */}
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl disabled:opacity-60 shadow-sm"
          onClick={() => setIsBulkInvoiceOpen(true)}
          disabled={selectedIds.length === 0}
        >
          Print Selected ({selectedIds.length})
        </button>

        <button
          className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-200 disabled:opacity-60"
          onClick={() => setSelectedIds([])}
          disabled={selectedIds.length === 0}
        >
          Clear Selection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6 w-full justify-center mx-auto">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          />
        </div>

        <div className="flex items-center justify-center md:mt-0">
          <Select
            options={employeeOptions}
            value={employeeOptions.find((o) => o.value === name) || null}
            onChange={(selected) => setName(selected?.value || "")}
            placeholder="Select Employee"
            isClearable
            styles={selectStyles}
            className="w-full"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Per Page</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
              setStartPage(1);
            }}
            className="px-3 py-[10px] rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <button
          className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 transition px-4 py-[10px] rounded-xl border border-slate-200"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={isAllSelectedOnPage}
                  onChange={toggleSelectAllOnPage}
                />
              </th>

              {[
                "Employee",
                "Employee ID",
                "Basic Salary",
                "Incentive",
                "Holiday Days",
                "Advance",
                // "Late (Days)",
                // "Early (Days)",
                // "Absent (Days)",
                // "Friday Absent (Days)",
                // "Unapproval Absent (Days)",
                "Total Salary",
                "Net Salary",
                "Note",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}

              {(role === "superAdmin" || role === "admin") && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {(employees || []).map((emp) => (
              <motion.tr
                key={emp.Id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="hover:bg-slate-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(emp.Id)}
                    onChange={() => toggleSelect(emp.Id)}
                  />
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                  {emp.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {emp.employee_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(emp.basic_salary || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(emp.incentive || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(emp.holiday_payment || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(emp.advance || 0)}
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(emp.late || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(emp.early_leave || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(emp.absent || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(emp.friday_absent || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(emp.unapproval_absent || 0)}
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(emp.total_salary || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(emp.net_salary || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {emp.note}
                </td>

                {(role === "superAdmin" || role === "admin") && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openInvoice(emp)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-emerald-50 transition"
                        title="Invoice"
                      >
                        <FileText size={18} className="text-emerald-600" />
                      </button>

                      <button
                        onClick={() => handleEditClick(emp)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-indigo-50 transition"
                        title="Edit"
                      >
                        <Edit size={18} className="text-indigo-600" />
                      </button>

                      {role === "superAdmin" ||
                      role === "admin" ||
                      emp.status === "Approved" ? (
                        <button
                          onClick={() => handleDeleteEmployee(emp.Id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-rose-50 transition"
                          title="Delete"
                        >
                          <Trash2 size={18} className="text-rose-600" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditClick1(emp)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-rose-50 transition"
                          title="Delete Request / Note"
                        >
                          <Trash2 size={18} className="text-rose-600" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center flex-wrap gap-2 mt-6">
        <button
          onClick={handlePreviousSet}
          disabled={startPage === 1}
          className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition"
        >
          Prev
        </button>

        {[...Array(endPage - startPage + 1)].map((_, index) => {
          const pageNum = startPage + index;
          const active = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-4 py-2 rounded-xl border transition ${
                active
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={handleNextSet}
          disabled={endPage === totalPages}
          className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-60 hover:bg-slate-50 transition"
        >
          Next
        </button>
      </div>

      {/* -------------------- Edit Modal -------------------- */}
      {isEditModalOpen && currentEmployee && (
        <div className="fixed inset-0 z-50 top-52 flex items-center justify-center bg-slate-900/40 p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(15,23,42,0.2)] w-full md:w-3/4 lg:w-2/3 border border-slate-200"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Edit Employee Salary Calculation
              </h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
                title="Close"
              >
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <Field
                label="Employee Name:"
                value={currentEmployee.name}
                onChange={(v) =>
                  setCurrentEmployee({ ...currentEmployee, name: v })
                }
              />

              <Field
                label="Employee Id:"
                type="number"
                value={currentEmployee.employee_id}
                onChange={(v) =>
                  setCurrentEmployee({ ...currentEmployee, employee_id: v })
                }
              />

              <Field
                label="Basic Salary:"
                type="number"
                step="0.01"
                value={currentEmployee.basic_salary}
                onChange={(v) => updateCurrentField("basic_salary", v)}
              />

              <Field
                label="Incentive:"
                type="number"
                step="0.01"
                value={currentEmployee.incentive}
                onChange={(v) => updateCurrentField("incentive", v)}
              />

              <Field
                label="Holiday Days:"
                type="number"
                value={currentEmployee.holiday_payment}
                onChange={(v) => updateCurrentField("holiday_payment", v)}
              />

              <Field
                label="Advance:"
                type="number"
                step="0.01"
                value={currentEmployee.advance}
                onChange={(v) => updateCurrentField("advance", v)}
              />

              <Field
                label="Late (days):"
                type="number"
                value={currentEmployee.late}
                onChange={(v) => updateCurrentField("late", v)}
              />

              <Field
                label="Early Leave (days):"
                type="number"
                value={currentEmployee.early_leave}
                onChange={(v) => updateCurrentField("early_leave", v)}
              />

              <Field
                label="Absent (days):"
                type="number"
                value={currentEmployee.absent}
                onChange={(v) => updateCurrentField("absent", v)}
              />

              <Field
                label="Friday Absent (days):"
                type="number"
                value={currentEmployee.friday_absent}
                onChange={(v) => updateCurrentField("friday_absent", v)}
              />

              <Field
                label="Unapproval Absent (days):"
                type="number"
                value={currentEmployee.unapproval_absent}
                onChange={(v) => updateCurrentField("unapproval_absent", v)}
              />

              <Field
                label="Total Salary:"
                type="number"
                step="0.01"
                value={currentEmployee.total_salary}
                readOnly
              />

              <Field
                label="Net Salary:"
                type="number"
                step="0.01"
                value={currentEmployee.net_salary}
                readOnly
              />

              <div className="md:col-span-3">
                <label className="block text-sm text-slate-700">Remarks:</label>
                <textarea
                  value={currentEmployee.remarks}
                  onChange={(e) =>
                    setCurrentEmployee({
                      ...currentEmployee,
                      remarks: e.target.value,
                    })
                  }
                  className="border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  rows={3}
                />
              </div>

              {role === "superAdmin" ? (
                <div className="mt-2 md:col-span-3">
                  <label className="block text-sm text-slate-700">Status</label>
                  <select
                    value={currentEmployee.status || ""}
                    onChange={(e) =>
                      setCurrentEmployee({
                        ...currentEmployee,
                        status: e.target.value,
                      })
                    }
                    className="border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              ) : (
                <div className="mt-2 md:col-span-3">
                  <label className="block text-sm text-slate-700">Note:</label>
                  <textarea
                    value={currentEmployee?.note || ""}
                    onChange={(e) =>
                      setCurrentEmployee({
                        ...currentEmployee,
                        note: e.target.value,
                      })
                    }
                    className="border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-sm"
                onClick={handleUpdateEmployee}
              >
                Save
              </button>
              <button
                type="button"
                className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-200"
                onClick={closeEditModal}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* -------------------- "Delete" Modal (note/status update) -------------------- */}
      {isEditModalOpen1 && currentEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(15,23,42,0.2)] w-full md:w-3/4 lg:w-2/3 border border-slate-200"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Delete Employee
              </h2>
              <button
                type="button"
                onClick={closeEditModal1}
                className="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
                title="Close"
              >
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              {role === "superAdmin" ? (
                <div className="md:col-span-3">
                  <label className="block text-sm text-slate-700">Status</label>
                  <select
                    value={currentEmployee.status || ""}
                    onChange={(e) =>
                      setCurrentEmployee({
                        ...currentEmployee,
                        status: e.target.value,
                      })
                    }
                    className="border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              ) : (
                <div className="md:col-span-3">
                  <label className="block text-sm text-slate-700">Note:</label>
                  <textarea
                    value={currentEmployee?.note || ""}
                    onChange={(e) =>
                      setCurrentEmployee({
                        ...currentEmployee,
                        note: e.target.value,
                      })
                    }
                    className="border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-sm"
                onClick={handleUpdateEmployee1}
              >
                Save
              </button>
              <button
                type="button"
                className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-200"
                onClick={closeEditModal1}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* -------------------- Add Modal -------------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 top-48 flex items-center justify-center bg-slate-900/40 p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(15,23,42,0.2)] w-full md:w-3/4 lg:w-3/4 border border-slate-200"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Employee Salary Calculation
              </h2>
              <button
                type="button"
                onClick={closeAddModal}
                className="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
                title="Close"
              >
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            <form
              onSubmit={handleCreateEmployee}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4"
            >
              <Field
                label="Employee Name:"
                value={createEmployee.name}
                onChange={(v) =>
                  setCreateEmployee({ ...createEmployee, name: v })
                }
                required
              />

              <Field
                label="Employee Id:"
                type="number"
                value={createEmployee.employee_id}
                onChange={(v) =>
                  setCreateEmployee({ ...createEmployee, employee_id: v })
                }
                required
              />

              <Field
                label="Basic Salary:"
                type="number"
                step="0.01"
                value={createEmployee.basic_salary}
                onChange={(v) => updateCreateField("basic_salary", v)}
              />

              <Field
                label="Incentive:"
                type="number"
                step="0.01"
                value={createEmployee.incentive}
                onChange={(v) => updateCreateField("incentive", v)}
              />

              <Field
                label="Holiday Days:"
                type="number"
                value={createEmployee.holiday_payment}
                onChange={(v) => updateCreateField("holiday_payment", v)}
              />

              <Field
                label="Advance:"
                type="number"
                step="0.01"
                value={createEmployee.advance}
                onChange={(v) => updateCreateField("advance", v)}
              />

              <Field
                label="Late (days):"
                type="number"
                value={createEmployee.late}
                onChange={(v) => updateCreateField("late", v)}
              />

              <Field
                label="Early Leave (days):"
                type="number"
                value={createEmployee.early_leave}
                onChange={(v) => updateCreateField("early_leave", v)}
              />

              <Field
                label="Absent (days):"
                type="number"
                value={createEmployee.absent}
                onChange={(v) => updateCreateField("absent", v)}
              />

              <Field
                label="Friday Absent (days):"
                type="number"
                value={createEmployee.friday_absent}
                onChange={(v) => updateCreateField("friday_absent", v)}
              />

              <Field
                label="Unapproval Absent (days):"
                type="number"
                value={createEmployee.unapproval_absent}
                onChange={(v) => updateCreateField("unapproval_absent", v)}
              />

              <Field
                label="Total Salary:"
                type="number"
                step="0.01"
                value={createEmployee.total_salary}
                readOnly
              />

              <Field
                label="Net Salary:"
                type="number"
                step="0.01"
                value={createEmployee.net_salary}
                readOnly
              />

              <div className="md:col-span-3">
                <label className="block text-sm text-slate-700">Remarks:</label>
                <textarea
                  value={createEmployee.remarks}
                  onChange={(e) =>
                    setCreateEmployee({
                      ...createEmployee,
                      remarks: e.target.value,
                    })
                  }
                  className="border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  rows={3}
                />
              </div>

              <div className="md:col-span-3 mt-2 flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-sm"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-200"
                  onClick={closeAddModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* -------------------- Single Invoice Modal -------------------- */}
      {isInvoiceOpen && invoiceEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <motion.div
            className="bg-white rounded-2xl p-4 shadow-[0_20px_60px_rgba(15,23,42,0.2)] w-full max-w-3xl border border-slate-200"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-slate-900 font-semibold text-lg">
                Salary Invoice
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={downloadInvoicePDF}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl shadow-sm"
                >
                  Download PDF
                </button>

                <button
                  onClick={closeInvoice}
                  className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl border border-slate-200"
                >
                  Close
                </button>
              </div>
            </div>

            <div
              id="invoiceCapture"
              ref={invoiceRef}
              className="bg-white text-slate-900 rounded-xl p-6 border border-slate-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">Holy Gift</h3>
                  <p className="text-sm text-slate-600">Address line</p>
                  <p className="text-sm text-slate-600">
                    Phone: +880 9647-555333
                  </p>
                </div>

                <div className="text-right">
                  <h3 className="text-xl font-bold">INVOICE</h3>
                  <p className="text-sm text-slate-600">
                    Date: {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-sm text-slate-600">
                    Invoice No: {invoiceEmployee.employee_id}-
                    {String(Date.now()).slice(-6)}
                  </p>
                </div>
              </div>

              <hr className="my-4 border-slate-200" />

              <div className="flex justify-between gap-3 text-sm">
                <p>
                  <b>Employee:</b> {invoiceEmployee.name}
                </p>
                <p>
                  <b>Employee ID:</b> {invoiceEmployee.employee_id}
                </p>
              </div>

              <hr className="my-4 border-slate-200" />

              <table className="w-full text-sm border border-slate-200">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-semibold">Basic Salary</td>
                    <td className="p-2 text-right">
                      {Number(invoiceEmployee.basic_salary || 0).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-semibold">Incentive</td>
                    <td className="p-2 text-right">
                      {Number(invoiceEmployee.incentive || 0).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-semibold">Holiday Days</td>
                    <td className="p-2 text-right">
                      {Number(invoiceEmployee.holiday_payment || 0)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-semibold">Advance</td>
                    <td className="p-2 text-right">
                      -{Number(invoiceEmployee.advance || 0).toFixed(2)}
                    </td>
                  </tr>

                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-semibold">Late (days)</td>
                    <td className="p-2 text-right">
                      {Number(invoiceEmployee.late || 0)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-semibold">Early Leave (days)</td>
                    <td className="p-2 text-right">
                      {Number(invoiceEmployee.early_leave || 0)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-semibold">Absent (days)</td>
                    <td className="p-2 text-right">
                      {Number(invoiceEmployee.absent || 0)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-semibold">Friday Absent (days)</td>
                    <td className="p-2 text-right">
                      {Number(invoiceEmployee.friday_absent || 0)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-semibold">
                      Unapproval Absent (days)
                    </td>
                    <td className="p-2 text-right">
                      {Number(invoiceEmployee.unapproval_absent || 0)}
                    </td>
                  </tr>

                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-semibold">Total Salary</td>
                    <td className="p-2 text-right">
                      {Number(invoiceEmployee.total_salary || 0).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-lg">Net Salary</td>
                    <td className="p-2 text-right font-bold text-lg">
                      {Number(invoiceEmployee.net_salary || 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <p className="text-xs mt-4 text-slate-600">
                <span className="font-bold">Note: </span>
                {invoiceEmployee.note}
              </p>

              <div className="mt-10 grid grid-cols-2 gap-10 text-sm">
                <div className="border-t border-slate-300 pt-2 text-center">
                  Employee Signature
                </div>
                <div className="border-t border-slate-300 pt-2 text-center">
                  Authorized Signature
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* -------------------- Bulk Invoice Modal -------------------- */}
      {isBulkInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <motion.div
            className="bg-white rounded-2xl p-4 shadow-[0_20px_60px_rgba(15,23,42,0.2)] w-full max-w-5xl border border-slate-200"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-slate-900 font-semibold text-lg">
                Selected Invoices ({selectedEmployees.length})
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={printBulkInvoices}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl disabled:opacity-60 shadow-sm"
                  disabled={selectedEmployees.length === 0}
                >
                  Print
                </button>

                <button
                  onClick={downloadBulkInvoicePDF}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl disabled:opacity-60 shadow-sm"
                  disabled={selectedEmployees.length === 0}
                >
                  Download PDF
                </button>

                <button
                  onClick={() => setIsBulkInvoiceOpen(false)}
                  className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl border border-slate-200"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl max-h-[75vh] overflow-auto border border-slate-200">
              <div ref={bulkInvoiceRef}>
                {selectedEmployees.map((emp) => (
                  <div
                    key={emp.Id}
                    className="invoice-page bg-white text-slate-900 rounded-xl p-6 mb-6 border border-slate-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">Holy Gift</h3>
                        <p className="text-sm text-slate-600">Address line</p>
                        <p className="text-sm text-slate-600">
                          Phone: +880 9647-555333
                        </p>
                      </div>

                      <div className="text-right">
                        <h3 className="text-xl font-bold">INVOICE</h3>
                        <p className="text-sm text-slate-600">
                          Date: {new Date().toLocaleDateString()}
                        </p>
                        <p className="text-sm text-slate-600">
                          Invoice No: {emp.employee_id}-
                          {String(Date.now()).slice(-6)}
                        </p>
                      </div>
                    </div>

                    <hr className="my-4 border-slate-200" />

                    <div className="flex justify-between gap-3 text-sm">
                      <p>
                        <b>Employee:</b> {emp.name}
                      </p>
                      <p>
                        <b>Employee ID:</b> {emp.employee_id}
                      </p>
                    </div>

                    <hr className="my-4 border-slate-200" />

                    <table className="w-full text-sm border border-slate-200">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-semibold">Basic Salary</td>
                          <td className="p-2 text-right">
                            {Number(emp.basic_salary || 0).toFixed(2)}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-semibold">Incentive</td>
                          <td className="p-2 text-right">
                            {Number(emp.incentive || 0).toFixed(2)}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-semibold">Holiday Days</td>
                          <td className="p-2 text-right">
                            {Number(emp.holiday_payment || 0)}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-semibold">Advance</td>
                          <td className="p-2 text-right">
                            -{Number(emp.advance || 0).toFixed(2)}
                          </td>
                        </tr>

                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-semibold">Late (days)</td>
                          <td className="p-2 text-right">
                            {Number(emp.late || 0)}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-semibold">
                            Early Leave (days)
                          </td>
                          <td className="p-2 text-right">
                            {Number(emp.early_leave || 0)}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-semibold">Absent (days)</td>
                          <td className="p-2 text-right">
                            {Number(emp.absent || 0)}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-semibold">
                            Friday Absent (days)
                          </td>
                          <td className="p-2 text-right">
                            {Number(emp.friday_absent || 0)}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-semibold">
                            Unapproval Absent (days)
                          </td>
                          <td className="p-2 text-right">
                            {Number(emp.unapproval_absent || 0)}
                          </td>
                        </tr>

                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-semibold">Total Salary</td>
                          <td className="p-2 text-right">
                            {Number(emp.total_salary || 0).toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-lg">Net Salary</td>
                          <td className="p-2 text-right font-bold text-lg">
                            {Number(emp.net_salary || 0).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <p className="text-xs mt-4 text-slate-600">
                      <span className="font-bold">Note: </span>
                      {emp.note || ""}
                    </p>

                    <div className="mt-10 grid grid-cols-2 gap-10 text-sm">
                      <div className="border-t border-slate-300 pt-2 text-center">
                        Employee Signature
                      </div>
                      <div className="border-t border-slate-300 pt-2 text-center">
                        Authorized Signature
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  step,
  readOnly,
  required,
}) => (
  <div>
    <label className="block text-sm text-slate-700">{label}</label>
    <input
      type={type}
      step={step}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      required={required}
      className={`border border-slate-200 rounded-xl p-3 w-full mt-1 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200 ${
        readOnly ? "text-slate-900 opacity-80" : "text-slate-900"
      }`}
    />
  </div>
);

export default EmployeeTable;

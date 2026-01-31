// import { motion } from "framer-motion";
// import { Edit, Plus, Trash2 } from "lucide-react";
// import { useEffect, useState } from "react";

// import toast from "react-hot-toast";
// import Select from "react-select";
// import {
//   useDeleteEmployeeMutation,
//   useGetAllEmployeeQuery,
//   useGetAllEmployeeWithoutQueryQuery,
//   useInsertEmployeeMutation,
//   useUpdateEmployeeMutation,
// } from "../../features/employee/employee";
// // import { useGetAllSupplierWithoutQueryQuery } from "../../features/supplier/supplier";

// const EmployeeTable = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isModalOpen1, setIsModalOpen1] = useState(false);
//   const role = localStorage.getItem("role");

//   const [currentProduct, setCurrentProduct] = useState(null);

//   const [createProduct, setCreateProduct] = useState({
//     name: "",
//     employee_id: "",
//     basic_salary: "",
//     incentive: "",
//     holiday_payment: "",
//     total_salary: "",
//     advance: "",
//     late: "",
//     early_leave: "",
//     absent: "",
//     friday_absent: "",
//     unapproval_absent: "",
//     net_salary: "",
//     note: "",
//   });

//   const [products, setProducts] = useState([]);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [name, setName] = useState("");

//   console.log("startDate:", startDate);
//   console.log("endDate:", endDate);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [startPage, setStartPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [pagesPerSet, setPagesPerSet] = useState(10);
//   const [itemsPerPage] = useState(10);

//   const [productsData, setProductsData] = useState([]);

//   const {
//     data: data2,
//     isLoading: isLoading2,
//     isError: isError2,
//     error: error2,
//   } = useGetAllEmployeeWithoutQueryQuery();

//   useEffect(() => {
//     if (isError2) {
//       console.error("Error fetching products", error2);
//     } else if (!isLoading2 && data2) {
//       setProductsData(data2.data);
//     }
//   }, [data2, isLoading2, isError2, error2]);

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

//   // filter change হলে page 1 এ ফেরত
//   useEffect(() => {
//     setCurrentPage(1);
//     setStartPage(1);
//   }, [startDate, endDate, name]);

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
//       console.error("Error fetching product data", error);
//     } else if (!isLoading && data) {
//       setProducts(data.data);
//       setTotalPages(Math.ceil((data?.meta?.total || 0) / itemsPerPage) || 1);
//     }
//   }, [data, isLoading, isError, error, currentPage, itemsPerPage]);

//   const handleEditClick = (employee) => {
//     setCurrentProduct({
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
//     });
//     setIsModalOpen(true);
//   };

//   const handleModalClose = () => setIsModalOpen(false);
//   const handleAddProduct = () => setIsModalOpen1(true);
//   const handleModalClose1 = () => setIsModalOpen1(false);

//   const [insertEmployee] = useInsertEmployeeMutation();
//   const handleCreateProduct = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         ...createProduct,
//         basic_salary: Number(createProduct.basic_salary),
//         incentive: Number(createProduct.incentive),
//         holiday_payment: Number(createProduct.holiday_payment),
//         total_salary: Number(createProduct.total_salary),
//         advance: Number(createProduct.advance),
//         late: Number(createProduct.late),
//         early_leave: Number(createProduct.early_leave),
//         absent: Number(createProduct.absent),
//         friday_absent: Number(createProduct.friday_absent),
//         unapproval_absent: Number(createProduct.unapproval_absent),
//         net_salary: Number(createProduct.net_salary),
//         name: createProduct.name || "",
//         employee_id: createProduct.employee_id || "",
//         note: createProduct.note || "",
//       };

//       const res = await insertEmployee(payload).unwrap();
//       if (res.success) {
//         toast.success("Successfully created product");
//         setIsModalOpen1(false);
//         setCreateProduct({
//           name: "",
//           purchase_price: "",
//           sale_price: "",
//         });
//         refetch?.();
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Create failed!");
//     }
//   };

//   const [updateEmployee] = useUpdateEmployeeMutation();
//   const handleUpdateProduct = async () => {
//     try {
//       const updatedProduct = {
//         basic_salary: Number(currentProduct.basic_salary),
//         incentive: Number(currentProduct.incentive),
//         holiday_payment: Number(currentProduct.holiday_payment),
//         total_salary: Number(currentProduct.total_salary),
//         advance: Number(currentProduct.advance),
//         late: Number(currentProduct.late),
//         early_leave: Number(currentProduct.early_leave),
//         absent: Number(currentProduct.absent),
//         friday_absent: Number(currentProduct.friday_absent),
//         unapproval_absent: Number(currentProduct.unapproval_absent),
//         net_salary: Number(currentProduct.net_salary),
//         name: currentProduct.name || "",
//         employee_id: currentProduct.employee_id || "",
//         note: currentProduct.note || "",
//       };

//       const res = await updateEmployee({
//         id: currentProduct.Id,
//         data: updatedProduct,
//       }).unwrap();

//       if (res.success) {
//         toast.success("Successfully updated product!");
//         setIsModalOpen(false);
//         refetch?.();
//       } else {
//         toast.error("Update failed!");
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Update failed!");
//     }
//   };

//   const [deleteEmployee] = useDeleteEmployeeMutation();
//   const handleDeleteProduct = async (id) => {
//     const confirmDelete = window.confirm("Do you want to delete this product?");
//     if (!confirmDelete) return toast.info("Delete action was cancelled.");

//     try {
//       const res = await deleteEmployee(id).unwrap();
//       if (res.success) {
//         toast.success("Product deleted successfully!");
//         refetch?.();
//       } else {
//         toast.error("Delete failed!");
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Delete failed!");
//     }
//   };

//   const clearFilters = () => {
//     setStartDate("");
//     setEndDate("");
//     setName("");
//   };

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

//   const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

//   const productOptions = productsData.map((p) => ({
//     value: p.name,
//     label: p.name,
//   }));

//   // const {
//   //   data: allSupplierRes,
//   //   isLoading: isLoadingSupplier,
//   //   isError: isErrorSupplier,
//   //   error: errorSupplier,
//   // } = useGetAllSupplierWithoutQueryQuery();

//   // const suppliers = allSupplierRes?.data || [];

//   // useEffect(() => {
//   //   if (isErrorSupplier) {
//   //     console.error("Error fetching products", errorSupplier);
//   //   }
//   // }, [isErrorSupplier, errorSupplier]);

//   // console.log("suppliers", suppliers);
//   return (
//     <motion.div
//       className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.2 }}
//     >
//       <div className="my-6 flex justify-start">
//         <button
//           className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-20 justify-center"
//           onClick={handleAddProduct}
//         >
//           Add <Plus size={18} className="ms-2" />
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-6 w-full justify-center mx-auto">
//         <div className="flex items-center justify-center">
//           <label className="mr-2 text-sm text-white">Start Date:</label>
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="border border-gray-300 rounded p-1 text-black bg-white"
//           />
//         </div>

//         <div className="flex items-center justify-center">
//           <label className="mr-2 text-sm text-white">End Date:</label>
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="border border-gray-300 rounded p-1 text-black bg-white"
//           />
//         </div>

//         <div className="flex items-center justify-center">
//           <Select
//             options={productOptions}
//             value={productOptions.find((o) => o.value === name) || null}
//             onChange={(selected) => setName(selected?.value || "")}
//             placeholder="Select Product"
//             isClearable
//             className="text-black w-full"
//           />
//         </div>

//         <button
//           className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-36 justify-center mx-auto"
//           onClick={clearFilters}
//         >
//           Clear Filters
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-700">
//           <thead>
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Product
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Supplier
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Purchase
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Sale
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-gray-700">
//             {products.map((product) => (
//               <motion.tr
//                 key={product.Id}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
//                   {product.name}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
//                   {product.supplier}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(product.purchase_price || 0).toFixed(2)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                   {Number(product.sale_price || 0).toFixed(2)}
//                 </td>

//                 {(role === "superAdmin" || role === "admin") && (
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <button
//                       onClick={() => handleEditClick(product)}
//                       className="text-indigo-600 hover:text-indigo-900"
//                     >
//                       <Edit size={18} />
//                     </button>
//                     <button
//                       onClick={() => handleDeleteProduct(product.Id)}
//                       className="text-red-600 hover:text-red-900 ms-4"
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   </td>
//                 )}
//               </motion.tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

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

//       {/* Edit Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <motion.div
//             className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="text-lg font-semibold text-white">Edit Product</h2>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Name:</label>
//               <input
//                 type="text"
//                 value={currentProduct.name}
//                 onChange={(e) =>
//                   setCurrentProduct({ ...currentProduct, name: e.target.value })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 required
//               />
//             </div>
//             {/* <div className="mt-4">
//                 <label className="block text-sm text-white">Supplier:</label>
//                 <select
//                   value={currentProduct.supplier || ""}
//                   onChange={(e) =>
//                     setCurrentProduct({
//                       ...currentProduct,
//                       supplier: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                   required
//                 >
//                   <option value="">Select Supplier</option>

//                   {isLoadingSupplier ? (
//                     <option disabled>Loading...</option>
//                   ) : (
//                     suppliers?.map((supplier) => (
//                       <option key={supplier.Id} value={supplier.name}>
//                         {supplier.name}
//                       </option>
//                     ))
//                   )}
//                 </select>
//               </div> */}
//             <div className="mt-4">
//               <label className="block text-sm text-white">Basic Salary:</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct.basic_salary}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     basic_salary: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 required
//               />
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Incentive:</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct.incentive}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     incentive: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 required
//               />
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">
//                 Holiday Payment:
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct.holiday_payment}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     holiday_payment: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 required
//               />
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Total Salary:</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct.total_salary}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     total_salary: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 required
//               />
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Advance:</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct.advance}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     advance: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 required
//               />
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Late:</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct.late}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     late: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 required
//               />
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Absent:</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct.absent}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     absent: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 required
//               />
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Friday Absent:</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct.friday_absent}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     friday_absent: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 required
//               />
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Early Leave:</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct.early_leave}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     early_leave: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 required
//               />
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">
//                 Unapproval Absent:
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct.unapproval_absent}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     unapproval_absent: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 required
//               />
//             </div>
//             <div className="mt-4">
//               <label className="block text-sm text-white">Net Salary:</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={currentProduct.net_salary}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     net_salary: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 required
//               />
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm text-white">Note:</label>
//               <textarea
//                 type="number"
//                 step="0.01"
//                 value={currentProduct.note}
//                 onChange={(e) =>
//                   setCurrentProduct({
//                     ...currentProduct,
//                     note: e.target.value,
//                   })
//                 }
//                 className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                 required
//               />
//             </div>

//             <div className="mt-6 flex justify-end">
//               <button
//                 type="submit"
//                 className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
//               >
//                 Save
//               </button>
//               <button
//                 type="button"
//                 className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
//                 onClick={handleModalClose1}
//               >
//                 Cancel
//               </button>
//             </div>

//             <div className="mt-6 flex justify-end">
//               <button
//                 className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
//                 onClick={handleUpdateProduct}
//               >
//                 Save
//               </button>
//               <button
//                 className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
//                 onClick={handleModalClose}
//               >
//                 Cancel
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}

//       {/* Add Modal */}
//       {isModalOpen1 && (
//         <div className="fixed inset-0 top-24 z-10 flex items-center justify-center bg-black bg-opacity-50">
//           <motion.div
//             className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-3/4 lg:w-3/4"
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="text-lg font-semibold text-white">Add Employee</h2>

//             <form
//               onSubmit={handleCreateProduct}
//               className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center mb-6 w-full justify-center mx-auto"
//             >
//               <div className="mt-4">
//                 <label className="block text-sm text-white">
//                   Employee Name:
//                 </label>
//                 <input
//                   type="text"
//                   value={createProduct.name}
//                   onChange={(e) =>
//                     setCreateProduct({ ...createProduct, name: e.target.value })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>
//               <div className="mt-4">
//                 <label className="block text-sm text-white">Employee Id:</label>
//                 <input
//                   type="number"
//                   value={createProduct.employee_id}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       employee_id: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               {/* <div className="mt-4">
//                 <label className="block text-sm text-white">Supplier:</label>
//                 <select
//                   value={createProduct.supplier || ""}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       supplier: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
//                   required
//                 >
//                   <option value="">Select Supplier</option>

//                   {isLoadingSupplier ? (
//                     <option disabled>Loading...</option>
//                   ) : (
//                     suppliers?.map((supplier) => (
//                       <option key={supplier.Id} value={supplier.name}>
//                         {supplier.name}
//                       </option>
//                     ))
//                   )}
//                 </select>
//               </div> */}
//               <div className="mt-4">
//                 <label className="block text-sm text-white">
//                   Basic Salary:
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createProduct.basic_salary}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       basic_salary: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">Incentive:</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createProduct.incentive}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       incentive: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">
//                   Holiday Payment:
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createProduct.holiday_payment}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       holiday_payment: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">
//                   Total Salary:
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createProduct.total_salary}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       total_salary: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">Advance:</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createProduct.advance}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       advance: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">Late:</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createProduct.late}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       late: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">Early Leave:</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createProduct.early_leave}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       early_leave: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">Absent:</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createProduct.absent}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       absent: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">
//                   Friday Absent:
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createProduct.friday_absent}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       friday_absent: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">
//                   Unapproval Absent:
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createProduct.unapproval_absent}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       unapproval_absent: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>
//               <div className="mt-4">
//                 <label className="block text-sm text-white">Net Salary:</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={createProduct.net_salary}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       net_salary: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm text-white">Note:</label>
//                 <textarea
//                   type="number"
//                   step="0.01"
//                   value={createProduct.note}
//                   onChange={(e) =>
//                     setCreateProduct({
//                       ...createProduct,
//                       note: e.target.value,
//                     })
//                   }
//                   className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
//                   required
//                 />
//               </div>

//               <div className="mt-6 flex justify-end">
//                 <button
//                   type="submit"
//                   className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
//                 >
//                   Save
//                 </button>
//                 <button
//                   type="button"
//                   className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
//                   onClick={handleModalClose1}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </motion.div>
//         </div>
//       )}
//     </motion.div>
//   );
// };

// export default EmployeeTable;

import { motion } from "framer-motion";
import { Edit, Plus, Trash2, FileText } from "lucide-react";
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
    holiday_payment: "", // holiday days count
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
  // Fine meta (IMPORTANT FIX)
  // ----------------------------
  // ✅ fine অবশ্যই object হবে, না হলে fine.late undefined হবে
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
      // ✅ তোমার API shape অনুযায়ী adjust:
      // যদি fineData.data = {late:..., absent:...} -> সরাসরি বসবে
      // যদি array আসে -> প্রথমটা নাও
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

    // ✅ cut amount (BDT) - fine values should be BDT (or points) per incident/day
    const lateCut = late * (Number(fine.late) || 0);
    const earlyLeaveCut = early_leave * (Number(fine.early_leave) || 0);
    const absentCut = absent * (Number(fine.absent) || 0);
    const fridayAbsentCut = friday_absent * (Number(fine.friday_absent) || 0);
    const unapprovalAbsentCut =
      unapproval_absent * (Number(fine.unapproval_absent) || 0);

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

  // filter change হলে page 1
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

  // This is your "Delete modal save" (actually update note/status)
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

        // ✅ FIX: remove oklch from cloned DOM
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
    // employeesAll না থাকলে employees থেকে fallback
    const all =
      Array.isArray(employeesAll) && employeesAll.length
        ? employeesAll
        : employees;
    const map = new Map((all || []).map((e) => [e.Id, e]));
    return selectedIds.map((id) => map.get(id)).filter(Boolean);
  }, [selectedIds, employeesAll, employees]);

  // ----------------------------
  // Bulk invoice PDF (multi invoice in one PDF)
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

  // ✅ Bulk print (direct print)
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

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="my-6 flex flex-wrap gap-3 items-center justify-start">
        <button
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-28 justify-center"
          onClick={openAddModal}
        >
          Add <Plus size={18} className="ms-2" />
        </button>

        {/* ✅ Bulk actions */}
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded disabled:opacity-60"
          onClick={() => setIsBulkInvoiceOpen(true)}
          disabled={selectedIds.length === 0}
        >
          Print Selected ({selectedIds.length})
        </button>

        <button
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded disabled:opacity-60"
          onClick={() => setSelectedIds([])}
          disabled={selectedIds.length === 0}
        >
          Clear Selection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center mb-6 w-full justify-center mx-auto">
        <div className="flex flex-col">
          <label className="text-sm text-gray-400 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-100"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-400 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-100"
          />
        </div>

        <div className="flex items-center justify-center mt-6">
          <Select
            options={employeeOptions}
            value={employeeOptions.find((o) => o.value === name) || null}
            onChange={(selected) => setName(selected?.value || "")}
            placeholder="Select Employee"
            isClearable
            className="text-black w-full"
          />
        </div>

        {/* ✅ Per page dropdown */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-400 mb-1">Per Page</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
              setStartPage(1);
            }}
            className="px-3 py-[10px] rounded-lg bg-gray-900 border border-gray-700 text-gray-100"
          >
            <option value={1}>1</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <button
          className="flex items-center mt-6 bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-36 justify-center mx-auto"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              {/* ✅ select all on this page */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={isAllSelectedOnPage}
                  onChange={toggleSelectAllOnPage}
                />
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Employee ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Basic Salary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Incentive
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Holiday Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Advance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Late (Days)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Early (Days)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Absent (Days)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Friday Absent (Days)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Unapproval Absent (Days)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total Salary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Net Salary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Note
              </th>

              {(role === "superAdmin" || role === "admin") && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {(employees || []).map((emp) => (
              <motion.tr
                key={emp.Id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* ✅ row checkbox */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(emp.Id)}
                    onChange={() => toggleSelect(emp.Id)}
                  />
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {emp.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {emp.employee_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(emp.basic_salary || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(emp.incentive || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(emp.holiday_payment || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(emp.advance || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(emp.late || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(emp.early_leave || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(emp.absent || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(emp.friday_absent || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(emp.unapproval_absent || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(emp.total_salary || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Number(emp.net_salary || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {emp.note}
                </td>

                {(role === "superAdmin" || role === "admin") && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openInvoice(emp)}
                      className="text-green-500 hover:text-green-300"
                      title="Invoice"
                    >
                      <FileText size={18} />
                    </button>

                    <button
                      onClick={() => handleEditClick(emp)}
                      className="text-indigo-600 hover:text-indigo-900 ms-4"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>

                    {role === "superAdmin" ||
                    role === "admin" ||
                    emp.status === "Approved" ? (
                      <button
                        onClick={() => handleDeleteEmployee(emp.Id)}
                        className="text-red-600 hover:text-red-900 ms-4"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditClick1(emp)}
                        className="text-red-600 hover:text-red-900 ms-4"
                        title="Delete Request / Note"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2 mt-6">
        <button
          onClick={handlePreviousSet}
          disabled={startPage === 1}
          className="px-3 py-2 text-white bg-indigo-600 rounded-md disabled:bg-gray-400"
        >
          Prev
        </button>

        {[...Array(endPage - startPage + 1)].map((_, index) => {
          const pageNum = startPage + index;
          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-2 text-black rounded-md ${
                pageNum === currentPage
                  ? "bg-white"
                  : "bg-indigo-500 hover:bg-indigo-400"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={handleNextSet}
          disabled={endPage === totalPages}
          className="px-3 py-2 text-white bg-indigo-600 rounded-md disabled:bg-gray-400"
        >
          Next
        </button>
      </div>

      {/* -------------------- Edit Modal -------------------- */}
      {isEditModalOpen && currentEmployee && (
        <div className="fixed top-36 inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-3/4 lg:w-2/3"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white">
              Edit Employee Salary Calculation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div>
                <label className="block text-sm text-white">
                  Employee Name:
                </label>
                <input
                  type="text"
                  value={currentEmployee.name}
                  onChange={(e) =>
                    setCurrentEmployee({
                      ...currentEmployee,
                      name: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-white">Employee Id:</label>
                <input
                  type="number"
                  value={currentEmployee.employee_id}
                  onChange={(e) =>
                    setCurrentEmployee({
                      ...currentEmployee,
                      employee_id: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-white">
                  Basic Salary:
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentEmployee.basic_salary}
                  onChange={(e) =>
                    updateCurrentField("basic_salary", e.target.value)
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">Incentive:</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentEmployee.incentive}
                  onChange={(e) =>
                    updateCurrentField("incentive", e.target.value)
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">
                  Holiday Days:
                </label>
                <input
                  type="number"
                  value={currentEmployee.holiday_payment}
                  onChange={(e) =>
                    updateCurrentField("holiday_payment", e.target.value)
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">Advance:</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentEmployee.advance}
                  onChange={(e) =>
                    updateCurrentField("advance", e.target.value)
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">Late (days):</label>
                <input
                  type="number"
                  value={currentEmployee.late}
                  onChange={(e) => updateCurrentField("late", e.target.value)}
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">
                  Early Leave (days):
                </label>
                <input
                  type="number"
                  value={currentEmployee.early_leave}
                  onChange={(e) =>
                    updateCurrentField("early_leave", e.target.value)
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">
                  Absent (days):
                </label>
                <input
                  type="number"
                  value={currentEmployee.absent}
                  onChange={(e) => updateCurrentField("absent", e.target.value)}
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">
                  Friday Absent (days):
                </label>
                <input
                  type="number"
                  value={currentEmployee.friday_absent}
                  onChange={(e) =>
                    updateCurrentField("friday_absent", e.target.value)
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">
                  Unapproval Absent (days):
                </label>
                <input
                  type="number"
                  value={currentEmployee.unapproval_absent}
                  onChange={(e) =>
                    updateCurrentField("unapproval_absent", e.target.value)
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">
                  Total Salary:
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentEmployee.total_salary}
                  readOnly
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent opacity-80"
                />
              </div>

              <div>
                <label className="block text-sm text-white">Net Salary:</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentEmployee.net_salary}
                  readOnly
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent opacity-80"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm text-white">Remarks:</label>
                <textarea
                  value={currentEmployee.remarks}
                  onChange={(e) =>
                    setCurrentEmployee({
                      ...currentEmployee,
                      remarks: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                  rows={3}
                />
              </div>

              {role === "superAdmin" ? (
                <div className="mt-4 ">
                  <label className="block text-sm text-white">Status</label>
                  <select
                    value={currentEmployee.status || ""}
                    onChange={(e) =>
                      setCurrentEmployee({
                        ...currentEmployee,
                        status: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              ) : (
                <div className="mt-4 md:col-span-3">
                  <label className="block text-sm text-white">Note:</label>
                  <textarea
                    value={currentEmployee?.note || ""}
                    onChange={(e) =>
                      setCurrentEmployee({
                        ...currentEmployee,
                        note: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
                onClick={handleUpdateEmployee}
              >
                Save
              </button>
              <button
                type="button"
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-3/4 lg:w-2/3"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white">
              Delete Employee
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              {role === "superAdmin" ? (
                <div className="mt-4">
                  <label className="block text-sm text-white">Status</label>
                  <select
                    value={currentEmployee.status || ""}
                    onChange={(e) =>
                      setCurrentEmployee({
                        ...currentEmployee,
                        status: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              ) : (
                <div className="mt-4 md:col-span-3">
                  <label className="block text-sm text-white">Note:</label>
                  <textarea
                    value={currentEmployee?.note || ""}
                    onChange={(e) =>
                      setCurrentEmployee({
                        ...currentEmployee,
                        note: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
                onClick={handleUpdateEmployee1}
              >
                Save
              </button>
              <button
                type="button"
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
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
        <div className="fixed inset-0 top-36 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-3/4 lg:w-3/4"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white">
              Employee Salary Calculation
            </h2>

            <form
              onSubmit={handleCreateEmployee}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4"
            >
              <div>
                <label className="block text-sm text-white">
                  Employee Name:
                </label>
                <input
                  type="text"
                  value={createEmployee.name}
                  onChange={(e) =>
                    setCreateEmployee({
                      ...createEmployee,
                      name: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-white">Employee Id:</label>
                <input
                  type="number"
                  value={createEmployee.employee_id}
                  onChange={(e) =>
                    setCreateEmployee({
                      ...createEmployee,
                      employee_id: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-white">
                  Basic Salary:
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={createEmployee.basic_salary}
                  onChange={(e) =>
                    updateCreateField("basic_salary", e.target.value)
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">Incentive:</label>
                <input
                  type="number"
                  step="0.01"
                  value={createEmployee.incentive}
                  onChange={(e) =>
                    updateCreateField("incentive", e.target.value)
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">
                  Holiday Days:
                </label>
                <input
                  type="number"
                  value={createEmployee.holiday_payment}
                  onChange={(e) =>
                    updateCreateField("holiday_payment", e.target.value)
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">Advance:</label>
                <input
                  type="number"
                  step="0.01"
                  value={createEmployee.advance}
                  onChange={(e) => updateCreateField("advance", e.target.value)}
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">Late (days):</label>
                <input
                  type="number"
                  value={createEmployee.late}
                  onChange={(e) => updateCreateField("late", e.target.value)}
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">
                  Early Leave (days):
                </label>
                <input
                  type="number"
                  value={createEmployee.early_leave}
                  onChange={(e) =>
                    updateCreateField("early_leave", e.target.value)
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">
                  Absent (days):
                </label>
                <input
                  type="number"
                  value={createEmployee.absent}
                  onChange={(e) => updateCreateField("absent", e.target.value)}
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">
                  Friday Absent (days):
                </label>
                <input
                  type="number"
                  value={createEmployee.friday_absent}
                  onChange={(e) =>
                    updateCreateField("friday_absent", e.target.value)
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">
                  Unapproval Absent (days):
                </label>
                <input
                  type="number"
                  value={createEmployee.unapproval_absent}
                  onChange={(e) =>
                    updateCreateField("unapproval_absent", e.target.value)
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-white">
                  Total Salary:
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={createEmployee.total_salary}
                  readOnly
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent opacity-80"
                />
              </div>

              <div>
                <label className="block text-sm text-white">Net Salary:</label>
                <input
                  type="number"
                  step="0.01"
                  value={createEmployee.net_salary}
                  readOnly
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent opacity-80"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm text-white">Remarks:</label>
                <textarea
                  value={createEmployee.remarks}
                  onChange={(e) =>
                    setCreateEmployee({
                      ...createEmployee,
                      remarks: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white bg-transparent"
                  rows={3}
                />
              </div>

              <div className="md:col-span-3 mt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
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
        <div className="fixed top-52 inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <motion.div
            className="bg-gray-900 rounded-lg p-4 shadow-lg w-full max-w-3xl border border-gray-700"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold text-lg">
                Salary Invoice
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={downloadInvoicePDF}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
                >
                  Download PDF
                </button>

                <button
                  onClick={closeInvoice}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>

            <div
              id="invoiceCapture"
              ref={invoiceRef}
              className="bg-white text-black rounded p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">Holy Gift</h3>
                  <p className="text-sm">Address line</p>
                  <p className="text-sm">Phone: +880 9647-555333</p>
                </div>

                <div className="text-right">
                  <h3 className="text-xl font-bold">INVOICE</h3>
                  <p className="text-sm">
                    Date: {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    Invoice No: {invoiceEmployee.employee_id}-
                    {String(Date.now()).slice(-6)}
                  </p>
                </div>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between gap-3 text-sm">
                <p>
                  <b>Employee:</b> {invoiceEmployee.name}
                </p>
                <p>
                  <b>Employee ID:</b> {invoiceEmployee.employee_id}
                </p>
              </div>

              <hr className="my-4" />

              <table className="w-full text-sm border border-gray-300">
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-semibold">Basic Salary</td>
                    <td className="p-2 text-right">
                      {Number(invoiceEmployee.basic_salary || 0).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-semibold">Incentive</td>
                    <td className="p-2 text-right">
                      {Number(invoiceEmployee.incentive || 0).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-semibold">Holiday Days</td>
                    <td className="p-2 text-right">
                      {Number(invoiceEmployee.holiday_payment || 0)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-semibold">Advance</td>
                    <td className="p-2 text-right">
                      -{Number(invoiceEmployee.advance || 0).toFixed(2)}
                    </td>
                  </tr>

                  <tr className="border-b">
                    <td className="p-2 font-semibold">Late (days)</td>
                    <td className="p-2 text-right">
                      {Number(invoiceEmployee.late || 0)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-semibold">Early Leave (days)</td>
                    <td className="p-2 text-right">
                      {Number(invoiceEmployee.early_leave || 0)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-semibold">Absent (days)</td>
                    <td className="p-2 text-right">
                      {Number(invoiceEmployee.absent || 0)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-semibold">Friday Absent (days)</td>
                    <td className="p-2 text-right">
                      {Number(invoiceEmployee.friday_absent || 0)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-semibold">
                      Unapproval Absent (days)
                    </td>
                    <td className="p-2 text-right">
                      {Number(invoiceEmployee.unapproval_absent || 0)}
                    </td>
                  </tr>

                  <tr className="border-b">
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

              <p className="text-xs mt-4 text-gray-600">
                <span className="font-bold">Note: </span>
                {invoiceEmployee.note}
              </p>

              <div className="mt-10 grid grid-cols-2 gap-10 text-sm">
                <div className="border-t border-gray-400 pt-2 text-center">
                  Employee Signature
                </div>
                <div className="border-t border-gray-400 pt-2 text-center">
                  Authorized Signature
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* -------------------- Bulk Invoice Modal -------------------- */}
      {isBulkInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <motion.div
            className="bg-gray-900 rounded-lg p-4 shadow-lg w-full max-w-5xl border border-gray-700"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between mb-3 md:mt-20 lg:mt-28">
              <h2 className="text-white font-semibold text-lg">
                Selected Invoices ({selectedEmployees.length})
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={printBulkInvoices}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded disabled:opacity-60"
                  disabled={selectedEmployees.length === 0}
                >
                  Print
                </button>

                <button
                  onClick={downloadBulkInvoicePDF}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded disabled:opacity-60"
                  disabled={selectedEmployees.length === 0}
                >
                  Download PDF
                </button>

                <button
                  onClick={() => setIsBulkInvoiceOpen(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded max-h-[75vh] overflow-auto">
              <div ref={bulkInvoiceRef}>
                {selectedEmployees.map((emp) => (
                  <div
                    key={emp.Id}
                    className="invoice-page bg-white text-black rounded p-6 mb-6 border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">Holy Gift</h3>
                        <p className="text-sm">Address line</p>
                        <p className="text-sm">Phone: +880 9647-555333</p>
                      </div>

                      <div className="text-right">
                        <h3 className="text-xl font-bold">INVOICE</h3>
                        <p className="text-sm">
                          Date: {new Date().toLocaleDateString()}
                        </p>
                        <p className="text-sm">
                          Invoice No: {emp.employee_id}-
                          {String(Date.now()).slice(-6)}
                        </p>
                      </div>
                    </div>

                    <hr className="my-4" />

                    <div className="flex justify-between gap-3 text-sm">
                      <p>
                        <b>Employee:</b> {emp.name}
                      </p>
                      <p>
                        <b>Employee ID:</b> {emp.employee_id}
                      </p>
                    </div>

                    <hr className="my-4" />

                    <table className="w-full text-sm border border-gray-300">
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 font-semibold">Basic Salary</td>
                          <td className="p-2 text-right">
                            {Number(emp.basic_salary || 0).toFixed(2)}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-semibold">Incentive</td>
                          <td className="p-2 text-right">
                            {Number(emp.incentive || 0).toFixed(2)}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-semibold">Holiday Days</td>
                          <td className="p-2 text-right">
                            {Number(emp.holiday_payment || 0)}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-semibold">Advance</td>
                          <td className="p-2 text-right">
                            -{Number(emp.advance || 0).toFixed(2)}
                          </td>
                        </tr>

                        <tr className="border-b">
                          <td className="p-2 font-semibold">Late (days)</td>
                          <td className="p-2 text-right">
                            {Number(emp.late || 0)}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-semibold">
                            Early Leave (days)
                          </td>
                          <td className="p-2 text-right">
                            {Number(emp.early_leave || 0)}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-semibold">Absent (days)</td>
                          <td className="p-2 text-right">
                            {Number(emp.absent || 0)}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-semibold">
                            Friday Absent (days)
                          </td>
                          <td className="p-2 text-right">
                            {Number(emp.friday_absent || 0)}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-semibold">
                            Unapproval Absent (days)
                          </td>
                          <td className="p-2 text-right">
                            {Number(emp.unapproval_absent || 0)}
                          </td>
                        </tr>

                        <tr className="border-b">
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

                    <p className="text-xs mt-4 text-gray-600">
                      <span className="font-bold">Note: </span>
                      {emp.note || ""}
                    </p>

                    <div className="mt-10 grid grid-cols-2 gap-10 text-sm">
                      <div className="border-t border-gray-400 pt-2 text-center">
                        Employee Signature
                      </div>
                      <div className="border-t border-gray-400 pt-2 text-center">
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

export default EmployeeTable;

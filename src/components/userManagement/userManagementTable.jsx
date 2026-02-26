// /* eslint-disable no-mixed-spaces-and-tabs */
// import { motion } from "framer-motion";
// import { useEffect, useMemo, useState } from "react";
// import { Pencil, Plus, Search, Trash2, User } from "lucide-react";
// import toast from "react-hot-toast";
// import {
//   useGetAllUserQuery,
//   useUserDeleteMutation,
//   useUserRegisterMutation,
//   useUserUpdateMutation,
// } from "../../features/auth/auth";

// const API_BASE = " https://apikafela.digitalever.com.bd";

// const UserManagementTable = () => {
//   // Modals
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [isAddOpen, setIsAddOpen] = useState(false);

//   // Search
//   const [searchTerm, setSearchTerm] = useState("");

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const [startPage, setStartPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [pagesPerSet, setPagesPerSet] = useState(10);
//   const itemsPerPage = 10;

//   // Edit user
//   const [currentUser, setCurrentUser] = useState(null);
//   const [editPassword, setEditPassword] = useState(""); // new password only (don't show hashed)
//   const [editImageFile, setEditImageFile] = useState(null);
//   const [editPreviewUrl, setEditPreviewUrl] = useState("");

//   // Create user
//   const [createUser, setCreateUser] = useState({
//     FirstName: "",
//     LastName: "",
//     Email: "",
//     Password: "",
//     Phone: "",
//     role: "",
//   });
//   const [createImageFile, setCreateImageFile] = useState(null);
//   const [createPreviewUrl, setCreatePreviewUrl] = useState("");

//   // Responsive pagination set
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

//   // Fetch users
//   const { data, isLoading, isError, error, refetch } = useGetAllUserQuery({
//     page: currentPage,
//     limit: itemsPerPage,
//     searchTerm: searchTerm || undefined,
//   });

//   const users = useMemo(() => data?.data ?? [], [data]);

//   useEffect(() => {
//     if (isError) {
//       console.error("Error fetching user data", error);
//       toast.error("User load failed!");
//       return;
//     }
//     if (!isLoading && data?.meta?.count != null) {
//       setTotalPages(Math.max(1, Math.ceil(data.meta.total / itemsPerPage)));
//     }
//   }, [data, isLoading, isError, error]);

//   // Cleanup preview URLs
//   useEffect(() => {
//     return () => {
//       if (createPreviewUrl) URL.revokeObjectURL(createPreviewUrl);
//       if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Helpers
//   const closeAdd = () => {
//     setIsAddOpen(false);
//     setCreateUser({
//       FirstName: "",
//       LastName: "",
//       Email: "",
//       Password: "",
//       Phone: "",
//       role: "",
//     });
//     setCreateImageFile(null);
//     if (createPreviewUrl) URL.revokeObjectURL(createPreviewUrl);
//     setCreatePreviewUrl("");
//   };

//   const closeEdit = () => {
//     setIsEditOpen(false);
//     setCurrentUser(null);
//     setEditPassword("");
//     setEditImageFile(null);
//     if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
//     setEditPreviewUrl("");
//   };

//   const handleAdd = () => {
//     setCreateUser({
//       FirstName: "",
//       LastName: "",
//       Email: "",
//       Password: "",
//       Phone: "",
//       role: "",
//     });
//     setCreateImageFile(null);
//     if (createPreviewUrl) URL.revokeObjectURL(createPreviewUrl);
//     setCreatePreviewUrl("");
//     setIsAddOpen(true);
//   };

//   const handleEdit = (u) => {
//     setCurrentUser({ ...u });
//     setEditPassword("");
//     setEditImageFile(null);
//     if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
//     setEditPreviewUrl("");
//     setIsEditOpen(true);
//   };

//   const handleCreateImageChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setCreateImageFile(file);
//     if (createPreviewUrl) URL.revokeObjectURL(createPreviewUrl);
//     setCreatePreviewUrl(URL.createObjectURL(file));
//   };

//   const handleEditImageChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setEditImageFile(file);
//     if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
//     setEditPreviewUrl(URL.createObjectURL(file));
//   };

//   // Create
//   const [userRegister, { isLoading: creating }] = useUserRegisterMutation();

//   const handleCreate = async (e) => {
//     e.preventDefault();

//     if (!createUser.Email || !createUser.Password || !createUser.role) {
//       toast.error("Email, Password এবং Role বাধ্যতামূলক!");
//       return;
//     }

//     try {
//       const form = new FormData();
//       form.append("FirstName", createUser.FirstName || "");
//       form.append("LastName", createUser.LastName || "");
//       form.append("Email", createUser.Email || "");
//       form.append("Password", createUser.Password || "");
//       form.append("Phone", createUser.Phone || "");
//       form.append("role", createUser.role || "");

//       if (createImageFile) form.append("image", createImageFile);

//       const res = await userRegister(form).unwrap();

//       if (res?.success) {
//         toast.success("User created successfully!");
//         closeAdd();
//         refetch?.();
//       } else {
//         toast.error(res?.message || "Create failed!");
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Create failed!");
//     }
//   };

//   // Update
//   const [userUpdate, { isLoading: updating }] = useUserUpdateMutation();

//   const handleUpdate = async () => {
//     if (!currentUser?.Id) return toast.error("Invalid user selected!");
//     if (!currentUser.Email || !currentUser.role) {
//       toast.error("Email এবং Role বাধ্যতামূলক!");
//       return;
//     }

//     try {
//       const form = new FormData();
//       form.append("FirstName", currentUser.FirstName || "");
//       form.append("LastName", currentUser.LastName || "");
//       form.append("Email", currentUser.Email || "");
//       form.append("Phone", currentUser.Phone || "");
//       form.append("role", currentUser.role || "");

//       // Only send password if user typed a new one
//       if (editPassword?.trim()) form.append("Password", editPassword.trim());

//       // Only send image if selected
//       if (editImageFile) form.append("image", editImageFile);

//       const res = await userUpdate({ id: currentUser.Id, data: form }).unwrap();

//       if (res?.success) {
//         toast.success("User updated successfully!");
//         closeEdit();
//         refetch?.();
//       } else {
//         toast.error(res?.message || "Update failed!");
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Update failed!");
//     }
//   };

//   // Delete
//   const [userDelete] = useUserDeleteMutation();

//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm("Do you want to delete this user?");
//     if (!confirmDelete) return;

//     try {
//       const res = await userDelete(id).unwrap();
//       if (res?.success) {
//         toast.success("User deleted successfully!");
//         refetch?.();
//       } else {
//         toast.error(res?.message || "Delete failed!");
//       }
//     } catch (err) {
//       toast.error(err?.data?.message || "Delete failed!");
//     }
//   };

//   // Pagination calc
//   const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     if (pageNumber < startPage) setStartPage(pageNumber);
//     else if (pageNumber > endPage) setStartPage(pageNumber - pagesPerSet + 1);
//   };

//   const handlePreviousSet = () =>
//     setStartPage((p) => Math.max(p - pagesPerSet, 1));

//   const handleNextSet = () =>
//     setStartPage((p) =>
//       Math.min(p + pagesPerSet, Math.max(1, totalPages - pagesPerSet + 1)),
//     );

//   return (
//     <motion.div
//       className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.15 }}
//     >
//       {/* Top bar */}
//       <div className="flex items-center justify-between gap-4">
//         {/* Search */}
//         <div className="relative w-full max-w-[520px]">
//           <input
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setCurrentPage(1);
//               setStartPage(1);
//             }}
//             placeholder="Search by email / phone / name..."
//             className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-700 outline-none focus:border-gray-300"
//           />
//           <Search
//             className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
//             size={18}
//           />
//         </div>

//         {/* Add button */}
//         <button
//           onClick={handleAdd}
//           type="button"
//           className="inline-flex h-11 px-5 items-center justify-center gap-2 rounded bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
//         >
//           <Plus size={18} />
//           Add New User
//         </button>
//       </div>

//       {/* List */}
//       <div className="mt-10">
//         {isLoading && <div className="text-gray-300">Loading...</div>}

//         {!isLoading &&
//           users.map((item) => {
//             const img = item?.image ? `${API_BASE}/${item.image}` : null;

//             return (
//               <div
//                 key={item.Id}
//                 className="flex items-center justify-between border-b border-gray-700 py-5"
//               >
//                 {/* Left */}
//                 <div className="flex items-center gap-5">
//                   <div className="h-11 w-11 rounded-full overflow-hidden bg-indigo-900/30 flex items-center justify-center border border-gray-700">
//                     {img ? (
//                       <img
//                         src={img}
//                         alt="avatar"
//                         className="h-full w-full object-cover"
//                       />
//                     ) : (
//                       <User className="text-indigo-300" size={18} />
//                     )}
//                   </div>

//                   <div>
//                     <div className="text-[16px] font-semibold text-white">
//                       {(item.FirstName || "-") + " " + (item.LastName || "")}
//                     </div>
//                     <div className="mt-1 text-sm text-gray-300">
//                       {item.Email}
//                     </div>
//                     <div className="mt-1 text-xs text-gray-400">
//                       Role: {item.role || "-"} •{" "}
//                       {item.date
//                         ? new Date(item.date).toLocaleDateString()
//                         : "-"}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right */}
//                 <div className="flex items-center gap-3 pr-2">
//                   <button
//                     onClick={() => handleEdit(item)}
//                     type="button"
//                     className="inline-flex h-9 w-9 items-center justify-center rounded hover:bg-white/10"
//                     title="Edit"
//                   >
//                     <Pencil className="text-indigo-300" size={18} />
//                   </button>

//                   <button
//                     onClick={() => handleDelete(item.Id)}
//                     type="button"
//                     className="inline-flex h-9 w-9 items-center justify-center rounded hover:bg-white/10"
//                     title="Delete"
//                   >
//                     <Trash2 className="text-red-400" size={18} />
//                   </button>
//                 </div>
//               </div>
//             );
//           })}

//         {!isLoading && users.length === 0 && (
//           <div className="py-10 text-sm text-gray-300">No user found</div>
//         )}
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center justify-center space-x-2 mt-6">
//         <button
//           onClick={handlePreviousSet}
//           disabled={startPage === 1}
//           className="px-3 py-2 text-white bg-indigo-600 rounded-md disabled:bg-gray-500"
//         >
//           Prev
//         </button>

//         {[...Array(endPage - startPage + 1)].map((_, index) => {
//           const pageNum = startPage + index;
//           return (
//             <button
//               key={pageNum}
//               onClick={() => handlePageChange(pageNum)}
//               className={`px-3 py-2 text-white rounded-md ${
//                 pageNum === currentPage
//                   ? "bg-indigo-600"
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
//           className="px-3 py-2 text-white bg-indigo-600 rounded-md disabled:bg-gray-500"
//         >
//           Next
//         </button>
//       </div>

//       {/* Edit Modal */}
//       {isEditOpen && currentUser && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
//           <motion.div
//             className="bg-gray-900 rounded-xl p-6 shadow-lg w-full max-w-2xl border border-gray-700"
//             initial={{ opacity: 0, y: -30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.25 }}
//           >
//             <h2 className="text-lg font-semibold text-white">Update User</h2>

//             <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Input
//                 label="First Name"
//                 value={currentUser?.FirstName || ""}
//                 onChange={(v) =>
//                   setCurrentUser((p) => ({ ...p, FirstName: v }))
//                 }
//               />
//               <Input
//                 label="Last Name"
//                 value={currentUser?.LastName || ""}
//                 onChange={(v) => setCurrentUser((p) => ({ ...p, LastName: v }))}
//               />
//               <Input
//                 label="Email"
//                 value={currentUser?.Email || ""}
//                 onChange={(v) => setCurrentUser((p) => ({ ...p, Email: v }))}
//               />
//               <Input
//                 label="Phone"
//                 value={currentUser?.Phone || ""}
//                 onChange={(v) => setCurrentUser((p) => ({ ...p, Phone: v }))}
//               />

//               {/* New password only */}
//               <Input
//                 label="New Password (optional)"
//                 type="password"
//                 value={editPassword}
//                 onChange={(v) => setEditPassword(v)}
//               />

//               <div>
//                 <label className="block text-sm text-white">Role</label>
//                 <select
//                   value={currentUser?.role || ""}
//                   onChange={(e) =>
//                     setCurrentUser((p) => ({ ...p, role: e.target.value }))
//                   }
//                   className="border border-gray-700 rounded p-2 w-full mt-1 text-black bg-white"
//                   required
//                 >
//                   <option value="">Select Role</option>
//                   <option value="superAdmin">Super Admin</option>
//                   <option value="admin">Admin</option>
//                   <option value="marketer">Marketer</option>
//                   <option value="leader">Leader</option>
//                   <option value="inventor">Inventor</option>
//                   <option value="accountant">Accountant</option>
//                   <option value="staff">Staff</option>
//                   <option value="user">User</option>
//                 </select>
//               </div>

//               {/* Image upload */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm text-white">
//                   Profile Image
//                 </label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleEditImageChange}
//                   className="border border-gray-700 rounded p-2 w-full mt-1 text-white bg-gray-800"
//                 />

//                 <div className="mt-3 flex items-center gap-3">
//                   <div className="h-16 w-16 rounded-full overflow-hidden border border-gray-700 bg-gray-800 flex items-center justify-center">
//                     {editPreviewUrl ? (
//                       <img
//                         src={editPreviewUrl}
//                         alt="preview"
//                         className="h-full w-full object-cover"
//                       />
//                     ) : currentUser?.image ? (
//                       <img
//                         src={`${API_BASE}/${currentUser.image}`}
//                         alt="current"
//                         className="h-full w-full object-cover"
//                       />
//                     ) : (
//                       <User className="text-gray-400" size={18} />
//                     )}
//                   </div>
//                   <p className="text-xs text-gray-300">
//                     নতুন ছবি সিলেক্ট করলে পুরোনোটা replace হবে।
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-6 flex justify-end gap-2">
//               <button
//                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded disabled:opacity-60"
//                 onClick={handleUpdate}
//                 disabled={updating}
//               >
//                 {updating ? "Saving..." : "Save"}
//               </button>
//               <button
//                 className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
//                 onClick={closeEdit}
//               >
//                 Cancel
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}

//       {/* Add Modal */}
//       {isAddOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
//           <motion.div
//             className="bg-gray-900 rounded-xl p-6 shadow-lg w-full max-w-2xl border border-gray-700"
//             initial={{ opacity: 0, y: -30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.25 }}
//           >
//             <h2 className="text-lg font-semibold text-white">Add New User</h2>

//             <form onSubmit={handleCreate} className="mt-4 space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Input
//                   label="First Name"
//                   value={createUser.FirstName}
//                   onChange={(v) =>
//                     setCreateUser((p) => ({ ...p, FirstName: v }))
//                   }
//                 />
//                 <Input
//                   label="Last Name"
//                   value={createUser.LastName}
//                   onChange={(v) =>
//                     setCreateUser((p) => ({ ...p, LastName: v }))
//                   }
//                 />
//                 <Input
//                   label="Email *"
//                   value={createUser.Email}
//                   onChange={(v) => setCreateUser((p) => ({ ...p, Email: v }))}
//                 />
//                 <Input
//                   label="Password *"
//                   type="password"
//                   value={createUser.Password}
//                   onChange={(v) =>
//                     setCreateUser((p) => ({ ...p, Password: v }))
//                   }
//                 />
//                 <Input
//                   label="Phone"
//                   value={createUser.Phone}
//                   onChange={(v) => setCreateUser((p) => ({ ...p, Phone: v }))}
//                 />

//                 <div>
//                   <label className="block text-sm text-white">Role *</label>
//                   <select
//                     value={createUser.role}
//                     onChange={(e) =>
//                       setCreateUser((p) => ({ ...p, role: e.target.value }))
//                     }
//                     className="border border-gray-700 rounded p-2 w-full mt-1 text-black bg-white"
//                     required
//                   >
//                     <option value="">Select Role</option>
//                     <option value="superAdmin">Super Admin</option>
//                     <option value="admin">Admin</option>
//                     <option value="marketer">Marketer</option>
//                     <option value="leader">Leader</option>
//                     <option value="inventor">Inventor</option>
//                     <option value="accountant">Accountant</option>
//                     <option value="staff">Staff</option>
//                     <option value="user">User</option>
//                   </select>
//                 </div>

//                 {/* Image upload */}
//                 <div className="md:col-span-2">
//                   <label className="block text-sm text-white">
//                     Profile Image
//                   </label>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleCreateImageChange}
//                     className="border border-gray-700 rounded p-2 w-full mt-1 text-white bg-gray-800"
//                   />

//                   {createPreviewUrl && (
//                     <div className="mt-3 flex items-center gap-3">
//                       <img
//                         src={createPreviewUrl}
//                         alt="preview"
//                         className="h-16 w-16 rounded-full object-cover border border-gray-700"
//                       />
//                       <p className="text-xs text-gray-300">Preview</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="mt-6 flex justify-end gap-2">
//                 <button
//                   type="submit"
//                   className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded disabled:opacity-60"
//                   disabled={creating}
//                 >
//                   {creating ? "Creating..." : "Save"}
//                 </button>
//                 <button
//                   type="button"
//                   className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
//                   onClick={closeAdd}
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

// const Input = ({ label, value, onChange, type = "text" }) => (
//   <div>
//     <label className="block text-sm text-white">{label}</label>
//     <input
//       type={type}
//       value={value || ""}
//       onChange={(e) => onChange(e.target.value)}
//       className="border border-gray-700 rounded p-2 w-full mt-1 text-white bg-gray-800 outline-none focus:border-indigo-500"
//     />
//   </div>
// );

// export default UserManagementTable;

/* eslint-disable no-mixed-spaces-and-tabs */
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, User, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetAllUserQuery,
  useUserDeleteMutation,
  useUserRegisterMutation,
  useUserUpdateMutation,
} from "../../features/auth/auth";

const API_BASE = " https://apikafela.digitalever.com.bd";

const UserManagementTable = () => {
  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);
  const itemsPerPage = 10;

  // Edit user
  const [currentUser, setCurrentUser] = useState(null);
  const [editPassword, setEditPassword] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState("");

  // Create user
  const [createUser, setCreateUser] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    Password: "",
    Phone: "",
    role: "",
  });
  const [createImageFile, setCreateImageFile] = useState(null);
  const [createPreviewUrl, setCreatePreviewUrl] = useState("");

  // Responsive pagination set
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

  // Fetch users
  const { data, isLoading, isError, error, refetch } = useGetAllUserQuery({
    page: currentPage,
    limit: itemsPerPage,
    searchTerm: searchTerm || undefined,
  });

  const users = useMemo(() => data?.data ?? [], [data]);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching user data", error);
      toast.error("User load failed!");
      return;
    }
    if (!isLoading && data?.meta?.count != null) {
      setTotalPages(Math.max(1, Math.ceil(data.meta.count / itemsPerPage)));
    }
  }, [data, isLoading, isError, error]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      if (createPreviewUrl) URL.revokeObjectURL(createPreviewUrl);
      if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helpers
  const closeAdd = () => {
    setIsAddOpen(false);
    setCreateUser({
      FirstName: "",
      LastName: "",
      Email: "",
      Password: "",
      Phone: "",
      role: "",
    });
    setCreateImageFile(null);
    if (createPreviewUrl) URL.revokeObjectURL(createPreviewUrl);
    setCreatePreviewUrl("");
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setCurrentUser(null);
    setEditPassword("");
    setEditImageFile(null);
    if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
    setEditPreviewUrl("");
  };

  const handleAdd = () => {
    setCreateUser({
      FirstName: "",
      LastName: "",
      Email: "",
      Password: "",
      Phone: "",
      role: "",
    });
    setCreateImageFile(null);
    if (createPreviewUrl) URL.revokeObjectURL(createPreviewUrl);
    setCreatePreviewUrl("");
    setIsAddOpen(true);
  };

  const handleEdit = (u) => {
    setCurrentUser({ ...u });
    setEditPassword("");
    setEditImageFile(null);
    if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
    setEditPreviewUrl("");
    setIsEditOpen(true);
  };

  const handleCreateImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCreateImageFile(file);
    if (createPreviewUrl) URL.revokeObjectURL(createPreviewUrl);
    setCreatePreviewUrl(URL.createObjectURL(file));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditImageFile(file);
    if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
    setEditPreviewUrl(URL.createObjectURL(file));
  };

  // Create
  const [userRegister, { isLoading: creating }] = useUserRegisterMutation();

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!createUser.Email || !createUser.Password || !createUser.role) {
      toast.error("Email, Password এবং Role বাধ্যতামূলক!");
      return;
    }

    try {
      const form = new FormData();
      form.append("FirstName", createUser.FirstName || "");
      form.append("LastName", createUser.LastName || "");
      form.append("Email", createUser.Email || "");
      form.append("Password", createUser.Password || "");
      form.append("Phone", createUser.Phone || "");
      form.append("role", createUser.role || "");
      if (createImageFile) form.append("image", createImageFile);

      const res = await userRegister(form).unwrap();

      if (res?.success) {
        toast.success("User created successfully!");
        closeAdd();
        refetch?.();
      } else {
        toast.error(res?.message || "Create failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  // Update
  const [userUpdate, { isLoading: updating }] = useUserUpdateMutation();

  const handleUpdate = async () => {
    if (!currentUser?.Id) return toast.error("Invalid user selected!");
    if (!currentUser.Email || !currentUser.role) {
      toast.error("Email এবং Role বাধ্যতামূলক!");
      return;
    }

    try {
      const form = new FormData();
      form.append("FirstName", currentUser.FirstName || "");
      form.append("LastName", currentUser.LastName || "");
      form.append("Email", currentUser.Email || "");
      form.append("Phone", currentUser.Phone || "");
      form.append("role", currentUser.role || "");
      if (editPassword?.trim()) form.append("Password", editPassword.trim());
      if (editImageFile) form.append("image", editImageFile);

      const res = await userUpdate({ id: currentUser.Id, data: form }).unwrap();

      if (res?.success) {
        toast.success("User updated successfully!");
        closeEdit();
        refetch?.();
      } else {
        toast.error(res?.message || "Update failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  // Delete
  const [userDelete] = useUserDeleteMutation();

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Do you want to delete this user?");
    if (!confirmDelete) return;

    try {
      const res = await userDelete(id).unwrap();
      if (res?.success) {
        toast.success("User deleted successfully!");
        refetch?.();
      } else {
        toast.error(res?.message || "Delete failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  // Pagination calc
  const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (pageNumber < startPage) setStartPage(pageNumber);
    else if (pageNumber > endPage) setStartPage(pageNumber - pagesPerSet + 1);
  };

  const handlePreviousSet = () =>
    setStartPage((p) => Math.max(p - pagesPerSet, 1));

  const handleNextSet = () =>
    setStartPage((p) =>
      Math.min(p + pagesPerSet, Math.max(1, totalPages - pagesPerSet + 1)),
    );

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Search */}
        <div className="relative w-full max-w-[520px]">
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
              setStartPage(1);
            }}
            placeholder="Search by email / phone / name..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          />
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          type="button"
          className="inline-flex h-11 px-5 mt-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm"
        >
          <Plus size={18} />
          Add New User
        </button>
      </div>

      {/* List */}
      <div className="mt-8">
        {isLoading && <div className="text-slate-600">Loading...</div>}

        {!isLoading &&
          users.map((item) => {
            const img = item?.image ? `${API_BASE}/${item.image}` : null;

            return (
              <div
                key={item.Id}
                className="flex items-center justify-between border-b border-slate-200 py-5 hover:bg-slate-50 rounded-xl px-3 transition"
              >
                {/* Left */}
                <div className="flex items-center gap-5">
                  <div className="h-11 w-11 rounded-full overflow-hidden bg-indigo-50 flex items-center justify-center border border-slate-200">
                    {img ? (
                      <img
                        src={img}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="text-indigo-600" size={18} />
                    )}
                  </div>

                  <div>
                    <div className="text-[16px] font-semibold text-slate-900">
                      {(item.FirstName || "-") + " " + (item.LastName || "")}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {item.Email || "-"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Role: {item.role || "-"} •{" "}
                      {item.date
                        ? new Date(item.date).toLocaleDateString()
                        : "-"}
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2 pr-2">
                  <button
                    onClick={() => handleEdit(item)}
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-indigo-50 transition"
                    title="Edit"
                  >
                    <Pencil className="text-indigo-600" size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(item.Id)}
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-rose-50 transition"
                    title="Delete"
                  >
                    <Trash2 className="text-rose-600" size={18} />
                  </button>
                </div>
              </div>
            );
          })}

        {!isLoading && users?.length === 0 && (
          <div className="py-10 text-sm text-slate-600">No user found</div>
        )}
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

      {/* Edit Modal */}
      {isEditOpen && currentUser && (
        <div className="fixed inset-0 z-50 mt-16 flex items-center justify-center bg-slate-900/40 p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(15,23,42,0.2)] w-full max-w-2xl border border-slate-200"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Update User
              </h2>

              <button
                type="button"
                onClick={closeEdit}
                className="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
                title="Close"
              >
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={currentUser?.FirstName || ""}
                onChange={(v) =>
                  setCurrentUser((p) => ({ ...p, FirstName: v }))
                }
              />
              <Input
                label="Last Name"
                value={currentUser?.LastName || ""}
                onChange={(v) => setCurrentUser((p) => ({ ...p, LastName: v }))}
              />
              <Input
                label="Email"
                value={currentUser?.Email || ""}
                onChange={(v) => setCurrentUser((p) => ({ ...p, Email: v }))}
              />
              <Input
                label="Phone"
                value={currentUser?.Phone || ""}
                onChange={(v) => setCurrentUser((p) => ({ ...p, Phone: v }))}
              />

              <Input
                label="New Password (optional)"
                type="password"
                value={editPassword}
                onChange={(v) => setEditPassword(v)}
              />

              <div>
                <label className="block text-sm text-slate-700">Role</label>
                <select
                  value={currentUser?.role || ""}
                  onChange={(e) =>
                    setCurrentUser((p) => ({ ...p, role: e.target.value }))
                  }
                  className="border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="superAdmin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="marketer">Marketer</option>
                  <option value="leader">Leader</option>
                  <option value="inventor">Inventor</option>
                  <option value="accountant">Accountant</option>
                  <option value="staff">Staff</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-slate-700">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-700 bg-white file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-700 hover:file:bg-slate-200"
                />

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-16 w-16 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                    {editPreviewUrl ? (
                      <img
                        src={editPreviewUrl}
                        alt="preview"
                        className="h-full w-full object-cover"
                      />
                    ) : currentUser?.image ? (
                      <img
                        src={`${API_BASE}/${currentUser.image}`}
                        alt="current"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="text-slate-400" size={18} />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    নতুন ছবি সিলেক্ট করলে পুরোনোটা replace হবে।
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl disabled:opacity-60 shadow-sm"
                onClick={handleUpdate}
                disabled={updating}
                type="button"
              >
                {updating ? "Saving..." : "Save"}
              </button>

              <button
                className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-200"
                onClick={closeEdit}
                type="button"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(15,23,42,0.2)] w-full max-w-2xl border border-slate-200"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Add New User
              </h2>

              <button
                type="button"
                onClick={closeAdd}
                className="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
                title="Close"
              >
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={createUser.FirstName}
                  onChange={(v) =>
                    setCreateUser((p) => ({ ...p, FirstName: v }))
                  }
                />
                <Input
                  label="Last Name"
                  value={createUser.LastName}
                  onChange={(v) =>
                    setCreateUser((p) => ({ ...p, LastName: v }))
                  }
                />
                <Input
                  label="Email *"
                  value={createUser.Email}
                  onChange={(v) => setCreateUser((p) => ({ ...p, Email: v }))}
                />
                <Input
                  label="Password *"
                  type="password"
                  value={createUser.Password}
                  onChange={(v) =>
                    setCreateUser((p) => ({ ...p, Password: v }))
                  }
                />
                <Input
                  label="Phone"
                  value={createUser.Phone}
                  onChange={(v) => setCreateUser((p) => ({ ...p, Phone: v }))}
                />

                <div>
                  <label className="block text-sm text-slate-700">Role *</label>
                  <select
                    value={createUser.role}
                    onChange={(e) =>
                      setCreateUser((p) => ({ ...p, role: e.target.value }))
                    }
                    className="border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="superAdmin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="marketer">Marketer</option>
                    <option value="leader">Leader</option>
                    <option value="inventor">Inventor</option>
                    <option value="accountant">Accountant</option>
                    <option value="staff">Staff</option>
                    <option value="user">User</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-700">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCreateImageChange}
                    className="border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-700 bg-white file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-700 hover:file:bg-slate-200"
                  />

                  {createPreviewUrl && (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={createPreviewUrl}
                        alt="preview"
                        className="h-16 w-16 rounded-full object-cover border border-slate-200"
                      />
                      <p className="text-xs text-slate-500">Preview</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl disabled:opacity-60 shadow-sm"
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Save"}
                </button>

                <button
                  type="button"
                  className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-200"
                  onClick={closeAdd}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

const Input = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-sm text-slate-700">{label}</label>
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
    />
  </div>
);

export default UserManagementTable;

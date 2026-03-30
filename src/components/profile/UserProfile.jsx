// import toast from "react-hot-toast";
// import {
//   useSingleUserMutation,
//   useUserUpdateMutation,
// } from "../../features/auth/auth";
// import { useEffect, useMemo, useState } from "react";

// // const API_BASE = "https://apikafela.digitalever.com.bd";

// const UserProfile = () => {
//   const [userUpdate] = useUserUpdateMutation();

//   const [user, setUser] = useState(null);
//   const [currentProfile, setCurrentProfile] = useState(null);

//   // const [isLoading, setIsLoading] = useState(true);
//   // const [isError, setIsError] = useState(false);

//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const [previewUrl, setPreviewUrl] = useState("");
//   const [imageFile, setImageFile] = useState(null);

//   const id = useMemo(() => localStorage.getItem("userId"), []);

//   // const avatarSrc = useMemo(() => {
//   //   if (user?.image) return `${API_BASE}/${user.image}`;
//   //   return "https://i.ibb.co/2kR0w9c/user.png";
//   // }, [user?.image]);

//   // // Fetch user
//   // useEffect(() => {
//   //   if (!id) {
//   //     setIsError(true);
//   //     setIsLoading(false);
//   //     return;
//   //   }

//   //   const fetchUser = async () => {
//   //     try {
//   //       const response = await fetch(`${API_BASE}/api/v1/user/${id}`);
//   //       if (!response.ok) throw new Error("Failed to fetch user");

//   //       const json = await response.json();
//   //       setUser(json?.data || null);
//   //     } catch (error) {
//   //       setIsError(true);
//   //       console.error("Error fetching user:", error);
//   //     } finally {
//   //       setIsLoading(false);
//   //     }
//   //   };

//   //   fetchUser();
//   // }, [id]);

//   // File change
//   const handleChange = (e) => {
//     const selected = e.target.files?.[0];
//     if (!selected) return;

//     setImageFile(selected);
//     const url = URL.createObjectURL(selected);
//     setPreviewUrl(url);
//   };

//   // Open modal with data
//   const handleEditUser = () => {
//     setCurrentProfile(user ? { ...user } : null);
//     setImageFile(null);
//     setPreviewUrl("");
//     setIsModalOpen(true);
//   };

//   // Close modal
//   const closeModal = () => setIsModalOpen(false);

//   // Save
//   const handleSave = async (e) => {
//     e.preventDefault();
//     if (!currentProfile) return;

//     try {
//       const data = new FormData();
//       data.append("FirstName", currentProfile.FirstName || "");
//       data.append("LastName", currentProfile.LastName || "");
//       data.append("Email", currentProfile.Email || "");
//       data.append("Phone", currentProfile.Phone || "");
//       data.append("Address", currentProfile.Address || "");
//       data.append("Country", currentProfile.Country || "");
//       data.append("City", currentProfile.City || "");
//       data.append("PostalCode", currentProfile.PostalCode || "");

//       if (imageFile) data.append("image", imageFile);

//       const res = await userUpdate({ id, data }).unwrap();

//       if (res?.success) {
//         toast.success("Profile updated successfully");
//         setUser((prev) => ({ ...(prev || {}), ...currentProfile }));
//         closeModal();
//       } else {
//         toast.error("Update failed. Please try again.");
//       }
//     } catch (err) {
//       console.error("Profile update failed", err);
//       toast.error("Profile update failed. Please try again.");
//     }
//   };

//   const { data, isLoading, isError, error } = useSingleUserMutation(id);

//   useEffect(() => {
//     if (isError) console.error("Error:", error);
//     if (!isLoading && data) {
//       setUser(data?.data ?? []);
//     }
//   }, [data, isLoading, isError, error]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-gray-600">
//         Loading profile...
//       </div>
//     );
//   }

//   if (isError || !user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-red-600">
//         Error fetching user data
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8">
//       <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
//         {/* Header Card */}
//         <div className="rounded-2xl shadow-sm border border-gray-200 bg-white p-5 md:p-7">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
//             <div className="flex items-center gap-4">
//               <img
//                 src={`https://apikafela.digitalever.com.bd/${user.image}`}
//                 alt="Profile"
//                 className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-2 ring-indigo-100"
//               />
//               <div>
//                 <h2 className="text-lg md:text-2xl font-semibold text-gray-900">
//                   {user?.FirstName} {user?.LastName}
//                 </h2>
//                 <div className="mt-1 flex flex-wrap gap-2 items-center">
//                   <span className="text-xs md:text-sm px-2 py-1 rounded-full bg-indigo-600 text-white">
//                     {user?.role || "Staff"}
//                   </span>
//                   <span className="text-sm text-gray-600">
//                     {user?.City}, {user?.Country}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <button
//               onClick={handleEditUser}
//               className="inline-flex justify-center items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
//             >
//               Edit Profile
//             </button>
//           </div>
//         </div>

//         {/* Details Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
//           {/* Personal Info */}
//           <div className="rounded-2xl shadow-sm border border-gray-200 bg-white p-5 md:p-7">
//             <h3 className="md:text-lg font-semibold text-gray-900">
//               Personal Information
//             </h3>

//             <div className="mt-4 space-y-3">
//               <InfoRow label="First Name" value={user?.FirstName} />
//               <InfoRow label="Last Name" value={user?.LastName} />
//               <InfoRow label="Email" value={user?.Email} />
//               <InfoRow label="Phone" value={user?.Phone} />
//               <InfoRow label="Role" value={user?.role} />
//             </div>
//           </div>

//           {/* Address */}
//           <div className="rounded-2xl shadow-sm border border-gray-200 bg-white p-5 md:p-7">
//             <h3 className="md:text-lg font-semibold text-gray-900">Address</h3>

//             <div className="mt-4 space-y-3">
//               <InfoRow label="Address" value={user?.Address} />
//               <InfoRow label="Country" value={user?.Country} />
//               <InfoRow label="City" value={user?.City} />
//               <InfoRow label="Postal Code" value={user?.PostalCode} />
//             </div>
//           </div>
//         </div>

//         {/* Modal */}
//         {isModalOpen && (
//           <div className="fixed inset-0 z-50   flex items-center justify-center p-4">
//             <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-gray-200">
//               <div className="p-5 md:p-6 border-b border-gray-200 flex items-center justify-between">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     Edit Profile
//                   </h3>
//                   <p className="text-sm text-gray-600 mt-1">
//                     Update your personal information and profile photo.
//                   </p>
//                 </div>
//                 <button
//                   onClick={closeModal}
//                   className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
//                   type="button"
//                 >
//                   ✕
//                 </button>
//               </div>

//               <form onSubmit={handleSave} className="p-5 md:p-6 space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <Input
//                     label="First Name"
//                     value={currentProfile?.FirstName || ""}
//                     onChange={(e) =>
//                       setCurrentProfile((p) => ({
//                         ...p,
//                         FirstName: e.target.value,
//                       }))
//                     }
//                   />
//                   <Input
//                     label="Last Name"
//                     value={currentProfile?.LastName || ""}
//                     onChange={(e) =>
//                       setCurrentProfile((p) => ({
//                         ...p,
//                         LastName: e.target.value,
//                       }))
//                     }
//                   />
//                   <Input
//                     label="Email"
//                     type="email"
//                     value={currentProfile?.Email || ""}
//                     onChange={(e) =>
//                       setCurrentProfile((p) => ({
//                         ...p,
//                         Email: e.target.value,
//                       }))
//                     }
//                   />
//                   <Input
//                     label="Phone"
//                     value={currentProfile?.Phone || ""}
//                     onChange={(e) =>
//                       setCurrentProfile((p) => ({
//                         ...p,
//                         Phone: e.target.value,
//                       }))
//                     }
//                   />
//                   <Input
//                     label="Country"
//                     value={currentProfile?.Country || ""}
//                     onChange={(e) =>
//                       setCurrentProfile((p) => ({
//                         ...p,
//                         Country: e.target.value,
//                       }))
//                     }
//                   />
//                   <Input
//                     label="City"
//                     value={currentProfile?.City || ""}
//                     onChange={(e) =>
//                       setCurrentProfile((p) => ({
//                         ...p,
//                         City: e.target.value,
//                       }))
//                     }
//                   />
//                   <Input
//                     label="Postal Code"
//                     value={currentProfile?.PostalCode || ""}
//                     onChange={(e) =>
//                       setCurrentProfile((p) => ({
//                         ...p,
//                         PostalCode: e.target.value,
//                       }))
//                     }
//                   />
//                   <Input
//                     label="Address"
//                     value={currentProfile?.Address || ""}
//                     onChange={(e) =>
//                       setCurrentProfile((p) => ({
//                         ...p,
//                         Address: e.target.value,
//                       }))
//                     }
//                   />
//                 </div>

//                 {/* Image */}
//                 <div className="pt-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Profile Image
//                   </label>

//                   <div className="flex items-center gap-4">
//                     <img
//                       src={
//                         previewUrl ||
//                         `https://apikafela.digitalever.com.bd/api/v1/payable${user.image}`
//                       }
//                       alt="Preview"
//                       className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
//                     />

//                     <div className="flex-1">
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={handleChange}
//                         className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
//                       />
//                       <p className="text-xs text-gray-500 mt-1">
//                         PNG, JPG allowed. Recommended square image.
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="pt-4 flex items-center justify-end gap-2">
//                   <button
//                     type="button"
//                     onClick={closeModal}
//                     className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
//                   >
//                     Save Changes
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Small UI helpers
// const InfoRow = ({ label, value }) => (
//   <div className="flex items-start justify-between gap-4">
//     <p className="text-sm text-gray-500">{label}</p>
//     <p className="text-sm font-medium text-gray-900 text-right break-words">
//       {value || "-"}
//     </p>
//   </div>
// );

// const Input = ({ label, type = "text", value, onChange }) => (
//   <div>
//     <label className="block text-sm text-gray-700 mb-1">{label}</label>
//     <input
//       type={type}
//       className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
//       value={value}
//       onChange={onChange}
//     />
//   </div>
// );

// export default UserProfile;

import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import {
  useSingleUserQuery,
  useUserUpdateMutation,
} from "../../features/auth/auth";

const API_BASE = "https://apikafela.digitalever.com.bd";

const UserProfile = () => {
  const [userUpdate] = useUserUpdateMutation();

  const [user, setUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [previewUrl, setPreviewUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const id = useMemo(() => localStorage.getItem("userId"), []);

  // ✅ Fetch user (query)
  const {
    data: userRes,
    isLoading,
    isError,
    error,
    refetch,
  } = useSingleUserQuery(id, { skip: !id });

  useEffect(() => {
    if (isError) console.error("Error:", error);
    if (!isLoading && userRes?.data) {
      setUser(userRes.data);
    }
  }, [userRes, isLoading, isError, error]);

  // File change
  const handleChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setImageFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
  };

  // Open modal with data
  const handleEditUser = () => {
    setCurrentProfile(user ? { ...user } : null);
    setImageFile(null);
    setPreviewUrl("");
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => setIsModalOpen(false);

  // helper: append non-empty only (prevents PostalCode "" issue)
  const appendIfNotEmpty = (fd, key, val) => {
    const v = typeof val === "string" ? val.trim() : val;
    if (v === "" || v === undefined || v === null) return;
    fd.append(key, v);
  };

  // Save
  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentProfile) return;

    try {
      const fd = new FormData();

      // ✅ send empty strings for text fields is OK,
      // but for PostalCode (integer in DB) we must NOT send empty string
      fd.append("FirstName", currentProfile.FirstName?.trim() || "");
      fd.append("LastName", currentProfile.LastName?.trim() || "");
      fd.append("Email", currentProfile.Email?.trim() || "");
      fd.append("Phone", currentProfile.Phone?.trim() || "");
      fd.append("Address", currentProfile.Address?.trim() || "");
      fd.append("Country", currentProfile.Country?.trim() || "");
      fd.append("City", currentProfile.City?.trim() || "");

      // ✅ PostalCode: only append when not empty
      appendIfNotEmpty(fd, "PostalCode", currentProfile.PostalCode);

      if (imageFile) fd.append("image", imageFile);

      const res = await userUpdate({ id, data: fd }).unwrap();

      if (res?.success) {
        toast.success("Profile updated successfully");

        // ✅ instant UI update (optional)
        setUser((prev) => ({ ...(prev || {}), ...currentProfile }));

        closeModal();

        // ✅ ensure latest server data (image path, db changes)
        refetch();
      } else {
        toast.error(res?.message || "Update failed. Please try again.");
      }
    } catch (err) {
      console.error("Profile update failed", err);
      toast.error(
        err?.data?.message || "Profile update failed. Please try again.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Error fetching user data
      </div>
    );
  }

  const avatarSrc = user?.image
    ? `${API_BASE}/${user.image}`
    : "https://i.ibb.co/2kR0w9c/user.png";

  return (
    <div className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        {/* Header Card */}
        <div className="rounded-2xl shadow-sm border border-gray-200 bg-white p-5 md:p-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-2 ring-indigo-100"
              />
              <div>
                <h2 className="text-lg md:text-2xl font-semibold text-gray-900">
                  {user?.FirstName || "-"} {user?.LastName || ""}
                </h2>
                <div className="mt-1 flex flex-wrap gap-2 items-center">
                  <span className="text-xs md:text-sm px-2 py-1 rounded-full bg-indigo-600 text-white">
                    {user?.role || "Staff"}
                  </span>
                  <span className="text-sm text-gray-600">
                    {user?.City || "-"}, {user?.Country || "-"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleEditUser}
              className="inline-flex justify-center items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              type="button"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {/* Personal Info */}
          <div className="rounded-2xl shadow-sm border border-gray-200 bg-white p-5 md:p-7">
            <h3 className="md:text-lg font-semibold text-gray-900">
              Personal Information
            </h3>

            <div className="mt-4 space-y-3">
              <InfoRow label="First Name" value={user?.FirstName} />
              <InfoRow label="Last Name" value={user?.LastName} />
              <InfoRow label="Email" value={user?.Email} />
              <InfoRow label="Phone" value={user?.Phone} />
              <InfoRow label="Role" value={user?.role} />
            </div>
          </div>

          {/* Address */}
          <div className="rounded-2xl shadow-sm border border-gray-200 bg-white p-5 md:p-7">
            <h3 className="md:text-lg font-semibold text-gray-900">Address</h3>

            <div className="mt-4 space-y-3">
              <InfoRow label="Address" value={user?.Address} />
              <InfoRow label="Country" value={user?.Country} />
              <InfoRow label="City" value={user?.City} />
              <InfoRow label="Postal Code" value={user?.PostalCode} />
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="p-5 md:p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit Profile
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Update your personal information and profile photo.
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                  type="button"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="p-5 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={currentProfile?.FirstName || ""}
                    onChange={(e) =>
                      setCurrentProfile((p) => ({
                        ...p,
                        FirstName: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Last Name"
                    value={currentProfile?.LastName || ""}
                    onChange={(e) =>
                      setCurrentProfile((p) => ({
                        ...p,
                        LastName: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={currentProfile?.Email || ""}
                    onChange={(e) =>
                      setCurrentProfile((p) => ({
                        ...p,
                        Email: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Phone"
                    value={currentProfile?.Phone || ""}
                    onChange={(e) =>
                      setCurrentProfile((p) => ({
                        ...p,
                        Phone: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Country"
                    value={currentProfile?.Country || ""}
                    onChange={(e) =>
                      setCurrentProfile((p) => ({
                        ...p,
                        Country: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="City"
                    value={currentProfile?.City || ""}
                    onChange={(e) =>
                      setCurrentProfile((p) => ({
                        ...p,
                        City: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Postal Code"
                    value={currentProfile?.PostalCode || ""}
                    onChange={(e) =>
                      setCurrentProfile((p) => ({
                        ...p,
                        PostalCode: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Address"
                    value={currentProfile?.Address || ""}
                    onChange={(e) =>
                      setCurrentProfile((p) => ({
                        ...p,
                        Address: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Image */}
                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image
                  </label>

                  <div className="flex items-center gap-4">
                    <img
                      src={previewUrl || avatarSrc}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
                    />

                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG allowed. Recommended square image.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Small UI helpers
const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-sm font-medium text-gray-900 text-right break-words">
      {value || "-"}
    </p>
  </div>
);

const Input = ({ label, type = "text", value, onChange }) => (
  <div>
    <label className="block text-sm text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
      value={value}
      onChange={onChange}
    />
  </div>
);

export default UserProfile;

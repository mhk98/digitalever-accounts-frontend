import { motion } from "framer-motion";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  useDeleteLogoMutation,
  useGetAllLogoQuery,
  useInsertLogoMutation,
  useUpdateLogoMutation,
} from "../../features/logo/logo";

const LogoTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // edit
  const [isModalOpen1, setIsModalOpen1] = useState(false); // add
  const [currentProduct, setCurrentProduct] = useState(null);

  const [createProduct, setCreateProduct] = useState({
    file: null,
  });

  const [products, setProducts] = useState([]);

  const { data, isLoading, isError, error, refetch } = useGetAllLogoQuery();

  useEffect(() => {
    if (isError) console.error("Error:", error);
    if (!isLoading && data) {
      setProducts(data?.data ?? []);
    }
  }, [data, isLoading, isError, error]);

  console.log("products", products.file);
  // modals
  const handleAddProduct = () => setIsModalOpen1(true);
  const handleModalClose1 = () => setIsModalOpen1(false);

  const [updateLogo] = useUpdateLogoMutation();

  const handleEditClick = (products) => {
    setCurrentProduct({
      ...products,
      file: null,
    });
    setIsModalOpen(true);
  };

  const handleUpdateProduct = async () => {
    const Id = currentProduct?.Id;
    if (!Id) return toast.error("Invalid item!");

    try {
      // ✅ safest: FormData (update এ ফাইল দিলেও যাবে)
      const formData = new FormData();

      if (currentProduct.file) formData.append("file", currentProduct.file);

      const res = await updateLogo({ id: Id, data: formData }).unwrap();

      if (res?.success) {
        toast.success("Updated!");
        setIsModalOpen(false);
        setCurrentProduct(null);
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  // insert
  const [insertLogo] = useInsertLogoMutation();
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      if (createProduct.file) formData.append("file", createProduct.file);

      const res = await insertLogo(formData).unwrap();

      if (res?.success) {
        toast.success("Successfully created!");
        setIsModalOpen1(false);
        setCreateProduct({
          file: null,
        });
        refetch?.();
      } else toast.error(res?.message || "Create failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  // delete
  const [deleteLogo] = useDeleteLogoMutation();
  const handleDeleteProduct = async (rowId) => {
    if (!rowId) return toast.error("Invalid item!");
    if (!window.confirm("Do you want to delete this item?")) return;

    try {
      const res = await deleteLogo(rowId).unwrap();
      if (res?.success) {
        toast.success("Deleted!");
        refetch?.();
      } else toast.error(res?.message || "Delete failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  return (
    <motion.div
      className=" bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* <div className="my-6 flex items-center justify-between">
        <button
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-20 justify-center"
          onClick={handleAddProduct}
        >
          Add <Plus size={18} className="ms-2" />
        </button>
        <ReportMenu
          isOpen={isReportMenuOpen}
          setIsOpen={setIsReportMenuOpen}
          onGoogleSheet={handleReportSheet}
          onPdf={handleReportPdf}
          disabled={isLoading}
        />
      </div> */}

      <div className="my-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Add button */}
        <button
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition w-full sm:w-auto"
          onClick={handleAddProduct}
          type="button"
        >
          Add <Plus size={18} className="ml-2" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Logo
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {products.file ? (
            <tbody className="divide-y divide-gray-700">
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <img
                    src={` https://api.digitalever.com.bd/${products.file}`}
                    alt="document"
                    className="h-12 w-12 object-cover rounded border border-gray-600 hover:opacity-80"
                  />
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditClick(products)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(products.Id)}
                    className="text-red-600 hover:text-red-900 ms-4"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-gray-700">
              {!isLoading && products?.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-6 text-center text-sm text-gray-300"
                  >
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && currentProduct && (
        <div className="fixed inset-0 flex items-center justify-center">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-xl w-full md:w-1/3 lg:w-1/3 border border-slate-200"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white">Edit</h2>

            <div className="mt-4">
              <label className="block text-sm text-white">
                Upload Document
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    file: e.target.files?.[0] || null,
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
              />
              {currentProduct.file && (
                <p className="mt-2 text-xs text-gray-300">
                  Selected: {currentProduct.file.name}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
                onClick={handleUpdateProduct}
              >
                Save
              </button>
              <button
                className="bg-white hover:bg-slate-50 text-slate-800 px-4 h-11 rounded-xl border border-slate-200 font-semibold"
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentProduct(null);
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center   p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-lg border border-slate-200"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white">Add Logo</h2>

            <form onSubmit={handleCreateProduct}>
              <div className="mt-4">
                <label className="block text-sm text-white">
                  Upload Document
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      file: e.target.files?.[0] || null,
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-black bg-white"
                />
                {createProduct.file && (
                  <p className="mt-2 text-xs text-gray-300">
                    Selected: {createProduct.file.name}
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="bg-white hover:bg-slate-50 text-slate-800 px-4 h-11 rounded-xl border border-slate-200 font-semibold"
                  onClick={handleModalClose1}
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

export default LogoTable;

import { motion } from "framer-motion";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  useDeleteSalaryMutation,
  useGetAllSalaryQuery,
  useInsertSalaryMutation,
  useUpdateSalaryMutation,
} from "../../features/salary/salary";

const SalaryTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);

  const [currentProduct, setCurrentProduct] = useState(null);

  // ✅ Add form state
  const [createProduct, setCreateProduct] = useState({
    late: "",
    early_leave: "",
    absent: "",
    friday_absent: "",
    unapproval_absent: "",
  });

  const [products, setProducts] = useState([]);

  const { data, isLoading, isError, error, refetch } = useGetAllSalaryQuery();

  useEffect(() => {
    if (isError) {
      console.error("Error fetching meta data", error);
    } else if (!isLoading && data) {
      setProducts(data.data);
    }
  }, [data, isLoading, isError, error]);

  console.log("products", products);

  // Modals
  const handleAddProduct = () => setIsModalOpen1(true);
  const handleModalClose1 = () => setIsModalOpen1(false);

  const [updateSalary] = useUpdateSalaryMutation();

  const handleEditClick = (rp) => {
    setCurrentProduct({
      ...rp,
      late: rp.late ?? "",
      early_leave: rp.early_leave ?? "",
      absent: rp.absent ?? "",
      friday_absent: rp.friday_absent ?? "",
      unapproval_absent: rp.unapproval_absent ?? "",
    });
    setIsModalOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!currentProduct?.Id) return toast.error("Invalid item!");
    try {
      const payload = {
        late: Number(currentProduct.late),
        early_leave: Number(currentProduct.early_leave),
        absent: Number(currentProduct.absent),
        friday_absent: Number(currentProduct.friday_absent),
        unapproval_absent: Number(currentProduct.unapproval_absent),
      };

      const res = await updateSalary({
        id: currentProduct.Id,
        data: payload,
      }).unwrap();

      if (res?.success) {
        toast.success("Successfully updated!");
        setIsModalOpen(false);
        refetch?.();
      } else {
        toast.error(res?.message || "Update failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const handleModalClose = () => setIsModalOpen(false);

  // ✅ Insert
  const [insertSalary] = useInsertSalaryMutation();
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        late: Number(createProduct.late),
        early_leave: Number(createProduct.early_leave),
        absent: Number(createProduct.absent),
        friday_absent: Number(createProduct.friday_absent),
        unapproval_absent: Number(createProduct.unapproval_absent),
      };

      const res = await insertSalary(payload).unwrap();
      if (res?.success) {
        toast.success("Successfully created salary");
        setIsModalOpen1(false);
        setCreateProduct({ amount: "" });
        refetch?.();
      } else {
        toast.error(res?.message || "Create failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  // ✅ Delete
  const [deleteSalary] = useDeleteSalaryMutation();
  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm("Do you want to delete this item?");
    if (!confirmDelete) return toast.info("Delete action was cancelled.");

    try {
      const res = await deleteSalary(id).unwrap();
      if (res?.success) {
        toast.success("Deleted successfully!");
        refetch?.();
      } else {
        toast.error(res?.message || "Delete failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Add Button */}
      <div className="my-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleAddProduct}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          Add <Plus size={18} className="ml-2" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Late Inn(Amount)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Early Leave (Amount)
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Absent (Amount)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Friday Absent (Amount)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Unapproval Absent (Amount)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {products ? (
            <tbody className="divide-y divide-gray-700">
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {products.late}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {products.early_leave}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {products.absent}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {products.absent}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {products.friday_absent}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {products.unapproval_absent}
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

              {!isLoading && products?.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-6 text-center text-sm text-gray-300"
                  >
                    No data found
                  </td>
                </tr>
              )}
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
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white">
              Edit Fine Amount
            </h2>

            <div className="mt-4">
              <label className="block text-sm text-white">
                Late Inn (Amount):
              </label>
              <input
                type="number"
                step="0.01"
                value={currentProduct?.late || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    late: e.target.value, // ✅ fixed
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm text-white">
                Early Leave (Amount):
              </label>
              <input
                type="number"
                step="0.01"
                value={currentProduct?.early_leave || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    early_leave: e.target.value, // ✅ fixed
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white">
                Absent (Amount):
              </label>
              <input
                type="number"
                step="0.01"
                value={currentProduct?.absent || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    absent: e.target.value, // ✅ fixed
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white">
                Friday Absent (Amount):
              </label>
              <input
                type="number"
                step="0.01"
                value={currentProduct?.friday_absent || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    friday_absent: e.target.value, // ✅ fixed
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-white">
                Unapproval Absent (Amount):
              </label>
              <input
                type="number"
                step="0.01"
                value={currentProduct?.unapproval_absent || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    unapproval_absent: e.target.value, // ✅ fixed
                  })
                }
                className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2"
                onClick={handleUpdateProduct}
              >
                Save
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                onClick={handleModalClose}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen1 && (
        <div className="fixed inset-0 top-12 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white">
              Add Fine Amount
            </h2>

            <form onSubmit={handleCreateProduct}>
              <div className="mt-4">
                <label className="block text-sm text-white">
                  Late Inn (Amount):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={createProduct?.late || ""}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      late: e.target.value, // ✅ fixed
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm text-white">
                  Early Leave (Amount):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={createProduct?.early_leave || ""}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      early_leave: e.target.value, // ✅ fixed
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-white">
                  Absent (Amount):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={createProduct?.absent || ""}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      absent: e.target.value, // ✅ fixed
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-white">
                  Friday Absent (Amount):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={createProduct?.friday_absent || ""}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      friday_absent: e.target.value, // ✅ fixed
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-white">
                  Unapproval Absent (Amount):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={createProduct?.unapproval_absent || ""}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      unapproval_absent: e.target.value, // ✅ fixed
                    })
                  }
                  className="border border-gray-300 rounded p-2 w-full mt-1 text-white"
                />
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
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
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

export default SalaryTable;

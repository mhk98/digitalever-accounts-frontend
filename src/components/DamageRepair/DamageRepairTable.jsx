import { motion } from "framer-motion";
import { Edit, Notebook, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

import {
  useDeleteDamageRepairMutation,
  useGetAllDamageRepairQuery,
  useInsertDamageRepairMutation,
  useUpdateDamageRepairMutation,
} from "../../features/damageRepair/damageRepair";
import { useGetAllSupplierWithoutQueryQuery } from "../../features/supplier/supplier";
import { useGetAllWirehouseWithoutQueryQuery } from "../../features/wirehouse/wirehouse";
import { useGetAllDamageStockWithoutQueryQuery } from "../../features/damageStock/damageStock";
import { useGetSingleProductByIdQuery } from "../../features/product/product";
import Modal from "../common/Modal";

const initialCreateForm = {
  warehouseId: "",
  supplierId: "",
  receivedId: "",
  productId: "",
  variantRows: [{ size: "", color: "", quantity: "" }],
  quantity: "",
  note: "",
  remarks: "",
  date: new Date().toISOString().slice(0, 10),
};

const parseVariationValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const getVariationOptions = (product, key) => {
  if (!Array.isArray(product?.variations)) return [];

  return [
    ...new Set(
      product.variations.flatMap((variation) =>
        parseVariationValue(variation?.[key]),
      ),
    ),
  ].map((value) => ({
    value,
    label: value,
  }));
};

const createEmptyVariantRow = () => ({
  size: "",
  color: "",
  quantity: "",
});

const normalizeVariantRows = (value) => {
  if (Array.isArray(value) && value.length > 0) {
    return value.map((row) => ({
      size: row?.size ? String(row.size) : "",
      color: row?.color ? String(row.color) : "",
      quantity:
        row?.quantity !== undefined && row?.quantity !== null
          ? String(row.quantity)
          : "",
    }));
  }

  return [createEmptyVariantRow()];
};

const getInitialVariantRowsFromRecord = (record) => {
  if (Array.isArray(record?.variants) && record.variants.length > 0) {
    return normalizeVariantRows(record.variants);
  }

  if (typeof record?.variants === "string") {
    try {
      const parsed = JSON.parse(record.variants);
      return normalizeVariantRows(parsed);
    } catch {
      // ignore malformed legacy data
    }
  }

  if (record?.size || record?.color || record?.variationQuantity) {
    return normalizeVariantRows([
      {
        size: record.size,
        color: record.color,
        quantity: record.variationQuantity,
      },
    ]);
  }

  return [createEmptyVariantRow()];
};

const getVariantDisplayRows = (record) => {
  if (Array.isArray(record?.variants)) {
    return record.variants.filter(
      (item) => item && (item.size || item.color || item.quantity),
    );
  }

  if (typeof record?.variants === "string") {
    try {
      const parsed = JSON.parse(record.variants);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item) => item && (item.size || item.color || item.quantity),
        );
      }
    } catch {
      return [];
    }
  }

  return [];
};

const getVariationColorsForSize = (product, size) => {
  if (!size || !Array.isArray(product?.variations)) return [];

  return [
    ...new Set(
      product.variations.flatMap((variation) => {
        const sizes = parseVariationValue(variation?.size);
        if (!sizes.includes(size)) return [];
        return parseVariationValue(variation?.color);
      }),
    ),
  ].map((value) => ({ value, label: value }));
};

const getNormalizedVariantsPayload = (rows) =>
  normalizeVariantRows(rows)
    .filter((row) => row.size || row.color || row.quantity)
    .map((row) => ({
      size: row.size || "",
      color: row.color || "",
      quantity: Number(row.quantity) || 0,
    }))
    .filter((row) => row.size);

const getVariantRowsTotalQuantity = (rows) =>
  normalizeVariantRows(rows).reduce(
    (total, row) => total + (Number(row.quantity) || 0),
    0,
  );

const hasConfiguredVariants = (rows) =>
  Array.isArray(rows) &&
  rows.some(
    (row) =>
      row &&
      (String(row.size || "").trim() ||
        String(row.color || "").trim() ||
        String(row.quantity || "").trim()),
  );

const hasDuplicateVariantCombination = (rows) => {
  const seen = new Set();

  for (const row of rows) {
    if (!row.size) continue;
    const key = `${row.size}__${row.color || ""}`;
    if (seen.has(key)) return true;
    seen.add(key);
  }

  return false;
};

const DamageRepairTable = () => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditOpen1, setIsEditOpen1] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [warehouse, setWarehouse] = useState("");
  const [supplier, setSupplier] = useState("");

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const [currentItem, setCurrentItem] = useState(null);

  // create form
  const [createForm, setCreateForm] = useState({
    ...initialCreateForm,
  });

  const [rows, setRows] = useState([]);

  // filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [productName, setProductName] = useState("");

  // ✅ pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);

  // ✅ all damage products (for dropdown)
  const {
    data: receivedRes,
    isLoading: receivedLoading,
    isError: receivedError,
    error: receivedErrObj,
  } = useGetAllDamageStockWithoutQueryQuery();

  const receivedData = receivedRes?.data || [];

  useEffect(() => {
    if (receivedError)
      console.error("DamageProduct fetch error:", receivedErrObj);
  }, [receivedError, receivedErrObj]);

  // dropdown options -> value = DamageProduct.Id
  const receivedDropdownOptions = useMemo(() => {
    return receivedData.map((r) => ({
      value: String(r.Id),
      label: r.name,
    }));
  }, [receivedData]);

  const selectedCreateDamageStock = useMemo(
    () =>
      receivedData.find(
        (item) => String(item.Id) === String(createForm?.receivedId),
      ),
    [receivedData, createForm?.receivedId],
  );
  const selectedEditDamageStock = useMemo(
    () =>
      receivedData.find(
        (item) => String(item.Id) === String(currentItem?.receivedId),
      ),
    [receivedData, currentItem?.receivedId],
  );

  const selectedCreateProductId =
    selectedCreateDamageStock?.productId || createForm?.productId || undefined;
  const selectedEditProductId =
    selectedEditDamageStock?.productId || currentItem?.productId || undefined;

  const { data: selectedCreateProductRes } = useGetSingleProductByIdQuery(
    selectedCreateProductId,
    { skip: !selectedCreateProductId },
  );
  const { data: selectedEditProductRes } = useGetSingleProductByIdQuery(
    selectedEditProductId,
    { skip: !selectedEditProductId },
  );

  const selectedCreateProductData =
    selectedCreateProductRes?.data || selectedCreateProductRes;
  const selectedEditProductData =
    selectedEditProductRes?.data || selectedEditProductRes;

  const createSizeOptions = useMemo(
    () => getVariationOptions(selectedCreateProductData, "size"),
    [selectedCreateProductData],
  );
  const createColorOptions = useMemo(
    () => getVariationOptions(selectedCreateProductData, "color"),
    [selectedCreateProductData],
  );
  const editSizeOptions = useMemo(
    () => getVariationOptions(selectedEditProductData, "size"),
    [selectedEditProductData],
  );
  const editColorOptions = useMemo(
    () => getVariationOptions(selectedEditProductData, "color"),
    [selectedEditProductData],
  );

  // ✅ react-select light styles
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: 14,
      borderColor: state.isFocused ? "#c7d2fe" : "#e2e8f0",
      boxShadow: state.isFocused ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
      "&:hover": { borderColor: "#cbd5e1" },
      backgroundColor: "#fff",
    }),
    valueContainer: (base) => ({ ...base, padding: "0 12px" }),
    placeholder: (base) => ({ ...base, color: "#64748b" }),
    singleValue: (base) => ({ ...base, color: "#0f172a" }),
    menu: (base) => ({ ...base, borderRadius: 14, overflow: "hidden" }),
  };

  // ✅ responsive pagesPerSet
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setPagesPerSet(5);
      else if (window.innerWidth < 1024) setPagesPerSet(7);
      else setPagesPerSet(10);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // reset page when filters / perPage change
  useEffect(() => {
    setCurrentPage(1);
    setStartPage(1);
  }, [startDate, endDate, productName, itemsPerPage]);

  // fix endDate if startDate > endDate
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) setEndDate(startDate);
  }, [startDate, endDate]);

  // ✅ query
  const queryArgs = {
    page: currentPage,
    limit: itemsPerPage,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    name: productName || undefined,
  };

  const { data, isLoading, isError, error, refetch } =
    useGetAllDamageRepairQuery(queryArgs);

  useEffect(() => {
    if (isError) console.error("DamageRepair fetch error:", error);
    if (!isLoading && data) {
      setRows(data?.data ?? []);
      setTotalPages(
        Math.max(1, Math.ceil((data?.meta?.count || 0) / itemsPerPage)),
      );
    }
  }, [data, isLoading, isError, error, itemsPerPage]);

  // ✅ Table product name (simple)
  const resolveProductName = (rp) => {
    if (rp?.name) return rp.name;

    const productId = rp?.productId;
    if (!productId) return "N/A";

    const match = receivedData.find(
      (r) => Number(r.productId) === Number(productId),
    );
    return match?.name || "N/A";
  };

  // modals
  const openAdd = () => {
    setCreateForm(initialCreateForm);
    setIsAddOpen(true);
  };
  const closeAdd = () => {
    setIsAddOpen(false);
    setCreateForm(initialCreateForm);
  };

  const updateVariantRow = (mode, index, key, value) => {
    const setter = mode === "edit" ? setCurrentItem : setCreateForm;

    setter((prev) => {
      const nextRows = normalizeVariantRows(prev?.variantRows).map(
        (row, rowIndex) =>
          rowIndex === index
            ? {
                ...row,
                [key]: value,
                ...(key === "size" ? { color: "" } : {}),
              }
            : row,
      );

      return {
        ...prev,
        variantRows: nextRows,
        quantity: String(getVariantRowsTotalQuantity(nextRows)),
      };
    });
  };

  const addVariantRow = (mode) => {
    const setter = mode === "edit" ? setCurrentItem : setCreateForm;

    setter((prev) => ({
      ...prev,
      variantRows: [
        ...normalizeVariantRows(prev?.variantRows),
        createEmptyVariantRow(),
      ],
      quantity: String(getVariantRowsTotalQuantity(prev?.variantRows)),
    }));
  };

  const removeVariantRow = (mode, index) => {
    const setter = mode === "edit" ? setCurrentItem : setCreateForm;

    setter((prev) => {
      const nextRows = normalizeVariantRows(prev?.variantRows).filter(
        (_, rowIndex) => rowIndex !== index,
      );

      return {
        ...prev,
        variantRows: nextRows.length > 0 ? nextRows : [createEmptyVariantRow()],
        quantity: String(
          getVariantRowsTotalQuantity(
            nextRows.length > 0 ? nextRows : [createEmptyVariantRow()],
          ),
        ),
      };
    });
  };

  const openEdit = (rp) => {
    const variantRows = getInitialVariantRowsFromRecord(rp);
    setCurrentItem({
      ...rp,
      productId: String(rp.productId ?? ""),
      receivedId: String(rp.receivedId ?? rp.productId ?? ""),
      variantRows,
      quantity: String(
        getVariantRowsTotalQuantity(variantRows) || Number(rp.quantity) || 0,
      ),
      note: rp.note ?? "",
      status: rp.status ?? "",
      remarks: rp.remarks ?? "",
      date: rp.date ?? "",
    });
    setIsEditOpen(true);
  };
  const closeEdit = () => {
    setIsEditOpen(false);
    setCurrentItem(null);
  };

  const openEdit1 = (rp) => {
    setCurrentItem({
      ...rp,
      productId: String(rp.productId ?? ""),
      receivedId: String(rp.receivedId ?? rp.productId ?? ""),
      quantity: rp.quantity ?? "",
      note: rp.note ?? "",
      status: rp.status ?? "",
      remarks: rp.remarks ?? "",
    });
    setIsEditOpen1(true);
  };
  const closeEdit1 = () => {
    setIsEditOpen1(false);
    setCurrentItem(null);
  };

  // mutations
  const [insertDamageRepair] = useInsertDamageRepairMutation();
  const [updateDamageRepair] = useUpdateDamageRepairMutation();
  const [deleteDamageRepair] = useDeleteDamageRepairMutation();

  // create
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!createForm.receivedId && !createForm.productId)
      return toast.error("Please select a product");
    if (!createForm.quantity || Number(createForm.quantity) <= 0)
      return toast.error("Please enter valid quantity");

    const variantsPayload = getNormalizedVariantsPayload(
      createForm.variantRows,
    );
    if (hasDuplicateVariantCombination(variantsPayload)) {
      return toast.error("Duplicate size and color combination found");
    }

    try {
      const payload = {
        receivedId: Number(createForm.receivedId || createForm.productId),
        productId: Number(createForm.productId || selectedCreateProductId || 0),
        supplierId: Number(createForm.supplierId),
        warehouseId: Number(createForm.warehouseId),
        quantity: Number(createForm.quantity),
        variants: variantsPayload,
        note: createForm.note,
        remarks: createForm.remarks,
        date: createForm.date,
      };

      const res = await insertDamageRepair(payload).unwrap();
      if (res?.success) {
        toast.success("Successfully created!");
        closeAdd();
        refetch?.();
      } else toast.error(res?.message || "Create failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  // update
  const handleUpdate = async () => {
    if (!currentItem?.Id) return toast.error("Invalid item");
    if (!currentItem?.receivedId && !currentItem?.productId)
      return toast.error("Please select a product");
    if (!currentItem.quantity || Number(currentItem.quantity) <= 0)
      return toast.error("Please enter valid quantity");

    const variantsPayload = getNormalizedVariantsPayload(
      currentItem?.variantRows,
    );
    if (hasDuplicateVariantCombination(variantsPayload)) {
      return toast.error("Duplicate size and color combination found");
    }

    try {
      const payload = {
        note: currentItem.note,
        status: currentItem.status,
        supplierId: Number(currentItem.supplierId),
        warehouseId: Number(currentItem.warehouseId),
        remarks: currentItem.remarks,
        date: currentItem.date,
        quantity: Number(currentItem.quantity),
        variants: variantsPayload,
        receivedId: Number(currentItem.receivedId || currentItem.productId),
        productId: Number(currentItem.productId || selectedEditProductId || 0),
        userId: userId,
        actorRole: role,
      };

      const res = await updateDamageRepair({
        id: currentItem.Id,
        data: payload,
      }).unwrap();

      if (res?.success) {
        toast.success("Successfully updated!");

        closeEdit();
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const handleUpdate1 = async () => {
    if (!currentItem?.Id) return toast.error("Invalid item");

    try {
      const payload = {
        note: currentItem.note,
        status: currentItem.status,
        supplierId: Number(currentItem.supplierId),
        warehouseId: Number(currentItem.warehouseId),
        remarks: currentItem.remarks,
        quantity: Number(currentItem.quantity || 0),
        receivedId: Number(currentItem.receivedId || currentItem.productId),
        productId: Number(currentItem.productId || selectedEditProductId || 0),
        userId: userId,
        actorRole: role,
      };

      const res = await updateDamageRepair({
        id: currentItem.Id,
        data: payload,
      }).unwrap();

      if (res?.success) {
        toast.success("Successfully updated!");

        closeEdit1();
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  // delete
  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this item?")) return;

    try {
      const res = await deleteDamageRepair(id).unwrap();
      if (res?.success) {
        toast.success("Deleted!");
        refetch?.();
      } else toast.error(res?.message || "Delete failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  // clear filters
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setProductName("");
  };

  // pagination helpers
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
      Math.min(prev + pagesPerSet, Math.max(totalPages - pagesPerSet + 1, 1)),
    );

  // ✅ suppliers
  const {
    data: allSupplierRes,
    isLoading: isLoadingSupplier,
    isError: isErrorSupplier,
    error: errorSupplier,
  } = useGetAllSupplierWithoutQueryQuery();
  const suppliers = allSupplierRes?.data || [];

  useEffect(() => {
    if (isErrorSupplier)
      console.error("Error fetching suppliers", errorSupplier);
  }, [isErrorSupplier, errorSupplier]);

  // ✅ Dropdown options

  const supplierOptions = useMemo(
    () =>
      (suppliers || []).map((w) => ({
        value: w.Id,
        label: w.name,
      })),
    [suppliers],
  );

  // ✅ warehouses
  const {
    data: allWarehousesRes,
    isLoading: isLoadingWarehouse,
    isError: isErrorWarehouse,
    error: errorWarehouse,
  } = useGetAllWirehouseWithoutQueryQuery();
  const warehouses = allWarehousesRes?.data || [];

  useEffect(() => {
    if (isErrorWarehouse)
      console.error("Error fetching warehouses", errorWarehouse);
  }, [isErrorWarehouse, errorWarehouse]);

  const warehouseOptions = useMemo(
    () =>
      (warehouses || []).map((w) => ({
        value: w.Id,
        label: w.name,
      })),
    [warehouses],
  );

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  const handleNoteClick = (note) => {
    setNoteContent(note);
    setIsNoteModalOpen(true); // Open the modal
  };

  const handleNoteModalClose = () => {
    setIsNoteModalOpen(false); // Close the modal
  };

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="my-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          Add <Plus size={18} className="ml-2" />
        </button>

        <div className="flex items-center justify-between sm:justify-end gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <RotateCcw size={18} className="text-amber-500" />
            <span className="text-sm">Total Damage Repair Product</span>
          </div>
          <span className="text-slate-900 font-semibold tabular-nums">
            {isLoading ? "Loading..." : (data?.meta?.totalQuantity ?? 0)}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-4 items-end w-full">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          />
        </div>

        {/* ✅ Per Page */}
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Per Page</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
              setStartPage(1);
            }}
            className="h-11 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 outline-none
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Product */}
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Product</label>
          <Select
            options={receivedDropdownOptions}
            value={
              receivedDropdownOptions.find((o) => o.label === productName) ||
              null
            }
            onChange={(selected) => setProductName(selected?.label || "")}
            placeholder={receivedLoading ? "Loading..." : "Select Product"}
            isClearable
            isDisabled={receivedLoading}
            styles={selectStyles}
            className="text-black"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Warehouse</label>
          <Select
            options={warehouseOptions}
            value={
              warehouseOptions.find(
                (o) => String(o.value) === String(warehouse),
              ) || null
            }
            onChange={(selected) => setWarehouse(selected?.value || "")}
            placeholder="Select Warehouse"
            isClearable
            className="text-black"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Supplier</label>
          <Select
            options={supplierOptions}
            value={
              supplierOptions.find(
                (o) => String(o.value) === String(supplier),
              ) || null
            }
            onChange={(selected) => setSupplier(selected?.value || "")}
            placeholder="Select Supplier"
            isClearable
            className="text-black"
          />
        </div>
        <button
          type="button"
          className="h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 transition rounded-xl px-4 text-sm font-semibold"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Supplier
              </th>{" "}
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Warehouse
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Variants
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Purchase Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Sale Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Remarks
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.map((rp) => {
              const variantDisplayRows = getVariantDisplayRows(rp);

              return (
                <motion.tr
                  key={rp.Id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-slate-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {rp.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {rp.updatedAt
                      ? new Date(rp.updatedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {resolveProductName(rp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp?.supplier?.name || "-"}
                  </td>{" "}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp?.warehouse?.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {Number(rp.quantity || 0)}
                  </td>
                  <td className="px-6 py-4 min-w-[260px]">
                    {variantDisplayRows.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {variantDisplayRows.map((variant, index) => (
                          <div
                            key={`${rp.Id}-variant-${index}`}
                            className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-3 py-2 shadow-sm"
                          >
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-800">
                              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white">
                                {variant.size || "N/A"}
                              </span>
                              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-indigo-700">
                                {variant.color || "N/A"}
                              </span>
                            </div>
                            <div className="mt-2 text-[11px] font-medium text-slate-500">
                              Qty{" "}
                              <span className="font-bold text-slate-900">
                                {Number(variant.quantity || 0).toFixed(0)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="inline-flex items-center rounded-full border border-dashed border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-400">
                        No variants
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {Number(rp.purchase_price || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {Number(rp.sale_price || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp.remarks || ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp.status || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-3">
                    {rp.note ? (
                      <div className="relative">
                        <button
                          className="relative h-10 w-10 rounded-md flex items-center justify-center"
                          title={rp.note}
                          type="button"
                          onClick={() => handleNoteClick(rp.note)} // Open modal on click
                        >
                          <Notebook size={18} className="text-slate-700" />
                        </button>

                        <span className="absolute top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center">
                          {rp.note ? 1 : null}
                        </span>
                      </div>
                    ) : (
                      <button
                        className="h-10 w-10 rounded-md flex items-center justify-center"
                        title={rp.note}
                        type="button"
                      >
                        <Notebook size={18} className="text-slate-700" />
                      </button>
                    )}

                    <button
                      onClick={() => openEdit(rp)}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      <Edit size={18} />
                    </button>

                    {role === "superAdmin" || role === "admin" ? (
                      <button
                        onClick={() => handleDelete(rp.Id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => openEdit1(rp)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                  {/* ✅ Note Modal (Popup) */}
                  {isNoteModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                      <div className="bg-white rounded-lg p-6 shadow-xl w-full md:w-1/3">
                        <h2 className="text-xl font-semibold text-slate-900">
                          Note
                        </h2>
                        <p className="mt-4 text-sm text-slate-700">
                          {noteContent}
                        </p>

                        <div className="mt-6 flex justify-end gap-2">
                          <button
                            onClick={handleNoteModalClose}
                            className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.tr>
              );
            })}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={12}
                  className="px-6 py-8 text-center text-sm text-slate-600"
                >
                  No data found
                </td>
              </tr>
            )}
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

      {/* Edit Modal */}
      {isEditOpen && currentItem && (
        <div className="fixed inset-0 top-32 flex items-center justify-center   p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl w-full md:w-1/3 border border-slate-200"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Edit Product
            </h2>

            <div className="mt-4">
              <label className="block text-sm text-slate-600 mb-1">Name</label>
              <Select
                options={receivedDropdownOptions}
                value={
                  receivedDropdownOptions.find(
                    (o) => o.value === String(currentItem.receivedId),
                  ) || null
                }
                onChange={(selected) =>
                  setCurrentItem((p) => ({
                    ...p,
                    productId: String(
                      receivedData.find(
                        (item) => String(item.Id) === String(selected?.value),
                      )?.productId || "",
                    ),
                    receivedId: selected?.value || "",
                    variantRows: [createEmptyVariantRow()],
                    quantity: "",
                  }))
                }
                placeholder={receivedLoading ? "Loading..." : "Select Product"}
                isClearable
                isDisabled={receivedLoading}
                styles={selectStyles}
                className="text-black"
              />
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Product Variants
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Add size, color and quantity combinations
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addVariantRow("edit")}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 transition"
                  disabled={!currentItem?.receivedId}
                >
                  <Plus size={14} />
                  Add Variant
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {normalizeVariantRows(currentItem?.variantRows).map(
                  (row, index) => {
                    const colorOptions = row.size
                      ? getVariationColorsForSize(
                          selectedEditProductData,
                          row.size,
                        )
                      : editColorOptions;

                    return (
                      <div
                        key={`edit-variant-${index}`}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_140px_auto] gap-3 items-end"
                      >
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                            Size / Code
                          </label>
                          <Select
                            options={editSizeOptions}
                            value={
                              editSizeOptions.find(
                                (option) => option.value === row.size,
                              ) || null
                            }
                            onChange={(selected) =>
                              updateVariantRow(
                                "edit",
                                index,
                                "size",
                                selected?.value || "",
                              )
                            }
                            placeholder="Select size..."
                            isClearable
                            styles={selectStyles}
                            className="text-sm font-medium"
                            isDisabled={
                              !currentItem?.receivedId ||
                              editSizeOptions.length === 0
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                            Color
                          </label>
                          <Select
                            options={colorOptions}
                            value={
                              colorOptions.find(
                                (option) => option.value === row.color,
                              ) || null
                            }
                            onChange={(selected) =>
                              updateVariantRow(
                                "edit",
                                index,
                                "color",
                                selected?.value || "",
                              )
                            }
                            placeholder="Select color..."
                            isClearable
                            styles={selectStyles}
                            className="text-sm font-medium"
                            isDisabled={!row.size || colorOptions.length === 0}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.quantity}
                            onChange={(e) =>
                              updateVariantRow(
                                "edit",
                                index,
                                "quantity",
                                e.target.value,
                              )
                            }
                            className="h-11 border bg-white border-slate-200 rounded-xl px-3 w-full text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                            placeholder="0"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeVariantRow("edit", index)}
                          className="h-11 w-11 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition disabled:opacity-50"
                          disabled={
                            normalizeVariantRows(currentItem?.variantRows)
                              .length === 1
                          }
                        >
                          <span className="mx-auto block text-base leading-none">
                            x
                          </span>
                        </button>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-slate-700">Date</label>
              <input
                type="date"
                value={currentItem?.date || ""}
                onChange={(e) =>
                  setCurrentItem((p) => ({ ...p, date: e.target.value }))
                }
                className="border bg-white border-slate-200 rounded-xl p-2 w-full mt-1 text-slate-900 outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-700">Warehouse</label>
              <select
                value={currentItem?.warehouseId || ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    warehouseId: e.target.value,
                  })
                }
                className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                required
              >
                <option value="">Select Warehouse</option>
                {isLoadingWarehouse ? (
                  <option disabled>Loading...</option>
                ) : (
                  warehouses?.map((w) => (
                    <option key={w.Id} value={w.Id}>
                      {w.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-700">Supplier</label>
              <select
                value={currentItem?.supplierId || ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    supplierId: e.target.value,
                  })
                }
                className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                required
              >
                <option value="">Select Supplier</option>
                {isLoadingSupplier ? (
                  <option disabled>Loading...</option>
                ) : (
                  suppliers?.map((s) => (
                    <option key={s.Id} value={s.Id}>
                      {s.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-600 mb-1">
                Quantity
              </label>
              <input
                type="number"
                step="0.01"
                value={currentItem.quantity ?? ""}
                onChange={(e) =>
                  setCurrentItem((p) => ({ ...p, quantity: e.target.value }))
                }
                readOnly={hasConfiguredVariants(currentItem?.variantRows)}
                className={`h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 outline-none ${
                  hasConfiguredVariants(currentItem?.variantRows)
                    ? "bg-slate-50"
                    : "bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                }`}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-600 mb-1">
                Remarks
              </label>
              <input
                type="text"
                value={currentItem.remarks}
                onChange={(e) =>
                  setCurrentItem((p) => ({ ...p, remarks: e.target.value }))
                }
                className="h-11 border bg-white border-slate-200 rounded-xl px-3 w-full text-slate-900 outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
              />
            </div>
            {role === "superAdmin" || role === "admin" ? (
              <div className="mt-4">
                <label className="block text-sm text-slate-600 mb-1">
                  Status
                </label>
                <select
                  value={currentItem.status || ""}
                  onChange={(e) =>
                    setCurrentItem((p) => ({
                      ...p,
                      status: e.target.value,
                    }))
                  }
                  className="h-11 border bg-white border-slate-200 rounded-xl px-3 w-full text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            ) : (
              <div className="mt-4">
                <label className="block text-sm text-slate-600 mb-1">
                  Note
                </label>
                <textarea
                  value={currentItem?.note || ""}
                  onChange={(e) =>
                    setCurrentItem((p) => ({ ...p, note: e.target.value }))
                  }
                  className="min-h-[90px] border border-slate-200 rounded-xl p-3 w-full text-slate-900 outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 h-11 rounded-xl font-semibold"
                onClick={handleUpdate}
              >
                Save
              </button>
              <button
                className="bg-white hover:bg-slate-50 text-slate-800 px-4 h-11 rounded-xl border border-slate-200 font-semibold"
                onClick={closeEdit}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Note Modal */}
      {isEditOpen1 && currentItem && (
        <div className="fixed inset-0 flex items-center justify-center   p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl w-full md:w-1/3 border border-slate-200"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-slate-900">Edit Note</h2>

            <div className="mt-4">
              <label className="block text-sm text-slate-600 mb-1">Note</label>
              <textarea
                value={currentItem?.note || ""}
                onChange={(e) =>
                  setCurrentItem((p) => ({ ...p, note: e.target.value }))
                }
                className="min-h-[110px] border border-slate-200 rounded-xl p-3 w-full text-slate-900 outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 h-11 rounded-xl font-semibold"
                onClick={handleUpdate1}
              >
                Save
              </button>
              <button
                className="bg-white hover:bg-slate-50 text-slate-800 px-4 h-11 rounded-xl border border-slate-200 font-semibold"
                onClick={closeEdit1}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Modal */}
      {/* {isAddOpen && (
        <div className="fixed top-42 inset-0 flex items-center justify-center   p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl w-full md:w-1/3 border border-slate-200"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Add Product
            </h2>

            <form onSubmit={handleCreate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mt-4">
                  <label className="block text-sm text-slate-600 mb-1">
                    Name
                  </label>
                  <Select
                    options={receivedDropdownOptions}
                    value={
                      receivedDropdownOptions.find(
                        (o) => o.value === String(createForm.receivedId),
                      ) || null
                    }
                    onChange={(selected) =>
                      setCreateForm((p) => ({
                        ...p,
                        productId: String(
                          receivedData.find(
                            (item) =>
                              String(item.Id) === String(selected?.value),
                          )?.productId || "",
                        ),
                        receivedId: selected?.value || "",
                        variantRows: [createEmptyVariantRow()],
                        quantity: "",
                      }))
                    }
                    placeholder={
                      receivedLoading ? "Loading..." : "Select Product"
                    }
                    isClearable
                    isDisabled={receivedLoading}
                    styles={selectStyles}
                    className="text-black"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm text-slate-700">Date</label>
                  <input
                    type="date"
                    value={createForm?.date || ""}
                    onChange={(e) =>
                      setCreateForm((p) => ({ ...p, date: e.target.value }))
                    }
                    className="border bg-white border-slate-200 rounded-xl p-2 w-full mt-1 text-slate-900 outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Product Variants
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Add size, color and quantity combinations
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addVariantRow("create")}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 transition"
                    disabled={!createForm?.receivedId}
                  >
                    <Plus size={14} />
                    Add Variant
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {normalizeVariantRows(createForm?.variantRows).map(
                    (row, index) => {
                      const colorOptions = row.size
                        ? getVariationColorsForSize(
                            selectedCreateProductData,
                            row.size,
                          )
                        : createColorOptions;

                      return (
                        <div
                          key={`create-variant-${index}`}
                          className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_140px_auto] gap-3 items-end"
                        >
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                              Size
                            </label>
                            <Select
                              options={createSizeOptions}
                              value={
                                createSizeOptions.find(
                                  (option) => option.value === row.size,
                                ) || null
                              }
                              onChange={(selected) =>
                                updateVariantRow(
                                  "create",
                                  index,
                                  "size",
                                  selected?.value || "",
                                )
                              }
                              placeholder="Select size..."
                              isClearable
                              styles={selectStyles}
                              className="text-sm font-medium"
                              isDisabled={
                                !createForm?.receivedId ||
                                createSizeOptions.length === 0
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                              Color
                            </label>
                            <Select
                              options={colorOptions}
                              value={
                                colorOptions.find(
                                  (option) => option.value === row.color,
                                ) || null
                              }
                              onChange={(selected) =>
                                updateVariantRow(
                                  "create",
                                  index,
                                  "color",
                                  selected?.value || "",
                                )
                              }
                              placeholder="Select color..."
                              isClearable
                              styles={selectStyles}
                              className="text-sm font-medium"
                              isDisabled={
                                !row.size || colorOptions.length === 0
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.quantity}
                              onChange={(e) =>
                                updateVariantRow(
                                  "create",
                                  index,
                                  "quantity",
                                  e.target.value,
                                )
                              }
                              className="h-11 border bg-white border-slate-200 rounded-xl px-3 w-full text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                              placeholder="0"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => removeVariantRow("create", index)}
                            className="h-11 w-11 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition disabled:opacity-50"
                            disabled={
                              normalizeVariantRows(createForm?.variantRows)
                                .length === 1
                            }
                          >
                            <span className="mx-auto block text-base leading-none">
                              x
                            </span>
                          </button>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-700">
                  Warehouse
                </label>
                <select
                  value={createForm?.warehouseId || ""}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      warehouseId: e.target.value,
                    })
                  }
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                >
                  <option value="">Select Warehouse</option>
                  {isLoadingWarehouse ? (
                    <option disabled>Loading...</option>
                  ) : (
                    warehouses?.map((w) => (
                      <option key={w.Id} value={w.Id}>
                        {w.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-700">Supplier</label>
                <select
                  value={createForm?.supplierId || ""}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      supplierId: e.target.value,
                    })
                  }
                  className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  required
                >
                  <option value="">Select Supplier</option>
                  {isLoadingSupplier ? (
                    <option disabled>Loading...</option>
                  ) : (
                    suppliers?.map((s) => (
                      <option key={s.Id} value={s.Id}>
                        {s.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-600 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={createForm.quantity}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, quantity: e.target.value }))
                  }
                  readOnly={hasConfiguredVariants(createForm?.variantRows)}
                  className={`h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 outline-none ${
                    hasConfiguredVariants(createForm?.variantRows)
                      ? "bg-slate-50"
                      : "bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                  }`}
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-600 mb-1">
                  Remarks
                </label>
                <input
                  type="text"
                  value={createForm.remarks}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, remarks: e.target.value }))
                  }
                  className="h-11 border bg-white border-slate-200 rounded-xl px-3 w-full text-slate-900 outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-700">Note</label>
                <textarea
                  value={createForm?.note || ""}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      note: e.target.value,
                    })
                  }
                  className="min-h-[90px] border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 h-11 rounded-xl font-semibold"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="bg-white hover:bg-slate-50 text-slate-800 px-4 h-11 rounded-xl border border-slate-200 font-semibold"
                  onClick={closeAdd}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )} */}

      <Modal
        isOpen={isAddOpen}
        onClose={closeAdd}
        title="Add Damage Repaired Product"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mt-4">
              <label className="block text-sm text-slate-600 mb-1">Name</label>
              <Select
                options={receivedDropdownOptions}
                value={
                  receivedDropdownOptions.find(
                    (o) => o.value === String(createForm.receivedId),
                  ) || null
                }
                onChange={(selected) =>
                  setCreateForm((p) => ({
                    ...p,
                    productId: String(
                      receivedData.find(
                        (item) => String(item.Id) === String(selected?.value),
                      )?.productId || "",
                    ),
                    receivedId: selected?.value || "",
                    variantRows: [createEmptyVariantRow()],
                    quantity: "",
                  }))
                }
                placeholder={receivedLoading ? "Loading..." : "Select Product"}
                isClearable
                isDisabled={receivedLoading}
                styles={selectStyles}
                className="text-black"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm text-slate-700">Date</label>
              <input
                type="date"
                value={createForm?.date || ""}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, date: e.target.value }))
                }
                className="border bg-white border-slate-200 rounded-xl p-2 w-full mt-1 text-slate-900 outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
              />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Product Variants
                </p>
                <p className="text-[11px] text-slate-400">
                  Add size, color and quantity combinations
                </p>
              </div>
              <button
                type="button"
                onClick={() => addVariantRow("create")}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 transition"
                disabled={!createForm?.receivedId}
              >
                <Plus size={14} />
                Add Variant
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {normalizeVariantRows(createForm?.variantRows).map(
                (row, index) => {
                  const colorOptions = row.size
                    ? getVariationColorsForSize(
                        selectedCreateProductData,
                        row.size,
                      )
                    : createColorOptions;

                  return (
                    <div
                      key={`create-variant-${index}`}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_140px_auto] gap-3 items-end"
                    >
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                          Size / Code
                        </label>
                        <Select
                          options={createSizeOptions}
                          value={
                            createSizeOptions.find(
                              (option) => option.value === row.size,
                            ) || null
                          }
                          onChange={(selected) =>
                            updateVariantRow(
                              "create",
                              index,
                              "size",
                              selected?.value || "",
                            )
                          }
                          placeholder="Select size..."
                          isClearable
                          styles={selectStyles}
                          className="text-sm font-medium"
                          isDisabled={
                            !createForm?.receivedId ||
                            createSizeOptions.length === 0
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                          Color
                        </label>
                        <Select
                          options={colorOptions}
                          value={
                            colorOptions.find(
                              (option) => option.value === row.color,
                            ) || null
                          }
                          onChange={(selected) =>
                            updateVariantRow(
                              "create",
                              index,
                              "color",
                              selected?.value || "",
                            )
                          }
                          placeholder="Select color..."
                          isClearable
                          styles={selectStyles}
                          className="text-sm font-medium"
                          isDisabled={!row.size || colorOptions.length === 0}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.quantity}
                          onChange={(e) =>
                            updateVariantRow(
                              "create",
                              index,
                              "quantity",
                              e.target.value,
                            )
                          }
                          className="h-11 border bg-white border-slate-200 rounded-xl px-3 w-full text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
                          placeholder="0"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeVariantRow("create", index)}
                        className="h-11 w-11 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition disabled:opacity-50"
                        disabled={
                          normalizeVariantRows(createForm?.variantRows)
                            .length === 1
                        }
                      >
                        <span className="mx-auto block text-base leading-none">
                          x
                        </span>
                      </button>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-slate-700">Warehouse</label>
            <select
              value={createForm?.warehouseId || ""}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  warehouseId: e.target.value,
                })
              }
              className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
              required
            >
              <option value="">Select Warehouse</option>
              {isLoadingWarehouse ? (
                <option disabled>Loading...</option>
              ) : (
                warehouses?.map((w) => (
                  <option key={w.Id} value={w.Id}>
                    {w.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-slate-700">Supplier</label>
            <select
              value={createForm?.supplierId || ""}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  supplierId: e.target.value,
                })
              }
              className="h-11 border border-slate-200 rounded-xl px-3 w-full mt-1 text-slate-900 bg-white outline-none
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
              required
            >
              <option value="">Select Supplier</option>
              {isLoadingSupplier ? (
                <option disabled>Loading...</option>
              ) : (
                suppliers?.map((s) => (
                  <option key={s.Id} value={s.Id}>
                    {s.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-slate-600 mb-1">
              Quantity
            </label>
            <input
              type="number"
              step="0.01"
              value={createForm.quantity}
              onChange={(e) =>
                setCreateForm((p) => ({ ...p, quantity: e.target.value }))
              }
              readOnly={hasConfiguredVariants(createForm?.variantRows)}
              className={`h-11 border border-slate-200 rounded-xl px-3 w-full text-slate-900 outline-none ${
                hasConfiguredVariants(createForm?.variantRows)
                  ? "bg-slate-50"
                  : "bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
              }`}
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm text-slate-600 mb-1">Remarks</label>
            <input
              type="text"
              value={createForm.remarks}
              onChange={(e) =>
                setCreateForm((p) => ({ ...p, remarks: e.target.value }))
              }
              className="h-11 border bg-white border-slate-200 rounded-xl px-3 w-full text-slate-900 outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm text-slate-700">Note</label>
            <textarea
              value={createForm?.note || ""}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  note: e.target.value,
                })
              }
              className="min-h-[90px] border border-slate-200 rounded-xl p-3 w-full mt-1 text-slate-900 bg-white outline-none
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 h-11 rounded-xl font-semibold"
            >
              Save
            </button>
            <button
              type="button"
              className="bg-white hover:bg-slate-50 text-slate-800 px-4 h-11 rounded-xl border border-slate-200 font-semibold"
              onClick={closeAdd}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default DamageRepairTable;

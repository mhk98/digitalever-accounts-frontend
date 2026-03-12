import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Notebook,
  Plus,
  ShoppingBasket,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

import Modal from "../common/Modal";
import { useLayout } from "../../context/LayoutContext";
import { translations } from "../../utils/translations";
import {
  useDeleteMixerMutation,
  useGetAllMixerQuery,
  useInsertMixerMutation,
  useUpdateMixerMutation,
} from "../../features/mixer/mixer";
import { useGetAllItemWithoutQueryQuery } from "../../features/item/item";
import {
  useGetAllItemMasterWithoutQueryQuery,
} from "../../features/manufactureStock/manufactureStock";
import { useGetAllProductWithoutQueryQuery } from "../../features/product/product";

const initialCreateProduct = {
  itemId: "",
  unitValue: "",
  cost: "",
  note: "",
  date: new Date().toISOString().slice(0, 10),
  hasUnit: false,
  unit: "Pcs",
  mixerDetails: {
    attarBottleId: "",
    attarBottleQty: "",
    attarAmountId: "",
    attarAmountQty: "",
    packetId: "",
    packetQty: "",
    datesAmountId: "",
    datesAmountQty: "",
  },
};

const getMixerTypeFromName = (name = "") => {
  const normalizedName = String(name).toLowerCase();

  if (normalizedName.includes("attar")) {
    return "attar";
  }

  if (
    normalizedName.includes("dates") ||
    normalizedName.includes("khajur") ||
    normalizedName.includes("khejur") ||
    normalizedName.includes("খেজুর")
  ) {
    return "dates";
  }

  return "";
};

const getMixerDetailFields = (mixerType) => {
  if (mixerType === "attar") {
    return [
      {
        key: "attarBottleId",
        qtyKey: "attarBottleQty",
        label: "Attar Bottle",
        placeholder: "Select attar bottle",
        keywords: ["attar", "bottle", "botol"],
      },
      {
        key: "attarAmountId",
        qtyKey: "attarAmountQty",
        label: "Liquid Attar",
        aliases: ["Attar Amount"],
        placeholder: "Select liquid attar",
        keywords: ["attar"],
        excludeKeywords: ["bottle", "botol", "packet", "pack", "pouch"],
      },
      {
        key: "packetId",
        qtyKey: "packetQty",
        label: "Packet",
        placeholder: "Select packet",
        keywords: ["packet", "pack", "pouch"],
      },
    ];
  }

  if (mixerType === "dates") {
    return [
      {
        key: "datesAmountId",
        qtyKey: "datesAmountQty",
        label: "Dates Amount",
        placeholder: "Select dates",
        keywords: ["dates", "khajur", "khejur", "খেজুর", "date"],
      },
      {
        key: "packetId",
        qtyKey: "packetQty",
        label: "Packet",
        placeholder: "Select packet",
        keywords: ["packet", "pack", "pouch"],
      },
    ];
  }

  return [];
};

const parseMixerDetailsFromNote = (
  note = "",
  mixerType,
  detailFields,
  optionMap,
) => {
  if (!note || !mixerType || !detailFields.length) {
    return initialCreateProduct.mixerDetails;
  }

  const parsedDetails = { ...initialCreateProduct.mixerDetails };
  const noteLines = String(note)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  detailFields.forEach((field) => {
    const acceptedLabels = [field.label, ...(field.aliases || [])];
    const matchingLine = noteLines.find((line) =>
      acceptedLabels.some((label) =>
        line.toLowerCase().startsWith(`${label.toLowerCase()}:`),
      ),
    );

    if (!matchingLine) return;

    const matchedLabelPrefix =
      acceptedLabels.find((label) =>
        matchingLine.toLowerCase().startsWith(`${label.toLowerCase()}:`),
      ) || field.label;
    const lineContent = matchingLine.slice(matchedLabelPrefix.length + 1).trim();
    const matchedOption = Array.from(optionMap.entries()).find(([, label]) =>
      lineContent.startsWith(label),
    );

    if (!matchedOption) return;

    const [matchedId, matchedLabel] = matchedOption;
    const quantityText = lineContent.slice(matchedLabel.length).trim();
    const quantityMatch = quantityText.match(/^x\s*([0-9]+(?:\.[0-9]+)?)$/i);

    parsedDetails[field.key] = matchedId;
    parsedDetails[field.qtyKey] = quantityMatch?.[1] || "";
  });

  return parsedDetails;
};

const buildMixerDetailsNote = (
  mixerType,
  mixerDetails,
  detailFields,
  optionMap,
) => {
  if (!mixerType) return "";

  const lines = detailFields
    .map((field) => {
      const selectedId = mixerDetails?.[field.key];
      const quantity = mixerDetails?.[field.qtyKey];

      if (!selectedId || !quantity) return "";

      const optionLabel = optionMap.get(String(selectedId)) || field.label;
      return `${field.label}: ${optionLabel} x ${quantity}`;
    })
    .filter(Boolean);

  if (!lines.length) return "";

  const sectionTitle =
    mixerType === "attar"
      ? "Mixer Details (Attar)"
      : "Mixer Details (Dates)";

  return [sectionTitle, ...lines].join("\n");
};

const MixerTable = () => {
  const { language } = useLayout();
  const t = translations[language] || translations.EN;

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  const [currentProduct, setCurrentProduct] = useState(null);
  const [createProduct, setCreateProduct] = useState(initialCreateProduct);

  const [rows, setRows] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [itemName, setItemName] = useState("");

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");

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
  }, [startDate, endDate, itemName, itemsPerPage]);

  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);

    if (pageNumber < startPage) {
      setStartPage(pageNumber);
    } else if (pageNumber > endPage) {
      setStartPage(pageNumber - pagesPerSet + 1);
    }
  };

  const handlePreviousSet = () => {
    setStartPage((prev) => Math.max(prev - pagesPerSet, 1));
  };

  const handleNextSet = () => {
    setStartPage((prev) =>
      Math.min(prev + pagesPerSet, totalPages - pagesPerSet + 1),
    );
  };

  const {
    data: allProductsRes,
    isLoading: isLoadingAllProducts,
    isError: isErrorAllProducts,
    error: errorAllProducts,
  } = useGetAllItemWithoutQueryQuery();
  const { data: allProductsCatalogRes } = useGetAllProductWithoutQueryQuery();
  const { data: allItemMasterRes, isLoading: isLoadingItemMaster } =
    useGetAllItemMasterWithoutQueryQuery();

  const productsData = allProductsRes?.data || [];
  const productsCatalogData = allProductsCatalogRes?.data || [];
  const itemMasterData = allItemMasterRes?.data || [];

  useEffect(() => {
    if (isErrorAllProducts) {
      console.error("Error fetching products", errorAllProducts);
    }
  }, [isErrorAllProducts, errorAllProducts]);

  const productDropdownOptions = useMemo(() => {
    return (productsData || []).map((p) => ({
      value: String(p.Id ?? p.id ?? p._id),
      label: p.name,
    }));
  }, [productsData]);

  const itemNameMap = useMemo(() => {
    const m = new Map();
    (productsData || []).forEach((p) => {
      const key = String(p.Id ?? p.id ?? p._id);
      m.set(key, p.name);
    });
    return m;
  }, [productsData]);

  const productNameMap = useMemo(() => {
    const m = new Map();
    (productsCatalogData || []).forEach((p) => {
      const key = String(p.Id ?? p.id ?? p._id);
      m.set(key, p.name);
    });
    return m;
  }, [productsCatalogData]);

  const selectedCreateProductName = useMemo(() => {
    if (!createProduct?.itemId) return "";
    return itemNameMap.get(String(createProduct.itemId)) || "";
  }, [createProduct?.itemId, itemNameMap]);

  const selectedCurrentProductName = useMemo(() => {
    if (!currentProduct?.itemId) return "";
    return itemNameMap.get(String(currentProduct.itemId)) || "";
  }, [currentProduct?.itemId, itemNameMap]);

  const createMixerType = useMemo(
    () => getMixerTypeFromName(selectedCreateProductName),
    [selectedCreateProductName],
  );

  const currentMixerType = useMemo(
    () => getMixerTypeFromName(selectedCurrentProductName),
    [selectedCurrentProductName],
  );

  const createMixerDetailFields = useMemo(
    () => getMixerDetailFields(createMixerType),
    [createMixerType],
  );

  const currentMixerDetailFields = useMemo(
    () => getMixerDetailFields(currentMixerType),
    [currentMixerType],
  );

  const itemMasterOptions = useMemo(() => {
    return (itemMasterData || []).map((row) => {
      const itemId = String(
        row.itemId ??
          row.item_id ??
          row.ItemId ??
          row.productId ??
          row.product_id ??
          row.ProductId ??
          row.item?.Id ??
          row.item?.id ??
          row.product?.Id ??
          row.product?.id ??
          "",
      );

      const itemName =
        row.itemName ||
        row.name ||
        row.item?.name ||
        row.product?.name ||
        itemNameMap.get(itemId) ||
        productNameMap.get(itemId) ||
        `Item #${itemId}`;

      return {
        value: String(row.Id ?? row.id ?? row._id),
        label: `${itemName}${row.quantity ? ` (Stock: ${row.quantity})` : ""}`,
        searchName: String(itemName).toLowerCase(),
        quantity: Number(row.quantity || 0),
        row,
      };
    });
  }, [itemMasterData, itemNameMap, productNameMap]);

  const itemMasterOptionMap = useMemo(() => {
    const m = new Map();
    itemMasterOptions.forEach((option) =>
      m.set(String(option.value), option.label),
    );
    return m;
  }, [itemMasterOptions]);

  const itemMasterRowMap = useMemo(() => {
    const m = new Map();
    itemMasterOptions.forEach((option) =>
      m.set(String(option.value), option.row),
    );
    return m;
  }, [itemMasterOptions]);

  const getFilteredDetailOptions = (field) => {
    const keywords = field.keywords || [];
    const excludeKeywords = field.excludeKeywords || [];

    const filtered = itemMasterOptions.filter((option) => {
      const matchesKeyword =
        !keywords.length ||
        keywords.some((keyword) =>
          option.searchName.includes(keyword.toLowerCase()),
        );

      const excluded = excludeKeywords.some((keyword) =>
        option.searchName.includes(keyword.toLowerCase()),
      );

      return matchesKeyword && !excluded;
    });

    return filtered.map(({ value, label }) => ({ value, label }));
  };

  // const resolveItemName = (rp) => {
  //   const pid =
  //     rp.itemId ??
  //     rp.item_id ??
  //     rp.ItemId ??
  //     rp.item?.Id ??
  //     rp.item?.id ??
  //     rp.item?._id;

  //   if (rp.itemName) return rp.itemName;
  //   if (rp.item?.name) return rp.item?.name;
  //   if (pid === null || pid === undefined || pid === "") return "N/A";

  //   return itemNameMap.get(String(pid)) || "N/A";
  // };

  const resolveItemName = (rp) => {
    const possibleName =
      rp?.itemName ||
      rp?.name ||
      rp?.item?.name ||
      rp?.Item?.name ||
      rp?.product?.name ||
      rp?.Product?.name ||
      "";

    if (possibleName) return possibleName;

    const possibleId =
      rp?.itemId ??
      rp?.item_id ??
      rp?.ItemId ??
      rp?.productId ??
      rp?.product_id ??
      rp?.ProductId ??
      rp?.manufactureItemId ??
      rp?.item?.Id ??
      rp?.item?.id ??
      rp?.item?._id ??
      rp?.Item?.Id ??
      rp?.Item?.id ??
      rp?.product?.Id ??
      rp?.product?.id ??
      rp?.product?._id ??
      "";

    if (possibleId === "" || possibleId === null || possibleId === undefined) {
      return "N/A";
    }

    const matchedName = itemNameMap.get(String(possibleId));
    return matchedName || `Item #${possibleId}`;
  };
  const queryArgs = useMemo(() => {
    const args = {
      page: currentPage,
      limit: itemsPerPage,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      name: itemName || undefined,
    };

    Object.keys(args).forEach((k) => {
      if (args[k] === undefined || args[k] === null || args[k] === "") {
        delete args[k];
      }
    });

    return args;
  }, [currentPage, itemsPerPage, startDate, endDate, itemName]);

  const { data, isLoading, isError, error, refetch } =
    useGetAllMixerQuery(queryArgs);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching received product data", error);
      return;
    }

    if (!isLoading && data) {
      setRows(data.data || []);
      setTotalPages(
        Math.max(1, Math.ceil((data?.meta?.count || 0) / itemsPerPage)),
      );
    }
  }, [data, isLoading, isError, error, itemsPerPage]);

  const [insertMixer] = useInsertMixerMutation();
  const [updateMixer] = useUpdateMixerMutation();
  const [deleteMixer] = useDeleteMixerMutation();

  const handleAddProduct = () => setIsModalOpen1(true);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleModalClose1 = () => {
    setIsModalOpen1(false);
    setCreateProduct(initialCreateProduct);
  };

  const handleModalClose2 = () => {
    setIsModalOpen2(false);
    setCurrentProduct(null);
  };

  const handleEditClick = (rp) => {
    const nextItemId = rp.itemId ? String(rp.itemId) : "";
    const mixerType = getMixerTypeFromName(itemNameMap.get(nextItemId) || "");
    const detailFields = getMixerDetailFields(mixerType);
    const parsedMixerDetails = parseMixerDetailsFromNote(
      rp.note ?? "",
      mixerType,
      detailFields,
      itemMasterOptionMap,
    );

    setCurrentProduct({
      ...rp,
      itemId: nextItemId,
      date: rp.date ?? "",
      note: rp.note ?? "",
      cost: rp.cost ?? "",
      unitValue: rp.unitValue ?? "",
      unit: rp.unit ?? "Pcs",
      hasUnit: !!rp.unitValue,
      mixerDetails: parsedMixerDetails,
      userId,
    });

    setIsModalOpen(true);
  };

  const handleEditClick1 = (rp) => {
    const nextItemId = rp.itemId ? String(rp.itemId) : "";
    const mixerType = getMixerTypeFromName(itemNameMap.get(nextItemId) || "");
    const detailFields = getMixerDetailFields(mixerType);
    const parsedMixerDetails = parseMixerDetailsFromNote(
      rp.note ?? "",
      mixerType,
      detailFields,
      itemMasterOptionMap,
    );

    setCurrentProduct({
      ...rp,
      itemId: nextItemId,
      date: rp.date ?? "",
      note: rp.note ?? "",
      cost: rp.cost ?? "",
      unitValue: rp.unitValue ?? "",
      unit: rp.unit ?? "Pcs",
      hasUnit: !!rp.unitValue,
      mixerDetails: parsedMixerDetails,
      userId,
    });

    setIsModalOpen2(true);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!createProduct.itemId) {
      return toast.error("Please select a product");
    }

    if (createMixerDetailFields.length) {
      for (const field of createMixerDetailFields) {
        if (!createProduct?.mixerDetails?.[field.key]) {
          return toast.error(`Please select ${field.label}`);
        }

        if (
          !createProduct?.mixerDetails?.[field.qtyKey] ||
          Number(createProduct.mixerDetails[field.qtyKey]) <= 0
        ) {
          return toast.error(`Please enter valid quantity for ${field.label}`);
        }

        const selectedRow = itemMasterRowMap.get(
          String(createProduct.mixerDetails[field.key]),
        );
        const availableQuantity = Number(selectedRow?.quantity || 0);
        const requestedQuantity = Number(createProduct.mixerDetails[field.qtyKey]);

        if (requestedQuantity > availableQuantity) {
          return toast.error(
            `${field.label} stock only ${availableQuantity}. Please reduce quantity.`,
          );
        }
      }
    }

    try {
      const generatedDetailsNote = buildMixerDetailsNote(
        createMixerType,
        createProduct.mixerDetails,
        createMixerDetailFields,
        itemMasterOptionMap,
      );

      const finalNote = [generatedDetailsNote, createProduct.note || ""]
        .filter(Boolean)
        .join("\n\n");

      const payload = {
        itemId: Number(createProduct.itemId) || "",
        unit: createProduct.unit || "Pcs",
        unitValue: createProduct.hasUnit
          ? Number(createProduct.unitValue) || 0
          : 0,
        cost: Number(createProduct.cost) || 0,
        date: createProduct.date || "",
        note: finalNote,
        userId: Number(userId) || 0,
        actorRole: role,
      };

      const res = await insertMixer(payload).unwrap();

      if (res?.success) {
        toast.success("Successfully created!");
        setIsModalOpen1(false);
        setCreateProduct(initialCreateProduct);
        refetch?.();
      } else {
        toast.error(res?.message || "Create failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  const handleUpdateProduct = async () => {
    try {
      if (currentMixerDetailFields.length) {
        for (const field of currentMixerDetailFields) {
          if (!currentProduct?.mixerDetails?.[field.key]) {
            return toast.error(`Please select ${field.label}`);
          }

          if (
            !currentProduct?.mixerDetails?.[field.qtyKey] ||
            Number(currentProduct.mixerDetails[field.qtyKey]) <= 0
          ) {
            return toast.error(
              `Please enter valid quantity for ${field.label}`,
            );
          }
        }
      }

      const generatedDetailsNote = buildMixerDetailsNote(
        currentMixerType,
        currentProduct?.mixerDetails,
        currentMixerDetailFields,
        itemMasterOptionMap,
      );

      const existingNoteWithoutMixerDetails = String(currentProduct.note || "")
        .split("\n")
        .filter(
          (line) =>
            !line.startsWith("Mixer Details (Attar)") &&
            !line.startsWith("Mixer Details (Attar Combo)") &&
            !line.startsWith("Mixer Details (Dates)") &&
            !line.startsWith("Attar Bottle:") &&
            !line.startsWith("Attar Amount:") &&
            !line.startsWith("Liquid Attar:") &&
            !line.startsWith("Dates Amount:") &&
            !line.startsWith("Packet:"),
        )
        .join("\n")
        .trim();

      const finalNote = [generatedDetailsNote, existingNoteWithoutMixerDetails]
        .filter(Boolean)
        .join("\n\n");

      const payload = {
        itemId: Number(currentProduct.itemId) || "",
        unit: currentProduct.unit || "Pcs",
        unitValue: currentProduct.hasUnit
          ? Number(currentProduct.unitValue) || 0
          : 0,
        cost: Number(currentProduct.cost) || 0,
        date: currentProduct.date || "",
        note: finalNote,
        userId: Number(currentProduct.userId) || 0,
        actorRole: role,
      };

      const res = await updateMixer({
        id: currentProduct.Id,
        data: payload,
      }).unwrap();

      if (res?.success) {
        toast.success("Successfully updated!");
        setIsModalOpen(false);
        setCurrentProduct(null);
        refetch?.();
      } else {
        toast.error(res?.message || "Update failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const handleUpdateProduct1 = async () => {
    if (!currentProduct?.Id) return toast.error("Invalid item!");
    if (!currentProduct?.note?.trim()) {
      return toast.error("Note is required!");
    }

    try {
      const payload = {
        itemId: Number(currentProduct.itemId) || "",
        unit: currentProduct.unit || "Pcs",
        unitValue: currentProduct.hasUnit
          ? Number(currentProduct.unitValue) || 0
          : 0,
        cost: Number(currentProduct.cost) || 0,
        date: currentProduct.date || "",
        note: currentProduct.note || "",
        userId: Number(currentProduct.userId) || 0,
        actorRole: role,
      };

      const res = await updateMixer({
        id: currentProduct.Id,
        data: payload,
      }).unwrap();

      if (res?.success) {
        toast.success("Successfully updated product!");
        setIsModalOpen2(false);
        setCurrentProduct(null);
        refetch?.();
      } else {
        toast.error(res?.message || "Update failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm("Do you want to delete this product?");
    if (!confirmDelete) return toast.info("Delete action was cancelled.");

    try {
      const res = await deleteMixer(id).unwrap();

      if (res?.success) {
        toast.success("Product deleted successfully!");
        refetch?.();
      } else {
        toast.error(res?.message || "Delete failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setItemName("");
  };

  const handleNoteClick = (note) => {
    setNoteContent(note);
    setIsNoteModalOpen(true);
  };

  const handleNoteModalClose = () => {
    setIsNoteModalOpen(false);
    setNoteContent("");
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: 14,
      borderColor: state.isFocused ? "#c7d2fe" : "#e2e8f0",
      boxShadow: state.isFocused ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
      "&:hover": { borderColor: "#cbd5e1" },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 12px" }),
    placeholder: (base) => ({ ...base, color: "#64748b" }),
    menu: (base) => ({ ...base, borderRadius: 14, overflow: "hidden" }),
  };

  const handleCreateMixerDetailChange = (key, value) => {
    setCreateProduct((prev) => ({
      ...prev,
      mixerDetails: {
        ...prev.mixerDetails,
        [key]: value,
      },
    }));
  };

  const handleCurrentMixerDetailChange = (key, value) => {
    setCurrentProduct((prev) => ({
      ...prev,
      mixerDetails: {
        ...prev?.mixerDetails,
        [key]: value,
      },
    }));
  };

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(15,23,42,0.04)] rounded-2xl p-4 sm:p-6 border border-slate-200 mb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t.manufacture_history || "Manufacture History"}
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            {t.track_manufacture_entries ||
              "Track and manage manufacture entries"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="inline-flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-5 py-2.5 rounded-2xl shadow-sm shadow-indigo-50">
            <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
              <ShoppingBasket size={18} />
            </div>
            <div>
              <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                {t.total_entries || "Total Entries"}
              </div>
              <div className="text-base font-black text-indigo-900 tabular-nums leading-none">
                {isLoading ? "..." : (data?.meta?.count ?? 0).toLocaleString()}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddProduct}
            className="group relative inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white transition-all px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 active:scale-95 overflow-hidden w-full sm:w-auto"
          >
            <Plus size={18} /> {t.add_new || "Add New"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 items-end">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            {t.from}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-medium text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            {t.to}
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-medium text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            {t.per_page_label || "Per Page"}
          </label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="h-11 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold text-sm appearance-none cursor-pointer"
          >
            {[10, 20, 50, 100].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            {t.product || "Product"}
          </label>
          <Select
            options={productDropdownOptions}
            value={
              productDropdownOptions.find((o) => o.label === itemName) || null
            }
            onChange={(selected) => setItemName(selected?.label || "")}
            placeholder={t.search || "Search"}
            isClearable
            isDisabled={isLoadingAllProducts}
            styles={selectStyles}
            className="text-black"
          />
        </div>

        <button
          type="button"
          className="h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 transition rounded-xl px-4 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 border border-slate-200"
          onClick={clearFilters}
        >
          <X size={16} /> {t.clear_filters || "Clear Filters"}
        </button>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.date || "Date"}
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.product || "Product"}
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.unit || "Unit"}
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.unit_value || "Unit Value"}
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.cost || "Cost"}
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.status || "Status"}
                </th>
                <th className="px-6 py-5 text-center text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.actions || "Actions"}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((rp) => (
                <motion.tr
                  key={rp.Id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-slate-50 group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {rp.date || "-"}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">
                      {resolveItemName(rp)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp.unit || "Pcs"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {Number(rp.unitValue || 0)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    ৳{Number(rp.cost || 0).toLocaleString()}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                        rp.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100"
                          : rp.status === "Active"
                            ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm shadow-blue-100"
                            : "bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-100"
                      }`}
                    >
                      {rp.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {rp.note ? (
                        <div className="relative">
                          <button
                            className="relative h-10 w-10 rounded-md flex items-center justify-center"
                            title={rp.note}
                            type="button"
                            onClick={() => handleNoteClick(rp.note)}
                          >
                            <Notebook size={18} className="text-slate-700" />
                          </button>

                          <span className="absolute top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center">
                            1
                          </span>
                        </div>
                      ) : (
                        <button
                          className="h-10 w-10 rounded-md flex items-center justify-center cursor-default"
                          title={t.no_note_available || "No note available"}
                          type="button"
                        >
                          <Notebook size={18} className="text-slate-300" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleEditClick(rp)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition shadow-sm"
                        title={t.edit_record || "Edit"}
                      >
                        <Edit size={16} />
                      </button>

                      {role === "superAdmin" || role === "admin" ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(rp.Id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition shadow-sm"
                          title={t.delete_record || "Delete"}
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEditClick1(rp)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition shadow-sm"
                          title={t.request_delete || "Request Delete"}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-20 text-center text-sm text-slate-400 italic"
                  >
                    {t.no_data_found || "No data found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-10 gap-6 px-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          {t.showing_page || "Showing Page"}{" "}
          <span className="text-indigo-600">{currentPage}</span> {t.of || "of"}{" "}
          <span className="text-slate-900">{totalPages}</span>
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousSet}
            disabled={startPage === 1}
            className="h-11 px-5 border border-slate-200 rounded-2xl bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-50 transition active:scale-95 flex items-center gap-2 shadow-sm"
          >
            <ChevronLeft size={16} /> {t.prev || "Prev"}
          </button>

          <div className="flex items-center gap-1.5">
            {[...Array(endPage - startPage + 1)].map((_, index) => {
              const pageNum = startPage + index;
              const active = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`h-11 w-11 rounded-2xl font-black text-sm transition-all active:scale-90 ${
                    active
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                      : "bg-white text-slate-600 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextSet}
            disabled={endPage === totalPages}
            className="h-11 px-5 border border-slate-200 rounded-2xl bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-50 transition active:scale-95 flex items-center gap-2 shadow-sm"
          >
            {t.next || "Next"} <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <Modal
        isOpen={isNoteModalOpen}
        onClose={handleNoteModalClose}
        title={t.note_preview || "Note Preview"}
      >
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-h-[120px]">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {noteContent || t.no_note_available || "No note available."}
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleNoteModalClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition shadow-sm active:scale-95"
            >
              {t.done || "Done"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen && !!currentProduct}
        onClose={handleModalClose}
        title={t.edit_record || "Edit Record"}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              {t.select_product || "Select Product"}
            </label>
            <Select
              options={productDropdownOptions}
              value={
                productDropdownOptions.find(
                  (o) => o.value === String(currentProduct?.itemId),
                ) || null
              }
              onChange={(selected) =>
                setCurrentProduct((prev) => ({
                  ...prev,
                  itemId: selected?.value || "",
                  mixerDetails: initialCreateProduct.mixerDetails,
                }))
              }
              placeholder={t.search_product || "Search product..."}
              isClearable
              styles={selectStyles}
              className="text-sm font-medium"
              isDisabled={isLoadingAllProducts}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              {t.date || "Date"}
            </label>
            <input
              type="date"
              value={currentProduct?.date || ""}
              onChange={(e) =>
                setCurrentProduct((p) => ({ ...p, date: e.target.value }))
              }
              className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-1">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">
                  {t.unit_settings || "Unit Settings"}
                </span>
                <p className="text-[10px] font-bold text-slate-400">
                  {t.enable_if_needed || "Enable if needed"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCurrentProduct((prev) => ({
                    ...prev,
                    hasUnit: !prev?.hasUnit,
                    unitValue: prev?.hasUnit ? "" : prev?.unitValue || "",
                    unit: prev?.hasUnit ? "Pcs" : prev?.unit || "Pcs",
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  currentProduct?.hasUnit ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span className="sr-only">Toggle Unit</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    currentProduct?.hasUnit ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {currentProduct?.hasUnit && (
              <div className="bg-white rounded-xl border border-slate-100 m-1 p-4 space-y-3 shadow-sm">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t.unit_details || "Unit Details"}
                </label>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={currentProduct?.unitValue || ""}
                    onChange={(e) =>
                      setCurrentProduct((prev) => ({
                        ...prev,
                        unitValue: e.target.value,
                      }))
                    }
                    placeholder="30"
                    className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                  />

                  <select
                    value={currentProduct?.unit || "Pcs"}
                    onChange={(e) =>
                      setCurrentProduct((prev) => ({
                        ...prev,
                        unit: e.target.value,
                      }))
                    }
                    className="h-11 w-32 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition appearance-none cursor-pointer"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Kg">Kg</option>
                    <option value="Liter">Liter</option>
                    <option value="Box">Box</option>
                    <option value="Dozen">Dozen</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              {t.cost || "Cost"}
            </label>
            <input
              type="number"
              step="0.01"
              value={currentProduct?.cost || ""}
              onChange={(e) =>
                setCurrentProduct({ ...currentProduct, cost: e.target.value })
              }
              className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
            />
          </div>

          {currentMixerDetailFields.length > 0 && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  {currentMixerType === "attar"
                    ? "Attar Details"
                    : "Dates Details"}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mt-1">
                  Select each required item and enter its quantity.
                </p>
              </div>

              <div className="space-y-4">
                {currentMixerDetailFields.map((field) => {
                  const fieldOptions = getFilteredDetailOptions(field);

                  return (
                    <div
                      key={field.key}
                      className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_140px] gap-3"
                    >
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                          {field.label}
                        </label>
                        <Select
                          options={fieldOptions}
                          value={
                            fieldOptions.find(
                              (option) =>
                                option.value ===
                                String(
                                  currentProduct?.mixerDetails?.[field.key] ||
                                    "",
                                ),
                            ) || null
                          }
                          onChange={(selected) =>
                            handleCurrentMixerDetailChange(
                              field.key,
                              selected?.value || "",
                            )
                          }
                          placeholder={field.placeholder}
                          isClearable
                          styles={selectStyles}
                          className="text-sm text-black font-medium"
                          isDisabled={isLoadingItemMaster}
                          noOptionsMessage={() =>
                            "No matching stock item found"
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={
                            currentProduct?.mixerDetails?.[field.qtyKey] || ""
                          }
                          onChange={(e) =>
                            handleCurrentMixerDetailChange(
                              field.qtyKey,
                              e.target.value,
                            )
                          }
                          placeholder="0"
                          className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {role === "superAdmin" || role === "admin" ? (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.status || "Status"}
              </label>
              <select
                value={currentProduct?.status || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    status: e.target.value,
                  })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              >
                <option value="Pending">{t.pending || "Pending"}</option>
                <option value="Active">{t.active || "Active"}</option>
                <option value="Approved">{t.approved || "Approved"}</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.note || "Note"}
              </label>
              <textarea
                value={currentProduct?.note || ""}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, note: e.target.value })
                }
                className="w-full min-h-[90px] border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition resize-none"
                placeholder={t.extra_details || "Extra details..."}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
          <button
            onClick={handleModalClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
          >
            {t.cancel || "Cancel"}
          </button>
          <button
            onClick={handleUpdateProduct}
            className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-100 active:scale-95"
          >
            {t.update_changes || "Update Changes"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen1}
        onClose={handleModalClose1}
        title={t.add_new || "Add New"}
      >
        <form
          onSubmit={handleCreateProduct}
          className="space-y-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar"
        >
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              {t.select_product || "Select Product"}
            </label>
            <Select
              options={productDropdownOptions}
              value={
                productDropdownOptions.find(
                  (o) => o.value === String(createProduct.itemId),
                ) || null
              }
              onChange={(selected) =>
                setCreateProduct((prev) => ({
                  ...prev,
                  itemId: selected?.value || "",
                  mixerDetails: initialCreateProduct.mixerDetails,
                }))
              }
              placeholder={t.search_product || "Search product..."}
              isClearable
              styles={selectStyles}
              className="text-sm text-black font-medium"
              isDisabled={isLoadingAllProducts}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              {t.date || "Date"}
            </label>
            <input
              type="date"
              value={createProduct?.date || ""}
              onChange={(e) =>
                setCreateProduct((p) => ({ ...p, date: e.target.value }))
              }
              className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-1">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">
                  {t.unit_settings || "Unit Settings"}
                </span>
                <p className="text-[10px] font-bold text-slate-400">
                  {t.enable_if_needed || "Enable if needed"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCreateProduct((prev) => ({
                    ...prev,
                    hasUnit: !prev?.hasUnit,
                    unitValue: prev?.hasUnit ? "" : prev?.unitValue || "",
                    unit: prev?.hasUnit ? "Pcs" : prev?.unit || "Pcs",
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  createProduct?.hasUnit ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span className="sr-only">Toggle Unit</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    createProduct?.hasUnit ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {createProduct?.hasUnit && (
              <div className="bg-white rounded-xl border border-slate-100 m-1 p-4 space-y-3 shadow-sm">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t.unit_details || "Unit Details"}
                </label>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={createProduct?.unitValue || ""}
                    onChange={(e) =>
                      setCreateProduct((prev) => ({
                        ...prev,
                        unitValue: e.target.value,
                      }))
                    }
                    placeholder="30"
                    className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                  />

                  <select
                    value={createProduct?.unit || "Pcs"}
                    onChange={(e) =>
                      setCreateProduct((prev) => ({
                        ...prev,
                        unit: e.target.value,
                      }))
                    }
                    className="h-11 w-32 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition appearance-none cursor-pointer"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Kg">Kg</option>
                    <option value="Liter">Liter</option>
                    <option value="Box">Box</option>
                    <option value="Dozen">Dozen</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {createMixerDetailFields.length > 0 && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  {createMixerType === "attar"
                    ? "Attar Details"
                    : "Dates Details"}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mt-1">
                  Select each required item and enter its quantity.
                </p>
              </div>

              <div className="space-y-4">
                {createMixerDetailFields.map((field) => {
                  const fieldOptions = getFilteredDetailOptions(field);

                  return (
                    <div
                      key={field.key}
                      className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_140px] gap-3"
                    >
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                          {field.label}
                        </label>
                        <Select
                          options={fieldOptions}
                          value={
                            fieldOptions.find(
                              (option) =>
                                option.value ===
                                String(
                                  createProduct?.mixerDetails?.[field.key] ||
                                    "",
                                ),
                            ) || null
                          }
                          onChange={(selected) =>
                            handleCreateMixerDetailChange(
                              field.key,
                              selected?.value || "",
                            )
                          }
                          placeholder={field.placeholder}
                          isClearable
                          styles={selectStyles}
                          className="text-sm text-black font-medium"
                          isDisabled={isLoadingItemMaster}
                          noOptionsMessage={() =>
                            "No matching stock item found"
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={
                            createProduct?.mixerDetails?.[field.qtyKey] || ""
                          }
                          onChange={(e) =>
                            handleCreateMixerDetailChange(
                              field.qtyKey,
                              e.target.value,
                            )
                          }
                          placeholder="0"
                          className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              {t.cost || "Cost"}
            </label>
            <input
              type="number"
              step="0.01"
              value={createProduct?.cost || ""}
              onChange={(e) =>
                setCreateProduct({ ...createProduct, cost: e.target.value })
              }
              className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              {t.note || "Note"}
            </label>
            <textarea
              value={createProduct?.note || ""}
              onChange={(e) =>
                setCreateProduct({ ...createProduct, note: e.target.value })
              }
              className="w-full min-h-[80px] border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition resize-none"
              placeholder={t.add_extra_info || "Add any extra info..."}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleModalClose1}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
            >
              {t.cancel || "Cancel"}
            </button>

            <button
              type="submit"
              className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-100 active:scale-95"
            >
              {t.save || "Save"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isModalOpen2 && !!currentProduct}
        onClose={handleModalClose2}
        title={t.action_confirmation || "Action Confirmation"}
      >
        <div className="space-y-4">
          {role === "superAdmin" ? (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.update_status || "Update Status"}
              </label>
              <select
                value={currentProduct?.status || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    status: e.target.value,
                  })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              >
                <option value="Pending">{t.pending || "Pending"}</option>
                <option value="Active">{t.active || "Active"}</option>
                <option value="Approved">{t.approved || "Approved"}</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.reason_for_removal || "Reason for Removal"}
              </label>
              <textarea
                value={currentProduct?.note || ""}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, note: e.target.value })
                }
                className="w-full min-h-[120px] border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition resize-none"
                placeholder={
                  t.explain_why_remove_record ||
                  "Please explain why you want to remove this record..."
                }
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              onClick={handleModalClose2}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
            >
              {t.cancel || "Cancel"}
            </button>

            <button
              onClick={handleUpdateProduct1}
              className="px-8 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 transition shadow-md shadow-amber-100 active:scale-95"
            >
              {t.submit_request || "Submit Request"}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default MixerTable;

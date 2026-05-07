import { motion } from "framer-motion";
import {
  Edit,
  Notebook,
  Plus,
  Printer,
  ShoppingBasket,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import Select from "react-select";
import {
  useDeletePurchaseRequisitionMutation,
  useGetAllPurchaseRequisitionQuery,
  useInsertPurchaseRequisitionMutation,
  useUpdatePurchaseRequisitionMutation,
} from "../../features/purchaseRequisition/purchaseRequisition";

import { useGetAllSupplierWithoutQueryQuery } from "../../features/supplier/supplier";
import { useGetAllWirehouseWithoutQueryQuery } from "../../features/wirehouse/wirehouse";
import { useGetAllBankAccountWithoutQueryQuery } from "../../features/bankAccount/bankAccount";
import Modal from "../common/Modal";
import {
  useGetAllProductWithoutQueryQuery,
  useGetSingleReceivedProductByIdQuery,
} from "../../features/product/product";
import { useSingleUserQuery } from "../../features/auth/auth";
import { useGetAllBookWithoutQueryQuery } from "../../features/book/book";
import { requestDeleteConfirmation } from "../../utils/deleteConfirmation";
import { translations } from "../../utils/translations";
import { useLayout } from "../../context/LayoutContext";

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

const purchaseRequisitionStatusesByRole = {
  superAdmin: ["Pending", "Approved"],
  admin: ["Pending", "Approved"],
  accountant: ["Pay For Purchase", "Completed"],
  inventor: ["Product Received"],
};

const PurchaseRequisionTable = () => {
  const { language } = useLayout();
  const t = translations[language] || translations.EN;
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const [user, setUser] = useState(null);
  const purchaseRequisitionStatuses =
    purchaseRequisitionStatusesByRole[role] || [];
  const canUpdatePurchaseRequisitionStatus =
    purchaseRequisitionStatuses.length > 0;

  const [isModalOpen, setIsModalOpen] = useState(false); // Edit modal
  const [isModalOpen1, setIsModalOpen1] = useState(false); // Add modal
  const [isModalOpen2, setIsModalOpen2] = useState(false); // Note / status modal
  const [currentProduct, setCurrentProduct] = useState(null);

  // ✅ Fetch user (query)
  const {
    data: userRes,
    isLoading: isLoadingUser,
    isError: isErrorUser,
    error: errorUser,
  } = useSingleUserQuery(userId, {});

  useEffect(() => {
    if (isErrorUser) console.error("Error:", errorUser);
    if (!isLoadingUser && userRes?.data) {
      setUser(userRes.data);
    }
  }, [userRes, isLoadingUser, isErrorUser, errorUser]);

  const [warehouse, setWarehouse] = useState("");
  const [supplier, setSupplier] = useState("");

  // ✅ Add form (INSERT) -> productId (Id)
  const [createProduct, setCreateProduct] = useState({
    warehouseId: "",
    supplierId: "",
    bookId: "",
    paymentMode: "",
    bankName: "",
    bankAccount: "",
    productId: "",
    variantRows: [createEmptyVariantRow()],
    quantity: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
    status: "",
  });

  const [rows, setRows] = useState([]);

  // ✅ Filters: start/end + product NAME
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [productName, setProductName] = useState("");

  //Pagination calculation start
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesPerSet, setPagesPerSet] = useState(10);

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
  }, [startDate, endDate, productName, itemsPerPage]);

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

  //Pagination calculation end

  // ✅ startDate > endDate fix
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) setEndDate(startDate);
  }, [startDate, endDate]);

  // ✅ All products (for dropdown + name mapping)
  const {
    data: allProductsRes,
    isLoading: isLoadingAllProducts,
    isError: isErrorAllProducts,
    error: errorAllProducts,
  } = useGetAllProductWithoutQueryQuery();

  const productsData = useMemo(
    () => allProductsRes?.data || [],
    [allProductsRes],
  );

  useEffect(() => {
    if (isErrorAllProducts)
      console.error("Error fetching products", errorAllProducts);
  }, [isErrorAllProducts, errorAllProducts]);

  // ✅ Dropdown options (value = Id, label = name)

  const productDropdownOptions = useMemo(() => {
    return (productsData || []).map((p) => ({
      value: String(p.Id),
      label: p.name,
    }));
  }, [productsData]);

  const selectedCreateProductId = createProduct?.productId || undefined;
  const selectedEditProductId = currentProduct?.productId || undefined;

  const { data: selectedCreateProductRes } =
    useGetSingleReceivedProductByIdQuery(selectedCreateProductId, {
      skip: !selectedCreateProductId,
    });
  const { data: selectedEditProductRes } = useGetSingleReceivedProductByIdQuery(
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

  // ✅ productId -> productName map
  // const productNameMap = useMemo(() => {
  //   const m = new Map();
  //   (productsData || []).forEach((p) => {
  //     const key = String(p.Id ?? p.id ?? p._id);
  //     m.set(key, p.name);
  //   });
  //   return m;
  // }, [productsData]);

  const productNameMap = useMemo(() => {
    const m = new Map();
    (productsData || []).forEach((p) => {
      m.set(String(p.name).trim().toLowerCase(), String(p.Id));
    });
    return m;
  }, [productsData]);

  // ✅ resolve name for table
  const resolveProductName = (rp) => {
    const pid =
      rp.productId ??
      rp.product_id ??
      rp.ProductId ??
      rp.product?.Id ??
      rp.product?.id ??
      rp.product?._id;

    if (rp.productName) return rp.productName;
    if (rp.product?.name) return rp.product?.name;

    if (pid === null || pid === undefined || pid === "") return "N/A";

    const byId = productNameMap.get(String(pid));
    if (byId) return byId;

    const pidText = String(pid);
    const looksLikeName = (productsData || []).some((p) => p.name === pidText);
    if (looksLikeName) return pidText;

    return "N/A";
  };

  // ✅ Query args
  const queryArgs = useMemo(() => {
    const args = {
      page: currentPage,
      limit: itemsPerPage,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      name: productName || undefined, // ✅ backend filter by name
    };
    Object.keys(args).forEach((k) => {
      if (args[k] === undefined || args[k] === null || args[k] === "")
        delete args[k];
    });
    return args;
  }, [currentPage, itemsPerPage, startDate, endDate, productName]);

  const { data, isLoading, isError, error, refetch } =
    useGetAllPurchaseRequisitionQuery(queryArgs);

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

  // ✅ Modals
  const handleAddProduct = () => setIsModalOpen1(true);
  const handleModalClose = () => setIsModalOpen(false);
  const handleModalClose1 = () => {
    setIsModalOpen1(false);
    setCreateProduct({
      warehouseId: "",
      supplierId: "",
      bookId: "",
      paymentMode: "",
      bankName: "",
      bankAccount: "",
      productId: "",
      variantRows: [createEmptyVariantRow()],
      quantity: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      note: "",
      status: "",
    });
  };
  const handleModalClose2 = () => setIsModalOpen2(false);

  useEffect(() => {
    if (createProduct.paymentMode !== "Bank") {
      if (createProduct.bankName || createProduct.bankAccount) {
        setCreateProduct((p) => ({ ...p, bankName: "", bankAccount: "" }));
      }
    }
  }, [createProduct.paymentMode]);

  useEffect(() => {
    if (!currentProduct) return;
    if (currentProduct.paymentMode !== "Bank") {
      if (currentProduct.bankName || currentProduct.bankAccount) {
        setCurrentProduct((p) => ({ ...p, bankName: "", bankAccount: "" }));
      }
    }
  }, [currentProduct?.paymentMode]);

  const updateVariantRow = (mode, index, key, value) => {
    const setter = mode === "edit" ? setCurrentProduct : setCreateProduct;

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
    const setter = mode === "edit" ? setCurrentProduct : setCreateProduct;

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
    const setter = mode === "edit" ? setCurrentProduct : setCreateProduct;

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

  const [updatePurchaseRequisition] = useUpdatePurchaseRequisitionMutation();

  // const handleEditClick = (rp) => {
  //   setCurrentProduct({
  //     ...rp,
  //     productId: rp.productId ? String(rp.productId) : "",
  //     quantity: rp.quantity ?? "",
  //     supplier: rp.supplier ?? "",
  //     note: rp.note ?? "",
  //     date: rp.date ?? "",
  //     userId,
  //   });
  //   setIsModalOpen(true);
  // };

  const handleEditClick = (rp) => {
    const pidFromRow = rp.productId ? String(rp.productId) : "";
    const pidFromName =
      productNameMap.get(
        String(rp.name || "")
          .trim()
          .toLowerCase(),
      ) || "";
    const variantRows = getInitialVariantRowsFromRecord(rp);

    setCurrentProduct({
      ...rp,
      bookId: String(rp.bookId ?? rp.book?.Id ?? rp.book?.id ?? ""),
      paymentMode: rp.paymentMode ?? "",
      bankName: rp.bankName ?? "",
      bankAccount: rp.bankAccount ?? "",
      productId: pidFromRow || pidFromName, // ✅ selected ঠিক রাখে
      variantRows,
      quantity: String(
        getVariantRowsTotalQuantity(variantRows) || Number(rp.quantity) || 0,
      ),
      amount:
        rp.amount !== undefined && rp.amount !== null ? String(rp.amount) : "",
      supplier: rp.supplier ?? "",
      note: rp.note ?? rp.remarks ?? "",
      date: rp.date ?? new Date().toISOString().slice(0, 10),
      userId,
    });

    setIsModalOpen(true);
  };

  // const handleEditClick1 = (rp) => {
  //   setCurrentProduct({
  //     ...rp,
  //     productId: rp.productId ? String(rp.productId) : "",
  //     quantity: rp.quantity ?? "",
  //     supplier: rp.supplier ?? "",
  //     note: rp.note ?? "",
  //     userId,
  //   });
  //   setIsModalOpen2(true);
  // };

  const handleEditClick1 = (rp) => {
    const pidFromRow = rp.productId ? String(rp.productId) : "";
    const pidFromName =
      productNameMap.get(
        String(rp.name || "")
          .trim()
          .toLowerCase(),
      ) || "";
    const variantRows = getInitialVariantRowsFromRecord(rp);

    setCurrentProduct({
      ...rp,
      bookId: String(rp.bookId ?? rp.book?.Id ?? rp.book?.id ?? ""),
      paymentMode: rp.paymentMode ?? "",
      bankName: rp.bankName ?? "",
      bankAccount: rp.bankAccount ?? "",
      productId: pidFromRow || pidFromName,
      variantRows,
      quantity: String(
        getVariantRowsTotalQuantity(variantRows) || Number(rp.quantity) || 0,
      ),
      amount:
        rp.amount !== undefined && rp.amount !== null ? String(rp.amount) : "",
      supplier: rp.supplier ?? "",
      note: rp.note ?? rp.remarks ?? "",
      userId,
    });

    setIsModalOpen2(true);
  };

  const handleUpdateProduct = async () => {
    try {
      const variantsPayload = getNormalizedVariantsPayload(
        currentProduct?.variantRows,
      );
      if (hasDuplicateVariantCombination(variantsPayload)) {
        return toast.error("Duplicate size and color combination found");
      }
      if (
        currentProduct?.paymentMode === "Bank" &&
        (!currentProduct?.bankName || !currentProduct?.bankAccount)
      ) {
        return toast.error("Please select bank name and bank account");
      }

      const formData = new FormData();
      formData.append("productId", Number(currentProduct.productId));
      if (Number(currentProduct.bookId))
        formData.append("bookId", Number(currentProduct.bookId));
      formData.append("paymentMode", currentProduct.paymentMode || "");
      formData.append(
        "bankName",
        currentProduct.paymentMode === "Bank"
          ? currentProduct.bankName || ""
          : "",
      );
      formData.append(
        "bankAccount",
        currentProduct.paymentMode === "Bank"
          ? currentProduct.bankAccount || ""
          : "",
      );
      formData.append("quantity", Number(currentProduct.quantity));
      formData.append("amount", Number(currentProduct.amount) || 0);
      formData.append("variants", JSON.stringify(variantsPayload));
      if (Number(currentProduct.supplierId))
        formData.append("supplierId", Number(currentProduct.supplierId));
      if (Number(currentProduct.warehouseId))
        formData.append("warehouseId", Number(currentProduct.warehouseId));
      formData.append("note", currentProduct.note || "");
      formData.append("status", currentProduct.status || "");
      formData.append("date", currentProduct.date || "");
      formData.append("userId", userId);
      formData.append("actorRole", role);
      if (currentProduct.file) formData.append("file", currentProduct.file);

      const res = await updatePurchaseRequisition({
        id: currentProduct.Id,
        data: formData,
      }).unwrap();

      if (res?.success) {
        toast.success("Successfully updated!");
        setIsModalOpen(false);
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  const handleUpdateProduct1 = async () => {
    if (!currentProduct?.Id) return toast.error("Invalid item!");
    if (
      !canUpdatePurchaseRequisitionStatus &&
      (currentProduct?.note === "" || currentProduct?.note === null)
    )
      return toast.error("Note is required!");

    try {
      const variantsPayload = getNormalizedVariantsPayload(
        currentProduct?.variantRows,
      );
      if (hasDuplicateVariantCombination(variantsPayload)) {
        return toast.error("Duplicate size and color combination found");
      }
      if (
        currentProduct?.paymentMode === "Bank" &&
        (!currentProduct?.bankName || !currentProduct?.bankAccount)
      ) {
        return toast.error("Please select bank name and bank account");
      }

      const formData = new FormData();
      formData.append("productId", Number(currentProduct.productId));
      if (Number(currentProduct.bookId))
        formData.append("bookId", Number(currentProduct.bookId));
      formData.append("paymentMode", currentProduct.paymentMode || "");
      formData.append(
        "bankName",
        currentProduct.paymentMode === "Bank"
          ? currentProduct.bankName || ""
          : "",
      );
      formData.append(
        "bankAccount",
        currentProduct.paymentMode === "Bank"
          ? currentProduct.bankAccount || ""
          : "",
      );
      formData.append("quantity", Number(currentProduct.quantity));
      formData.append("amount", Number(currentProduct.amount) || 0);
      formData.append("variants", JSON.stringify(variantsPayload));
      formData.append("status", currentProduct.status || "");
      formData.append("note", currentProduct.note || "");
      formData.append("date", currentProduct.date || "");
      if (Number(currentProduct.supplierId))
        formData.append("supplierId", Number(currentProduct.supplierId));
      if (Number(currentProduct.warehouseId))
        formData.append("warehouseId", Number(currentProduct.warehouseId));
      formData.append("userId", userId);
      formData.append("actorRole", role);
      if (currentProduct.file) formData.append("file", currentProduct.file);

      const res = await updatePurchaseRequisition({
        id: currentProduct.Id,
        data: formData,
      }).unwrap();

      if (res?.success) {
        toast.success("Successfully updated product!");
        setIsModalOpen2(false);
        refetch?.();
      } else toast.error(res?.message || "Update failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed!");
    }
  };

  // ✅ Insert
  const [insertPurchaseRequisition] = useInsertPurchaseRequisitionMutation();

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!createProduct.productId) return toast.error("Please select a product");
    if (!createProduct.quantity || Number(createProduct.quantity) <= 0)
      return toast.error("Please enter a valid quantity");

    try {
      const variantsPayload = getNormalizedVariantsPayload(
        createProduct.variantRows,
      );
      if (hasDuplicateVariantCombination(variantsPayload)) {
        return toast.error("Duplicate size and color combination found");
      }
      if (
        createProduct.paymentMode === "Bank" &&
        (!createProduct.bankName || !createProduct.bankAccount)
      ) {
        return toast.error("Please select bank name and bank account");
      }

      const formData = new FormData();
      formData.append("productId", Number(createProduct.productId));
      formData.append(
        "procurement",
        `${user.FirstName} ${user.LastName}` || "N/A",
      );
      if (Number(createProduct.bookId))
        formData.append("bookId", Number(createProduct.bookId));
      formData.append("paymentMode", createProduct.paymentMode || "");
      formData.append(
        "bankName",
        createProduct.paymentMode === "Bank"
          ? createProduct.bankName || ""
          : "",
      );
      formData.append(
        "bankAccount",
        createProduct.paymentMode === "Bank"
          ? createProduct.bankAccount || ""
          : "",
      );
      formData.append("quantity", Number(createProduct.quantity));
      formData.append("amount", Number(createProduct.amount) || 0);
      formData.append("variants", JSON.stringify(variantsPayload));
      if (Number(createProduct.supplierId))
        formData.append("supplierId", Number(createProduct.supplierId));
      if (Number(createProduct.warehouseId))
        formData.append("warehouseId", Number(createProduct.warehouseId));
      formData.append("note", createProduct.note || "");
      formData.append("date", createProduct.date);
      formData.append("userId", userId);
      if (createProduct.file) formData.append("file", createProduct.file);

      const res = await insertPurchaseRequisition(formData).unwrap();
      if (res?.success) {
        toast.success("Successfully created received product");
        setIsModalOpen1(false);
        setCreateProduct({
          warehouseId: "",
          supplierId: "",
          bookId: "",
          paymentMode: "",
          bankName: "",
          bankAccount: "",
          productId: "",
          variantRows: [createEmptyVariantRow()],
          quantity: "",
          amount: "",
          date: new Date().toISOString().slice(0, 10),
          note: "",
          status: "",
        });
        refetch?.();
      } else toast.error(res?.message || "Create failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  // ✅ Delete
  const [deletePurchaseRequisition] = useDeletePurchaseRequisitionMutation();

  const handleDeleteProduct = async (id) => {
    const confirmDelete = await requestDeleteConfirmation({
      message: "Do you want to delete this product?",
    });
    if (!confirmDelete) return toast.info("Delete action was cancelled.");

    try {
      const res = await deletePurchaseRequisition(id).unwrap();
      if (res?.success !== false) {
        toast.success("Product deleted successfully!");
        refetch?.();
      } else toast.error(res?.message || "Delete failed!");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed!");
    }
  };

  // ✅ Filters clear
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setProductName("");
  };

  // ✅ react-select light styles (so it looks good in light UI)
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: 14,
      borderColor: state.isFocused ? "#c7d2fe" : "#e2e8f0", // indigo-200 / slate-200
      boxShadow: state.isFocused ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
      "&:hover": { borderColor: "#cbd5e1" },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 12px" }),
    placeholder: (base) => ({ ...base, color: "#64748b" }),
    menu: (base) => ({
      ...base,
      borderRadius: 14,
      overflow: "hidden",
      zIndex: 10050,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 10050 }),
  };

  const selectPortalTarget =
    typeof document !== "undefined" ? document.body : null;

  // ✅ suppliers
  const {
    data: allSupplierRes,
    isError: isErrorSupplier,
    error: errorSupplier,
  } = useGetAllSupplierWithoutQueryQuery();
  const suppliers = useMemo(() => allSupplierRes?.data || [], [allSupplierRes]);

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
    isError: isErrorWarehouse,
    error: errorWarehouse,
  } = useGetAllWirehouseWithoutQueryQuery();
  const warehouses = useMemo(
    () => allWarehousesRes?.data || [],
    [allWarehousesRes],
  );

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

  // ✅ books
  const {
    data: allBooksRes,
    isError: isErrorBook,
    error: errorBook,
  } = useGetAllBookWithoutQueryQuery();
  const books = useMemo(() => allBooksRes?.data || [], [allBooksRes]);

  useEffect(() => {
    if (isErrorBook) console.error("Error fetching books", errorBook);
  }, [isErrorBook, errorBook]);

  const bookOptions = useMemo(
    () =>
      (books || []).map((b) => ({
        value: b.Id,
        label: b.name,
      })),
    [books],
  );

  const paymentModeOptions = useMemo(
    () =>
      ["Cash", "Bkash", "Nagad", "Rocket", "Bank", "Card"].map((mode) => ({
        value: mode,
        label: mode,
      })),
    [],
  );

  const { data: bankAccountRes } = useGetAllBankAccountWithoutQueryQuery();
  const bankAccountsFromDB = bankAccountRes?.data || [];

  const bankOptions = useMemo(() => {
    const seen = new Set();
    return bankAccountsFromDB
      .filter((ba) => {
        const key = String(ba.bankName || "")
          .toLowerCase()
          .trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((ba) => ({ value: ba.bankName, label: ba.bankName }));
  }, [bankAccountsFromDB]);

  const getBankAccountOptions = (bankName = "") =>
    bankAccountsFromDB
      .filter(
        (ba) =>
          !bankName || String(ba.bankName || "") === String(bankName || ""),
      )
      .map((ba) => ({
        value: ba.accountNumber,
        label: `${ba.accountNumber} (${ba.bankName})`,
        bankName: ba.bankName,
      }));

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  const handleNoteClick = (note) => {
    setNoteContent(note);
    setIsNoteModalOpen(true); // Open the modal
  };

  const handleNoteModalClose = () => {
    setIsNoteModalOpen(false); // Close the modal
  };

  // ✅ Invoice state & refs
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const invoiceRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    contentRef: invoiceRef,
    documentTitle: invoiceData?.invoiceNo
      ? String(invoiceData.invoiceNo)
      : "purchase-requisition-invoice",
    removeAfterPrint: true,
  });

  const handleDownloadPdf = async () => {
    try {
      if (!invoiceRef.current) return;

      const el = invoiceRef.current;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = invoiceData?.invoiceNo
        ? `${invoiceData.invoiceNo}.pdf`
        : `purchase-requisition-${Date.now()}.pdf`;

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF download failed:", e);
      toast.error("PDF generate করতে সমস্যা হচ্ছে।");
    }
  };

  const handleInvoiceClick = (rp) => {
    const invoiceNo = `PRQ-${rp.Id}-${String(Date.now()).slice(-6)}`;
    const variantDisplayRows = getVariantDisplayRows(rp);

    const invoice = {
      invoiceNo,
      date: rp.date || new Date().toISOString().slice(0, 10),
      procurement: rp?.procurement || "N/A",
      supplier: rp?.supplier?.name || "N/A",
      warehouse: rp?.warehouse?.name || "N/A",
      product: rp.name || resolveProductName(rp),
      quantity: Number(rp.quantity || 0),
      amount: Number(rp.amount || 0),
      variants: variantDisplayRows,
      note: rp.note || "—",
      status: rp.status,
    };

    setInvoiceData(invoice);
    setInvoiceOpen(true);
  };

  return (
    <motion.div
      className="bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Top Bar */}
      <div className="my-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleAddProduct}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          Add <Plus size={18} className="ml-2" />
        </button>

        <div className="flex items-center justify-between sm:justify-end gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <ShoppingBasket size={18} className="text-amber-500" />
            <span className="text-sm">Total Purchase</span>
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

        {/* ✅ Per Page Dropdown (same position like your screenshot) */}
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Per Page</label>
          <Select
            options={[10, 20, 50, 100].map((v) => ({
              value: v,
              label: String(v),
            }))}
            value={{ value: itemsPerPage, label: String(itemsPerPage) }}
            onChange={(selected) => {
              setItemsPerPage(selected?.value || 10);
              setCurrentPage(1);
              setStartPage(1);
            }}
            className="text-black"
            styles={selectStyles}
          />
        </div>

        {/* Product Filter (stores NAME) */}
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Product</label>
          <Select
            options={productDropdownOptions}
            value={
              productDropdownOptions.find((o) => o.label === productName) ||
              null
            }
            onChange={(selected) => setProductName(selected?.label || "")}
            placeholder={isLoadingAllProducts ? "Loading..." : "Select Product"}
            isClearable
            className="text-black"
            isDisabled={isLoadingAllProducts}
            styles={selectStyles}
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
            styles={selectStyles}
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
            styles={selectStyles}
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
      <div className="overflow-x-auto mt-6 rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Procurement
              </th>{" "}
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Supplier
              </th>{" "}
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Warehouse
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Book
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Variants
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp?.procurement || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp?.supplier?.name || "-"}
                  </td>{" "}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp?.warehouse?.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {rp?.book?.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    {rp.name || resolveProductName(rp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {Number(rp.quantity || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {Number(rp.amount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 min-w-[240px]">
                    {variantDisplayRows.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {variantDisplayRows.map((variant, index) => (
                          <div
                            key={`${rp.Id}-variant-${index}`}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
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
                      <span className="inline-flex items-center rounded-full border border-dashed border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-400">
                        No variants
                      </span>
                    )}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {Number(rp.sale_price || 0).toFixed(2)}
                </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                        rp.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : rp.status === "Completed"
                            ? "bg-violet-50 text-violet-700 border-violet-200"
                            : rp.status === "Active"
                              ? "bg-blue-50 text-blue-700 border-blue-200" // New color for Active
                              : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {rp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {rp.status === "Approved" && (
                        <button
                          type="button"
                          onClick={() => handleInvoiceClick(rp)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-white transition"
                          title="Print Invoice"
                        >
                          <Printer size={18} className="text-emerald-600" />
                        </button>
                      )}

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
                        type="button"
                        onClick={() => handleEditClick(rp)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-white transition"
                        title="Edit"
                      >
                        <Edit size={18} className="text-indigo-600" />
                      </button>

                      {role === "superAdmin" || role === "admin" ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(rp.Id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-white transition"
                          title="Delete"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEditClick1(rp)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-white transition"
                          title="Request Delete"
                        >
                          <Trash2 size={18} className="text-amber-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-sm text-slate-500"
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
      <Modal
        isOpen={isModalOpen && !!currentProduct}
        onClose={handleModalClose}
        title="Edit Purchase Requisition"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Product
              </label>
              <Select
                options={productDropdownOptions}
                value={
                  productDropdownOptions.find(
                    (o) => o.value === String(currentProduct?.productId),
                  ) || null
                }
                onChange={(selected) =>
                  setCurrentProduct({
                    ...currentProduct,
                    productId: selected?.value || "",
                    variantRows: [createEmptyVariantRow()],
                    quantity: "",
                  })
                }
                placeholder="Select Product"
                isClearable
                styles={selectStyles}
                className="text-black"
                isDisabled={isLoadingAllProducts}
              />
            </div>

            <div className="md:col-span-2 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
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
                  disabled={!currentProduct?.productId}
                >
                  <Plus size={14} />
                  Add Variant
                </button>
              </div>

              {normalizeVariantRows(currentProduct?.variantRows).map(
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
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
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
                          className="text-black"
                          isDisabled={
                            !currentProduct?.productId ||
                            editSizeOptions.length === 0
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
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
                          className="text-black"
                          isDisabled={!row.size || colorOptions.length === 0}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
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
                          disabled={
                            !currentProduct?.productId ||
                            editSizeOptions.length === 0
                          }
                          className="w-full h-12 border border-slate-200 rounded-2xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                          placeholder="0"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeVariantRow("edit", index)}
                        className="h-12 w-11 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition disabled:opacity-50"
                        disabled={
                          normalizeVariantRows(currentProduct?.variantRows)
                            .length === 1
                        }
                      >
                        <X size={16} className="mx-auto" />
                      </button>
                    </div>
                  );
                },
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Warehouse
              </label>
              <Select
                options={warehouseOptions}
                value={
                  warehouseOptions.find(
                    (option) =>
                      String(option.value) ===
                      String(currentProduct?.warehouseId || ""),
                  ) || null
                }
                onChange={(selected) =>
                  setCurrentProduct({
                    ...currentProduct,
                    warehouseId: selected?.value || "",
                  })
                }
                placeholder="Select Warehouse"
                isClearable
                className="text-black"
                styles={selectStyles}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Supplier
              </label>
              <Select
                options={supplierOptions}
                value={
                  supplierOptions.find(
                    (option) =>
                      String(option.value) ===
                      String(currentProduct?.supplierId || ""),
                  ) || null
                }
                onChange={(selected) =>
                  setCurrentProduct({
                    ...currentProduct,
                    supplierId: selected?.value || "",
                  })
                }
                placeholder="Select Supplier"
                isClearable
                className="text-black"
                styles={selectStyles}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Book
              </label>
              <Select
                options={bookOptions}
                value={
                  bookOptions.find(
                    (option) =>
                      String(option.value) ===
                      String(currentProduct?.bookId || ""),
                  ) || null
                }
                onChange={(selected) =>
                  setCurrentProduct({
                    ...currentProduct,
                    bookId: selected?.value || "",
                  })
                }
                placeholder="Select Book"
                isClearable
                className="text-black"
                styles={selectStyles}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Payment Mode
              </label>
              <Select
                options={paymentModeOptions}
                value={
                  paymentModeOptions.find(
                    (option) =>
                      String(option.value) ===
                      String(currentProduct?.paymentMode || ""),
                  ) || null
                }
                onChange={(selected) =>
                  setCurrentProduct({
                    ...currentProduct,
                    paymentMode: selected?.value || "",
                    bankName: "",
                    bankAccount: "",
                  })
                }
                placeholder="Select Payment Mode"
                isClearable
                className="text-black"
                styles={selectStyles}
              />
            </div>
            {currentProduct?.paymentMode === "Bank" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                    Bank Name
                  </label>
                  <Select
                    options={bankOptions}
                    value={
                      bankOptions.find(
                        (option) =>
                          String(option.value) ===
                          String(currentProduct?.bankName || ""),
                      ) || null
                    }
                    onChange={(selected) =>
                      setCurrentProduct({
                        ...currentProduct,
                        bankName: selected?.value || "",
                        bankAccount: "",
                      })
                    }
                    placeholder="Select Bank"
                    isClearable
                    className="text-black"
                    styles={selectStyles}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                    Bank Account
                  </label>
                  <Select
                    options={getBankAccountOptions(currentProduct?.bankName)}
                    value={
                      getBankAccountOptions(currentProduct?.bankName).find(
                        (option) =>
                          String(option.value) ===
                          String(currentProduct?.bankAccount || ""),
                      ) || null
                    }
                    onChange={(selected) =>
                      setCurrentProduct({
                        ...currentProduct,
                        bankAccount: selected?.value || "",
                        bankName:
                          selected?.bankName || currentProduct.bankName || "",
                      })
                    }
                    placeholder="Select Bank Account"
                    isClearable
                    className="text-black"
                    styles={selectStyles}
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Date
              </label>
              <input
                type="date"
                value={currentProduct?.date || ""}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, date: e.target.value })
                }
                className="w-full h-12 border border-slate-200 rounded-2xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Quantity
              </label>
              <input
                type="number"
                step="0.01"
                value={currentProduct?.quantity || ""}
                onChange={(e) =>
                  setCurrentProduct((p) => ({ ...p, quantity: e.target.value }))
                }
                readOnly={hasConfiguredVariants(currentProduct?.variantRows)}
                className={`w-full h-12 border border-slate-200 rounded-2xl px-4 text-sm font-medium text-slate-900 outline-none ${
                  hasConfiguredVariants(currentProduct?.variantRows)
                    ? "bg-slate-50"
                    : "bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentProduct?.amount || ""}
                onChange={(e) =>
                  setCurrentProduct((p) => ({ ...p, amount: e.target.value }))
                }
                className="w-full h-12 border border-slate-200 rounded-2xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                placeholder="0.00"
              />
            </div>
          </div>

          {canUpdatePurchaseRequisitionStatus ? (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Status
              </label>
              <Select
                options={purchaseRequisitionStatuses.map((status) => ({
                  value: status,
                  label: status,
                }))}
                menuPortalTarget={selectPortalTarget}
                menuPosition="fixed"
                value={
                  currentProduct?.status
                    ? {
                        value: currentProduct.status,
                        label: currentProduct.status,
                      }
                    : null
                }
                onChange={(selected) =>
                  setCurrentProduct({
                    ...currentProduct,
                    status: selected?.value || "",
                  })
                }
                placeholder="Select Status"
                className="text-black"
                styles={selectStyles}
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Note
              </label>
              <textarea
                value={currentProduct?.note || ""}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, note: e.target.value })
                }
                className="w-full border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                rows={3}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              {t.document || "Document"}
            </label>
            <div className="relative group/file">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    file: e.target.files?.[0] || null,
                  })
                }
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full h-12 border-2 border-dashed border-slate-200 rounded-xl flex items-center px-4 gap-3 bg-slate-50 group-hover/file:border-indigo-400 group-hover/file:bg-indigo-50 transition">
                <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover/file:text-indigo-600 transition">
                  <Plus size={16} />
                </div>
                <span className="text-sm font-medium text-slate-500 group-hover/file:text-indigo-600">
                  {currentProduct?.file
                    ? currentProduct?.file.name
                    : t.select_drop_file || "Select or drop file..."}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              onClick={handleModalClose}
              className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateProduct}
              className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition shadow-xl shadow-indigo-100"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen1}
        onClose={handleModalClose1}
        title="Add Purchase Requisition"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateProduct} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Product
              </label>
              <Select
                options={productDropdownOptions}
                value={
                  productDropdownOptions.find(
                    (o) => o.value === String(createProduct.productId),
                  ) || null
                }
                onChange={(selected) =>
                  setCreateProduct({
                    ...createProduct,
                    productId: selected?.value || "",
                    variantRows: [createEmptyVariantRow()],
                    quantity: "",
                  })
                }
                placeholder="Select Product"
                isClearable
                className="text-black"
                styles={selectStyles}
                isDisabled={isLoadingAllProducts}
              />
            </div>

            <div className="md:col-span-2 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
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
                  disabled={!createProduct?.productId}
                >
                  <Plus size={14} />
                  Add Variant
                </button>
              </div>

              {normalizeVariantRows(createProduct?.variantRows).map(
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
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
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
                          className="text-black"
                          isDisabled={
                            !createProduct?.productId ||
                            createSizeOptions.length === 0
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
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
                          className="text-black"
                          isDisabled={!row.size || colorOptions.length === 0}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
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
                          disabled={
                            !createProduct?.productId ||
                            createSizeOptions.length === 0
                          }
                          className="w-full h-12 border border-slate-200 rounded-2xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                          placeholder="0"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeVariantRow("create", index)}
                        className="h-12 w-11 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition disabled:opacity-50"
                        disabled={
                          normalizeVariantRows(createProduct?.variantRows)
                            .length === 1
                        }
                      >
                        <X size={16} className="mx-auto" />
                      </button>
                    </div>
                  );
                },
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Date
              </label>
              <input
                type="date"
                value={createProduct.date}
                onChange={(e) =>
                  setCreateProduct({ ...createProduct, date: e.target.value })
                }
                className="w-full h-12 border border-slate-200 rounded-2xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Warehouse
              </label>
              <Select
                options={warehouseOptions}
                value={
                  warehouseOptions.find(
                    (option) =>
                      String(option.value) ===
                      String(createProduct.warehouseId || ""),
                  ) || null
                }
                onChange={(selected) =>
                  setCreateProduct({
                    ...createProduct,
                    warehouseId: selected?.value || "",
                  })
                }
                placeholder="Select Warehouse"
                isClearable
                className="text-black"
                styles={selectStyles}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Supplier
              </label>
              <Select
                options={supplierOptions}
                value={
                  supplierOptions.find(
                    (option) =>
                      String(option.value) ===
                      String(createProduct.supplierId || ""),
                  ) || null
                }
                onChange={(selected) =>
                  setCreateProduct({
                    ...createProduct,
                    supplierId: selected?.value || "",
                  })
                }
                placeholder="Select Supplier"
                isClearable
                className="text-black"
                styles={selectStyles}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Book
              </label>
              <Select
                options={bookOptions}
                value={
                  bookOptions.find(
                    (option) =>
                      String(option.value) ===
                      String(createProduct.bookId || ""),
                  ) || null
                }
                onChange={(selected) =>
                  setCreateProduct({
                    ...createProduct,
                    bookId: selected?.value || "",
                  })
                }
                placeholder="Select Book"
                isClearable
                className="text-black"
                styles={selectStyles}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Payment Mode
              </label>
              <Select
                options={paymentModeOptions}
                value={
                  paymentModeOptions.find(
                    (option) =>
                      String(option.value) ===
                      String(createProduct.paymentMode || ""),
                  ) || null
                }
                onChange={(selected) =>
                  setCreateProduct({
                    ...createProduct,
                    paymentMode: selected?.value || "",
                    bankName: "",
                    bankAccount: "",
                  })
                }
                placeholder="Select Payment Mode"
                isClearable
                className="text-black"
                styles={selectStyles}
              />
            </div>
            {createProduct.paymentMode === "Bank" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                    Bank Name
                  </label>
                  <Select
                    options={bankOptions}
                    value={
                      bankOptions.find(
                        (option) =>
                          String(option.value) ===
                          String(createProduct.bankName || ""),
                      ) || null
                    }
                    onChange={(selected) =>
                      setCreateProduct({
                        ...createProduct,
                        bankName: selected?.value || "",
                        bankAccount: "",
                      })
                    }
                    placeholder="Select Bank"
                    isClearable
                    className="text-black"
                    styles={selectStyles}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                    Bank Account
                  </label>
                  <Select
                    options={getBankAccountOptions(createProduct.bankName)}
                    value={
                      getBankAccountOptions(createProduct.bankName).find(
                        (option) =>
                          String(option.value) ===
                          String(createProduct.bankAccount || ""),
                      ) || null
                    }
                    onChange={(selected) =>
                      setCreateProduct({
                        ...createProduct,
                        bankAccount: selected?.value || "",
                        bankName:
                          selected?.bankName || createProduct.bankName || "",
                      })
                    }
                    placeholder="Select Bank Account"
                    isClearable
                    className="text-black"
                    styles={selectStyles}
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Quantity
              </label>
              <input
                type="number"
                step="0.01"
                value={createProduct.quantity}
                onChange={(e) =>
                  setCreateProduct((p) => ({ ...p, quantity: e.target.value }))
                }
                readOnly={hasConfiguredVariants(createProduct?.variantRows)}
                className={`w-full h-12 border border-slate-200 rounded-2xl px-4 text-sm font-medium text-slate-900 outline-none ${
                  hasConfiguredVariants(createProduct?.variantRows)
                    ? "bg-slate-50"
                    : "bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                }`}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={createProduct.amount}
                onChange={(e) =>
                  setCreateProduct((p) => ({ ...p, amount: e.target.value }))
                }
                className="w-full h-12 border border-slate-200 rounded-2xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
              Note
            </label>
            <textarea
              value={createProduct.note}
              onChange={(e) =>
                setCreateProduct({ ...createProduct, note: e.target.value })
              }
              className="w-full border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              {t.document || "Document"}
            </label>
            <div className="relative group/file">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) =>
                  setCreateProduct({
                    ...createProduct,
                    file: e.target.files?.[0] || null,
                  })
                }
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full h-12 border-2 border-dashed border-slate-200 rounded-xl flex items-center px-4 gap-3 bg-slate-50 group-hover/file:border-indigo-400 group-hover/file:bg-indigo-50 transition">
                <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover/file:text-indigo-600 transition">
                  <Plus size={16} />
                </div>
                <span className="text-sm font-medium text-slate-500 group-hover/file:text-indigo-600">
                  {createProduct.file
                    ? createProduct.file.name
                    : t.select_drop_file || "Select or drop file..."}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleModalClose1}
              className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition shadow-xl shadow-indigo-100"
            >
              Submit Requisition
            </button>
          </div>
        </form>
      </Modal>

      {/* Note / Status Modal */}
      <Modal
        isOpen={isModalOpen2 && !!currentProduct}
        onClose={handleModalClose2}
        title={
          canUpdatePurchaseRequisitionStatus ? "Update Status" : "Request Delete"
        }
      >
        <div className="space-y-6">
          {canUpdatePurchaseRequisitionStatus ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Status
                </label>
                <Select
                  options={purchaseRequisitionStatuses.map((status) => ({
                    value: status,
                    label: status,
                  }))}
                  menuPortalTarget={selectPortalTarget}
                  menuPosition="fixed"
                  value={
                    currentProduct?.status
                      ? {
                          value: currentProduct.status,
                          label: currentProduct.status,
                        }
                      : null
                  }
                  onChange={(selected) =>
                    setCurrentProduct({
                      ...currentProduct,
                      status: selected?.value || "",
                    })
                  }
                  placeholder="Select Status"
                  className="text-black"
                  styles={selectStyles}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                    Payment Mode
                  </label>
                  <Select
                    options={paymentModeOptions}
                    value={
                      paymentModeOptions.find(
                        (option) =>
                          String(option.value) ===
                          String(currentProduct?.paymentMode || ""),
                      ) || null
                    }
                    onChange={(selected) =>
                      setCurrentProduct({
                        ...currentProduct,
                        paymentMode: selected?.value || "",
                        bankName: "",
                        bankAccount: "",
                      })
                    }
                    placeholder="Select Payment Mode"
                    isClearable
                    className="text-black"
                    styles={selectStyles}
                  />
                </div>
                {currentProduct?.paymentMode === "Bank" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                        Bank Name
                      </label>
                      <Select
                        options={bankOptions}
                        value={
                          bankOptions.find(
                            (option) =>
                              String(option.value) ===
                              String(currentProduct?.bankName || ""),
                          ) || null
                        }
                        onChange={(selected) =>
                          setCurrentProduct({
                            ...currentProduct,
                            bankName: selected?.value || "",
                            bankAccount: "",
                          })
                        }
                        placeholder="Select Bank"
                        isClearable
                        className="text-black"
                        styles={selectStyles}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                        Bank Account
                      </label>
                      <Select
                        options={getBankAccountOptions(
                          currentProduct?.bankName,
                        )}
                        value={
                          getBankAccountOptions(currentProduct?.bankName).find(
                            (option) =>
                              String(option.value) ===
                              String(currentProduct?.bankAccount || ""),
                          ) || null
                        }
                        onChange={(selected) =>
                          setCurrentProduct({
                            ...currentProduct,
                            bankAccount: selected?.value || "",
                            bankName:
                              selected?.bankName ||
                              currentProduct.bankName ||
                              "",
                          })
                        }
                        placeholder="Select Bank Account"
                        isClearable
                        className="text-black"
                        styles={selectStyles}
                      />
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Reason for Deletion
              </label>
              <textarea
                value={currentProduct?.note || ""}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, note: e.target.value })
                }
                className="w-full border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                rows={4}
                placeholder="Briefly explain why this requisition should be deleted..."
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              onClick={handleModalClose2}
              className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateProduct1}
              className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition shadow-xl shadow-indigo-100"
            >
              Confirm Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Note View Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={handleNoteModalClose}
        title="Requisition Note"
      >
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
              {noteContent}
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              onClick={handleNoteModalClose}
              className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition shadow-xl shadow-indigo-100"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* ✅ Invoice Modal */}
      <RequisitionInvoiceModal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        invoice={invoiceData}
        invoiceRef={invoiceRef}
        onPrint={handlePrint}
        onDownload={handleDownloadPdf}
      />
    </motion.div>
  );
};

function RequisitionInvoiceModal({
  open,
  onClose,
  invoice,
  invoiceRef,
  onPrint,
  onDownload,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="text-lg font-semibold text-slate-900">
              Purchase Requisition Invoice
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onPrint}
                className="h-10 px-4 rounded-xl bg-black text-white font-semibold hover:bg-black/90"
                type="button"
                disabled={!invoice}
              >
                Print
              </button>

              <button
                type="button"
                onClick={onDownload}
                disabled={!invoice}
                className="h-10 px-4 rounded-xl border border-slate-200 text-slate-900 font-semibold hover:bg-slate-50 disabled:opacity-60"
              >
                Download PDF
              </button>

              <button
                onClick={onClose}
                className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-700"
                type="button"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[75vh] overflow-auto bg-slate-50">
            <div
              ref={invoiceRef}
              className="pdf-safe bg-white rounded-xl p-6 border border-slate-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    PURCHASE REQUISITION
                  </div>

                  <div className="text-sm text-slate-600 mt-1">
                    Invoice No:{" "}
                    <span className="font-semibold text-slate-900">
                      {invoice?.invoiceNo || "N/A"}
                    </span>
                  </div>

                  <div className="text-sm text-slate-600">
                    Date:{" "}
                    <span className="font-semibold text-slate-900">
                      {invoice?.date || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">
                    Kafela Mart
                  </div>
                  <div className="text-xs text-slate-600">
                    Purchase Requisition Invoice
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-slate-900 mb-2">
                    Requisition Details
                  </div>
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold">Procurement:</span>{" "}
                    {invoice?.procurement || "N/A"}
                  </div>
                  <div className="text-sm text-slate-700 mt-1">
                    <span className="font-semibold">Supplier:</span>{" "}
                    {invoice?.supplier || "N/A"}
                  </div>
                  <div className="text-sm text-slate-700 mt-1">
                    <span className="font-semibold">Warehouse:</span>{" "}
                    {invoice?.warehouse || "N/A"}
                  </div>
                  <div className="text-sm text-slate-700 mt-1">
                    <span className="font-semibold">Status:</span>{" "}
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                      {invoice?.status || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-slate-900 mb-2">
                    Product Summary
                  </div>

                  <div className="flex justify-between text-sm text-slate-700">
                    <span>Product</span>
                    <span className="font-semibold text-slate-900">
                      {invoice?.product || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-slate-700 mt-1">
                    <span>Quantity</span>
                    <span className="font-semibold text-slate-900">
                      {Number(invoice?.quantity || 0).toFixed(0)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-slate-700 mt-1">
                    <span>Amount</span>
                    <span className="font-semibold text-slate-900">
                      {Number(invoice?.amount || 0).toFixed(0)} ৳
                    </span>
                  </div>
                </div>
              </div>

              {/* Variants Table */}
              {(invoice?.variants || []).length > 0 && (
                <div className="mt-5 overflow-x-auto">
                  <div className="text-sm font-semibold text-slate-900 mb-2">
                    Product Variants
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left bg-slate-100">
                        <th className="px-3 py-2 border border-slate-200">
                          Size
                        </th>
                        <th className="px-3 py-2 border border-slate-200">
                          Color
                        </th>
                        <th className="px-3 py-2 border border-slate-200 text-right">
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(invoice?.variants || []).map((variant, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 border border-slate-200">
                            {variant?.size || "N/A"}
                          </td>
                          <td className="px-3 py-2 border border-slate-200">
                            {variant?.color || "N/A"}
                          </td>
                          <td className="px-3 py-2 border border-slate-200 text-right">
                            {Number(variant?.quantity || 0).toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm text-slate-700">
                  <div className="font-semibold text-slate-900 mb-1">Note</div>
                  <div className="rounded-lg border border-slate-200 p-3 min-h-[56px]">
                    {invoice?.note || "—"}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex justify-between text-sm text-slate-700">
                    <span>Total Quantity</span>
                    <span className="font-semibold text-slate-900">
                      {Number(invoice?.quantity || 0).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-700 mt-1">
                    <span>Total Amount</span>
                    <span className="font-semibold text-slate-900">
                      {Number(invoice?.amount || 0).toFixed(0)} ৳
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-700 mt-2 pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-900">
                      Grand Total
                    </span>
                    <span className="font-bold text-slate-900">
                      {Number(invoice?.amount || 0).toFixed(0)} ৳
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center text-xs text-slate-500">
                Thank you for your business.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-slate-200 text-slate-900 font-semibold hover:bg-slate-50"
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseRequisionTable;

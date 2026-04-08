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
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

import {
  useGetAllProductWithoutQueryQuery,
  useGetSingleProductByIdQuery,
} from "../../features/product/product";
import {
  useDeleteReceivedProductMutation,
  useGetAllReceivedProductQuery,
  useInsertReceivedProductMutation,
  useUpdateReceivedProductMutation,
} from "../../features/receivedProduct/receivedProduct";
import { useGetAllSupplierWithoutQueryQuery } from "../../features/supplier/supplier";
import { useGetAllWirehouseWithoutQueryQuery } from "../../features/wirehouse/wirehouse";
import Modal from "../common/Modal";
import { useGetAllBookWithoutQueryQuery } from "../../features/book/book";
import { useLayout } from "../../context/LayoutContext";
import { translations } from "../../utils/translations";

const initialCreateProduct = {
  warehouseId: "",
  bookId: "",
  supplierId: "",
  productId: "",
  sku: "",
  weight: "",
  variantRows: [{ size: "", color: "", quantity: "" }],
  quantity: "",
  purchase_price: "",
  sale_price: "",
  note: "",
  date: new Date().toISOString().slice(0, 10),
  file: null,

  // ✅ Warranty
  hasWarranty: false,
  warrantyValue: "",
  warrantyUnit: "Day",
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

const sanitizeSkuSegment = (value) =>
  String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();

const generateVariantSku = (baseSku, row, index) => {
  const normalizedBaseSku = sanitizeSkuSegment(baseSku);
  if (!normalizedBaseSku) return "";

  const sizeSegment = sanitizeSkuSegment(row?.size);
  const colorSegment = sanitizeSkuSegment(row?.color);

  return [
    normalizedBaseSku,
    sizeSegment || `VAR${index + 1}`,
    colorSegment || `ITEM${index + 1}`,
  ].join("-");
};

const getNormalizedVariantsPayload = (rows, baseSku = "") =>
  normalizeVariantRows(rows)
    .filter((row) => row.size || row.color || row.quantity)
    .map((row, index) => ({
      size: row.size || "",
      color: row.color || "",
      quantity: Number(row.quantity) || 0,
      sku: generateVariantSku(baseSku, row, index),
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

const ReceivedProductTable = () => {
  const { language } = useLayout();
  const t = translations[language] || translations.EN;
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const [isModalOpen, setIsModalOpen] = useState(false); // Edit modal
  const [isModalOpen1, setIsModalOpen1] = useState(false); // Add modal
  const [isModalOpen2, setIsModalOpen2] = useState(false); // Note / status modal
  const [currentProduct, setCurrentProduct] = useState(null);

  const [warehouse, setWarehouse] = useState("");
  const [supplier, setSupplier] = useState("");

  const [createProduct, setCreateProduct] = useState(initialCreateProduct);

  const [rows, setRows] = useState([]);
  const editVariantRowRefs = useRef([]);
  const createVariantRowRefs = useRef([]);
  const editModalBodyRef = useRef(null);
  const createModalBodyRef = useRef(null);
  const [pendingVariantScrollMode, setPendingVariantScrollMode] =
    useState(null);

  // ✅ Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [productName, setProductName] = useState("");

  // Pagination
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

  useEffect(() => {
    if (startDate && endDate && startDate > endDate) setEndDate(startDate);
  }, [startDate, endDate]);

  // ✅ All products
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

  const productNameMap = useMemo(() => {
    const m = new Map();
    (productsData || []).forEach((p) => {
      const key = String(p.Id ?? p.id ?? p._id);
      m.set(key, p.name);
    });
    return m;
  }, [productsData]);

  const selectedCreateProductId = createProduct?.productId || undefined;
  const selectedEditProductId = currentProduct?.productId || undefined;

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
    setPendingVariantScrollMode(mode);

    setter((prev) => ({
      ...prev,
      variantRows: [
        ...normalizeVariantRows(prev?.variantRows),
        createEmptyVariantRow(),
      ],
      quantity: String(getVariantRowsTotalQuantity(prev?.variantRows)),
    }));
  };

  useEffect(() => {
    if (pendingVariantScrollMode !== "edit" || !isModalOpen) return;

    const variantRows = normalizeVariantRows(currentProduct?.variantRows);
    const scrollContainer = editModalBodyRef.current;
    const lastRow = editVariantRowRefs.current[variantRows.length - 1];

    if (!scrollContainer || !lastRow) return;

    const timeoutId = window.setTimeout(() => {
      const targetTop = lastRow.offsetTop - scrollContainer.offsetTop - 24;

      scrollContainer.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: "smooth",
      });
      setPendingVariantScrollMode(null);
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [currentProduct?.variantRows, isModalOpen, pendingVariantScrollMode]);

  useEffect(() => {
    if (pendingVariantScrollMode !== "create" || !isModalOpen1) return;

    const variantRows = normalizeVariantRows(createProduct?.variantRows);
    const scrollContainer = createModalBodyRef.current;
    const lastRow = createVariantRowRefs.current[variantRows.length - 1];

    if (!scrollContainer || !lastRow) return;

    const timeoutId = window.setTimeout(() => {
      const targetTop = lastRow.offsetTop - scrollContainer.offsetTop - 24;

      scrollContainer.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: "smooth",
      });
      setPendingVariantScrollMode(null);
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [createProduct?.variantRows, isModalOpen1, pendingVariantScrollMode]);

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

  const queryArgs = useMemo(() => {
    const args = {
      page: currentPage,
      limit: itemsPerPage,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      name: productName || undefined,
      warehouseId: warehouse || undefined,
      supplierId: supplier || undefined,
    };

    Object.keys(args).forEach((k) => {
      if (args[k] === undefined || args[k] === null || args[k] === "") {
        delete args[k];
      }
    });

    return args;
  }, [
    currentPage,
    itemsPerPage,
    startDate,
    endDate,
    productName,
    warehouse,
    supplier,
  ]);

  const { data, isLoading, isError, error, refetch } =
    useGetAllReceivedProductQuery(queryArgs);

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

  // ✅ Modal handlers
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

  const [updateReceivedProduct] = useUpdateReceivedProductMutation();

  const handleEditClick = (rp) => {
    const variantRows = getInitialVariantRowsFromRecord(rp);

    setCurrentProduct({
      ...rp,
      productId: rp.productId ? String(rp.productId) : "",
      supplierId: rp.supplierId ?? "",
      warehouseId: rp.warehouseId ?? "",
      bookId: rp.bookId ?? "",
      sku: rp.sku ?? "",
      weight: rp.weight ?? "",
      purchase_price: rp.purchase_price ?? "",
      sale_price: rp.sale_price ?? "",
      duePayment: rp.duePayment ?? "",
      supplier: rp.supplier ?? "",
      date: rp.date ?? "",
      note: rp.note ?? "",
      file: rp.file ?? null,
      variantRows,
      quantity: String(
        getVariantRowsTotalQuantity(variantRows) || Number(rp.quantity) || 0,
      ),

      // ✅ Warranty preload
      hasWarranty: !!rp.warrantyValue,
      warrantyValue: rp.warrantyValue ?? "",
      warrantyUnit: rp.warrantyUnit ?? "Day",

      userId,
    });

    setIsModalOpen(true);
  };

  const handleEditClick1 = (rp) => {
    const variantRows = getInitialVariantRowsFromRecord(rp);

    setCurrentProduct({
      ...rp,
      productId: rp.productId ? String(rp.productId) : "",
      supplierId: rp.supplierId ?? "",
      warehouseId: rp.warehouseId ?? "",
      bookId: rp.bookId ?? "",
      sku: rp.sku ?? "",
      weight: rp.weight ?? "",
      purchase_price: rp.purchase_price ?? "",
      sale_price: rp.sale_price ?? "",
      supplier: rp.supplier ?? "",
      note: rp.note ?? "",
      file: rp.file ?? null,
      variantRows,
      quantity: String(
        getVariantRowsTotalQuantity(variantRows) || Number(rp.quantity) || 0,
      ),

      // ✅ Warranty preload
      hasWarranty: !!rp.warrantyValue,
      warrantyValue: rp.warrantyValue ?? "",
      warrantyUnit: rp.warrantyUnit ?? "Day",

      userId,
    });

    setIsModalOpen2(true);
  };

  const handleUpdateProduct = async () => {
    try {
      const variantsPayload = getNormalizedVariantsPayload(
        currentProduct?.variantRows,
        currentProduct?.sku,
      );
      if (hasDuplicateVariantCombination(variantsPayload)) {
        return toast.error("Duplicate size and color combination found");
      }

      const fd = new FormData();
      fd.append("productId", Number(currentProduct.productId) || "");
      fd.append("bookId", Number(currentProduct.bookId) || "");
      fd.append("supplierId", Number(currentProduct.supplierId) || "");
      fd.append("warehouseId", Number(currentProduct.warehouseId) || "");
      fd.append("quantity", Number(currentProduct.quantity) || 0);
      fd.append("variants", JSON.stringify(variantsPayload));
      fd.append("sku", currentProduct.sku || "");
      fd.append("weight", currentProduct.weight || "");
      fd.append("purchase_price", Number(currentProduct.purchase_price) || 0);
      fd.append("sale_price", Number(currentProduct.sale_price) || 0);
      fd.append("date", currentProduct.date || "");
      fd.append("note", currentProduct.note || "");
      fd.append("status", currentProduct.status || "");
      fd.append("userId", Number(currentProduct.userId) || 0);
      fd.append("actorRole", role);

      if (currentProduct.file instanceof File) {
        fd.append("file", currentProduct.file);
      }

      // ✅ Warranty
      fd.append(
        "warrantyValue",
        currentProduct?.hasWarranty ? currentProduct.warrantyValue || "" : "",
      );
      fd.append(
        "warrantyUnit",
        currentProduct?.hasWarranty ? currentProduct.warrantyUnit || "Day" : "",
      );

      const res = await updateReceivedProduct({
        id: currentProduct.Id,
        data: fd,
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
    if (currentProduct?.note === "" || currentProduct?.note === null) {
      return toast.error("Note is required!");
    }

    try {
      const variantsPayload = getNormalizedVariantsPayload(
        currentProduct?.variantRows,
        currentProduct?.sku,
      );
      if (hasDuplicateVariantCombination(variantsPayload)) {
        return toast.error("Duplicate size and color combination found");
      }

      const fd = new FormData();
      fd.append("productId", Number(currentProduct.productId) || "");
      fd.append("bookId", Number(currentProduct.bookId) || "");
      fd.append("supplierId", Number(currentProduct.supplierId) || "");
      fd.append("warehouseId", Number(currentProduct.warehouseId) || "");
      fd.append("quantity", Number(currentProduct.quantity) || 0);
      fd.append("variants", JSON.stringify(variantsPayload));
      fd.append("sku", currentProduct.sku || "");
      fd.append("weight", currentProduct.weight || "");
      fd.append("purchase_price", Number(currentProduct.purchase_price) || 0);
      fd.append("sale_price", Number(currentProduct.sale_price) || 0);
      fd.append("date", currentProduct.date || "");
      fd.append("note", currentProduct.note || "");
      fd.append("status", currentProduct.status || "");
      fd.append("userId", Number(currentProduct.userId) || 0);
      fd.append("actorRole", role);

      if (currentProduct.file instanceof File) {
        fd.append("file", currentProduct.file);
      }

      // ✅ Warranty
      fd.append(
        "warrantyValue",
        currentProduct?.hasWarranty ? currentProduct.warrantyValue || "" : "",
      );
      fd.append(
        "warrantyUnit",
        currentProduct?.hasWarranty ? currentProduct.warrantyUnit || "Day" : "",
      );

      const res = await updateReceivedProduct({
        id: currentProduct.Id,
        data: fd,
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

  // ✅ Insert
  const [insertReceivedProduct] = useInsertReceivedProductMutation();

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!createProduct.productId) return toast.error("Please select a product");
    if (!createProduct.quantity || Number(createProduct.quantity) <= 0) {
      return toast.error("Please enter a valid quantity");
    }

    const variantsPayload = getNormalizedVariantsPayload(
      createProduct.variantRows,
      createProduct.sku,
    );
    if (hasDuplicateVariantCombination(variantsPayload)) {
      return toast.error("Duplicate size and color combination found");
    }

    const fd = new FormData();
    fd.append("productId", Number(createProduct.productId) || "");
    fd.append("supplierId", Number(createProduct.supplierId) || "");
    fd.append("bookId", Number(createProduct.bookId) || "");
    fd.append("warehouseId", Number(createProduct.warehouseId) || "");
    fd.append("quantity", Number(createProduct.quantity) || 0);
    fd.append("variants", JSON.stringify(variantsPayload));
    fd.append("sku", createProduct.sku || "");
    fd.append("weight", createProduct.weight || "");
    fd.append("purchase_price", Number(createProduct.purchase_price) || 0);
    fd.append("sale_price", Number(createProduct.sale_price) || 0);
    fd.append("date", createProduct.date || "");
    fd.append("note", createProduct.note || "");

    if (createProduct.file) {
      fd.append("file", createProduct.file);
    }

    // ✅ Warranty
    fd.append(
      "warrantyValue",
      createProduct.hasWarranty ? createProduct.warrantyValue || "" : "",
    );
    fd.append(
      "warrantyUnit",
      createProduct.hasWarranty ? createProduct.warrantyUnit || "Day" : "",
    );

    try {
      const res = await insertReceivedProduct(fd).unwrap();
      if (res?.success) {
        toast.success("Successfully created received product");
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

  // ✅ Delete
  const [deleteReceivedProduct] = useDeleteReceivedProductMutation();

  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm("Do you want to delete this product?");
    if (!confirmDelete) return toast.info("Delete action was cancelled.");

    try {
      const res = await deleteReceivedProduct(id).unwrap();
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
    setProductName("");
    setWarehouse("");
    setSupplier("");
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
    menu: (base) => ({
      ...base,
      borderRadius: 14,
      overflow: "hidden",
      zIndex: 9999,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  const selectMenuProps = {
    menuPortalTarget: typeof document !== "undefined" ? document.body : null,
    menuPosition: "fixed",
  };

  // ✅ Books
  const {
    data: allBookRes,
    isError: isErrorBook,
    error: errorBook,
  } = useGetAllBookWithoutQueryQuery();
  const books = allBookRes?.data || [];

  useEffect(() => {
    if (isErrorBook) console.error("Error fetching Books", errorBook);
  }, [isErrorBook, errorBook]);

  const bookOptions = useMemo(
    () =>
      (books || []).map((s) => ({
        value: s.Id,
        label: s.name,
      })),
    [books],
  );

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

  const supplierOptions = useMemo(
    () =>
      (suppliers || []).map((s) => ({
        value: s.Id,
        label: s.name,
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

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  const handleNoteClick = (note) => {
    setNoteContent(note);
    setIsNoteModalOpen(true);
  };

  const handleNoteModalClose = () => {
    setIsNoteModalOpen(false);
    setNoteContent("");
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
            {t.purchase_history || "Purchase History"}
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            {t.incoming_product_acquisitions ||
              "Track and analyze all incoming product acquisitions"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="inline-flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-5 py-2.5 rounded-2xl shadow-sm shadow-indigo-50">
            <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
              <ShoppingBasket size={18} />
            </div>
            <div>
              <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                Total Units
              </div>
              <div className="text-base font-black text-indigo-900 tabular-nums leading-none">
                {isLoading
                  ? "..."
                  : (data?.meta?.totalQuantity ?? 0).toLocaleString()}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddProduct}
            className="group relative inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white transition-all px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 active:scale-95 overflow-hidden w-full sm:w-auto"
          >
            <Plus size={18} /> {t.add_new_purchase || "Add New Purchase"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-10 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 items-end">
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
            {t.per_page_label}
          </label>
          <Select
            options={[10, 20, 50, 100].map((v) => ({
              value: v,
              label: String(v),
            }))}
            value={{ value: itemsPerPage, label: String(itemsPerPage) }}
            onChange={(selected) => setItemsPerPage(selected?.value || 10)}
            styles={selectStyles}
            className="text-black"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            {t.product}
          </label>
          <Select
            options={productDropdownOptions}
            value={
              productDropdownOptions.find((o) => o.label === productName) ||
              null
            }
            onChange={(selected) => setProductName(selected?.label || "")}
            placeholder={t.search}
            isClearable
            isDisabled={isLoadingAllProducts}
            styles={selectStyles}
            className="text-black"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            {t.warehouse}
          </label>
          <Select
            options={warehouseOptions}
            value={
              warehouseOptions.find(
                (o) => String(o.value) === String(warehouse),
              ) || null
            }
            onChange={(selected) => setWarehouse(selected?.value || "")}
            placeholder={t.search}
            isClearable
            styles={selectStyles}
            className="text-black"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            {t.supplier}
          </label>
          <Select
            options={supplierOptions}
            value={
              supplierOptions.find(
                (o) => String(o.value) === String(supplier),
              ) || null
            }
            onChange={(selected) => setSupplier(selected?.value || "")}
            placeholder={t.search}
            isClearable
            styles={selectStyles}
            className="text-black"
          />
        </div>

        <button
          type="button"
          className="h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 transition rounded-xl px-4 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 border border-slate-200"
          onClick={clearFilters}
        >
          <X size={16} /> {t.clear_filters}
        </button>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.date}
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.warehouse}
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.supplier}
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.product_details || "Product Details"}
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.variants || "Variants"}
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.financials}
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.status}
                </th>
                <th className="px-6 py-5 text-center text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  {t.actions}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((rp) => {
                const variantDisplayRows = getVariantDisplayRows(rp);

                return (
                  <motion.tr
                    key={rp.Id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-slate-50 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {rp.date}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-tighter">
                        {rp?.warehouse?.name ||
                          t.no_warehouse ||
                          "No Warehouse"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-tighter">
                        {rp?.supplier?.name || t.no_supplier || "No Supplier"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-bold text-slate-900">
                          {resolveProductName(rp)}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                            {t.qty_label || "Qty"}:{" "}
                            {Number(rp.quantity || 0).toFixed(0)}
                          </span>
                          {rp?.sku ? (
                            <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                              SKU: {rp.sku}
                            </span>
                          ) : null}
                          {rp?.weight ? (
                            <span className="inline-flex w-fit items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                              Weight: {rp.weight}
                            </span>
                          ) : null}
                        </div>
                      </div>
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
                                <span className="text-slate-900 font-bold">
                                  {Number(variant.quantity || 0).toFixed(0)}
                                </span>
                              </div>
                              {variant?.sku ? (
                                <div className="mt-1 text-[10px] font-semibold text-indigo-600 break-all">
                                  SKU: {variant.sku}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="inline-flex items-center rounded-full border border-dashed border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-400">
                          No variants
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {t.total_buy_label || "Total Buy"}:{" "}
                          <span className="text-slate-900 border-b border-dotted border-slate-300">
                            ৳
                            {Number(
                              (rp.purchase_price || 0) * (rp.quantity || 0),
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {t.total_sell_label || "Total Sell"}:{" "}
                          <span className="text-emerald-600">
                            ৳
                            {Number(
                              (rp.sale_price || 0) * (rp.quantity || 0),
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
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
                        {/* <button
                        className="relative h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition shadow-sm"
                        title="View Note"
                        type="button"
                        onClick={() => handleNoteClick(rp.note)}
                      >
                        <Notebook size={16} />
                        {rp.note && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                        )}
                      </button> */}

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
                );
              })}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-20 text-center text-sm text-slate-400 italic"
                  >
                    {t.no_purchase_records}
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
            <ChevronLeft size={16} /> {t.prev}
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
            {t.next} <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Note Preview Modal */}
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

      {/* Edit Purchase Modal */}
      <Modal
        isOpen={isModalOpen && !!currentProduct}
        onClose={handleModalClose}
        title={t.edit_purchase || "Edit Purchase"}
      >
        <div
          ref={editModalBodyRef}
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
                  (o) => o.value === String(currentProduct?.productId),
                ) || null
              }
              onChange={(selected) =>
                setCurrentProduct({
                  ...currentProduct,
                  productId: selected?.value || "",
                  variantRows: [createEmptyVariantRow()],
                })
              }
              placeholder={t.search_product || "Search product..."}
              isClearable
              styles={selectStyles}
              {...selectMenuProps}
              className="text-sm font-medium text-black"
              isDisabled={isLoadingAllProducts}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            <div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Product Variants
                </p>
                <p className="text-[11px] text-slate-400">
                  Add size, color and quantity combinations
                </p>
              </div>
            </div>

            <div className="sticky top-0 z-20 -mx-4 flex justify-end bg-slate-50/95 px-4 py-2 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => addVariantRow("edit")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                disabled={!currentProduct?.productId}
              >
                <Plus size={14} />
                Add Variant
              </button>
            </div>

            {normalizeVariantRows(currentProduct?.variantRows).map(
              (row, index) => {
                const colorOptions = row.size
                  ? getVariationColorsForSize(selectedEditProductData, row.size)
                  : editColorOptions;

                return (
                  <div
                    key={`edit-variant-${index}`}
                    ref={(element) => {
                      editVariantRowRefs.current[index] = element;
                    }}
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
                        {...selectMenuProps}
                        className="text-sm font-medium"
                        isDisabled={
                          !currentProduct?.productId ||
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
                        {...selectMenuProps}
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
                        className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                        placeholder="0"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeVariantRow("edit", index)}
                      className="h-11 w-11 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition disabled:opacity-50"
                      disabled={
                        normalizeVariantRows(currentProduct?.variantRows)
                          .length === 1
                      }
                    >
                      <X size={16} className="mx-auto" />
                    </button>

                    <div className="sm:col-span-full">
                      <p className="text-[11px] font-semibold text-indigo-600 break-all">
                        Variant SKU:{" "}
                        {generateVariantSku(currentProduct?.sku, row, index) ||
                          "Enter base SKU to auto generate"}
                      </p>
                    </div>
                  </div>
                );
              },
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.purchase_date || "Purchase Date"}
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

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.warehouse || "Warehouse"}
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
                placeholder={t.select_warehouse || "Select Warehouse"}
                isClearable
                styles={selectStyles}
                {...selectMenuProps}
                className="text-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.book || "Book"}
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
                placeholder={t.select_book || "Select Book"}
                isClearable
                styles={selectStyles}
                {...selectMenuProps}
                className="text-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.supplier || "Supplier"}
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
                placeholder={t.select_supplier || "Select Supplier"}
                isClearable
                styles={selectStyles}
                {...selectMenuProps}
                className="text-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.quantity || "Quantity"}
              </label>
              <input
                type="number"
                step="0.01"
                value={currentProduct?.quantity || ""}
                onChange={(e) =>
                  setCurrentProduct((p) => ({ ...p, quantity: e.target.value }))
                }
                readOnly={hasConfiguredVariants(currentProduct?.variantRows)}
                className={`w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 outline-none ${
                  hasConfiguredVariants(currentProduct?.variantRows)
                    ? "bg-slate-50"
                    : "bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                SKU
              </label>
              <input
                type="text"
                value={currentProduct?.sku || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    sku: e.target.value,
                  })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                placeholder="HD-2024-001"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Weight (kg)
              </label>
              <input
                type="text"
                value={currentProduct?.weight || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    weight: e.target.value,
                  })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                placeholder="1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.purchase_price || "Purchase Price"}
              </label>
              <input
                type="number"
                step="0.01"
                value={currentProduct?.purchase_price || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    purchase_price: e.target.value,
                  })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.sale_price || "Sale Price"}
              </label>
              <input
                type="number"
                step="0.01"
                value={currentProduct?.sale_price || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    sale_price: e.target.value,
                  })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* ✅ Warranty block (Edit) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-1">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">
                  {t.warranty_coverage || "Warranty Coverage"}
                </span>
                <p className="text-[10px] font-bold text-slate-400">
                  {t.enable_warranty_if_product_has_warranty ||
                    "Enable if product has warranty"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCurrentProduct((prev) => ({
                    ...prev,
                    hasWarranty: !prev?.hasWarranty,
                    warrantyValue: prev?.hasWarranty
                      ? ""
                      : prev?.warrantyValue || "",
                    warrantyUnit: prev?.hasWarranty
                      ? "Day"
                      : prev?.warrantyUnit || "Day",
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  currentProduct?.hasWarranty ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span className="sr-only">
                  {t.toggle_warranty || "Toggle Warranty"}
                </span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    currentProduct?.hasWarranty
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {currentProduct?.hasWarranty && (
              <div className="bg-white rounded-xl border border-slate-100 m-1 p-4 space-y-3 shadow-sm">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t.duration || "Duration"}
                </label>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={currentProduct?.warrantyValue || ""}
                    onChange={(e) =>
                      setCurrentProduct((prev) => ({
                        ...prev,
                        warrantyValue: e.target.value,
                      }))
                    }
                    placeholder="30"
                    className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none
                    focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                  />

                  <Select
                    options={[
                      { value: "Day", label: t.days },
                      { value: "Month", label: t.months || "Months" },
                      { value: "Year", label: t.years || "Years" },
                    ]}
                    value={{
                      value: currentProduct?.warrantyUnit || "Day",
                      label:
                        currentProduct?.warrantyUnit === "Month"
                          ? t.months || "Months"
                          : currentProduct?.warrantyUnit === "Year"
                            ? t.years || "Years"
                            : t.days,
                    }}
                    onChange={(selected) =>
                      setCurrentProduct((prev) => ({
                        ...prev,
                        warrantyUnit: selected?.value || "Day",
                      }))
                    }
                    styles={selectStyles}
                    className="w-32 text-black"
                  />
                </div>
              </div>
            )}
          </div>

          {role === "superAdmin" || role === "admin" ? (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.status || "Status"}
              </label>
              <Select
                options={[
                  { value: "Pending", label: t.pending },
                  { value: "Active", label: t.active },
                  { value: "Approved", label: t.approved },
                ]}
                value={
                  currentProduct?.status
                    ? {
                        value: currentProduct.status,
                        label:
                          currentProduct.status === "Active"
                            ? t.active
                            : currentProduct.status === "Approved"
                              ? t.approved
                              : t.pending,
                      }
                    : null
                }
                onChange={(selected) =>
                  setCurrentProduct({
                    ...currentProduct,
                    status: selected?.value || "",
                  })
                }
                styles={selectStyles}
                className="text-black"
              />
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

      {/* Add Purchase Modal */}
      <Modal
        isOpen={isModalOpen1}
        onClose={handleModalClose1}
        title={t.add_new_purchase || "Add New Purchase"}
      >
        <form
          onSubmit={handleCreateProduct}
          ref={createModalBodyRef}
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
                  (o) => o.value === String(createProduct.productId),
                ) || null
              }
              onChange={(selected) =>
                setCreateProduct({
                  ...createProduct,
                  productId: selected?.value || "",
                  variantRows: [createEmptyVariantRow()],
                })
              }
              placeholder={t.search_product || "Search product..."}
              isClearable
              styles={selectStyles}
              {...selectMenuProps}
              className="text-sm text-black font-medium"
              isDisabled={isLoadingAllProducts}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            <div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Product Variants
                </p>
                <p className="text-[11px] text-slate-400">
                  Add size, color and quantity combinations
                </p>
              </div>
            </div>

            <div className="sticky top-0 z-20 -mx-4 flex justify-end bg-slate-50/95 px-4 py-2 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => addVariantRow("create")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
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
                    ref={(element) => {
                      createVariantRowRefs.current[index] = element;
                    }}
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
                        {...selectMenuProps}
                        className="text-sm text-black font-medium"
                        isDisabled={
                          !createProduct?.productId ||
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
                        {...selectMenuProps}
                        className="text-sm text-black font-medium"
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
                        className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                        placeholder="0"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeVariantRow("create", index)}
                      className="h-11 w-11 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition disabled:opacity-50"
                      disabled={
                        normalizeVariantRows(createProduct?.variantRows)
                          .length === 1
                      }
                    >
                      <X size={16} className="mx-auto" />
                    </button>

                    <div className="sm:col-span-full">
                      <p className="text-[11px] font-semibold text-indigo-600 break-all">
                        Variant SKU:{" "}
                        {generateVariantSku(createProduct?.sku, row, index) ||
                          "Enter base SKU to auto generate"}
                      </p>
                    </div>
                  </div>
                );
              },
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={createProduct?.sku || ""}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      sku: e.target.value,
                    })
                  }
                  className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                  placeholder="HD-2024-001"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  Weight (kg)
                </label>
                <input
                  type="text"
                  value={createProduct?.weight || ""}
                  onChange={(e) =>
                    setCreateProduct({
                      ...createProduct,
                      weight: e.target.value,
                    })
                  }
                  className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                  placeholder="1.5"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.purchase_date || "Purchase Date"}
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

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.warehouse || "Warehouse"}
              </label>
              <Select
                options={warehouseOptions}
                value={
                  warehouseOptions.find(
                    (option) =>
                      String(option.value) ===
                      String(createProduct?.warehouseId || ""),
                  ) || null
                }
                onChange={(selected) =>
                  setCreateProduct({
                    ...createProduct,
                    warehouseId: selected?.value || "",
                  })
                }
                placeholder={t.select_warehouse || "Select Warehouse"}
                isClearable
                styles={selectStyles}
                {...selectMenuProps}
                className="text-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.book || "Book"}
              </label>
              <Select
                options={bookOptions}
                value={
                  bookOptions.find(
                    (option) =>
                      String(option.value) ===
                      String(createProduct?.bookId || ""),
                  ) || null
                }
                onChange={(selected) =>
                  setCreateProduct({
                    ...createProduct,
                    bookId: selected?.value || "",
                  })
                }
                placeholder={t.select_book || "Select Book"}
                isClearable
                styles={selectStyles}
                {...selectMenuProps}
                className="text-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.supplier || "Supplier"}
              </label>
              <Select
                options={supplierOptions}
                value={
                  supplierOptions.find(
                    (option) =>
                      String(option.value) ===
                      String(createProduct?.supplierId || ""),
                  ) || null
                }
                onChange={(selected) =>
                  setCreateProduct({
                    ...createProduct,
                    supplierId: selected?.value || "",
                  })
                }
                placeholder={t.select_supplier || "Select Supplier"}
                isClearable
                styles={selectStyles}
                {...selectMenuProps}
                className="text-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.purchase_price || "Purchase Price"}
              </label>
              <input
                type="number"
                step="0.01"
                value={createProduct?.purchase_price || ""}
                onChange={(e) =>
                  setCreateProduct({
                    ...createProduct,
                    purchase_price: e.target.value,
                  })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.sale_price || "Sale Price"}
              </label>
              <input
                type="number"
                step="0.01"
                value={createProduct?.sale_price || ""}
                onChange={(e) =>
                  setCreateProduct({
                    ...createProduct,
                    sale_price: e.target.value,
                  })
                }
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.quantity || "Quantity"}
              </label>
              <input
                type="number"
                step="0.01"
                value={createProduct.quantity}
                onChange={(e) =>
                  setCreateProduct((p) => ({ ...p, quantity: e.target.value }))
                }
                readOnly={hasConfiguredVariants(createProduct?.variantRows)}
                className={`w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 outline-none ${
                  hasConfiguredVariants(createProduct?.variantRows)
                    ? "bg-slate-50"
                    : "bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                }`}
                required
              />
            </div>
          </div>

          {/* ✅ Warranty block (Add) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-1">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">
                  {t.warranty_coverage || "Warranty Coverage"}
                </span>
                <p className="text-[10px] font-bold text-slate-400">
                  {t.enable_warranty_if_product_has_warranty ||
                    "Enable if product has warranty"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCreateProduct((prev) => ({
                    ...prev,
                    hasWarranty: !prev?.hasWarranty,
                    warrantyValue: prev?.hasWarranty
                      ? ""
                      : prev?.warrantyValue || "",
                    warrantyUnit: prev?.hasWarranty
                      ? "Day"
                      : prev?.warrantyUnit || "Day",
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  createProduct?.hasWarranty ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span className="sr-only">
                  {t.toggle_warranty || "Toggle Warranty"}
                </span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    createProduct?.hasWarranty
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {createProduct?.hasWarranty && (
              <div className="bg-white rounded-xl border border-slate-100 m-1 p-4 space-y-3 shadow-sm">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t.duration || "Duration"}
                </label>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={createProduct?.warrantyValue || ""}
                    onChange={(e) =>
                      setCreateProduct((prev) => ({
                        ...prev,
                        warrantyValue: e.target.value,
                      }))
                    }
                    placeholder="30"
                    className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none
                    focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                  />

                  <select
                    value={createProduct?.warrantyUnit || "Day"}
                    onChange={(e) =>
                      setCreateProduct((prev) => ({
                        ...prev,
                        warrantyUnit: e.target.value,
                      }))
                    }
                    className="h-11 w-32 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none
                    focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition appearance-none cursor-pointer"
                  >
                    <option value="Day">{t.days}</option>
                    <option value="Month">{t.months || "Months"}</option>
                    <option value="Year">{t.years || "Years"}</option>
                  </select>
                </div>
              </div>
            )}
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
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
            >
              {t.cancel || "Cancel"}
            </button>

            <button
              type="submit"
              className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-100 active:scale-95"
            >
              {t.confirm_purchase || "Confirm Purchase"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Request Delete Modal */}
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
                <option value="Pending">{t.pending}</option>
                <option value="Active">{t.active}</option>
                <option value="Approved">{t.approved}</option>
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

export default ReceivedProductTable;

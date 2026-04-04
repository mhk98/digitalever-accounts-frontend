import {
  Search,
  RefreshCw,
  FileText,
  Plus,
  RotateCcw,
  Download,
  Printer,
  ArrowRight,
  X,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import { useGetAllEmployeeListWithoutQueryQuery } from "../../features/employeeList/employeeList";
import {
  useGetAllLedgerWithoutQueryQuery,
  useInsertLedgerMutation,
} from "../../features/ledger/ledger";
import {
  useGetAllLedgerHistoryQuery,
  useInsertLedgerHistoryMutation,
} from "../../features/ledgerHistory/ledgerHistory";
import { useGetAllSupplierWithoutQueryQuery } from "../../features/supplier/supplier";

const ENTITY_TYPES = {
  customer: {
    label: "Customer",
    nameLabel: "Customer's Name",
    namePlaceholder: "Customer's Name",
    secondaryLabel: "Phone Number",
    secondaryPlaceholder: "+88 XXXXXXXXXXX",
    extraLabel: "Address",
    extraPlaceholder: "Customer's Address",
  },
  supplier: {
    label: "Supplier",
    nameLabel: "Supplier's Name",
    namePlaceholder: "Supplier's Name",
    secondaryLabel: "Phone Number",
    secondaryPlaceholder: "+88 XXXXXXXXXXX",
    extraLabel: "Company / Address",
    extraPlaceholder: "Company or Address",
  },
  employee: {
    label: "Employee",
    nameLabel: "Employee's Name",
    namePlaceholder: "Employee's Name",
    secondaryLabel: "Phone Number",
    secondaryPlaceholder: "+88 XXXXXXXXXXX",
    extraLabel: "Department / Address",
    extraPlaceholder: "Department or Address",
  },
};

const COUNTRY_LIST = [
  { code: "AF", name: "Afghanistan", dialCode: "+93" },
  { code: "AL", name: "Albania", dialCode: "+355" },
  { code: "DZ", name: "Algeria", dialCode: "+213" },
  { code: "AD", name: "Andorra", dialCode: "+376" },
  { code: "AO", name: "Angola", dialCode: "+244" },
  { code: "AG", name: "Antigua and Barbuda", dialCode: "+1-268" },
  { code: "AR", name: "Argentina", dialCode: "+54" },
  { code: "AM", name: "Armenia", dialCode: "+374" },
  { code: "AU", name: "Australia", dialCode: "+61" },
  { code: "AT", name: "Austria", dialCode: "+43" },
  { code: "AZ", name: "Azerbaijan", dialCode: "+994" },
  { code: "BS", name: "Bahamas", dialCode: "+1-242" },
  { code: "BH", name: "Bahrain", dialCode: "+973" },
  { code: "BD", name: "Bangladesh", dialCode: "+880" },
  { code: "BB", name: "Barbados", dialCode: "+1-246" },
  { code: "BY", name: "Belarus", dialCode: "+375" },
  { code: "BE", name: "Belgium", dialCode: "+32" },
  { code: "BZ", name: "Belize", dialCode: "+501" },
  { code: "BJ", name: "Benin", dialCode: "+229" },
  { code: "BT", name: "Bhutan", dialCode: "+975" },
  { code: "BO", name: "Bolivia", dialCode: "+591" },
  { code: "BA", name: "Bosnia and Herzegovina", dialCode: "+387" },
  { code: "BW", name: "Botswana", dialCode: "+267" },
  { code: "BR", name: "Brazil", dialCode: "+55" },
  { code: "BN", name: "Brunei", dialCode: "+673" },
  { code: "BG", name: "Bulgaria", dialCode: "+359" },
  { code: "BF", name: "Burkina Faso", dialCode: "+226" },
  { code: "BI", name: "Burundi", dialCode: "+257" },
  { code: "CV", name: "Cabo Verde", dialCode: "+238" },
  { code: "KH", name: "Cambodia", dialCode: "+855" },
  { code: "CM", name: "Cameroon", dialCode: "+237" },
  { code: "CA", name: "Canada", dialCode: "+1" },
  { code: "CF", name: "Central African Republic", dialCode: "+236" },
  { code: "TD", name: "Chad", dialCode: "+235" },
  { code: "CL", name: "Chile", dialCode: "+56" },
  { code: "CN", name: "China", dialCode: "+86" },
  { code: "CO", name: "Colombia", dialCode: "+57" },
  { code: "KM", name: "Comoros", dialCode: "+269" },
  { code: "CG", name: "Congo", dialCode: "+242" },
  { code: "CR", name: "Costa Rica", dialCode: "+506" },
  { code: "CI", name: "Cote d'Ivoire", dialCode: "+225" },
  { code: "HR", name: "Croatia", dialCode: "+385" },
  { code: "CU", name: "Cuba", dialCode: "+53" },
  { code: "CY", name: "Cyprus", dialCode: "+357" },
  { code: "CZ", name: "Czech Republic", dialCode: "+420" },
  { code: "CD", name: "Democratic Republic of the Congo", dialCode: "+243" },
  { code: "DK", name: "Denmark", dialCode: "+45" },
  { code: "DJ", name: "Djibouti", dialCode: "+253" },
  { code: "DM", name: "Dominica", dialCode: "+1-767" },
  { code: "DO", name: "Dominican Republic", dialCode: "+1-809" },
  { code: "EC", name: "Ecuador", dialCode: "+593" },
  { code: "EG", name: "Egypt", dialCode: "+20" },
  { code: "SV", name: "El Salvador", dialCode: "+503" },
  { code: "GQ", name: "Equatorial Guinea", dialCode: "+240" },
  { code: "ER", name: "Eritrea", dialCode: "+291" },
  { code: "EE", name: "Estonia", dialCode: "+372" },
  { code: "SZ", name: "Eswatini", dialCode: "+268" },
  { code: "ET", name: "Ethiopia", dialCode: "+251" },
  { code: "FJ", name: "Fiji", dialCode: "+679" },
  { code: "FI", name: "Finland", dialCode: "+358" },
  { code: "FR", name: "France", dialCode: "+33" },
  { code: "GA", name: "Gabon", dialCode: "+241" },
  { code: "GM", name: "Gambia", dialCode: "+220" },
  { code: "GE", name: "Georgia", dialCode: "+995" },
  { code: "DE", name: "Germany", dialCode: "+49" },
  { code: "GH", name: "Ghana", dialCode: "+233" },
  { code: "GR", name: "Greece", dialCode: "+30" },
  { code: "GD", name: "Grenada", dialCode: "+1-473" },
  { code: "GT", name: "Guatemala", dialCode: "+502" },
  { code: "GN", name: "Guinea", dialCode: "+224" },
  { code: "GW", name: "Guinea-Bissau", dialCode: "+245" },
  { code: "GY", name: "Guyana", dialCode: "+592" },
  { code: "HT", name: "Haiti", dialCode: "+509" },
  { code: "HN", name: "Honduras", dialCode: "+504" },
  { code: "HU", name: "Hungary", dialCode: "+36" },
  { code: "IS", name: "Iceland", dialCode: "+354" },
  { code: "IN", name: "India", dialCode: "+91" },
  { code: "ID", name: "Indonesia", dialCode: "+62" },
  { code: "IR", name: "Iran", dialCode: "+98" },
  { code: "IQ", name: "Iraq", dialCode: "+964" },
  { code: "IE", name: "Ireland", dialCode: "+353" },
  { code: "IL", name: "Israel", dialCode: "+972" },
  { code: "IT", name: "Italy", dialCode: "+39" },
  { code: "JM", name: "Jamaica", dialCode: "+1-876" },
  { code: "JP", name: "Japan", dialCode: "+81" },
  { code: "JO", name: "Jordan", dialCode: "+962" },
  { code: "KZ", name: "Kazakhstan", dialCode: "+7" },
  { code: "KE", name: "Kenya", dialCode: "+254" },
  { code: "KI", name: "Kiribati", dialCode: "+686" },
  { code: "KW", name: "Kuwait", dialCode: "+965" },
  { code: "KG", name: "Kyrgyzstan", dialCode: "+996" },
  { code: "LA", name: "Laos", dialCode: "+856" },
  { code: "LV", name: "Latvia", dialCode: "+371" },
  { code: "LB", name: "Lebanon", dialCode: "+961" },
  { code: "LS", name: "Lesotho", dialCode: "+266" },
  { code: "LR", name: "Liberia", dialCode: "+231" },
  { code: "LY", name: "Libya", dialCode: "+218" },
  { code: "LI", name: "Liechtenstein", dialCode: "+423" },
  { code: "LT", name: "Lithuania", dialCode: "+370" },
  { code: "LU", name: "Luxembourg", dialCode: "+352" },
  { code: "MG", name: "Madagascar", dialCode: "+261" },
  { code: "MW", name: "Malawi", dialCode: "+265" },
  { code: "MY", name: "Malaysia", dialCode: "+60" },
  { code: "MV", name: "Maldives", dialCode: "+960" },
  { code: "ML", name: "Mali", dialCode: "+223" },
  { code: "MT", name: "Malta", dialCode: "+356" },
  { code: "MH", name: "Marshall Islands", dialCode: "+692" },
  { code: "MR", name: "Mauritania", dialCode: "+222" },
  { code: "MU", name: "Mauritius", dialCode: "+230" },
  { code: "MX", name: "Mexico", dialCode: "+52" },
  { code: "FM", name: "Micronesia", dialCode: "+691" },
  { code: "MD", name: "Moldova", dialCode: "+373" },
  { code: "MC", name: "Monaco", dialCode: "+377" },
  { code: "MN", name: "Mongolia", dialCode: "+976" },
  { code: "ME", name: "Montenegro", dialCode: "+382" },
  { code: "MA", name: "Morocco", dialCode: "+212" },
  { code: "MZ", name: "Mozambique", dialCode: "+258" },
  { code: "MM", name: "Myanmar", dialCode: "+95" },
  { code: "NA", name: "Namibia", dialCode: "+264" },
  { code: "NR", name: "Nauru", dialCode: "+674" },
  { code: "NP", name: "Nepal", dialCode: "+977" },
  { code: "NL", name: "Netherlands", dialCode: "+31" },
  { code: "NZ", name: "New Zealand", dialCode: "+64" },
  { code: "NI", name: "Nicaragua", dialCode: "+505" },
  { code: "NE", name: "Niger", dialCode: "+227" },
  { code: "NG", name: "Nigeria", dialCode: "+234" },
  { code: "KP", name: "North Korea", dialCode: "+850" },
  { code: "MK", name: "North Macedonia", dialCode: "+389" },
  { code: "NO", name: "Norway", dialCode: "+47" },
  { code: "OM", name: "Oman", dialCode: "+968" },
  { code: "PK", name: "Pakistan", dialCode: "+92" },
  { code: "PW", name: "Palau", dialCode: "+680" },
  { code: "PA", name: "Panama", dialCode: "+507" },
  { code: "PG", name: "Papua New Guinea", dialCode: "+675" },
  { code: "PY", name: "Paraguay", dialCode: "+595" },
  { code: "PE", name: "Peru", dialCode: "+51" },
  { code: "PH", name: "Philippines", dialCode: "+63" },
  { code: "PL", name: "Poland", dialCode: "+48" },
  { code: "PT", name: "Portugal", dialCode: "+351" },
  { code: "QA", name: "Qatar", dialCode: "+974" },
  { code: "RO", name: "Romania", dialCode: "+40" },
  { code: "RU", name: "Russia", dialCode: "+7" },
  { code: "RW", name: "Rwanda", dialCode: "+250" },
  { code: "KN", name: "Saint Kitts and Nevis", dialCode: "+1-869" },
  { code: "LC", name: "Saint Lucia", dialCode: "+1-758" },
  { code: "VC", name: "Saint Vincent and the Grenadines", dialCode: "+1-784" },
  { code: "WS", name: "Samoa", dialCode: "+685" },
  { code: "SM", name: "San Marino", dialCode: "+378" },
  { code: "ST", name: "Sao Tome and Principe", dialCode: "+239" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966" },
  { code: "SN", name: "Senegal", dialCode: "+221" },
  { code: "RS", name: "Serbia", dialCode: "+381" },
  { code: "SC", name: "Seychelles", dialCode: "+248" },
  { code: "SL", name: "Sierra Leone", dialCode: "+232" },
  { code: "SG", name: "Singapore", dialCode: "+65" },
  { code: "SK", name: "Slovakia", dialCode: "+421" },
  { code: "SI", name: "Slovenia", dialCode: "+386" },
  { code: "SB", name: "Solomon Islands", dialCode: "+677" },
  { code: "SO", name: "Somalia", dialCode: "+252" },
  { code: "ZA", name: "South Africa", dialCode: "+27" },
  { code: "KR", name: "South Korea", dialCode: "+82" },
  { code: "SS", name: "South Sudan", dialCode: "+211" },
  { code: "ES", name: "Spain", dialCode: "+34" },
  { code: "LK", name: "Sri Lanka", dialCode: "+94" },
  { code: "SD", name: "Sudan", dialCode: "+249" },
  { code: "SR", name: "Suriname", dialCode: "+597" },
  { code: "SE", name: "Sweden", dialCode: "+46" },
  { code: "CH", name: "Switzerland", dialCode: "+41" },
  { code: "SY", name: "Syria", dialCode: "+963" },
  { code: "TJ", name: "Tajikistan", dialCode: "+992" },
  { code: "TZ", name: "Tanzania", dialCode: "+255" },
  { code: "TH", name: "Thailand", dialCode: "+66" },
  { code: "TL", name: "Timor-Leste", dialCode: "+670" },
  { code: "TG", name: "Togo", dialCode: "+228" },
  { code: "TO", name: "Tonga", dialCode: "+676" },
  { code: "TT", name: "Trinidad and Tobago", dialCode: "+1-868" },
  { code: "TN", name: "Tunisia", dialCode: "+216" },
  { code: "TR", name: "Turkey", dialCode: "+90" },
  { code: "TM", name: "Turkmenistan", dialCode: "+993" },
  { code: "TV", name: "Tuvalu", dialCode: "+688" },
  { code: "UG", name: "Uganda", dialCode: "+256" },
  { code: "UA", name: "Ukraine", dialCode: "+380" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "UY", name: "Uruguay", dialCode: "+598" },
  { code: "UZ", name: "Uzbekistan", dialCode: "+998" },
  { code: "VU", name: "Vanuatu", dialCode: "+678" },
  { code: "VA", name: "Vatican City", dialCode: "+379" },
  { code: "VE", name: "Venezuela", dialCode: "+58" },
  { code: "VN", name: "Vietnam", dialCode: "+84" },
  { code: "YE", name: "Yemen", dialCode: "+967" },
  { code: "ZM", name: "Zambia", dialCode: "+260" },
  { code: "ZW", name: "Zimbabwe", dialCode: "+263" },
];

const getFlagEmoji = (countryCode) =>
  countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

const getInitialLedgerForm = () => ({
  type: "employee",
  countryCode: "BD",
  date: new Date().toISOString().slice(0, 10),
  cashType: "Unpaid",
  amount: "",
  name: "",
  phone: "",
  extra: "",
  note: "",
  sendMessage: false,
});

const ledgerEntitySelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    borderRadius: 8,
    borderColor: state.isFocused ? "#cbd5e1" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(203, 213, 225, 0.8)" : "none",
    "&:hover": { borderColor: "#cbd5e1" },
    backgroundColor: "white",
    fontSize: "14px",
  }),
  placeholder: (base) => ({ ...base, color: "#64748b", fontSize: "14px" }),
  singleValue: (base) => ({ ...base, color: "#334155", fontSize: "14px" }),
  menu: (base) => ({
    ...base,
    zIndex: 100,
    borderRadius: 12,
    overflow: "hidden",
  }),
};

const getInitialLedgerHistoryForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  amount: "",
  note: "",
});

const ENTITY_TABS = [
  { key: "customer", role: "Customer", label: "Customer" },
  { key: "supplier", role: "Supplier", label: "Supplier" },
  { key: "employee", role: "Employee", label: "Employee" },
];

const getSafeNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatCurrency = (value) =>
  `৳${getSafeNumber(value).toLocaleString("en-BD")}`;

const getBalanceValue = (totalReceived = 0, totalPaid = 0) =>
  getSafeNumber(totalReceived) - getSafeNumber(totalPaid);

const openPrintWindow = ({ title, content }) => {
  const printWindow = window.open("", "_blank", "width=960,height=720");

  if (!printWindow) return null;

  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1 { margin: 0 0 8px; font-size: 24px; }
          p { margin: 0 0 4px; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; font-size: 12px; }
          th { background: #f8fafc; text-align: left; }
          tfoot td { font-weight: 700; background: #f8fafc; }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => {
    printWindow.print();
  };

  return printWindow;
};

const formatLedgerDate = (value) => {
  if (!value) return "-";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return new Intl.DateTimeFormat("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};

const getInitials = (value = "") =>
  value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "?";

const normalizePhone = (value = "") => String(value).replace(/\s+/g, "");

const getEntityKey = ({ role, name, phone }) =>
  [
    role,
    String(name || "")
      .trim()
      .toLowerCase(),
    normalizePhone(phone),
  ].join("|");

const normalizeLedgerEntity = (ledger, type, index) => ({
  id: String(ledger?.Id ?? ledger?.id ?? `${type}-${index}`),
  name: ledger?.name || "Unnamed",
  phone: ledger?.phone || "",
  extra: ledger?.address || ledger?.remarks || "",
  role: ENTITY_TYPES[type]?.label || type,
  type,
});

const CreditLedgerTable = () => {
  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");
  // const [itemName, setItemName] = useState("");

  const dueHistoryItemsPerPage = 10;
  const [activeTab, setActiveTab] = useState("customer");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [mainHistoryStartDate, setMainHistoryStartDate] = useState("");
  const [mainHistoryEndDate, setMainHistoryEndDate] = useState("");
  const [dueHistoryCurrentPage, setDueHistoryCurrentPage] = useState(1);
  const [dueHistoryStartDate, setDueHistoryStartDate] = useState("");
  const [dueHistoryEndDate, setDueHistoryEndDate] = useState("");
  // const [startPage, setStartPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(1);
  // const [pagesPerSet, setPagesPerSet] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false); // Edit modal
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isDueHistoryModalOpen, setIsDueHistoryModalOpen] = useState(false);
  const [historyEntryType, setHistoryEntryType] = useState("Paid");
  const [ledgerHistoryForm, setLedgerHistoryForm] = useState(
    getInitialLedgerHistoryForm,
  );
  const dateInputRef = useRef(null);
  const historyDateInputRef = useRef(null);

  const [createLedger, setCreateLedger] = useState(getInitialLedgerForm);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCreateLedger(getInitialLedgerForm());
  };

  const handleAddLedger = () => {
    setCreateLedger(getInitialLedgerForm());
    setIsModalOpen(true);
  };

  const handleLedgerHistoryDrawerClose = () => {
    setIsHistoryDrawerOpen(false);
    setHistoryEntryType("Paid");
    setLedgerHistoryForm(getInitialLedgerHistoryForm());
  };

  const handleDueHistoryModalClose = () => {
    setIsDueHistoryModalOpen(false);
  };

  const handleResetDueHistoryFilters = () => {
    setDueHistoryStartDate("");
    setDueHistoryEndDate("");
    setDueHistoryCurrentPage(1);
  };

  const handleResetMainHistoryFilters = () => {
    setMainHistoryStartDate("");
    setMainHistoryEndDate("");
  };

  const selectedCountry =
    COUNTRY_LIST.find((country) => country.code === createLedger.countryCode) ||
    COUNTRY_LIST[0];

  const { data: supplierResponse } = useGetAllSupplierWithoutQueryQuery();
  const { data: employeeResponse } = useGetAllEmployeeListWithoutQueryQuery();

  const supplierOptions = useMemo(
    () =>
      (supplierResponse?.data || []).map((supplier) => ({
        value: String(supplier?.Id ?? supplier?.id ?? ""),
        label: supplier?.name || "Unnamed Supplier",
        name: supplier?.name || "",
        phone: supplier?.phone || "",
        extra: supplier?.remarks || "",
      })),
    [supplierResponse],
  );

  const employeeOptions = useMemo(
    () =>
      (employeeResponse?.data || []).map((employee) => ({
        value: String(
          employee?.Id ?? employee?.id ?? employee?.employee_id ?? "",
        ),
        label: employee?.employee_id
          ? `${employee?.name || "Unnamed Employee"} (${employee.employee_id})`
          : employee?.name || "Unnamed Employee",
        name: employee?.name || "",
        phone: employee?.phone || "",
        extra: employee?.employee_id
          ? `Employee ID: ${employee.employee_id}`
          : employee?.remarks || "",
      })),
    [employeeResponse],
  );

  // Create
  const [insertLedger] = useInsertLedgerMutation();
  const handleCreateLedger = async (e) => {
    e.preventDefault();

    if (!createLedger.name.trim()) {
      toast.error(`Please select ${activeEntityConfig.label.toLowerCase()}!`);
      return;
    }

    try {
      const normalizedPhone = createLedger.phone.trim();
      const payload = {
        role: ENTITY_TYPES[createLedger.type]?.label,
        name: createLedger.name,
        phone: normalizedPhone
          ? `${selectedCountry.dialCode} ${normalizedPhone}`
          : "",
        countryCode: createLedger.countryCode,
        address: createLedger.extra,
        note: createLedger.note,
        amount: Number(createLedger.amount) || 0,
        date: createLedger.date,
        cashType: createLedger.cashType,
        sendMessage: createLedger.sendMessage,
      };
      const res = await insertLedger(payload).unwrap();

      if (res?.success) {
        toast.success("Successfully created ledger!");
        handleModalClose();
        // refetch?.();
      } else {
        toast.error("Create failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  const activeEntityConfig = ENTITY_TYPES[createLedger.type];

  const updateCreateLedgerField = (field, value) => {
    setCreateLedger((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateLedgerTypeChange = (type) => {
    setCreateLedger((prev) => ({
      ...getInitialLedgerForm(),
      type,
      date: prev.date,
      cashType: prev.cashType,
      amount: prev.amount,
      note: prev.note,
      sendMessage: prev.sendMessage,
    }));
  };

  const handleEntitySelect = (selectedOption) => {
    setCreateLedger((prev) => ({
      ...prev,
      name: selectedOption?.name || "",
      phone: selectedOption?.phone || "",
      extra: selectedOption?.extra || "",
    }));
  };

  const updateLedgerHistoryField = (field, value) => {
    setLedgerHistoryForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateIconClick = () => {
    if (!dateInputRef.current) return;
    dateInputRef.current.focus();
    if (typeof dateInputRef.current.showPicker === "function") {
      dateInputRef.current.showPicker();
    }
  };

  const handleHistoryDateIconClick = () => {
    if (!historyDateInputRef.current) return;
    historyDateInputRef.current.focus();
    if (typeof historyDateInputRef.current.showPicker === "function") {
      historyDateInputRef.current.showPicker();
    }
  };

  const { data, isLoading, isError, error } =
    useGetAllLedgerWithoutQueryQuery();
  const ledgers = useMemo(() => data?.data || [], [data]);

  const entitiesByType = useMemo(
    () =>
      ENTITY_TABS.reduce((acc, tab) => {
        const seen = new Set();

        acc[tab.key] = ledgers
          .filter((ledger) => ledger?.role === tab.role)
          .map((ledger, index) => normalizeLedgerEntity(ledger, tab.key, index))
          .filter((entity) => {
            const key = getEntityKey(entity);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

        return acc;
      }, {}),
    [ledgers],
  );

  const activeEntities = useMemo(
    () => entitiesByType[activeTab] || [],
    [entitiesByType, activeTab],
  );

  const filteredEntities = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) return activeEntities;

    return activeEntities.filter((entity) =>
      [entity.name, entity.phone, entity.extra]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedSearchTerm),
        ),
    );
  }, [activeEntities, searchTerm]);

  const ledgerSummaryByEntity = useMemo(() => {
    return ledgers.reduce((acc, ledger, index) => {
      const key = getEntityKey({
        role: ledger?.role,
        name: ledger?.name,
        phone: ledger?.phone,
      });

      if (!key) return acc;

      const amount = getSafeNumber(
        ledger?.amount ?? ledger?.Amount ?? ledger?.balance ?? ledger?.total,
      );
      const cashType = String(ledger?.cashType || "").toLowerCase();

      if (!acc[key]) {
        acc[key] = {
          totalReceived: 0,
          totalPaid: 0,
          history: [],
        };
      }

      if (cashType === "paid") {
        acc[key].totalReceived += amount;
      } else {
        acc[key].totalPaid += amount;
      }

      acc[key].history.push({
        id: String(ledger?.Id ?? ledger?.id ?? index),
        date: formatLedgerDate(ledger?.date),
        credit: cashType === "paid" ? formatCurrency(amount) : "",
        debit: cashType === "paid" ? "" : formatCurrency(amount),
        balance: formatCurrency(
          getBalanceValue(acc[key].totalReceived, acc[key].totalPaid),
        ),
        note: ledger?.note || "",
        rawDate: ledger?.date,
      });

      return acc;
    }, {});
  }, [ledgers]);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching received product data", error);
    }
  }, [isError, error]);

  useEffect(() => {
    if (!filteredEntities.length) {
      setSelectedEntityId("");
      return;
    }

    setSelectedEntityId((prev) => {
      if (prev && filteredEntities.some((entity) => entity.id === prev)) {
        return prev;
      }

      return filteredEntities[0].id;
    });
  }, [filteredEntities]);

  const selectedEntity =
    filteredEntities.find((entity) => entity.id === selectedEntityId) ||
    activeEntities.find((entity) => entity.id === selectedEntityId) ||
    null;

  const selectedLedgerRecords = useMemo(() => {
    if (!selectedEntity) return [];

    const entityKey = getEntityKey(selectedEntity);

    return ledgers.filter(
      (ledger) =>
        getEntityKey({
          role: ledger?.role,
          name: ledger?.name,
          phone: ledger?.phone,
        }) === entityKey,
    );
  }, [ledgers, selectedEntity]);

  const selectedLedger = selectedLedgerRecords[0] || null;
  const selectedLedgerId = String(
    selectedLedger?.Id ?? selectedLedger?.id ?? "",
  );
  const { data: ledgerHistoryData } = useGetAllLedgerHistoryQuery({
    page: 1,
    limit: 1000,
    ledgerId: selectedLedgerId || undefined,
  });
  const ledgerHistoryRecords = useMemo(
    () => ledgerHistoryData?.data || [],
    [ledgerHistoryData],
  );

  const selectedHistory = useMemo(() => {
    if (!selectedLedgerId) return [];

    const history = ledgerHistoryRecords
      .filter(
        (entry) =>
          String(
            entry?.ledgerId ?? entry?.LedgerId ?? entry?.ledgerID ?? "",
          ) === selectedLedgerId,
      )
      .sort((a, b) => {
        const aTime = new Date(a?.date || 0).getTime();
        const bTime = new Date(b?.date || 0).getTime();
        return aTime - bTime;
      });

    let totalReceived = 0;
    let totalPaid = 0;

    return history
      .map((entry, index) => {
        const paidAmount = getSafeNumber(
          entry?.paidAmount ?? entry?.PaidAmount,
        );
        const unpaidAmount = getSafeNumber(
          entry?.unpaidAmount ?? entry?.UnpaidAmount,
        );

        totalReceived += paidAmount;
        totalPaid += unpaidAmount;

        return {
          id: String(entry?.Id ?? entry?.id ?? index),
          date: formatLedgerDate(entry?.date),
          credit: paidAmount > 0 ? formatCurrency(paidAmount) : "",
          debit: unpaidAmount > 0 ? formatCurrency(unpaidAmount) : "",
          entryType: paidAmount > 0 ? "Paid" : "Unpaid",
          balance: formatCurrency(getBalanceValue(totalReceived, totalPaid)),
          balanceValue: getBalanceValue(totalReceived, totalPaid),
          paidAmount,
          unpaidAmount,
          note: entry?.note || "",
          rawDate: entry?.date,
        };
      })
      .reverse();
  }, [ledgerHistoryRecords, selectedLedgerId]);

  const mainFilteredHistory = useMemo(() => {
    const startTime = mainHistoryStartDate
      ? new Date(`${mainHistoryStartDate}T00:00:00`).getTime()
      : null;
    const endTime = mainHistoryEndDate
      ? new Date(`${mainHistoryEndDate}T23:59:59`).getTime()
      : null;

    return selectedHistory.filter((item) => {
      const itemTime = new Date(item.rawDate || 0).getTime();

      if (startTime !== null && itemTime < startTime) return false;
      if (endTime !== null && itemTime > endTime) return false;

      return true;
    });
  }, [mainHistoryEndDate, mainHistoryStartDate, selectedHistory]);

  const mainFilteredTotals = useMemo(
    () => ({
      totalReceived: mainFilteredHistory.reduce(
        (sum, item) => sum + item.paidAmount,
        0,
      ),
      totalPaid: mainFilteredHistory.reduce(
        (sum, item) => sum + item.unpaidAmount,
        0,
      ),
      balance: mainFilteredHistory.length
        ? mainFilteredHistory[0].balanceValue
        : 0,
    }),
    [mainFilteredHistory],
  );

  const filteredDueHistory = useMemo(() => {
    const startTime = dueHistoryStartDate
      ? new Date(`${dueHistoryStartDate}T00:00:00`).getTime()
      : null;
    const endTime = dueHistoryEndDate
      ? new Date(`${dueHistoryEndDate}T23:59:59`).getTime()
      : null;

    return selectedHistory.filter((item) => {
      const itemTime = new Date(item.rawDate || 0).getTime();

      if (startTime !== null && itemTime < startTime) return false;
      if (endTime !== null && itemTime > endTime) return false;

      return true;
    });
  }, [dueHistoryEndDate, dueHistoryStartDate, selectedHistory]);

  const filteredDueHistoryTotals = useMemo(
    () => ({
      totalReceived: filteredDueHistory.reduce(
        (sum, item) => sum + item.paidAmount,
        0,
      ),
      totalPaid: filteredDueHistory.reduce(
        (sum, item) => sum + item.unpaidAmount,
        0,
      ),
      balance: filteredDueHistory.length
        ? filteredDueHistory[0].balanceValue
        : 0,
    }),
    [filteredDueHistory],
  );

  const dueHistoryTotalPages = Math.max(
    1,
    Math.ceil(filteredDueHistory.length / dueHistoryItemsPerPage),
  );

  const paginatedDueHistory = useMemo(() => {
    const startIndex = (dueHistoryCurrentPage - 1) * dueHistoryItemsPerPage;
    return filteredDueHistory.slice(
      startIndex,
      startIndex + dueHistoryItemsPerPage,
    );
  }, [dueHistoryCurrentPage, filteredDueHistory]);

  const selectedTotals = {
    totalReceived: selectedHistory.reduce(
      (sum, item) => sum + item.paidAmount,
      0,
    ),
    totalPaid: selectedHistory.reduce(
      (sum, item) => sum + item.unpaidAmount,
      0,
    ),
    balance: selectedHistory.length ? selectedHistory[0].balanceValue : 0,
  };

  useEffect(() => {
    setDueHistoryCurrentPage(1);
  }, [selectedLedgerId, dueHistoryStartDate, dueHistoryEndDate]);

  useEffect(() => {
    setMainHistoryStartDate("");
    setMainHistoryEndDate("");
  }, [selectedLedgerId]);

  useEffect(() => {
    if (dueHistoryCurrentPage > dueHistoryTotalPages) {
      setDueHistoryCurrentPage(dueHistoryTotalPages);
    }
  }, [dueHistoryCurrentPage, dueHistoryTotalPages]);

  const activeTabMeta = ENTITY_TABS.find((tab) => tab.key === activeTab);
  const isEntityListLoading = isLoading;
  const createLedgerEntityOptions =
    createLedger.type === "supplier"
      ? supplierOptions
      : createLedger.type === "employee"
        ? employeeOptions
        : [];
  const selectedCreateLedgerEntityOption =
    createLedgerEntityOptions.find(
      (option) =>
        option.name === createLedger.name &&
        (option.extra || "") === (createLedger.extra || ""),
    ) || null;
  const shouldUseEntityDropdown =
    createLedger.type === "supplier" || createLedger.type === "employee";
  const isPhoneRequired = createLedger.type === "customer";

  console.log(
    "Add Money Given Entry",
    selectedCreateLedgerEntityOption,
    createLedger,
  );

  const [insertLedgerHistory] = useInsertLedgerHistoryMutation();

  const openLedgerHistoryDrawer = (type) => {
    if (!selectedLedger?.Id && !selectedLedger?.id) {
      toast.error("No ledger selected.");
      return;
    }

    setHistoryEntryType(type);
    setLedgerHistoryForm(getInitialLedgerHistoryForm());
    setIsHistoryDrawerOpen(true);
  };

  const handleInsertLedgerHistory = async (e) => {
    e.preventDefault();

    const ledgerId = selectedLedger?.Id ?? selectedLedger?.id;
    if (!ledgerId) {
      toast.error("Ledger not found.");
      return;
    }

    const amount = Number(ledgerHistoryForm.amount) || 0;
    if (amount <= 0) {
      toast.error("Amount is required.");
      return;
    }

    const payload = {
      ledgerId,
      date: ledgerHistoryForm.date,
      note: ledgerHistoryForm.note,
      cashType: historyEntryType,
      paidAmount: historyEntryType === "Paid" ? amount : 0,
      unpaidAmount: historyEntryType === "Unpaid" ? amount : 0,
    };

    try {
      const res = await insertLedgerHistory(payload).unwrap();

      if (res?.success) {
        toast.success(`${historyEntryType} amount added successfully!`);
        handleLedgerHistoryDrawerClose();
      } else {
        toast.error(res?.message || "Create failed!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Create failed!");
    }
  };

  const handlePrintDueHistory = () => {
    if (!selectedEntity || !filteredDueHistory.length) {
      toast.error("No due history found for printing.");
      return;
    }

    const rowsMarkup = filteredDueHistory
      .map(
        (item) => `
          <tr>
            <td>${item.date}</td>
            <td>${item.entryType}</td>
            <td style="text-align:right;">${item.credit || "-"}</td>
            <td style="text-align:right;">${item.debit || "-"}</td>
            <td style="text-align:right;">${item.balance}</td>
            <td>${item.note || "-"}</td>
          </tr>`,
      )
      .join("");

    const printWindow = openPrintWindow({
      title: "Due History",
      content: `
        <h1>Due History</h1>
        <p><strong>Name:</strong> ${selectedEntity.name}</p>
        <p><strong>Contact:</strong> ${selectedEntity.phone || selectedEntity.extra || "-"}</p>
        <p><strong>Role:</strong> ${selectedEntity.role || "-"}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th style="text-align:right;">Paid</th>
              <th style="text-align:right;">Unpaid</th>
              <th style="text-align:right;">Balance</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>${rowsMarkup}</tbody>
          <tfoot>
            <tr>
              <td colspan="2">Total</td>
              <td style="text-align:right;">${formatCurrency(filteredDueHistoryTotals.totalReceived)}</td>
              <td style="text-align:right;">${formatCurrency(filteredDueHistoryTotals.totalPaid)}</td>
              <td style="text-align:right;">${formatCurrency(filteredDueHistoryTotals.balance)}</td>
              <td>-</td>
            </tr>
          </tfoot>
        </table>
      `,
    });

    if (!printWindow) {
      toast.error("Please allow popups to print due history.");
    }
  };

  const handlePrintEntityList = () => {
    if (!filteredEntities.length) {
      toast.error("No contacts found for printing.");
      return;
    }

    const rowsMarkup = filteredEntities
      .map((item) => {
        const entitySummary = ledgerSummaryByEntity[getEntityKey(item)] || {};
        const entityBalance = getBalanceValue(
          entitySummary.totalReceived || 0,
          entitySummary.totalPaid || 0,
        );

        return `
          <tr>
            <td>${item.name}</td>
            <td>${item.phone || item.extra || "-"}</td>
            <td>${item.role || "-"}</td>
            <td style="text-align:right;">${formatCurrency(entityBalance)}</td>
          </tr>`;
      })
      .join("");

    const printWindow = openPrintWindow({
      title: `${activeTabMeta?.label || "Contact"} List`,
      content: `
        <h1>${activeTabMeta?.label || "Contact"} List</h1>
        <p><strong>Search:</strong> ${searchTerm || "All"}</p>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Role</th>
              <th style="text-align:right;">Balance</th>
            </tr>
          </thead>
          <tbody>${rowsMarkup}</tbody>
        </table>
      `,
    });

    if (!printWindow) {
      toast.error("Please allow popups to print the contact list.");
    }
  };

  const handlePrintSelectedLedger = () => {
    if (!selectedEntity || !mainFilteredHistory.length) {
      toast.error("No due history found for printing.");
      return;
    }

    const rowsMarkup = mainFilteredHistory
      .map(
        (item) => `
          <tr>
            <td>${item.date}</td>
            <td style="text-align:right;">${item.credit || "-"}</td>
            <td style="text-align:right;">${item.debit || "-"}</td>
            <td style="text-align:right;">${item.balance}</td>
            <td>${item.note || "-"}</td>
          </tr>`,
      )
      .join("");

    const filterLabel =
      mainHistoryStartDate || mainHistoryEndDate
        ? `${mainHistoryStartDate || "Beginning"} - ${mainHistoryEndDate || "Today"}`
        : "All Dates";

    const printWindow = openPrintWindow({
      title: "Credit Ledger",
      content: `
        <h1>Credit Ledger</h1>
        <p><strong>Name:</strong> ${selectedEntity.name}</p>
        <p><strong>Contact:</strong> ${selectedEntity.phone || selectedEntity.extra || "-"}</p>
        <p><strong>Range:</strong> ${filterLabel}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th style="text-align:right;">Paid</th>
              <th style="text-align:right;">Unpaid</th>
              <th style="text-align:right;">Balance</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>${rowsMarkup}</tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td style="text-align:right;">${formatCurrency(mainFilteredTotals.totalReceived)}</td>
              <td style="text-align:right;">${formatCurrency(mainFilteredTotals.totalPaid)}</td>
              <td style="text-align:right;">${formatCurrency(mainFilteredTotals.balance)}</td>
              <td>-</td>
            </tr>
          </tfoot>
        </table>
      `,
    });

    if (!printWindow) {
      toast.error("Please allow popups to print the ledger.");
    }
  };

  const handleDownloadDueHistoryPdf = async () => {
    if (!selectedEntity || !filteredDueHistory.length) {
      toast.error("No due history found for PDF download.");
      return;
    }

    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF("p", "mm", "a4");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`Due History - ${selectedEntity.name}`, 14, 16);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Contact: ${selectedEntity.phone || selectedEntity.extra || "-"}`,
        14,
        23,
      );

      autoTable(doc, {
        startY: 28,
        head: [["Date", "Type", "Paid", "Unpaid", "Balance", "Note"]],
        body: filteredDueHistory.map((item) => [
          item.date,
          item.entryType,
          item.credit || "-",
          item.debit || "-",
          item.balance,
          item.note || "-",
        ]),
        foot: [
          [
            "Total",
            "",
            formatCurrency(filteredDueHistoryTotals.totalReceived),
            formatCurrency(filteredDueHistoryTotals.totalPaid),
            formatCurrency(filteredDueHistoryTotals.balance),
            "-",
          ],
        ],
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 2.5,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: 255,
          fontStyle: "bold",
        },
        footStyles: {
          fillColor: [248, 250, 252],
          textColor: 15,
          fontStyle: "bold",
        },
        columnStyles: {
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right" },
        },
      });

      doc.save(`due-history-${selectedEntity.name}-${Date.now()}.pdf`);
    } catch (err) {
      toast.error("PDF download failed.");
    }
  };

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-lg font-bold text-slate-800 sm:text-xl">
          Credit Ledger
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-500">
            Total Unpaid: {formatCurrency(selectedTotals.totalReceived)}
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-500">
            Total Paid: {formatCurrency(selectedTotals.totalPaid)}
          </div>
          <button
            type="button"
            onClick={() => setIsDueHistoryModalOpen(true)}
            disabled={!selectedLedger}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCcw size={16} />
            Due History
          </button>
          <button
            type="button"
            onClick={handleAddLedger}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Plus size={16} />
            New Due
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)]">
        {/* Left Panel */}
        <aside className="border-b border-slate-200 xl:border-b-0 xl:border-r">
          <div className="p-3 sm:p-4">
            {/* Tabs */}
            <div className="flex flex-wrap gap-5 border-b border-slate-200 text-sm font-medium text-slate-500">
              {ENTITY_TABS.map((tab) => {
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.key);
                      setSearchTerm("");
                    }}
                    className={`pb-2 transition ${
                      isActive
                        ? "border-b-2 border-black text-slate-900"
                        : "hover:text-slate-800"
                    }`}
                  >
                    {tab.label} ({entitiesByType[tab.key]?.length || 0})
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search ${activeTabMeta?.label?.toLowerCase() || "contact"}`}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
              >
                <RefreshCw size={16} className="text-slate-600" />
              </button>

              <button
                type="button"
                onClick={handlePrintEntityList}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
              >
                <FileText size={16} className="text-slate-600" />
              </button>
            </div>

            {/* Customer List */}
            <div className="mt-4 space-y-3">
              {isEntityListLoading && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Loading {activeTabMeta?.label?.toLowerCase()}s...
                </div>
              )}

              {!isEntityListLoading && !filteredEntities.length && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No {activeTabMeta?.label?.toLowerCase()} found.
                </div>
              )}

              {!isEntityListLoading &&
                filteredEntities.map((item) => {
                  const entitySummary =
                    ledgerSummaryByEntity[getEntityKey(item)] || {};
                  const entityBalance =
                    (entitySummary.totalPaid || 0) -
                    (entitySummary.totalReceived || 0);
                  const isSelected = selectedEntityId === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedEntityId(item.id)}
                      className={`flex w-full items-start justify-between rounded-xl border p-3 text-left shadow-sm transition ${
                        isSelected
                          ? "border-slate-900 bg-slate-100"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                          {getInitials(item.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">
                            {item.name}
                          </p>
                          <p className="truncate text-sm text-slate-500">
                            {item.phone || item.extra || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-green-500">
                          {formatCurrency(entityBalance)}
                        </p>
                        <span
                          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs text-white ${
                            entityBalance > 0 ? "bg-green-500" : "bg-slate-500"
                          }`}
                        >
                          {entityBalance > 0 ? "Pending" : "Clear"}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </aside>

        {/* Right Panel */}
        <section className="flex min-h-[500px] flex-col">
          {/* Top info */}
          <div className="border-b border-slate-200 p-3 sm:p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700">
                  {selectedEntity ? getInitials(selectedEntity.name) : "?"}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-700">
                      {selectedEntity?.name ||
                        `Select ${activeTabMeta?.label || "Contact"}`}
                    </h2>
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
                      {selectedEntity?.role?.toUpperCase() || "NO SELECTION"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">
                    {selectedEntity?.phone || selectedEntity?.extra || "-"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintSelectedLedger}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
                >
                  <FileText size={16} className="text-slate-600" />
                </button>

                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                  <input
                    type="date"
                    value={mainHistoryStartDate}
                    onChange={(e) => setMainHistoryStartDate(e.target.value)}
                    className="bg-transparent text-sm outline-none"
                  />
                  <span>-</span>
                  <input
                    type="date"
                    value={mainHistoryEndDate}
                    onChange={(e) => setMainHistoryEndDate(e.target.value)}
                    className="bg-transparent text-sm outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleResetMainHistoryFilters}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
                >
                  <RefreshCw size={16} className="text-slate-600" />
                </button>

                <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                  Due Comparison
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-slate-400">Balance</p>
                <p
                  className={`text-3xl font-bold ${
                    mainFilteredTotals.balance < 0
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {formatCurrency(mainFilteredTotals.balance)}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block flex-1 overflow-auto p-3 sm:p-4">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">
                      Due History
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-green-500">
                      Paid
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-red-500">
                      Unpaid
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mainFilteredHistory.map((item) => (
                    <tr key={item.id} className="border-t border-slate-200">
                      <td className="px-4 py-3 text-slate-600">
                        <div>{item.date}</div>
                        {item.note && (
                          <div className="mt-1 text-xs text-slate-500">
                            {item.note}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-green-500">
                        {item.credit}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-red-500">
                        {item.debit}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          item.balanceValue < 0
                            ? "text-red-500"
                            : "text-slate-700"
                        }`}
                      >
                        {item.balance}
                      </td>
                    </tr>
                  ))}
                  {!mainFilteredHistory.length && (
                    <tr className="border-t border-slate-200">
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No due history found for this contact.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="border-t bg-slate-50">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-500">
                      {formatCurrency(mainFilteredTotals.totalReceived)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-500">
                      {formatCurrency(mainFilteredTotals.totalPaid)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        mainFilteredTotals.balance < 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {formatCurrency(mainFilteredTotals.balance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Mobile card history */}
          <div className="space-y-3 p-3 md:hidden">
            {mainFilteredHistory.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <p className="text-sm text-slate-600">{item.date}</p>
                {item.note && (
                  <p className="mt-1 text-xs text-slate-500">{item.note}</p>
                )}

                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-slate-400">Received</p>
                    <p className="font-semibold text-green-500">
                      {item.credit || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Paid</p>
                    <p className="font-semibold text-red-500">
                      {item.debit || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Balance</p>
                    <p
                      className={`font-semibold ${
                        item.balanceValue < 0
                          ? "text-red-500"
                          : "text-slate-700"
                      }`}
                    >
                      {item.balance}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {!mainFilteredHistory.length && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                No due history found for this contact.
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Total Unpaid</p>
                  <p className="font-semibold text-green-500">
                    {formatCurrency(mainFilteredTotals.totalReceived)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Paid</p>
                  <p className="font-semibold text-red-500">
                    {formatCurrency(mainFilteredTotals.totalPaid)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Balance</p>
                  <p
                    className={`font-semibold ${
                      mainFilteredTotals.balance < 0
                        ? "text-red-500"
                        : "text-slate-700"
                    }`}
                  >
                    {formatCurrency(mainFilteredTotals.balance)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom action buttons */}
          <div className="mt-auto grid grid-cols-1 gap-3 border-t border-slate-200 p-3 sm:grid-cols-2 sm:p-4">
            <button
              type="button"
              onClick={() => openLedgerHistoryDrawer("Unpaid")}
              disabled={!selectedLedger}
              className="rounded-xl bg-red-500 px-4 py-3 font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Unpaid
            </button>
            <button
              type="button"
              onClick={() => openLedgerHistoryDrawer("Paid")}
              disabled={!selectedLedger}
              className="rounded-xl bg-green-500 px-4 py-3 font-semibold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Paid
            </button>
          </div>
        </section>
      </div>

      {/* Add New */}
      {/* <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="Add Marketing Channel"
      >
        <form onSubmit={handleCreateLedger} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
              Channel Name
            </label>
            <input
              type="text"
              value={createLedger.name}
              onChange={(e) => setCreateLedger({ name: e.target.value })}
              className="w-full h-12 border border-slate-200 rounded-2xl px-4 text-sm font-medium text-slate-900 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
              placeholder="e.g. Google Search"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition shadow-xl shadow-indigo-100"
            >
              Create Channel
            </button>
          </div>
        </form>
      </Modal> */}

      <AnimatePresence>
        {isDueHistoryModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[80] bg-slate-950/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDueHistoryModalClose}
            />

            <motion.div
              className="fixed inset-0 z-[90] flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <div className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Due History
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedEntity?.name || "-"} •{" "}
                      {selectedEntity?.phone || selectedEntity?.extra || "-"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrintDueHistory}
                      disabled={!filteredDueHistory.length}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Printer size={16} />
                      Print
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadDueHistoryPdf}
                      disabled={!filteredDueHistory.length}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Download size={16} />
                      Download PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleDueHistoryModalClose}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-400">Total Paid</p>
                    <p className="mt-1 text-2xl font-bold text-green-500">
                      {formatCurrency(filteredDueHistoryTotals.totalReceived)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-400">Total Unpaid</p>
                    <p className="mt-1 text-2xl font-bold text-red-500">
                      {formatCurrency(filteredDueHistoryTotals.totalPaid)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-400">Current Balance</p>
                    <p
                      className={`mt-1 text-2xl font-bold ${
                        filteredDueHistoryTotals.balance < 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {formatCurrency(filteredDueHistoryTotals.balance)}
                    </p>
                  </div>
                </div>

                <div className="max-h-[55vh] overflow-auto px-6 py-5">
                  <div className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_1fr_auto]">
                    <label className="text-sm">
                      <span className="mb-1 block text-slate-500">
                        Start Date
                      </span>
                      <input
                        type="date"
                        value={dueHistoryStartDate}
                        onChange={(e) => setDueHistoryStartDate(e.target.value)}
                        className="h-11 w-full rounded-xl text-black border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block text-slate-500">
                        End Date
                      </span>
                      <input
                        type="date"
                        value={dueHistoryEndDate}
                        onChange={(e) => setDueHistoryEndDate(e.target.value)}
                        className="h-11 w-full rounded-xl text-black border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                      />
                    </label>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleResetDueHistoryFilters}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left font-medium">
                            Type
                          </th>
                          <th className="px-4 py-3 text-right font-medium text-green-500">
                            Paid
                          </th>
                          <th className="px-4 py-3 text-right font-medium text-red-500">
                            Unpaid
                          </th>
                          <th className="px-4 py-3 text-right font-medium">
                            Balance
                          </th>
                          <th className="px-4 py-3 text-left font-medium">
                            Note
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedDueHistory.map((item) => (
                          <tr
                            key={`due-modal-${item.id}`}
                            className="border-t border-slate-200"
                          >
                            <td className="px-4 py-3 text-slate-600">
                              {item.date}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  item.entryType === "Paid"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {item.entryType}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-green-500">
                              {item.credit || "-"}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-red-500">
                              {item.debit || "-"}
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-medium ${
                                item.balanceValue < 0
                                  ? "text-red-500"
                                  : "text-slate-700"
                              }`}
                            >
                              {item.balance}
                            </td>
                            <td className="px-4 py-3 text-slate-500">
                              {item.note || "-"}
                            </td>
                          </tr>
                        ))}
                        {!paginatedDueHistory.length && (
                          <tr className="border-t border-slate-200">
                            <td
                              colSpan={6}
                              className="px-4 py-10 text-center text-sm text-slate-500"
                            >
                              No due history found for this contact.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      Showing page{" "}
                      <span className="font-semibold text-slate-800">
                        {dueHistoryCurrentPage}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-slate-800">
                        {dueHistoryTotalPages}
                      </span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setDueHistoryCurrentPage((prev) =>
                            Math.max(1, prev - 1),
                          )
                        }
                        disabled={dueHistoryCurrentPage === 1}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Previous
                      </button>
                      <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                        {dueHistoryCurrentPage}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setDueHistoryCurrentPage((prev) =>
                            Math.min(dueHistoryTotalPages, prev + 1),
                          )
                        }
                        disabled={
                          dueHistoryCurrentPage === dueHistoryTotalPages
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {isHistoryDrawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-[80]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleLedgerHistoryDrawerClose}
            />

            <motion.aside
              className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white z-[90] shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
            >
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-center relative">
                <h2 className="text-[18px] font-bold text-slate-700">
                  Add {historyEntryType} Amount
                </h2>

                <button
                  onClick={handleLedgerHistoryDrawerClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
                  type="button"
                  aria-label="Close"
                >
                  <X size={22} />
                </button>
              </div>

              <form
                onSubmit={handleInsertLedgerHistory}
                className="flex flex-1 flex-col overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Selected Ledger
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-800">
                      {selectedEntity?.name || "-"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedEntity?.phone || selectedEntity?.extra || "-"}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Ledger ID:{" "}
                      {selectedLedger?.Id ?? selectedLedger?.id ?? "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-2">
                      Entry Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setHistoryEntryType("Paid")}
                        className={`rounded-lg px-3 py-3 text-sm font-semibold transition ${
                          historyEntryType === "Paid"
                            ? "border-2 border-green-400 bg-green-50 text-green-600"
                            : "border border-slate-300 text-slate-600"
                        }`}
                      >
                        Paid
                      </button>
                      <button
                        type="button"
                        onClick={() => setHistoryEntryType("Unpaid")}
                        className={`rounded-lg px-3 py-3 text-sm font-semibold transition ${
                          historyEntryType === "Unpaid"
                            ? "border-2 border-red-400 bg-red-50 text-red-600"
                            : "border border-slate-300 text-slate-600"
                        }`}
                      >
                        Unpaid
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-2">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        ref={historyDateInputRef}
                        type="date"
                        value={ledgerHistoryForm.date}
                        onChange={(e) =>
                          updateLedgerHistoryField("date", e.target.value)
                        }
                        className="hide-date-picker-icon w-full h-11 appearance-none rounded-lg border border-slate-300 bg-white px-4 pr-11 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleHistoryDateIconClick}
                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100"
                        aria-label="Open date picker"
                      >
                        <Calendar size={18} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-2">
                      {historyEntryType} Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={ledgerHistoryForm.amount}
                      onChange={(e) =>
                        updateLedgerHistoryField("amount", e.target.value)
                      }
                      placeholder={`Enter ${historyEntryType.toLowerCase()} amount`}
                      className="w-full h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-2">
                      Note
                    </label>
                    <textarea
                      value={ledgerHistoryForm.note}
                      onChange={(e) =>
                        updateLedgerHistoryField("note", e.target.value)
                      }
                      rows={4}
                      placeholder="Write a note"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 px-4 py-4">
                  <button
                    type="submit"
                    className="w-full h-11 rounded-lg bg-black text-white text-sm font-semibold hover:bg-slate-900 transition"
                  >
                    Save {historyEntryType}
                  </button>
                </div>
              </form>
            </motion.aside>
          </>
        )}

        {isModalOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-[80]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleModalClose}
            />

            {/* Drawer */}
            <motion.aside
              className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white z-[90] shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-center relative">
                <h2 className="text-[18px] font-bold text-slate-700">
                  Add Money Given Entry
                </h2>

                <button
                  onClick={handleModalClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
                  type="button"
                  aria-label="Close"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Body */}
              <form
                onSubmit={handleCreateLedger}
                className="flex flex-1 flex-col overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  {/* Tabs */}
                  <div className="rounded-lg bg-slate-200 p-1 grid grid-cols-3 gap-1">
                    {Object.entries(ENTITY_TYPES).map(([key, value]) => {
                      const isActive = createLedger.type === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleCreateLedgerTypeChange(key)}
                          className={`h-10 rounded-md text-sm transition ${
                            isActive
                              ? "bg-white font-semibold text-slate-700 shadow-sm"
                              : "font-medium text-slate-600"
                          }`}
                        >
                          {value.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-200" />

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-2">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        ref={dateInputRef}
                        type="date"
                        value={createLedger.date}
                        onChange={(e) =>
                          updateCreateLedgerField("date", e.target.value)
                        }
                        className="hide-date-picker-icon w-full h-11 appearance-none rounded-lg border border-slate-300 bg-white px-4 pr-11 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleDateIconClick}
                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100"
                        aria-label="Open date picker"
                      >
                        <Calendar size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Cash Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-2">
                      Cash
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateCreateLedgerField("cashType", "Unpaid")
                        }
                        className={`rounded-lg px-3 py-3 text-left ${
                          createLedger.cashType === "Unpaid"
                            ? "border-2 border-red-400"
                            : "border border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {createLedger.cashType === "Unpaid" ? (
                            <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-black">
                              <div className="h-2.5 w-2.5 rounded-full bg-black" />
                            </div>
                          ) : (
                            <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-slate-500" />
                          )}
                          <div>
                            <div className="text-sm font-semibold text-slate-700">
                              Giving
                            </div>
                            <div className="text-sm text-slate-500">
                              You are giving credit
                            </div>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateCreateLedgerField("cashType", "Paid")
                        }
                        className={`rounded-lg px-3 py-3 text-left ${
                          createLedger.cashType === "Paid"
                            ? "border-2 border-green-400"
                            : "border border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {createLedger.cashType === "Paid" ? (
                            <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-black">
                              <div className="h-2.5 w-2.5 rounded-full bg-black" />
                            </div>
                          ) : (
                            <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-slate-500" />
                          )}
                          <div>
                            <div className="text-sm font-semibold text-slate-700">
                              Taking
                            </div>
                            <div className="text-sm text-slate-500">
                              You are taking credit
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={createLedger.amount}
                      onChange={(e) =>
                        updateCreateLedgerField("amount", e.target.value)
                      }
                      className="w-full h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
                      required
                    />
                  </div>

                  {/* Entity Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-2">
                      {activeEntityConfig.nameLabel}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    {shouldUseEntityDropdown ? (
                      <Select
                        value={selectedCreateLedgerEntityOption}
                        options={createLedgerEntityOptions}
                        onChange={handleEntitySelect}
                        placeholder={`Select ${activeEntityConfig.label}`}
                        isClearable
                        styles={ledgerEntitySelectStyles}
                        noOptionsMessage={() =>
                          `No ${activeEntityConfig.label.toLowerCase()} found`
                        }
                      />
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          value={createLedger.name}
                          onChange={(e) =>
                            updateCreateLedgerField("name", e.target.value)
                          }
                          placeholder={activeEntityConfig.namePlaceholder}
                          className="w-full h-11 rounded-lg border border-slate-300 bg-white px-4 pr-11 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
                          required
                        />
                        <Search
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                          size={18}
                        />
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-2">
                      {activeEntityConfig.secondaryLabel}
                      {isPhoneRequired && (
                        <span className="text-red-500"> *</span>
                      )}
                    </label>

                    <div className="flex h-11 rounded-lg border border-slate-300 overflow-hidden">
                      <div className="relative w-[180px] border-r border-slate-300 bg-white">
                        <select
                          value={createLedger.countryCode}
                          onChange={(e) =>
                            updateCreateLedgerField(
                              "countryCode",
                              e.target.value,
                            )
                          }
                          className="h-full w-full appearance-none bg-white pl-3 pr-8 text-sm text-slate-700 outline-none"
                        >
                          {COUNTRY_LIST.map((country) => (
                            <option key={country.code} value={country.code}>
                              {`${getFlagEmoji(country.code)} ${country.code} ${country.dialCode}`}
                            </option>
                          ))}
                        </select>

                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                          <ChevronDown size={16} className="text-slate-500" />
                        </div>
                      </div>

                      <input
                        type="text"
                        value={createLedger.phone}
                        onChange={(e) =>
                          updateCreateLedgerField("phone", e.target.value)
                        }
                        placeholder={activeEntityConfig.secondaryPlaceholder}
                        className="flex-1 bg-white px-4 text-sm text-slate-700 outline-none"
                        required={isPhoneRequired}
                      />
                    </div>
                  </div>

                  {/* Extra Field */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-800">
                      {activeEntityConfig.extraLabel}
                    </label>
                    <input
                      type="text"
                      value={createLedger.extra}
                      onChange={(e) =>
                        updateCreateLedgerField("extra", e.target.value)
                      }
                      placeholder={activeEntityConfig.extraPlaceholder}
                      className="w-full h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>

                  {/* Note + Refresh */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Write a note"
                      value={createLedger.note}
                      onChange={(e) =>
                        updateCreateLedgerField("note", e.target.value)
                      }
                      className="flex-1 h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => updateCreateLedgerField("note", "")}
                      className="h-11 w-11 rounded-lg border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-50"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-4 py-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateCreateLedgerField(
                            "sendMessage",
                            !createLedger.sendMessage,
                          )
                        }
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                          createLedger.sendMessage
                            ? "bg-green-500"
                            : "bg-slate-400"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                            createLedger.sendMessage
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="text-sm text-slate-700">
                        Send message
                      </span>
                    </div>

                    <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-600">
                      ✉ SMS Cost: 30
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-lg bg-black text-white text-sm font-semibold hover:bg-slate-900 transition"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CreditLedgerTable;

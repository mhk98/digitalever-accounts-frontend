import { Route, Routes } from "react-router-dom";
import OverviewPage from "./pages/OverviewPage";
import ProductsPage from "./pages/ProductsPage";
import { Provider } from "react-redux";
import store from "./app/store"; // Adjust as necessary
import { Toaster } from "react-hot-toast";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import RequireAuth from "./components/Auth/RequireAuth";
import ProfilePage from "./pages/ProfilePage";
import SidebarLayout from "./components/common/SidebarLayout";
import ReceivedProductPage from "./pages/ReceivedProductPage";
import ReturnProductPage from "./pages/ReturnProductPage";
import InTransitProductPage from "./pages/InTransitProductPage";
import MetaPage from "./pages/MetaPage";
import GooglePage from "./pages/GooglePage";
import TiktokPage from "./pages/TiktokPage";
import SEOPage from "./pages/SEOPage";
import AssetsPurchasePage from "./pages/AssetsPurchasePage";
import AssetsSalePage from "./pages/AssetsSalePage";
import ConfirmOrderPage from "./pages/ConfirmOrderPage";
import CashInPage from "./pages/CashInOutPage";
import ExpensePage from "./pages/ExpensePage";
import AccountingPage from "./pages/AccountingPage";
import CashInOutPage from "./pages/CashInOutPage";
import PurchaseReturnProductPage from "./pages/PurchaseReturnProductPage";
import ReceiveablePage from "./pages/ReceiveablePage";
import PayablePage from "./pages/PayablePage";
import UsermanagementPage from "./pages/UsermanagementPage";
import PettyCashPage from "./pages/PettyCashPage";
import AssetsDamagePage from "./pages/AssetsDamagePage";
import SupplierPage from "./pages/SupplierPage";
import DamageProductPage from "./pages/DamageProductPage";
import EmployeePage from "./pages/EmployeePage";
import POSPage from "./pages/POSPage";
import NotificationPage from "./pages/NotificationPage";
import SalaryPage from "./pages/SalaryPage";
import LogoPage from "./pages/LogoPage";
import RolePermissionsPage from "./pages/RolePermissionsPage";
import DamageRepairPage from "./pages/DamageRepairPage";
import DamageRepairedPage from "./pages/DamageRepairedPage";
import PurchaseRequisitionPage from "./pages/purchaseRequisitionPage";
import AssetsRequisitionPage from "./pages/AssetsRequisitionPage";
import ExpiredProductPage from "./pages/ExpiredProductPage";
import PosReportPage from "./pages/PosReportPage";
import InventoryOverviewPage from "./pages/InventoryOverviewPage";
import MarketingBookPage from "./pages/MarketingBookPage";
import MarketingExpensePage from "./pages/MarketingExpensePage";
import InventoryDashboardPage from "./pages/InventoryDashboardPage";
import DamageStockPage from "./pages/DamageStockPage";
import WarehousePage from "./pages/WarehousePage";
import SupplierHistoryPage from "./pages/SupplierHistoryPage";
import CreditLedgerPage from "./pages/CreditLedgerPage";
import ManufacturePage from "./pages/ManufacturePage";
import ItemsPage from "./pages/ItemsPage";
import ManufactureStockPage from "./pages/ManufactureStockPage";
import MixerPage from "./pages/MixerPage";
import StockAdjustmentPage from "./pages/StockAdjustmentPage";
import DamageRepairingStockPage from "./pages/DamageRepairingStockPage";
import EmployeeListPage from "./pages/EmployeeListPage";
import DailyProfitLossPage from "./pages/DailyProfitLossPage";
import DepartmentPage from "./pages/DepartmentPage";
import DesignationPage from "./pages/DesignationPage";
import ShiftPage from "./pages/ShiftPage";
import HolidayPage from "./pages/HolidayPage";
import AttendanceDevicePage from "./pages/AttendanceDevicePage";
import AttendanceEnrollmentPage from "./pages/AttendanceEnrollmentPage";
import AttendanceLogsPage from "./pages/AttendanceLogsPage";
import AttendanceSummaryPage from "./pages/AttendanceSummaryPage";
import AttendanceRegularizationPage from "./pages/AttendanceRegularizationPage";
import LeaveTypePage from "./pages/LeaveTypePage";
import LeaveRequestPage from "./pages/LeaveRequestPage";
import PayrollRunPage from "./pages/PayrollRunPage";
import PayslipPage from "./pages/PayslipPage";
import EmployeeProfilePage from "./pages/EmployeeProfilePage";

function App() {
  return (
    <Provider store={store}>
      <div className="flex min-h-dvh bg-gray-900 text-gray-100 overflow-x-hidden">
        {/* Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
          <div className="absolute inset-0 backdrop-blur-sm" />
        </div>

        {/* Main content area */}
        <div className="flex-1 relative z-10 min-h-dvh">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <OverviewPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/employee-profile"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <EmployeeProfilePage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/employee-list"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <EmployeeListPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/hrm/departments"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <DepartmentPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/hrm/designations"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <DesignationPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/hrm/shifts"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <ShiftPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/hrm/holidays"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <HolidayPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/hrm/attendance-devices"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <AttendanceDevicePage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/hrm/attendance-enrollments"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <AttendanceEnrollmentPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/hrm/attendance-logs"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <AttendanceLogsPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/hrm/attendance-summaries"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <AttendanceSummaryPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/hrm/attendance-regularizations"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <AttendanceRegularizationPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/hrm/leave-types"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <LeaveTypePage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/hrm/leave-requests"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <LeaveRequestPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/hrm/payroll-runs"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <PayrollRunPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/hrm/payslips"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <PayslipPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/employee"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <EmployeePage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/pos-sell"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <POSPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/pos-report"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <PosReportPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/inventory-overview"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <InventoryDashboardPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/item"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <ItemsPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/manufacture-stock"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <ManufactureStockPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/manufacture"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <ManufacturePage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/stock-adjustment"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <StockAdjustmentPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/mixer"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <MixerPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/stock-product"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <InventoryOverviewPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/products"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <ProductsPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/purchase-requisition"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <PurchaseRequisitionPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/purchase-product"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <ReceivedProductPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/intransit-product"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <InTransitProductPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/sales-return"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <ReturnProductPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/purchase-return"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <PurchaseReturnProductPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/damage-stock"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <DamageStockPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/damage-repairing-stock"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <DamageRepairingStockPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/damage-product"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <DamageProductPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/damage-repair"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <DamageRepairPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/damage-repaired"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <DamageRepairedPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/confirm-order"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <ConfirmOrderPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/meta"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <MetaPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/google"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <GooglePage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/tiktok"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <TiktokPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/seo"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <SEOPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/cash-in"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <CashInPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/petty-cash"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <PettyCashPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/credit-ledger"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <CreditLedgerPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/expense"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <ExpensePage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/book"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <AccountingPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/book/:id"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <CashInOutPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />

            <Route
              path="/marketing-book"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <MarketingBookPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/marketing-book/:id"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <MarketingExpensePage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/profit-loss"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <DailyProfitLossPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/warehouse"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <WarehousePage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/supplier"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <SupplierPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/supplier-history/:id"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <SupplierHistoryPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/assets-requisition"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <AssetsRequisitionPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/assets-purchase"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <AssetsPurchasePage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/assets-sale"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <AssetsSalePage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/assets-damage"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <AssetsDamagePage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/Receivable"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <ReceiveablePage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/payable"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <PayablePage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/user-management"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <UsermanagementPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/salary"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <SalaryPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/logo"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <LogoPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/settings/role-permissions"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <RolePermissionsPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/notifications"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <NotificationPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <ProfilePage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/expired-product"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <ExpiredProductPage />
                  </SidebarLayout>
                </RequireAuth>
              }
            />
          </Routes>
        </div>
      </div>

      <Toaster position="top-center" reverseOrder={false} />
    </Provider>
  );
}

export default App;

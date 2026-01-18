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

function App() {
  return (
    <Provider store={store}>
      <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
        {/* Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
          <div className="absolute inset-0 backdrop-blur-sm" />
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto relative z-10">
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
              path="/profile"
              element={
                <RequireAuth>
                  <SidebarLayout>
                    <ProfilePage />
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

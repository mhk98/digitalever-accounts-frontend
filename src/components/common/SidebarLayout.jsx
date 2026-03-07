import Sidebar from "./Sidebar";
import { useLayout } from "../../context/LayoutContext";

const SidebarLayout = ({ children }) => {
  const { isSidebarOpen } = useLayout();

  return (
    <div className="flex min-h-dvh bg-slate-50 relative overflow-x-hidden">
      {/* Sidebar - handles its own fixed/sticky desktop and mobile drawer logic */}
      <Sidebar />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-h-dvh transition-all duration-300 w-full ${isSidebarOpen ? "lg:ml-[280px]" : "lg:ml-[88px]"
          }`}
      >
        <div className="flex-1 w-full relative">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;

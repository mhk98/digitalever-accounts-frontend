import Sidebar from "./Sidebar";
import { useLayout } from "../../context/LayoutContext";
import ChatWidget from "../chat/ChatWidget";

const SidebarLayout = ({ children }) => {
  const { isSidebarOpen } = useLayout();

  return (
    <div className="flex min-h-dvh w-full min-w-0 bg-slate-50 relative overflow-x-hidden">
      {/* Sidebar - handles its own fixed/sticky desktop and mobile drawer logic */}
      <Sidebar />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-h-dvh min-w-0 transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-[280px]" : "lg:ml-[88px]"
        }`}
      >
        <div className="flex-1 w-full min-w-0 relative">{children}</div>
      </div>
      <ChatWidget />
    </div>
  );
};

export default SidebarLayout;

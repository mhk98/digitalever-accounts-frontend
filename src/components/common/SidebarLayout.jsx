// // SidebarLayout.js (to wrap your main content with the sidebar)
// // eslint-disable-next-line no-unused-vars

// import Sidebar from "./Sidebar"; // Assuming you have Sidebar component

// const SidebarLayout = ({ children }) => {
//   return (
//     <div className="flex">
//       <Sidebar /> {/* Sidebar for protected routes */}
//       <div className="flex-1">{children}</div> {/* Main content */}
//     </div>
//   );
// };

// export default SidebarLayout;

import Sidebar from "./Sidebar";

const SidebarLayout = ({ children }) => {
  return (
    <div className="flex min-h-dvh bg-slate-50">
      <Sidebar />
      <div className="flex-1 min-h-dvh bg-slate-50">{children}</div>
    </div>
  );
};

export default SidebarLayout;

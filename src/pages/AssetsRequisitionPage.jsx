// import { motion } from "framer-motion";

import AssetsRequisitionTable from "../components/assetsRequisition/AssetsRequisitionTable";
import Header from "../components/common/Header";

const AssetsRequisitionPage = () => {
  return (
    <div className="flex-1 relative z-10">
      <Header title="Purchase Assets" />

      <main className="max-w-8xl mx-auto py-6 px-4 lg:px-8 bg-slate-50 min-h-[calc(100vh-64px)]">
        <AssetsRequisitionTable />
      </main>
    </div>
  );
};
export default AssetsRequisitionPage;

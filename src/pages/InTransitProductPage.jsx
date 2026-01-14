// import { motion } from "framer-motion";

import Header from "../components/common/Header";
import InTransitProductTable from "../components/inTransiteProduct/inTransiteProductTable";

const InTransitProductPage = () => {
  return (
    <div className="flex-1 relative z-10">
      <Header title="Intransit Product" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <InTransitProductTable />
      </main>
    </div>
  );
};
export default InTransitProductPage;

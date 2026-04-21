import Header from "../components/common/Header";
import InTransitStockTable from "../components/InTransitStock/InTransitStockTable";

const InTransitStockPage = () => {
  return (
    <div className="flex-1 relative z-10">
      <Header title="Intransit Stock" />

      <main className="max-w-8xl mx-auto py-6 px-4 lg:px-8 bg-slate-50 min-h-[calc(100vh-64px)]">
        <InTransitStockTable />
      </main>
    </div>
  );
};

export default InTransitStockPage;

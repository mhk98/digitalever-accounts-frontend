import MarketingTable from "../components/marketingBook/MarketingBookTable";
import Header from "../components/common/Header";

const MarketingPage = () => {
  return (
    <div className="flex-1 relative z-10">
      <Header title="Business List" />

      <main className="max-w-8xl mx-auto py-6 px-4 lg:px-8 bg-slate-50 min-h-[calc(100vh-64px)]">
        <MarketingTable />
      </main>
    </div>
  );
};
export default MarketingPage;

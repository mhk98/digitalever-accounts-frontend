import Header from "../components/common/Header";
import MetaTable from "../components/meta/metaTable";

const MetaPage = () => {
  return (
    <div className="flex-1 relative z-10">
      <Header title="Meta Expense" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <MetaTable />
      </main>
    </div>
  );
};
export default MetaPage;

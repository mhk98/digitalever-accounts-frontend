import Header from "../components/common/Header";
import WarehouseTable from "../components/warehouse/WarehouseTable";

const WarehousePage = () => {
  return (
    <div className="flex-1 relative z-10">
      <Header title="Warehouse List" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <WarehouseTable />
      </main>
    </div>
  );
};
export default WarehousePage;

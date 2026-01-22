import Header from "../components/common/Header";
import EmployeeTable from "../components/employee/EmployeeTable";

const EmployeePage = () => {
  return (
    <div className="flex-1 relative z-10">
      <Header title="Product" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <EmployeeTable />
      </main>
    </div>
  );
};
export default EmployeePage;

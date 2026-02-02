import Header from "../components/common/Header";
import SalaryTable from "../components/salary/SalaryTable";

const SalaryPage = () => {
  return (
    <div className="flex-1 relative z-10">
      <Header title="Salary" />

      <main className="max-w-8xl mx-auto py-6 px-4 lg:px-8 bg-slate-50 min-h-[calc(100vh-64px)]">
        <SalaryTable />
      </main>
    </div>
  );
};
export default SalaryPage;

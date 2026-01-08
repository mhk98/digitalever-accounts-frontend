import CashInOutTable from "../components/cashIn/cashInOutTable";
import Header from "../components/common/Header";



const CashInOutPage = () => {
	return (
		<div className='flex-1 relative z-10'>
			<Header title='Product' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				
				<CashInOutTable/>

			</main>
		</div>
	);
};
export default CashInOutPage;

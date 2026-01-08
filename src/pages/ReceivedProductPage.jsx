
import Header from "../components/common/Header";
import ReceivedProductTable from "../components/receivedProduct/receivedProductTable";

const ReceivedProductPage = () => {
	return (
		<div className='flex-1 relative z-10'>
			<Header title='Product' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				
				<ReceivedProductTable/>

			</main>
		</div>
	);
};
export default ReceivedProductPage;

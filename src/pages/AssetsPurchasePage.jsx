// import { motion } from "framer-motion";

import AssetsPurchaseTable from "../components/assetsPurchase/AssetsPurchaseTable";
import Header from "../components/common/Header";

const AssetsPurchasePage = () => {
	return (
		<div className='flex-1 relative z-10'>
			<Header title='Product' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				
				<AssetsPurchaseTable/>

			</main>
		</div>
	);
};
export default AssetsPurchasePage;

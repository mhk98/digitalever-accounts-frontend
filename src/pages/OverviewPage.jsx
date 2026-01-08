/* eslint-disable no-mixed-spaces-and-tabs */
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { useEffect, useState } from "react";
import {
  Boxes,
  Warehouse,
  HandCoins,
  Truck,
  Receipt,
  Landmark
} from "lucide-react";

import axios from "axios";


const OverviewPage = () => {


	const [accountings, setAccountings] = useState([]);
		
	useEffect(() => {
   const fetchData = async () => {
	   try {
		   const response = await axios.get(`http://localhost:5000/api/v1/accounting`);
		   setAccountings(response.data.data);
	   } catch (err) {
		   console.log(err.message);
	   }
   };
   // Only fetch data if both dates are defined

	   fetchData();

}, []);

console.log("accountings", accountings);


		const [products, setProducts] = useState([])
		const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/v1/product");
		

                setProducts(response.data.meta);
            } catch (err) {
                console.log(err.message);
            }
        };


		useEffect(()=>{
			fetchData()
		}, [])

		
		
		// console.log("products", products);


	// 	const [products, setProducts] = useState([]);

    // console.log('products', products)
  
    //     const { data, isLoading, isError, error } = useGetAllProductQuery();
    
    //     useEffect(() => {
    //         if (isError) {
    //             console.error("Error fetching health data", error);
    //         } else if (!isLoading && data) {
    //             setProducts(data);
    //         }
    //     }, [data, isLoading, isError, error]);




	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Overview'  />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* STATS */}

			
	<motion.div
  className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1 }}
>
  <StatCard
    name="Total Assets"
    icon={Boxes}
    value={products.total || 0}
    color="#6366F1"
  />

  <StatCard
    name="Total Inventory Assets"
    icon={Warehouse}
    value={(accountings.totalPurchaseAmount || 0).toFixed(2)}
    color="#3B82F6"
  />

  <StatCard
    name="Total Dues"
    icon={HandCoins}
    value={(accountings.totalSaleAmount || 0).toFixed(2)}
    color="#10B981"
  />

  <StatCard
    name="Total Intransit Amount"
    icon={Truck}
    value={(accountings.intransitAmount || 0).toFixed(2)}
    color="#F59E0B"
  />

  <StatCard
    name="Total Expense Amount"
    icon={Receipt}
    value={(accountings.totalExpenseAmount || 0).toFixed(2)}
    color="#EF4444"
  />

  <StatCard
    name="Total Bank Amount"
    icon={Landmark}
    value={(accountings.bankBalance || 0).toFixed(2)}
    color="#8B5CF6"
  />
</motion.div>



				{/* CHARTS */}

				{/* <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					<SalesOverviewChart />
					<CategoryDistributionChart />
					<SalesChannelChart />
				</div> */}
			</main>
		</div>
	);
};
export default OverviewPage;

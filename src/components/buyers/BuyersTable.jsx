import { motion } from "framer-motion";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {  useDeleteBuyerMutation, useGetAllBuyerQuery, useGetAllBuyerWithoutQueryQuery, useInsertBuyerMutation, useUpdateBuyerMutation } from "../../features/buyer/buyer";
import Select from 'react-select';

const BuyersTable = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBuyer, setCurrentBuyer] = useState(null); 
    const [isModalOpen1, setIsModalOpen1] = useState(false);
    const [createBuyer, setCreateBuyer] = useState({ name: '', remarks: '' });
    const [buyers, setBuyers] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [buyerId, setBuyerId] = useState('');
    // const [filterData, setFilterData] = useState([]);


    const [currentPage, setCurrentPage] = useState(1);
    const [startPage, setStartPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1); // initial value as 1
    const [pagesPerSet, setPagesPerSet] = useState(10);
    // eslint-disable-next-line no-unused-vars
    const [itemsPerPage, setItemsPerPage] = useState(10);  // 2 items per page



    const [buyersData, setBuyersData] = useState([])

    const { data:data3, isLoading:isLoading3, isError:isError3, error:error3 } = useGetAllBuyerWithoutQueryQuery();

    useEffect(() => {
        if (isError3) {
            console.error("Error fetching buyer data", error3);
        } else if (!isLoading3 && data3) {
            setBuyersData(data3.data);
        }
    }, [data3, isLoading3, isError3, error3]);


    useEffect(() => {
        const updatePagesPerSet = () => {
            if (window.innerWidth < 640) {
                setPagesPerSet(5); 
            } else if (window.innerWidth < 1024) {
                setPagesPerSet(7);
            } else {
                setPagesPerSet(10); 
            }
        };

        updatePagesPerSet();
        window.addEventListener("resize", updatePagesPerSet);
        return () => window.removeEventListener("resize", updatePagesPerSet);
    }, []);

    const { data, isLoading, isError, error } = useGetAllBuyerQuery({ startDate, endDate, buyerId, page: currentPage, limit: itemsPerPage });

    useEffect(() => {
        if (isError) {
            console.error("Error fetching product data", error);
        } else if (!isLoading && data) {
            setBuyers(data.data);
            setTotalPages(Math.ceil(data.meta.total / itemsPerPage)); // totalPages is calculated dynamically from API response
        }
    }, [data, isLoading, isError, error, currentPage, itemsPerPage, startDate, endDate, buyerId]);


    const handleEditClick = (product) => {
        setCurrentBuyer(product);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleAddProduct = () => setIsModalOpen1(true);
    const handleModalClose1 = () => {
        setIsModalOpen1(false);
    };

    const [insertBuyer] = useInsertBuyerMutation();
    const handlecreateBuyer = async (e) => {
        e.preventDefault();
        const res = await insertBuyer(createBuyer).unwrap();
        if (res.success) {
            toast.success('Successfully created buyer');
        }
        setIsModalOpen1(false);
    };

    const [updateBuyer] = useUpdateBuyerMutation();
    const handleUpdateProduct = async () => {
        const updatedProduct = {
            name: currentBuyer.name,
            remarks: currentBuyer.remarks,
        };

        try {
            const res = await updateBuyer({ id: currentBuyer.Id, data: updatedProduct }).unwrap();
            if (res.success) {
                toast.success("Successfully updated buyer!");
                setIsModalOpen(false);
            } else {
                toast.error("Update failed!");
            }
        } catch (error) {
            console.log(error)
            toast.error(error.data.message);
        }
    };

    const [deleteBuyer] = useDeleteBuyerMutation();
    const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm("Do you want to delete this buyer?");

       if(confirmDelete) {
        try {
            const res = await deleteBuyer(id).unwrap();
            if (res.success) {
                toast.success("Successfully deleted buyer!");
            } else {
                toast.error("Delete failed!");
            }
        } catch (error) {
            toast.error(error.data.message);
        }
       } else {
        toast.info("Delete action was cancelled.");

       }
    };

    // New function to clear filters
    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setBuyerId('')

        // setFilterData([]);
    };


    
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        if (pageNumber < startPage) {
            setStartPage(pageNumber);
        } else if (pageNumber > endPage) {
            setStartPage(pageNumber - pagesPerSet + 1);
        }
    };

    const handlePreviousSet = () => setStartPage((prevStart) => Math.max(prevStart - pagesPerSet, 1));
    const handleNextSet = () => setStartPage((prevStart) => Math.min(prevStart + pagesPerSet, totalPages - pagesPerSet + 1));

    const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

    const buyerOptions = buyersData.map((buyer) => ({
        value: buyer.Id,
        label: buyer.name
    }));






    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className='my-6 flex justify-start'>
                <button className='flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-20 justify-center' onClick={handleAddProduct}>
                    Add <Plus size={18} className='ms-2' />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-6 w-full justify-center mx-auto">
                <div className='flex items-center justify-center'>
                    <label className='mr-2 text-sm text-white'>Start Date:</label>
                    <input type='date' onChange={(e) => setStartDate(e.target.value)} className='border border-gray-300 rounded p-1 text-black bg-white' />
                </div>
                <div className='flex items-center justify-center'>
                    <label className='mr-2 text-sm text-white'>End Date:</label>
                    <input type='date' onChange={(e) => setEndDate(e.target.value)} className='border border-gray-300 rounded p-1 text-black bg-white' />
                </div>
                
                <div className='flex items-center justify-center'>
    <Select
        options={buyerOptions}
        value={buyerOptions.find((option) => option.value === currentBuyer?.buyerId)} // Optional chaining ব্যবহার করা হলো
        onChange={(selectedOption) => setBuyerId(selectedOption?.value)}
        placeholder="Select Buyer"
        isClearable
        className="text-black"
    />
</div>

                <button className='flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-36 justify-center mx-auto' onClick={clearFilters}>
                    Clear Filters
                </button>
            </div>

            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Name</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Due Amount</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Remarks</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-700'>
                        {
                        
                        
                            buyers.map((product) => (
                                <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{product.name}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{Number(product.due_amount || 0).toFixed(2)}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{product.remarks}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                        <button className='text-indigo-400 hover:text-indigo-300 mr-2' onClick={() => handleEditClick(product)}>
                                            <Edit size={18} />
                                        </button>
                                        <button className='text-red-400 hover:text-red-300' onClick={() => handleDeleteProduct(product.Id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>


            <div className='flex items-center justify-center space-x-2 mt-6'>
                <button onClick={handlePreviousSet} disabled={startPage === 1} className='px-3 py-2 text-white bg-indigo-600 rounded-md disabled:bg-gray-400'>
                    Prev
                </button>

                {[...Array(endPage - startPage + 1)].map((_, index) => {
                    const pageNum = startPage + index;
                    return (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 text-white rounded-md ${pageNum === currentPage ? 'bg-indigo-600' : 'bg-indigo-500 hover:bg-indigo-400'}`}
                        >
                            {pageNum}
                        </button>
                    );
                })}

                <button onClick={handleNextSet} disabled={endPage === totalPages} className='px-3 py-2 text-white bg-indigo-600 rounded-md disabled:bg-gray-400'>
                    Next
                </button>
            </div>

            {/* Modal for editing product */}
            {isModalOpen && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                    <motion.div className='bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3' initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <h2 className='text-lg font-semibold text-white'>Edit Buyer</h2>
                        <div className='mt-4'>
                            <label className='block text-sm text-white'>Name:</label>
                            <input type='text' value={currentBuyer?.name} onChange={(e) => setCurrentBuyer({ ...currentBuyer, name: e.target.value })} className='border border-gray-300 rounded p-2 w-full mt-1 text-black' />
                        </div>
                        {/* <div className='mt-4'>
                            <label className='block text-sm text-white'>Due Amount:</label>
                            <input type='number' value={currentBuyer?.due_amount} onChange={(e) => setCurrentBuyer({ ...currentBuyer, due_amount: e.target.value })} className='border border-gray-300 rounded p-2 w-full mt-1 text-black' />
                        </div> */}
                        <div className='mt-4'>
                            <label className='block text-sm text-white'>Remarks:</label>
                            <textarea
                                value={currentBuyer?.remarks}
                                onChange={(e) => setCurrentBuyer({ ...currentBuyer, remarks: e.target.value })}
                                className='border border-gray-300 rounded p-2 w-full mt-1 text-black'
                                rows={4} // You can adjust the number of rows as needed
                            />
                        </div>
                        <div className='mt-6 flex justify-end'>
                            <button className='bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2' onClick={handleUpdateProduct}>Save</button>
                            <button className='bg-red-600 hover:bg-red-700 text-white p-2 rounded' onClick={handleModalClose}>Cancel</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Modal for adding product */}
            {isModalOpen1 && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                    <motion.div className='bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3' initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <h2 className='text-lg font-semibold text-white'>Add Buyer</h2>
                        <form onSubmit={handlecreateBuyer}>
                            <div className='mt-4'>
                                <label className='block text-sm text-white'>Name:</label>
                                <input type='text' value={createBuyer.name} onChange={(e) => setCreateBuyer({ ...createBuyer, name: e.target.value })} className='border border-gray-300 rounded p-2 w-full mt-1 text-black' required />
                            </div>
                            {/* <div className='mt-4'>
                                <label className='block text-sm text-white'>Due Amount:</label>
                                <input type='number' value={createBuyer.due_amount} onChange={(e) => setCreateBuyer({ ...createBuyer, due_amount: parseInt(e.target.value) })} className='border border-gray-300 rounded p-2 w-full mt-1 text-black' required />
                            </div> */}
                            <div className='mt-4'>
                            <label className='block text-sm text-white'>Remarks:</label>
                            <textarea
                                value={createBuyer?.remarks}
                                onChange={(e) => setCreateBuyer({ ...createBuyer, remarks: e.target.value })}
                                className='border border-gray-300 rounded p-2 w-full mt-1 text-black'
                                rows={4} // You can adjust the number of rows as needed
                            />
                        </div>
                            <div className='mt-6 flex justify-end'>
                                <button type='submit' className='bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2'>Save</button>
                                <button type='button' className='bg-red-600 hover:bg-red-700 text-white p-2 rounded' onClick={handleModalClose1}>Cancel</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default BuyersTable;

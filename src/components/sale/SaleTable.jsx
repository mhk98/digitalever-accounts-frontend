import { motion } from "framer-motion";
import {  Download, Edit, FileDown, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDeleteSaleMutation, useGetAllSaleQuery, useInsertSaleMutation, useUpdateSaleMutation } from "../../features/sale/sale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable
import * as XLSX from "xlsx";
import Select from 'react-select';
import { useGetAllBuyerWithoutQueryQuery } from "../../features/buyer/buyer";
import { useGetAllProductWithoutQueryQuery } from "../../features/product/product";


const SaleTable = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSale, setCurrentSale] = useState(null); 
    const [isModalOpen1, setIsModalOpen1] = useState(false);
    const [createSale, setCreateSale] = useState({ buyer_name: '',transaction_date:'', quantity: 0, rate:0, paid_amount:0, remarks: '', buyerId:''});
    const [sales, setSales] = useState([]);
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


    const { data, isLoading, isError, error } = useGetAllSaleQuery({ startDate, endDate, buyerId, page: currentPage, limit: itemsPerPage });

    useEffect(() => {
        if (isError) {
            console.error("Error fetching product data", error);
        } else if (!isLoading && data) {
            setSales(data.data);
            setTotalPages(Math.ceil(data.meta.total / itemsPerPage)); // totalPages is calculated dynamically from API response
        }
    }, [data, isLoading, isError, error, currentPage, itemsPerPage, startDate, endDate, buyerId]);


    console.log('sales', sales.quantity)

    const [products, setProducts] = useState([])

    const { data:data2, isLoading:isLoading2, isError:isError2, error:error2 } = useGetAllProductWithoutQueryQuery();

    useEffect(() => {
        if (isError2) {
            console.error("Error fetching purchase data", error2);
        } else if (!isLoading2 && data2) {
            setProducts(data2.data);
        }
    }, [data2, isLoading2, isError2, error2]);

    const [buyers, setBuyers] = useState([])

    const { data:data3, isLoading:isLoading3, isError:isError3, error:error3 } = useGetAllBuyerWithoutQueryQuery();

    useEffect(() => {
        if (isError3) {
            console.error("Error fetching buyer data", error3);
        } else if (!isLoading3 && data3) {
            setBuyers(data3.data);
        }
    }, [data3, isLoading3, isError3, error3]);

  

    const handleEditClick = (product) => {
        console.log('editProduct', product);
        setCurrentSale(product);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleAddProduct = () => setIsModalOpen1(true);
    const handleModalClose1 = () => {
        setIsModalOpen1(false);
    };

    const [insertSale] = useInsertSaleMutation();
    const handlecreateSale = async (e) => {
        e.preventDefault();

        const id = localStorage.getItem('userId') 
        const addSale = {
            transaction_date: createSale.transaction_date,
            quantity: createSale.quantity,
            rate: createSale.rate,
            paid_amount: createSale.paid_amount,
            remarks: createSale.remarks,
            buyerId:createSale.buyerId,
            userId: id,
            productId: createSale.productId
        };

        try {
        const res = await insertSale(addSale).unwrap();
        if (res.success) {
            toast.success('Successfully created sale');
            // window.location.reload();
        setIsModalOpen1(false);

        }  else {
            toast.error("Insert failed!");

        }
        } catch (error) {
            console.log(error)
            toast.error(error.data.message);
        }
      
    };

    const [updateSale] = useUpdateSaleMutation();
    const handleUpdateProduct = async () => {
        const updatedProduct = {
            transaction_date: currentSale.transaction_date,
            quantity: currentSale.quantity,
            rate: currentSale.rate,
            paid_amount: currentSale.paid_amount,
            remarks: currentSale.remarks,
            buyerId:currentSale.buyerId,
            productId: currentSale.productId

        };

        try {
            const res = await updateSale({ id: currentSale.Id, data: updatedProduct }).unwrap();
            if (res.success) {
                toast.success("Successfully updated sale!");
                // window.location.reload();
                setIsModalOpen(false);

            } else {
                toast.error("Update failed!");
            }
        } catch (error) {
            console.log(error)
            toast.error(error.data.message);
        }
    };

    const [deleteSale] = useDeleteSaleMutation();
    const handleDeleteProduct = async (id) => {

    const confirmDelete = window.confirm("Do you want to delete?");


       if(confirmDelete){
        try {
            const res = await deleteSale(id).unwrap();
            if (res.success) {
        
                toast.success("Successfully deleted sale!");     
                // window.location.reload();

            } else {
                toast.error("Delete failed!");
            }
        } catch (error) {
            toast.error(error.data.message);
        }
       }  else {
        toast.info("Delete action was cancelled.");

       }
    };

    // New function to clear filters
    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        // setFilterData([]);
        setBuyerId("")
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
    

    const handleDownload = (product) => {
        const doc = new jsPDF();

       
        // Add Invoice Header
        doc.setFontSize(20);
        doc.text("Invoice", 14, 20);
        
        // Add Company Information
        doc.setFontSize(12);
        doc.text(`${product.FirstName} ${product.LastName}`, 14, 30);
        doc.text(`${product.Address}`, 14, 35);
        doc.text(`${product.Email}`, 14, 40);
        doc.text(`${product.Phone}`, 14, 45);
        
        // Add Invoice Details
        doc.setFontSize(14);
        doc.text(`Invoice #${product.Id}`, 14, 60);
        doc.text(`Date: ${product.transaction_date}`, 14, 65); // Assuming current date for simplicity
       

        const data = [
            ["Buyer Name", "Quantity", "Price", "Paid Amount", "Due Amount"],
            [product.buyer_name, product.quantity, product.price, product.paid_amount, product.due_amount]
        ];

        autoTable(doc, {
            head: data.slice(0, 1), // Header row
            body: data.slice(1), // Data rows
            startY: 80, // Adjust starting position for the table
        });

        doc.save(`Salesrecord.pdf`);
    };


    // Function to export data to Excel
    const exportToExcel = () => {
        // Extract the "data" array from the JSON response
        const jsonData = sales;
    
        // Create a worksheet from the JSON data
        const ws = XLSX.utils.json_to_sheet(jsonData);
    
        // Create a new workbook and append the worksheet to it
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    
        // Generate Excel file and trigger download
        XLSX.writeFile(wb, "sale.xlsx");
      };



      const productOptions = products.map((product) => ({
        value: product.Id,
        label: product.name
    
    }));
    
    
    
    const buyerOptions = buyers.map((buyer) => ({
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
           
            <div className='my-6 flex flex-col md:flex-row justify-between items-center md:items-start gap-4'>
    <button className='flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-20 justify-center' onClick={handleAddProduct}>
        Add <Plus size={18} className='ms-2' />
    </button>
    <button className='flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 p-2 rounded w-20 justify-center' onClick={exportToExcel}>
        Export <FileDown size={18} className='ms-2' />
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
        value={buyerOptions.find((option) => option.value === currentSale?.supplierId)} // Optional chaining ব্যবহার করা হলো
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
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Transaction Date</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Product Name</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Buyer Name</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Quantity</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Rate</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Total Price</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Paid Amount</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Due Amount</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Remarks</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-700'>
                        {
                        
                            sales.map((product) => (
                                <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{new Date(product.transaction_date).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{product.product_name}</td>
                                     <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{product.buyer_name}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{Number(product.quantity || 0).toFixed(3)}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{Number(product.rate || 0).toFixed(0)}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{Number(product.price).toFixed(2)}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{Number(product.paid_amount || 0).toFixed(2)}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{Number(product.due_amount).toFixed(2)}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{product.remarks}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {/* <button className='text-indigo-400 hover:text-indigo-300 mr-2'><Download size={18}/></button> */}
                                    <button className='text-indigo-400 hover:text-indigo-300 mr-2' onClick={() => handleDownload(product)}>
                                            <Download size={18} />
                                        </button>
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
                <div className='fixed inset-0 top-72  flex items-center justify-center bg-black bg-opacity-50'>
                   <motion.div className='bg-gray-800  rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3' initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <h2 className='text-lg font-semibold text-white'>Edit Sale</h2>

                         <div className='mt-4'>
                        <label className='block text-sm text-white'>Product Name:</label>
                        <Select
                            options={productOptions}
                            value={productOptions.find((option) => option.value === currentSale.productId)}
                            onChange={(selectedOption) => setCurrentSale({ ...currentSale, productId: selectedOption?.value })}
                            placeholder="Select Product"
                            isClearable
                            className="text-black"
                        />
                    </div>



                    <div className='mt-4'>
                        <label className='block text-sm text-white'>Buyer Name:</label>
                        <Select
                            options={buyerOptions}
                            value={buyerOptions.find((option) => option.value === currentSale.buyerId)}
                            onChange={(selectedOption) => setCurrentSale({ ...currentSale, buyerId: selectedOption?.value })}
                            placeholder="Select Buyer"
                            isClearable
                            className="text-black"
                        />
                    </div>

                <div className='mt-4'>
                    <label className='block text-sm text-white'> Date:</label>
                    <input type='date' value={currentSale?.transaction_date} onChange={(e) => setCurrentSale({ ...currentSale, transaction_date: e.target.value })} className='border border-gray-300 rounded p-1 text-black bg-white' />
                </div>

                        <div className='mt-4'>
                            <label className='block text-sm text-white'>Quantity:</label>
                            <input type='number' value={currentSale?.quantity} onChange={(e) => setCurrentSale({ ...currentSale, quantity: e.target.value })} className='border border-gray-300 rounded p-2 w-full mt-1 text-black' />
                        </div>
                        <div className='mt-4'>
                            <label className='block text-sm text-white'>Rate:</label>
                            <input type='number' value={currentSale?.rate} onChange={(e) => setCurrentSale({ ...currentSale, rate: e.target.value })} className='border border-gray-300 rounded p-2 w-full mt-1 text-black' />
                        </div>
                        <div className='mt-4'>
                            <label className='block text-sm text-white'>Paid Amount:</label>
                            <input type='number' value={currentSale?.paid_amount} onChange={(e) => setCurrentSale({ ...currentSale, paid_amount: e.target.value })} className='border border-gray-300 rounded p-2 w-full mt-1 text-black' />
                        </div>
                        {/* <div className='mt-4'>
                            <label className='block text-sm text-white'>Due Amount:</label>
                            <input type='number' value={currentSale?.due_amount} onChange={(e) => setCurrentSale({ ...currentSale, due_amount: e.target.value })} className='border border-gray-300 rounded p-2 w-full mt-1 text-black' />
                        </div> */}
                       
                        <div className='mt-4'>
                            <label className='block text-sm text-white'>Remarks:</label>
                            <textarea
                                value={currentSale?.remarks}
                                onChange={(e) => setCurrentSale({ ...currentSale, remarks: e.target.value })}
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
                <div className='fixed inset-0 top-60 flex items-center justify-center bg-black bg-opacity-50'>
                   <motion.div className='bg-gray-800 rounded-lg p-6 shadow-lg w-full md:w-1/3 lg:w-1/3' initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <h2 className='text-lg font-semibold text-white'>Add Sale</h2>


                        <div className='mt-4'>
                        <label className='block text-sm text-white'>Product Name:</label>
                        <Select
                            options={productOptions}
                            value={productOptions.find((option) => option.value === createSale.productId)}
                            onChange={(selectedOption) => setCreateSale({ ...createSale, productId: selectedOption?.value })}
                            placeholder="Select Product"
                            isClearable
                            className="text-black"
                        />
                    </div>



                    <div className='mt-4'>
                        <label className='block text-sm text-white'>Buyer Name:</label>
                        <Select
                            options={buyerOptions}
                            value={buyerOptions.find((option) => option.value === createSale.buyerId)}
                            onChange={(selectedOption) => setCreateSale({ ...createSale, buyerId: selectedOption?.value })}
                            placeholder="Select Buyer"
                            isClearable
                            className="text-black"
                        />
                    </div>

                        <div className='mt-4'>
                    <label className='block text-sm text-white'> Date:</label>
                    <input type='date' value={createSale?.transaction_date} onChange={(e) => setCreateSale({ ...createSale, transaction_date: e.target.value })} className='border border-gray-300 rounded p-1 text-black bg-white' />
                </div>

                        <div className='mt-4'>
                            <label className='block text-sm text-white'>Quantity:</label>
                            <input type='number' value={createSale?.quantity} onChange={(e) => setCreateSale({ ...createSale, quantity: e.target.value })} className='border border-gray-300 rounded p-2 w-full mt-1 text-black' />
                        </div>
                        <div className='mt-4'>
                            <label className='block text-sm text-white'>Rate:</label>
                            <input type='number' value={createSale?.rate} onChange={(e) => setCreateSale({ ...createSale, rate: e.target.value })} className='border border-gray-300 rounded p-2 w-full mt-1 text-black' />
                        </div>
                        <div className='mt-4'>
                            <label className='block text-sm text-white'>Paid Amount:</label>
                            <input type='number' value={createSale?.paid_amount} onChange={(e) => setCreateSale({ ...createSale, paid_amount: e.target.value })} className='border border-gray-300 rounded p-2 w-full mt-1 text-black' />
                        </div>
                        {/* <div className='mt-4'>
                            <label className='block text-sm text-white'>Due Amount:</label>
                            <input type='number' value={createSale?.due_amount} onChange={(e) => setCreateSale({ ...createSale, due_amount: e.target.value })} className='border border-gray-300 rounded p-2 w-full mt-1 text-black' />
                        </div> */}
                       
                        <div className='mt-4'>
                            <label className='block text-sm text-white'>Remarks:</label>
                            <textarea
                                value={createSale?.remarks}
                                onChange={(e) => setCreateSale({ ...createSale, remarks: e.target.value })}
                                className='border border-gray-300 rounded p-2 w-full mt-1 text-black'
                                rows={4} // You can adjust the number of rows as needed
                            />
                        </div>
                        <div className='mt-6 flex justify-end'>
                            <button className='bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded mr-2' onClick={handlecreateSale}>Save</button>
                            <button className='bg-red-600 hover:bg-red-700 text-white p-2 rounded' onClick={handleModalClose1}>Cancel</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default SaleTable;

import {
    Search,
    RefreshCw,
    FileText,
    Plus,
    RotateCcw,
    ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";


const walletHistory = [
    {
        id: 1,
        date: "02 মার্চ 2026, 03:26 PM",
        credit: "",
        debit: "৳8,000",
        balance: "৳8,000",
        note: "",
    },
    {
        id: 2,
        date: "08 মার্চ 2026, 03:26 PM",
        credit: "",
        debit: "৳8,000",
        balance: "৳8,000",
        note: "",
    },
    {
        id: 3,
        date: "08 মার্চ 2026, 03:28 PM",
        credit: "৳8,000",
        debit: "",
        balance: "৳8,000",
        note: "",
    },
    {
        id: 4,
        date: "08 মার্চ 2026, 03:28 PM",
        credit: "",
        debit: "৳8,000",
        balance: "৳8,000",
        note: "",
    },
    {
        id: 5,
        date: "10 মার্চ 2026, 02:32 PM",
        credit: "৳8,000",
        debit: "",
        balance: "৳8,000",
        note: "সহজ নোট: Something",
    },
];

const customers = [
    {
        id: 1,
        name: "Sabbir",
        phone: "+88 01518301098",
        balance: "৳ 8,000",
        status: "পেন্ডিং",
    },
];

export default function CreditLedgerTable() {
    return (
        <motion.div
            className="bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl p-6 border border-slate-200 mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
        >

            {/* Header */}
            <div className="flex flex-col gap-3 border-b border-slate-200 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
                <h1 className="text-lg font-bold text-slate-800 sm:text-xl">
                    বাকি খাতা
                </h1>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-500">
                        মোট পাবো: ৳8,000
                    </div>
                    <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-500">
                        মোট দিবো: ৳0
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                        <RotateCcw size={16} />
                        বাকি ইতিহাস
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Plus size={16} />
                        নতুন বাকি
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)]">
                {/* Left Panel */}
                <aside className="border-b border-slate-200 xl:border-b-0 xl:border-r">
                    <div className="p-3 sm:p-4">
                        {/* Tabs */}
                        <div className="flex flex-wrap gap-5 border-b border-slate-200 text-sm font-medium text-slate-500">
                            <button className="border-b-2 border-black pb-2 text-slate-900">
                                কাস্টমার
                            </button>
                            <button className="pb-2 hover:text-slate-800">সাপ্লায়ার</button>
                            <button className="pb-2 hover:text-slate-800">কর্মচারী</button>
                        </div>

                        {/* Search */}
                        <div className="mt-4 flex gap-2">
                            <div className="relative flex-1">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="text"
                                    placeholder="কন্ট্যাক্ট খোঁজ করুন"
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-slate-400"
                                />
                            </div>

                            <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
                                <RefreshCw size={16} className="text-slate-600" />
                            </button>

                            <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
                                <FileText size={16} className="text-slate-600" />
                            </button>
                        </div>

                        {/* Customer List */}
                        <div className="mt-4 space-y-3">
                            {customers.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm"
                                >
                                    <div className="flex min-w-0 gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                                            S
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-slate-800">
                                                {item.name}
                                            </p>
                                            <p className="truncate text-sm text-slate-500">
                                                {item.phone}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-semibold text-green-500">
                                            {item.balance}
                                        </p>
                                        <span className="mt-1 inline-block rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Right Panel */}
                <section className="flex min-h-[500px] flex-col">
                    {/* Top info */}
                    <div className="border-b border-slate-200 p-3 sm:p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700">
                                    S
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-semibold text-slate-700">
                                            Sabbir
                                        </h2>
                                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
                                            CUSTOMER
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400">+88 01518301098</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
                                    <FileText size={16} className="text-slate-600" />
                                </button>

                                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                                    Jan 01, 2000 - Dec 31, 2026
                                </div>

                                <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
                                    <RefreshCw size={16} className="text-slate-600" />
                                </button>

                                <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                                    বাকি তুলনা
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-6">
                            <div>
                                <p className="text-xs text-slate-400">ব্যালেন্স</p>
                                <p className="text-3xl font-bold text-green-500">৳ 8,000</p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block flex-1 overflow-auto p-3 sm:p-4">
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">
                                            বাকি ইতিহাস
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium text-green-500">
                                            পেয়েছি
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium text-red-500">
                                            দিয়েছি
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            ব্যালেন্স
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {walletHistory.map((item) => (
                                        <tr key={item.id} className="border-t border-slate-200">
                                            <td className="px-4 py-3 text-slate-600">
                                                <div>{item.date}</div>
                                                {item.note && (
                                                    <div className="mt-1 text-xs text-slate-500">
                                                        {item.note}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-green-500">
                                                {item.credit}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-red-500">
                                                {item.debit}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-700">
                                                {item.balance}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t bg-slate-50">
                                    <tr>
                                        <td className="px-4 py-3 font-semibold text-slate-700">
                                            মোট
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-green-500">
                                            ৳16,000
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-red-500">
                                            ৳16,000
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-green-500">
                                            ৳8,000
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Mobile card history */}
                    <div className="space-y-3 p-3 md:hidden">
                        {walletHistory.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-xl border border-slate-200 bg-white p-4"
                            >
                                <p className="text-sm text-slate-600">{item.date}</p>
                                {item.note && (
                                    <p className="mt-1 text-xs text-slate-500">{item.note}</p>
                                )}

                                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-400">পেয়েছি</p>
                                        <p className="font-semibold text-green-500">
                                            {item.credit || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">দিয়েছি</p>
                                        <p className="font-semibold text-red-500">
                                            {item.debit || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">ব্যালেন্স</p>
                                        <p className="font-semibold text-slate-700">
                                            {item.balance}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                    <p className="text-xs text-slate-400">মোট পেয়েছি</p>
                                    <p className="font-semibold text-green-500">৳16,000</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">মোট দিয়েছি</p>
                                    <p className="font-semibold text-red-500">৳16,000</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">ব্যালেন্স</p>
                                    <p className="font-semibold text-slate-700">৳8,000</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom action buttons */}
                    <div className="mt-auto grid grid-cols-1 gap-3 border-t border-slate-200 p-3 sm:grid-cols-2 sm:p-4">
                        <button className="rounded-xl bg-red-500 px-4 py-3 font-semibold text-white hover:bg-red-600">
                            দিয়েছি
                        </button>
                        <button className="rounded-xl bg-green-500 px-4 py-3 font-semibold text-white hover:bg-green-600">
                            পেয়েছি
                        </button>
                    </div>
                </section>
            </div>

        </motion.div>

    );
}
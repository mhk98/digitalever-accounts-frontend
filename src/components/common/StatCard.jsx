// import { motion } from "framer-motion";

// const StatCard = ({ name, icon: Icon, value, color }) => {
// 	return (
// 		<motion.div
// 			className='bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700'
// 			whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
// 		>
// 			<div className='px-4 py-5 sm:p-6'>
// 				<span className='flex items-center text-sm font-medium text-gray-400'>
// 					<Icon size={20} className='mr-2' style={{ color }} />
// 					{name}
// 				</span>
// 				<p className='mt-1 text-3xl font-semibold text-gray-100'>{value}</p>
// 			</div>
// 		</motion.div>
// 	);
// };
// export default StatCard;

// import { motion } from "framer-motion";

// const StatCard = ({
//   name,
//   icon: Icon,
//   value,
//   iconBg = "#EEF2FF",
//   iconColor = "#6366F1",
// }) => {
//   return (
//     <motion.div
//       className="bg-white rounded-xl border border-slate-200 shadow-sm"
//       whileHover={{ y: -3 }}
//       transition={{ type: "spring", stiffness: 300, damping: 20 }}
//     >
//       <div className="p-5 flex items-center gap-4">
//         {/* Left: Icon Bubble */}
//         <div
//           className="h-12 w-12 rounded-full flex items-center justify-center"
//           style={{ backgroundColor: iconBg }}
//         >
//           <Icon size={18} style={{ color: iconColor }} />
//         </div>

//         {/* Right: Value + Label */}
//         <div className="flex-1 text-right">
//           <div className="text-2xl font-semibold text-slate-800 leading-none">
//             {value}
//           </div>
//           <div className="mt-1 text-xs text-slate-500">{name}</div>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default StatCard;

import { motion } from "framer-motion";

const StatCard = ({ name, icon: Icon, value, iconBg, iconColor }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="
        bg-white rounded-2xl border border-slate-200 shadow-sm
        p-4 hover:shadow-md transition
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{name}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: iconBg || "#F1F5F9" }}
        >
          <Icon size={20} style={{ color: iconColor || "#0F172A" }} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;

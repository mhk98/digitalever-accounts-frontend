import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/**
 * Standardized Premium Modal Component
 * 
 * Features:
 * - Uses React Portal to avoid stacking context issues (Sidebar/Header overlay)
 * - Standardized z-indices (9998 backdrop, 9999 modal)
 * - Full-screen responsive backdrop with blur
 * - Click-outside and Escape key closing
 * - Body scroll locking
 * - Framer Motion animations
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = "max-w-2xl",
    showCloseButton = true
}) => {
    // Body scroll locking
    useEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);

    // Escape key listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8"
                    role="dialog"
                    aria-modal="true"
                >
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]"
                    />

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300
                        }}
                        className={`relative w-full ${maxWidth} bg-white rounded-3xl shadow-2xl border border-slate-200 z-[9999] flex flex-col max-h-[90vh] overflow-hidden`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                                {title}
                            </h2>
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all active:scale-90 shadow-sm"
                                    type="button"
                                    aria-label="Close modal"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {/* Body Container (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default Modal;

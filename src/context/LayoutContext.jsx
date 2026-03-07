import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Desktop collapse
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile drawer
    const { pathname } = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
    const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

    return (
        <LayoutContext.Provider
            value={{
                isSidebarOpen,
                setIsSidebarOpen,
                toggleSidebar,
                isMobileMenuOpen,
                setIsMobileMenuOpen,
                toggleMobileMenu,
            }}
        >
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) {
        // Return a dummy context or throw error
        // To avoid breaking if used outside (though it shouldn't be)
        return {
            isSidebarOpen: true,
            setIsSidebarOpen: () => { },
            toggleSidebar: () => { },
            isMobileMenuOpen: false,
            setIsMobileMenuOpen: () => { },
            toggleMobileMenu: () => { },
        };
    }
    return context;
};

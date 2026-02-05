import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router"; 
import { motion, AnimatePresence } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Context Providers
import { FormProvider } from "./context/FormContext.jsx"; 
import { CartProvider, useCart } from "./context/CartContext.jsx"; 

// Layout & Static Components
import MainLayout from './layouts/MainLayout/MainLayout.jsx';
import AdminLayout from './layouts/AdminLayout/DashboardLayout.jsx';
import RestaurantLayout from './layouts/RestaurantLayout/ResDashboardLayout.jsx';
import OrderTracker from './Components/Button/OrderTrackerSticky.jsx';
import ScrollToTop from "./Components/Shared/ScrollToTop.jsx";
import InteractiveLoader from "./Components/Shared/InteractiveLoader.jsx";
import NotFound from './Pages/NotFound.jsx';

// CSS
import './App.css';

// --- Lazy Loading ---
const Home = lazy(() => import('./Pages/Home/Home.jsx'));
const AreaPage = lazy(() => import("./Components/Arealist/AreaPage.jsx"));
const AddMenuForm = lazy(() => import('./Pages/Home/AddMenuForm.jsx'));
const CartPage = lazy(() => import("./Components/Cart/CartPage.jsx"));
const AllRestaurants = lazy(() => import("./Pages/Home/AllRestaurants.jsx"));
const ConfirmCart = lazy(() => import("./Components/Cart/ConfirmCart.jsx"));
const CheckoutBox = lazy(() => import('./Components/Cart/CheckoutBox'));
const OrderSuccess = lazy(() => import('./Components/Cart/OrderSuccess.jsx'));
const TemplatePage = lazy(() => import("./Pages/Home/TemplatePage.jsx"));

// Admin Pages
const Dashboard = lazy(() => import("./Pages/Admin/Dashboard.jsx"));
const AddArea = lazy(() => import("./Pages/Admin/AddArea.jsx"));
const TopRestrurant = lazy(() => import("./Pages/Admin/TopRestrurant.jsx"));
const OfferList = lazy(() => import("./Pages/Admin/OfferList.jsx"));
const Request = lazy(() => import("./Pages/Admin/RestrurantAddRequest.jsx"));
const Sales_Table_Report = lazy(() => import("./Pages/Admin/Sales_Table_Report.jsx"));
const ChatList = lazy(() => import("./Pages/Admin/ChatList.jsx"));
const Review = lazy(() => import("./Pages/Admin/Review.jsx"));
const Registration = lazy(() => import("./Pages/Admin/Registration.jsx"));

//Restaurant Admin main Pages
const ResDashboard = lazy(() => import("./Pages/RestaurantAdmin/Dashboard.jsx"));
//const ResDeliveryCharge = lazy(() => import("./Pages/RestaurantAdmin/AddDeliveryCharge.jsx"));
const ResManageShop = lazy(() => import("./Pages/RestaurantAdmin/ManageShop.jsx"));
const ResDeliveryArea = lazy(() => import("./Pages/RestaurantAdmin/DeliveryArea.jsx"));
const ResCategory = lazy(() => import("./Pages/RestaurantAdmin/MenuCategory.jsx"));
const ResMenu = lazy(() => import("./Pages/RestaurantAdmin/Menu.jsx"));
const ResCart = lazy(() => import("./Pages/RestaurantAdmin/CartList.jsx"));
const ResAvailable = lazy(() => import("./Pages/RestaurantAdmin/AvailableFood.jsx"));
const ResOrder = lazy(() => import("./Pages/RestaurantAdmin/OrderFood.jsx"));
const ResReports = lazy(() => import("./Pages/RestaurantAdmin/SalesReport.jsx"));
const ResOffers = lazy(() => import("./Pages/RestaurantAdmin/Addoffer.jsx"));
const ResRegistration = lazy(() => import("./Pages/RestaurantAdmin/Registration.jsx"));

//Restaurant Admin dropdown pages
const GraphReport = lazy(() => import("./Pages/RestaurantAdmin/GraphReport.jsx"));
const TableReport = lazy(() => import("./Pages/RestaurantAdmin/TableReport.jsx"));
const CreateOrder = lazy(() => import("./Pages/RestaurantAdmin/CreateOrder.jsx"));
const AddMenu = lazy(() => import("./Pages/RestaurantAdmin/AddMenu.jsx"));
const OrderList = lazy(() => import("./Pages/RestaurantAdmin/OrderList.jsx"));
const MenuList = lazy(() => import("./Pages/RestaurantAdmin/MenuList.jsx"));

// Login Pages
const LoginPage = lazy(() => import('./Pages/RestrurantLogin/LoginPage.jsx'));
const RestaurantLoginPage = lazy(() => import("./Pages/RestrurantLogin/LoginPage.jsx"));
const SuperAdminLoginPage = lazy(() => import("./Pages/SuperAdminLogin/LoginPage.jsx"));
const AdminAreaPage = lazy(() => import("./Components/Arealist/AreaPage.jsx")); 

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false },
  },
});

const AppContent = () => {
  const location = useLocation();
  const { cart } = useCart(); 

  useEffect(() => {
    const rawData = sessionStorage.getItem('global_cart_data');
    if (rawData) {
      const parsedCart = JSON.parse(rawData);
      if (parsedCart.length > 0 && parsedCart[0].addedAt) {
        const timeNow = Date.now();
        const diff = timeNow - parsedCart[0].addedAt;
        const fourHours = 4 * 60 * 60 * 1000;

        if (diff > fourHours) {
          sessionStorage.removeItem('global_cart_data');
          window.location.reload(); 
        }
      }
    }
  }, [location.pathname]);

  return (
    <div className="App min-h-screen">
      <ScrollToTop /> 
      <FormProvider>
        <Suspense fallback={<InteractiveLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              
              {/* --- 1. Login Routes --- */}
              <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
              <Route path="/restaurant-login" element={<PageWrapper><RestaurantLoginPage /></PageWrapper>} />
              <Route path="/superadminlogin" element={<PageWrapper><SuperAdminLoginPage /></PageWrapper>} />

              {/* --- 2. User/Public Routes --- */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
                <Route path="/Arealist/:areaName" element={<PageWrapper><AreaPage /></PageWrapper>} />
                <Route path="/all-restaurants" element={<PageWrapper><AllRestaurants /></PageWrapper>} />
                <Route path="/addmenuform" element={<PageWrapper><AddMenuForm /></PageWrapper>} />
                <Route path="/cart/:restaurantSlug" element={<PageWrapper><CartPage /></PageWrapper>} />
                <Route path="/cart/:restaurantSlug/ConfirmCart" element={<PageWrapper><ConfirmCart /></PageWrapper>} />
                <Route path="/cart/:restaurantSlug/ConfirmCart/CheckoutBox" element={<PageWrapper><CheckoutBox /></PageWrapper>} />
                <Route path="/cart/:restaurantSlug/ConfirmCart/CheckoutBox/OrderSuccess" element={<PageWrapper><OrderSuccess /></PageWrapper>} />
                <Route path="/templates" element={<PageWrapper><TemplatePage /></PageWrapper>} />
              </Route>

              {/* --- 3. Admin Routes --- */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<PageWrapper><Dashboard /></PageWrapper>} />
                <Route path="area" element={<PageWrapper><AddArea /></PageWrapper>} />
                <Route path="area/:areaName" element={<PageWrapper><AdminAreaPage /></PageWrapper>} />
                <Route path="add-top" element={<PageWrapper><TopRestrurant /></PageWrapper>} />
                <Route path="offers" element={<PageWrapper><OfferList /></PageWrapper>} />
                <Route path="request" element={<PageWrapper><Request /></PageWrapper>} />
                <Route path="sales_tablereport" element={<PageWrapper><Sales_Table_Report /></PageWrapper>} />
                <Route path="chats" element={<PageWrapper><ChatList /></PageWrapper>} />
                <Route path="reviews" element={<PageWrapper><Review /></PageWrapper>} />
                <Route path="registration" element={<PageWrapper><Registration /></PageWrapper>} />
              </Route>

              {/* --- 4. Restaurant Owner Routes --- */}
              <Route path="/restaurantadmin" element={<RestaurantLayout />} >
                <Route index element={<PageWrapper><ResDashboard /></PageWrapper>} />
                {/*<Route path="delivery-charge" element={<PageWrapper><ResDeliveryCharge /></PageWrapper>} />*/}
                <Route path="manage-shop" element={<PageWrapper><ResManageShop /></PageWrapper>} />
                <Route path="delivery-area" element={<PageWrapper><ResDeliveryArea /></PageWrapper>} />
                <Route path="category" element={<PageWrapper><ResCategory /></PageWrapper>} />
                <Route path="menu" element={<PageWrapper><ResMenu /></PageWrapper>} />
                <Route path="cart" element={<PageWrapper><ResCart /></PageWrapper>} />
                <Route path="available" element={<PageWrapper><ResAvailable /></PageWrapper>} />
                <Route path="orders" element={<PageWrapper><ResOrder /></PageWrapper>} />
                <Route path="reports" element={<PageWrapper><ResReports /></PageWrapper>} />
                <Route path="offers" element={<PageWrapper><ResOffers /></PageWrapper>} />
                <Route path="registration" element={<PageWrapper><ResRegistration /></PageWrapper>} />
                
                {/*Restaurant Admin dropdown pages*/}
                <Route path="graph-report" element={<PageWrapper><GraphReport /></PageWrapper>} />
                <Route path="table-report" element={<PageWrapper><TableReport /></PageWrapper>} />
                <Route path="create-food" element={<PageWrapper><CreateOrder /></PageWrapper>} />
                <Route path="orderslists" element={<PageWrapper><OrderList /></PageWrapper>} />
                <Route path="add-menus" element={<PageWrapper><AddMenu /></PageWrapper>} />
                <Route path="menu-list" element={<PageWrapper><MenuList /></PageWrapper>} />

              </Route>

              {/* --- 5. 404 Route --- */}
              <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </FormProvider>
      <OrderTracker /> 
    </div>
  );
}

// Main App Component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <CartProvider> 
          <AppContent />
        </CartProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

// Page Transition Wrapper
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default App;
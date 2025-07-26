import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Admin from "./pages/admin/Admin";
import Dashboard from "./pages/admin/Dashboard";
import ManageProps from "./pages/admin/ManageProps";
import Orders from "./pages/admin/Order";
import PropForm from "./pages/admin/PropForm";
import PropForm2 from "./pages/admin/PropForm2";
import Requests from "./pages/admin/Requests";
import UserForm from "./pages/admin/UserForm";
import Users from "./pages/admin/Users";
import PasswordResetPage from "./pages/auth/PasswordResetPage";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import CategoryPage from "./pages/CategoryPage";
import DetailPage from "./pages/DetailPage";
import FavoritesPage from "./pages/Favorite";
import HomePage from "./pages/HomePage";
import NewArrivalsPage from "./pages/NewArrival";
import PropRequest from "./pages/PropRequest";
import CartPage from "./pages/CartPage";
import Profile from "./pages/Profile";
import BestSellersPage from "./pages/BestSeller";
import BuyNow from "./pages/BuyNow";
import PaymentSuccess from "./components/PaymentSuccess";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/signIn",
    element: <SignInPage />,
  },
  {
    path: "/signUp",
    element: <SignUpPage />,
  },
  {
    path: "/reset-password",
    element: <PasswordResetPage />,
  },
  {
    path: "/category",
    element: <CategoryPage />,
  },
  {
    path: "/category/:category",
    element: < CategoryPage />
  },
  {
    path: "/newArrivals",
    element: <NewArrivalsPage />,
  },
  {
    path: "/bestSeller",
    element: <BestSellersPage />,
  },
  {
    path: "/props/:id",
    element: <DetailPage />,
  },
  {
    path: "/favorite",
    element: <FavoritesPage />,
  },
  {
    path: "/cart",
    element: <CartPage />,
  },
  {
    path: "/buy",
    element: <BuyNow />,
  },
  {
    path: "/payment-success",
    element: <PaymentSuccess />,
  },
  {
    path: "/propRequest",
    element: <PropRequest />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/admin",
    element: <Admin />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "userForm",
        element: <UserForm />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "manage-props",
        element: <ManageProps />,
      },
      {
        path: "requests",
        element: <Requests />,
      },
      {
      path: "add-prop",
      element: <PropForm />,
      },
      {
      path: "update-prop/:id",
      element: <PropForm2 />,
      },
    ],
  },
]);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            marginTop: "75px",
          },
        }}
      />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
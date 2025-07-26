import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaCaretDown, FaHeart, FaSearch, FaBars, FaTimes, FaRegUserCircle } from "react-icons/fa";
import { FaCircleUser } from "react-icons/fa6";
import { HiMiniShoppingBag } from "react-icons/hi2";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchPopup from "./Search";
import Notification from "./Notification";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  let dropdownTimeout;

  const categories = [
    "Costume",
    "Accessory & Props",
    "Makeup & Hair",
    "Set & Stage Decor"
  ];

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    console.log("Checking login status:", { userId, token, role });

    if (userId && token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      fetchUserProfile(userId);
      fetchUnreadNotifications(userId, token);
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
      setUnreadCount(0);
    }
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      console.log(`Fetching user profile for userId: ${userId}`);
      const response = await axios.get(`http://localhost:3000/api/customer/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User profile response:", response.data);
      setSelectedUser(response.data.user || response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error.response?.data || error.message);
      setSelectedUser(null);
    }
  };

  const fetchUnreadNotifications = async (userId, token) => {
    try {
      console.log(`Fetching notifications for userId: ${userId}`);
      const response = await axios.get(`http://localhost:3000/api/notifications/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Notifications response:", response.data);
      const notifications = response.data.notifications || response.data;
      const unread = notifications.filter((notif) => !notif.isRead || !notif.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data || error.message);
      setUnreadCount(0);
    }
  };

  const handleSignInClick = () => {
    navigate(isLoggedIn ? "/profile" : "/signIn");
    setIsMenuOpen(false);
  };

  const handleHomeClick = () => {
    if (isLoggedIn && userRole === "Admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
    setIsMenuOpen(false);
  };

  const handleFavoritesClick = () => {
    navigate("/favorite");
    setIsMenuOpen(false);
  };

  const handleNotificationsClick = () => {
    setIsNotificationOpen((prev) => !prev);
    setIsMenuOpen(false);
  };

  const handleCartClick = () => {
    navigate("/cart");
    setIsMenuOpen(false);
  };

  const handleMouseEnter = () => {
    clearTimeout(dropdownTimeout);
    setIsCategoryOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeout = setTimeout(() => {
      setIsCategoryOpen(false);
    }, 200);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 flex items-center justify-between bg-white px-5 py-2.5 shadow-md z-[1000] h-[65px] md:px-5">
      {/* Section 1: Logo */}
      <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={handleHomeClick}>
        <img
          src="/src/assets/images/logo.png"
          alt="Logo"
          className="h-[49px] w-[49px] object-fill rounded-full"
        />
        <h1 className="text-2xl font-bold text-black">
          PropBox
        </h1>
      </div>

      {/* Section 2: Navigation */}
      <nav className={`flex-2 justify-center ${isMenuOpen ? 'block' : 'hidden'} md:flex md:static md:shadow-none md:bg-transparent md:top-auto md:left-auto md:w-auto md:p-0 absolute top-[65px] left-0 w-full bg-white p-2.5 shadow-[0_4px_10px_rgba(0,0,0,0.1)] z-[999]`}>
        <ul className="flex flex-col md:flex-row gap-4 md:gap-8 list-none m-0 p-0 items-center">
          <li>
            <a href="/" className="text-black text-base font-semibold relative no-underline flex items-center after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:w-0 after:h-[3px] after:bg-black after:transition-all after:duration-300 hover:after:w-full hover:after:left-0">
              Home
            </a>
          </li>
          <li
            className="relative pb-1.5"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <a href="/category" className="text-black text-base font-semibold relative no-underline flex items-center after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:w-0 after:h-[3px] after:bg-black after:transition-all after:duration-300 hover:after:w-full hover:after:left-0">
              Category <FaCaretDown className="ml-1 text-sm text-white transition-transform duration-300 group-hover:rotate-180" />
            </a>
            {isCategoryOpen && (
              <ul className="absolute top-[120%] left-1/2 -translate-x-1/2 bg-white border border-gray-300 shadow-md w-56 max-h-64 overflow-y-auto flex flex-col z-[100] p-0 md:scrollbar-thin md:scrollbar-thumb-black md:scrollbar-track-white">
                {categories.map((category, index) => (
                  <li key={index} className="px-4 py-2.5 hover:bg-gray-100">
                    <a
                      href={`/category/${category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                      className="text-black no-underline block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
          <li>
            <a href="/newArrivals" className="text-black text-base font-semibold relative no-underline flex items-center after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:w-0 after:h-[3px] after:bg-black after:transition-all after:duration-300 hover:after:w-full hover:after:left-0" onClick={() => setIsMenuOpen(false)}>
              New Arrivals
            </a>
          </li>
          <li>
            <a href="/bestSeller" className="text-black text-base font-semibold relative no-underline flex items-center after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:w-0 after:h-[3px] after:bg-black after:transition-all after:duration-300 hover:after:w-full hover:after:left-0" onClick={() => setIsMenuOpen(false)}>
              Best Selling
            </a>
          </li>
          <li>
            <a href="/propRequest" className="text-black text-base font-semibold relative no-underline flex items-center after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:w-0 after:h-[3px] after:bg-black after:transition-all after:duration-300 hover:after:w-full hover:after:left-0" onClick={() => setIsMenuOpen(false)}>
              Prop Request
            </a>
          </li>
        </ul>
      </nav>

      {/* Section 3: User Options */}
      <div className="flex-1 flex items-center justify-end gap-6 md:gap-4">
        {/* Search Icon (always visible) */}
        <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center cursor-pointer" onClick={toggleSearch}>
          <FaSearch className="text-white text-lg" />
        </div>

        {/* Conditional User Options */}
        {!isLoggedIn ? (
          <button
            className="bg-black text-white rounded-full flex items-center px-4 py-2 gap-1.5 text-sm font-bold"
            onClick={handleSignInClick}
          >
            Login <FaRegUserCircle className="text-white text-lg" />
          </button>
        ) : (
          <>
            <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center cursor-pointer" onClick={handleCartClick}>
              <HiMiniShoppingBag className="text-white text-lg" />
            </div>
            <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center cursor-pointer" onClick={handleFavoritesClick}>
              <FaHeart className="text-white text-lg" />
            </div>
            <button
              className="h-10 w-10 bg-black rounded-full flex items-center justify-center cursor-pointer relative"
              onClick={handleNotificationsClick}
            >
              <Bell className="text-white text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center cursor-pointer" onClick={handleSignInClick}>
              {selectedUser?.image ? (
                <img
                  src={
                    selectedUser.imagePreview
                      ? selectedUser.imagePreview
                      : `http://localhost:3000/profilePicture/${selectedUser.image}`
                  }
                  alt="User"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FaCircleUser className="text-white text-lg" />
              )}
            </div>
          </>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex items-center">
        <button onClick={toggleMenu} className="text-white bg-black rounded-full p-2">
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Notification Panel */}
      {isNotificationOpen && (
        <Notification
          onClose={() => setIsNotificationOpen(false)}
          onUnreadChange={(count) => setUnreadCount(count)}
        />
      )}

      {/* Search Popup */}
      {isSearchOpen && <SearchPopup onClose={toggleSearch} />}
    </header>
  );
};

export default Header;
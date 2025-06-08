import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header";
import Footer from "../../components/footer";
import axiosInstance from "../../utils/axiosInstance";
import {
  User,
  Package,
  ShoppingCart,
  MapPin,
  LogOut,
  Edit2,
  Mail,
  Phone,
  Shield,
  Bell,
  CreditCard,
  Star,
  Award,
} from "lucide-react";

const Account = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [userProfile, setUserProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpTimer, setEmailOtpTimer] = useState(0);
  const [emailOtpTimerId, setEmailOtpTimerId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Form data states
  const [editData, setEditData] = useState({
    username: "",
    email: "",
  });
  const [otpData, setOtpData] = useState({
    otp: "",
    timer: 120,
    showResend: false,
  });
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    mobileNumber: "",
    addressType: "Home",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  useEffect(() => {
    fetchUserProfile();
    if (activeTab === "addresses") {
      fetchAddresses();
    }
  }, [activeTab]);

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get("/users/profile");
      setUserProfile(response.data.user);
      setEditData({
        username: response.data.user.username || "",
        email: response.data.user.email || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axiosInstance.get("/address/get-address");
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newAddress.address.trim()) errors.address = "Address is required";
    if (!newAddress.city.trim()) errors.city = "City is required";
    if (!newAddress.state) errors.state = "State is required";
    if (!newAddress.pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^[0-9]{6}$/.test(newAddress.pincode)) {
      errors.pincode = "Pincode must be 6 digits";
    }
    if (!newAddress.mobileNumber.trim()) {
      errors.mobileNumber = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(newAddress.mobileNumber)) {
      errors.mobileNumber = "Mobile number must be 10 digits";
    }
    return errors;
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        const response = await axiosInstance.post("/address/add-address", {
          ...newAddress,
          locality: newAddress.address,
          addressType:
            newAddress.addressType.charAt(0).toUpperCase() +
            newAddress.addressType.slice(1),
        });

        setAddresses([...addresses, response.data.address]);
        setShowAddressForm(false);
        setNewAddress({
          fullName: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          mobileNumber: "",
          addressType: "Home",
        });
        setFormErrors({});
        setSuccess("Address added successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("Error creating address:", error);
        setError(error.response?.data?.message || "Failed to create address");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await axiosInstance.delete(`/address/delete-address/${addressId}`);
      setAddresses(addresses.filter((addr) => addr._id !== addressId));
      setSuccess("Address deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting address:", error);
      setError("Failed to delete address");
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/users/logout");
      localStorage.removeItem("token");
      setShowLogoutModal(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Logout failed. Please try again.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(
        `/users/editProfile/${userProfile._id}`,
        {
          username: editData.username,
        }
      );
      setUserProfile(response.data.user);
      setShowEditModal(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Failed to update profile");
    }
  };

  const startEmailOtpTimer = () => {
    setEmailOtpTimer(120);
    const timerId = setInterval(() => {
      setEmailOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setEmailOtpTimerId(timerId);
  };

  const handleEmailChange = async () => {
    try {
      const response = await axiosInstance.post(
        "/users/update-email-send-otp",
        {
          email: newEmail,
        }
      );
      if (response.data) {
        setSuccess("OTP sent to your current email");
        setShowEmailModal(false);
        setShowOtpModal(true);
        startEmailOtpTimer();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error sending OTP");
    }
  };

  const handleEmailOtpSubmit = async () => {
    try {
      const response = await axiosInstance.post(
        "/users/verify-update-email-otp",
        {
          otp: emailOtp,
        }
      );
      if (response.data) {
        await fetchUserProfile();
        setSuccess("Email updated successfully");
        setShowOtpModal(false);
        clearInterval(emailOtpTimerId);
        setEmailOtpTimer(0);
        setEmailOtp("");
        setNewEmail("");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error verifying OTP");
    }
  };

  const handleResendEmailOtp = async () => {
    try {
      const response = await axiosInstance.post(
        "/users/resend-update-email-otp"
      );
      if (response.data) {
        setSuccess("New OTP sent to your current email");
        startEmailOtpTimer();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error resending OTP");
    }
  };

  const sidebarItems = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "Personal information",
    },
    {
      id: "addresses",
      label: "Addresses",
      icon: MapPin,
      description: "Delivery addresses",
    },
  ];

  const quickActions = [];

  const renderProfileSection = () => (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 sm:p-6 md:p-8 border border-yellow-200">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg rounded-full">
              {userProfile?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                Welcome back, {userProfile?.username}
              </h1>
              <p className="text-gray-600 flex justify-center sm:justify-start items-center gap-2 text-sm sm:text-base">
                <Mail size={16} />
                {userProfile?.email}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto text-center sm:text-right">
            <button
              onClick={() => setShowEditModal(true)}
              className="w-full sm:w-auto mt-4 sm:mt-0 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-5 py-3 hover:from-yellow-500 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl flex justify-center items-center gap-2 font-medium rounded-md"
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className={`${action.color} p-6  hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md`}
            >
              <Icon size={24} className="mx-auto mb-2" />
              <p className="font-medium text-sm">{action.label}</p>
            </button>
          );
        })}
      </div>

      {/* Profile Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Personal Information */}
        <div className="bg-white p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-3 mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center rounded-md">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                Personal Information
              </h3>
              <p className="text-gray-500 text-sm">Your account details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Username
              </label>
              <p className="text-gray-900 font-semibold text-base sm:text-lg break-words">
                {userProfile?.username}
              </p>
            </div>

            <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Account Status
              </label>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-green-700 font-medium text-sm sm:text-base">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-3 mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center rounded-md">
              <Mail className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                Contact Information
              </h3>
              <p className="text-gray-500 text-sm">How we reach you</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email Address
              </label>
              <p className="text-gray-900 font-semibold text-base sm:text-lg break-words">
                {userProfile?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddressesSection = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50  p-8 border border-yellow-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Delivery Addresses
            </h2>
            <p className="text-gray-600">
              Manage your saved delivery locations
            </p>
          </div>
          <button
            onClick={() => setShowAddressForm(true)}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-3  hover:from-yellow-500 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
          >
            + Add New Address
          </button>
        </div>
      </div>

      {showAddressForm && (
        <div className="bg-white border-2 border-yellow-200  p-8 shadow-lg">
          <h3 className="text-2xl font-semibold mb-8 text-gray-900">
            Add New Address
          </h3>
          <form onSubmit={handleAddressSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={newAddress.fullName}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, fullName: e.target.value })
                  }
                  className={`w-full px-4 py-4 border-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 ${
                    formErrors.fullName ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {formErrors.fullName && (
                  <p className="text-red-500 text-sm mt-2">
                    {formErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={newAddress.mobileNumber}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      mobileNumber: e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    })
                  }
                  className={`w-full px-4 py-4 border-2  focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 ${
                    formErrors.mobileNumber
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                />
                {formErrors.mobileNumber && (
                  <p className="text-red-500 text-sm mt-2">
                    {formErrors.mobileNumber}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Address
              </label>
              <textarea
                placeholder="Enter complete address"
                rows={4}
                value={newAddress.address}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, address: e.target.value })
                }
                className={`w-full px-4 py-4 border-2  focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 ${
                  formErrors.address ? "border-red-400" : "border-gray-200"
                }`}
              />
              {formErrors.address && (
                <p className="text-red-500 text-sm mt-2">
                  {formErrors.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                  className={`w-full px-4 py-4 border-2  focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 ${
                    formErrors.city ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {formErrors.city && (
                  <p className="text-red-500 text-sm mt-2">{formErrors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  State
                </label>
                <select
                  value={newAddress.state}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, state: e.target.value })
                  }
                  className={`w-full px-4 py-4 border-2  focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 ${
                    formErrors.state ? "border-red-400" : "border-gray-200"
                  }`}
                >
                  <option value="">Select State</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {formErrors.state && (
                  <p className="text-red-500 text-sm mt-2">
                    {formErrors.state}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Pincode
                </label>
                <input
                  type="text"
                  placeholder="Enter pincode"
                  value={newAddress.pincode}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                    })
                  }
                  className={`w-full px-4 py-4 border-2  focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 ${
                    formErrors.pincode ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {formErrors.pincode && (
                  <p className="text-red-500 text-sm mt-2">
                    {formErrors.pincode}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Address Type
              </label>
              <select
                value={newAddress.addressType}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, addressType: e.target.value })
                }
                className="w-full px-4 py-4 border-2 border-gray-200  focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
              </select>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white py-4  hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 border-t-2 border-b-2 border-white  animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Address"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddressForm(false);
                  setFormErrors({});
                  setNewAddress({
                    fullName: "",
                    address: "",
                    city: "",
                    state: "",
                    pincode: "",
                    mobileNumber: "",
                    addressType: "Home",
                  });
                }}
                className="flex-1 border-2 border-gray-300 py-4  hover:bg-gray-50 transition-all duration-300 font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <div
              key={address._id}
              className="bg-white border-2 border-gray-100  p-6 hover:border-yellow-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200  flex items-center justify-center">
                    <MapPin size={20} className="text-blue-600" />
                  </div>
                  <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 ">
                    {address.addressType?.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteAddress(address._id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-3 py-1  transition-all duration-300"
                >
                  Delete
                </button>
              </div>

              <div className="space-y-3">
                <p className="font-bold text-gray-900 text-lg">
                  {address.fullName}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {address.address}
                </p>
                <p className="text-gray-700 font-medium">
                  {address.city}, {address.state} - {address.pincode}
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <Phone size={16} className="text-gray-500" />
                  <p className="text-gray-600 font-medium">
                    {address.mobileNumber}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 ">
            <div className="w-20 h-20 bg-gray-200  flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              No addresses found
            </p>
            <p className="text-gray-500">
              Add your first address to get started with deliveries
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 pt-28 pb-12 max-w-7xl">
          {/* Success/Error Messages */}
          {success && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-800 px-6 py-4  mb-6 mt-10 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500  flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                {success}
              </div>
            </div>
          )}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-800 px-6 py-4  mb-6 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500  flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                {error}
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8 mt-10">
            {/* Sidebar */}
            <div className="w-full lg:w-1/4">
              <div className="bg-white  shadow-lg border border-gray-100 p-6 sticky top-32">
                {/* Profile Header */}
                <div className="text-center mb-8 pb-6 border-b border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500  flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg">
                    {userProfile?.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {userProfile?.username}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {userProfile?.email}
                  </p>
                </div>

                {/* Navigation */}
                <nav className="space-y-2 mb-6">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3  text-left transition-all duration-300 ${
                          activeTab === item.id
                            ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon size={20} />
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p
                            className={`text-xs ${
                              activeTab === item.id
                                ? "text-yellow-100"
                                : "text-gray-500"
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </nav>

                {/* Quick Links */}
                <div className="space-y-2 mb-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => navigate("/orders")}
                    className="w-full flex items-center gap-3 px-4 py-3  text-left text-gray-700 hover:bg-gray-50 transition-all duration-300"
                  >
                    <Package size={20} />
                    <span className="font-medium">Orders</span>
                  </button>

                  <button
                    onClick={() => navigate("/cart")}
                    className="w-full flex items-center gap-3 px-4 py-3  text-left text-gray-700 hover:bg-gray-50 transition-all duration-300"
                  >
                    <ShoppingCart size={20} />
                    <span className="font-medium">Cart</span>
                  </button>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3  text-left text-red-600 hover:bg-red-50 transition-all duration-300 border-t border-gray-100 pt-6"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white  shadow-lg border border-gray-100 p-8">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="relative">
                      <div className="h-12 w-12 border-4 border-yellow-200  animate-spin"></div>
                      <div className="h-12 w-12 border-t-4 border-yellow-500  animate-spin absolute top-0"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    {activeTab === "profile" && renderProfileSection()}
                    {activeTab === "addresses" && renderAddressesSection()}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white  max-w-md w-full p-8 shadow-2xl">
              <h3 className="text-2xl font-bold mb-8 text-gray-900">
                Edit Profile
              </h3>
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) =>
                      setEditData({ ...editData, username: e.target.value })
                    }
                    className="w-full px-4 py-4 border-2 border-gray-200  focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={userProfile?.email}
                      disabled
                      className="flex-1 px-4 py-4 border-2 border-gray-200  bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(true)}
                      className="bg-blue-600 text-white px-6 py-4  hover:bg-blue-700 transition-all duration-300 font-medium"
                    >
                      Change
                    </button>
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 border-2 border-gray-300  hover:bg-gray-50 transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-3  hover:from-yellow-500 hover:to-amber-600 transition-all duration-300 shadow-lg font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Email Change Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white  max-w-md w-full p-8 shadow-2xl">
              <h3 className="text-2xl font-bold mb-8 text-gray-900">
                Change Email
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    New Email
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200  focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300"
                  />
                </div>
                <div className="flex justify-end gap-4 pt-6">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-6 py-3 border-2 border-gray-300  hover:bg-gray-50 transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEmailChange}
                    disabled={!newEmail}
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-3  hover:from-yellow-500 hover:to-amber-600 transition-all duration-300 shadow-lg disabled:opacity-50 font-medium"
                  >
                    Send OTP
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OTP Verification Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white  max-w-md w-full p-8 shadow-2xl">
              <h3 className="text-2xl font-bold mb-8 text-gray-900">
                Verify OTP
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Enter OTP sent to your current email ({userProfile?.email})
                  </label>
                  <input
                    type="text"
                    value={emailOtp}
                    onChange={(e) =>
                      setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength={6}
                    className="w-full px-4 py-4 border-2 border-gray-200  focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 text-center text-2xl font-mono"
                    placeholder="000000"
                  />
                  {emailOtpTimer > 0 && (
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      Time remaining: {Math.floor(emailOtpTimer / 60)}:
                      {emailOtpTimer % 60 < 10
                        ? `0${emailOtpTimer % 60}`
                        : emailOtpTimer % 60}
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleResendEmailOtp}
                    disabled={emailOtpTimer > 0}
                    className="text-blue-600 text-sm hover:text-blue-800 disabled:text-gray-400 font-medium"
                  >
                    Resend OTP
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOtpModal(false);
                        setEmailOtp("");
                        clearInterval(emailOtpTimerId);
                        setEmailOtpTimer(0);
                      }}
                      className="px-4 py-2 border-2 border-gray-300  hover:bg-gray-50 transition-all duration-300 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEmailOtpSubmit}
                      disabled={!emailOtp || emailOtp.length !== 6}
                      className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-2  hover:from-yellow-500 hover:to-amber-600 transition-all duration-300 shadow-lg disabled:opacity-50 font-medium"
                    >
                      Verify OTP
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white  shadow-2xl w-full max-w-md p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200  flex items-center justify-center mx-auto mb-4">
                  <LogOut size={32} className="text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Confirm Logout
                </h3>
                <p className="text-gray-600">
                  You will be signed out of your account
                </p>
              </div>
              <p className="text-gray-700 mb-8 text-center">
                Are you sure you want to logout? You'll need to sign in again to
                access your account.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-6 py-3 border-2 border-gray-300  hover:bg-gray-50 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white  hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 shadow-lg font-medium"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Account;

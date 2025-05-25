import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header";
import Footer from "../../components/footer";
import axiosInstance from "../../utils/axiosInstance";
import { User, Package, ShoppingCart, MapPin, LogOut, Edit2, Mail, Phone } from "lucide-react";

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
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Form data states
  const [editData, setEditData] = useState({
    // fullName: "",
    username: "",
    email: ""
  });
  const [otpData, setOtpData] = useState({
    otp: "",
    timer: 120,
    showResend: false
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

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
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
        // fullName: response.data.user.fullName || "",
        username: response.data.user.username || "",
        email: response.data.user.email || ""
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
          addressType: newAddress.addressType.charAt(0).toUpperCase() + newAddress.addressType.slice(1)
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
      setAddresses(addresses.filter(addr => addr._id !== addressId));
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
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(`/users/editProfile/${userProfile._id}`, {
        // fullName: editData.fullName,
        username: editData.username
      });
      setUserProfile(response.data.user);
      setShowEditModal(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleEmailChange = async () => {
    try {
      await axiosInstance.post("/users/forgot-password-send-otp", {
        email: editData.email
      });
      setShowEmailModal(false);
      setShowOtpModal(true);
      startOtpTimer();
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const startOtpTimer = () => {
    setOtpData(prev => ({ ...prev, timer: 120, showResend: false }));
    const interval = setInterval(() => {
      setOtpData(prev => {
        if (prev.timer <= 1) {
          clearInterval(interval);
          return { ...prev, timer: 0, showResend: true };
        }
        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/users/verify-forgot-password-otp", {
        email: editData.email,
        otp: otpData.otp
      });
      await axiosInstance.put(`/users/editProfile/${userProfile._id}`, {
        email: editData.email
      });
      setShowOtpModal(false);
      fetchUserProfile();
      setSuccess("Email updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError(error.response?.data?.message || "Failed to verify OTP");
    }
  };

  const handleResendOtp = async () => {
    try {
      await axiosInstance.post("/users/resend-forgot-password-otp", {
        email: editData.email
      });
      startOtpTimer();
    } catch (error) {
      console.error("Error resending OTP:", error);
      setError(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  const sidebarItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "addresses", label: "Addresses", icon: MapPin },
  ];

  const renderProfileSection = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif text-gray-900">Profile Information</h2>
        <button
          onClick={() => setShowEditModal(true)}
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Edit2 size={16} />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="text-gray-600" size={20} />
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                <p className="text-gray-900 font-medium">{userProfile?.username}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="text-gray-600" size={20} />
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                <p className="text-gray-900 font-medium">{userProfile?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddressesSection = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif text-gray-900">My Addresses</h2>
        <button
          onClick={() => setShowAddressForm(true)}
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Add New Address
        </button>
      </div>

      {showAddressForm && (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-medium mb-6">Add New Address</h3>
          <form onSubmit={handleAddressSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                    formErrors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={newAddress.mobileNumber}
                  onChange={(e) => setNewAddress({ ...newAddress, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                    formErrors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.mobileNumber && <p className="text-red-500 text-sm mt-1">{formErrors.mobileNumber}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                placeholder="Enter complete address"
                rows={3}
                value={newAddress.address}
                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                  formErrors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                    formErrors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <select
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                    formErrors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select State</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {formErrors.state && <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                <input
                  type="text"
                  placeholder="Enter pincode"
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                    formErrors.pincode ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.pincode && <p className="text-red-500 text-sm mt-1">{formErrors.pincode}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
              <select
                value={newAddress.addressType}
                onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Address'
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
                className="flex-1 border-2 border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors"
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
            <div key={address._id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-gray-600" />
                  <span className="inline-block text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {address.addressType?.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteAddress(address._id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
              
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">{address.fullName}</p>
                <p className="text-gray-700">{address.address}</p>
                <p className="text-gray-700">
                  {address.city}, {address.state} - {address.pincode}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Phone size={14} className="text-gray-500" />
                  <p className="text-sm text-gray-600">{address.mobileNumber}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No addresses found</p>
            <p className="text-sm">Add your first address to get started</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 pt-28 pb-12 max-w-7xl">
          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8 mt-10">
            {/* Sidebar */}
            <div className="w-full lg:w-1/4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-32">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-semibold">
                    {userProfile?.userProfile?.username?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{userProfile?.username}</p>
                    <p className="text-sm text-gray-600">{userProfile?.email}</p>
                  </div>
                </div>

                <nav className="space-y-2 ">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === item.id
                            ? "bg-black text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon size={18} />
                        {item.label}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => navigate("/orders")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Package size={18} />
                    Orders
                  </button>
                  
                  <button
                    onClick={() => navigate("/cart")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <ShoppingCart size={18} />
                    Cart
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 mt-10">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 border-t-2 border-b-2 border-black rounded-full animate-spin"></div>
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
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold mb-6">Edit Profile</h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={userProfile?.email}
                      disabled
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(true)}
                      className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
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
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold mb-6">Change Email</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Email</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEmailChange}
                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-medium mb-4">Verify OTP</h3>
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                  <input
                    type="text"
                    value={otpData.otp}
                    onChange={(e) => setOtpData({ ...otpData, otp: e.target.value })}
                    maxLength={6}
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Time remaining: {Math.floor(otpData.timer / 60)}:{(otpData.timer % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                {otpData.showResend && (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-blue-600 text-sm hover:text-blue-800"
                  >
                    Resend OTP
                  </button>
                )}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                  >
                    Verify
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Account;
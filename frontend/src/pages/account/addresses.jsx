import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    pincode: "",
    locality: "",
    address: "",
    city: "",
    state: "",
    landmark: "",
    alternatePhone: "",
    addressType: "Home"
  });
  const [formErrors, setFormErrors] = useState({});

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await axiosInstance.get("/address/get-address");
      setAddresses(response.data.addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setError("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state) errors.state = "State is required";
    if (!formData.pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      errors.pincode = "Pincode must be 6 digits";
    }
    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
      errors.mobileNumber = "Mobile number must be 10 digits";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        if (showEditModal) {
          await axiosInstance.put(`/address/edit-address/${selectedAddress._id}`, formData);
        } else {
          await axiosInstance.post("/address/add-address", formData);
        }
        fetchAddresses();
        handleCloseModal();
      } catch (error) {
        console.error("Error saving address:", error);
        setError(error.response?.data?.message || "Failed to save address");
      }
    }
  };

  const handleEdit = (address) => {
    setSelectedAddress(address);
    setFormData({
      fullName: address.fullName,
      mobileNumber: address.mobileNumber,
      pincode: address.pincode,
      locality: address.locality,
      address: address.address,
      city: address.city,
      state: address.state,
      landmark: address.landmark || "",
      alternatePhone: address.alternatePhone || "",
      addressType: address.addressType
    });
    setShowEditModal(true);
  };

  const handleDelete = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await axiosInstance.delete(`/address/delete-address/${addressId}`);
        fetchAddresses();
      } catch (error) {
        console.error("Error deleting address:", error);
        setError("Failed to delete address");
      }
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedAddress(null);
    setFormData({
      fullName: "",
      mobileNumber: "",
      pincode: "",
      locality: "",
      address: "",
      city: "",
      state: "",
      landmark: "",
      alternatePhone: "",
      addressType: "Home"
    });
    setFormErrors({});
  };

  const AddressModal = ({ isEdit }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-medium mb-4">{isEdit ? "Edit" : "Add"} Address</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-black focus:ring-black ${formErrors.fullName ? 'border-red-500' : ''}`}
            />
            {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className={`mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-black focus:ring-black ${formErrors.mobileNumber ? 'border-red-500' : ''}`}
              />
              {formErrors.mobileNumber && <p className="text-red-500 text-sm mt-1">{formErrors.mobileNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Alternate Phone (Optional)</label>
              <input
                type="tel"
                value={formData.alternatePhone}
                onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={`mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-black focus:ring-black ${formErrors.address ? 'border-red-500' : ''}`}
              rows="3"
            />
            {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Locality/Area</label>
              <input
                type="text"
                value={formData.locality}
                onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Landmark (Optional)</label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={`mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-black focus:ring-black ${formErrors.city ? 'border-red-500' : ''}`}
              />
              {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                className={`mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-black focus:ring-black ${formErrors.pincode ? 'border-red-500' : ''}`}
              />
              {formErrors.pincode && <p className="text-red-500 text-sm mt-1">{formErrors.pincode}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className={`mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-black focus:ring-black ${formErrors.state ? 'border-red-500' : ''}`}
            >
              <option value="">Select State</option>
              {indianStates.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {formErrors.state && <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address Type</label>
            <div className="mt-2 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="Home"
                  checked={formData.addressType === "Home"}
                  onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
                  className="form-radio text-black"
                />
                <span className="ml-2">Home</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="Work"
                  checked={formData.addressType === "Work"}
                  onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
                  className="form-radio text-black"
                />
                <span className="ml-2">Work</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              {isEdit ? "Update" : "Save"} Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium">My Addresses</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Add New Address
        </button>
      </div>

      {loading ? (
        <p className="text-center">Loading addresses...</p>
      ) : error ? (
        <div className="text-red-600 text-center">{error}</div>
      ) : addresses.length === 0 ? (
        <p className="text-center text-gray-500">No addresses found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{address.fullName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{address.address}</p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p className="text-sm text-gray-600">Phone: {address.mobileNumber}</p>
                  {address.alternatePhone && (
                    <p className="text-sm text-gray-600">Alt Phone: {address.alternatePhone}</p>
                  )}
                  <span className="inline-block mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {address.addressType.toUpperCase()}
                  </span>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && <AddressModal isEdit={false} />}
      {showEditModal && <AddressModal isEdit={true} />}
    </div>
  );
};

export default Addresses;
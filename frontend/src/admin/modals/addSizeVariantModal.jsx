import React, { useState } from "react";
import axiosInstance from "@/utils/adminAxiosInstance";

const AddSizeVariantModal = ({ open, onClose, variantId }) => {
  const [formData, setFormData] = useState({
    size: "",
    price: "",
    discountPrice: "",
    inStock: true,
    stockCount: "",
    description: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddSizeVariant = async () => {
    if (!formData.size || !formData.price || !formData.stockCount) {
      return setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "error",
      });
    }

    try {
      await axiosInstance.post("/sizes/size/add", {
        variantId,
        ...formData,
      });

      setSnackbar({
        open: true,
        message: "Size variant added successfully",
        severity: "success",
      });

      setTimeout(() => onClose(), 1000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error adding size variant",
        severity: "error",
      });
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl shadow-lg p-6 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl"
          >
            ✕
          </button>

          {/* Header */}
          <h2 className="text-2xl font-semibold text-indigo-800 mb-6">
            Add Size Variant
          </h2>

          <hr className="mb-6 border-gray-300" />

          <div className="space-y-8">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Size</label>
                  <input
                    type="text"
                    name="size"
                    placeholder="e.g. S, M, L, XL"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stock Count
                  </label>
                  <div className="relative">
                    <span className="absolute top-2.5 left-3 text-gray-400">📦</span>
                    <input
                      type="number"
                      name="stockCount"
                      value={formData.stockCount}
                      onChange={handleInputChange}
                      className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Pricing Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <div className="relative">
                    <span className="absolute top-2.5 left-3 text-gray-400">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Discount Price
                  </label>
                  <div className="relative">
                    <span className="absolute top-2.5 left-3 text-gray-400">₹</span>
                    <input
                      type="number"
                      name="discountPrice"
                      value={formData.discountPrice}
                      onChange={handleInputChange}
                      className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleInputChange}
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
                <span className="ml-2 text-sm text-gray-700">Available in Stock</span>
              </label>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter size variant description..."
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                onClick={handleAddSizeVariant}
                className="w-full bg-indigo-600 text-white py-3 rounded-md text-lg font-medium hover:bg-indigo-700 transition"
              >
                Add Size Variant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed top-5 right-5 z-50">
          <div
            className={`px-4 py-3 rounded shadow-md text-white ${
              snackbar.severity === "error" ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {snackbar.message}
            <button
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className="ml-4 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddSizeVariantModal;

import React, { useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from "@/utils/adminAxiosInstance";

const AddProductModal = ({ open, onClose, onProductAdded }) => {
  const [categories, setCategories] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    category: "",
    gender: "",
    pattern: "",
    material: "",
  });

  useEffect(() => {
    if (open) fetchCategories();
  }, [open]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:9090/api/categories");
      setCategories(res.data.categories);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error fetching categories",
        severity: "error",
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const categoryObj = categories.find((c) => c.name === formData.category);

    try {
      const response = await axiosInstance.post("/products/add", {
        name: formData.productName,
        description: formData.description,
        category: categoryObj?._id,
        gender: formData.gender,
        pattern: formData.pattern,
        material: formData.material,
      });

      if (response.status === 201) {
        setSnackbar({
          open: true,
          message: "Product added successfully!",
          severity: "success",
        });
        onProductAdded?.(response.data.product);
        setFormData({
          productName: "",
          description: "",
          category: "",
          gender: "",
          pattern: "",
          material: "",
        });
        onClose();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to add product",
        severity: "error",
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4 overflow-auto">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg overflow-y-auto max-h-[90vh] p-6 space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-blue-700">
          Add New Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              Product Classification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              Product Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pattern
                </label>
                <input
                  type="text"
                  name="pattern"
                  value={formData.pattern}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Material
                </label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;

import React, { useState } from "react";
import axiosInstance from "@/utils/adminAxiosInstance";

const AddVariantModal = ({ open, onClose, productId }) => {
  const [color, setColor] = useState("");
  const [colorImage, setColorImage] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [subImages, setSubImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleImageChange = (event, isMain = false) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        return setSnackbar({ open: true, message: "Image size should be less than 5MB", severity: "error" });
      }

      const previewUrl = URL.createObjectURL(file);

      if (isMain) {
        setMainImage(file);
      } else {
        setSubImages((prev) => [...prev, file]);
        setPreviewImages((prev) => [...prev, previewUrl]);
      }
    }
  };

  const handleColorImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        return setSnackbar({ open: true, message: "Image size should be less than 5MB", severity: "error" });
      }
      setColorImage(file);
    }
  };

  const handleDeleteSubImage = (index) => {
    const updatedSubImages = [...subImages];
    const updatedPreviewImages = [...previewImages];
    updatedSubImages.splice(index, 1);
    updatedPreviewImages.splice(index, 1);
    setSubImages(updatedSubImages);
    setPreviewImages(updatedPreviewImages);
  };

  const handleAddVariant = async () => {
    try {
      if (!color || !colorImage || !mainImage) {
        return setSnackbar({ open: true, message: "Please fill all required fields", severity: "error" });
      }

      const formData = new FormData();
      formData.append("color", color);
      formData.append("colorImage", colorImage);
      formData.append("mainImage", mainImage);
      formData.append("productId", productId);
      subImages.forEach((img) => formData.append("subImages", img));

      const response = await axiosInstance.post("/variants/color/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSnackbar({ open: true, message: "Variant added successfully", severity: "success" });
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error adding variant",
        severity: "error",
      });
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl shadow-lg p-6 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
          >
            ✕
          </button>

          {/* Header */}
          <h2 className="text-2xl font-semibold text-indigo-700 mb-6">Add Color Variant</h2>

          {/* Form */}
          <div className="space-y-5">
            {/* Color Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Color Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>

            {/* Color Swatch Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color Swatch Image</label>
              <label className="flex items-center justify-center w-full px-4 py-3 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-200">
                Upload Color Swatch
                <input type="file" accept="image/*" hidden onChange={handleColorImageChange} />
              </label>
              {colorImage && (
                <div className="mt-3 w-full h-48 flex items-center justify-center border border-gray-300 rounded-lg">
                  <img
                    src={URL.createObjectURL(colorImage)}
                    alt="Color"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* Main Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Product Image</label>
              <label className="flex items-center justify-center w-full px-4 py-3 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-200">
                Upload Main Image
                <input type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e, true)} />
              </label>
              {mainImage && (
                <div className="mt-3 w-full h-48 flex items-center justify-center border border-gray-300 rounded-lg">
                  <img
                    src={URL.createObjectURL(mainImage)}
                    alt="Main"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* Additional Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images</label>
              <label className="flex items-center justify-center w-full px-4 py-3 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-200">
                Upload Additional Images
                <input type="file" accept="image/*" hidden multiple onChange={(e) => handleImageChange(e)} />
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative border rounded-lg overflow-hidden">
                    <img src={preview} alt={`Preview ${index}`} className="object-contain w-full h-32" />
                    <button
                      onClick={() => handleDeleteSubImage(index)}
                      className="absolute top-1 right-1 bg-white text-red-600 rounded-full p-1 hover:bg-red-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                onClick={handleAddVariant}
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
              >
                Add Variant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar / Alert */}
      {snackbar.open && (
        <div className="fixed top-5 right-5 z-50">
          <div
            className={`px-4 py-3 rounded shadow-md text-white ${
              snackbar.severity === "error" ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {snackbar.message}
            <button onClick={handleSnackbarClose} className="ml-3 font-bold">
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddVariantModal;

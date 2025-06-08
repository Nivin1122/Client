import React, { useState, useEffect } from "react";
import {
  Modal,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import EditSizeVariantModal from "./editSizeModal";
import axiosInstance from "@/utils/adminAxiosInstance";

const EditVariantModal = ({ open, onClose, variant }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    color: "",
    mainImage: null,
    subImages: [],
    colorImage: "",
    category: "",
    sizeVariants: [],
  });

  useEffect(() => {
    if (variant) {
      setFormData({
        color: variant.color || "",
        mainImage: variant.mainImage || null,
        subImages: variant.subImages || [],
        colorImage: variant.colorImage || "",
        category: variant.category || "",
      });
      fetchSizeVariants(variant._id);
    }
  }, [variant]);

  const fetchSizeVariants = async (variantId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:9090/api/sizes/sizes/${variantId}`);
      setFormData((prevData) => ({
        ...prevData,
        sizeVariants: response.data.sizeVariants || [],
      }));
    } catch (error) {
      console.error("Error fetching size variants:", error);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "mainImage" || name === "colorImage") {
      setFormData({ ...formData, [name]: files[0] });
    } else if (name === "subImages") {
      setFormData((prevData) => ({
        ...prevData,
        subImages: [...prevData.subImages, ...Array.from(files)],
      }));
    }
  };

  const handleImageDelete = (index, type) => {
    setFormData((prevData) => {
      if (type === "subImages") {
        return {
          ...prevData,
          subImages: prevData.subImages.filter((_, idx) => idx !== index),
        };
      }
      return prevData;
    });
  };

  const handleImageEdit = (index, newImage) => {
    setFormData((prevData) => {
      const updatedSubImages = [...prevData.subImages];
      updatedSubImages[index] = newImage;
      return { ...prevData, subImages: updatedSubImages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = new FormData();
    updatedData.append("color", formData.color);
    updatedData.append("category", formData.category);

    if (formData.colorImage) updatedData.append("colorImage", formData.colorImage);
    if (formData.mainImage) updatedData.append("mainImage", formData.mainImage);
    formData.subImages.forEach((img) => updatedData.append("subImages", img));

    try {
      await axiosInstance.put(`/variants/variant/edit/${variant._id}`, updatedData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onClose();
    } catch (error) {
      console.error("Error updating variant:", error);
    }
  };

  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const handleEditButtonClick = (sizeVariant) => {
    setSelectedVariant(sizeVariant);
    setOpenEditModal(true);
  };

  const handleEditModalClose = () => setOpenEditModal(false);

  const handleSaveSizeVariant = (updatedSizeVariant) => {
    const updatedSizeVariants = formData.sizeVariants.map((sv) =>
      sv._id === updatedSizeVariant._id ? updatedSizeVariant : sv
    );
    setFormData((prevData) => ({
      ...prevData,
      sizeVariants: updatedSizeVariants,
    }));
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <div className="w-[90%] md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl p-6 mx-auto mt-10 relative">
          <IconButton className="!absolute top-4 right-4" onClick={onClose}>
            <CloseIcon />
          </IconButton>

          <h2 className="text-2xl font-bold text-center mb-6">Edit Product Variant</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 font-medium">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>

            {/* Color Image Upload */}
            <div>
              <label className="block mb-1 font-medium">Color Image</label>
              <input
                type="file"
                accept="image/*"
                name="colorImage"
                onChange={handleFileChange}
                className="mb-2"
              />
              {formData.colorImage && (
                <div className="flex items-center gap-4 mt-2">
                  <img
                    src={formData.colorImage instanceof File ? URL.createObjectURL(formData.colorImage) : formData.colorImage}
                    alt="Color"
                    className="w-24 h-24 rounded object-cover"
                  />
                  <IconButton onClick={() => setFormData({ ...formData, colorImage: null })}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </div>
              )}
            </div>

            {/* Main Image Upload */}
            <div>
              <label className="block mb-1 font-medium">Main Image</label>
              <input
                type="file"
                accept="image/*"
                name="mainImage"
                onChange={handleFileChange}
                className="mb-2"
              />
              {formData.mainImage && (
                <div className="flex items-center gap-4 mt-2">
                  <img
                    src={formData.mainImage instanceof File ? URL.createObjectURL(formData.mainImage) : formData.mainImage}
                    alt="Main"
                    className="w-24 h-24 rounded object-cover"
                  />
                  <IconButton onClick={() => setFormData({ ...formData, mainImage: null })}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </div>
              )}
            </div>

            {/* Sub Images Upload */}
            <div>
              <label className="block mb-1 font-medium">Sub Images</label>
              <input
                type="file"
                name="subImages"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
              <div className="flex flex-wrap gap-4 mt-2">
                {formData.subImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img instanceof File ? URL.createObjectURL(img) : img}
                      alt={`Sub ${index}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <IconButton
                      size="small"
                      className="!absolute top-0 right-0 bg-white"
                      onClick={() => handleImageDelete(index, "subImages")}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                    <IconButton
                      size="small"
                      className="!absolute bottom-0 right-0 bg-white"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const newImg = e.target.files[0];
                          if (newImg) handleImageEdit(index, newImg);
                        };
                        input.click();
                      }}
                    >
                      <EditIcon fontSize="small" color="primary" />
                    </IconButton>
                  </div>
                ))}
              </div>
            </div>

            {/* Size Variants */}
            <div>
              <label className="block mb-1 font-medium">Size Variants</label>
              <div className="space-y-2">
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : formData.sizeVariants.length ? (
                  formData.sizeVariants.map((sizeVariant) => (
                    <div
                      key={sizeVariant._id}
                      className="flex justify-between items-center border border-gray-200 p-2 rounded"
                    >
                      <div>
                        <p className="font-semibold">{sizeVariant.size}</p>
                        <p className="text-sm text-gray-500">{sizeVariant.description.slice(0, 50)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-semibold">₹{sizeVariant.price}</span>
                        <button
                          type="button"
                          onClick={() => handleEditButtonClick(sizeVariant)}
                          className="bg-orange-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No size variants available</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-orange-500 text-white font-semibold rounded hover:bg-orange-600"
            >
              Update Variant
            </button>
          </form>
        </div>
      </Modal>

      <EditSizeVariantModal
        open={openEditModal}
        onClose={handleEditModalClose}
        selectedVariant={selectedVariant}
        onSave={handleSaveSizeVariant}
      />
    </>
  );
};

export default EditVariantModal;

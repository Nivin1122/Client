import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  IconButton,
  Paper,
  Divider,
  Alert,
  Snackbar,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "@/utils/adminAxiosInstance";

// Styled Components
const StyledModal = styled(Modal)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ModalContent = styled(Paper)({
  width: '70%',
  maxWidth: '800px',
  maxHeight: '85vh',
  overflowY: 'auto',
  padding: '32px',
  borderRadius: '12px',
  backgroundColor: '#fff',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#bdbdbd',
    borderRadius: '4px',
  },
});

const ImagePreviewContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '200px',
  borderRadius: '8px',
  overflow: 'hidden',
  marginTop: '16px',
  backgroundColor: '#f5f5f5',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: '2px dashed #bdbdbd',
});

const UploadButton = styled(Button)({
  width: '100%',
  padding: '12px',
  backgroundColor: '#f8f9fa',
  color: '#495057',
  '&:hover': {
    backgroundColor: '#e9ecef',
  },
});

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

  const handleImageChange = (event, setImage, isMain = false) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setSnackbar({
          open: true,
          message: "Image size should be less than 5MB",
          severity: "error"
        });
        return;
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
        setSnackbar({
          open: true,
          message: "Image size should be less than 5MB",
          severity: "error"
        });
        return;
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
        setSnackbar({
          open: true,
          message: "Please fill all required fields",
          severity: "error"
        });
        return;
      }

      const formData = new FormData();
      formData.append("color", color);
      formData.append("colorImage", colorImage);
      formData.append("mainImage", mainImage);
      formData.append("productId", productId);
      subImages.forEach((img) => formData.append("subImages", img));

      const response = await axiosInstance.post(
        '/variants/color/add',
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setSnackbar({
        open: true,
        message: "Variant added successfully",
        severity: "success"
      });
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error adding variant",
        severity: "error"
      });
    }
  };

  return (
    <>
      <StyledModal open={open} onClose={onClose}>
        <ModalContent elevation={3}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
              Add Color Variant
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={3}>
            {/* Color Input */}
            <Grid item xs={12}>
              <TextField
                label="Color Name"
                fullWidth
                value={color}
                onChange={(e) => setColor(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#3f51b5',
                    },
                  },
                }}
              />
            </Grid>

            {/* Color Swatch Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Color Swatch Image
              </Typography>
              <UploadButton
                component="label"
                startIcon={<CloudUploadIcon />}
              >
                Upload Color Swatch
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleColorImageChange}
                  hidden
                />
              </UploadButton>
              {colorImage && (
                <ImagePreviewContainer>
                  <img
                    src={URL.createObjectURL(colorImage)}
                    alt="Color"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </ImagePreviewContainer>
              )}
            </Grid>

            {/* Main Image Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Main Product Image
              </Typography>
              <UploadButton
                component="label"
                startIcon={<CloudUploadIcon />}
              >
                Upload Main Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, setMainImage, true)}
                  hidden
                />
              </UploadButton>
              {mainImage && (
                <ImagePreviewContainer>
                  <img
                    src={URL.createObjectURL(mainImage)}
                    alt="Main"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </ImagePreviewContainer>
              )}
            </Grid>

            {/* Additional Images */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Additional Images
              </Typography>
              <UploadButton
                component="label"
                startIcon={<CloudUploadIcon />}
              >
                Upload Additional Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageChange(e, setSubImages)}
                  hidden
                />
              </UploadButton>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                {previewImages.map((preview, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box sx={{ 
                      position: 'relative',
                      height: '150px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #e0e0e0'
                    }}>
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                      <IconButton
                        onClick={() => handleDeleteSubImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                            color: '#f44336',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleAddVariant}
                sx={{
                  mt: 2,
                  py: 1.5,
                  backgroundColor: '#3f51b5',
                  fontSize: '16px',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#303f9f',
                  },
                }}
              >
                Add Variant
              </Button>
            </Grid>
          </Grid>
        </ModalContent>
      </StyledModal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddVariantModal;

import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Checkbox,
  FormControlLabel,
  Paper,
  IconButton,
  Divider,
  InputAdornment,
  Alert,
  Snackbar,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import CloseIcon from "@mui/icons-material/Close";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import InventoryIcon from '@mui/icons-material/Inventory';
import axiosInstance from "@/utils/adminAxiosInstance";

// Styled Components
const StyledModal = styled(Modal)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ModalContent = styled(Paper)({
  width: '50%',
  maxWidth: '600px',
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

const SectionTitle = styled(Typography)({
  fontSize: '16px',
  fontWeight: 600,
  color: '#2c3e50',
  marginBottom: '16px',
});

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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSizeVariant = async () => {
    try {
      if (!formData.size || !formData.price || !formData.stockCount) {
        setSnackbar({
          open: true,
          message: "Please fill all required fields",
          severity: "error"
        });
        return;
      }

      const response = await axiosInstance.post("/sizes/size/add", {
        variantId,
        ...formData
      });

      setSnackbar({
        open: true,
        message: "Size variant added successfully",
        severity: "success"
      });

      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error adding size variant",
        severity: "error"
      });
    }
  };

  return (
    <>
      <StyledModal open={open} onClose={onClose}>
        <ModalContent elevation={3}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3 
          }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600,
              color: '#1a237e',
              fontSize: '24px'
            }}>
              Add Size Variant
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <SectionTitle>Basic Information</SectionTitle>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Size"
                    name="size"
                    fullWidth
                    required
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="e.g., S, M, L, XL"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#3f51b5',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Stock Count"
                    name="stockCount"
                    type="number"
                    fullWidth
                    required
                    value={formData.stockCount}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <InventoryIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Pricing */}
            <Grid item xs={12}>
              <SectionTitle>Pricing Details</SectionTitle>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Price"
                    name="price"
                    type="number"
                    fullWidth
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyRupeeIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Discount Price"
                    name="discountPrice"
                    type="number"
                    fullWidth
                    value={formData.discountPrice}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyRupeeIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Stock Status */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.inStock}
                    onChange={handleInputChange}
                    name="inStock"
                    color="primary"
                  />
                }
                label="Available in Stock"
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                multiline
                rows={4}
                fullWidth
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter size variant description..."
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleAddSizeVariant}
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
                Add Size Variant
              </Button>
            </Grid>
          </Grid>
        </ModalContent>
      </StyledModal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
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

export default AddSizeVariantModal;

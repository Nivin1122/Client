import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import axiosInstance from "@/utils/adminAxiosInstance";

const EditCategoryModal = ({ open, onClose, category, handleCategoryUpdated }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false); 
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" }); 

  useEffect(() => {
    if (category) {
      setName(category.name || "");
    }
  }, [category]);

  const handleUpdate = async () => {
    if (name.trim() === "") {
      setSnackbar({ open: true, message: "Category name cannot be empty!", severity: "error" });
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.put(
        `/categories/edit/${category._id}`,
        { name }
      );
      handleCategoryUpdated(response.data.category);
      setSnackbar({ open: true, message: "Category updated successfully!", severity: "success" });
      onClose();
    } catch (error) {
      console.error("Error updating category:", error);
      setSnackbar({ open: true, message: "Failed to update category. Please try again.", severity: "error" });
    } finally {
      setLoading(false); 
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Modal open={open} onClose={onClose} aria-labelledby="edit-category-modal">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography
            id="edit-category-modal"
            variant="h6"
            component="h2"
            gutterBottom
          >
            Edit Category
          </Typography>
          <TextField
            fullWidth
            label="Category Name"
            value={name || ""}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            margin="normal"
          />
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              fullWidth
              variant="contained"
              sx={{ bgcolor: "orange", "&:hover": { bgcolor: "darkorange" } }}
              onClick={handleUpdate}
              disabled={loading} 
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Update Category"
              )}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditCategoryModal;

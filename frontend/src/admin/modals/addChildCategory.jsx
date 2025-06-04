import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import axiosInstance from "@/utils/adminAxiosInstance";

const AddChildCategoryModal = ({ open, handleClose, parentCategoryId, onCategoryAdded }) => {
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await axiosInstance.post("/categories/add", {
        name: categoryName.trim(),
        parent: parentCategoryId, // This is the key fix
      });
      
      if (response.status === 201 || response.status === 200) {
        onCategoryAdded(response.data.category);
        setCategoryName("");
        handleClose();
      }
    } catch (err) {
      console.error("Failed to add child category:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setCategoryName("");
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleModalClose}>
      <DialogTitle>Add Child Category</DialogTitle>
      <DialogContent>
        <TextField
          label="Category Name"
          fullWidth
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          margin="dense"
          disabled={loading}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleModalClose} sx={{ color: "#FF9800" }}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          sx={{ color: "#FF9800" }}
          disabled={loading || !categoryName.trim()}
        >
          {loading ? "Adding..." : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddChildCategoryModal;
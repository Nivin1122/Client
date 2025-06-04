import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  IconButton,
  Paper,
  Box,
  TablePagination,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
} from "@mui/material";
import { 
  Add, 
  Block, 
  Search, 
  Edit as EditIcon,
  PlayArrow as UnblockIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddCategoryModal from "../../modals/addCategoryModal";
import EditCategoryModal from "../../modals/editCategoryModal";
import AddChildCategoryModal from "@/admin/modals/addChildCategory";
import axiosInstance from "@/utils/adminAxiosInstance";

const Category = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [categoryToBlock, setCategoryToBlock] = useState(null);
  const [parentCategoryId, setParentCategoryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/categories/get/admin");
        if (response.data && Array.isArray(response.data.categories)) {
          setCategoryData(response.data.categories);
        } else {
          setError("Invalid categories data format");
        }
      } catch (err) {
        setError("Failed to fetch categories data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategoryAdded = (newCategory) => {
    if (newCategory && newCategory._id) {
      setCategoryData((prevData) => [newCategory, ...prevData]);
      setSnackbarMessage("Category added successfully!");
      setSnackbarOpen(true);
    } else {
      console.error("Invalid new category:", newCategory);
    }
  };

  const handleCategoryUpdated = (updatedCategory) => {
    if (updatedCategory && updatedCategory._id) {
      setCategoryData((prevData) =>
        prevData.map((category) =>
          category._id === updatedCategory._id ? updatedCategory : category
        )
      );
      setSnackbarMessage("Category updated successfully!");
      setSnackbarOpen(true);
    } else {
      console.error("Invalid updated category:", updatedCategory);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleModalOpen = () => {
    setParentCategoryId(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setParentCategoryId(null);
  };

  const handleEditModalOpen = (category) => {
    if (category && category._id) {
      setSelectedCategory(category);
      setIsEditModalOpen(true);
    } else {
      console.error("Invalid category selected:", category);
    }
  };

  const handleEditModalClose = () => {
    setSelectedCategory(null);
    setIsEditModalOpen(false);
  };

  const handleBlockCategory = (categoryId) => {
    setCategoryToBlock(categoryId);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmBlock = async () => {
    if (!categoryToBlock) return;
    try {
      const response = await axiosInstance.patch(
        `/categories/block/${categoryToBlock}`
      );
      if (response.status === 200) {
        setCategoryData((prevData) =>
          prevData.map((category) =>
            category._id === categoryToBlock
              ? { ...category, isDeleted: true }
              : category
          )
        );
        setSnackbarMessage(response.data.message);
        setSnackbarOpen(true);
        setIsConfirmationModalOpen(false);
      }
    } catch (error) {
      console.error("Error blocking category:", error);
      setSnackbarMessage("Failed to block category.");
      setSnackbarOpen(true);
      setIsConfirmationModalOpen(false);
    }
  };

  const handleUnBlockCategory = async (categoryId) => {
    try {
      const response = await axiosInstance.patch(
        `/categories/unblock/${categoryId}`
      );
      if (response.status === 200) {
        setCategoryData((prevData) =>
          prevData.map((category) =>
            category._id === categoryId
              ? { ...category, isDeleted: false }
              : category
          )
        );
        setSnackbarMessage("Category successfully unblocked!");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error unblocking category:", error);
      setSnackbarMessage("Failed to unblock category.");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);
  const handleConfirmationModalClose = () => setIsConfirmationModalOpen(false);

  const groupCategories = (categories) => {
    const parentMap = {};
    const childrenMap = {};

    categories.forEach((cat) => {
      if (!cat.parent) {
        parentMap[cat._id] = { ...cat, children: [] };
      } else {
        if (!childrenMap[cat.parent._id]) childrenMap[cat.parent._id] = [];
        childrenMap[cat.parent._id].push(cat);
      }
    });

    Object.keys(childrenMap).forEach((parentId) => {
      if (parentMap[parentId]) {
        parentMap[parentId].children = childrenMap[parentId];
      }
    });

    return Object.values(parentMap);
  };

  const openAddChildModal = (parentId) => {
    setParentCategoryId(parentId);
    setIsModalOpen(true);
  };

  // Filter categories based on search term
  const filteredCategories = groupCategories(categoryData).filter(parent =>
    parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.children.some(child =>
      child.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Paginate the filtered categories
  const paginatedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        color: "#FF9800" 
      }}>
        Loading categories...
      </Box>
    );
  }

  if (error) {
    return <Box sx={{ color: "#FF9800" }}>Error: {error}</Box>;
  }

  return (
    <>
      <Box sx={{ padding: 3, backgroundColor: "#212121" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#333",
            borderRadius: 2,
            padding: 2,
            marginBottom: 2,
          }}
        >
          <Box>
            <Box
              component="span"
              sx={{ fontSize: "20px", fontWeight: "bold", color: "#FF9800" }}
            >
              Categories ({filteredCategories.length})
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              backgroundColor: "white",
              color: "#FF9800",
              "&:hover": { backgroundColor: "white" },
              border: "1px solid #FF9800",
            }}
            onClick={handleModalOpen}
          >
            Add New Category
          </Button>
          <Box>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton>
                    <Search sx={{ color: "#FF9800" }} />
                  </IconButton>
                ),
              }}
              sx={{
                backgroundColor: "#424242",
                color: "#ffffff",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  color: "#ffffff",
                  "& fieldset": {
                    borderColor: "#FF9800",
                  },
                },
              }}
            />
          </Box>
        </Box>

        {/* Categories Display */}
        <Paper sx={{ padding: 2, backgroundColor: "#333", borderRadius: 3 }}>
          {paginatedCategories.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4, 
              color: '#888' 
            }}>
              No categories found
            </Box>
          ) : (
            paginatedCategories.map((parent) => (
              <Accordion 
                key={parent._id}
                sx={{
                  backgroundColor: "#424242",
                  color: "#fff",
                  mb: 1,
                  "&:before": {
                    display: "none",
                  },
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon sx={{ color: "#FF9800" }} />}
                  sx={{ 
                    backgroundColor: "#424242",
                    "&:hover": { backgroundColor: "#555" }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    width: '100%',
                    mr: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ color: "#FF9800", fontWeight: 'bold' }}>
                        {parent.name}
                      </Typography>
                      <Chip
                        label={parent.isDeleted ? "Blocked" : "Active"}
                        color={parent.isDeleted ? "error" : "success"}
                        size="small"
                      />
                      <Chip
                        label={`${parent.children.length} subcategories`}
                        variant="outlined"
                        size="small"
                        sx={{ color: "#FF9800", borderColor: "#FF9800" }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditModalOpen(parent);
                        }}
                        sx={{ color: "#FF9800" }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          parent.isDeleted 
                            ? handleUnBlockCategory(parent._id)
                            : handleBlockCategory(parent._id);
                        }}
                        sx={{ color: parent.isDeleted ? "#4caf50" : "#f44336" }}
                      >
                        {parent.isDeleted ? <UnblockIcon /> : <Block />}
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ backgroundColor: "#555" }}>
                  {parent.children.length > 0 ? (
                    <Box sx={{ mb: 2 }}>
                      {parent.children.map((child) => (
                        <Box
                          key={child._id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            ml: 3,
                            mb: 1,
                            p: 1,
                            backgroundColor: "#666",
                            borderRadius: 1,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography sx={{ color: "#fff" }}>
                              • {child.name}
                            </Typography>
                            <Chip
                              label={child.isDeleted ? "Blocked" : "Active"}
                              color={child.isDeleted ? "error" : "success"}
                              size="small"
                            />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditModalOpen(child)}
                              sx={{ color: "#FF9800" }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => 
                                child.isDeleted 
                                  ? handleUnBlockCategory(child._id)
                                  : handleBlockCategory(child._id)
                              }
                              sx={{ color: child.isDeleted ? "#4caf50" : "#f44336" }}
                            >
                              {child.isDeleted ? <UnblockIcon /> : <Block />}
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography sx={{ ml: 3, color: "#888", mb: 2 }}>
                      No child categories
                    </Typography>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Add />}
                    sx={{
                      mt: 1,
                      ml: 3,
                      color: "#FF9800",
                      borderColor: "#FF9800",
                      "&:hover": {
                        backgroundColor: "rgba(255, 152, 0, 0.1)",
                        borderColor: "#FF9800",
                      }
                    }}
                    onClick={() => openAddChildModal(parent._id)}
                  >
                    Add Subcategory
                  </Button>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Paper>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredCategories.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            backgroundColor: "#333",
            color: "#FF9800",
            mt: 2,
            borderRadius: 1,
          }}
        />
      </Box>

      {/* Modals */}
      {parentCategoryId ? (
        <AddChildCategoryModal
          open={isModalOpen}
          handleClose={handleModalClose}
          onCategoryAdded={handleCategoryAdded}
          parentCategoryId={parentCategoryId}
        />
      ) : (
        <AddCategoryModal
          open={isModalOpen}
          handleClose={handleModalClose}
          onCategoryAdded={handleCategoryAdded}
        />
      )}

      <EditCategoryModal
        open={isEditModalOpen}
        onClose={handleEditModalClose}
        category={selectedCategory}
        handleCategoryUpdated={handleCategoryUpdated}
      />

      {/* Confirmation Modal */}
      <Dialog
        open={isConfirmationModalOpen}
        onClose={handleConfirmationModalClose}
      >
        <DialogTitle>Confirm Block</DialogTitle>
        <DialogContent>
          Are you sure you want to block this category?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmationModalClose}
            sx={{ color: "#FF9800" }}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmBlock} sx={{ color: "#FF9800" }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Category;
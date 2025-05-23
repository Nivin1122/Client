import React from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
} from "@mui/material";

const AddUserModal = ({ open, handleClose }) => {
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "orange",
    borderRadius: 2,
    boxShadow: 24,
    padding: 4,
    width: "400px",
    outline: "none",
  };

  const inputStyle = {
    marginBottom: 2,
    "& .MuiInputBase-input": {
      backgroundColor: "white",
    },
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            color: "white",
            marginBottom: 3,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Add New User
        </Typography>

        <TextField
          label="First Name"
          variant="outlined"
          fullWidth
          sx={inputStyle}
        />
        <TextField
          label="Last Name"
          variant="outlined"
          fullWidth
          sx={inputStyle}
        />
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          sx={inputStyle}
        />
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          sx={inputStyle}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          sx={inputStyle}
        />
        <TextField
          label="Confirm Password"
          type="password"
          variant="outlined"
          fullWidth
          sx={inputStyle}
        />
        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: "white",
            color: "orange",
            "&:hover": { backgroundColor: "white" },
            fontWeight: "bold",
            marginTop: 2,
          }}
          onClick={handleClose}
        >
          Add User
        </Button>
      </Box>
    </Modal>
  );
};

export default AddUserModal;

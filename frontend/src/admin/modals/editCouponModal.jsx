import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Close } from "@mui/icons-material";
import { isBefore } from "date-fns";

const EditCouponModal = ({
  open,
  handleClose,
  handleCouponUpdated,
  coupon,
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (coupon) {
      setCouponCode(coupon.couponCode || "");
      setDiscountType(coupon.discountType || "percentage");
      setDiscountValue(coupon.discountValue || "");
      setStartDate(dayjs(coupon.startDate) || dayjs());
      setEndDate(dayjs(coupon.endDate) || dayjs());
      setMinOrderAmount(coupon.minOrderAmount || "");
    }
  }, [coupon]);

  const validateFields = () => {
    const newErrors = {};
    if (!couponCode.trim() || couponCode.length !== 10 || /[a-z]/.test(couponCode)) {
      newErrors.couponCode = "Coupon code must be 10 characters long and contain no lowercase letters.";
    }
    if (discountType === "percentage" && (discountValue <= 0 || discountValue >= 100)) {
      newErrors.discountValue = "Percentage discount must be between 0 and 100.";
    }
    if (discountType === "fixed" && (discountValue <= 0 || discountValue >= minOrderAmount)) {
      newErrors.discountValue = "Fixed discount must be less than the minimum order amount.";
    }
    if (!startDate || isBefore(startDate, dayjs().startOf('day'))) {
      newErrors.startDate = "Start date must be today or in the future.";
    }
    if (!endDate || isBefore(endDate, startDate)) {
      newErrors.endDate = "End date must be after the start date.";
    }
    if (!minOrderAmount) newErrors.minOrderAmount = "Minimum order amount is required.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    const updatedCoupon = {
      couponCode,
      discountType,
      discountValue,
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      minOrderAmount,
    };

    try {
      const response = await axios.put(
        `http://localhost:5173/api/admin/coupon/edit/${coupon._id}`, // Ensure this matches your backend route
        updatedCoupon,
        { withCredentials: true }
      );

      handleCouponUpdated(response.data.coupon);
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: "success",
      });

      handleClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update coupon",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="edit-coupon-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 550,
            bgcolor: "#fff",
            color: "#000",
            boxShadow: 24,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              bgcolor: "#222",
              color: "#fff",
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Edit Coupon
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: "#fff" }}>
              <Close />
            </IconButton>
          </Box>
          <Box sx={{ p: 3 }}>
            <TextField
              label="Coupon Code"
              variant="outlined"
              fullWidth
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              error={!!errors.couponCode}
              helperText={errors.couponCode}
              sx={{ bgcolor: "#fff", mb: 2 }}
            />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Discount Type"
                  variant="outlined"
                  fullWidth
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  sx={{ bgcolor: "#fff" }}
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Discount Value"
                  type="number"
                  variant="outlined"
                  fullWidth
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  error={!!errors.discountValue}
                  helperText={errors.discountValue}
                  sx={{ bgcolor: "#fff" }}
                />
              </Grid>
            </Grid>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    minDate={dayjs()}
                    sx={{ bgcolor: "#fff", width: "100%" }}
                  />
                  {errors.startDate && (
                    <Typography color="error" variant="caption">
                      {errors.startDate}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    minDate={startDate}
                    sx={{ bgcolor: "#fff", width: "100%" }}
                  />
                  {errors.endDate && (
                    <Typography color="error" variant="caption">
                      {errors.endDate}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </LocalizationProvider>
            <TextField
              label="Minimum Order Amount"
              type="number"
              variant="outlined"
              fullWidth
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              error={!!errors.minOrderAmount}
              helperText={errors.minOrderAmount}
              sx={{ bgcolor: "#fff", mb: 3 }}
            />
          </Box>
          <Box
            sx={{ bgcolor: "#222", color: "#fff", p: 2, textAlign: "center" }}
          >
            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: "#fff",
                color: "#222",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#ddd" },
              }}
              onClick={handleSubmit}
            >
              Update Coupon
            </Button>
          </Box>
        </Box>
      </Modal>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // Position at top center
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            backgroundColor: "black",
            color: "white", 
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditCouponModal;

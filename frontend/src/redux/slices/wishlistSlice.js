import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

// Async thunks for wishlist operations
export const fetchWishlistItems = createAsyncThunk(
  "wishlist/fetchItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/user/wishlist/get");
      return response.data.Wishlist;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch wishlist");
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addItem",
  async ({ productId, variantId, sizeVariantId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/user/wishlist/add", {
        productId,
        variantId,
        sizeVariantId,
      });
      return response.data.wishlist.items;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add item to wishlist");
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeItem",
  async ({ productId, variantId, sizeVariantId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete("/user/wishlist/remove/wishlist", {
        data: { productId, variantId, sizeVariantId },
      });
      return { productId, variantId, sizeVariantId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove item from wishlist");
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
    totalItems: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch wishlist items
    builder
      .addCase(fetchWishlistItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlistItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.totalItems = action.payload.length;
      })
      .addCase(fetchWishlistItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.totalItems = action.payload.length;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (item) =>
            !(item.product._id === action.payload.productId &&
              item.variant._id === action.payload.variantId &&
              item.sizeVariant._id === action.payload.sizeVariantId)
        );
        state.totalItems = state.items.length;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default wishlistSlice.reducer;
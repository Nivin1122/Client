import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
  cartId: null  // Add cartId to track the cart ID
};

// Helper function to calculate total items (unique products count)
const calculateTotalItems = (items) => {
  return items.length;
};

// Helper function to calculate total price
const calculateTotalPrice = (items) => {
  return items.reduce((total, item) => {
    const price = item.sizeVariant?.discountPrice || item.finalPrice || item.price;
    return total + (price * item.quantity);
  }, 0);
};

// Helper function to extract cart ID from API response
const extractCartId = (response) => {
    // Handle case where response is the cart object directly
    if (response && response._id) {
      return response._id;
    }
  
    // If response has a direct cartId field, use it
    if (response.cartId) {
      return response.cartId;
    }
  
    // Try to extract cart ID from items
    if (response.items && response.items.length > 0) {
      const firstItem = response.items[0];
  
      // Check different places the cart ID might be stored
      if (firstItem.cartId) {
        return firstItem.cartId;
      }
  
      if (typeof firstItem.cart === 'string') {
        return firstItem.cart;
      }
  
      if (firstItem.cart && firstItem.cart._id) {
        return firstItem.cart._id;
      }
    }
  
    return null;
  };
  

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      state.items = action.payload.items;
      state.totalItems = calculateTotalItems(action.payload.items);
      state.totalPrice = calculateTotalPrice(action.payload.items);
      
      // Extract and store cart ID
      const cartId = extractCartId(action.payload);
      if (cartId) {
        state.cartId = cartId;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      state.cartId = null;  // Clear cart ID when clearing cart
    },
    // Explicitly set cart ID
    setCartId: (state, action) => {
      state.cartId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalItems = calculateTotalItems(action.payload.items);
        state.totalPrice = calculateTotalPrice(action.payload.items);
        
        // Extract and store cart ID
        const cartId = extractCartId(action.payload);
        if (cartId) {
          state.cartId = cartId;
        }
        
        state.loading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setCartItems, setLoading, setError, clearCart, setCartId } = cartSlice.actions;

// Thunk action to fetch cart items
export const fetchCartItems = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axiosInstance.get('/cart/get-cart');
    console.log('Cart response:', response.data.cart);
    
    // Extract cart ID from response and log it
    console.log("Response",response.data.cart._id)
    const cartId = extractCartId(response.data.cart);
    console.log('Extracted cart ID:', cartId);
    
    dispatch(setCartItems(response.data.cart));
  } catch (error) {
    console.error('Error fetching cart items:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Async thunk action to add item to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (productData, { dispatch, rejectWithValue }) => {
    try {
      const addResponse = await axiosInstance.post('/cart/add-to-cart', productData);
      
      // Log the add to cart response to see if it contains a cart ID
      console.log('Add to cart response:', addResponse.data);
      
      const response = await axiosInstance.get('/cart/get-cart');
      return response.data.cart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Thunk action to update cart item quantity
export const updateCartItemQuantity = (productData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    await axiosInstance.put('/cart/update-quantity', productData);
    dispatch(fetchCartItems());
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Thunk action to remove item from cart
export const removeFromCart = (productData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    await axiosInstance.delete('/cart/delete-product', { data: productData });
    dispatch(fetchCartItems());
  } catch (error) {
    console.error('Error removing from cart:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export default cartSlice.reducer;
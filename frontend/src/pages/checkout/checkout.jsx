import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Header from "../../components/header";
import Footer from "../../components/footer";
import axiosInstance from "../../utils/axiosInstance";
import { clearCart } from "../../redux/slices/cartSlice";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Check if this is a direct purchase
  const isDirectPurchase = location.state?.directPurchase || false;
  const directPurchaseItem = location.state?.checkoutItem || null;
  
  const {
    items: cartItems,
    totalPrice: cartTotalPrice,
    cartId,
  } = useSelector((state) => state.cart);

  // Use direct purchase item or cart items
  const checkoutItems = isDirectPurchase ? [directPurchaseItem] : cartItems;
  
  // Calculate total price for direct purchase
  const directTotalPrice = isDirectPurchase && directPurchaseItem 
    ? directPurchaseItem.sizeVariant.discountPrice * directPurchaseItem.quantity
    : 0;
  
  const totalPrice = isDirectPurchase ? directTotalPrice : cartTotalPrice;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    mobileNumber: "",
    addressType: "Home",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  ];

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          setRazorpayLoaded(true);
          resolve(true);
          return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error("Failed to load Razorpay SDK");
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!newAddress.fullName.trim()) errors.fullName = "Full name is required";
    if (!newAddress.address.trim()) errors.address = "Address is required";
    if (!newAddress.city.trim()) errors.city = "City is required";
    if (!newAddress.state) errors.state = "State is required";
    if (!newAddress.pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^[0-9]{6}$/.test(newAddress.pincode)) {
      errors.pincode = "Pincode must be 6 digits";
    }
    if (!newAddress.mobileNumber.trim()) {
      errors.mobileNumber = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(newAddress.mobileNumber)) {
      errors.mobileNumber = "Mobile number must be 10 digits";
    }
    return errors;
  };

  useEffect(() => {
    // For direct purchase, don't check cart items
    if (!isDirectPurchase && !cartItems.length) {
      navigate("/cart");
      return;
    }
    
    // For direct purchase, check if we have the item
    if (isDirectPurchase && !directPurchaseItem) {
      navigate("/");
      return;
    }
    
    fetchAddresses();
  }, [cartItems, navigate, isDirectPurchase, directPurchaseItem]);

  const fetchAddresses = async () => {
    try {
      const response = await axiosInstance.get("/address/get-address");
      setAddresses(response.data.addresses);
      if (response.data.addresses.length > 0) {
        setSelectedAddress(response.data.addresses[0]._id);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setError("Failed to load addresses");
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        const response = await axiosInstance.post("/address/add-address", {
          ...newAddress,
          locality: newAddress.address,
          addressType:
            newAddress.addressType.charAt(0).toUpperCase() +
            newAddress.addressType.slice(1),
        });

        setAddresses([...addresses, response.data.address]);
        setSelectedAddress(response.data.address._id);
        setShowAddressForm(false);
        setNewAddress({
          fullName: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          mobileNumber: "",
          addressType: "Home",
        });
        setFormErrors({});
      } catch (error) {
        console.error("Error creating address:", error);
        setError(error.response?.data?.message || "Failed to create address");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleOnlinePayment = async (checkoutId) => {
    try {
      if (!razorpayLoaded) {
        throw new Error(
          "Razorpay SDK not loaded. Please refresh and try again."
        );
      }

      const response = await axiosInstance.post("/payment/create-order", {
        amount: Math.round(totalPrice * 100),
        currency: "INR",
        checkoutId: checkoutId,
      });

      const orderData = response.data;
      const selectedAddr = addresses.find(
        (addr) => addr._id === selectedAddress
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TrendRove",
        description: "Payment for your order",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            setLoading(true);
            const verifyResponse = await axiosInstance.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              checkoutId: checkoutId,
            });

            if (verifyResponse.data.status === "success") {
              if (!isDirectPurchase) {
                dispatch(clearCart());
              }
              setError("");
              setShowSuccessModal(true);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            setError("Payment verification failed. Please contact support.");
            try {
              await axiosInstance.post("/payment/cancel", {
                orderId: orderData.id,
                checkoutId: checkoutId,
                status: "failed",
                error: error.message,
              });
            } catch (cancelError) {
              console.error("Error canceling payment:", cancelError);
            }
          } finally {
            setLoading(false);
          }
        },

        prefill: {
          name: selectedAddr?.fullName || "",
          contact: selectedAddr?.mobileNumber || "",
          email: "",
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: async function () {
            try {
              setLoading(true);
              await axiosInstance.post("/payment/cancel", {
                orderId: orderData.id,
                checkoutId: checkoutId,
                status: "retry_pending",
              });

              setError(
                "Payment cancelled. Your order has been saved and you can retry payment from the orders page."
              );

              if (!isDirectPurchase) {
                dispatch(clearCart());
              }
              setTimeout(() => {
                navigate("/orders");
              }, 2000);
            } catch (error) {
              console.error("Error handling payment cancellation:", error);
              setError("Payment cancelled. Please check your orders page.");
            } finally {
              setLoading(false);
            }
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", async function (response) {
        try {
          setLoading(true);
          console.error("Payment failed:", response.error);

          await axiosInstance.post("/payment/cancel", {
            orderId: orderData.id,
            checkoutId: checkoutId,
            status: "retry_pending",
            error: response.error,
          });

          setError(
            "Payment failed. Your order has been saved and you can retry payment from the orders page."
          );

          if (!isDirectPurchase) {
            dispatch(clearCart());
          }
          setTimeout(() => {
            navigate("/orders");
          }, 2000);
        } catch (error) {
          console.error("Error handling payment failure:", error);
          setError("Payment failed. Please try again or contact support.");
        } finally {
          setLoading(false);
        }
      });

      rzp.open();
    } catch (error) {
      console.error("Error in online payment:", error);
      setError(
        error.message || "Failed to initialize payment. Please try again."
      );
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      setError("Please select a delivery address");
      return;
    }

    if (!checkoutItems.length) {
      setError("No items to checkout");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let checkoutData;
      
      if (isDirectPurchase) {
        // For direct purchase, create checkout data differently
        checkoutData = {
          directPurchase: true,
          items: [{
            productId: directPurchaseItem.product._id,
            variantId: directPurchaseItem.variant._id,
            sizeVariantId: directPurchaseItem.sizeVariant._id,
            quantity: directPurchaseItem.quantity,
            price: directPurchaseItem.sizeVariant.discountPrice,
          }],
          addressId: selectedAddress,
          shippingMethod: "Standard",
          paymentMethod,
          transactionId:
            paymentMethod === "cod"
              ? `COD_${Date.now()}`
              : `ONLINE_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
          paymentStatus: paymentMethod === "cod" ? "pending" : "retry_pending",
          finalTotal: totalPrice,
        };
      } else {
        // Original cart-based checkout
        checkoutData = {
          cartId,
          addressId: selectedAddress,
          shippingMethod: "Standard",
          paymentMethod,
          transactionId:
            paymentMethod === "cod"
              ? `COD_${Date.now()}`
              : `ONLINE_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
          paymentStatus: paymentMethod === "cod" ? "pending" : "retry_pending",
          finalTotal: totalPrice,
        };
      }

      const response = await axiosInstance.post(
        "/checkout/create-checkout",
        checkoutData
      );

      if (response.data.success) {
        const checkoutId = response.data.order._id;

        if (paymentMethod === "cod") {
          if (!isDirectPurchase) {
            dispatch(clearCart());
          }
          navigate("/orders");
        } else if (paymentMethod === "online") {
          await handleOnlinePayment(checkoutId);
        }
      } else {
        throw new Error(response.data.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to process checkout"
      );
    } finally {
      if (paymentMethod === "cod") {
        setLoading(false);
      }
    }
  };

  const calculateSubtotal = () => {
    if (isDirectPurchase && directPurchaseItem) {
      return directPurchaseItem.sizeVariant.discountPrice * directPurchaseItem.quantity;
    }
    return cartItems.reduce(
      (total, item) => total + item.sizeVariant.discountPrice * item.quantity,
      0
    );
  };

  const deliveryCharge = totalPrice < 1000 ? 40 : 0;

  // Modal Component
  const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );

  return (
    <>
      <Header />
      {showSuccessModal && (
        <Modal onClose={() => setShowSuccessModal(false)}>
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl font-semibold text-green-600">
              Payment Successful!
            </h2>
            <p className="text-gray-600">Thank you for your order.</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => navigate("/orders")}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Go to Orders
              </button>
              <button
                onClick={() => navigate("/")}
                className="bg-gray-200 text-black px-4 py-2 rounded"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="container mx-auto px-4 pt-28 pb-12 max-w-7xl mt-10">
        <h1 className="text-3xl font-serif text-center mb-10">
          {isDirectPurchase ? "Quick Checkout" : "Checkout"}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!razorpayLoaded && paymentMethod === "online" && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Loading payment gateway... Please wait.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Address Section - Same as before */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Delivery Address</h2>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add New Address
                </button>
              </div>

              {showAddressForm ? (
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newAddress.fullName}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          fullName: e.target.value,
                        })
                      }
                      className={`w-full p-2 border rounded ${
                        formErrors.fullName ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.fullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Address"
                      value={newAddress.address}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          address: e.target.value,
                        })
                      }
                      className={`w-full p-2 border rounded ${
                        formErrors.address ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        className={`w-full p-2 border rounded ${
                          formErrors.city ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.city && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <select
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            state: e.target.value,
                          })
                        }
                        className={`w-full p-2 border rounded ${
                          formErrors.state ? "border-red-500" : ""
                        }`}
                      >
                        <option value="">Select State</option>
                        {indianStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      {formErrors.state && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.state}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={newAddress.pincode}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            pincode: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6),
                          })
                        }
                        className={`w-full p-2 border rounded ${
                          formErrors.pincode ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.pincode && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.pincode}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="tel"
                        placeholder="Mobile Number"
                        value={newAddress.mobileNumber}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            mobileNumber: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          })
                        }
                        className={`w-full p-2 border rounded ${
                          formErrors.mobileNumber ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.mobileNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.mobileNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <select
                    value={newAddress.addressType}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        addressType: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                  </select>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        "Save Address"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setFormErrors({});
                      }}
                      className="w-full border border-gray-300 py-2 rounded hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`border rounded-lg p-4 cursor-pointer ${
                        selectedAddress === address._id
                          ? "border-black"
                          : "border-gray-200"
                      }`}
                      onClick={() => setSelectedAddress(address._id)}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          checked={selectedAddress === address._id}
                          onChange={() => setSelectedAddress(address._id)}
                          className="mt-1"
                        />
                        <div className="ml-4">
                          <p className="font-medium">{address.fullName}</p>
                          <p className="text-sm text-gray-600">
                            {address.address}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-sm text-gray-600">
                            Phone: {address.mobileNumber}
                          </p>
                          <span className="inline-block mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {address.addressType.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Items Section - Updated for direct purchase */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-medium mb-4">Order Items</h2>
              <div className="space-y-4">
                {checkoutItems.map((item) => (
                  <div key={item._id} className="flex gap-4 border-b pb-4">
                    <img
                      src={item.variant?.mainImage}
                      alt={item.product.name}
                      className="w-20 h-20 object-contain rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">
                        Size: {item.sizeVariant.size} • Color:{" "}
                        {item.variant.color}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm font-medium">
                        Rs.{" "}
                        {(item.sizeVariant.discountPrice || item.price) *
                          item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Section - Same logic */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-medium mb-4">Payment Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {calculateSubtotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>Rs. {deliveryCharge}</span>
                </div>
                <div className="flex justify-between font-medium text-lg border-t pt-3">
                  <span>Total</span>
                  <span>Rs. {totalPrice}</span>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-3">Payment Method</h3>
                  <div className="space-y-3">
                    {/* <label className="flex items-center gap-3 p-3 border rounded cursor-pointer">
                      <input
                        type="radio"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span>Cash on Delivery</span>
                    </label> */}
                    <label className="flex items-center gap-3 p-3 border rounded cursor-pointer">
                      <input
                        type="radio"
                        value="online"
                        checked={paymentMethod === "online"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span>
                        Online Payment (Credit/Debit Card, UPI, Net Banking)
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={
                    loading || (paymentMethod === "online" && !razorpayLoaded)
                  }
                  className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400 mt-6 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    `${
                      paymentMethod === "cod" ? "Place Order" : "Pay"
                    } Rs. ${totalPrice}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header";
import Footer from "../../components/footer";
import axiosInstance from "../../utils/axiosInstance";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get("/checkout/get-orders");
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelItem = async (orderId, itemId) => {
    try {
      const reason = prompt("Please provide a reason for cancellation:");
      if (!reason) return;

      const response = await axiosInstance.patch(
        `/checkout/cancel-order/${orderId}/${itemId}`,
        { reason }
      );

      if (response.data.success) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error cancelling item:", error);
      alert("Failed to cancel item");
    }
  };

  const handleReturnItem = async (orderId, itemId) => {
    try {
      const reason = prompt("Please select a return reason:\n1. Defective\n2. Not as described\n3. Wrong size/fit\n4. Changed my mind\n5. Other");
      if (!reason) return;

      const details = prompt("Please provide additional details:");
      if (!details) return;

      const response = await axiosInstance.patch(
        `/checkout/return-product/${orderId}/${itemId}`,
        { reason, details }
      );

      if (response.data.success) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error returning item:", error);
      alert("Failed to submit return request");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      Processing: "bg-blue-100 text-blue-800",
      Shiped: "bg-purple-100 text-purple-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
      Returned: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 pt-28 pb-12 max-w-7xl mt-10">
        <h1 className="text-3xl font-serif text-center mb-10">My Orders</h1>

        {loading && <p className="text-center">Loading orders...</p>}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <p className="text-center text-gray-500">No orders found</p>
        )}

        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.orderId} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID: {order.orderId}</p>
                    <p className="text-sm text-gray-500">
                      Ordered on: {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Total: Rs. {order.totalAmount}</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.itemId} className="p-6 flex flex-wrap gap-6">
                    <div className="w-24">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-24 object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <h3 className="font-medium">{item.productName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Size: {item.size} • Color: {item.color}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} • Rs. {item.finalPrice}
                      </p>
                      <div className="mt-3">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 justify-center">
                      {item.status === "pending" && (
                        <button
                          onClick={() => handleCancelItem(order.orderId, item.itemId)}
                          className="text-red-600 text-sm hover:text-red-800"
                        >
                          Cancel Item
                        </button>
                      )}
                      {item.status === "Delivered" && !item.returnRequested && (
                        <button
                          onClick={() => handleReturnItem(order.orderId, item.itemId)}
                          className="text-blue-600 text-sm hover:text-blue-800"
                        >
                          Return Item
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.fullName}
                      <br />
                      {order.shippingAddress.address}
                      <br />
                      {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                      {order.shippingAddress.pincode}
                      <br />
                      Phone: {order.shippingAddress.mobileNumber}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Payment Details</h4>
                    <p className="text-sm text-gray-600">
                      Method: {order.payment.method === "cod" ? "Cash on Delivery" : "Online Payment"}
                      <br />
                      Status: {order.payment.status}
                      <br />
                      Subtotal: Rs. {order.subTotal}
                      <br />
                      {order.discountAmount > 0 && (
                        <>
                          Discount: Rs. {order.discountAmount}
                          <br />
                        </>
                      )}
                      Delivery Charge: Rs. {order.deliveryCharge}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Orders;
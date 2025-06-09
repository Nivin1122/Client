import Header from "../components/header";
import Footer from "../components/footer";
import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchCartItems,
  updateCartItemQuantity,
  removeFromCart,
} from "../redux/slices/cartSlice";
import ConfirmationModal from "../components/confirmationModels/cartRemoveConfirm";

const Cart = () => {
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    items: cartItems,
    totalPrice,
    loading,
    error,
  } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  const updateQuantity = (item, newQty) => {
    if (newQty < 1 || newQty > item.sizeVariant.stockCount) return;
    dispatch(
      updateCartItemQuantity({
        productId: item.product._id,
        quantity: newQty,
        variantId: item.variant._id,
        sizeVariantId: item.sizeVariant._id,
      })
    )
      .unwrap()
      .then(() => toast.success("Cart updated successfully"))
      .catch((error) => toast.error(error || "Failed to update cart"));
  };

  const removeItem = (item) => {
    if (
      window.confirm(
        "Are you sure you want to remove this item from your cart?"
      )
    ) {
      dispatch(
        removeFromCart({
          productId: item.product._id,
          variantId: item.variant._id,
          sizeVariantId: item.sizeVariant._id,
        })
      )
        .unwrap()
        .then(() => toast.success("Item removed from cart successfully"))
        .catch((error) =>
          toast.error(error || "Failed to remove item from cart")
        );
    }
  };

  const calculateSubtotal = () =>
    cartItems.reduce((total, item) => {
      const price = item.sizeVariant.discountPrice || item.price;
      return total + price * item.quantity;
    }, 0);

  const handleRemoveClick = (item) => {
    setItemToDelete(item);
    setShowModal(true);
  };

  const confirmRemoveItem = () => {
    if (!itemToDelete) return;

    dispatch(
      removeFromCart({
        productId: itemToDelete.product._id,
        variantId: itemToDelete.variant._id,
        sizeVariantId: itemToDelete.sizeVariant._id,
      })
    )
      .then(() => {
        toast.success("Item removed from cart successfully");
        setShowModal(false);
        setItemToDelete(null);
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to remove item from cart");
      });
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 pt-28 pb-12 max-w-7xl">
        <h1 className="text-3xl font-serif text-center mt-10 mb-10">
          Your Cart
        </h1>

        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && cartItems.length === 0 && (
          <p className="text-center">Your cart is empty.</p>
        )}

        {cartItems.length > 0 && (
          <div className="overflow-x-auto -mx-4 p-5 sm:mx-0">
            <table className="w-full text-sm hidden md:table">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="text-left pb-3">Product</th>
                  <th className="text-center pb-3">Size / Color</th>
                  <th className="text-right pb-3">Price</th>
                  <th className="text-center pb-3">Quantity</th>
                  <th className="text-right pb-3">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="py-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={item.variant?.mainImage}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded border cursor-pointer"
                          onClick={() =>
                            navigate(`/detail/${item.product._id}`, {
                              state: { variantId: item.variant._id },
                            })
                          }
                        />
                        <div>
                          <h3 className="font-medium w-80 overflow-hidden h-10">
                            {item.product.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Stock:{" "}
                            <span className="text-green-600">
                              {item.sizeVariant.stockCount} available
                            </span>
                          </p>
                          <button
                            onClick={() => handleRemoveClick(item)}
                            className="w-100 mt-2 px-4 py-1 border border-red-500 text-red-500 text-sm rounded-md hover:bg-red-500 hover:text-white transition duration-200 text-center"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="text-center py-4">
                      <span className="block">{item.sizeVariant.size}</span>
                      <span
                        className="inline-block mt-1 w-4 h-4 rounded-full border"
                        style={{ backgroundColor: item.variant.color }}
                      />
                    </td>

                    <td className="text-right py-4">
                      {item.sizeVariant.discountPrice ? (
                        <div>
                          <span className="line-through text-gray-400 mr-1">
                            Rs. {item.price}
                          </span>
                          <span className="text-green-600">
                            Rs. {item.sizeVariant.discountPrice}
                          </span>
                        </div>
                      ) : (
                        <>Rs. {item.price}</>
                      )}
                    </td>

                    <td className="text-center py-4">
                      <div className="flex justify-center">
                        <button
                          className="px-2 py-1 border border-gray-300 rounded-l"
                          onClick={() =>
                            updateQuantity(item, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-4 py-1 border-t border-b border-gray-300">
                          {item.quantity}
                        </span>
                        <button
                          className="px-2 py-1 border border-gray-300 rounded-r"
                          onClick={() =>
                            updateQuantity(item, item.quantity + 1)
                          }
                          disabled={
                            item.quantity >= item.sizeVariant.stockCount
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="text-right py-4">
                      <span className="text-green-600">
                        Rs. {calculateSubtotal().toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile View */}
            <div className="md:hidden space-y-6">
              {cartItems.map((item) => (
                <div key={item._id} className="border-b pb-6">
                  <div className="flex gap-4">
                    <img
                      src={item.variant?.mainImage}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded border cursor-pointer"
                      onClick={() =>
                        navigate(`/detail/${item.product._id}`, {
                          state: { variantId: item.variant._id },
                        })
                      }
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <div className="mt-1 space-y-1 text-sm text-gray-500">
                        <p>Size: {item.sizeVariant.size}</p>
                        <div className="flex items-center gap-1">
                          <span>Color:</span>
                          <span
                            className="inline-block w-4 h-4 rounded-full border"
                            style={{ backgroundColor: item.variant.color }}
                          />
                        </div>
                        <p>
                          Stock:{" "}
                          <span className="text-green-600">
                            {item.sizeVariant.stockCount} available
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Price:</span>
                      <div className="text-right">
                        {item.sizeVariant.discountPrice ? (
                          <div>
                            <span className="line-through text-gray-400 mr-1">
                              Rs. {item.price}
                            </span>
                            <span className="text-green-600">
                              Rs. {item.sizeVariant.discountPrice}
                            </span>
                          </div>
                        ) : (
                          <>Rs. {item.price}</>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Quantity:</span>
                      <div className="flex">
                        <button
                          className="px-2 py-1 border border-gray-300 rounded-l"
                          onClick={() =>
                            updateQuantity(item, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-4 py-1 border-t border-b border-gray-300">
                          {item.quantity}
                        </span>
                        <button
                          className="px-2 py-1 border border-gray-300 rounded-r"
                          onClick={() =>
                            updateQuantity(item, item.quantity + 1)
                          }
                          disabled={
                            item.quantity >= item.sizeVariant.stockCount
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Subtotal:</span>
                      <span>
                        Rs.{" "}
                        {(
                          (item.sizeVariant.discountPrice || item.price) *
                          item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveClick(item)}
                      className="text-red-500 text-sm hover:underline w-full text-center mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Summary */}
        {cartItems.length > 0 && (
          <div className="mt-10 flex flex-col lg:flex-row justify-between gap-8">
            <div className="w-full lg:w-1/2">
            </div>

            <div className="w-full lg:w-1/2 flex flex-col items-end gap-4">
              <div className="w-full text-right">
                <p className="text-lg font-semibold">
                  Subtotal: Rs. {calculateSubtotal().toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  Tax included. Shipping and discounts calculated at checkout.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:justify-end">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                  <button
                    onClick={() => navigate("/checkout")}
                    className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition duration-200 w-full sm:w-auto text-center"
                  >
                    CHECKOUT
                  </button>

                  <Link
                    to="/products"
                    className="inline-block border border-red-500 text-red-500 px-6 py-3 rounded-md hover:bg-red-500 hover:text-white transition duration-200 w-full sm:w-auto text-center"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shop More Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-serif text-center mb-8">Shop More</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Latest Unstitched Suit Fabrics",
                products: 212,
                img: "https://paulsonsonline.com/cdn/shop/files/VIP_8327Final_540x.jpg?v=1742474299",
              },
              {
                title: "Latest Designer Sarees",
                products: 27,
                img: "https://paulsonsonline.com/cdn/shop/files/VIP_7660Final_540x.jpg?v=1742474555",
              },
              {
                title: "Bestsellers",
                products: 23,
                img: "https://paulsonsonline.com/cdn/shop/files/VIP_8831Final_540x.jpg?v=1742474719",
              },
            ].map(({ title, products, img }, index) => (
              <Link
                to="/products"
                className="group relative overflow-hidden rounded-lg shadow-md"
                key={index}
              >
                <img
                  src={img}
                  alt={title}
                  className="w-full h-[300px] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-white text-center">
                    <h3 className="text-xl font-medium">{title}</h3>
                    <p className="text-sm">{products} products</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />

      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmRemoveItem}
        message="Do you really want to remove this item from your cart?"
      />
    </>
  );
};

export default Cart;

import Header from "../components/header";
import Footer from "../components/footer";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchWishlistItems, removeFromWishlist } from "../redux/slices/wishlistSlice";
import { addToCart } from "../redux/slices/cartSlice";
import { toast } from "react-toastify";

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items: wishlistItems, loading, error } = useSelector((state) => state.wishlist);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    dispatch(fetchWishlistItems());
  }, [dispatch]);

  const confirmRemoveFromWishlist = (item) => {
    setSelectedItem(item);
    setModalAction("remove");
    setModalOpen(true);
  };

  const confirmAddToCart = (item) => {
    setSelectedItem(item);
    setModalAction("addToCart");
    setModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedItem) return;

    try {
      if (modalAction === "remove") {
        await dispatch(removeFromWishlist({
          productId: selectedItem.product._id,
          variantId: selectedItem.variant._id,
          sizeVariantId: selectedItem.sizeVariant._id,
        })).unwrap();
        toast.success("Item removed from wishlist");
      }

      if (modalAction === "addToCart") {
        await dispatch(addToCart({
          productId: selectedItem.product._id,
          quantity: 1,
          variantId: selectedItem.variant._id,
          sizeVariantId: selectedItem.sizeVariant._id,
        })).unwrap();

        await dispatch(removeFromWishlist({
          productId: selectedItem.product._id,
          variantId: selectedItem.variant._id,
          sizeVariantId: selectedItem.sizeVariant._id,
        })).unwrap();

        toast.success("Item added to cart and removed from wishlist");
      }
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    }

    setModalOpen(false);
    setSelectedItem(null);
    setModalAction(null);
  };

  const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-sm mx-4">
          <h2 className="text-lg font-semibold mb-2">{title}</h2>
          <p className="text-sm text-gray-600 mb-4">{message}</p>
          <div className="flex justify-end gap-2">
            <button onClick={onCancel} className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">
              Cancel
            </button>
            <button onClick={onConfirm} className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600">
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-screen pt-28">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 pt-28 pb-8 max-w-7xl">
          <p className="text-red-500 text-center">{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  const wishlistData = wishlistItems || [];

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 pt-28 pb-8 max-w-7xl mt-10">
        <h1 className="text-3xl font-serif text-center mb-8">Your Wishlist</h1>

        {wishlistData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Your wishlist is empty</p>
            <Link to="/products" className="text-red-500 hover:text-red-600 text-sm">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wishlistData.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 flex flex-col sm:flex-row gap-4 shadow-sm">
                <img
                  src={item.variant?.mainImage}
                  alt={item.product?.name}
                  className="w-full sm:w-32 h-40 object-contain rounded"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-base mb-1">{item.product?.name}</h3>
                    <p className="text-sm text-gray-500">
                      Size: {item.sizeVariant?.size} | Color:
                      <span
                        className="inline-block w-4 h-4 rounded-full border ml-1 align-middle"
                        style={{ backgroundColor: item.variant?.color }}
                      />
                    </p>
                    <p className="text-sm mt-2">
                      Price:{" "}
                      <span className="font-semibold">
                        Rs. {(item.sizeVariant?.discountPrice || item.sizeVariant?.price || 0).toFixed(2)}
                      </span>
                    </p>
                    <p className={`text-sm mt-1 ${item.sizeVariant?.stockCount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {item.sizeVariant?.stockCount > 0 ? `${item.sizeVariant.stockCount} in stock` : "Out of stock"}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => confirmAddToCart(item)}
                      className="bg-[#010135] text-[#FFF5CC] px-4 py-2 rounded text-sm hover:bg-gray-800"
                      disabled={!item.sizeVariant?.stockCount}
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => confirmRemoveFromWishlist(item)}
                      className="text-red-500 px-4 py-2 rounded text-sm hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-serif text-center mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/products" className="group">
              <div className="relative overflow-hidden rounded-lg shadow">
                <img
                  src="https://paulsonsonline.com/cdn/shop/files/VIP_8327Final_540x.jpg?v=1742474299"
                  alt="Latest Unstitched Suit Fabrics"
                  className="w-full h-[300px] object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-medium mb-2">Latest Unstitched Suit Fabrics</h3>
                    <p className="text-sm">212 products</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="/products" className="group">
              <div className="relative overflow-hidden rounded-lg shadow">
                <img
                  src="https://paulsonsonline.com/cdn/shop/files/VIP_7660Final_540x.jpg?v=1742474555"
                  alt="Trending Collections"
                  className="w-full h-[300px] object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-medium mb-2">Trending Collections</h3>
                    <p className="text-sm">185 products</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="/products" className="group">
              <div className="relative overflow-hidden rounded-lg shadow">
                <img
                  src="https://paulsonsonline.com/cdn/shop/files/VIP_8327Final_540x.jpg?v=1742474299"
                  alt="New Arrivals"
                  className="w-full h-[300px] object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-medium mb-2">New Arrivals</h3>
                    <p className="text-sm">156 products</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        title={modalAction === "remove" ? "Remove Item" : "Add to Cart"}
        message={
          modalAction === "remove"
            ? "Are you sure you want to remove this item from your wishlist?"
            : "Do you want to add this item to your cart and remove it from wishlist?"
        }
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setModalOpen(false);
          setSelectedItem(null);
          setModalAction(null);
        }}
      />

      <Footer />
    </>
  );
};

export default Wishlist;

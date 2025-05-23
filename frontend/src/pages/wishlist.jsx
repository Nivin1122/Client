import Header from "../components/header";
import Footer from "../components/footer";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchWishlistItems, removeFromWishlist } from "../redux/slices/wishlistSlice";
import { addToCart } from "../redux/slices/cartSlice";
import { toast } from "react-toastify";

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items: wishlistItems, loading, error } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlistItems());
  }, [dispatch]);

  const handleRemoveFromWishlist = async (item) => {
    if (window.confirm('Are you sure you want to remove this item from your wishlist?')) {
      try {
        await dispatch(removeFromWishlist({
          productId: item.product._id,
          variantId: item.variant._id,
          sizeVariantId: item.sizeVariant._id,
        })).unwrap();
        toast.success("Item removed from wishlist");
      } catch (error) {
        toast.error(error || "Failed to remove item from wishlist");
      }
    }
  };

  const handleAddToCart = async (item) => {
    try {
      await dispatch(addToCart({
        productId: item.product._id,
        quantity: 1,
        variantId: item.variant._id,
        sizeVariantId: item.sizeVariant._id,
      })).unwrap();
      
      // Remove from wishlist after successfully adding to cart
      await handleRemoveFromWishlist(item);
      toast.success("Item added to cart and removed from wishlist");
    } catch (error) {
      toast.error(error || "Failed to add item to cart");
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 pt-28 pb-8 max-w-7xl flex justify-center items-center min-h-screen">
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
      <div className="container mx-auto px-4 pt-28 pb-8 max-w-7xl">
        <h1 className="text-3xl font-serif text-center mb-8 mt-5">Your Wishlist</h1>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-4 font-normal">Product</th>
                <th className="text-right pb-4 font-normal">Price</th>
                <th className="text-center pb-4 font-normal">Stock Status</th>
                <th className="text-right pb-4 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wishlistData.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={item.variant?.mainImage}
                        alt={item.product?.name}
                        className="w-24 h-24 object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-sm mb-1">{item.product?.name}</h3>
                        <p className="text-sm text-gray-500">
                          Size: {item.sizeVariant?.size} | Color: 
                          <span className="inline-block w-4 h-4 rounded-full border ml-1 align-middle" 
                                style={{ backgroundColor: item.variant?.color }} />
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-4">
                    <span className="whitespace-nowrap">
                      Rs. {(item.sizeVariant?.discountPrice || item.sizeVariant?.price || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="text-center py-4">
                    <span className={`text-sm ${item.sizeVariant?.stockCount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.sizeVariant?.stockCount > 0 ? `${item.sizeVariant.stockCount} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="text-right py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
                        disabled={!item.sizeVariant?.stockCount}
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemoveFromWishlist(item)}
                        className="text-red-500 px-4 py-2 rounded text-sm hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {wishlistItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Your wishlist is empty</p>
            <Link
              to="/products"
              className="text-red-500 hover:text-red-600 text-sm"
            >
              Continue shopping
            </Link>
          </div>
        )}

        {/* Related Products Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-serif text-center mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/products" className="group">
              <div className="relative overflow-hidden">
                <img
                  src="https://paulsonsonline.com/cdn/shop/files/VIP_8327Final_540x.jpg?v=1742474299"
                  alt="Latest Unstitched Suit Fabrics"
                  className="w-full h-[300px] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-medium mb-2">
                      Latest Unstitched Suit Fabrics
                    </h3>
                    <p className="text-sm">212 products</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/products" className="group">
              <div className="relative overflow-hidden">
                <img
                  src="https://paulsonsonline.com/cdn/shop/files/VIP_7660Final_540x.jpg?v=1742474555"
                  alt="Trending Collections"
                  className="w-full h-[300px] object-cover transition-transform duration-300 group-hover:scale-105"
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
              <div className="relative overflow-hidden">
                <img
                  src="https://paulsonsonline.com/cdn/shop/files/VIP_8327Final_540x.jpg?v=1742474299"
                  alt="New Arrivals"
                  className="w-full h-[300px] object-cover transition-transform duration-300 group-hover:scale-105"
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
      <Footer />
    </>
  );
};

export default Wishlist;
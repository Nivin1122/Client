import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";
import { addToWishlist } from "../../redux/slices/wishlistSlice";
import { toast } from "react-toastify";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../../components/ui/carousel";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProductDetail = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [error, setError] = useState(null);
  const [sizes, setSizes] = useState([]);
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  // Fetch product details and variants
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);

        // Fetch product details
        const productResponse = await axios.get(
          `https://client-1-6rax.onrender.com/api/products/${id}/details`
        );
        setProduct(productResponse.data.product);

        // Fetch variants
        const variantsResponse = await axios.get(
          `https://client-1-6rax.onrender.com/api/variants/variant/get/${id}`
        );
        setVariants(variantsResponse.data.variants);

        // Set default selected variant to the first one with available sizes
        const firstVariantWithSizes = variantsResponse.data.variants.find(
          (v) => v.sizes && v.sizes.length > 0
        );

        if (firstVariantWithSizes) {
          setSelectedVariant(firstVariantWithSizes);

          // Fetch sizes for the selected variant
          const sizesResponse = await axios.get(
            `https://client-1-6rax.onrender.com/api/sizes/sizes/${firstVariantWithSizes._id}`
          );

          // Ensure we're working with an array
          const sizeVariants = Array.isArray(sizesResponse.data.sizeVariants)
            ? sizesResponse.data.sizeVariants
            : [sizesResponse.data.sizeVariants];

          setSizes(sizeVariants);

          // Find the first available size (in stock)
          const firstAvailableSize = sizeVariants.find((size) => size.inStock);

          // Set selected size - prefer an in-stock size if available
          setSelectedSize(firstAvailableSize || sizeVariants[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching product data:", err);
        setError("Failed to load product details. Please try again later.");
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  // Handle variant selection
  const handleVariantSelect = async (variant) => {
    setSelectedVariant(variant);
    setSelectedImage(0);
    setSelectedSize(null);

    try {
      const response = await axios.get(
        `https://client-1-6rax.onrender.com/api/sizes/sizes/${variant._id}`
      );

      const sizeVariants = Array.isArray(response.data.sizeVariants)
        ? response.data.sizeVariants
        : [response.data.sizeVariants];

      setSizes(sizeVariants);

      // Find the first available size (in stock) for the new variant
      const firstAvailableSize = sizeVariants.find((size) => size.inStock);
      setSelectedSize(firstAvailableSize || sizeVariants[0]);
    } catch (err) {
      console.error("Error fetching sizes:", err);
      setSizes([]);
    }
  };

  const handleRelatedProductClick = (variant) => {
    // Update the selected variant
    setSelectedVariant(variant);
    setSelectedImage(0);
    setSelectedSize(null);

    // Fetch sizes for the selected variant
    const fetchSizes = async () => {
      try {
        const response = await axios.get(
          `https://client-1-6rax.onrender.com/api/sizes/sizes/${variant._id}`
        );
        const sizeVariants = Array.isArray(response.data.sizeVariants)
          ? response.data.sizeVariants
          : [response.data.sizeVariants];
        setSizes(sizeVariants);

        // Find the first available size (in stock)
        const firstAvailableSize = sizeVariants.find((size) => size.inStock);
        setSelectedSize(firstAvailableSize || sizeVariants[0]);
      } catch (err) {
        console.error("Error fetching sizes:", err);
        setSizes([]);
      }
    };

    fetchSizes();
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) return navigate("/login");
    if (!selectedSize || !selectedVariant) {
      toast.error("Please select a size to continue");
      return;
    }

    // Create checkout item data
    const checkoutItem = {
      product: product,
      variant: selectedVariant,
      sizeVariant: selectedSize,
      quantity: quantity,
      _id: `direct_${Date.now()}`, // Temporary ID for direct purchase
    };

    // Navigate to checkout with the product data
    navigate("/checkout", {
      state: {
        directPurchase: true,
        checkoutItem: checkoutItem,
      },
    });
  };

  // Handle mouse move for zoom effect
  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  // Quantity handlers
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  // If loading, show loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="container max-w-screen-xl mx-auto px-4 pt-32 pb-8 flex justify-center items-center h-screen">
          <div className="text-center">
            <div
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
            <p className="mt-4">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <>
        <Header />
        <div className="container max-w-screen-xl mx-auto px-4 pt-32 pb-8 flex justify-center items-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p>{error}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // If no product data, show not found state
  if (!product) {
    return (
      <>
        <Header />
        <div className="container max-w-screen-xl mx-auto px-4 pt-32 pb-8 flex justify-center items-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p>
              The product you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Get current variant's images
  const currentVariantImages = selectedVariant
    ? [selectedVariant.mainImage, ...selectedVariant.subImages]
    : [];

  // Get formatted price
  const formatPrice = (price) => {
    return price ? `Rs. ${price.toLocaleString("en-IN")}` : "";
  };

  // Get discount percentage
  const getDiscountPercentage = (price, discountPrice) => {
    if (!price || !discountPrice) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  return (
    <>
      <Header />
      <div className="container max-w-screen-xl mx-auto px-4 pt-32 pb-8 mt-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <a href="/" className="hover:underline">
            Home
          </a>
          <span>/</span>
          <a
            href={`/category/${product.category?._id}`}
            className="hover:underline"
          >
            {product.category?.name}
          </a>
          <span>/</span>
          <span className="text-gray-500">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="relative">
            {selectedVariant && (
              <>
                <div
                  className="relative w-full h-[500px] overflow-hidden cursor-crosshair"
                  onMouseEnter={() => setShowZoom(true)}
                  onMouseLeave={() => setShowZoom(false)}
                  onMouseMove={handleMouseMove}
                >
                  <img
                    src={
                      currentVariantImages[selectedImage] ||
                      "/placeholder-image.jpg"
                    }
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                  {showZoom && (
                    <div
                      className="absolute right-0 top-0 w-[500px] h-[500px] border border-gray-200 overflow-hidden bg-white"
                      style={{
                        backgroundImage: `url(${
                          currentVariantImages[selectedImage] ||
                          "/placeholder-image.jpg"
                        })`,
                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        backgroundSize: "200%",
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                  )}
                </div>

                {/* Thumbnail Carousel */}
                <div className="mt-4 relative w-full">
                  <Carousel
                    opts={{
                      align: "center",
                      loop: true,
                      dragFree: false,
                      skipSnaps: false,
                      containScroll: "trimSnaps",
                      slidesToScroll: 1,
                    }}
                    className="w-full max-w-[300px] mx-auto"
                  >
                    <CarouselContent className="gap-1 transition-transform duration-0 ease-in-out">
                      {currentVariantImages.map((image, index) => (
                        <CarouselItem
                          key={index}
                          className="basis-1/5 min-w-[80px]"
                        >
                          <div
                            className={`w-20 h-20 cursor-pointer border-2 ${
                              selectedImage === index
                                ? "border-black shadow-lg"
                                : "border-transparent"
                            } hover:border-gray-300 transition-colors rounded-sm overflow-hidden`}
                            onClick={() => setSelectedImage(index)}
                          >
                            <img
                              src={image}
                              alt={`Product view ${index + 1}`}
                              className="w-20 h-20 object-contain"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="-left-4" />
                    <CarouselNext className="-right-4" />
                  </Carousel>
                </div>
              </>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-green-500 text-white inline-block px-3 py-1 text-xs mb-4 rounded-full">
              {product.createdAt &&
              new Date(product.createdAt).getTime() >
                Date.now() - 20 * 24 * 60 * 60 * 1000
                ? "New In"
                : "Featured"}
            </div>
            <h1 className="text-3xl font-medium mb-4">{product.name}</h1>

            {selectedSize ? (
              <div className="flex items-center gap-4 mb-2">
                <p className="text-2xl font-medium">
                  {formatPrice(selectedSize.discountPrice)}
                </p>
                <p className="text-lg text-gray-500 line-through">
                  {formatPrice(selectedSize.price)}
                </p>
                <p className="text-green-600 text-lg">
                  {getDiscountPercentage(
                    selectedSize.price,
                    selectedSize.discountPrice
                  )}
                  % off
                </p>
              </div>
            ) : (
              <p className="text-2xl mb-2">Select a size to see price</p>
            )}

            {/* Color Selector */}
            {variants.length > 0 && (
              <div className="mb-6">
                <p className="font-medium mb-2">
                  Color: {selectedVariant?.color}
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => (
                    <div
                      key={variant._id}
                      className={`cursor-pointer border-2 rounded-md p-1 ${
                        selectedVariant?._id === variant._id
                          ? "border-black"
                          : "border-gray-200"
                      } hover:border-gray-400 transition-all`}
                      onClick={() => handleVariantSelect(variant)}
                    >
                      <img
                        src={variant.colorImage}
                        alt={variant.color}
                        className="w-14 h-14 object-cover"
                      />
                      <div className="text-center text-xs mt-1">
                        {variant.color}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="mb-6">
                {sizes[0].size && <p className="font-medium mb-2">Size</p>}
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) =>
                    size.size ? (
                      <div
                        key={size._id}
                        className={`cursor-pointer border-2 rounded-md px-3 py-1.5 ${
                          selectedSize?._id === size._id
                            ? "border-black bg-gray-100"
                            : "border-gray-200"
                        } hover:border-gray-400 transition-all ${
                          !size.inStock ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={() => size.inStock && setSelectedSize(size)}
                      >
                        <div className="text-sm">{size.size}</div>
                        {!size.inStock && (
                          <div className="text-xs text-red-500">
                            Out of stock
                          </div>
                        )}
                      </div>
                    ) : (
                      ""
                    )
                  )}
                </div>
                {selectedSize && (
                  <div className="mt-2 text-sm">
                    {selectedSize.inStock ? (
                      <div className="text-green-600 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                        In Stock ({selectedSize.stockCount} available)
                      </div>
                    ) : (
                      <div className="text-red-500 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Out of Stock
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm">Quantity</label>
              <div className="flex items-center border border-gray-300">
                <button
                  onClick={() => {
                    if (!isAuthenticated) return navigate("/login");
                    decreaseQuantity();
                  }}
                  className="px-3 py-2 hover:bg-gray-100"
                  disabled={!selectedSize?.inStock || !isAuthenticated}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  min="1"
                  max={selectedSize?.stockCount || 1}
                  onChange={(e) => {
                    if (!isAuthenticated) return navigate("/login");
                    setQuantity(parseInt(e.target.value) || 1);
                  }}
                  className="w-12 text-center border-x border-gray-300"
                  disabled={!selectedSize?.inStock || !isAuthenticated}
                />
                <button
                  onClick={() => {
                    if (!isAuthenticated) return navigate("/login");
                    increaseQuantity();
                  }}
                  className="px-3 py-2 hover:bg-gray-100"
                  disabled={
                    !selectedSize?.inStock ||
                    quantity >= (selectedSize?.stockCount || 1) ||
                    !isAuthenticated
                  }
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                className="w-full border-2 border-black bg-transparent text-black py-6 text-lg hover:bg-black hover:text-white transition-colors"
                disabled={
                  !selectedSize?.inStock || addingToCart || !isAuthenticated
                }
                onClick={async () => {
                  if (!isAuthenticated) return navigate("/login");
                  if (!selectedSize || !selectedVariant) return;
                  setAddingToCart(true);
                  try {
                    await dispatch(
                      addToCart({
                        productId: product._id,
                        variantId: selectedVariant._id,
                        sizeVariantId: selectedSize._id,
                        quantity: quantity,
                      })
                    );
                    toast.success("Added to cart successfully");
                  } catch (error) {
                    console.error("Error adding to cart:", error);
                    toast.error(error?.message || "Failed to add to cart");
                  } finally {
                    setAddingToCart(false);
                  }
                }}
              >
                {addingToCart ? "ADDING..." : "ADD TO CART"}
              </Button>

              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-black text-white py-6 text-lg hover:bg-black/90"
                  disabled={!selectedSize?.inStock || !isAuthenticated}
                  onClick={handleBuyNow} // Updated handler
                >
                  BUY IT NOW
                </Button>

                <Button
                  className="flex-1 border-2 border-red-500 bg-transparent text-red-500 py-6 text-lg hover:bg-red-500 hover:text-white transition-colors"
                  disabled={!selectedSize?.inStock || !isAuthenticated}
                  onClick={async () => {
                    if (!isAuthenticated) return navigate("/login");
                    if (!selectedSize || !selectedVariant) return;
                    try {
                      await dispatch(
                        addToWishlist({
                          productId: product._id,
                          variantId: selectedVariant._id,
                          sizeVariantId: selectedSize._id,
                        })
                      ).unwrap();
                      toast.success("Added to wishlist successfully");
                    } catch (error) {
                      toast.error(error || "Failed to add to wishlist");
                    }
                  }}
                >
                  ADD TO WISHLIST
                </Button>
              </div>

              {!isAuthenticated && (
                <p className="text-sm text-red-500 mt-2 text-center">
                  Please{" "}
                  <span
                    className="underline cursor-pointer"
                    onClick={() => navigate("/login")}
                  >
                    authenticate
                  </span>{" "}
                  to purchase or save items.
                </p>
              )}
            </div>

            {/* Product Details */}
            <div className="mt-8 space-y-4">
              <div className="border rounded-lg">
                <button
                  onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                  className="w-full flex justify-between items-center p-4 font-medium"
                >
                  <span>Product Details</span>
                  <span
                    className={`transform transition-transform ${
                      isDetailsOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {isDetailsOpen && (
                  <div className="p-4 border-t">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {product.material && (
                        <div>
                          <p className="font-medium">Material</p>
                          <p>{product.material}</p>
                        </div>
                      )}
                      {product.pattern && (
                        <div>
                          <p className="font-medium">Pattern</p>
                          <p>{product.pattern}</p>
                        </div>
                      )}
                      {product.gender && (
                        <div>
                          <p className="font-medium">Gender</p>
                          <p>{product.gender}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm">{product.description}</p>
                    {selectedSize?.description && (
                      <div className="mt-4">
                        <p className="font-medium">Size Details</p>
                        <p className="text-sm">{selectedSize.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border rounded-lg">
                <button
                  onClick={() => setIsReturnOpen(!isReturnOpen)}
                  className="w-full flex justify-between items-center p-4 font-medium"
                >
                  <span>Return and Exchange</span>
                  <span
                    className={`transform transition-transform ${
                      isReturnOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {isReturnOpen && (
                  <div className="p-4 border-t">
                    <div className="text-sm space-y-2">
                      <p>Our Return & Exchange Policy:</p>
                      <ul className="list-disc list-inside">
                        <li>Returns accepted within 7 days of delivery</li>
                        <li>Item must be unworn and in original condition</li>
                        <li>Original tags must be attached</li>
                        <li>Shipping costs are non-refundable</li>
                      </ul>
                      <p className="mt-2">
                        For more information, please read our{" "}
                        <a
                          href="/privacy-policy"
                          className="text-blue-600 hover:underline"
                        >
                          Privacy Policy
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-medium mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {variants &&
              variants.slice(0, 4).map((variant, index) => (
                <div
                  key={variant?._id || index}
                  className="group cursor-pointer"
                  onClick={() => handleRelatedProductClick(variant)}
                >
                  <div className="aspect-square overflow-hidden bg-gray-100 mb-4">
                    <img
                      src={variant.mainImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-sm font-medium mb-2 group-hover:underline">
                    {product.name} - {variant.color}
                  </h3>
                  <div className="flex items-center gap-2">
                    {variant.sizes && variant.sizes[0] && (
                      <>
                        <p className="text-sm font-medium">
                          {formatPrice(variant.sizes[0].discountPrice)}
                        </p>
                        {variant.sizes[0].price >
                          variant.sizes[0].discountPrice && (
                          <p className="text-sm text-gray-500 line-through">
                            {formatPrice(variant.sizes[0].price)}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetail;

import Header from "../components/header";
import Slider from "../components/slider";
import Categories from "../components/categories";
import NewArrivals from "../components/newArrivals";
import Bestsellers from "../components/bestSeller";
import ExclusiveItems from "../components/exclusiveItems";
import LatestDesigns from "../components/latestDesigns";
import FeaturedCollections from "../components/featuredCollections";
import CustomerReviewCarousel from "../components/customerReviews";
import OurStores from "../components/stores";
import Footer from "../components/footer";

function Home() {
  return (
    <>
      <Header />

      {/* Main content with consistent padding */}
      <div className="px-4 md:px-8 lg:px-16 xl:px-24 space-y-16">
        <Slider />
        <Categories />
        <NewArrivals />
        <Bestsellers />
        <ExclusiveItems />
        <LatestDesigns />
        <FeaturedCollections />
        <CustomerReviewCarousel />
        <OurStores />
      </div>

      <Footer />
    </>
  );
}

export default Home;

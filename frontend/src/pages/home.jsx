// Hom
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
      <Slider />
      <Categories />
      <NewArrivals />
      <Bestsellers />
      <ExclusiveItems />
      <LatestDesigns />
      <FeaturedCollections />
      <CustomerReviewCarousel />
      <OurStores />
      <Footer />
    </>
  );
}

export default Home;

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
import AnnouncementMarquee from '../components/anouncement'

function Home() {
  return (
    <>
      <Header />

      {/* Main content with consistent padding */}
      <div className="  space-y-16">
        <Slider />
        <Categories />
        <NewArrivals />
        <Bestsellers />
        <ExclusiveItems />
        <LatestDesigns />
      </div>
      <div className="mb-5">
        <OurStores />
      </div>
      <Footer />
    </>
  );
}

export default Home;

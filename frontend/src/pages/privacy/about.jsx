import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const About = () => {
  return (
    <>
      <Header />

      <div className="mt-36 px-6 max-w-6xl mx-auto text-gray-800">
        {/* Intro Section */}
        <section className="text-center mb-16">
          <h1 className="text-3xl font-bold mb-4">Emirah Fashion</h1>
          <p className="text-lg leading-7">
            Welcome to Emirah Fashion, your ultimate destination for elegant and
            trendy apparel in Trivandrum. We specialize in Party Wear, Casuals,
            Sarees, and Kurtis, offering a diverse collection that blends
            tradition with modern style. At Emirah Fashion, we believe that
            fashion is for everyone. We are dedicated to making confident,
            comfortable, and budget-friendly fashion accessible for all. Whether
            it’s grand celebrations, a casual day out, or a moment that calls
            for timeless elegance, Emirah helps you shine. With a focus on
            quality craftsmanship, unique designs, and affordable fashion, we
            ensure that every piece you choose reflects the beauty and
            sophistication you deserve.
          </p>
        </section>

        {/* Mission & Vision Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start mb-20">
          {/* Mission */}
          <div>
            <img
              src="https://emirah.in/images/about1.jpg"
              alt="Mission"
              className=" w-full h-auto object-cover"
            />
            <h2 className="text-xl font-semibold mt-4 mb-2">Our Mission</h2>
            <p>
              We are committed to revolutionizing fashion through a balance of
              top-quality, stylish, and sustainable clothing. Emirah embraces
              modern fashion while honoring cultural roots, empowering people to
              express themselves freely and confidently.
            </p>
          </div>

          {/* Vision */}
          <div>
            <img
              src="https://emirah.in/images/about2.jpg"
              alt="Vision"
              className="w-full h-auto object-cover"
            />
            <h2 className="text-xl font-semibold mt-4 mb-2">Our Vision</h2>
            <p>
              To become a trusted fashion destination in Trivandrum and beyond.
              Driven by our commitment to quality, inclusiveness, and ethical
              fashion, Emirah envisions a future where sustainable fashion
              becomes the norm. Our goal is to inspire joyful self-expression
              and enable everyone to feel stylish and confident.
            </p>
          </div>
        </section>

        {/* Quality Section */}
        <section className="bg-[#f9f7f6] py-20 rounded-2xl mb-20">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Quality is Our Priority
            </h2>
            <p className="text-gray-600 text-lg mb-12 max-w-2xl mx-auto">
              Our talented stylists have curated outfits that are perfect for
              every season. Discover a variety of ways to inspire your next
              fashion-forward look.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                <div className="text-4xl mb-4">🧵</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  High-Quality Materials
                </h3>
                <p className="text-gray-600 text-sm">
                  Crafted with premium materials and meticulous attention to
                  detail, ensuring superior comfort and durability.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                <div className="text-4xl mb-4">🧥</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Laconic Design
                </h3>
                <p className="text-gray-600 text-sm">
                  Minimalist yet stylish design that delivers effortless
                  elegance for every occasion.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                <div className="text-4xl mb-4">📏</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Various Sizes
                </h3>
                <p className="text-gray-600 text-sm">
                  Designed for every body type and every moment, celebrating
                  diversity and the beauty of all women.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="text-center mb-16">
          <h2 className="text-2xl font-bold mb-6">Happy Clients</h2>
          <Carousel
            autoPlay
            infiniteLoop
            showStatus={false}
            showThumbs={false}
            showIndicators={false}
            className="max-w-3xl mx-auto"
          >
            <div className="p-6 bg-white shadow-md rounded-lg">
              <p className="text-lg font-medium mb-2">
                Best Online Fashion Site
              </p>
              <p className="text-sm text-gray-600">
                "I always find something stylish and affordable on this new
                fashion site."
              </p>
              <p className="mt-3 font-semibold text-sm">- Nandini Sethi</p>
            </div>
            <div className="p-6 bg-white shadow-md rounded-lg">
              <p className="text-lg font-medium mb-2">
                Great Selection and Quality
              </p>
              <p className="text-sm text-gray-600">
                "I love the variety of styles and the high-quality clothing on
                this new fashion site."
              </p>
              <p className="mt-3 font-semibold text-sm">- Alina Lee</p>
            </div>
            <div className="p-6 bg-white shadow-md rounded-lg">
              <p className="text-lg font-medium mb-2">Best Customer Service</p>
              <p className="text-sm text-gray-600">
                "I finally found a web fashion site with stylish and flattering
                options in my size."
              </p>
              <p className="mt-3 font-semibold text-sm">- Priya Rajan</p>
            </div>
          </Carousel>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default About;

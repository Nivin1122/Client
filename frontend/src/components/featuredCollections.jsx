import React from "react";
import exclusive from "../assets/bestseller.png";

const FeaturedCollections = () => {
  const collections = [
    {
      title: "Gifts for her",
      image: exclusive,
    },
    {
      title: "Fine casuals",
      image: exclusive,
    },
    {
      title: "Artisanal collectives",
      image: exclusive,
    },
    {
      title: "Fine ikat unstitched",
      image: exclusive,
    },
  ];

  return (
    <div className="container mx-auto px-10 py-8">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
        Featured Collections
      </h2>
      <div className="grid grid-cols-2 gap-2 md:gap-[3%]">
        {collections.map((collection, index) => (
          <div key={index} className="relative mb-2 md:mb-2">
            <div className="h-[50vh] md:h-screen overflow-hidden">
              <img
                src={collection.image}
                alt={collection.title}
                className="w-full h-full object-cover cursor-pointer"
              />
            </div>
            <p className="text-sm md:text-1xl font-medium text-gray-500">
              {collection.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCollections;

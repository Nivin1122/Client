import React from 'react';

const AnnouncementMarquee = () => {
  const messages = [
    "TRUSTED BY 65,000+ CUSTOMERS",
    "NEW COLLECTIONS EVERY MONTH",
    "1 LAKH+ HAPPY DELIVERIES",
    "4.9 / 5 BASED ON 6,000+ REVIEWS"
  ];

  return (
    <div className="bg-[#001F3F] text-[#FFD700] py-2 overflow-hidden whitespace-nowrap">
      <div className="animate-marquee inline-block min-w-full">
        {messages.map((msg, index) => (
          <span key={index} className="mx-8 text-sm sm:text-base font-semibold">
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementMarquee;

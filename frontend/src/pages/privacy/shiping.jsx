import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

const Shipping = () => {
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-10 text-gray-800 mt-28">
        <h1 className="text-3xl font-bold mb-4 text-center">Shipping Policy</h1>
        <p className="text-sm text-center text-gray-600 mb-10">Effective Date: 10/01/2025</p>

        <p className="mb-6">
          At <strong>Emirah Fashion</strong>, we strive to ensure timely and secure delivery of your orders through our trusted partners, <strong>India Post</strong> and <strong>DTDC</strong>.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Shipping & Delivery Details</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Dispatch Time:</strong> Orders are dispatched within 24 to 36 hours.</li>
            <li><strong>Delivery Timeline:</strong> Delivery typically takes 4–7 days after dispatch.</li>
            <li><strong>Tracking:</strong> Tracking details will be emailed to you once your order is shipped.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Important Delivery Information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Please provide a <strong>valid contact number</strong> and <strong>PIN code</strong> during checkout to ensure accurate delivery.</li>
            <li>Our delivery partner will make <strong>three attempts</strong> to deliver your package before it is returned to us.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Track Your Order</h2>
          <p>
            You can <a href="#" className="text-blue-600 underline">track your order here</a> using the tracking ID provided in your shipping confirmation email.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Need Help?</h2>
          <p>If you have any questions about your delivery, please contact us:</p>
          <ul className="list-none mt-2 space-y-1">
            <li><strong>Email:</strong> <a href="mailto:info@emirah.in" className="text-blue-600 underline">info@emirah.in</a></li>
            <li><strong>Phone:</strong> +91 9947066664</li>
            <li><strong>Address:</strong> Emirah Fashion, Marian Enclave, Nanthancode, Trivandrum-695003</li>
            <li><strong>Hours:</strong> Monday to Saturday, 10:00 AM to 6:00 PM IST</li>
          </ul>
        </section>

        <p className="text-center text-sm text-gray-500 mt-10">
          Thank you for choosing Emirah Fashion. We look forward to serving you!
        </p>
      </div>
      <Footer />
    </>
  );
};

export default Shipping;

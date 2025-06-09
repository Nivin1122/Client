import Footer from '@/components/footer';
import Header from '@/components/header';
import React from 'react';

const ReturnAndRefunds = () => {
  return (
    <>
    <Header/>
    <div className="max-w-4xl mx-auto px-6 py-10 text-gray-800 mt-28">
      <h1 className="text-3xl font-bold mb-4 text-center">Return & Refund Policy</h1>
      <p className="text-sm text-center text-gray-600 mb-10">Effective Date: 10/01/2025</p>

      <p className="mb-6">
        At <strong>Emirah Fashion</strong>, we aim to provide you with the best shopping experience. However, exchanges or refunds are subject to the following conditions:
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Eligibility for Exchange</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Products on Sale:</strong> Items purchased on sale are not eligible for return unless there is a manufacturing defect.</li>
          <li><strong>Fabrics:</strong> Cut fabrics cannot be returned unless they have a manufacturing defect.</li>
          <li><strong>Stitched and Unstitched Suits:</strong> These are not eligible for return unless there is a manufacturing defect.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Genuine Manufacturing or Quality Defects</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Share a parcel opening video of the item with us via WhatsApp at <a href="https://wa.me/919947066664" className="text-blue-600 underline">+91 9947066664</a> immediately upon unpacking.</li>
          <li>Request a return within <strong>3 days</strong> of delivery.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Refund Eligibility</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Incorrect Deliveries:</strong> The wrong item was delivered.</li>
          <li><strong>Damaged Goods:</strong> The product arrived damaged.</li>
        </ul>
        <p className="mt-2">
          <strong>Note:</strong> Refunds or exchanges are not allowed for reasons such as color preferences or a change of mind.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How to Request a Return or Refund</h2>
        <p className="mb-2">If your purchase meets the return criteria:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Contact our customer care within 3 days of delivery.</li>
          <li>Provide the following details:
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li>Order Number</li>
              <li>Delivery Address</li>
              <li>Reason for Return (include images for defective or incorrect items)</li>
            </ul>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
        <p>If you have questions or need assistance regarding this policy, please contact us:</p>
        <ul className="list-none mt-2 space-y-1">
          <li><strong>Email:</strong> <a href="mailto:info@emirah.in" className="text-blue-600 underline">info@emirah.in</a></li>
          <li><strong>Phone:</strong> +91 9947066664</li>
          <li><strong>Address:</strong> Emirah Fashion, Marian Enclave, Nanthancode, Trivandrum-695003</li>
          <li><strong>Hours:</strong> Monday to Saturday, 10:00 AM to 6:00 PM IST</li>
        </ul>
      </section>

      <p className="text-center text-sm text-gray-500 mt-10">
        Our team will review your request and respond promptly. Thank you for shopping with Emirah Fashion.
      </p>
    </div>
    <Footer/>
    </>
  );
};

export default ReturnAndRefunds;

import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

const TermsAndConditions = () => {
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-10 text-gray-800 mt-20">
        <h1 className="text-3xl font-bold mb-4 text-center">Terms & Conditions</h1>
        <p className="text-sm text-center text-gray-600 mb-10">Effective Date: 10/01/2025</p>

        <p className="mb-6">
          Welcome to <strong>Emirah Fashion</strong>! These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our website, you agree to these Terms in full. If you disagree with any part of these Terms, please refrain from using our site.
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Key Definitions</h2>
          <p><strong>“We,” “Us,” and “Our”</strong> refer to Emirah Fashion.</p>
          <p><strong>“You” or “User”</strong> refers to anyone accessing or using our website, including customers, browsers, merchants, and contributors of content.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Online Store Terms</h2>
          <ul className="space-y-1 list-disc list-inside">
            <li>You confirm you are at least the age of majority or have consent from a legal guardian to use this site.</li>
            <li>You agree not to use our services or products for any illegal or unauthorized purposes.</li>
            <li>Any breach of these Terms will result in the immediate termination of your access to our services.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">General Conditions</h2>
          <ul className="space-y-1 list-disc list-inside">
            <li>We reserve the right to refuse service to anyone, at any time, for any reason.</li>
            <li>Your data (excluding payment information) may be transmitted unencrypted for compatibility with various networks or devices. Payment info will always be encrypted.</li>
            <li>You agree not to duplicate, resell, or exploit any part of our service without our express written consent.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Accuracy and Updates</h2>
          <ul className="space-y-1 list-disc list-inside">
            <li>Information on our site is for general purposes only and may not always be accurate or current.</li>
            <li>We may update, modify, or discontinue content without notifying you.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Pricing and Modifications</h2>
          <ul className="space-y-1 list-disc list-inside">
            <li>Prices are subject to change without notice.</li>
            <li>We may modify or discontinue the service or any part of it without notice.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Products and Services</h2>
          <ul className="space-y-1 list-disc list-inside">
            <li>Some products/services may be available exclusively online and in limited quantities.</li>
            <li>We strive to display product details accurately but cannot guarantee how they appear on your device.</li>
            <li>We reserve the right to limit quantities, sales, or services based on location or other criteria.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Billing and Account Information</h2>
          <ul className="space-y-1 list-disc list-inside">
            <li>We may cancel or limit orders that appear to violate our policies (e.g., bulk buying by resellers).</li>
            <li>You agree to provide accurate and updated transaction and communication information.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Third-Party Tools and Links</h2>
          <ul className="space-y-1 list-disc list-inside">
            <li>Access to third-party tools is provided "as is." We are not responsible for any liabilities.</li>
            <li>We are not responsible for third-party sites linked from our website. Please review their policies.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">User Submissions</h2>
          <ul className="space-y-1 list-disc list-inside">
            <li>By submitting content, you grant us the right to use it without restriction.</li>
            <li>Comments must not violate third-party rights, contain harmful content, or be misleading.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Errors and Omissions</h2>
          <p>We reserve the right to correct inaccuracies and cancel orders affected by such errors.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Prohibited Uses</h2>
          <ul className="space-y-1 list-disc list-inside">
            <li>Illegal activities, harassment, or discrimination.</li>
            <li>Uploading harmful code or attempting unauthorized access.</li>
            <li>Violating our intellectual property or other users' privacy.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Limitation of Liability</h2>
          <p>We do not guarantee uninterrupted service. Emirah Fashion is not liable for damages arising from your use, except where required by law.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Indemnification</h2>
          <p>You agree to indemnify and hold Emirah Fashion harmless from any claims resulting from your misuse or breach of these Terms.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Governing Law</h2>
          <p>These Terms are governed by the laws of India. Disputes will be handled under Indian jurisdiction.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Changes to Terms</h2>
          <p>We may revise these Terms at any time. Continued use of the website implies acceptance of the updated Terms.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
          <ul className="list-none mt-2 space-y-1">
            <li><strong>Email:</strong> <a href="mailto:info@emirah.in" className="text-blue-600 underline">info@emirah.in</a></li>
            <li><strong>Phone:</strong> +91 9947066664</li>
            <li><strong>Address:</strong> Emirah Fashion, Marian Enclave, Nanthancode, Trivandrum-695003</li>
            <li><strong>Hours:</strong> Monday to Saturday, 10:00 AM to 6:00 PM IST</li>
          </ul>
        </section>

        <p className="text-center text-sm text-gray-500">
          Thank you for choosing Emirah Fashion. We appreciate your trust and support.
        </p>
      </div>
      <Footer />
    </>
  );
};

export default TermsAndConditions;

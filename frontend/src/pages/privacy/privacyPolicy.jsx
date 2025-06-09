import Footer from "@/components/footer";
import Header from "@/components/header";
import React from "react";

const PrivacyPolicy = () => {
  return (
    <>
      <Header />
    <div className="max-w-4xl mx-auto px-6 py-10 text-gray-800 mt-10">
      <h1 className="text-3xl font-bold mb-4 text-center mt-20">
        Privacy Policy
      </h1>
      <p className="text-sm text-center text-gray-600 mb-10">
        Effective Date: 10/01/2025
      </p>

      <p className="mb-6">
        At <strong>Emirah Fashion</strong>, protecting your privacy is a top
        priority. This Privacy Policy outlines how we collect, use, and
        safeguard your personal information when you interact with our boutique,
        website, or other services. By engaging with Emirah Fashion, you agree
        to the terms described in this policy.
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Contact Information:</strong> Name, email address, phone
            number, and shipping/billing address.
          </li>
          <li>
            <strong>Payment Details:</strong> Payment card information when you
            make a purchase.
          </li>
          <li>
            <strong>Shopping Preferences:</strong> Style preferences, size
            details, and wishlist items (if shared).
          </li>
          <li>
            <strong>Usage Data:</strong> IP address, device details, and
            browsing behavior via cookies.
          </li>
          <li>
            <strong>Communication History:</strong> Inquiries, feedback, and
            interactions with our support team.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          How We Use Your Information
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Order Processing:</strong> To fulfill orders, manage
            payments, and handle delivery.
          </li>
          <li>
            <strong>Personalized Shopping:</strong> Recommend products, notify
            restocks, and improve offerings.
          </li>
          <li>
            <strong>Marketing:</strong> Share offers, promotions, and event
            invitations (with your consent).
          </li>
          <li>
            <strong>Customer Support:</strong> Address your inquiries or
            complaints promptly.
          </li>
          <li>
            <strong>Legal Compliance:</strong> To comply with laws or resolve
            disputes.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          How We Protect Your Information
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Data Encryption:</strong> Secure storage and transmission of
            sensitive data.
          </li>
          <li>
            <strong>Access Control:</strong> Limited access to personal data by
            authorized personnel.
          </li>
          <li>
            <strong>Monitoring:</strong> Regular updates and security checks to
            prevent unauthorized access.
          </li>
        </ul>
        <p className="mt-2">
          While we strive to protect your information, no system is entirely
          secure. Please keep your login credentials confidential.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Sharing Your Information</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Service Providers:</strong> Payment, shipping, and
            communication providers.
          </li>
          <li>
            <strong>Legal Requirements:</strong> If required by law or in legal
            proceedings.
          </li>
          <li>
            <strong>Business Transactions:</strong> In case of mergers,
            acquisitions, or transfers.
          </li>
        </ul>
        <p className="mt-2">
          We do not sell or rent your personal information to third parties.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Your Rights</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Access, correct, or delete your personal information.</li>
          <li>
            Opt-out of marketing communications via the "unsubscribe" link or by
            contacting us.
          </li>
          <li>Request details on how your data is processed and stored.</li>
        </ul>
        <p className="mt-2">
          To exercise your rights, contact us at{" "}
          <a href="mailto:info@emirah.in" className="text-blue-600 underline">
            info@emirah.in
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Cookies and Analytics</h2>
        <p className="mb-2">
          We use cookies and tracking technologies to improve your browsing
          experience:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Essential Cookies:</strong> Enable basic website
            functionality.
          </li>
          <li>
            <strong>Performance Cookies:</strong> Analyze and improve site
            performance.
          </li>
          <li>
            <strong>Marketing Cookies:</strong> Deliver personalized ads and
            promotions.
          </li>
        </ul>
        <p className="mt-2">
          You can manage or disable cookies through your browser settings.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Third-Party Links</h2>
        <p>
          Our website may contain links to external sites. We are not
          responsible for their privacy practices. Please review their policies
          independently.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Updates to This Privacy Policy
        </h2>
        <p>
          This policy may be updated periodically. Updates will be posted on our
          website with the revised effective date.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
        <p>
          If you have questions or need assistance regarding this Privacy
          Policy, please contact us:
        </p>
        <ul className="list-none mt-2 space-y-1">
          <li>
            <strong>Email:</strong>{" "}
            <a href="mailto:info@emirah.in" className="text-blue-600 underline">
              info@emirah.in
            </a>
          </li>
          <li>
            <strong>Phone:</strong> +91 9947066664
          </li>
          <li>
            <strong>Address:</strong> Emirah Fashion, Marian Enclave,
            Nanthancode, Trivandrum-695003
          </li>
        </ul>
      </section>

      <p className="text-center text-sm text-gray-500 mt-10">
        Thank you for choosing Emirah Fashion. We value your trust and strive to
        make your shopping experience delightful!
      </p>

    </div>
      <Footer/>
      </>
  );
};

export default PrivacyPolicy;

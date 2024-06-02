import React from "react";
import MarketingLayout from "../../(marketing)/layout"; // Ensure this path correctly points to your MarketingLayout

const TermsOfUsePage = () => {
  return (
    <MarketingLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold">Terms of Use</h1>
        <p className="mt-4">Last updated April 05, 2024</p>
        <p>Please read these Terms of Use ("Terms", "Terms of Use") carefully before using the ClubConnect application (the "Service") operated by Asger Analytics, LLC ("us", "we", or "our").</p>
        
        <h2 className="mt-4 mb-2 font-semibold">Intellectual Property</h2>
        <p>The Service and its original content, features, and functionality are and will remain the exclusive property of ClubConnect and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of ClubConnect.</p>
        
        <h2 className="mt-4 mb-2 font-semibold">Content</h2>
        <p>Our Service allows you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.</p>
        <p>By posting Content on or through the Service, you represent and warrant that: (i) the Content is yours (you own it) and/or you have the right to use it and the right to grant us the rights and license as provided in these Terms, and (ii) that the posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights, or any other rights of any person or entity. We reserve the right to terminate the account of anyone found to be infringing on a copyright.</p>
        
        <h2 className="mt-4 mb-2 font-semibold">Links To Other Web Sites</h2>
        <p>Our Service may contain links to third-party web sites or services that are not owned or controlled by ClubConnect. ClubConnect has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party web sites or services. You expressly relieve ClubConnect from any and all liability arising from your use of any third-party website.</p>
        
        <h2 className="mt-4 mb-2 font-semibold">Changes</h2>
        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice before any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
        
        <h2 className="mt-4 mb-2 font-semibold">Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@clubconnect.pro" className="text-blue-500 hover:underline">support@clubconnect.pro</a>.</p>
      </div>
    </MarketingLayout>
  );
};

export default TermsOfUsePage;

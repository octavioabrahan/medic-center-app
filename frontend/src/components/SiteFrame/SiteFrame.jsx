// src/components/SiteFrame/SiteFrame.jsx
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './SiteFrame.css';

/**
 * SiteFrame component that wraps content with a consistent header and footer.
 * 
 * Props:
 *   - children: JSX content to display in the main area
 */
const SiteFrame = ({ children }) => {
  return (
    <div className="site-frame">
      <Header />
      <main className="site-frame__content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default SiteFrame;

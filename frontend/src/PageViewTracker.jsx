// src/PageViewTracker.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-D0Z67LNZX5', {
        page_path: location.pathname,
      });
    }
  }, [location]);

  return null;
}

export default PageViewTracker;

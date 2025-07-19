import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// ScrollToTop ensures the page scrolls to the top smoothly when the route changes
const ScrollToTop = () => {
  const { pathname } = useLocation(); // get the current path

  useEffect(() => {
    // when pathname changes, scroll to the top of the page smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null; // this component doesn't render anything
};

export default ScrollToTop;

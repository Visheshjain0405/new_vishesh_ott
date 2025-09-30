import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../Components/Navbar";

export default function PublicLayout() {
  const { pathname, search } = useLocation();

  // scroll restore on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, search]);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Outlet />
    </div>
  );
}

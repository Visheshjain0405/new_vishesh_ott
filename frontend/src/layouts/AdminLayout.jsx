// src/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import AdminSidebar from "../Components/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        {/* Sticky full-height sidebar */}
        <aside className="hidden lg:block sticky top-0 h-screen">
          <AdminSidebar />
        </aside>

        {/* Content area – scrolls, with left margin equal to sidebar width on lg+ */}
        <main className="flex-1 min-h-screen lg:ml-64"> 
          {/* top border/shadow to separate visually */}
          <div className="bg-gray-900/40 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-gray-800/60" />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

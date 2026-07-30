import React from "react";
import ShopNav from "./ShopNav";

export default function ShopLayout({ children }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#17181c]">
      {/* The secondary navigation specific for Shop */}
      <ShopNav />
      {/* Page content */}
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
}

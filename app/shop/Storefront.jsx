"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MOCK_PRODUCTS } from "./storeData";

export default function Storefront() {
  const [activeTab, setActiveTab] = useState("Todas");

  const filteredProducts =
    activeTab === "Todas"
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((p) => p.category === activeTab);

  return (
    <div className="w-full flex flex-col items-center pb-20 pt-8">
      {/* Hero Section */}
      <section className="relative w-full min-h-[40vh] md:min-h-[50vh] flex flex-col items-center justify-center overflow-hidden mb-12 rounded-3xl">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a0a0a] to-[#111111]" />
        {/* Decorative ambient light */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30">
          <div className="w-[300px] h-[300px] bg-[#00aff0] rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 text-white"
          >
            EW Collection
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl font-light"
          >
            Wear the aesthetic. Piezas exclusivas diseñadas para elevar tu estilo.
          </motion.p>
        </div>
      </section>

      {/* Art Collection Banner */}
      <section className="w-full max-w-6xl px-4 mb-16">
        <div className="relative overflow-hidden rounded-2xl bg-[#1a1a1a] border border-white/10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 group transition-colors hover:border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex-1">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">Colección de Arte</h2>
            <p className="text-white/60 text-sm md:text-base mb-6 max-w-xl">
              Entra a una galería, abre la obra que te interese y pulsa <strong>«Adquirir para tu colección»</strong>. Cualquier interés de compra de piezas de arte se dirige automáticamente a este espacio.
            </p>
            <Link 
              href="/galeria" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-black font-semibold text-sm transition-transform hover:scale-105"
            >
              Explorar Galerías
            </Link>
          </div>
          <div className="relative z-10 hidden md:block w-32 h-32 opacity-80">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white/20">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="w-full max-w-6xl px-4 mb-8 flex justify-center">
        <div className="flex items-center gap-2 p-1 bg-[#111] border border-[#222] rounded-full backdrop-blur-md">
          {["Todas", "Ropa", "Accesorios"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab 
                  ? "bg-white text-black shadow-lg" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <section className="w-full max-w-6xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts.map((product, index) => (
            <Link href={`/shop/item/${product.id}`} key={product.id} className="group cursor-pointer flex flex-col">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-full h-full flex flex-col"
              >
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#111] mb-4 border border-white/5">
                  <img loading="lazy" decoding="async" 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white font-medium text-base mb-1">{product.name}</h3>
                    <p className="text-white/50 text-sm">{product.category}</p>
                  </div>
                  <span className="text-white font-mono">{product.price}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

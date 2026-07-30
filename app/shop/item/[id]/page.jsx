import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_PRODUCTS } from "../../storeData";

export default function ProductPage({ params }) {
  const { id } = params;
  const product = MOCK_PRODUCTS.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="w-full min-h-screen bg-[#17181c] text-[#fefaf4] pt-24 pb-20 px-4 md:px-12 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <Link href="/shop" className="inline-flex items-center text-white/60 hover:text-white transition-colors text-sm mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Volver a la tienda
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="w-full flex flex-col gap-4">
            <div className="w-full aspect-[3/4] bg-[#111] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Small thumbnails placeholder */}
            <div className="flex gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="w-1/4 aspect-[3/4] bg-[#222] rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-white/40 transition-colors">
                   <img 
                    src={product.image} 
                    alt={`Thumbnail ${item}`} 
                    className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="w-full flex flex-col">
            <div className="mb-2 text-xs tracking-[0.2em] uppercase text-[#00aff0]">
              {product.category}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
            <div className="text-2xl font-mono mb-8">{product.price}</div>
            
            <div className="prose prose-invert max-w-none mb-10 text-white/70">
              <p>
                Pieza exclusiva de la colección EW. Diseñada con los más altos estándares de calidad, 
                manteniendo la estética minimalista y oscura que caracteriza al estudio.
              </p>
              <p>
                Perfecta para combinar con el resto de la colección. Stock limitado.
              </p>
            </div>
            
            {product.category === "Ropa" && (
              <div className="mb-8">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm font-medium uppercase tracking-wider text-white/60">Talla</span>
                  <button className="text-xs text-white/40 hover:text-white underline">Guía de tallas</button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {["S", "M", "L", "XL"].map((size) => (
                    <button 
                      key={size} 
                      className="py-3 border border-white/20 rounded-lg hover:border-white hover:bg-white/5 transition-colors font-medium"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <button className="w-full py-5 bg-white text-black font-bold text-lg rounded-full hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_40px_rgba(255,255,255,0.15)] mb-6">
              Añadir al carrito
            </button>
            
            <div className="text-sm text-white/40 flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Pago seguro y encriptado
            </div>
            
            {/* Details Accordions placeholder */}
            <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8">
              {['Detalles del producto', 'Envío y devoluciones'].map((detail) => (
                <div key={detail} className="pb-4 border-b border-white/10 flex justify-between cursor-pointer hover:text-[#00aff0] transition-colors">
                  <span className="font-medium text-sm tracking-wide">{detail}</span>
                  <span>+</span>
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

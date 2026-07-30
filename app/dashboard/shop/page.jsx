import React from "react";
import Link from "next/link";
import { MOCK_PRODUCTS } from "../../shop/storeData";

export const metadata = { title: "Tienda · Dashboard" };

export default function DashboardShop() {
  return (
    <section>
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestión de Tienda</h1>
        <p className="text-white/60">
          Administra las categorías, productos y precios de la tienda virtual.
        </p>
      </header>

      {/* Tabs / Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <h3 className="text-white/50 text-sm font-semibold uppercase tracking-wider mb-2">Total Productos</h3>
          <p className="text-4xl font-bold">{MOCK_PRODUCTS.length}</p>
        </div>
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <h3 className="text-white/50 text-sm font-semibold uppercase tracking-wider mb-2">Categorías Activas</h3>
          <p className="text-4xl font-bold">5</p>
        </div>
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-center">
          <button className="w-full py-3 bg-[#00aff0] text-white font-bold rounded-xl hover:bg-[#009ce0] transition-colors">
            + Nuevo Producto
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold">Catálogo de Productos</h2>
          <div className="flex gap-2">
             <input 
               type="text" 
               placeholder="Buscar producto..." 
               className="px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#00aff0]"
             />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Producto</th>
                <th className="p-4 font-medium">Categoría</th>
                <th className="p-4 font-medium">Precio</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_PRODUCTS.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-black/50 overflow-hidden border border-white/10 flex-shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-medium text-sm">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-white/70">{p.category}</td>
                  <td className="p-4 text-sm font-mono">{p.price}</td>
                  <td className="p-4 text-right">
                    <button className="text-xs text-white/40 hover:text-white transition-colors mr-3">Editar</button>
                    <button className="text-xs text-red-500/70 hover:text-red-500 transition-colors">Ocultar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

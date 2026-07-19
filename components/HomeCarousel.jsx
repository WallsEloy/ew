"use client";

import React, { useState, useEffect } from "react";

const slidesData = [
  {
    id: 0,
    title: "Galerias",
    logoText: "HUMANS",
    buttonText: "ver",
    image: "/p-1Mesa-de-trabajo-1.png",
    rightTitle: "OnlyFans",
    rightText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis.",
    rightColor: "#00aff0"
  },
  {
    id: 1,
    title: "Proyectos",
    logoText: "PROJECTS",
    buttonText: "descubrir",
    image: "/p-2Mesa-de-trabajo-1.png",
    rightTitle: "Exclusive",
    rightText: "Explora la exclusiva colección de nuestros mejores proyectos, cada uno elaborado con el máximo cuidado y atención al detalle para inspirar tu creatividad.",
    rightColor: "#ff0055"
  },
  {
    id: 2,
    title: "Eventos",
    logoText: "EVENTS",
    buttonText: "asistir",
    image: "/p-3Mesa-de-trabajo-1.png",
    rightTitle: "VIP Pass",
    rightText: "Únete a nosotros en nuestros próximos eventos y experimenta de primera mano la atmósfera vibrante de nuestra comunidad enfocada en el arte.",
    rightColor: "#ffd700"
  },
  {
    id: 3,
    title: "Shopping",
    logoText: "STORE",
    buttonText: "comprar",
    image: "/p-4Mesa-de-trabajo-1.png",
    rightTitle: "Merch",
    rightText: "Adquiere la última mercancía de nuestras colecciones. Ediciones limitadas disponibles solo para miembros registrados. No te quedes sin la tuya.",
    rightColor: "#ff4500"
  },
  {
    id: 4,
    title: "Contacto",
    logoText: "CONTACT",
    buttonText: "escribir",
    image: "/p-6Mesa-de-trabajo-1.png",
    rightTitle: "Let's Talk",
    rightText: "Ponte en contacto con nuestro equipo para consultas de prensa, colaboraciones o cualquier otra pregunta relacionada con nuestro trabajo.",
    rightColor: "#00fa9a"
  }
  
];

export default function HomeCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev === slidesData.length - 1 ? 0 : prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev === 0 ? slidesData.length - 1 : prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autoplay functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev === slidesData.length - 1 ? 0 : prev + 1));
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[100dvh] bg-[#050505] overflow-hidden font-sans text-white border border-white/10">
      
      {/* 1. BACKGROUND STATIC GLOWS */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-[20%] w-[30vw] h-[70vh] bg-fuchsia-900 rounded-full mix-blend-screen filter blur-[120px] opacity-60"></div>
        <div className="absolute top-1/4 right-[20%] w-[30vw] h-[70vh] bg-purple-900 rounded-full mix-blend-screen filter blur-[120px] opacity-60"></div>
      </div>


      {/* 3. STATIC WHITE FRAME */}
      {/* Making the frame clearly visible like the mockup */}
      <div className="absolute top-[25%] bottom-[30%] left-[20%] right-[20%] border-[15px] bg-white z-10 pointer-events-none pointer-events-none"></div>

      {/* 4. STATIC DOTS */}
      <div className="fixed bottom-[25%] left-[33%] flex items-center z-[9999] pointer-events-auto" style={{ gap: '10px' }}>
        {slidesData.map((slide, index) => (
          <div 
            key={slide.id}
            role="button"
            tabIndex={0}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveIndex(index) }}
            className={`w-4 h-4 rounded-full cursor-pointer flex-shrink-0 flex-grow-0 transition-transform duration-300 ${activeIndex === index ? 'bg-[#00aff0] shadow-[0_0_12px_#00aff0] scale-[1.3]' : 'bg-[#d0d0d0] hover:scale-[1.1] hover:bg-white'}`}
            style={{ minWidth: '16px', minHeight: '16px' }}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>

      {/* 5. MOVING CAROUSEL TRACK */}
      <div 
        className="absolute top-0 left-0 w-full h-full flex transition-transform duration-1000 ease-[cubic-bezier(0.87,0,0.13,1)] z-10 pointer-events-none"
        style={{ transform: `translateX(-${activeIndex * 100}vw)` }}
      >
        {slidesData.map((slide) => (
          <div key={slide.id} className="w-screen h-full flex-shrink-0 relative pointer-events-auto">
             
             {/* LEFT TEXT (Moves with slide) */}
             <div className="absolute left-[33%] top-[18%] flex flex-col items-center z-30">
                <h2 className="text-4xl font-bold tracking-widest text-white drop-shadow-lg mb-20 -translate-y-20">{slide.title}</h2>
                <div className="flex flex-col items-center ml-10 gap-6" style={{ marginTop: '100px' }}>
                  <h3 className="hidden md:block text-yellow-500 font-bold text-2xl tracking-[0.2em]">{slide.logoText}</h3>
                  <button className="bg-gradient-to-b from-yellow-400 to-yellow-600 text-black font-extrabold tracking-widest text-sm px-20 py-2 rounded-full shadow-[0_0_15px_rgba(202,138,4,0.8)] border-2 border-yellow-300 hover:scale-105 transition-transform">
                    {slide.buttonText}
                  </button>
                </div>
             </div>

             {/* CENTER IMAGE (Moves with slide) */}
             <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[60vw] flex justify-center items-center z-40 pointer-events-none">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="w-auto h-[100dvh] max-w-none object-cover filter drop-shadow-2xl"
                />
             </div>

             {/* RIGHT TEXT (Moves with slide) */}
             <div className="absolute right-[23%] top-[35%] w-[20vw] flex flex-col gap-4 z-30">
                <div className="flex items-center gap-3">
                   <div className="flex gap-1 justify-center items-center mt-1">
                     <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                     <span className="w-2.5 h-2.5 rounded-full bg-[#00aff0]"></span>
                   </div>
                   <h3 className="text-2xl font-bold tracking-wider" style={{ color: slide.rightColor }}>
                     {slide.rightTitle}
                   </h3>
                </div>
                <p className="hidden md:block text-base font-medium leading-relaxed text-gray-200 mt-2">
                  {slide.rightText}
                </p>
             </div>
             
          </div>
        ))}
      </div>

    </div>
  );
}

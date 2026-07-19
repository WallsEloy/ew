"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  if (pathname && pathname.startsWith('/dashboard')) {
    return null;
  }

  const navItemClass = "nav-link bg-transparent font-normal italic text-[11px] sm:text-[13px] md:text-[14px] hover:font-bold hover:scale-110 hover:brightness-150 transition-all duration-200 inline-block no-underline border-none focus:outline-none";
  
  // Custom class for mobile links specifically
  const mobileNavItemClass = "text-white font-normal italic text-[16px] py-4 px-6 focus:outline-none transition-all duration-200 hover:text-gray-300";

  const renderDropdown = (id, items = [], isMobile = false) => {
    if (openDropdown !== id) return null;
    return (
      <div className={`${styles.dropdownMenu} ${isMobile ? 'relative mx-auto mt-2' : 'absolute top-full mt-4'} flex flex-col p-2 min-w-[150px] z-[999] opacity-100 shadow-xl`} style={isMobile ? {} : { left: '50%', transform: 'translateX(-50%)' }}>
        {items.map((item, index) => (
          <Link key={index} href={item.href} className={`${styles.dropdownItem} py-2 px-4 block text-center text-[13px] ${index < items.length - 1 ? 'mb-1' : ''}`}>
            {item.label}
          </Link>
        ))}
      </div>
    );
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[99999] bg-transparent font-sans text-white" ref={dropdownRef}>
      
      {/* Top section: Buttons */}
      <div className="w-full flex justify-end px-[6%] py-1 z-20 relative">
        <div className="flex">
          <button className="bg-[#00aff0] !text-white font-bold italic px-5 py-1 rounded-l-full border-t-0 border-b-0 border-l-0 border-r-[2px] border-solid border-[#0090c0] text-[13px] hover:opacity-80 transition-all tracking-wide">Registro</button>
          <button className="bg-[#00aff0] !text-white font-bold italic px-5 py-1 rounded-r-full border-none text-[13px] hover:opacity-80 transition-all tracking-wide">login</button>
        </div>
      </div>

      {/* Middle Line Section */}
      <div className="relative w-full flex items-center justify-center my-1 z-[60]" style={{ height: '12px', minHeight: '12px' }}>

        {/* Continuous thin white line crossing the full width, behind the logo */}
        <div className="w-full self-start bg-white" style={{ height: '10px', marginTop: '1.5px' }}></div>

        {/* Center Logo sits on top of the line (no black box, so the line crosses through it) */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-[3] hover:scale-105 transition-transform">
          <img
            src="/SVG/ew.svg"
            alt="Logo"
            className="h-[26px] md:h-[30px] object-contain transform scale-[1.3]"
          />
        </Link>
      </div>

      {/* Links Section (Below the white line) */}
      <div className="w-full flex justify-between items-center z-10 px-4 sm:px-6 py-1 relative">
        
        {/* Mobile Hamburger Icon (Left Side) */}
        <div className={`${styles.mobileHamburger} flex-none flex items-center justify-center pl-2`}>
          <button 
            className="text-white bg-transparent border-none hover:text-gray-300 focus:outline-none transition-transform active:scale-95 z-50 p-2" 
            style={{ backgroundColor: 'transparent', border: 'none', WebkitAppearance: 'none' }}
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setOpenDropdown(null);
            }}
          >
            <span 
              className={`${styles.customHamburIcon} transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-50' : 'opacity-100'}`}
            ></span>
          </button>
        </div>

        {/* Desktop Left Links */}
        <div className={`${styles.desktopLinks} flex-1 justify-evenly items-center pr-2 lg:pr-[4%]`}>
          <div className="relative px-2 lg:px-4">
            <button onClick={() => toggleDropdown('galerias')} className={navItemClass} style={{ color: '#ffffff', textDecoration: 'none' }}>Galerias</button>
            {renderDropdown('galerias', [
              { label: 'HUMANS', href: '/galeria' },
              { label: 'Ice Cream', href: '/galeria' },
              { label: 'Sketch', href: '/galeria' },
              { label: 'Fotografia', href: '/galeria' },
              { label: 'Anacronismo', href: '/galeria' }
            ])}
          </div>
          <div className="relative px-2 lg:px-4">
            <button onClick={() => toggleDropdown('diseno')} className={navItemClass} style={{ color: '#ffffff', textDecoration: 'none' }}>Diseño</button>
            {renderDropdown('diseno', [
              { label: 'Gráfico', href: '/diseno' },
              { label: 'Web', href: '/diseno' }
              
            ])}
          </div>
          <div className="relative px-2 lg:px-4">
            <button onClick={() => toggleDropdown('grow')} className={navItemClass} style={{ color: '#ffffff', textDecoration: 'none' }}>Grow</button>
            {renderDropdown('grow', [
              { label: 'Opción A', href: '#' },
              { label: 'Opción B', href: '#' }
            ])}
          </div>
        </div>

        {/* Desktop Center Space (Hide on mobile so hamburger is aligned left) */}
        <div className={`${styles.desktopLinks} w-auto md:w-[120px] flex-shrink-0 justify-center relative`}>
        </div>

        {/* Desktop Right Links */}
        <div className={`${styles.desktopLinks} flex-1 justify-evenly items-center pl-2 lg:pl-[4%]`}>
          <div className="relative px-2 lg:px-4">
            <button onClick={() => toggleDropdown('eventos')} className={navItemClass} style={{ color: '#ffffff', textDecoration: 'none' }}>Eventos</button>
            {renderDropdown('eventos', [
              { label: 'Próximos', href: '#' },
              { label: 'Pasados', href: '#' }
            ])}
          </div>
          <div className="relative px-2 lg:px-4">
            <button onClick={() => toggleDropdown('shoping')} className={navItemClass} style={{ color: '#ffffff', textDecoration: 'none' }}>Shoping</button>
            {renderDropdown('shoping', [
              { label: 'Ropa', href: '#' },
              { label: 'Accesorios', href: '#' }
            ])}
          </div>
          <div className="relative px-2 lg:px-4">
            <Link href="/contacto" className={navItemClass} style={{ color: '#ffffff', textDecoration: 'none' }}>Contacto</Link>
          </div>
        </div>

        {/* Mobile Dropdown Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#111] border-b border-[#333] flex flex-col items-center py-4 md:hidden z-50 shadow-2xl transition-all">
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex flex-col items-center border-b border-[#222]">
                <button onClick={() => toggleDropdown('galerias')} className={mobileNavItemClass}>Galerias</button>
                {renderDropdown('galerias', [
                  { label: 'HUMANS', href: '/galeria' },
                  { label: 'Ice Cream', href: '/galeria' },
                  { label: 'Sketch', href: '/galeria' },
                  { label: 'Fotografia', href: '/galeria' },
                  { label: 'Anacronismo', href: '/galeria' }
                ], true)}
              </div>
              <div className="w-full flex flex-col items-center border-b border-[#222]">
                <button onClick={() => toggleDropdown('diseno')} className={mobileNavItemClass}>Diseño</button>
                {renderDropdown('diseno', [
                  { label: 'Gráfico', href: '/diseno' },
                  { label: 'Web', href: '/diseno' }
                ], true)}
              </div>
              <div className="w-full flex flex-col items-center border-b border-[#222]">
                <button onClick={() => toggleDropdown('grow')} className={mobileNavItemClass}>Grow</button>
                {renderDropdown('grow', [
                  { label: 'Opción A', href: '#' },
                  { label: 'Opción B', href: '#' }
                ], true)}
              </div>
              <div className="w-full flex flex-col items-center border-b border-[#222]">
                <button onClick={() => toggleDropdown('eventos')} className={mobileNavItemClass}>Eventos</button>
                {renderDropdown('eventos', [
                  { label: 'Próximos', href: '#' },
                  { label: 'Pasados', href: '#' }
                ], true)}
              </div>
              <div className="w-full flex flex-col items-center border-b border-[#222]">
                <button onClick={() => toggleDropdown('shoping')} className={mobileNavItemClass}>Shoping</button>
                {renderDropdown('shoping', [
                  { label: 'Ropa', href: '#' },
                  { label: 'Accesorios', href: '#' }
                ], true)}
              </div>
              <div className="w-full flex flex-col items-center">
                <Link href="/contacto" className={mobileNavItemClass}>Contacto</Link>
              </div>
            </div>
          </div>
        )}
      </div>

    </nav>
  );
}

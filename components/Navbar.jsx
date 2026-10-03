"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { defaultNavConfig, mergeNavConfig } from '../data/navConfig';

function PillIcon({ name }) {
  if (name === 'tools') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M7 38.5 19.6 26l2.4 2.4L9.5 41H7v-2.5Zm10.1-17.1 4.3-4.3 9.5 9.5-4.3 4.3-9.5-9.5Zm9.6-9.6 4.7-4.7a3 3 0 0 1 4.2 0l5.3 5.3a3 3 0 0 1 0 4.2l-4.7 4.7-9.5-9.5ZM7.1 12.4l5.3-5.3a3 3 0 0 1 4.2 0l4.8 4.8-9.5 9.5-4.8-4.8a3 3 0 0 1 0-4.2Z" />
        <path d="m13.2 32.8 22-22 3 3-22 22-3-3Z" />
      </svg>
    );
  }

  if (name === 'bell') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M12 29.5c0-7.1 4.2-12.1 9.8-13.3v-2.4h4.4v2.4C31.8 17.4 36 22.4 36 29.5l3.8 5.2H8.2l3.8-5.2Z" />
        <path d="M17.8 37h12.4c-.8 3-3.2 4.8-6.2 4.8S18.6 40 17.8 37ZM20 8.2h8v3.5h-8z" />
      </svg>
    );
  }

  if (name === 'brush') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M29.2 26.3c-3.4-3.4-3.1-7.9.4-11.4L39.8 4.7c1.1-1.1 2.9-.4 2.7 1.2-.6 5.4-2 13.2-6.9 18.1-2 2-4.1 2.8-6.4 2.3Z" />
        <path d="M27.3 28.2c.2 7.4-4.6 13.6-12.3 13.6-5.1 0-8.6-3.3-9.3-7.6 2.2 1.3 4.8.7 6.2-1.3 2.8-4 7.7-6.2 12.5-6.5l2.9 1.8Z" />
      </svg>
    );
  }

  if (name === 'case') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M18 9.2h12V6.8A2.8 2.8 0 0 0 27.2 4h-6.4A2.8 2.8 0 0 0 18 6.8v2.4Zm-9 2.5h30a4 4 0 0 1 4 4v8.8H27.5v3h-7v-3H5v-8.8a4 4 0 0 1 4-4Z" />
        <path d="M5 27h15.5v2.7h7V27H43v12a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V27Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M8 9h32a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V13a4 4 0 0 1 4-4Zm16 17.6L39.2 14H8.8L24 26.6Z" />
      <path d="m4 17.3 13 10.8L4 36V17.3Zm40 0V36l-13-7.9 13-10.8Z" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileTopHidden, setIsMobileTopHidden] = useState(false);
  const [isMobileDockCompact, setIsMobileDockCompact] = useState(false);
  const dropdownRef = useRef(null);
  const previousScrollY = useRef(0);

  // Config editable desde el dashboard (logos, auth, dock). Se inicializa con
  // los defaults —idénticos al navbar original— para no parpadear, y se
  // reemplaza al cargar la config guardada en Supabase.
  const [config, setConfig] = useState(defaultNavConfig);

  useEffect(() => {
    let active = true;
    fetch("/api/nav-config")
      .then((r) => r.json())
      .then((data) => {
        if (active && data?.config) setConfig(mergeNavConfig(data.config));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    previousScrollY.current = window.scrollY;
    let frame = null;

    const handleScroll = () => {
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        frame = null;
        if (!window.matchMedia("(max-width: 767px)").matches) return;

        const currentScrollY = Math.max(0, window.scrollY);
        const difference = currentScrollY - previousScrollY.current;

        if (currentScrollY <= 8) {
          setIsMobileTopHidden(false);
          setIsMobileDockCompact(false);
        } else if (difference > 6) {
          setIsMobileTopHidden(true);
          setIsMobileDockCompact(true);
          setIsMobileMenuOpen(false);
        } else if (difference < -6) {
          setIsMobileTopHidden(false);
          setIsMobileDockCompact(false);
        }

        previousScrollY.current = currentScrollY;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) setIsMobileTopHidden(false);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const { logos, auth, dock, navLinks = defaultNavConfig.navLinks } = config;
  const midIndex = Math.ceil(navLinks.length / 2);
  const leftLinks = navLinks.slice(0, midIndex);
  const rightLinks = navLinks.slice(midIndex);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const closeMobileNavigation = () => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
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

  if (
    pathname &&
    (pathname.startsWith('/dashboard') ||
      pathname === '/login' ||
      pathname === '/register')
  ) {
    return null;
  }

  const navItemClass = "nav-link bg-transparent font-normal italic text-[11px] sm:text-[13px] md:text-[14px] hover:font-bold hover:scale-110 hover:brightness-150 transition-all duration-200 inline-block no-underline border-none focus:outline-none";
  
  // Custom class for mobile links specifically
  const mobileNavItemClass = "text-white font-normal italic text-[16px] py-4 px-6 focus:outline-none transition-all duration-200 hover:text-gray-300";

  const renderDropdown = (id, items = [], isMobile = false) => {
    if (openDropdown !== id) return null;
    return (
      <div className={`${styles.dropdownMenu} ${isMobile ? `${styles.dropdownMenuFlat} relative w-[92%] mt-2` : 'absolute top-full mt-4 min-w-[150px]'} flex flex-col p-2 z-[999] opacity-100 shadow-xl`} style={isMobile ? {} : { left: '50%', transform: 'translateX(-50%)' }}>
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            onClick={closeMobileNavigation}
            className={`${styles.dropdownItem} py-2 px-4 block text-center text-[13px] ${index < items.length - 1 ? 'mb-1' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    );
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[99999] bg-transparent font-sans text-white" ref={dropdownRef}>
      
      {/* Top section: Buttons */}
      <div className={`${styles.topSection} w-full flex justify-end px-[6%] py-1 z-20 relative`}>
        <div className={styles.authSwitcher} aria-label="Acceso de usuario">
          <Link
            href={auth.login.href || "/login"}
            className={`${styles.authSwitcherLink} ${pathname === '/login' ? styles.authSwitcherLinkActive : ''}`}
          >
            {auth.login.label}
          </Link>
          <Link
            href={auth.register.href || "/register"}
            className={`${styles.authSwitcherLink} ${pathname === '/register' ? styles.authSwitcherLinkActive : styles.authSwitcherRegister}`}
          >
            {auth.register.label}
          </Link>
        </div>
      </div>

      {/* Middle Line Section */}
      <div className={`${styles.middleLine} relative w-full flex items-center justify-center my-1 z-[60]`} style={{ height: '12px', minHeight: '12px' }}>

        {/* Continuous thin white line — solo en escritorio (en móvil se oculta) */}
        <div className="hidden md:block w-full self-start bg-white" style={{ height: '10px', marginTop: '1.5px' }}></div>

        {/* Center Logo sits on top of the line (no black box, so the line crosses through it) */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-[3] hover:scale-105 transition-transform">
          {/* Escritorio: logo completo con caligrafía */}
          <img
            src={logos.desktop}
            alt="Logo"
            className="hidden md:block h-[30px] object-contain transform scale-[1.3]"
          />
          {/* Móvil: isotipo */}
          <img
            src={logos.mobileIsotipo}
            alt="Logo"
            className="block md:hidden h-[34px] object-contain"
          />
        </Link>
      </div>

      {/* Links Section (Below the white line) */}
      <div className={`${styles.linksSection} ${isMobileTopHidden ? styles.mobileTopHidden : ''} w-full flex justify-between items-center z-10 px-4 sm:px-6 py-1 relative`}>
        
        {/* Mobile Hamburger Icon */}
        <div className={`${styles.mobileHamburger} flex-none flex items-center justify-center`}>
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

        <Link href="/" className={styles.mobileCenterLogo} aria-label="Ir al inicio">
          <img src={logos.mobileIsotipo} alt="" />
        </Link>

        <Link
          href={auth.login.href || "/login"}
          className={`${styles.mobileAuthCircle} ${pathname === '/login' || pathname === '/register' ? styles.mobileAuthCircleActive : ''}`}
          aria-label="Iniciar sesión o registrarse"
        >
          <span className={styles.visuallyHidden}>Iniciar sesión o registrarse</span>
        </Link>

        {/* Desktop Left Links */}
        <div className={`${styles.desktopLinks} flex-1 justify-evenly items-center pr-2 lg:pr-[4%]`}>
          {leftLinks.map((link, i) => (
            <div key={`left-${i}`} className="relative px-2 lg:px-4">
              {link.dropdown && link.dropdown.length > 0 ? (
                <>
                  <button onClick={() => toggleDropdown(`left-${i}`)} className={navItemClass} style={{ color: '#ffffff', textDecoration: 'none' }}>{link.label}</button>
                  {renderDropdown(`left-${i}`, link.dropdown)}
                </>
              ) : (
                <Link href={link.href || "#"} className={navItemClass} style={{ color: '#ffffff', textDecoration: 'none' }}>{link.label}</Link>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Center Space (Hide on mobile so hamburger is aligned left) */}
        <div className={`${styles.desktopLinks} w-auto md:w-[120px] flex-shrink-0 justify-center relative`}>
        </div>

        {/* Desktop Right Links */}
        <div className={`${styles.desktopLinks} flex-1 justify-evenly items-center pl-2 lg:pl-[4%]`}>
          {rightLinks.map((link, i) => (
            <div key={`right-${i}`} className="relative px-2 lg:px-4">
              {link.dropdown && link.dropdown.length > 0 ? (
                <>
                  <button onClick={() => toggleDropdown(`right-${i}`)} className={navItemClass} style={{ color: '#ffffff', textDecoration: 'none' }}>{link.label}</button>
                  {renderDropdown(`right-${i}`, link.dropdown)}
                </>
              ) : (
                <Link href={link.href || "#"} className={navItemClass} style={{ color: '#ffffff', textDecoration: 'none' }}>{link.label}</Link>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Dropdown Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#111] border-b border-[#333] flex flex-col items-center py-4 md:hidden z-50 shadow-2xl transition-all">
            <div className="w-full flex flex-col items-center">
              {navLinks.map((link, i) => (
                <div key={`mobile-${i}`} className={`w-full flex flex-col items-center ${i < navLinks.length - 1 ? 'border-b border-[#222]' : ''}`}>
                  {link.dropdown && link.dropdown.length > 0 ? (
                    <>
                      <button onClick={() => toggleDropdown(`mobile-${i}`)} className={mobileNavItemClass}>{link.label}</button>
                      {renderDropdown(`mobile-${i}`, link.dropdown, true)}
                    </>
                  ) : (
                    <Link href={link.href || "#"} onClick={closeMobileNavigation} className={mobileNavItemClass}>{link.label}</Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className={`${styles.mobilePillNav} ${
          isMobileDockCompact ? styles.mobilePillNavCompact : ""
        }`}
        aria-label="Navegación rápida"
      >
        {dock.map((item, index) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <div key={`${item.href}-${index}`} className={styles.pillItemWrap}>
              {index > 0 && <span className={styles.pillDivider} aria-hidden="true" />}
              <Link
                href={item.href || '#'}
                className={`${styles.pillLink} ${isActive ? styles.pillLinkActive : ''}`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.iconType === 'image' && item.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.icon}
                    alt=""
                    style={{ width: '30px', height: '30px', objectFit: 'contain' }}
                  />
                ) : (
                  <PillIcon name={item.icon} />
                )}
              </Link>
            </div>
          );
        })}
      </div>

    </nav>
  );
}

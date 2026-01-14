import React, { useState, useRef, useEffect } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext.jsx';

export default function UserTypesFlowcharts() {
  const { isDarkMode } = useDarkMode();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  const textColor = isDarkMode ? '#E5E7EB' : '#1F2937';
  const bgColor = isDarkMode ? '#111827' : '#FFFFFF';
  const boxColor = isDarkMode ? '#1F2937' : '#F3F4F6';
  const borderColor = isDarkMode ? '#374151' : '#D1D5DB';
  const primaryColor = '#3B82F6';
  const successColor = '#10B981';
  const warningColor = '#F59E0B';
  const dangerColor = '#EF4444';

  // Pan/Zoom handlers
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(3, zoom * delta));
    setZoom(newZoom);
  };

  const handleMouseDown = (e) => {
    if (e.button === 0 && !e.target.closest('button')) { // Left mouse button, not on button
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(3, prev + 0.1));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(0.5, prev - 0.1));
  };

  // SVG wrapper component with pan/zoom
  const ZoomableSVG = ({ children, viewBox, className = "" }) => {
    const svgRef = useRef(null);
    const localContainerRef = useRef(null);
    
    return (
      <div 
        ref={localContainerRef}
        className={`relative overflow-hidden border rounded-lg ${className}`}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          minHeight: '400px'
        }}
        onWheel={(e) => {
          if (e.target === localContainerRef.current || e.target.closest('svg')) {
            handleWheel(e);
          }
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              zoomIn();
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              zoomOut();
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              resetView();
            }}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Reset view"
          >
            Reset
          </button>
        </div>
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="w-full h-auto"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s'
          }}
        >
          {children}
        </svg>
      </div>
    );
  };

  // Dijagram 1: Registracija i Onboarding
  const RegistrationFlowchart = () => (
    <ZoomableSVG viewBox="0 0 1200 750">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill={textColor} />
        </marker>
        <linearGradient id="userGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="providerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      
      {/* Naslov */}
      <text x="600" y="30" textAnchor="middle" fontSize="24" fontWeight="bold" fill={textColor}>
        Proces Registracije i Onboarding-a
      </text>

      {/* Početak */}
      <rect x="560" y="60" width="80" height="50" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="90" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">
        Početak
      </text>

      {/* Odabir tipa korisnika */}
      <rect x="496" y="150" width="208" height="65" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="175" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Odabir tipa korisnika
      </text>
      <text x="600" y="197" textAnchor="middle" fontSize="12" fill={textColor}>
        USER ili PROVIDER
      </text>

      {/* Strelica */}
      <line x1="600" y1="110" x2="600" y2="150" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead)" />

      {/* Grananje */}
      <polygon points="600,210 650,250 600,290 550,250" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="255" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        Tip?
      </text>

      {/* Strelica USER */}
      <line x1="550" y1="250" x2="400" y2="250" stroke={textColor} strokeWidth="2" />
      <line x1="400" y1="250" x2="400" y2="300" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
      <text x="475" y="245" textAnchor="middle" fontSize="12" fill={textColor}>USER</text>

      {/* Strelica PROVIDER */}
      <line x1="650" y1="250" x2="850" y2="250" stroke={textColor} strokeWidth="2" />
      <line x1="850" y1="250" x2="850" y2="300" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
      <text x="725" y="245" textAnchor="middle" fontSize="12" fill={textColor}>PROVIDER</text>

      {/* USER putanja */}
      <g>
        <rect x="264" y="300" width="272" height="65" rx="5" fill="url(#userGradient)" stroke={primaryColor} strokeWidth="2" />
        <text x="400" y="325" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
          Registracija korisnika usluge
        </text>
        <text x="400" y="347" textAnchor="middle" fontSize="12" fill={textColor}>
          Email, lozinka, ime
        </text>

        <line x1="400" y1="360" x2="400" y2="397" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead)" />

        <polygon points="400,400 450,440 400,480 350,440" fill={warningColor} stroke={borderColor} strokeWidth="2" />
        <text x="400" y="445" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
          Pravni status?
        </text>

        {/* Privatni korisnik */}
        <line x1="350" y1="440" x2="200" y2="440" stroke={textColor} strokeWidth="2" />
        <line x1="200" y1="440" x2="200" y2="487" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
        <rect x="60" y="490" width="280" height="85" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
        <text x="200" y="513" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
          Privatni korisnik
        </text>
        <text x="200" y="531" textAnchor="middle" fontSize="11" fill={textColor}>
          Fizička osoba
        </text>
        <text x="200" y="548" textAnchor="middle" fontSize="11" fill={textColor}>
          Traži usluge za osobne potrebe
        </text>
        <text x="200" y="565" textAnchor="middle" fontSize="11" fill={successColor}>
          ✓ Registracija završena
        </text>

        {/* Poslovni korisnik */}
        <line x1="450" y1="440" x2="600" y2="440" stroke={textColor} strokeWidth="2" />
        <line x1="600" y1="440" x2="600" y2="487" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
        <rect x="460" y="490" width="280" height="85" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
        <text x="600" y="513" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
          Poslovni korisnik
        </text>
        <text x="600" y="531" textAnchor="middle" fontSize="11" fill={textColor}>
          Pravna osoba (obrt, d.o.o.)
        </text>
        <text x="600" y="548" textAnchor="middle" fontSize="11" fill={textColor}>
          Traži usluge za poslovanje
        </text>
        <text x="600" y="565" textAnchor="middle" fontSize="11" fill={successColor}>
          ✓ Registracija završena
        </text>
      </g>

      {/* PROVIDER putanja */}
      <g>
        <rect x="714" y="300" width="272" height="65" rx="5" fill="url(#providerGradient)" stroke={successColor} strokeWidth="2" />
        <text x="850" y="325" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
          Registracija pružatelja
        </text>
        <text x="850" y="347" textAnchor="middle" fontSize="12" fill={textColor}>
          Email, lozinka, pravni status, OIB
        </text>

        <line x1="850" y1="365" x2="850" y2="397" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead)" />

        <rect x="714" y="400" width="272" height="65" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
        <text x="850" y="425" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
          Wizard: Odabir kategorija
        </text>
        <text x="850" y="447" textAnchor="middle" fontSize="12" fill={textColor}>
          Kategorije usluga, regije
        </text>

        <line x1="850" y1="460" x2="850" y2="497" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead)" />

        <polygon points="850,500 900,540 850,580 800,540" fill={warningColor} stroke={borderColor} strokeWidth="2" />
        <text x="850" y="545" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
          Tvrtka?
        </text>

        {/* Solo provider */}
        <line x1="800" y1="540" x2="800" y2="600" stroke={textColor} strokeWidth="2" />
        <line x1="800" y1="600" x2="650" y2="600" stroke={textColor} strokeWidth="2" />
        <line x1="650" y1="600" x2="650" y2="650" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
        <rect x="510" y="650" width="280" height="85" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
        <text x="650" y="673" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
          Pružatelj (Solo)
        </text>
        <text x="650" y="691" textAnchor="middle" fontSize="11" fill={textColor}>
          Pojedinačni pružatelj
        </text>
        <text x="650" y="708" textAnchor="middle" fontSize="11" fill={textColor}>
          Bez tima
        </text>
        <text x="650" y="725" textAnchor="middle" fontSize="11" fill={successColor}>
          ✓ Onboarding završen
        </text>

        {/* Tvrtka provider */}
        <line x1="900" y1="540" x2="1050" y2="540" stroke={textColor} strokeWidth="2" />
        <line x1="1050" y1="540" x2="1050" y2="650" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
        <rect x="910" y="650" width="280" height="85" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
        <text x="1050" y="673" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
          Pružatelj (Tvrtka)
        </text>
        <text x="1050" y="691" textAnchor="middle" fontSize="11" fill={textColor}>
          Tvrtka s timom
        </text>
        <text x="1050" y="708" textAnchor="middle" fontSize="11" fill={textColor}>
          Company name, direktor
        </text>
        <text x="1050" y="725" textAnchor="middle" fontSize="11" fill={successColor}>
          ✓ Onboarding završen
        </text>
      </g>
    </ZoomableSVG>
  );

  // Dijagram 2: Verifikacija i Licenciranje
  const VerificationFlowchart = () => (
    <ZoomableSVG viewBox="0 0 1200 1220">
      <defs>
        <marker id="arrowhead2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill={textColor} />
        </marker>
        <marker id="arrowhead2-back" markerWidth="10" markerHeight="10" refX="1" refY="3" orient="auto">
          <polygon points="10 0, 0 3, 10 6" fill={textColor} />
        </marker>
      </defs>

      <text x="600" y="30" textAnchor="middle" fontSize="24" fontWeight="bold" fill={textColor}>
        Proces Verifikacije i Licenciranja
      </text>

      {/* Pružatelj */}
      <rect x="520" y="60" width="160" height="50" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="90" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">
        Pružatelj usluga
      </text>

      <line x1="600" y1="110" x2="600" y2="147" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead2)" />

      {/* KYC Verifikacija - Upload */}
      <rect x="420" y="150" width="360" height="75" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="178" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        KYC Verifikacija - Upload
      </text>
      <text x="600" y="198" textAnchor="middle" fontSize="12" fill={textColor}>
        Upload dokumenata: OIB, sudski registar
      </text>
      <text x="600" y="214" textAnchor="middle" fontSize="12" fill={textColor}>
        Dokumenti poslani na provjeru
      </text>

      <line x1="600" y1="230" x2="600" y2="267" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead2)" />

      {/* ADMIN provjera */}
      <rect x="440" y="270" width="320" height="90" rx="5" fill={dangerColor} stroke={borderColor} strokeWidth="3" />
      <text x="600" y="298" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">
        🔐 ADMIN Provjera
      </text>
      <text x="600" y="321" textAnchor="middle" fontSize="12" fill="white">
        • Pregled dokumenata
      </text>
      <text x="600" y="339" textAnchor="middle" fontSize="12" fill="white">
        • Provjera OIB-a (Sudski registar)
      </text>
      <text x="600" y="357" textAnchor="middle" fontSize="12" fill="white">
        • Odobrenje/Odbijanje
      </text>

      <line x1="600" y1="385" x2="600" y2="407" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead2)" />

      <polygon points="600,410 650,450 600,490 550,450" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="455" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        Odobreno?
      </text>

      {/* Verificiran */}
      <line x1="550" y1="450" x2="400" y2="450" stroke={textColor} strokeWidth="2" />
      <line x1="400" y1="450" x2="400" y2="497" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead2)" />
      <rect x="272" y="500" width="256" height="75" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="400" y="518" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        ✓ Verificirani pružatelj
      </text>
      <text x="400" y="536" textAnchor="middle" fontSize="12" fill="white">
        companyVerified = true
      </text>
      <text x="400" y="554" textAnchor="middle" fontSize="12" fill="white">
        Badge: Business, Identity
      </text>

      {/* Odbijeno */}
      <line x1="650" y1="450" x2="900" y2="450" stroke={textColor} strokeWidth="2" />
      <line x1="900" y1="450" x2="900" y2="500" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead2)" />
      <rect x="768" y="500" width="264" height="105" rx="5" fill={dangerColor} stroke={borderColor} strokeWidth="2" />
      <text x="900" y="523" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        ❌ ODBIJENO
      </text>
      <text x="900" y="541" textAnchor="middle" fontSize="12" fill="white">
        Admin razlog odbijanja
      </text>
      <text x="900" y="559" textAnchor="middle" fontSize="12" fill="white">
        • Neispravni dokumenti
      </text>
      <text x="900" y="577" textAnchor="middle" fontSize="12" fill="white">
        • Neuspjela provjera OIB-a
      </text>
      <text x="900" y="595" textAnchor="middle" fontSize="12" fill="white">
        Mogućnost ponovnog slanja
      </text>

      {/* Povratak na upload */}
      <line x1="1032" y1="552" x2="1100" y2="552" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />
      <line x1="1100" y1="552" x2="1100" y2="315" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />
      <line x1="1100" y1="315" x2="760" y2="315" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead2)" />
      <text x="930" y="310" textAnchor="middle" fontSize="10" fill={textColor}>ponovno slanje</text>

      {/* Licenciranje */}
      <line x1="400" y1="580" x2="400" y2="617" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead2)" />

      <polygon points="400,620 450,660 400,700 350,660" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="400" y="665" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        Licenca potrebna?
      </text>

      {/* Potrebna licenca */}
      <line x1="350" y1="660" x2="200" y2="660" stroke={textColor} strokeWidth="2" />
      <line x1="200" y1="660" x2="200" y2="707" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead2)" />
      
      {/* Upload licence */}
      <rect x="68" y="710" width="264" height="90" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="200" y="733" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Upload licence
      </text>
      <text x="200" y="751" textAnchor="middle" fontSize="12" fill={textColor}>
        PDF dokument, tip licence
      </text>
      <text x="200" y="769" textAnchor="middle" fontSize="12" fill={textColor}>
        Broj licence, izdavatelj
      </text>
      <text x="200" y="787" textAnchor="middle" fontSize="12" fill={textColor}>
        Dokument poslan na provjeru
      </text>

      <line x1="200" y1="790" x2="200" y2="827" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead2)" />

      {/* ADMIN verifikacija licence */}
      <rect x="68" y="830" width="264" height="90" rx="5" fill={dangerColor} stroke={borderColor} strokeWidth="3" />
      <text x="200" y="850" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">
        🔐 ADMIN Verifikacija
      </text>
      <text x="200" y="870" textAnchor="middle" fontSize="12" fill="white">
        • Provjera valjanosti licence
      </text>
      <text x="200" y="888" textAnchor="middle" fontSize="12" fill="white">
        • Kontakt s izdavateljem (opcionalno)
      </text>
      <text x="200" y="906" textAnchor="middle" fontSize="12" fill="white">
        • Odobrenje/Odbijanje
      </text>

      {/* Nije potrebna licenca */}
      <line x1="450" y1="660" x2="600" y2="660" stroke={textColor} strokeWidth="2" />
      <line x1="600" y1="660" x2="600" y2="707" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead2)" />
      <rect x="512" y="710" width="176" height="65" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="733" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Licenca nije potrebna
      </text>
      <text x="600" y="751" textAnchor="middle" fontSize="12" fill={textColor}>
        Kategorija ne zahtijeva
      </text>
      <text x="600" y="767" textAnchor="middle" fontSize="12" fill={successColor}>
        ✓ Aktivni pružatelj
      </text>

      {/* Licenca odobrena */}
      <line x1="200" y1="920" x2="200" y2="970" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead2)" />
      <rect x="68" y="970" width="264" height="65" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="200" y="988" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        ✓ Licencirani pružatelj
      </text>
      <text x="200" y="1006" textAnchor="middle" fontSize="12" fill="white">
        isVerified = true, Badge: Safety
      </text>
    </ZoomableSVG>
  );

  // Dijagram 3: Pretplate
  const SubscriptionFlowchart = () => (
    <ZoomableSVG viewBox="0 0 1400 850">
      <defs>
        <marker id="arrowhead3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill={textColor} />
        </marker>
      </defs>

      <text x="600" y="30" textAnchor="middle" fontSize="24" fontWeight="bold" fill={textColor}>
        Proces Pretplata
      </text>

      {/* Registracija */}
      <rect x="532" y="60" width="136" height="50" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="90" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">
        Registracija
      </text>

      <line x1="600" y1="110" x2="600" y2="150" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead3)" />

      {/* TRIAL */}
      <rect x="448" y="150" width="304" height="75" rx="5" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="178" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">
        TRIAL Paket
      </text>
      <text x="600" y="198" textAnchor="middle" fontSize="12" fill="white">
        Automatski dodijeljen
      </text>
      <text x="600" y="214" textAnchor="middle" fontSize="12" fill="white">
        Ograničeno vrijeme (npr. 14 dana)
      </text>

      <line x1="600" y1="225" x2="600" y2="270" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead3)" />

      {/* Upgrade box */}
      <rect x="548" y="270" width="104" height="50" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="298" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">
        Upgrade?
      </text>

      {/* Upgrade opcije - sve 4 linije idu od donjeg ruba box-a */}
      {/* BASIC */}
      <line x1="550" y1="330" x2="200" y2="380" stroke={textColor} strokeWidth="2" />
      <line x1="200" y1="380" x2="200" y2="410" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead3)" />
      <text x="375" y="375" textAnchor="middle" fontSize="12" fill={textColor}>BASIC</text>
      
      {/* PREMIUM */}
      <line x1="575" y1="330" x2="550" y2="380" stroke={textColor} strokeWidth="2" />
      <line x1="550" y1="380" x2="550" y2="410" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead3)" />
      <text x="562" y="375" textAnchor="middle" fontSize="12" fill={textColor}>PREMIUM</text>
      
      {/* PRO */}
      <line x1="625" y1="330" x2="900" y2="380" stroke={textColor} strokeWidth="2" />
      <line x1="900" y1="380" x2="900" y2="410" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead3)" />
      <text x="762" y="375" textAnchor="middle" fontSize="12" fill={textColor}>PRO</text>
      
      {/* Nema pretplate */}
      <line x1="650" y1="330" x2="1200" y2="380" stroke={textColor} strokeWidth="2" />
      <line x1="1200" y1="380" x2="1200" y2="410" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead3)" />
      <text x="925" y="375" textAnchor="middle" fontSize="12" fill={textColor}>Ne</text>
      
      {/* BASIC */}
      <rect x="84" y="410" width="232" height="85" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="200" y="428" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        BASIC
      </text>
      <text x="200" y="446" textAnchor="middle" fontSize="11" fill={textColor}>
        Osnovne funkcionalnosti
      </text>
      <text x="200" y="463" textAnchor="middle" fontSize="11" fill={textColor}>
        Ograničen broj poslova
      </text>
      <text x="200" y="480" textAnchor="middle" fontSize="11" fill={successColor}>
        ✓ Aktivna pretplata
      </text>

      {/* PREMIUM */}
      <rect x="430" y="410" width="240" height="160" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="550" y="428" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        PREMIUM
      </text>
      <text x="550" y="446" textAnchor="middle" fontSize="11" fill={textColor}>
        • Napredne funkcionalnosti
      </text>
      <text x="550" y="463" textAnchor="middle" fontSize="11" fill={textColor}>
        • 50 kredita/mjesec
      </text>
      <text x="550" y="480" textAnchor="middle" fontSize="11" fill={textColor}>
        • AI Priority u queue-u
      </text>
      <text x="550" y="497" textAnchor="middle" fontSize="11" fill={textColor}>
        • SMS notifikacije
      </text>
      <text x="550" y="514" textAnchor="middle" fontSize="11" fill={textColor}>
        • Priority support
      </text>
      <text x="550" y="531" textAnchor="middle" fontSize="11" fill={textColor}>
        • CSV export
      </text>
      <text x="550" y="548" textAnchor="middle" fontSize="11" fill={textColor}>
        • Advanced analytics
      </text>
      <text x="550" y="565" textAnchor="middle" fontSize="11" fill={successColor}>
        ✓ Aktivna pretplata
      </text>

      {/* PRO */}
      <rect x="776" y="410" width="248" height="160" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="900" y="428" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        PRO
      </text>
      <text x="900" y="446" textAnchor="middle" fontSize="11" fill={textColor}>
        • Sve funkcionalnosti
      </text>
      <text x="900" y="463" textAnchor="middle" fontSize="11" fill={textColor}>
        • Unlimited krediti
      </text>
      <text x="900" y="480" textAnchor="middle" fontSize="11" fill={textColor}>
        • VIP podrška 24/7
      </text>
      <text x="900" y="497" textAnchor="middle" fontSize="11" fill={textColor}>
        • White-label opcija
      </text>
      <text x="900" y="514" textAnchor="middle" fontSize="11" fill={textColor}>
        • Live chat widget
      </text>
      <text x="900" y="531" textAnchor="middle" fontSize="11" fill={textColor}>
        • Support tickets
      </text>
      <text x="900" y="548" textAnchor="middle" fontSize="11" fill={textColor}>
        • Real-time chat podrška
      </text>
      <text x="900" y="565" textAnchor="middle" fontSize="11" fill={successColor}>
        ✓ Aktivna pretplata
      </text>

      {/* Nema upgrade */}
      <rect x="1112" y="410" width="176" height="85" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="1200" y="428" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Nema pretplate
      </text>
      <text x="1200" y="446" textAnchor="middle" fontSize="12" fill={textColor}>
        TRIAL istekao
      </text>
      <text x="1200" y="463" textAnchor="middle" fontSize="12" fill={textColor}>
        Nema aktivne pretplate
      </text>
      <text x="1200" y="480" textAnchor="middle" fontSize="11" fill={dangerColor}>
        ⚠️ Ograničen pristup
      </text>

      {/* ADMIN upravljanje pretplatama - povezano sa svim pretplatama */}
      {/* Linija od BASIC - ide lijevo pa dolje do zajedničke točke */}
      <line x1="200" y1="505" x2="200" y2="580" stroke={textColor} strokeWidth="2" />
      <line x1="200" y1="580" x2="600" y2="580" stroke={textColor} strokeWidth="2" />
      
      {/* Linija od PREMIUM - ide dolje do zajedničke točke */}
      <line x1="550" y1="565" x2="550" y2="580" stroke={textColor} strokeWidth="2" />
      <line x1="550" y1="580" x2="600" y2="580" stroke={textColor} strokeWidth="2" />
      
      {/* Linija od PRO - ide dolje pa lijevo do zajedničke točke */}
      <line x1="900" y1="565" x2="900" y2="580" stroke={textColor} strokeWidth="2" />
      <line x1="900" y1="580" x2="600" y2="580" stroke={textColor} strokeWidth="2" />
      
      {/* Zajednička linija od točke (600, 580) do sredine ADMIN upravljanje box-a */}
      <line x1="600" y1="580" x2="600" y2="640" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead3)" />
      
      <rect x="440" y="640" width="320" height="90" rx="5" fill={dangerColor} stroke={borderColor} strokeWidth="3" />
      <text x="600" y="663" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">
        🔐 ADMIN Upravljanje
      </text>
      <text x="600" y="686" textAnchor="middle" fontSize="12" fill="white">
        • Ručno produženje pretplate
      </text>
      <text x="600" y="704" textAnchor="middle" fontSize="12" fill="white">
        • Promjena plana (upgrade/downgrade)
      </text>
      <text x="600" y="722" textAnchor="middle" fontSize="12" fill="white">
        • Otkazivanje, refundiranje
      </text>
      <text x="600" y="740" textAnchor="middle" fontSize="12" fill="white">
        • Pregled faktura i transakcija
      </text>

      <line x1="600" y1="730" x2="600" y2="750" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead3)" />
      <rect x="440" y="760" width="320" height="65" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="778" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        ✓ Pretplata aktivna
      </text>
      <text x="600" y="796" textAnchor="middle" fontSize="12" fill="white">
        Status: ACTIVE, automatska obnova
      </text>
    </ZoomableSVG>
  );

  // Dijagram 4: Korištenje platforme - Korisnik usluge
  const UserJourneyFlowchart = () => (
    <ZoomableSVG viewBox="0 0 1200 1520">
      <defs>
        <marker id="arrowhead4" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill={textColor} />
        </marker>
      </defs>

      <text x="600" y="30" textAnchor="middle" fontSize="24" fontWeight="bold" fill={textColor}>
        Proces Korištenja Platforme - Korisnik Usluge
      </text>

      {/* Prijava */}
      <rect x="560" y="60" width="80" height="50" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="90" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">
        Prijava
      </text>

      <line x1="600" y1="110" x2="600" y2="150" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead4)" />

      {/* Dashboard */}
      <rect x="450" y="150" width="300" height="65" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="177" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Dashboard
      </text>
      <text x="600" y="197" textAnchor="middle" fontSize="12" fill={textColor}>
        Pregled poslova, pretraga
      </text>

      <line x1="600" y1="210" x2="600" y2="250" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead4)" />

      <polygon points="600,250 650,290 600,330 550,290" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="295" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        Akcija?
      </text>

      {/* Objavi posao */}
      <line x1="550" y1="290" x2="300" y2="290" stroke={textColor} strokeWidth="2" />
      <line x1="300" y1="290" x2="300" y2="340" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead4)" />
      <rect x="100" y="340" width="400" height="95" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="300" y="363" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Objavi posao
      </text>
      <text x="300" y="381" textAnchor="middle" fontSize="11" fill={textColor}>
        1. Odaberi kategoriju
      </text>
      <text x="300" y="398" textAnchor="middle" fontSize="11" fill={textColor}>
        2. Unesi detalje (opis, budžet, lokacija)
      </text>
      <text x="300" y="415" textAnchor="middle" fontSize="11" fill={textColor}>
        3. Postavi slike (opcionalno)
      </text>
      <text x="300" y="432" textAnchor="middle" fontSize="11" fill={textColor}>
        4. Posao kreiran (status: OPEN)
      </text>

      <line x1="300" y1="440" x2="300" y2="480" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead4)" />

      {/* ADMIN moderacija (opcionalno) */}
      <rect x="100" y="480" width="400" height="85" rx="5" fill={dangerColor} stroke={borderColor} strokeWidth="2" />
      <text x="300" y="503" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        🔐 ADMIN Moderacija (opcionalno)
      </text>
      <text x="300" y="521" textAnchor="middle" fontSize="11" fill="white">
        Provjera sadržaja, spam detekcija
      </text>
      <text x="300" y="538" textAnchor="middle" fontSize="11" fill="white">
        Odobrenje/Odbijanje ako je potrebno
      </text>
      <text x="300" y="555" textAnchor="middle" fontSize="11" fill="white">
        Većina poslova automatski odobrena
      </text>

      <line x1="300" y1="560" x2="300" y2="600" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead4)" />

      <rect x="100" y="600" width="400" height="65" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="300" y="625" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        ✓ Posao objavljen i vidljiv
      </text>
      <text x="300" y="645" textAnchor="middle" fontSize="12" fill="white">
        Dostupan pružateljima za ponude
      </text>

      {/* Pretraži poslove */}
      <line x1="650" y1="290" x2="900" y2="290" stroke={textColor} strokeWidth="2" />
      <line x1="900" y1="290" x2="900" y2="340" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead4)" />
      <rect x="700" y="340" width="400" height="155" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="900" y="363" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Pretraži poslove
      </text>
      <text x="900" y="381" textAnchor="middle" fontSize="11" fill={textColor}>
        1. Sticky search bar (uvijek vidljiv)
      </text>
      <text x="900" y="398" textAnchor="middle" fontSize="11" fill={textColor}>
        2. Filteri (kategorija, grad, budžet, status, datum)
      </text>
      <text x="900" y="415" textAnchor="middle" fontSize="11" fill={textColor}>
        3. Sortiranje (najnoviji, najstariji, budžet)
      </text>
      <text x="900" y="432" textAnchor="middle" fontSize="11" fill={textColor}>
        4. View mode (Grid/List)
      </text>
      <text x="900" y="449" textAnchor="middle" fontSize="11" fill={textColor}>
        5. Spremi pretragu (opcionalno)
      </text>
      <text x="900" y="466" textAnchor="middle" fontSize="11" fill={textColor}>
        6. Job alerts (DAILY, WEEKLY, INSTANT)
      </text>
      <text x="900" y="485" textAnchor="middle" fontSize="11" fill={successColor}>
        ✓ Rezultati prikazani
      </text>

      {/* Ponude - zahtijeva PRUŽATELJA */}
      <line x1="300" y1="660" x2="300" y2="700" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead4)" />
      
      {/* Pružatelj šalje ponudu */}
      <rect x="700" y="700" width="300" height="95" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="850" y="718" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">
        👤 PRUŽATELJ
      </text>
      <text x="850" y="738" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Šalje ponudu
      </text>
      <text x="850" y="756" textAnchor="middle" fontSize="11" fill="white">
        • Iznos, poruka, rok
      </text>
      <text x="850" y="773" textAnchor="middle" fontSize="11" fill="white">
        • Status: NA_ČEKANJU
      </text>
      <text x="850" y="790" textAnchor="middle" fontSize="11" fill="white">
        ⚠️ Bez ponude nema chatrooma
      </text>

      {/* Korisnik prima ponude */}
      <rect x="100" y="700" width="400" height="95" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="300" y="718" textAnchor="middle" fontSize="12" fontWeight="bold" fill={textColor}>
        👤 KORISNIK USLUGE
      </text>
      <text x="300" y="738" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Primljene ponude
      </text>
      <text x="300" y="756" textAnchor="middle" fontSize="11" fill={textColor}>
        1. Pregled ponuda od pružatelja
      </text>
      <text x="300" y="773" textAnchor="middle" fontSize="11" fill={textColor}>
        2. Pregled profila pružatelja
      </text>
      <text x="300" y="790" textAnchor="middle" fontSize="11" fill={textColor}>
        3. Prihvati/odbij ponudu
      </text>

      {/* Strelica između sudionika */}
      <line x1="500" y1="750" x2="700" y2="750" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />
      <text x="600" y="745" textAnchor="middle" fontSize="10" fill={textColor}>interakcija</text>

      <line x1="300" y1="800" x2="300" y2="840" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead4)" />

      {/* Odluka o ponudi */}
      <polygon points="300,840 350,880 300,920 250,880" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="300" y="885" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        Odluka?
      </text>

      {/* Prihvaćena ponuda */}
      <line x1="250" y1="880" x2="150" y2="880" stroke={textColor} strokeWidth="2" />
      <line x1="150" y1="880" x2="150" y2="900" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead4)" />

      {/* Prihvaćena ponuda - putanja */}
      <rect x="50" y="900" width="200" height="75" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="150" y="918" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        ✓ PRIHVAĆENA
      </text>
      <text x="150" y="936" textAnchor="middle" fontSize="12" fill="white">
        Status: PRIHVAĆENA
      </text>
      <text x="150" y="954" textAnchor="middle" fontSize="12" fill="white">
        Chatroom se kreira
      </text>

      {/* Odbijena ponuda */}
      <line x1="350" y1="880" x2="550" y2="880" stroke={textColor} strokeWidth="2" />
      <line x1="550" y1="880" x2="550" y2="900" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead4)" />
      <rect x="450" y="900" width="200" height="95" rx="5" fill={dangerColor} stroke={borderColor} strokeWidth="2" />
      <text x="550" y="918" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        ❌ ODBIJENA
      </text>
      <text x="550" y="936" textAnchor="middle" fontSize="12" fill="white">
        Status: ODBIJENA
      </text>
      <text x="550" y="954" textAnchor="middle" fontSize="12" fill="white">
        • Ponuda odbijena
      </text>
      <text x="550" y="972" textAnchor="middle" fontSize="12" fill="white">
        • Nema chatrooma
      </text>
      <text x="550" y="990" textAnchor="middle" fontSize="12" fill="white">
        • Pružatelj može poslati novu
      </text>

      {/* Chatroom - ZAHTIJEVA OBA SUDIONIKA */}
      <line x1="150" y1="980" x2="150" y2="1020" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead4)" />
      
      {/* Chatroom kreiranje */}
      <rect x="50" y="1020" width="200" height="115" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="3" />
      <text x="150" y="1043" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        💬 CHATROOM
      </text>
      <text x="150" y="1061" textAnchor="middle" fontSize="11" fill="white">
        ⚠️ ZAHTIJEVA:
      </text>
      <text x="150" y="1079" textAnchor="middle" fontSize="10" fill="white">
        • Korisnik usluge (vlasnik posla)
      </text>
      <text x="150" y="1094" textAnchor="middle" fontSize="10" fill="white">
        • Pružatelj (prihvaćena ponuda)
      </text>
      <text x="150" y="1109" textAnchor="middle" fontSize="10" fill="white">
        • Posao s ACCEPTED offer
      </text>
      <text x="150" y="1124" textAnchor="middle" fontSize="11" fill="white">
        ✓ Automatski kreiran
      </text>

      {/* Oba sudionika u chatu */}
      <rect x="350" y="1020" width="300" height="115" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="500" y="1043" textAnchor="middle" fontSize="12" fontWeight="bold" fill={textColor}>
        👥 OBA SUDIONIKA
      </text>
      <text x="500" y="1061" textAnchor="middle" fontSize="11" fill={textColor}>
        Komunikacija u chatroomu
      </text>
      <text x="500" y="1079" textAnchor="middle" fontSize="11" fill={textColor}>
        • Dogovor detalja
      </text>
      <text x="500" y="1094" textAnchor="middle" fontSize="11" fill={textColor}>
        • Razmjena informacija
      </text>
      <text x="500" y="1109" textAnchor="middle" fontSize="11" fill={textColor}>
        • Otkrivanje kontakata
      </text>
      <text x="500" y="1124" textAnchor="middle" fontSize="11" fill={textColor}>
        ⚠️ Bez oba sudionika nema chata
      </text>

      {/* Strelica između chatrooma i sudionika */}
      <line x1="250" y1="1080" x2="350" y2="1080" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />
      <text x="300" y="1075" textAnchor="middle" fontSize="10" fill={textColor}>koristi</text>

      <line x1="150" y1="1140" x2="150" y2="1180" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead4)" />

      {/* Odluka o izvršenju posla */}
      <polygon points="150,1180 200,1220 150,1260 100,1220" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="150" y="1225" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        Izvršen?
      </text>

      {/* Posao izvršen */}
      <line x1="150" y1="1260" x2="150" y2="1280" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead4)" />
      <rect x="50" y="1280" width="200" height="75" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="150" y="1298" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        ✓ POSAO IZVRŠEN
      </text>
      <text x="150" y="1316" textAnchor="middle" fontSize="12" fill="white">
        Status: ZAVRŠEN
      </text>
      <text x="150" y="1334" textAnchor="middle" fontSize="12" fill="white">
        Recenzije, ROI tracking
      </text>

      {/* Posao otkazan */}
      <line x1="200" y1="1220" x2="400" y2="1220" stroke={textColor} strokeWidth="2" />
      <line x1="400" y1="1220" x2="400" y2="1280" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead4)" />
      <rect x="300" y="1280" width="200" height="95" rx="5" fill={dangerColor} stroke={borderColor} strokeWidth="2" />
      <text x="400" y="1298" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        ❌ POSAO OTKAZAN
      </text>
      <text x="400" y="1316" textAnchor="middle" fontSize="12" fill="white">
        Status: OTKAZAN
      </text>
      <text x="400" y="1334" textAnchor="middle" fontSize="12" fill="white">
        • Korisnik otkazao
      </text>
      <text x="400" y="1352" textAnchor="middle" fontSize="12" fill="white">
        • Pružatelj otkazao
      </text>
      <text x="400" y="1370" textAnchor="middle" fontSize="12" fill="white">
        • Nema recenzija
      </text>

      <line x1="150" y1="1360" x2="150" y2="1400" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead4)" />

      {/* Završetak i recenzije */}
      <rect x="50" y="1400" width="200" height="115" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="150" y="1418" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Završetak posla
      </text>
      <text x="150" y="1436" textAnchor="middle" fontSize="12" fill="white">
        Status: ZAVRŠEN
      </text>
      <text x="150" y="1454" textAnchor="middle" fontSize="11" fill="white">
        👥 OBA SUDIONIKA: Recenzije
      </text>
      <text x="150" y="1469" textAnchor="middle" fontSize="10" fill="white">
        • Korisnik ocjenjuje pružatelja
      </text>
      <text x="150" y="1484" textAnchor="middle" fontSize="10" fill="white">
        • Pružatelj ocjenjuje korisnika
      </text>
      <text x="150" y="1499" textAnchor="middle" fontSize="11" fill="white">
        ⚠️ Bilateralno ocjenjivanje
      </text>
    </ZoomableSVG>
  );

  // Dijagram 5: Korištenje platforme - Pružatelj
  const ProviderJourneyFlowchart = () => (
    <ZoomableSVG viewBox="0 0 1200 1700">
      <defs>
        <marker id="arrowhead5" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill={textColor} />
        </marker>
      </defs>

      <text x="600" y="30" textAnchor="middle" fontSize="24" fontWeight="bold" fill={textColor}>
        Proces Korištenja Platforme - Pružatelj Usluga
      </text>

      {/* Prijava */}
      <rect x="500" y="60" width="200" height="50" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="90" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">
        Prijava (PRUŽATELJ)
      </text>

      <line x1="600" y1="110" x2="600" y2="150" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead5)" />

      {/* Dashboard */}
      <rect x="450" y="150" width="300" height="65" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="177" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Sučelje za pružatelja
      </text>
      <text x="600" y="197" textAnchor="middle" fontSize="12" fill={textColor}>
        Pregled poslova, leadovi, statistike
      </text>

      <line x1="600" y1="210" x2="600" y2="250" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead5)" />

      <polygon points="600,250 650,290 600,330 550,290" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="295" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        Akcija?
      </text>

      {/* Pregled poslova */}
      <line x1="550" y1="290" x2="300" y2="290" stroke={textColor} strokeWidth="2" />
      <line x1="300" y1="290" x2="300" y2="340" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead5)" />
      <rect x="100" y="340" width="400" height="95" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="300" y="363" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Pregled dostupnih poslova
      </text>
      <text x="300" y="381" textAnchor="middle" fontSize="11" fill={textColor}>
        1. Filteri (kategorija, lokacija, budžet)
      </text>
      <text x="300" y="398" textAnchor="middle" fontSize="11" fill={textColor}>
        2. Pregled detalja posla
      </text>
      <text x="300" y="415" textAnchor="middle" fontSize="11" fill={textColor}>
        3. Slanje ponude
      </text>
      <text x="300" y="432" textAnchor="middle" fontSize="11" fill={successColor}>
        ✓ Ponuda poslana
      </text>

      {/* Ekskluzivni leadovi - ZAHTIJEVA KORISNIKA koji je objavio posao */}
      <line x1="650" y1="290" x2="850" y2="290" stroke={textColor} strokeWidth="2" />
      <line x1="850" y1="290" x2="850" y2="340" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead5)" />
      
      {/* Korisnik objavio posao koji postaje lead */}
      <rect x="700" y="340" width="300" height="95" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="2" />
      <text x="850" y="358" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">
        👤 KORISNIK USLUGE
      </text>
      <text x="850" y="378" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Objavio posao → Lead
      </text>
      <text x="850" y="396" textAnchor="middle" fontSize="11" fill="white">
        • Posao postaje ekskluzivni lead
      </text>
      <text x="850" y="413" textAnchor="middle" fontSize="11" fill="white">
        • Dostupan na marketplaceu
      </text>
      <text x="850" y="430" textAnchor="middle" fontSize="11" fill="white">
        ⚠️ Bez posla nema leada
      </text>

      {/* Pružatelj kupuje lead */}
      <rect x="100" y="340" width="400" height="95" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="300" y="358" textAnchor="middle" fontSize="12" fontWeight="bold" fill={textColor}>
        👤 PRUŽATELJ
      </text>
      <text x="300" y="378" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Kupovina ekskluzivnog leada
      </text>
      <text x="300" y="396" textAnchor="middle" fontSize="11" fill={textColor}>
        1. Pregled marketplace leadova
      </text>
      <text x="300" y="413" textAnchor="middle" fontSize="11" fill={textColor}>
        2. Kupovina (krediti/Stripe)
      </text>
      <text x="300" y="430" textAnchor="middle" fontSize="11" fill={successColor}>
        3. ✓ Lead kupljen, kontakt otkriven
      </text>

      {/* Strelica između sudionika */}
      <line x1="500" y1="390" x2="700" y2="390" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />
      <text x="600" y="385" textAnchor="middle" fontSize="10" fill={textColor}>kupuje</text>

      {/* Odluka korisnika o ponudi */}
      <line x1="300" y1="440" x2="300" y2="480" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead5)" />
      
      {/* Korisnik odlučuje */}
      <rect x="700" y="480" width="300" height="95" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="2" />
      <text x="850" y="498" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">
        👤 KORISNIK USLUGE
      </text>
      <text x="850" y="518" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Odluka o ponudi
      </text>
      <text x="850" y="536" textAnchor="middle" fontSize="11" fill="white">
        • Pregled ponuda
      </text>
      <text x="850" y="553" textAnchor="middle" fontSize="11" fill="white">
        • Odabir najbolje ponude
      </text>
      <text x="850" y="570" textAnchor="middle" fontSize="11" fill="white">
        ⚠️ Bez odluke nema chatrooma
      </text>

      {/* Pružatelj čeka odluku */}
      <rect x="100" y="480" width="400" height="95" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="300" y="498" textAnchor="middle" fontSize="12" fontWeight="bold" fill={textColor}>
        👤 PRUŽATELJ
      </text>
      <text x="300" y="518" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Čeka odluku korisnika
      </text>
      <text x="300" y="536" textAnchor="middle" fontSize="11" fill={textColor}>
        • Status: NA_ČEKANJU
      </text>
      <text x="300" y="553" textAnchor="middle" fontSize="11" fill={textColor}>
        • Može biti prihvaćena ili odbijena
      </text>
      <text x="300" y="570" textAnchor="middle" fontSize="11" fill={textColor}>
        • 🔐 ADMIN: Moderacija (opcionalno)
      </text>

      {/* Strelica između sudionika */}
      <line x1="500" y1="530" x2="700" y2="530" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />
      <text x="600" y="525" textAnchor="middle" fontSize="10" fill={textColor}>odlučuje</text>

      {/* Linija od PRUŽATELJ čeka odluku korisnika do Odluka? */}
      <line x1="300" y1="575" x2="300" y2="667.5" stroke={textColor} strokeWidth="2" />
      <line x1="300" y1="667.5" x2="850" y2="667.5" stroke={textColor} strokeWidth="2" />
      
      {/* Linija od KORISNIK USLUGE Odluka o ponudi do Odluka? */}
      <line x1="850" y1="575" x2="850" y2="667.5" stroke={textColor} strokeWidth="2" />
      
      {/* Zajednička linija od točke spajanja do Odluka? */}
      <line x1="850" y1="667.5" x2="850" y2="760" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead5)" />

      {/* Odluka korisnika */}
      <polygon points="850,760 900,800 850,840 800,800" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="850" y="805" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        Odluka?
      </text>

      {/* Linija od Odluka? lijevo do PRIHVAĆENA */}
      <line x1="800" y1="800" x2="700" y2="800" stroke={textColor} strokeWidth="2" />
      <line x1="700" y1="800" x2="700" y2="840" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead5)" />

      {/* Prihvaćena */}
      <rect x="600" y="840" width="200" height="75" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="858" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        ✓ PRIHVAĆENA
      </text>
      <text x="700" y="876" textAnchor="middle" fontSize="12" fill="white">
        Status: PRIHVAĆENA
      </text>
      <text x="700" y="894" textAnchor="middle" fontSize="12" fill="white">
        Chatroom se kreira
      </text>

      {/* Odbijena */}
      <line x1="900" y1="800" x2="1050" y2="800" stroke={textColor} strokeWidth="2" />
      <line x1="1050" y1="800" x2="1050" y2="840" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead5)" />
      <rect x="950" y="840" width="200" height="95" rx="5" fill={dangerColor} stroke={borderColor} strokeWidth="2" />
      <text x="1050" y="858" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        ODBIJENA
      </text>
      <text x="1050" y="876" textAnchor="middle" fontSize="12" fill="white">
        Status: ODBIJENA
      </text>
      <text x="1050" y="894" textAnchor="middle" fontSize="12" fill="white">
        • Ponuda odbijena
      </text>
      <text x="1050" y="912" textAnchor="middle" fontSize="12" fill="white">
        • Nema chatrooma
      </text>
      <text x="1050" y="930" textAnchor="middle" fontSize="12" fill="white">
        • Pružatelj može poslati novu
      </text>

      {/* Linija od PRIHVAĆENA (lijeva strana) do PRUŽATELJ: Notifikacija (gornja strana) */}
      <line x1="600" y1="880" x2="300" y2="880" stroke={textColor} strokeWidth="2" />
      <line x1="300" y1="880" x2="300" y2="1180" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead5)" />

      {/* Notifikacija pružatelju */}
      <rect x="100" y="1180" width="400" height="65" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="300" y="1200" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        👤 PRUŽATELJ: Notifikacija
      </text>
      <text x="300" y="1220" textAnchor="middle" fontSize="12" fill={textColor}>
        Ponuda prihvaćena, chat soba kreirana
      </text>

      {/* Linija od PRIHVAĆENA do CHATROOM */}
      <line x1="700" y1="920" x2="700" y2="1000" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead5)" />

      {/* Chatroom - ZAHTIJEVA OBA SUDIONIKA */}
      <rect x="600" y="1000" width="200" height="115" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="3" />
      <text x="700" y="1023" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        💬 CHATROOM
      </text>
      <text x="700" y="1041" textAnchor="middle" fontSize="11" fill="white">
        ⚠️ ZAHTIJEVA:
      </text>
      <text x="700" y="1059" textAnchor="middle" fontSize="10" fill="white">
        • Korisnik (vlasnik posla)
      </text>
      <text x="700" y="1074" textAnchor="middle" fontSize="10" fill="white">
        • Pružatelj (prihvaćena ponuda)
      </text>
      <text x="700" y="1089" textAnchor="middle" fontSize="10" fill="white">
        • Oboje moraju biti aktivni
      </text>
      <text x="700" y="1104" textAnchor="middle" fontSize="11" fill="white">
        ✓ Automatski kreiran
      </text>

      {/* Linija od CHATROOM do OBA SUDIONIKA */}
      <line x1="700" y1="1120" x2="700" y2="1160" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead5)" />

      {/* Linija od Notifikacija do Posao u tijeku */}
      <line x1="300" y1="1240" x2="300" y2="1340" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead5)" />

      {/* Oba sudionika u chatu */}
      <rect x="550" y="1160" width="300" height="115" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="1183" textAnchor="middle" fontSize="12" fontWeight="bold" fill={textColor}>
        👥 OBA SUDIONIKA
      </text>
      <text x="700" y="1201" textAnchor="middle" fontSize="11" fill={textColor}>
        Komunikacija u chatroomu
      </text>
      <text x="700" y="1216" textAnchor="middle" fontSize="11" fill={textColor}>
        • Razmjena poruka
      </text>
      <text x="700" y="1231" textAnchor="middle" fontSize="11" fill={textColor}>
        • Otkrivanje kontakata
      </text>
      <text x="700" y="1246" textAnchor="middle" fontSize="11" fill={textColor}>
        • Dogovor detalja
      </text>
      <text x="700" y="1261" textAnchor="middle" fontSize="11" fill={textColor}>
        ⚠️ Bez oba sudionika nema chata
      </text>

      {/* Linija od OBA SUDIONIKA (donja strana) do POSAO U TIJEKU (desna strana) */}
      <line x1="700" y1="1275" x2="700" y2="1370" stroke={textColor} strokeWidth="2" />
      <line x1="700" y1="1370" x2="500" y2="1370" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead5)" />

      <rect x="100" y="1340" width="400" height="65" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="300" y="1360" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        ✓ Posao u tijeku
      </text>
      <text x="300" y="1380" textAnchor="middle" fontSize="12" fill="white">
        Status: U_TIJEKU
      </text>

      {/* Odluka o izvršenju posla */}
      <line x1="300" y1="1400" x2="300" y2="1420" stroke={textColor} strokeWidth="2" />
      
      <polygon points="300,1420 350,1460 300,1500 250,1460" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="300" y="1465" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        Izvršen?
      </text>

      {/* Posao izvršen - linija od Izvršen? lijevo do POSAO IZVRŠEN */}
      <line x1="250" y1="1460" x2="150" y2="1460" stroke={textColor} strokeWidth="2" />
      <line x1="150" y1="1460" x2="150" y2="1520" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead5)" />
      <rect x="50" y="1520" width="200" height="135" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="150" y="1538" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        ✓ POSAO IZVRŠEN
      </text>
      <text x="150" y="1555" textAnchor="middle" fontSize="12" fill="white">
        Status: ZAVRŠEN
      </text>
      <text x="150" y="1572" textAnchor="middle" fontSize="11" fill="white">
        👥 OBA SUDIONIKA: Recenzije
      </text>
      <text x="150" y="1587" textAnchor="middle" fontSize="10" fill="white">
        • Pružatelj ocjenjuje korisnika
      </text>
      <text x="150" y="1602" textAnchor="middle" fontSize="10" fill="white">
        • Korisnik ocjenjuje pružatelja
      </text>
      <text x="150" y="1617" textAnchor="middle" fontSize="10" fill="white">
        ⚠️ Bilateralno ocjenjivanje
      </text>
      <text x="150" y="1632" textAnchor="middle" fontSize="11" fill="white">
        ROI tracking, statistike
      </text>
      <text x="150" y="1647" textAnchor="middle" fontSize="11" fill="white">
        🔐 ADMIN: Moderacija recenzija
      </text>

      {/* Posao otkazan */}
      <line x1="350" y1="1460" x2="550" y2="1460" stroke={textColor} strokeWidth="2" />
      <line x1="550" y1="1460" x2="550" y2="1520" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead5)" />
      <rect x="450" y="1520" width="200" height="115" rx="5" fill={dangerColor} stroke={borderColor} strokeWidth="2" />
      <text x="550" y="1538" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        ❌ POSAO OTKAZAN
      </text>
      <text x="550" y="1555" textAnchor="middle" fontSize="12" fill="white">
        Status: OTKAZAN
      </text>
      <text x="550" y="1572" textAnchor="middle" fontSize="11" fill="white">
        ⚠️ Nema ROI statistike
      </text>
      <text x="550" y="1587" textAnchor="middle" fontSize="12" fill="white">
        👤 Korisnik otkazao
      </text>
      <text x="550" y="1602" textAnchor="middle" fontSize="12" fill="white">
        👤 Pružatelj otkazao
      </text>
      <text x="550" y="1617" textAnchor="middle" fontSize="12" fill="white">
        ❌ Nema recenzija
      </text>
    </ZoomableSVG>
  );

  // Dijagram 6: USLUGAR EXCLUSIVE Lead Sustav
  const ExclusiveLeadSystemFlowchart = () => (
    <ZoomableSVG viewBox="0 0 1400 1400">
      <defs>
        <marker id="arrowhead6" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill={textColor} />
        </marker>
      </defs>

      <text x="700" y="30" textAnchor="middle" fontSize="24" fontWeight="bold" fill={textColor}>
        USLUGAR EXCLUSIVE - Lead Sustav
      </text>

      {/* Korisnik objavljuje posao */}
      <rect x="600" y="60" width="200" height="50" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="90" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">
        Korisnik objavljuje posao
      </text>

      <line x1="700" y1="110" x2="700" y2="150" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead6)" />

      {/* Posao postaje lead */}
      <rect x="550" y="150" width="300" height="95" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="178" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Posao → Ekskluzivni Lead
      </text>
      <text x="700" y="196" textAnchor="middle" fontSize="12" fill={textColor}>
        • AI Score izračun (0-100)
      </text>
      <text x="700" y="214" textAnchor="middle" fontSize="12" fill={textColor}>
        • Verifikacija klijenta (Trust Score)
      </text>
      <text x="700" y="232" textAnchor="middle" fontSize="12" fill={textColor}>
        • Dinamička cijena (10-20 kredita)
      </text>

      <line x1="700" y1="245" x2="700" y2="270" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead6)" />

      {/* Lead na tržištu */}
      <rect x="550" y="270" width="300" height="110" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="293" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Lead na Tržištu
      </text>
      <text x="700" y="311" textAnchor="middle" fontSize="12" fill="white">
        • Status: AVAILABLE
      </text>
      <text x="700" y="329" textAnchor="middle" fontSize="12" fill="white">
        • Vidljiv providereima
      </text>
      <text x="700" y="347" textAnchor="middle" fontSize="12" fill="white">
        • AI Score prikazan
      </text>
      <text x="700" y="365" textAnchor="middle" fontSize="12" fill="white">
        • Cijena leada prikazana
      </text>

      <line x1="700" y1="380" x2="700" y2="410" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead6)" />

      {/* Pružatelj kupuje lead */}
      <polygon points="700,410 750,450 700,490 650,450" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="455" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        Kupovina?
      </text>

      {/* Kupovina leada */}
      <line x1="650" y1="450" x2="500" y2="450" stroke={textColor} strokeWidth="2" />
      <line x1="500" y1="450" x2="500" y2="497" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead6)" />
      <rect x="300" y="500" width="400" height="135" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="500" y="523" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Pružatelj kupuje lead
      </text>
      <text x="500" y="541" textAnchor="middle" fontSize="11" fill={textColor}>
        1. Pregled leadova na marketplaceu
      </text>
      <text x="500" y="558" textAnchor="middle" fontSize="11" fill={textColor}>
        2. Provjera AI Score i Trust Score
      </text>
      <text x="500" y="575" textAnchor="middle" fontSize="11" fill={textColor}>
        3. Plaćanje (krediti ili Stripe)
      </text>
      <text x="500" y="592" textAnchor="middle" fontSize="11" fill={textColor}>
        4. Lead ASSIGNED pružatelju
      </text>
      <text x="500" y="609" textAnchor="middle" fontSize="11" fill={textColor}>
        5. Kontakt otkriven (maskiran do sada)
      </text>
      <text x="500" y="620" textAnchor="middle" fontSize="11" fill={successColor}>
        ✓ Lead kupljen
      </text>

      {/* ROI Dashboard */}
      <line x1="500" y1="635" x2="500" y2="680" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead6)" />
      <rect x="300" y="680" width="400" height="115" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="2" />
      <text x="500" y="698" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        ROI Dashboard
      </text>
      <text x="500" y="716" textAnchor="middle" fontSize="11" fill="white">
        • Konverzija leadova
      </text>
      <text x="500" y="733" textAnchor="middle" fontSize="11" fill="white">
        • Ukupan prihod od leadova
      </text>
      <text x="500" y="750" textAnchor="middle" fontSize="11" fill="white">
        • Prosječna vrijednost leada
      </text>
      <text x="500" y="767" textAnchor="middle" fontSize="11" fill="white">
        • Ukupno potrošenih kredita
      </text>
      <text x="500" y="784" textAnchor="middle" fontSize="11" fill="white">
        • Grafički prikaz statistika
      </text>

      {/* Ne kupuje */}
      <line x1="750" y1="450" x2="900" y2="450" stroke={textColor} strokeWidth="2" />
      <line x1="900" y1="450" x2="900" y2="497" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead6)" />
      <rect x="800" y="500" width="200" height="65" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="900" y="523" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Lead ostaje na tržištu
      </text>
      <text x="900" y="545" textAnchor="middle" fontSize="12" fill={textColor}>
        Status: AVAILABLE
      </text>

      {/* Lead statusi */}
      <line x1="500" y1="800" x2="500" y2="840" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead6)" />
      <polygon points="500,840 550,880 500,920 450,880" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="500" y="885" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        Status leada?
      </text>

      {/* CONTACTED */}
      <line x1="450" y1="880" x2="200" y2="880" stroke={textColor} strokeWidth="2" />
      <line x1="200" y1="880" x2="200" y2="937" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead6)" />
      <rect x="100" y="940" width="200" height="75" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="200" y="958" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        CONTACTED
      </text>
      <text x="200" y="976" textAnchor="middle" fontSize="12" fill={textColor}>
        Pružatelj kontaktirao
      </text>
      <text x="200" y="994" textAnchor="middle" fontSize="12" fill={textColor}>
        Klijent odgovorio
      </text>
      <text x="200" y="1012" textAnchor="middle" fontSize="12" fill={textColor}>
        Status: CONTACTED
      </text>

      {/* CONVERTED */}
      <line x1="200" y1="1015" x2="200" y2="1060" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead6)" />
      <rect x="100" y="1060" width="200" height="75" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="200" y="1078" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        CONVERTED
      </text>
      <text x="200" y="1096" textAnchor="middle" fontSize="12" fill="white">
        Posao uspješan
      </text>
      <text x="200" y="1114" textAnchor="middle" fontSize="12" fill="white">
        ROI pozitivan
      </text>
      <text x="200" y="1132" textAnchor="middle" fontSize="12" fill="white">
        Status: CONVERTED
      </text>

      {/* REFUNDED */}
      <line x1="550" y1="880" x2="700" y2="880" stroke={textColor} strokeWidth="2" />
      <line x1="700" y1="880" x2="700" y2="937" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead6)" />
      <rect x="600" y="940" width="200" height="130" rx="5" fill={dangerColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="958" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        REFUNDED
      </text>
      <text x="700" y="976" textAnchor="middle" fontSize="12" fill="white">
        Klijent ne odgovori (48h)
      </text>
      <text x="700" y="994" textAnchor="middle" fontSize="12" fill="white">
        Lead nije kvalitetan
      </text>
      <text x="700" y="1012" textAnchor="middle" fontSize="12" fill="white">
        Automatski refund
      </text>
      <text x="700" y="1030" textAnchor="middle" fontSize="12" fill="white">
        • Stripe refund (PSD2)
      </text>
      <text x="700" y="1048" textAnchor="middle" fontSize="12" fill="white">
        • Interni krediti
      </text>
      <text x="700" y="1066" textAnchor="middle" fontSize="12" fill="white">
        Lead vraćen na tržište
      </text>

      {/* Linija od Posao → Ekskluzivni Lead do AI Score detalji (informativna veza) */}
      <line x1="850" y1="190" x2="1100" y2="190" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />
      <line x1="1100" y1="190" x2="1100" y2="940" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />

      {/* AI Score detalji */}
      <rect x="900" y="940" width="400" height="210" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="1100" y="958" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        AI Score Kvalitete Leadova
      </text>
      <text x="1100" y="976" textAnchor="middle" fontSize="11" fill={textColor}>
        • Verificiranje telefona (+10)
      </text>
      <text x="1100" y="993" textAnchor="middle" fontSize="11" fill={textColor}>
        • Verificiranje emaila (+10)
      </text>
      <text x="1100" y="1010" textAnchor="middle" fontSize="11" fill={textColor}>
        • Verificiranje OIB-a (+15)
      </text>
      <text x="1100" y="1027" textAnchor="middle" fontSize="11" fill={textColor}>
        • Verificiranje firme (+20)
      </text>
      <text x="1100" y="1044" textAnchor="middle" fontSize="11" fill={textColor}>
        • Povijest na platformi (+15)
      </text>
      <text x="1100" y="1061" textAnchor="middle" fontSize="11" fill={textColor}>
        • Detaljnost opisa posla (+10)
      </text>
      <text x="1100" y="1078" textAnchor="middle" fontSize="11" fill={textColor}>
        • Budžet realističan (+10)
      </text>
      <text x="1100" y="1095" textAnchor="middle" fontSize="11" fill={textColor}>
        • Lokacija specificirana (+5)
      </text>
      <text x="1100" y="1112" textAnchor="middle" fontSize="11" fill={textColor}>
        • Hitnost posla (+5)
      </text>
      <text x="1100" y="1129" textAnchor="middle" fontSize="11" fill={textColor}>
        • Ukupno: 0-100 score
      </text>
    </ZoomableSVG>
  );

  // Dijagram 7: Queue Sustav i Distribucija Leadova
  const QueueSystemFlowchart = () => (
    <ZoomableSVG viewBox="0 0 1400 1200">
      <defs>
        <marker id="arrowhead7" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill={textColor} />
        </marker>
      </defs>

      <text x="700" y="30" textAnchor="middle" fontSize="24" fontWeight="bold" fill={textColor}>
        Queue Sustav za Distribuciju Leadova
      </text>

      {/* Lead kreiran */}
      <rect x="600" y="60" width="200" height="50" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="90" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">
        Lead kreiran
      </text>

      <line x1="700" y1="110" x2="700" y2="150" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead7)" />

      {/* LeadQueue kreiranje */}
      <rect x="550" y="150" width="300" height="110" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="173" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        LeadQueue Entry
      </text>
      <text x="700" y="191" textAnchor="middle" fontSize="12" fill={textColor}>
        • Status: WAITING
      </text>
      <text x="700" y="209" textAnchor="middle" fontSize="12" fill={textColor}>
        • Pozicija u redu čekanja
      </text>
      <text x="700" y="227" textAnchor="middle" fontSize="12" fill={textColor}>
        • Matchmaking algoritam (kategorija, regija)
      </text>
      <text x="700" y="245" textAnchor="middle" fontSize="12" fill={textColor}>
        • Weighted Queue (Partner Score)
      </text>

      <line x1="700" y1="260" x2="700" y2="290" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead7)" />

      {/* Queue Scheduler */}
      <rect x="550" y="290" width="300" height="110" rx="5" fill={dangerColor} stroke={borderColor} strokeWidth="3" />
      <text x="700" y="313" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">
        🔐 Queue Scheduler
      </text>
      <text x="700" y="331" textAnchor="middle" fontSize="12" fill="white">
        • Provjera svakih sat vremena
      </text>
      <text x="700" y="349" textAnchor="middle" fontSize="12" fill="white">
        • Automatska distribucija leadova
      </text>
      <text x="700" y="367" textAnchor="middle" fontSize="12" fill="white">
        • Partner Score izračun
      </text>
      <text x="700" y="385" textAnchor="middle" fontSize="12" fill="white">
        • Fairness algoritam
      </text>

      <line x1="700" y1="400" x2="700" y2="430" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead7)" />

      {/* Partner Score izračun */}
      <rect x="525" y="430" width="350" height="170" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="448" textAnchor="middle" fontSize="13" fontWeight="bold" fill={textColor}>
        Partner Score Izračun
      </text>
      <text x="700" y="466" textAnchor="middle" fontSize="11" fill={textColor}>
        • Reputation Score (0-100): 40%
      </text>
      <text x="700" y="483" textAnchor="middle" fontSize="11" fill={textColor}>
        • Response Rate: 25%
      </text>
      <text x="700" y="500" textAnchor="middle" fontSize="11" fill={textColor}>
        • Completion Rate: 20%
      </text>
      <text x="700" y="517" textAnchor="middle" fontSize="11" fill={textColor}>
        • Platform Compliance: 15%
      </text>
      <text x="700" y="534" textAnchor="middle" fontSize="11" fill={textColor}>
        • Match Score (kategorija + regija): bonus
      </text>
      <text x="700" y="551" textAnchor="middle" fontSize="11" fill={textColor}>
        • Premium Partner (Score &ge; 80): prioritet
      </text>
      <text x="700" y="568" textAnchor="middle" fontSize="11" fill={textColor}>
        • Verified Partner (Score 60-79): normalan
      </text>
      <text x="700" y="585" textAnchor="middle" fontSize="11" fill={textColor}>
        • Basic Partner (Score &lt; 60): niži prioritet
      </text>

      <line x1="700" y1="600" x2="700" y2="650" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead7)" />

      {/* Lead ponuđen pružatelju */}
      <polygon points="700,650 750,690 700,730 650,690" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="695" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        Lead ponuđen?
      </text>

      {/* OFFERED - direktna veza od Lead ponuđen? (da) */}
      <line x1="650" y1="690" x2="500" y2="690" stroke={textColor} strokeWidth="2" />
      <line x1="500" y1="690" x2="500" y2="750" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead7)" />
      <text x="575" y="685" textAnchor="middle" fontSize="10" fill={textColor}>da</text>

      {/* Veza natrag u Queue Scheduler (ne) - isprekidana linija */}
      <line x1="750" y1="690" x2="900" y2="690" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />
      <line x1="900" y1="690" x2="900" y2="340" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />
      <line x1="900" y1="340" x2="850" y2="340" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead7)" />
      <text x="825" y="685" textAnchor="middle" fontSize="10" fill={textColor}>ne</text>
      <rect x="350" y="750" width="300" height="95" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="500" y="768" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Status: OFFERED
      </text>
      <text x="500" y="786" textAnchor="middle" fontSize="11" fill={textColor}>
        • Lead ponuđen pružatelju
      </text>
      <text x="500" y="803" textAnchor="middle" fontSize="11" fill={textColor}>
        • Notifikacija poslana (email, SMS, in-app)
      </text>
      <text x="500" y="820" textAnchor="middle" fontSize="11" fill={textColor}>
        • Rok za odgovor: 24h
      </text>
      <text x="500" y="837" textAnchor="middle" fontSize="11" fill={textColor}>
        • Pozicija u redu: prikazana
      </text>

      <line x1="500" y1="850" x2="500" y2="890" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead7)" />

      {/* Odgovor pružatelja */}
      <polygon points="500,890 550,930 500,970 450,930" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="500" y="935" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        Odgovor?
      </text>

      {/* INTERESTED - da */}
      <line x1="450" y1="930" x2="300" y2="930" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead7)" />
      <text x="375" y="925" textAnchor="middle" fontSize="10" fill={textColor}>da</text>
      <rect x="100" y="890" width="200" height="75" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="200" y="908" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        INTERESTED
      </text>
      <text x="200" y="926" textAnchor="middle" fontSize="12" fill="white">
        Status: ACCEPTED
      </text>
      <text x="200" y="944" textAnchor="middle" fontSize="12" fill="white">
        Lead dodijeljen
      </text>
      <text x="200" y="962" textAnchor="middle" fontSize="12" fill="white">
        Kontakt otkriven
      </text>

      {/* Ne - vodi u Tip odbijanja */}
      <line x1="550" y1="930" x2="700" y2="930" stroke={textColor} strokeWidth="2" />
      <line x1="700" y1="930" x2="700" y2="1000" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead7)" />
      <text x="625" y="925" textAnchor="middle" fontSize="10" fill={textColor}>ne</text>

      {/* Tip odbijanja - drugi dijamant */}
      <polygon points="700,1000 750,1040 700,1080 650,1040" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="1045" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        Tip?
      </text>

      {/* NOT_INTERESTED */}
      <line x1="650" y1="1040" x2="500" y2="1040" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead7)" />
      <rect x="300" y="1000" width="200" height="75" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="400" y="1018" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        NOT_INTERESTED
      </text>
      <text x="400" y="1036" textAnchor="middle" fontSize="12" fill={textColor}>
        Status: DECLINED
      </text>
      <text x="400" y="1054" textAnchor="middle" fontSize="12" fill={textColor}>
        Lead ponuđen sljedećem
      </text>
      <text x="400" y="1072" textAnchor="middle" fontSize="12" fill={textColor}>
        Queue se nastavlja
      </text>

      {/* Veza natrag u Queue Scheduler od NOT_INTERESTED */}
      <line x1="300" y1="1040" x2="50" y2="1040" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />
      <line x1="50" y1="1040" x2="50" y2="340" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />
      <line x1="50" y1="340" x2="550" y2="340" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead7)" />

      {/* NO_RESPONSE / EXPIRED */}
      <line x1="750" y1="1040" x2="800" y2="1040" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead7)" />
      <rect x="800" y="990" width="200" height="95" rx="5" fill={dangerColor} stroke={borderColor} strokeWidth="2" />
      <text x="900" y="1008" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        NO_RESPONSE
      </text>
      <text x="900" y="1026" textAnchor="middle" fontSize="12" fill="white">
        Status: EXPIRED
      </text>
      <text x="900" y="1044" textAnchor="middle" fontSize="12" fill="white">
        Rok istekao (24h)
      </text>
      <text x="900" y="1062" textAnchor="middle" fontSize="12" fill="white">
        Preskakanje neaktivnog
      </text>
      <text x="900" y="1080" textAnchor="middle" fontSize="12" fill="white">
        Lead ponuđen sljedećem
      </text>

      {/* Veza natrag u Queue Scheduler od NO_RESPONSE */}
      <line x1="1000" y1="1040" x2="1100" y2="1040" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />
      <line x1="1100" y1="1040" x2="1100" y2="340" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />
      <line x1="1100" y1="340" x2="850" y2="340" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead7)" />

      {/* SKIPPED */}
      <line x1="700" y1="1080" x2="700" y2="1120" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead7)" />
      <rect x="600" y="1120" width="200" height="75" rx="5" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="1138" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        SKIPPED
      </text>
      <text x="700" y="1156" textAnchor="middle" fontSize="12" fill="white">
        Pružatelj preskočio
      </text>
      <text x="700" y="1174" textAnchor="middle" fontSize="12" fill="white">
        Lead ponuđen sljedećem
      </text>
      <text x="700" y="1192" textAnchor="middle" fontSize="12" fill="white">
        Queue se nastavlja
      </text>

      {/* Veza natrag u Queue Scheduler od SKIPPED */}
      <line x1="600" y1="1160" x2="50" y2="1160" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />
      <line x1="50" y1="1160" x2="50" y2="340" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />
      <line x1="50" y1="340" x2="550" y2="340" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead7)" />
    </ZoomableSVG>
  );

  // Dijagram 8: Refund i Kreditni Sustav
  const RefundSystemFlowchart = () => (
    <ZoomableSVG viewBox="0 0 1400 1000">
      <defs>
        <marker id="arrowhead8" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill={textColor} />
        </marker>
      </defs>

      <text x="700" y="30" textAnchor="middle" fontSize="24" fontWeight="bold" fill={textColor}>
        Refund i Kreditni Sustav
      </text>

      {/* Lead kupljen */}
      <rect x="600" y="60" width="200" height="50" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="90" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">
        Lead kupljen
      </text>

      <line x1="700" y1="110" x2="700" y2="150" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead8)" />

      {/* Kontakt pokušaj */}
      <rect x="550" y="150" width="300" height="90" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="173" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Pružatelj kontaktira klijenta
      </text>
      <text x="700" y="191" textAnchor="middle" fontSize="12" fill={textColor}>
        • Email, telefon, chat
      </text>
      <text x="700" y="209" textAnchor="middle" fontSize="12" fill={textColor}>
        • Rok za odgovor: 48h
      </text>
      <text x="700" y="227" textAnchor="middle" fontSize="12" fill={textColor}>
        • Tracking aktivnosti
      </text>

      <line x1="700" y1="240" x2="700" y2="270" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead8)" />

      {/* Odluka o refundu */}
      <polygon points="700,270 750,310 700,350 650,310" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="315" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        Klijent odgovorio?
      </text>

      {/* DA - nema refunda */}
      <line x1="650" y1="310" x2="300" y2="310" stroke={textColor} strokeWidth="2" />
      <line x1="300" y1="310" x2="300" y2="370" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead8)" />
      <text x="475" y="305" textAnchor="middle" fontSize="10" fill={textColor}>da</text>
      
      <rect x="200" y="370" width="200" height="75" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="300" y="388" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Klijent odgovorio
      </text>
      <text x="300" y="406" textAnchor="middle" fontSize="12" fill="white">
        • Nema refunda
      </text>
      <text x="300" y="424" textAnchor="middle" fontSize="12" fill="white">
        • Lead aktivan
      </text>
      <text x="300" y="442" textAnchor="middle" fontSize="12" fill="white">
        • Status: CONTACTED
      </text>

      {/* Linija od Klijent odgovorio (sredina donje stranice) do Kreditni sustav (sredina gornje stranice) */}
      <line x1="300" y1="445" x2="300" y2="510" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />

      {/* NE - refund */}
      <line x1="750" y1="310" x2="900" y2="310" stroke={textColor} strokeWidth="2" />
      <line x1="900" y1="310" x2="900" y2="370" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead8)" />
      <text x="825" y="305" textAnchor="middle" fontSize="10" fill={textColor}>ne</text>
      <rect x="800" y="370" width="200" height="95" rx="5" fill={dangerColor} stroke={borderColor} strokeWidth="2" />
      <text x="900" y="388" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Klijent nije odgovorio
      </text>
      <text x="900" y="406" textAnchor="middle" fontSize="12" fill="white">
        • 48h neaktivnosti
      </text>
      <text x="900" y="424" textAnchor="middle" fontSize="12" fill="white">
        • Automatski refund
      </text>
      <text x="900" y="442" textAnchor="middle" fontSize="12" fill="white">
        • Lead nije kvalitetan
      </text>
      <text x="900" y="460" textAnchor="middle" fontSize="12" fill="white">
        • Ručno zatraživanje
      </text>

      <line x1="900" y1="470" x2="900" y2="547.5" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead8)" />

      {/* Refund proces */}
      <rect x="800" y="547.5" width="200" height="135" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="900" y="565.5" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Refund Proces
      </text>
      <text x="900" y="583.5" textAnchor="middle" fontSize="11" fill={textColor}>
        1. Provjera načina plaćanja
      </text>
      <text x="900" y="600.5" textAnchor="middle" fontSize="11" fill={textColor}>
        2. Stripe Payment Intent?
      </text>
      <text x="900" y="617.5" textAnchor="middle" fontSize="11" fill={textColor}>
        3. Stripe refund API (PSD2)
      </text>
      <text x="900" y="634.5" textAnchor="middle" fontSize="11" fill={textColor}>
        • Interni krediti (fallback)
      </text>
      <text x="900" y="651.5" textAnchor="middle" fontSize="11" fill={textColor}>
        4. CreditTransaction: REFUND
      </text>
      <text x="900" y="668.5" textAnchor="middle" fontSize="11" fill={textColor}>
        5. Lead oslobođen (vraćen na tržište)
      </text>
      <text x="900" y="677.5" textAnchor="middle" fontSize="11" fill={successColor}>
        ✓ Refund uspješan
      </text>

      {/* Linija od Razlozi za Refund (lijevi kraj) do Refund Proces (desni kraj) */}
      <line x1="1100" y1="615" x2="1000" y2="615" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />
      <text x="1050" y="610" textAnchor="middle" fontSize="10" fill={textColor}>razlozi</text>

      {/* Linija od Kreditni sustav (desni kraj) do Refund Proces (lijevi kraj) */}
      <line x1="500" y1="615" x2="800" y2="615" stroke={textColor} strokeWidth="2" strokeDasharray="5,5" />
      <text x="650" y="610" textAnchor="middle" fontSize="10" fill={textColor}>fallback krediti</text>

      {/* Kreditni sustav */}
      <rect x="100" y="510" width="400" height="210" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="2" />
      <text x="300" y="528" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Kreditni Sustav
      </text>
      <text x="300" y="546" textAnchor="middle" fontSize="11" fill="white">
        • 1 kredit ≈ 10€
      </text>
      <text x="300" y="563" textAnchor="middle" fontSize="11" fill="white">
        • Dobivaju se pretplatom
      </text>
      <text x="300" y="580" textAnchor="middle" fontSize="11" fill="white">
        • Pay-per-credit (Stripe)
      </text>
      <text x="300" y="597" textAnchor="middle" fontSize="11" fill="white">
        • TRIAL: 8 leadova (besplatno)
      </text>
      <text x="300" y="614" textAnchor="middle" fontSize="11" fill="white">
        • BASIC: 10 kredita/mjesec
      </text>
      <text x="300" y="631" textAnchor="middle" fontSize="11" fill="white">
        • PREMIUM: 50 kredita/mjesec
      </text>
      <text x="300" y="648" textAnchor="middle" fontSize="11" fill="white">
        • PRO: Unlimited krediti
      </text>
      <text x="300" y="665" textAnchor="middle" fontSize="11" fill="white">
        • Povijest transakcija
      </text>
      <text x="300" y="682" textAnchor="middle" fontSize="11" fill="white">
        • Filtriranje po tipu
      </text>
      <text x="300" y="699" textAnchor="middle" fontSize="11" fill="white">
        • Izvoz povijesti
      </text>
      <text x="300" y="716" textAnchor="middle" fontSize="11" fill="white">
        • Notifikacije o transakcijama
      </text>

      {/* Refund razlozi */}
      <rect x="1100" y="510" width="300" height="210" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="1250" y="528" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Razlozi za Refund
      </text>
      <text x="1250" y="546" textAnchor="middle" fontSize="11" fill={textColor}>
        • Klijent nije odgovorio (48h)
      </text>
      <text x="1250" y="563" textAnchor="middle" fontSize="11" fill={textColor}>
        • Lead nije kvalitetan
      </text>
      <text x="1250" y="580" textAnchor="middle" fontSize="11" fill={textColor}>
        • Duplikat leada
      </text>
      <text x="1250" y="597" textAnchor="middle" fontSize="11" fill={textColor}>
        • Lažni kontakt podaci
      </text>
      <text x="1250" y="614" textAnchor="middle" fontSize="11" fill={textColor}>
        • Ručno zatraživanje
      </text>
      <text x="1250" y="631" textAnchor="middle" fontSize="11" fill={textColor}>
        • Automatski refund (48h)
      </text>
      <text x="1250" y="648" textAnchor="middle" fontSize="11" fill={textColor}>
        • Refund za pretplate
      </text>
      <text x="1250" y="665" textAnchor="middle" fontSize="11" fill={textColor}>
        • Stripe refund ID tracking
      </text>
      <text x="1250" y="682" textAnchor="middle" fontSize="11" fill={textColor}>
        • Fallback na interne kredite
      </text>
      <text x="1250" y="699" textAnchor="middle" fontSize="11" fill={textColor}>
        • Povijest refund transakcija
      </text>
      <text x="1250" y="716" textAnchor="middle" fontSize="11" fill={textColor}>
        • Status: REFUNDED
      </text>
    </ZoomableSVG>
  );

  // Dijagram 9: Notifikacije i Komunikacija
  const NotificationsFlowchart = () => (
    <ZoomableSVG viewBox="0 0 1400 1100">
      <defs>
        <marker id="arrowhead9" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill={textColor} />
        </marker>
      </defs>

      <text x="700" y="30" textAnchor="middle" fontSize="24" fontWeight="bold" fill={textColor}>
        Notifikacije i Komunikacija
      </text>

      {/* Event trigger */}
      <rect x="600" y="60" width="200" height="50" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="90" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">
        Event se dogodio
      </text>

      <line x1="700" y1="110" x2="700" y2="150" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead9)" />

      {/* Notifikacijski sustav */}
      <rect x="550" y="150" width="300" height="105" rx="5" fill={dangerColor} stroke={borderColor} strokeWidth="3" />
      <text x="700" y="173" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">
        🔔 Notifikacijski Sustav
      </text>
      <text x="700" y="191" textAnchor="middle" fontSize="12" fill="white">
        • Automatska detekcija eventa
      </text>
      <text x="700" y="209" textAnchor="middle" fontSize="12" fill="white">
        • Routing prema korisniku
      </text>
      <text x="700" y="227" textAnchor="middle" fontSize="12" fill="white">
        • Multi-channel slanje
      </text>
      <text x="700" y="245" textAnchor="middle" fontSize="12" fill="white">
        • Brojač nepročitanih notifikacija
      </text>

      <line x1="700" y1="255" x2="700" y2="290" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead9)" />

      {/* Tipovi notifikacija */}
      <rect x="200" y="290" width="1000" height="195" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="313" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Tipovi Notifikacija
      </text>

      {/* Email */}
      <rect x="250" y="340" width="220" height="140" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="360" y="358" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        📧 Email Notifikacije
      </text>
      <text x="360" y="376" textAnchor="middle" fontSize="11" fill="white">
        • Nove ponude
      </text>
      <text x="360" y="393" textAnchor="middle" fontSize="11" fill="white">
        • Prihvaćene ponude
      </text>
      <text x="360" y="410" textAnchor="middle" fontSize="11" fill="white">
        • Nove poruke
      </text>
      <text x="360" y="427" textAnchor="middle" fontSize="11" fill="white">
        • Novi poslovi
      </text>
      <text x="360" y="444" textAnchor="middle" fontSize="11" fill="white">
        • Job alerts (DAILY, WEEKLY, INSTANT)
      </text>
      <text x="360" y="461" textAnchor="middle" fontSize="11" fill="white">
        • Istek pretplate
      </text>

      {/* SMS */}
      <rect x="490" y="340" width="220" height="140" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="358" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        📱 SMS Notifikacije (Twilio)
      </text>
      <text x="600" y="376" textAnchor="middle" fontSize="11" fill="white">
        • Verifikacija telefona
      </text>
      <text x="600" y="393" textAnchor="middle" fontSize="11" fill="white">
        • Hitne notifikacije
      </text>
      <text x="600" y="410" textAnchor="middle" fontSize="11" fill="white">
        • Nove ponude (PRO plan)
      </text>
      <text x="600" y="427" textAnchor="middle" fontSize="11" fill="white">
        • Lead u redu čekanja
      </text>
      <text x="600" y="444" textAnchor="middle" fontSize="11" fill="white">
        • Rate limiting
      </text>
      <text x="600" y="461" textAnchor="middle" fontSize="11" fill="white">
        • SMS log tracking
      </text>

      {/* In-App */}
      <rect x="730" y="340" width="220" height="140" rx="5" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="840" y="358" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        🔔 In-App Notifikacije
      </text>
      <text x="840" y="376" textAnchor="middle" fontSize="11" fill="white">
        • Real-time obavijesti
      </text>
      <text x="840" y="393" textAnchor="middle" fontSize="11" fill="white">
        • Brojač nepročitanih
      </text>
      <text x="840" y="410" textAnchor="middle" fontSize="11" fill="white">
        • Povijest notifikacija
      </text>
      <text x="840" y="427" textAnchor="middle" fontSize="11" fill="white">
        • Mark as read
      </text>
      <text x="840" y="444" textAnchor="middle" fontSize="11" fill="white">
        • Filteri po tipu
      </text>
      <text x="840" y="461" textAnchor="middle" fontSize="11" fill="white">
        • Socket.io real-time
      </text>

      {/* Push */}
      <rect x="970" y="340" width="220" height="140" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="1080" y="358" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        📲 Push Notifikacije
      </text>
      <text x="1080" y="376" textAnchor="middle" fontSize="11" fill={textColor}>
        • Browser notifications
      </text>
      <text x="1080" y="393" textAnchor="middle" fontSize="11" fill={textColor}>
        • Permission request
      </text>
      <text x="1080" y="410" textAnchor="middle" fontSize="11" fill={textColor}>
        • Desktop notifikacije
      </text>
      <text x="1080" y="427" textAnchor="middle" fontSize="11" fill={textColor}>
        • Mobile web support
      </text>
      <text x="1080" y="444" textAnchor="middle" fontSize="11" fill={textColor}>
        • Custom zvukovi
      </text>
      <text x="1080" y="461" textAnchor="middle" fontSize="11" fill={textColor}>
        • Notification settings
      </text>

      {/* Eventi koji pokreću notifikacije */}
      <line x1="700" y1="480" x2="700" y2="530" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead9)" />
      <rect x="200" y="530" width="1000" height="310" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="553" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Eventi koji Pokreću Notifikacije
      </text>

      {/* Korisnik usluge */}
      <rect x="250" y="580" width="300" height="240" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="2" />
      <text x="400" y="603" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        👤 Korisnik Usluge
      </text>
      <text x="400" y="621" textAnchor="middle" fontSize="11" fill="white">
        • Nova ponuda za posao
      </text>
      <text x="400" y="638" textAnchor="middle" fontSize="11" fill="white">
        • Ponuda prihvaćena/odbijena
      </text>
      <text x="400" y="655" textAnchor="middle" fontSize="11" fill="white">
        • Nova poruka u chatu
      </text>
      <text x="400" y="672" textAnchor="middle" fontSize="11" fill="white">
        • Posao završen (recenzija)
      </text>
      <text x="400" y="689" textAnchor="middle" fontSize="11" fill="white">
        • Job alert (novi poslovi)
      </text>
      <text x="400" y="706" textAnchor="middle" fontSize="11" fill="white">
        • Istek pretplate
      </text>
      <text x="400" y="723" textAnchor="middle" fontSize="11" fill="white">
        • Refund zahtjev odobren
      </text>
      <text x="400" y="740" textAnchor="middle" fontSize="11" fill="white">
        • Verifikacija emaila/telefona
      </text>
      <text x="400" y="757" textAnchor="middle" fontSize="11" fill="white">
        • Admin odgovor na ticket
      </text>
      <text x="400" y="774" textAnchor="middle" fontSize="11" fill="white">
        • KYC verifikacija odobrena/odbijena
      </text>
      <text x="400" y="791" textAnchor="middle" fontSize="11" fill="white">
        • Licenca odobrena/odbijena
      </text>
      <text x="400" y="808" textAnchor="middle" fontSize="11" fill="white">
        • Posao odobren/odbijen (moderacija)
      </text>

      {/* Pružatelj */}
      <rect x="570" y="580" width="300" height="240" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="720" y="603" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        👤 Pružatelj Usluga
      </text>
      <text x="720" y="621" textAnchor="middle" fontSize="11" fill="white">
        • Novi posao objavljen
      </text>
      <text x="720" y="638" textAnchor="middle" fontSize="11" fill="white">
        • Ponuda prihvaćena/odbijena
      </text>
      <text x="720" y="655" textAnchor="middle" fontSize="11" fill="white">
        • Nova poruka u chatu
      </text>
      <text x="720" y="672" textAnchor="middle" fontSize="11" fill="white">
        • Lead u redu čekanja (OFFERED)
      </text>
      <text x="720" y="689" textAnchor="middle" fontSize="11" fill="white">
        • Lead dodijeljen (ACCEPTED)
      </text>
      <text x="720" y="706" textAnchor="middle" fontSize="11" fill="white">
        • Refund odobren
      </text>
      <text x="720" y="723" textAnchor="middle" fontSize="11" fill="white">
        • Istek pretplate/kredita
      </text>
      <text x="720" y="740" textAnchor="middle" fontSize="11" fill="white">
        • KYC verifikacija odobrena/odbijena
      </text>
      <text x="720" y="757" textAnchor="middle" fontSize="11" fill="white">
        • Licenca odobrena/odbijena
      </text>
      <text x="720" y="774" textAnchor="middle" fontSize="11" fill="white">
        • Upsell ponuda (Add-on)
      </text>
      <text x="720" y="791" textAnchor="middle" fontSize="11" fill="white">
        • TRIAL podsjetnik (3 dana)
      </text>
      <text x="720" y="808" textAnchor="middle" fontSize="11" fill="white">
        • Admin odgovor na ticket
      </text>

      {/* Admin */}
      <rect x="890" y="580" width="300" height="240" rx="5" fill={dangerColor} stroke={borderColor} strokeWidth="2" />
      <text x="1040" y="603" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        🔐 ADMIN
      </text>
      <text x="1040" y="621" textAnchor="middle" fontSize="11" fill="white">
        • Novi KYC zahtjev
      </text>
      <text x="1040" y="638" textAnchor="middle" fontSize="11" fill="white">
        • Nova licenca za provjeru
      </text>
      <text x="1040" y="655" textAnchor="middle" fontSize="11" fill="white">
        • Posao za moderaciju
      </text>
      <text x="1040" y="672" textAnchor="middle" fontSize="11" fill="white">
        • Prijava lažne recenzije
      </text>
      <text x="1040" y="689" textAnchor="middle" fontSize="11" fill="white">
        • Support ticket (VIP)
      </text>
      <text x="1040" y="706" textAnchor="middle" fontSize="11" fill="white">
        • Error log (kritičan)
      </text>
      <text x="1040" y="723" textAnchor="middle" fontSize="11" fill="white">
        • API request anomalije
      </text>
      <text x="1040" y="740" textAnchor="middle" fontSize="11" fill="white">
        • Refund zahtjev
      </text>
      <text x="1040" y="757" textAnchor="middle" fontSize="11" fill="white">
        • Stripe webhook error
      </text>
      <text x="1040" y="774" textAnchor="middle" fontSize="11" fill="white">
        • Queue scheduler error
      </text>
      <text x="1040" y="791" textAnchor="middle" fontSize="11" fill="white">
        • SMS sending failure
      </text>
      <text x="1040" y="808" textAnchor="middle" fontSize="11" fill="white">
        • Email sending failure
      </text>

      {/* Notifikacijski kanali */}
      <line x1="700" y1="820" x2="700" y2="870" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead9)" />
      <rect x="200" y="870" width="1000" height="115" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="888" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Notifikacijski Kanal
      </text>
      <text x="700" y="906" textAnchor="middle" fontSize="12" fill="white">
        • Email: uvijek aktivno (osim ako korisnik ne onemogući)
      </text>
      <text x="700" y="924" textAnchor="middle" fontSize="12" fill="white">
        • SMS: PREMIUM/PRO planovi, verifikacije, hitne notifikacije
      </text>
      <text x="700" y="942" textAnchor="middle" fontSize="12" fill="white">
        • In-App: uvijek aktivno, real-time preko Socket.io
      </text>
      <text x="700" y="960" textAnchor="middle" fontSize="12" fill="white">
        • Push: opcionalno, zahtijeva permission, desktop/mobile web
      </text>
    </ZoomableSVG>
  );

  // Dijagram 10: Reputacijski Sustav i Trust Score
  const ReputationSystemFlowchart = () => (
    <ZoomableSVG viewBox="0 0 1400 1300">
      <defs>
        <marker id="arrowhead10" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill={textColor} />
        </marker>
      </defs>

      <text x="700" y="30" textAnchor="middle" fontSize="24" fontWeight="bold" fill={textColor}>
        Reputacijski Sustav i Trust Score
      </text>

      {/* Pružatelj */}
      <rect x="600" y="60" width="200" height="50" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="90" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">
        Pružatelj Usluga
      </text>

      <line x1="700" y1="110" x2="700" y2="150" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead10)" />

      {/* Reputation Score komponente */}
      <rect x="200" y="150" width="1000" height="315" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="173" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Reputation Score Komponente (0-100)
      </text>

      {/* Prosječna ocjena */}
      <rect x="250" y="200" width="220" height="245" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="2" />
      <text x="360" y="223" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Prosječna Ocjena (40%)
      </text>
      <text x="360" y="241" textAnchor="middle" fontSize="11" fill="white">
        • Bilateralno ocjenjivanje
      </text>
      <text x="360" y="258" textAnchor="middle" fontSize="11" fill="white">
        • 1-5 zvjezdica
      </text>
      <text x="360" y="275" textAnchor="middle" fontSize="11" fill="white">
        • Komentari i recenzije
      </text>
      <text x="360" y="292" textAnchor="middle" fontSize="11" fill="white">
        • Automatski izračun
      </text>
      <text x="360" y="309" textAnchor="middle" fontSize="11" fill="white">
        • Ponderirane komponente:
      </text>
      <text x="360" y="326" textAnchor="middle" fontSize="10" fill="white">
        - Kvaliteta rada: 50%
      </text>
      <text x="360" y="343" textAnchor="middle" fontSize="10" fill="white">
        - Pouzdanost: 30%
      </text>
      <text x="360" y="360" textAnchor="middle" fontSize="10" fill="white">
        - Komunikacija: 20%
      </text>
      <text x="360" y="377" textAnchor="middle" fontSize="11" fill="white">
        • Moderacija (AI + ljudska)
      </text>
      <text x="360" y="394" textAnchor="middle" fontSize="11" fill="white">
        • Prijava lažnih ocjena
      </text>
      <text x="360" y="411" textAnchor="middle" fontSize="11" fill="white">
        • Odgovor na recenziju (1x)
      </text>
      <text x="360" y="428" textAnchor="middle" fontSize="11" fill="white">
        • Simultana objava (10 dana)
      </text>

      {/* Prosječno vrijeme odgovora */}
      <rect x="490" y="200" width="220" height="245" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="223" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Prosječno Vrijeme Odgovora (25%)
      </text>
      <text x="600" y="241" textAnchor="middle" fontSize="11" fill="white">
        • avgResponseTimeMinutes
      </text>
      <text x="600" y="258" textAnchor="middle" fontSize="11" fill="white">
        • Praćenje vremena odgovora
      </text>
      <text x="600" y="275" textAnchor="middle" fontSize="11" fill="white">
        • Na leadove
      </text>
      <text x="600" y="292" textAnchor="middle" fontSize="11" fill="white">
        • Na poruke u chatu
      </text>
      <text x="600" y="309" textAnchor="middle" fontSize="11" fill="white">
        • Na ponude
      </text>
      <text x="600" y="326" textAnchor="middle" fontSize="11" fill="white">
        • &lt; 1h: +20 bodova
      </text>
      <text x="600" y="343" textAnchor="middle" fontSize="11" fill="white">
        • &lt; 4h: +15 bodova
      </text>
      <text x="600" y="360" textAnchor="middle" fontSize="11" fill="white">
        • &lt; 24h: +10 bodova
      </text>
      <text x="600" y="377" textAnchor="middle" fontSize="11" fill="white">
        • &gt; 24h: +5 bodova
      </text>
      <text x="600" y="394" textAnchor="middle" fontSize="11" fill="white">
        • &gt; 48h: 0 bodova
      </text>
      <text x="600" y="411" textAnchor="middle" fontSize="11" fill="white">
        • Integracija s lead matching
      </text>
      <text x="600" y="428" textAnchor="middle" fontSize="11" fill="white">
        • Prikaz na profilu
      </text>

      {/* Stopa konverzije */}
      <rect x="730" y="200" width="220" height="245" rx="5" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="840" y="223" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Stopa Konverzije (20%)
      </text>
      <text x="840" y="241" textAnchor="middle" fontSize="11" fill="white">
        • conversionRate
      </text>
      <text x="840" y="258" textAnchor="middle" fontSize="11" fill="white">
        • Lead → Posao
      </text>
      <text x="840" y="275" textAnchor="middle" fontSize="11" fill="white">
        • Ponuda → Prihvaćena
      </text>
      <text x="840" y="292" textAnchor="middle" fontSize="11" fill="white">
        • Posao → Završen
      </text>
      <text x="840" y="309" textAnchor="middle" fontSize="11" fill="white">
        • &gt; 50%: +20 bodova
      </text>
      <text x="840" y="326" textAnchor="middle" fontSize="11" fill="white">
        • 30-50%: +15 bodova
      </text>
      <text x="840" y="343" textAnchor="middle" fontSize="11" fill="white">
        • 20-30%: +10 bodova
      </text>
      <text x="840" y="360" textAnchor="middle" fontSize="11" fill="white">
        • 10-20%: +5 bodova
      </text>
      <text x="840" y="377" textAnchor="middle" fontSize="11" fill="white">
        • &lt; 10%: 0 bodova
      </text>
      <text x="840" y="394" textAnchor="middle" fontSize="11" fill="white">
        • ROI tracking
      </text>
      <text x="840" y="411" textAnchor="middle" fontSize="11" fill="white">
        • Statistike uspješnosti
      </text>
      <text x="840" y="428" textAnchor="middle" fontSize="11" fill="white">
        • Utjecaj na dodjelu leadova
      </text>

      {/* Platform Compliance */}
      <rect x="970" y="200" width="220" height="245" rx="5" fill={dangerColor} stroke={borderColor} strokeWidth="2" />
      <text x="1080" y="223" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Platform Compliance (15%)
      </text>
      <text x="1080" y="241" textAnchor="middle" fontSize="11" fill="white">
        • Pridržavanje pravila
      </text>
      <text x="1080" y="258" textAnchor="middle" fontSize="11" fill="white">
        • Nema prijava
      </text>
      <text x="1080" y="275" textAnchor="middle" fontSize="11" fill="white">
        • Nema spam-a
      </text>
      <text x="1080" y="292" textAnchor="middle" fontSize="11" fill="white">
        • Profil kompletan
      </text>
      <text x="1080" y="309" textAnchor="middle" fontSize="11" fill="white">
        • Verificirani (badges)
      </text>
      <text x="1080" y="326" textAnchor="middle" fontSize="11" fill="white">
        • Licencirani (ako potrebno)
      </text>
      <text x="1080" y="343" textAnchor="middle" fontSize="11" fill="white">
        • Aktivna pretplata
      </text>
      <text x="1080" y="360" textAnchor="middle" fontSize="11" fill="white">
        • Povijest transakcija
      </text>
      <text x="1080" y="377" textAnchor="middle" fontSize="11" fill="white">
        • Nema refund problema
      </text>
      <text x="1080" y="394" textAnchor="middle" fontSize="11" fill="white">
        • Odgovaranje na notifikacije
      </text>
      <text x="1080" y="411" textAnchor="middle" fontSize="11" fill="white">
        • Pridržavanje SLA
      </text>
      <text x="1080" y="428" textAnchor="middle" fontSize="11" fill="white">
        • Admin ocjena
      </text>

      {/* Partner Score izračun */}
      <line x1="700" y1="465" x2="700" y2="490" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead10)" />
      <rect x="200" y="490" width="1000" height="115" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="513" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Partner Score Izračun (0-100)
      </text>
      <text x="700" y="531" textAnchor="middle" fontSize="12" fill={textColor}>
        Partner Score = (Prosječna Ocjena × 0.40) + (Prosječno Vrijeme Odgovora × 0.25) + (Stopa Konverzije × 0.20) + (Platform Compliance × 0.15)
      </text>
      <text x="700" y="549" textAnchor="middle" fontSize="12" fill={textColor}>
        + Match Score Bonus (kategorija + regija match)
      </text>
      <text x="700" y="567" textAnchor="middle" fontSize="12" fill={textColor}>
        - Penalty bodovi (prijave, spam, neaktivnost)
      </text>
      <text x="700" y="585" textAnchor="middle" fontSize="12" fill={textColor}>
        = Finalni Partner Score (0-100+)
      </text>

      {/* Partner Tier */}
      <line x1="700" y1="610" x2="700" y2="650" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead10)" />
      <polygon points="700,650 750,690 700,730 650,690" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="695" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        Partner Tier?
      </text>

      {/* Premium */}
      <line x1="650" y1="690" x2="400" y2="750" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead10)" />
      <rect x="300" y="750" width="200" height="130" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="400" y="768" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Premium Partner
      </text>
      <text x="400" y="786" textAnchor="middle" fontSize="12" fill="white">
        Score &ge; 80
      </text>
      <text x="400" y="804" textAnchor="middle" fontSize="11" fill="white">
        • Auto-assign prioritet
      </text>
      <text x="400" y="822" textAnchor="middle" fontSize="11" fill="white">
        • Više leadova
      </text>
      <text x="400" y="840" textAnchor="middle" fontSize="11" fill="white">
        • Badge na profilu
      </text>
      <text x="400" y="858" textAnchor="middle" fontSize="11" fill="white">
        • VIP podrška
      </text>

      {/* Verified */}
      <line x1="700" y1="730" x2="700" y2="750" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead10)" />
      <rect x="600" y="750" width="200" height="130" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="768" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Verified Partner
      </text>
      <text x="700" y="786" textAnchor="middle" fontSize="12" fill="white">
        Score 60-79
      </text>
      <text x="700" y="804" textAnchor="middle" fontSize="11" fill="white">
        • Normalan prioritet
      </text>
      <text x="700" y="822" textAnchor="middle" fontSize="11" fill="white">
        • Standard leadovi
      </text>
      <text x="700" y="840" textAnchor="middle" fontSize="11" fill="white">
        • Badge na profilu
      </text>
      <text x="700" y="858" textAnchor="middle" fontSize="11" fill="white">
        • Standard podrška
      </text>

      {/* Basic */}
      <line x1="750" y1="690" x2="1000" y2="750" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead10)" />
      <rect x="900" y="750" width="200" height="130" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="1000" y="768" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Basic Partner
      </text>
      <text x="1000" y="786" textAnchor="middle" fontSize="12" fill={textColor}>
        Score &lt; 60
      </text>
      <text x="1000" y="804" textAnchor="middle" fontSize="11" fill={textColor}>
        • Niži prioritet
      </text>
      <text x="1000" y="822" textAnchor="middle" fontSize="11" fill={textColor}>
        • Manje leadova
      </text>
      <text x="1000" y="840" textAnchor="middle" fontSize="11" fill={textColor}>
        • Nema badge-a
      </text>
      <text x="1000" y="858" textAnchor="middle" fontSize="11" fill={textColor}>
        • Standard podrška
      </text>

      {/* Trust Score za klijente */}
      <line x1="700" y1="880" x2="700" y2="910" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead10)" />
      <rect x="200" y="910" width="1000" height="275" rx="5" fill={boxColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="933" textAnchor="middle" fontSize="14" fontWeight="bold" fill={textColor}>
        Trust Score za Klijente (0-100)
      </text>

      <rect x="250" y="960" width="220" height="215" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="360" y="983" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Verifikacije (+70)
      </text>
      <text x="360" y="1001" textAnchor="middle" fontSize="11" fill="white">
        • Telefon verificiran: +10
      </text>
      <text x="360" y="1018" textAnchor="middle" fontSize="11" fill="white">
        • Email verificiran: +10
      </text>
      <text x="360" y="1035" textAnchor="middle" fontSize="11" fill="white">
        • OIB verificiran: +15
      </text>
      <text x="360" y="1052" textAnchor="middle" fontSize="11" fill="white">
        • Firma verificirana: +20
      </text>
      <text x="360" y="1069" textAnchor="middle" fontSize="11" fill="white">
        • DNS TXT record: +5
      </text>
      <text x="360" y="1086" textAnchor="middle" fontSize="11" fill="white">
        • Company email: +10
      </text>

      <rect x="490" y="960" width="220" height="215" rx="5" fill={primaryColor} stroke={borderColor} strokeWidth="2" />
      <text x="600" y="983" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Povijest na Platformi (+20)
      </text>
      <text x="600" y="1001" textAnchor="middle" fontSize="11" fill="white">
        • Broj objavljenih poslova: +5
      </text>
      <text x="600" y="1018" textAnchor="middle" fontSize="11" fill="white">
        • Završeni poslovi: +10
      </text>
      <text x="600" y="1035" textAnchor="middle" fontSize="11" fill="white">
        • Pozitivne recenzije: +5
      </text>
      <text x="600" y="1052" textAnchor="middle" fontSize="11" fill="white">
        • Aktivnost (login): +2
      </text>
      <text x="600" y="1069" textAnchor="middle" fontSize="11" fill="white">
        • Nema prijava: +3
      </text>

      <rect x="730" y="960" width="220" height="215" rx="5" fill={warningColor} stroke={borderColor} strokeWidth="2" />
      <text x="840" y="983" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Kvaliteta Leada (+10)
      </text>
      <text x="840" y="1001" textAnchor="middle" fontSize="11" fill="white">
        • Detaljnost opisa: +5
      </text>
      <text x="840" y="1018" textAnchor="middle" fontSize="11" fill="white">
        • Budžet realističan: +3
      </text>
      <text x="840" y="1035" textAnchor="middle" fontSize="11" fill="white">
        • Lokacija specificirana: +2
      </text>

      <rect x="970" y="960" width="220" height="215" rx="5" fill={dangerColor} stroke={borderColor} strokeWidth="2" />
      <text x="1080" y="983" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Penalty Bodovi (-)
      </text>
      <text x="1080" y="1001" textAnchor="middle" fontSize="11" fill="white">
        • Neaktivnost: -5
      </text>
      <text x="1080" y="1018" textAnchor="middle" fontSize="11" fill="white">
        • Otkazani poslovi: -10
      </text>
      <text x="1080" y="1035" textAnchor="middle" fontSize="11" fill="white">
        • Negativne recenzije: -15
      </text>
      <text x="1080" y="1052" textAnchor="middle" fontSize="11" fill="white">
        • Prijave: -20
      </text>
      <text x="1080" y="1069" textAnchor="middle" fontSize="11" fill="white">
        • Spam: -25
      </text>
      <text x="1080" y="1086" textAnchor="middle" fontSize="11" fill="white">
        • Lažni podaci: -30
      </text>

      {/* Utjecaj na lead matching */}
      <line x1="700" y1="1185" x2="700" y2="1230" stroke={textColor} strokeWidth="2" markerEnd="url(#arrowhead10)" />
      <rect x="400" y="1230" width="600" height="80" rx="5" fill={successColor} stroke={borderColor} strokeWidth="2" />
      <text x="700" y="1250" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
        Utjecaj na Lead Matching
      </text>
      <text x="700" y="1270" textAnchor="middle" fontSize="12" fill="white">
        • Partner Score utječe na poziciju u redu čekanja
      </text>
      <text x="700" y="1288" textAnchor="middle" fontSize="12" fill="white">
        • Premium Partneri dobivaju prioritet u Weighted Queue algoritmu
      </text>
    </ZoomableSVG>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ backgroundColor: bgColor }}>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4" style={{ color: textColor }}>
          📊 Dijagrami Procesa za Tipove Korisnika
        </h1>
        <p className="text-xl mb-6" style={{ color: textColor }}>
          Vizualni prikaz cijelog procesa za različite tipove korisnika na Uslugar platformi
        </p>
      </div>

      <div className="space-y-16">
        {/* Dijagram 1 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
            1. Proces Registracije i Onboarding-a
          </h2>
          <div className="overflow-x-auto">
            <RegistrationFlowchart />
          </div>
        </div>

        {/* Dijagram 2 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
            2. Proces Verifikacije i Licenciranja
          </h2>
          <p className="text-sm mb-4" style={{ color: textColor, opacity: 0.7 }}>
            💡 Koristi miš za pomicanje (drag) i kotačić za zumiranje. Gumbi za kontrolu su u gornjem desnom kutu.
          </p>
          <VerificationFlowchart />
        </div>

        {/* Dijagram 3 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
            3. Proces Pretplata
          </h2>
          <p className="text-sm mb-4" style={{ color: textColor, opacity: 0.7 }}>
            💡 Koristi miš za pomicanje (drag) i kotačić za zumiranje. Gumbi za kontrolu su u gornjem desnom kutu.
          </p>
          <SubscriptionFlowchart />
        </div>

        {/* Dijagram 4 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
            4. Proces Korištenja Platforme - Korisnik Usluge
          </h2>
          <p className="text-sm mb-4" style={{ color: textColor, opacity: 0.7 }}>
            💡 Koristi miš za pomicanje (drag) i kotačić za zumiranje. Gumbi za kontrolu su u gornjem desnom kutu.
          </p>
          <UserJourneyFlowchart />
        </div>

        {/* Dijagram 5 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
            5. Proces Korištenja Platforme - Pružatelj Usluga
          </h2>
          <p className="text-sm mb-4" style={{ color: textColor, opacity: 0.7 }}>
            💡 Koristi miš za pomicanje (drag) i kotačić za zumiranje. Gumbi za kontrolu su u gornjem desnom kutu.
          </p>
          <ProviderJourneyFlowchart />
        </div>

        {/* Dijagram 6 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
            6. USLUGAR EXCLUSIVE - Lead Sustav
          </h2>
          <p className="text-sm mb-4" style={{ color: textColor, opacity: 0.7 }}>
            💡 Koristi miš za pomicanje (drag) i kotačić za zumiranje. Gumbi za kontrolu su u gornjem desnom kutu.
          </p>
          <ExclusiveLeadSystemFlowchart />
        </div>

        {/* Dijagram 7 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
            7. Queue Sustav za Distribuciju Leadova
          </h2>
          <p className="text-sm mb-4" style={{ color: textColor, opacity: 0.7 }}>
            💡 Koristi miš za pomicanje (drag) i kotačić za zumiranje. Gumbi za kontrolu su u gornjem desnom kutu.
          </p>
          <QueueSystemFlowchart />
        </div>

        {/* Dijagram 8 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
            8. Refund i Kreditni Sustav
          </h2>
          <p className="text-sm mb-4" style={{ color: textColor, opacity: 0.7 }}>
            💡 Koristi miš za pomicanje (drag) i kotačić za zumiranje. Gumbi za kontrolu su u gornjem desnom kutu.
          </p>
          <RefundSystemFlowchart />
        </div>

        {/* Dijagram 9 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
            9. Notifikacije i Komunikacija
          </h2>
          <p className="text-sm mb-4" style={{ color: textColor, opacity: 0.7 }}>
            💡 Koristi miš za pomicanje (drag) i kotačić za zumiranje. Gumbi za kontrolu su u gornjem desnom kutu.
          </p>
          <NotificationsFlowchart />
        </div>

        {/* Dijagram 10 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
            10. Reputacijski Sustav i Trust Score
          </h2>
          <p className="text-sm mb-4" style={{ color: textColor, opacity: 0.7 }}>
            💡 Koristi miš za pomicanje (drag) i kotačić za zumiranje. Gumbi za kontrolu su u gornjem desnom kutu.
          </p>
          <ReputationSystemFlowchart />
        </div>
      </div>

      {/* Informacije */}
      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold mb-3" style={{ color: isDarkMode ? '#93C5FD' : '#1E40AF' }}>
          ℹ️ O dijagramima
        </h3>
        <p className="text-sm" style={{ color: isDarkMode ? '#BFDBFE' : '#1E3A8A' }}>
          Ovi dijagrami prikazuju cijeli proces za različite tipove korisnika na Uslugar platformi. 
          Dijagrami su interaktivni i prilagođeni dark mode-u. Svaki dijagram prikazuje korake i odluke 
          koje korisnici donose tijekom korištenja platforme.
        </p>
      </div>
    </div>
  );
}


'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

export default function ContactMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(containerRef, {
    freezeOnceVisible: true,
    threshold: 0.1, // Load when 10% visible
  });
  
  const [showMap, setShowMap] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  // Trigger load when visible
  useEffect(() => {
    if (isVisible) {
      setShowMap(true);
    }
  }, [isVisible]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-white/5 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group min-h-[450px] lg:min-h-full">
      {/* Placeholder / Skeleton while waiting for visibility or load */}
      {(!showMap || !isIframeLoaded) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-azul-oscuro/50 backdrop-blur-sm transition-opacity duration-500">
           <div className="relative">
              <div className="bg-naranja/10 p-4 rounded-full text-naranja mb-4 animate-pulse">
                <MapPin size={40} />
              </div>
              {/* Spinner specifically if we are loading the iframe */}
              {showMap && !isIframeLoaded && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="animate-spin text-naranja" size={40} />
                 </div>
              )}
           </div>
          
          {!showMap ? (
             <p className="text-gray-400 text-sm animate-pulse">Cargando mapa...</p>
          ) : !isIframeLoaded ? (
             <p className="text-gray-400 text-sm animate-pulse">Conectando con Google Maps...</p>
          ) : null}
        </div>
      )}

      {showMap && (
        <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.1414250487974!2d-89.19604262538489!3d13.709883098263589!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f633103844284d5%3A0xab3f82c427cff68c!2sPrototyp3d!5e0!3m2!1ses-419!2ssv!4v1768174356853!5m2!1ses-419!2ssv"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setIsIframeLoaded(true)}
            className={`transition-opacity duration-700 w-full h-full grayscale hover:grayscale-0 ${isIframeLoaded ? 'opacity-100' : 'opacity-0'}`}
        ></iframe>
      )}
    </div>
  );
}

import React, { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Advertisement {
  id: string;
  image_url: string;
  link_url: string | null;
  display_order: number;
}

interface AdCarouselProps {
  onInternalLink?: (link: string) => void;
}

const AdCarousel: React.FC<AdCarouselProps> = ({ onInternalLink }) => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    dragFree: false,
    containScroll: 'trimSnaps',
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Fetch advertisements
  useEffect(() => {
    const fetchAds = async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Failed to fetch ads:", error);
      } else {
        setAds(data || []);
      }
      setLoading(false);
    };

    fetchAds();
  }, []);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (!emblaApi || ads.length <= 1) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [emblaApi, ads.length]);

  // Update scroll buttons state
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  // Don't render if no ads
  if (!loading && ads.length === 0) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="w-full h-32 sm:h-40 md:h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-3 bg-background">
      <div className="max-w-7xl mx-auto relative">
        <div 
          className="overflow-hidden rounded-xl" 
          ref={emblaRef}
          style={{ touchAction: 'pan-y' }}
          onMouseDown={(e) => {
            // Allow clicks on interactive elements
            const target = e.target as HTMLElement;
            if (target.closest('[role="button"], a')) {
              e.stopPropagation();
            }
          }}
        >
          <div className="flex">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="flex-[0_0_100%] min-w-0 relative"
                style={{ pointerEvents: 'auto' }}
              >
                {ad.link_url ? (
                  ad.link_url.startsWith('#') && onInternalLink ? (
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Ad clicked, link:', ad.link_url);
                        onInternalLink(ad.link_url!);
                      }}
                      className="block w-full cursor-pointer hover:opacity-90 active:opacity-75 transition-opacity relative z-10 select-none"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          onInternalLink(ad.link_url!);
                        }
                      }}
                      style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                    >
                      <img
                        src={ad.image_url}
                        alt="Advertisement - Click to view"
                        className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-xl pointer-events-none"
                        draggable="false"
                      />
                    </div>
                  ) : (
                    <a
                      href={ad.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative z-10 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img
                        src={ad.image_url}
                        alt="Advertisement"
                        className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-xl"
                        draggable="false"
                      />
                    </a>
                  )
                ) : (
                  // Even without link_url, make it clickable if onInternalLink is provided
                  onInternalLink ? (
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Ad clicked (no link_url), trying default navigation');
                        // Default: navigate to cold-beverages for Oreo Shake
                        onInternalLink('#oreo-shake');
                      }}
                      className="block w-full cursor-pointer hover:opacity-90 active:opacity-75 transition-opacity relative z-10 select-none"
                      role="button"
                      tabIndex={0}
                      style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                    >
                      <img
                        src={ad.image_url}
                        alt="Advertisement - Click to view"
                        className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-xl pointer-events-none"
                        draggable="false"
                      />
                    </div>
                  ) : (
                    <img
                      src={ad.image_url}
                      alt="Advertisement"
                      className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-xl"
                      draggable="false"
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons - only show if more than 1 ad */}
        {ads.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                scrollPrev();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-background transition-colors z-20"
              aria-label="Previous slide"
              type="button"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                scrollNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-background transition-colors z-20"
              aria-label="Next slide"
              type="button"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {ads.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    emblaApi?.scrollTo(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    emblaApi?.selectedScrollSnap() === index
                      ? "bg-primary"
                      : "bg-primary/30"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  type="button"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdCarousel;

"use client";

import Link from "next/link";
import { MapPin, Search, ChevronDown, ArrowLeft, ArrowRight, Utensils, Award, Clock, ArrowRightCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import HeroSlider from "@/components/customer/HeroSlider";
import "./home.css";

const CATEGORIES = [
  { name: "Starters", image: "https://image.pollinations.ai/prompt/Indian%20starters%20appetizers,%20delicious%20food%20photography,%20dark%20background?width=400&height=400&nologo=true" },
  { name: "Main Course", image: "https://image.pollinations.ai/prompt/Indian%20main%20course%20curry%20and%20paneer,%20delicious%20food%20photography,%20dark%20background?width=400&height=400&nologo=true" },
  { name: "Biryani", image: "https://image.pollinations.ai/prompt/Indian%20Biryani,%20delicious%20food%20photography,%20dark%20background?width=400&height=400&nologo=true" },
  { name: "Breads", image: "https://image.pollinations.ai/prompt/Indian%20Breads%20Naan%20Roti,%20delicious%20food%20photography,%20dark%20background?width=400&height=400&nologo=true" },
  { name: "South Indian", image: "https://image.pollinations.ai/prompt/South%20Indian%20Dosa%20Idli,%20delicious%20food%20photography,%20dark%20background?width=400&height=400&nologo=true" },
  { name: "Desserts", image: "https://image.pollinations.ai/prompt/Indian%20Desserts%20Gulab%20Jamun,%20delicious%20food%20photography,%20dark%20background?width=400&height=400&nologo=true" },
  { name: "Beverages", image: "https://image.pollinations.ai/prompt/Indian%20Beverages%20Lassi,%20delicious%20food%20photography,%20dark%20background?width=400&height=400&nologo=true" },
];

export default function Home() {
  const [userName, setUserName] = useState<string>("");
  const [locationText, setLocationText] = useState<string>("Locating...");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function getUserName() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (data && data.full_name) {
          const firstName = data.full_name.split(' ')[0];
          setUserName(firstName);
        }
      }
    }
    getUserName();
    
    // Auto-detect location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await res.json();
            if (data.locality || data.city) {
              const locStr = [data.locality, data.city, data.principalSubdivision].filter(Boolean).join(", ");
              setLocationText(locStr || "Location Found");
            } else {
              setLocationText("Unknown Location");
            }
          } catch (e) {
            setLocationText("Location not found");
          }
        },
        (err) => {
          console.error("Location error:", err);
          setLocationText("Please enable location");
        }
      );
    } else {
      setLocationText("Location not supported");
    }

    // Fetch all menu items for search suggestions
    async function fetchMenuItems() {
      const supabase = createClient();
      const { data } = await supabase.from('menu_items').select('id, name, image_url, menu_categories(name)').eq('is_available', true);
      if (data) {
        setMenuItems(data);
      }
    }
    fetchMenuItems();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/menu?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const filteredSuggestions = menuItems.filter(item => 
    searchQuery.trim() && item.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5); // show top 5

  const handleSuggestionClick = (name: string) => {
    router.push(`/menu?search=${encodeURIComponent(name)}`);
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="swiggy-home">
      <HeroSlider />
      
      <div className="swiggy-top-section" style={{ paddingTop: '60px' }}>
        {/* Hero Content */}
        <div className="swiggy-hero-content" style={{ marginTop: 0 }}>
          <h1 className="swiggy-headline" style={{ fontSize: '42px', fontWeight: 700 }}>
            Welcome to <span style={{ color: 'var(--color-champagne-gold)', whiteSpace: 'nowrap' }}>The Hunger.</span><br />
            Experience culinary perfection.
          </h1>

          <div className="swiggy-search-container">
            <div className="swiggy-location-box">
              <MapPin size={20} className="icon-accent" />
              <span className="swiggy-location-text">{locationText}</span>
              <ChevronDown size={20} className="icon-accent" style={{ cursor: "pointer" }} />
            </div>
            <form className="swiggy-search-box" onSubmit={handleSearch} style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="swiggy-search-input" 
                placeholder="Search our exclusive menu items..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              <button type="submit" aria-label="Search" style={{background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'inherit'}}>
                <Search size={24} className="icon-muted" />
              </button>
              
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="search-suggestions-dropdown">
                  {filteredSuggestions.map((item) => (
                    <div 
                      key={item.id} 
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(item.name)}
                    >
                      <img src={item.image_url} alt={item.name} className="suggestion-img" />
                      <div className="suggestion-text">
                        <span className="suggestion-name">{item.name}</span>
                        <span className="suggestion-cat">{item.menu_categories?.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* What's on your mind section */}
      <div className="swiggy-categories-section">
        <div className="swiggy-categories-header">
          <h2 className="swiggy-categories-title">
            {userName ? `${userName}, what's on your mind?` : "What's on your mind?"}
          </h2>
          <div className="swiggy-categories-arrows">
            <button className="swiggy-arrow-btn" onClick={scrollLeft}>
              <ArrowLeft size={20} />
            </button>
            <button className="swiggy-arrow-btn" onClick={scrollRight}>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        <div className="swiggy-categories-scroll" ref={scrollRef}>
          {CATEGORIES.map((cat, idx) => (
            <Link href={`/menu?category=${encodeURIComponent(cat.name)}`} key={idx} className="swiggy-category-item">
              <div className="swiggy-category-img-container">
                <img src={cat.image} alt={cat.name} className="swiggy-category-img" />
              </div>
              <p className="swiggy-category-name">{cat.name}</p>
            </Link>
          ))}
        </div>
      </div>
      {/* Premium Features Section */}
      <section className="premium-section">
        <h2 className="premium-section-title">The Hunger Experience</h2>
        <p className="premium-section-subtitle">
          Discover a symphony of flavors, where traditional recipes meet modern culinary artistry in an ambiance of pure luxury.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Utensils size={32} />
            </div>
            <h3 className="feature-title">Masterful Cuisine</h3>
            <p className="feature-desc">
              Every dish is thoughtfully crafted by our expert chefs using only the freshest, finest ingredients.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Award size={32} />
            </div>
            <h3 className="feature-title">Premium Quality</h3>
            <p className="feature-desc">
              We uphold the highest standards of culinary excellence, ensuring a dining experience like no other.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Clock size={32} />
            </div>
            <h3 className="feature-title">Timeless Ambiance</h3>
            <p className="feature-desc">
              Immerse yourself in a luxurious setting designed to make every meal a memorable occasion.
            </p>
          </div>
        </div>
      </section>

      {/* Parallax Banner */}
      <div className="parallax-banner">
        <div className="parallax-content">
          <h2>Taste the Perfection</h2>
          <p>Reserve your table today and let us take you on an unforgettable gastronomic journey.</p>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="story-section">
        <div className="story-image-col">
          <div className="story-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80" 
              alt="Restaurant Interior" 
              className="story-image"
            />
          </div>
        </div>
        
        <div className="story-content-col">
          <span className="story-badge">Our Heritage</span>
          <h2 className="story-title">A Legacy of Fine Dining</h2>
          <p className="story-text">
            Born from a passion for exquisite food and unmatched hospitality, The Hunger has been redefining the culinary landscape. Our journey started with a simple vision: to create a space where every meal feels like a celebration.
          </p>
          <p className="story-text">
            From our carefully curated menus to our elegant interiors, every detail is designed to offer you a royal dining experience. Come, be a part of our story.
          </p>
          <Link href="/about" className="story-btn">
            Read Full Story <ArrowRightCircle size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}

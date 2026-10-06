"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./HeroSlider.css";

const slides = [
  {
    id: 1,
    title: "Culinary Excellence",
    subtitle: "Savor the masterfully crafted dishes from The Hunger's exclusive menu.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop",
    link: "/menu",
    btnText: "Explore Menu",
    animClass: "anim-zoom-fade"
  },
  {
    id: 2,
    title: "Reserve Your Spot",
    subtitle: "Book a table at The Hunger for an unforgettable dining experience.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop",
    link: "/services",
    btnText: "Book a Table",
    animClass: "anim-slide-up"
  },
  {
    id: 3,
    title: "Premium Catering",
    subtitle: "Let The Hunger elevate your premium events with our signature catering.",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&h=600&fit=crop",
    link: "/catering",
    btnText: "Plan an Event",
    animClass: "anim-parallax"
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-slider-container">
      {slides.map((slide, index) => {
        const isActive = index === current;
        return (
          <div 
            key={slide.id} 
            className={`hero-slide ${isActive ? 'active' : ''} ${slide.animClass}`}
          >
            <div className="hero-slide-bg" style={{ backgroundImage: `url(${slide.image})` }}></div>
            <div className="hero-slide-overlay"></div>
            
            <div className="hero-slide-content">
              <h2 className="hero-slide-title">{slide.title}</h2>
              <p className="hero-slide-subtitle">{slide.subtitle}</p>
              <Link href={slide.link} className="hero-slide-btn">
                {slide.btnText}
              </Link>
            </div>
          </div>
        );
      })}
      
      <div className="hero-slider-dots">
        {slides.map((_, index) => (
          <button 
            key={index} 
            className={`hero-dot ${index === current ? 'active' : ''}`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
}

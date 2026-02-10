'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { WaffleIcon, DeliveryTruckIcon, GingerbreadIcon } from '@/components/Icons';
import { GingerbreadIcon as GingerbreadSVG, WaffleIcon as WaffleSVG, SparkleIcon } from '@/components/ProductIcons';
import { BatterellaLogo } from '@/components/Logo';
import styles from './page.module.css';

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-up, .slide-in');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="premium-container">
      {/* Premium Navigation with Logo */}
      <header className="premium-nav">
        <div className="nav-brand">
          <div className="logo-container">
            <img src="/logo.svg" alt="Batterella" className="brand-logo" />
            <span className="brand-text">Batterella</span>
          </div>
        </div>
        <nav className="nav-links">
          <Link href="/track-order" className="nav-link">
            Track Order
          </Link>
          <Link href="/admin" className="nav-link nav-link-subtle">
            Admin
          </Link>
        </nav>
      </header>

      {/* Uncanny Hero Section */}
      <section className="hero-section uncanny-hero" ref={heroRef}>
        <div className="hero-background-blend"></div>
        <div className="background-text">
          <span className="bg-text-1">dream</span>
          <span className="bg-text-2">create</span>
          <span className="bg-text-3">taste</span>
          <span className="bg-text-4">vibe</span>
          <span className="bg-text-5">moment</span>
        </div>
        <div className="hero-content">
          <div className="hero-text fade-up">
            <h1 className="hero-headline uncanny-title">
              <span className="text-large">Batter</span><br/>
              <span className="text-small">becomes</span>
              <span className="text-mega">ART</span>
            </h1>
            
            <p className="hero-subhead uncanny-subtitle">
              <span className="text-medium">craft.</span> <span className="text-tiny">taste.</span> <span className="text-medium">repeat.</span>
            </p>
            
            <div className="hero-actions uncanny-actions">
              <Link href="/order" className="btn-primary uncanny-primary genz-btn">
                <span>Start Creating</span>
                <div className="btn-glow"></div>
              </Link>
              <Link href="/track-order" className="btn-secondary uncanny-secondary genz-btn-alt">
                <span>Track Order</span>
                <div className="btn-shimmer"></div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections with Product Value */}
      <section className="content-section fade-up uncanny-section genz-section">
        <div className="value-container gingerbread-blend">
          <div className="product-visual">
            <GingerbreadSVG />
          </div>
          <div className="value-content">
            <h2 className="section-title uncanny-section-title genz-title">
              <span className="text-huge">HANDCRAFTED</span>
              <span className="text-micro">gingerbread traditions</span>
            </h2>
            <div className="value-points">
              <span className="value-tag">spiced perfection</span>
              <span className="value-tag">family recipe</span>
            </div>
          </div>
          <div className="blend-accent gingerbread-accent"></div>
        </div>
      </section>

      <section className="content-section fade-up uncanny-section genz-section">
        <div className="value-container waffle-blend">
          <div className="product-visual">
            <WaffleSVG />
          </div>
          <div className="value-content">
            <h2 className="section-title uncanny-section-title genz-title">
              <span className="text-small">crispy outside</span><br/>
              <span className="text-massive">FLUFFY INSIDE</span>
            </h2>
            <div className="value-points">
              <span className="value-tag">golden crisp</span>
              <span className="value-tag">perfect pockets</span>
            </div>
          </div>
          <div className="blend-accent waffle-accent"></div>
        </div>
      </section>

      <section className="content-section fade-up uncanny-section uncanny-final genz-final">
        <div className="value-container craft-blend">
          <div className="product-visual">
            <SparkleIcon />
          </div>
          <div className="value-content">
            <h2 className="section-title uncanny-section-title genz-title">
              <span className="text-medium">batter</span>
              <span className="text-ultra">MASTERY</span>
            </h2>
            <div className="value-points">
              <span className="value-tag">artisan craft</span>
              <span className="value-tag">pure joy</span>
            </div>
            <Link href="/order" className="btn-primary uncanny-cta genz-cta">
              <span>Start Creating</span>
              <div className="btn-aurora"></div>
            </Link>
          </div>
          <div className="blend-accent craft-accent"></div>
        </div>
      </section>
    </div>
  );
}

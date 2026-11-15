"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { KolkataRooftopStage } from "@/components/KolkataRooftopStage";
import { TimeScrubberBar } from "@/components/TimeScrubberBar";
import { PixelModeToggle } from "@/components/PixelModeToggle";
import { HeroSection } from "@/components/HeroSection";
import { CinemaShowreel } from "@/components/CinemaShowreel";
import { PressProofGallery } from "@/components/PressProofGallery";
import { ProductionLab } from "@/components/ProductionLab";
import { AboutSection } from "@/components/AboutSection";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";
import { ServicesGrid } from "@/components/ServicesGrid";
import { SoftwareMatrix } from "@/components/SoftwareMatrix";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";

function getRealKolkataHour(): number {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const h = +parts.find((p) => p.type === "hour")!.value;
    const m = +parts.find((p) => p.type === "minute")!.value;
    return h + m / 60;
  } catch {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  }
}

export default function Home() {
  const [currentHour, setCurrentHour] = useState<number>(12);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<number>(1);

  // Initialize and tick live Kolkata time
  useEffect(() => {
    const initH = getRealKolkataHour();
    setCurrentHour(initH);

    const interval = setInterval(() => {
      if (isLive) {
        setCurrentHour(getRealKolkataHour());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Section observer to trigger rooftop hero walking & sheet pinning
  useEffect(() => {
    const sectionIds = ["home", "showreel", "work", "lab", "experience"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionIds.indexOf(entry.target.id);
            if (idx !== -1) {
              setActiveSection(idx + 1);
            }
          }
        });
      },
      { threshold: 0.25 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleHourChange = useCallback((newHour: number) => {
    setIsLive(false);
    setCurrentHour(newHour);
  }, []);

  const handleResetLive = useCallback(() => {
    setIsLive(true);
    setCurrentHour(getRealKolkataHour());
  }, []);

  return (
    <div className="relative min-h-screen text-white pb-16 selection:bg-[#C08A2E] selection:text-[#14110D]">
      {/* 1. Kolkata Rooftop Stage & Diurnal Celestial Sky */}
      <KolkataRooftopStage
        currentHour={currentHour}
        activeSection={activeSection}
      />

      {/* 2. 8-Bit Retro Pixel Mode Toggle with Procedural Wave Wipe */}
      <PixelModeToggle />

      {/* 3. Top Navigation */}
      <Navbar />

      {/* Main Content Flow */}
      <main className="relative z-10">
        <HeroSection />
        <CinemaShowreel />
        <PressProofGallery />
        <ProductionLab />
        <AboutSection />
        <ExperienceTimeline />
        <ServicesGrid />
        <SoftwareMatrix />
        <ContactSection />
      </main>

      {/* 4. Footer & Tactile Press Bar */}
      <Footer />

      {/* 5. Fixed 24h Time Scrubber Bar */}
      <TimeScrubberBar
        currentHour={currentHour}
        onHourChange={handleHourChange}
        isLive={isLive}
        onResetLive={handleResetLive}
      />
    </div>
  );
}

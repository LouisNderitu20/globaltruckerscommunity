'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroCountdown from '@/components/HeroCountdown';
import NextConvoyCard from '@/components/NextConvoyCard';
import CommunityStats from '@/components/CommunityStats';
import ConvoySchedule from '@/components/ConvoySchedule';
import DiscordSection from '@/components/DiscordSection';
import DriverSignup from '@/components/DriverSignup';
import GallerySection from '@/components/GallerySection';
import NewsSection from '@/components/NewsSection';
import StreamersSection from '@/components/StreamersSection';
import MembersDirectory from '@/components/MembersDirectory';
import Footer from '@/components/Footer';
import DriverAccountModal from '@/components/DriverAccountModal';
import { DEFAULT_CONFIG, getNextUpcomingConvoy, getNextUpcomingConvoys, getConvoyBySlot } from '@/lib/defaultConfig';

export default function HomePage() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [liveNextConvoy, setLiveNextConvoy] = useState(DEFAULT_CONFIG.nextConvoy);
  const [upcomingConvoys, setUpcomingConvoys] = useState([]);
  const [selectedConvoy, setSelectedConvoy] = useState(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState('profile');

  useEffect(() => {
    const updateConvoys = () => {
      const now = new Date();
      const slotList = config.timetableConvoys || null;
      const currentNext = getNextUpcomingConvoy(now, slotList);
      const list = getNextUpcomingConvoys(4, now, slotList);
      setLiveNextConvoy(currentNext);
      setUpcomingConvoys(list);
    };

    updateConvoys();
    const interval = setInterval(updateConvoys, 60000); 
    return () => clearInterval(interval);
  }, [config.timetableConvoys]);

  useEffect(() => {
    async function loadSiteContent() {
      try {
        const res = await fetch('/api/content', { cache: 'no-store' });
        const json = await res.json();
        if (json?.success && json?.data) {
          
          const remoteConvoy = json.data.nextConvoy;
          const isLegacyMunich = remoteConvoy?.departureLocation?.includes('Munich') || remoteConvoy?.title?.includes('Alpine');
          const cleanNextConvoy = isLegacyMunich ? DEFAULT_CONFIG.nextConvoy : { ...DEFAULT_CONFIG.nextConvoy, ...(remoteConvoy || {}) };

          setConfig({
            ...DEFAULT_CONFIG,
            ...json.data,
            nextConvoy: cleanNextConvoy,
            stats: { ...DEFAULT_CONFIG.stats, ...(json.data.stats || {}) },
            planner: { ...DEFAULT_CONFIG.planner, ...(json.data.planner || {}) }
          });
        }
      } catch (err) {
        console.warn('Failed to load content from Supabase API, using default config:', err);
      }
    }

    loadSiteContent();
  }, []);

  const openAccountModal = (tab = 'profile') => {
    setAccountModalTab(tab);
    setIsAccountModalOpen(true);
  };

  const adminOverride = config.nextConvoyOverride ? config.nextConvoy : null;
  const overriddenLive = (liveNextConvoy && adminOverride && adminOverride.id === liveNextConvoy.id)
    ? {
        ...liveNextConvoy,
        ...adminOverride,
        departureTime: liveNextConvoy.departureTime,
        truck: { ...liveNextConvoy.truck, ...(adminOverride.truck || {}) }
      }
    : liveNextConvoy;
  const activeConvoy = selectedConvoy || overriddenLive || config.nextConvoy;
  const activeSlot = activeConvoy ? {
    day: activeConvoy.dayShort || activeConvoy.day?.slice(0, 3)?.toUpperCase(),
    time: activeConvoy.eatTime?.slice(0, 5) || activeConvoy.time?.slice(0, 5)
  } : null;

  return (
    <div className="gtc-app-root">
      
      <Navbar
        onOpenAccountModal={() => openAccountModal('profile')}
        onOpenNotifModal={() => openAccountModal('notifications')}
      />

      <HeroCountdown
        nextConvoy={activeConvoy}
        onOpenAccountModal={() => openAccountModal('profile')}
      />

      <NextConvoyCard
        convoy={activeConvoy}
        upcomingConvoys={upcomingConvoys}
        onSelectConvoy={(c) => setSelectedConvoy(c)}
        onOpenAccountModal={(tab) => openAccountModal(tab || 'profile')}
      />

      <CommunityStats
        onOpenLogHaulModal={() => openAccountModal('loghaul')}
      />

      <ConvoySchedule
        planner={config.planner}
        activeSlot={activeSlot}
        onSelectSlot={(slot) => {
          const matched = getConvoyBySlot(slot.day, slot.time);
          if (matched) {
            setSelectedConvoy(matched);
            const cardEl = document.getElementById('next-convoy');
            if (cardEl) {
              cardEl.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }}
      />

      <DiscordSection
        config={config}
      />

      <DriverSignup
        onSignupSuccess={() => openAccountModal('profile')}
      />

      <GallerySection
        gallery={config.gallery}
      />

      <NewsSection
        news={config.news}
      />

      <StreamersSection
        streamers={config.streamers}
      />

      <MembersDirectory />

      <Footer
        config={config}
      />

      <DriverAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        initialTab={accountModalTab}
      />
    </div>
  );
}

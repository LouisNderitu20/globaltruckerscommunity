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
import { useAuth } from '@/lib/authContext';
import { DEFAULT_CONFIG, getNextUpcomingConvoy, getNextUpcomingConvoys, getConvoyBySlot } from '@/lib/defaultConfig';

export default function HomePage() {
  const { user } = useAuth();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [liveNextConvoy, setLiveNextConvoy] = useState(DEFAULT_CONFIG.nextConvoy);
  const [upcomingConvoys, setUpcomingConvoys] = useState([]);
  const [selectedConvoy, setSelectedConvoy] = useState(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState('profile');

  const updateConvoys = (customSlots = null) => {
    const now = new Date();
    const slotList = customSlots || config.timetableConvoys || null;
    const currentNext = getNextUpcomingConvoy(now, slotList);
    const list = getNextUpcomingConvoys(4, now, slotList);
    setLiveNextConvoy(currentNext);
    setUpcomingConvoys(list);
  };

  useEffect(() => {
    updateConvoys();
    const interval = setInterval(() => updateConvoys(), 60000); 
    return () => clearInterval(interval);
  }, [config.timetableConvoys]);

  useEffect(() => {
    async function loadSiteContent() {
      try {
        const res = await fetch(`/api/content?t=${Date.now()}`, { cache: 'no-store' });
        const json = await res.json();
        if (json?.success && json?.data) {
          setConfig(json.data);
          updateConvoys(json.data.timetableConvoys);
        }
      } catch (err) {
        console.warn('Failed to load content from Supabase API, using default config:', err);
      }
    }

    // Instant local cache hydration for 0ms visual update
    try {
      const cached = localStorage.getItem('gtc_site_content_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          setConfig((prev) => ({ ...prev, ...parsed }));
          if (parsed.timetableConvoys) {
            updateConvoys(parsed.timetableConvoys);
          }
        }
      }
    } catch (e) {}

    loadSiteContent();

    const handleStorage = (e) => {
      if (e.key === 'gtc_site_content_timestamp' || e.key === 'gtc_site_content_cache') {
        loadSiteContent();
      }
    };

    const handleContentEvent = (e) => {
      if (e?.detail) {
        setConfig((prev) => ({ ...prev, ...e.detail }));
        if (e.detail.timetableConvoys) {
          updateConvoys(e.detail.timetableConvoys);
        }
      }
      loadSiteContent();
    };

    window.addEventListener('focus', loadSiteContent);
    window.addEventListener('pageshow', loadSiteContent);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('gtc:content-updated', handleContentEvent);

    // Guaranteed real-time sync heartbeat
    const syncInterval = setInterval(loadSiteContent, 3500);

    return () => {
      window.removeEventListener('focus', loadSiteContent);
      window.removeEventListener('pageshow', loadSiteContent);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('gtc:content-updated', handleContentEvent);
      clearInterval(syncInterval);
    };
  }, []);

  const openAccountModal = (tab = 'profile') => {
    setAccountModalTab(tab);
    setIsAccountModalOpen(true);
  };

  const isOverridden = config.nextConvoyOverride !== false && config.nextConvoy?.title;
  const configuredConvoy = isOverridden ? config.nextConvoy : (liveNextConvoy || config.nextConvoy);
  const activeConvoy = selectedConvoy || configuredConvoy;
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
          const matched = getConvoyBySlot(slot.day, slot.time, new Date(), config.timetableConvoys);
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

      {!user && (
        <DriverSignup
          onSignupSuccess={() => openAccountModal('profile')}
        />
      )}

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

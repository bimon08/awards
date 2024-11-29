"use client";
import clsx from "clsx";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";
import { TiLocationArrow } from "react-icons/ti";
import Image from "next/image"; // Import Image from next/image

import Button from "./Button";

// Type for the navItems array (string array)
const navItems: string[] = ["Nexus", "Vault", "Prologue", "About", "Contact"];

const NavBar: React.FC = () => {
  // State for toggling audio and visual indicator
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Refs for audio and navigation container
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const navContainerRef = useRef<HTMLDivElement | null>(null);

  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState<number>(0);

  // Manage audio playback with fade-in and fade-out
  useEffect(() => {
    if (isAudioPlaying) {
      audioElementRef.current?.play();
      gsap.to(audioElementRef.current, {
        volume: 1, // Fade in volume to 1 (max volume)
        duration: 1, // Duration of the fade-in
      });
    } else {
      gsap.to(audioElementRef.current, {
        volume: 0, // Fade out volume to 0 (mute)
        duration: 1, // Duration of the fade-out
        onComplete: () => {
          audioElementRef.current?.pause(); // Pause audio once faded out
        },
      });
    }
  }, [isAudioPlaying]);

  // Scroll-based navbar visibility logic
  useEffect(() => {
    if (currentScrollY === 0) {
      // Topmost position: show navbar without floating-nav
      setIsNavVisible(true);
      navContainerRef.current?.classList.remove("floating-nav");
    } else if (currentScrollY > lastScrollY) {
      // Scrolling down: hide navbar and apply floating-nav
      setIsNavVisible(false);
      navContainerRef.current?.classList.add("floating-nav");
    } else if (currentScrollY < lastScrollY) {
      // Scrolling up: show navbar with floating-nav
      setIsNavVisible(true);
      navContainerRef.current?.classList.add("floating-nav");
    }

    setLastScrollY(currentScrollY);
  }, [currentScrollY, lastScrollY]);

  useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  // Handle tab visibility (focus/unfocus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause audio when the tab is not in focus
        audioElementRef.current?.pause();
      } else {
        // Resume audio when the tab is focused again (if it's playing)
        if (isAudioPlaying) {
          audioElementRef.current?.play();
        }
      }
    };

    // Add event listener for visibility change
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup the event listener when the component is unmounted
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAudioPlaying]);

  // Toggle audio state on button click
  const toggleAudio = () => {
    setIsAudioPlaying((prev) => !prev);
  };

  return (
    <div
      ref={navContainerRef}
      className="fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700 sm:inset-x-6"
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex size-full items-center justify-between p-4">
          {/* Logo and Product button */}
          <div className="flex items-center gap-7">
            <Image
              src="/img/logo.png" // Path to your image
              alt="logo"
              className="w-10" // Tailwind CSS class for width
              width={40} // Provide width for image
              height={40} // Provide height for image
            />

            <Button
              id="product-button"
              title="Products"
              rightIcon={<TiLocationArrow />}
              containerClass="bg-blue-50 md:flex hidden items-center justify-center gap-1"
            />
          </div>

          {/* Navigation Links and Audio Button */}
          <div className="flex h-full items-center">
            <div className="hidden md:block">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={`#${item.toLowerCase()}`}
                  className="nav-hover-btn"
                >
                  {item}
                </a>
              ))}
            </div>

            <button
              onClick={toggleAudio}
              className="ml-10 flex items-center space-x-0.5"
            >
              <audio
                ref={audioElementRef}
                className="hidden"
                src="/audio/loop.mp3"
                loop
              />
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={clsx("indicator-line", {
                    active: isAudioPlaying, // Only animate when audio is playing
                  })}
                  style={{
                    animationDelay: `${bar * 0.1}s`,
                  }}
                />
              ))}
            </button>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default NavBar;

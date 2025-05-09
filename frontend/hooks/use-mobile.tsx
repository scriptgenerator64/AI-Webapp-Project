"use client"

import { useState, useEffect } from "react"

// Custom hook to detect if the screen is mobile-sized
export function useMobile() {
  // Default to false for SSR
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Function to check if window width is mobile-sized
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px is a common breakpoint for mobile
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile)

    // Clean up event listener
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

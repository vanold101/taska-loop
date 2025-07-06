import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
}

export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1920,
    screenHeight: 1080,
    userAgent: ''
  });

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || '';
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Check for mobile devices using user agent
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileUA = mobileRegex.test(userAgent);
      
      // Check for tablet-specific indicators
      const tabletRegex = /iPad|Android(?=.*Tablet)|Windows NT.*Touch/i;
      const isTabletUA = tabletRegex.test(userAgent);
      
      // Screen size-based detection
      const isMobileSize = width <= 768;
      const isTabletSize = width > 768 && width <= 1024;
      const isDesktopSize = width > 1024;

      // Combined detection logic
      const isMobile = isMobileUA || (isMobileSize && !isTabletUA);
      const isTablet = isTabletUA || (isTabletSize && !isMobileUA);
      const isDesktop = !isMobile && !isTablet;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        userAgent
      });
    };

    // Initial check
    checkDevice();

    // Listen for window resize
    window.addEventListener('resize', checkDevice);
    
    // Listen for orientation change on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(checkDevice, 100); // Small delay to get correct dimensions
    });

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return deviceInfo;
};

export default useDeviceDetection; 
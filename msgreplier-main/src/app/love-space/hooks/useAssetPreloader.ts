"use client";

import { useState, useEffect } from 'react';

/**
 * Hook to preload a list of image and audio assets.
 * Returns the current loading progress (0-100) and a boolean when fully loaded.
 */
export function useAssetPreloader(assets: string[]) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!assets || assets.length === 0) {
      setProgress(100);
      setIsLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalAssets = assets.length;

    const updateProgress = () => {
      loadedCount++;
      const currentProgress = Math.floor((loadedCount / totalAssets) * 100);
      setProgress(currentProgress);
      if (loadedCount === totalAssets) {
        setIsLoaded(true);
      }
    };

    assets.forEach((src) => {
      if (src.endsWith('.mp3')) {
        const audio = new Audio();
        audio.oncanplaythrough = updateProgress;
        audio.onerror = updateProgress; // still count errors so we don't hang
        audio.src = src;
        audio.load();
      } else {
        const img = new Image();
        img.onload = updateProgress;
        img.onerror = updateProgress;
        img.src = src;
      }
    });
  }, [assets]);

  return { progress, isLoaded };
}

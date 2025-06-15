const loadedScripts = new Set<string>();

export function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (loadedScripts.has(src)) {
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      loadedScripts.add(src);
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      loadedScripts.add(src);
      resolve();
    };
    
    script.onerror = (error) => {
      console.error("Failed to load script:", src, error);
      reject(new Error(`Failed to load script: ${src}`));
    };
    
    document.head.appendChild(script);
  });
} 
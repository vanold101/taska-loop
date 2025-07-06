// No-op replacement for deleted toast functionality
// All toast calls now use console.log instead

export const useToast = () => {
  return {
    toast: (options: any) => {
      if (options.variant === 'destructive') {
        console.error(options.title, options.description);
      } else {
        console.log(options.title, options.description);
      }
    }
  };
};

export const toast = (options: any) => {
  if (options.variant === 'destructive') {
    console.error(options.title, options.description);
  } else {
    console.log(options.title, options.description);
  }
}; 
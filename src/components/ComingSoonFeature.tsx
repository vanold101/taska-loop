import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface ComingSoonFeatureProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const ComingSoonFeature: React.FC<ComingSoonFeatureProps> = ({
  title,
  description = "This feature will be available in the next update!",
  children
}) => {
  return (
    <div className="relative">
      {/* The feature content (will be blurred) */}
      <div className="opacity-50 blur-[1px] pointer-events-none">
        {children}
      </div>
      
      {/* Coming soon overlay */}
      <motion.div 
        className="coming-soon-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="coming-soon-overlay-content">
          <Sparkles className="h-5 w-5 mx-auto mb-2 text-gloop-primary" />
          <h3 className="font-display">{title}</h3>
          <p>{description}</p>
        </div>
      </motion.div>
      
      {/* Badge */}
      <div className="coming-soon-badge">Coming Soon</div>
    </div>
  ); 
};

export default ComingSoonFeature;

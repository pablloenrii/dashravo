import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: ReactNode;
  color?: string;
}

interface TimelinePremiumProps {
  items: TimelineItem[];
}

export function TimelinePremium({ items }: TimelinePremiumProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ position: 'relative' }}
    >
      {/* Vertical line */}
      <div
        style={{
          position: 'absolute',
          left: '20px',
          top: 0,
          bottom: 0,
          width: '2px',
          background: 'linear-gradient(to bottom, #FF6200, transparent)',
        }}
      />

      {/* Timeline items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingLeft: '60px' }}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            style={{
              display: 'flex',
              gap: '16px',
              position: 'relative',
            }}
          >
            {/* Icon circle */}
            <div
              style={{
                position: 'absolute',
                left: '-50px',
                top: '2px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: item.color || '#FF6200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                border: '3px solid #09090B',
                zIndex: 1,
              }}
            >
              {item.icon}
            </div>

            {/* Content */}
            <motion.div
              whileHover={{ x: 4 }}
              style={{
                background: 'rgba(15,23,42,0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '16px',
                flex: 1,
              }}
            >
              <h3 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '14px', fontWeight: '600' }}>
                {item.title}
              </h3>
              {item.description && (
                <p style={{ margin: '0 0 8px 0', color: '#94A3B8', fontSize: '12px' }}>
                  {item.description}
                </p>
              )}
              <span style={{ color: '#64748B', fontSize: '11px' }}>{item.timestamp}</span>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

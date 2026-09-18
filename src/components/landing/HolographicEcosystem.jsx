import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorageIcon from '@mui/icons-material/Storage';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BarChartIcon from '@mui/icons-material/BarChart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LanguageIcon from '@mui/icons-material/Language';

// Define the absolute coordinates for nodes (percentage based 0-100)
const nodes = {
  erp: { x: 50, y: 50, label: 'Zen ERP & CRM', icon: <StorageIcon fontSize="large" />, color: '#00f2fe' },
  app: { x: 50, y: 15, label: 'E-Commerce App', icon: <ShoppingCartIcon fontSize="large" />, color: '#b388ff' },
  ai: { x: 85, y: 50, label: 'AI & WhatsApp', icon: <SmartToyIcon fontSize="large" />, color: '#00e676' },
  data: { x: 50, y: 85, label: 'Data Analytics', icon: <BarChartIcon fontSize="large" />, color: '#fbc02d' },
  pos: { x: 15, y: 50, label: 'Retail POS', icon: <StorefrontIcon fontSize="large" />, color: '#ff9a9e' },
  web: { x: 15, y: 15, label: 'Web Portal', icon: <LanguageIcon fontSize="large" />, color: '#4facfe' }
};

const sequence = [
  // Flow 1: E-com Order
  { time: 0, activeNode: 'app', popup: 'Customer places order on App', pulse: null },
  { time: 1.5, activeNode: null, popup: null, pulse: { from: 'app', to: 'erp' } },
  { time: 3, activeNode: 'erp', popup: 'Inventory updated, Invoice generated', pulse: null },
  { time: 4.5, activeNode: null, popup: null, pulse: { from: 'erp', to: 'ai' } },
  { time: 6, activeNode: 'ai', popup: 'WhatsApp Bot: "Order Shipped!"', pulse: null },
  
  // Pause
  { time: 8, activeNode: null, popup: null, pulse: null },

  // Flow 2: Offline POS Sale
  { time: 9, activeNode: 'pos', popup: 'In-store scan at POS terminal', pulse: null },
  { time: 10.5, activeNode: null, popup: null, pulse: { from: 'pos', to: 'erp' } },
  { time: 12, activeNode: 'erp', popup: 'Central Ledger Updated', pulse: null },
  { time: 13.5, activeNode: null, popup: null, pulse: { from: 'erp', to: 'data' } },
  { time: 15, activeNode: 'data', popup: 'Live PowerBI Dashboard: +$120 Revenue', pulse: null },

  // Pause
  { time: 17, activeNode: null, popup: null, pulse: null },

  // Flow 3: Web Lead
  { time: 18, activeNode: 'web', popup: 'New Lead submits contact form', pulse: null },
  { time: 19.5, activeNode: null, popup: null, pulse: { from: 'web', to: 'erp' } },
  { time: 21, activeNode: 'erp', popup: 'CRM Pipeline auto-assigns Lead', pulse: null },
  { time: 22.5, activeNode: null, popup: null, pulse: { from: 'erp', to: 'ai' } },
  { time: 24, activeNode: 'ai', popup: 'Telegram Alert: "New High Value Lead!"', pulse: null },
  
  // Loop restart
  { time: 26, activeNode: null, popup: null, pulse: null }
];

const HolographicEcosystem = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let currentStep = 0;
    
    const runSequence = () => {
      const nextStep = sequence[currentStep];
      setStepIndex(currentStep);
      
      currentStep++;
      if (currentStep >= sequence.length) {
        currentStep = 0; // Loop back
      }

      // Calculate time to next step
      const nextTime = sequence[currentStep] ? sequence[currentStep].time : sequence[0].time;
      const delay = (nextTime - nextStep.time) * 1000;
      
      // If delay is negative (looping back to 0), just wait 1 second
      setTimeout(runSequence, delay > 0 ? delay : 1000);
    };

    const initialTimer = setTimeout(runSequence, 1000);
    return () => clearTimeout(initialTimer);
  }, []);

  const currentFrame = sequence[stepIndex];

  return (
    <Box sx={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      overflow: 'hidden', perspective: '1000px', zIndex: 0,
      opacity: 0.6 // Blend with background
    }}>
      {/* 3D Tilted Container */}
      <motion.div
        initial={{ rotateX: 60, rotateZ: -45 }}
        animate={{ rotateZ: [-45, -35, -45] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Render SVG Connections */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Static lines */}
          {Object.keys(nodes).map(key => {
            if (key === 'erp') return null;
            return (
              <line 
                key={`line-${key}`}
                x1={`${nodes.erp.x}%`} y1={`${nodes.erp.y}%`}
                x2={`${nodes[key].x}%`} y2={`${nodes[key].y}%`}
                stroke="rgba(255,255,255,0.1)" strokeWidth="2"
                strokeDasharray="5,5"
              />
            );
          })}
          
          {/* Animated Pulse */}
          <AnimatePresence>
            {currentFrame?.pulse && (
              <motion.circle
                key={`pulse-${stepIndex}`}
                r="6"
                fill="#ffffff"
                style={{ filter: 'drop-shadow(0 0 10px #ffffff)' }}
                initial={{ 
                  cx: `${nodes[currentFrame.pulse.from].x}%`, 
                  cy: `${nodes[currentFrame.pulse.from].y}%` 
                }}
                animate={{ 
                  cx: `${nodes[currentFrame.pulse.to].x}%`, 
                  cy: `${nodes[currentFrame.pulse.to].y}%` 
                }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>
        </svg>

        {/* Render Nodes */}
        {Object.entries(nodes).map(([key, node]) => {
          const isActive = currentFrame?.activeNode === key;
          
          return (
            <Box key={key} sx={{
              position: 'absolute', left: `${node.x}%`, top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              zIndex: isActive ? 10 : 2
            }}>
              {/* Node Circle */}
              <motion.div
                animate={{
                  boxShadow: isActive 
                    ? `0 0 40px ${node.color}, inset 0 0 20px ${node.color}` 
                    : `0 0 10px rgba(0,0,0,0.5)`,
                  scale: isActive ? 1.2 : 1,
                  borderColor: isActive ? node.color : 'rgba(255,255,255,0.2)'
                }}
                transition={{ duration: 0.4 }}
                style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'rgba(10, 10, 15, 0.8)', backdropFilter: 'blur(10px)',
                  border: '2px solid', display: 'flex', justifyContent: 'center', alignItems: 'center',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  position: 'relative'
                }}
              >
                {node.icon}
                
                {/* Active Ring Ripple */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{
                      position: 'absolute', width: '100%', height: '100%',
                      borderRadius: '50%', border: `1px solid ${node.color}`
                    }}
                  />
                )}
              </motion.div>

              {/* Node Label (Flat to camera) */}
              <motion.div style={{ transform: 'rotateX(-60deg) rotateZ(45deg)', marginTop: 20 }}>
                <Typography variant="body2" fontWeight={800} sx={{ 
                  color: isActive ? node.color : 'rgba(255,255,255,0.6)', 
                  whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: 1,
                  textShadow: isActive ? `0 0 10px ${node.color}` : 'none'
                }}>
                  {node.label}
                </Typography>
              </motion.div>

              {/* Holographic Popup Message */}
              <AnimatePresence>
                {isActive && currentFrame.popup && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: -80, scale: 1 }}
                    exit={{ opacity: 0, y: -100, scale: 0.8 }}
                    style={{
                      position: 'absolute', top: 0,
                      background: `linear-gradient(135deg, rgba(10,10,15,0.95), rgba(30,30,40,0.95))`,
                      border: `1px solid ${node.color}`,
                      padding: '8px 16px', borderRadius: '4px',
                      transform: 'rotateX(-60deg) rotateZ(45deg)', // Keep readable to camera
                      whiteSpace: 'nowrap',
                      boxShadow: `0 5px 20px rgba(0,0,0,0.5), 0 0 15px ${node.color}40`,
                      pointerEvents: 'none'
                    }}
                  >
                    <Typography variant="caption" sx={{ 
                      color: 'white', fontFamily: 'monospace', fontWeight: 'bold',
                      display: 'flex', alignItems: 'center', gap: 1
                    }}>
                      <span style={{ color: node.color }}>{'>'}</span> {currentFrame.popup}
                    </Typography>
                  </motion.div>
                )}
              </AnimatePresence>
              
            </Box>
          );
        })}
      </motion.div>
    </Box>
  );
};

export default HolographicEcosystem;

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
  { activeNode: 'app', popup: 'Customer places order on App', pulse: null, duration: 1500 },
  { activeNode: null, popup: null, pulse: { from: 'app', to: 'erp' }, duration: 1000 },
  { activeNode: 'erp', popup: 'Inventory updated, Invoice generated', pulse: null, duration: 2000 },
  { activeNode: null, popup: null, pulse: { from: 'erp', to: 'ai' }, duration: 1000 },
  { activeNode: 'ai', popup: 'WhatsApp Bot: "Order Shipped!"', pulse: null, duration: 2000 },
  { activeNode: null, popup: null, pulse: null, duration: 1000 }, // Pause

  // Flow 2: Offline POS Sale
  { activeNode: 'pos', popup: 'In-store scan at POS terminal', pulse: null, duration: 1500 },
  { activeNode: null, popup: null, pulse: { from: 'pos', to: 'erp' }, duration: 1000 },
  { activeNode: 'erp', popup: 'Central Ledger Updated', pulse: null, duration: 2000 },
  { activeNode: null, popup: null, pulse: { from: 'erp', to: 'data' }, duration: 1000 },
  { activeNode: 'data', popup: 'Live PowerBI Dashboard: +$120 Revenue', pulse: null, duration: 2000 },
  { activeNode: null, popup: null, pulse: null, duration: 1000 }, // Pause

  // Flow 3: Web Lead
  { activeNode: 'web', popup: 'New Lead submits contact form', pulse: null, duration: 1500 },
  { activeNode: null, popup: null, pulse: { from: 'web', to: 'erp' }, duration: 1000 },
  { activeNode: 'erp', popup: 'CRM Pipeline auto-assigns Lead', pulse: null, duration: 2000 },
  { activeNode: null, popup: null, pulse: { from: 'erp', to: 'ai' }, duration: 1000 },
  { activeNode: 'ai', popup: 'Telegram Alert: "New High Value Lead!"', pulse: null, duration: 2000 },
  { activeNode: null, popup: null, pulse: null, duration: 1000 } // Loop restart
];

const HolographicEcosystem = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const runTimer = () => {
      const frame = sequence[stepIndex];
      setTimeout(() => {
        if (isMounted) {
          setStepIndex((prev) => (prev + 1) % sequence.length);
        }
      }, frame.duration);
    };
    runTimer();
    return () => { isMounted = false; };
  }, [stepIndex]);

  // If user hovers over a node, override the display frame to highlight their target
  const currentFrame = hoveredNode 
    ? { activeNode: hoveredNode, popup: `${nodes[hoveredNode].label} Systems Active`, pulse: null } 
    : sequence[stepIndex];

  return (
    <Box sx={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      overflow: 'hidden', perspective: '1200px', zIndex: 0,
      opacity: 0.8
    }}>
      {/* 3D Tilted Container with Mobile Scaling */}
      <Box sx={{
        position: 'absolute', top: '10%', left: { xs: '-20%', sm: '0%', md: '10%' }, 
        width: { xs: '140%', sm: '100%', md: '80%' }, height: '80%',
        transform: { xs: 'scale(0.55)', sm: 'scale(0.7)', md: 'scale(1)' },
        transformOrigin: 'center center',
        transformStyle: 'preserve-3d'
      }}>
        <motion.div
          initial={{ rotateX: 60, rotateZ: -45 }}
          animate={{ rotateZ: [-45, -35, -45] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute', width: '100%', height: '100%',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* 1. Neon Grid Floor (The Matrix) */}
          <motion.div
            animate={{ backgroundPosition: ['0px 0px', '60px 60px'] }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            style={{
              position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
              backgroundImage: `
                linear-gradient(rgba(0, 242, 254, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 242, 254, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              transform: 'translateZ(-60px)', // Drops the grid below the nodes
              opacity: 0.6, pointerEvents: 'none',
              boxShadow: 'inset 0 0 150px rgba(0,0,0,1)' // Fades the edges into darkness
            }}
          />

          {/* 2. SVG Connections & Ambient Traffic */}
          <svg style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'visible', transform: 'translateZ(-10px)' }}>
            {Object.keys(nodes).map(key => {
              if (key === 'erp') return null;
              return (
                <g key={`connection-${key}`}>
                  {/* Base Faint Line */}
                  <line 
                    x1={`${nodes.erp.x}%`} y1={`${nodes.erp.y}%`}
                    x2={`${nodes[key].x}%`} y2={`${nodes[key].y}%`}
                    stroke="rgba(255,255,255,0.05)" strokeWidth="3"
                  />
                  {/* Ambient Flowing Data Traffic (Fiber Optic Ants) */}
                  <motion.line 
                    x1={`${nodes.erp.x}%`} y1={`${nodes.erp.y}%`}
                    x2={`${nodes[key].x}%`} y2={`${nodes[key].y}%`}
                    stroke={nodes[key].color} strokeWidth="2" opacity="0.4"
                    strokeDasharray="8 24"
                    animate={{ strokeDashoffset: [0, -32] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  />
                </g>
              );
            })}
            
            {/* Main Action Pulse (Overrides ambient traffic) */}
            <AnimatePresence>
              {currentFrame?.pulse && (
                <motion.circle
                  key={`pulse-${stepIndex}`}
                  r="8" fill="#ffffff"
                  style={{ filter: 'drop-shadow(0 0 15px #ffffff)' }}
                  initial={{ 
                    cx: `${nodes[currentFrame.pulse.from].x}%`, 
                    cy: `${nodes[currentFrame.pulse.from].y}%` 
                  }}
                  animate={{ 
                    cx: `${nodes[currentFrame.pulse.to].x}%`, 
                    cy: `${nodes[currentFrame.pulse.to].y}%` 
                  }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              )}
            </AnimatePresence>
          </svg>

          {/* 3. The 3D Nodes */}
          {Object.entries(nodes).map(([key, node]) => {
            const isActive = currentFrame?.activeNode === key;
            const isHoverTarget = hoveredNode === key;
            
            return (
              <Box 
                key={key} 
                onMouseEnter={() => setHoveredNode(key)}
                onMouseLeave={() => setHoveredNode(null)}
                sx={{
                  position: 'absolute', left: `${node.x}%`, top: `${node.y}%`,
                  transform: 'translate(-50%, -50%) translateZ(0px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  zIndex: isActive || isHoverTarget ? 10 : 2,
                  cursor: 'pointer'
                }}
              >
                {/* Node Glass Circle */}
                <motion.div
                  animate={{
                    boxShadow: isActive 
                      ? `0 0 50px ${node.color}, inset 0 0 25px ${node.color}` 
                      : `0 0 15px rgba(0,0,0,0.8), inset 0 0 5px ${node.color}40`,
                    scale: isActive ? 1.25 : 1,
                    borderColor: isActive ? node.color : 'rgba(255,255,255,0.1)'
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: key === 'erp' ? 100 : 80, 
                    height: key === 'erp' ? 100 : 80, 
                    borderRadius: '50%',
                    background: 'rgba(5, 5, 10, 0.85)', backdropFilter: 'blur(12px)',
                    border: '2px solid', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                    position: 'relative'
                  }}
                >
                  {node.icon}
                  
                  {/* Radial Glow underneath active node */}
                  {isActive && (
                    <Box sx={{
                      position: 'absolute', width: '300%', height: '300%',
                      background: `radial-gradient(circle, ${node.color}30 0%, transparent 70%)`,
                      transform: 'translateZ(-20px)', pointerEvents: 'none'
                    }} />
                  )}

                  {/* Active Ring Ripple */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{
                        position: 'absolute', width: '100%', height: '100%',
                        borderRadius: '50%', border: `1.5px solid ${node.color}`
                      }}
                    />
                  )}
                </motion.div>

                {/* Node Label (Flat to camera) */}
                <motion.div style={{ transform: 'rotateX(-60deg) rotateZ(45deg)', marginTop: 25 }}>
                  <Typography variant="body2" fontWeight={900} sx={{ 
                    color: isActive ? node.color : 'rgba(255,255,255,0.7)', 
                    whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: 2,
                    textShadow: isActive ? `0 0 15px ${node.color}` : 'none'
                  }}>
                    {node.label}
                  </Typography>
                </motion.div>

                {/* Holographic Popup Message */}
                <AnimatePresence>
                  {isActive && currentFrame.popup && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: -100, scale: 1 }}
                      exit={{ opacity: 0, y: -120, scale: 0.8 }}
                      style={{
                        position: 'absolute', top: 0,
                        background: `linear-gradient(135deg, rgba(10,10,15,0.95), rgba(30,30,40,0.95))`,
                        border: `1px solid ${node.color}`,
                        borderLeft: `4px solid ${node.color}`, // Tech accent
                        padding: '10px 20px', borderRadius: '4px',
                        transform: 'rotateX(-60deg) rotateZ(45deg)', // Flat to camera
                        whiteSpace: 'nowrap',
                        boxShadow: `0 10px 30px rgba(0,0,0,0.8), 0 0 20px ${node.color}40`,
                        pointerEvents: 'none'
                      }}
                    >
                      <Typography variant="caption" sx={{ 
                        color: 'white', fontFamily: 'monospace', fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', gap: 1.5
                      }}>
                        <motion.span 
                          animate={{ opacity: [1, 0, 1] }} 
                          transition={{ repeat: Infinity, duration: 1 }}
                          style={{ color: node.color, fontWeight: 'bold' }}
                        >
                          {'>_'}
                        </motion.span> 
                        {currentFrame.popup}
                      </Typography>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </Box>
            );
          })}
        </motion.div>
      </Box>
    </Box>
  );
};

export default HolographicEcosystem;

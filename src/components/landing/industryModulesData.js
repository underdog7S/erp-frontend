import React from 'react';
import { School as SchoolIcon, LocalHospital as HealthcareIcon, ShoppingCart as ShoppingCartIcon, Hotel as HotelIcon, Restaurant as RestaurantIcon, Person as PersonIcon, ContentCut as SalonIcon, Factory as FactoryIcon } from '@mui/icons-material';

export   const industryModules = [
    {
      title: "Education Management",
      subtitle: "Complete Academic Solution",
      icon: <SchoolIcon sx={{ fontSize: 48 }} />,
      primaryColor: "#1976d2", // Professional blue
      accentColor: "#42a5f5", // Light blue
      bgGradient: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
      features: [
        "Student Admission & Management",
        "Fee Structure & Payment Tracking",
        "Online Fee Payment via Razorpay",
        "Attendance System (Student & Staff)",
        "Report Cards & Grading",
        "Academic Reports & Analytics"
      ],
      stats: "25+ Schools",
      useCases: ["Schools", "Colleges", "Universities"]
    },
    {
      title: "Pharmacy Management",
      subtitle: "Complete Pharmacy Solution",
      icon: <HealthcareIcon sx={{ fontSize: 48 }} />,
      primaryColor: "#7b1fa2", // Purple
      accentColor: "#ba68c8",
      bgGradient: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
      features: [
        "Medicine & Category Management",
        "Batch Tracking & Expiry Alerts",
        "Prescription Processing",
        "Sales & Billing System",
        "Online Payment via Razorpay",
        "Inventory Control & Analytics"
      ],
      stats: "30+ Pharmacies",
      useCases: ["Retail Pharmacies", "Hospital Pharmacies", "Chain Pharmacies"]
    },
    {
      title: "Retail & Wholesale",
      subtitle: "Multi-Warehouse Solution",
      icon: <ShoppingCartIcon sx={{ fontSize: 48 }} />,
      primaryColor: "#1976d2", // Professional blue
      accentColor: "#42a5f5",
      bgGradient: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
      features: [
        "Multi-Warehouse Management",
        "Product Catalog & SKU Management",
        "Real-time Inventory Tracking",
        "Sales Management & POS",
        "Online Payment via Razorpay",
        "Advanced Inventory Analytics"
      ],
      stats: "50+ Stores",
      useCases: ["Retail Stores", "Wholesale Businesses", "Distribution"]
    },
    {
      title: "Manufacturing",
      subtitle: "Production & BOM Solution",
      icon: <FactoryIcon sx={{ fontSize: 48 }} />,
      primaryColor: "#455a64", // Industrial blue-grey
      accentColor: "#78909c",
      bgGradient: "linear-gradient(135deg, #eceff1 0%, #cfd8dc 100%)",
      features: [
        "Raw Material & Finished Goods Inventory",
        "Bill of Materials (BOM) with versioning",
        "Production Order Tracking",
        "Quality Control Checks",
        "Supplier & Purchase Order Management",
        "Wholesale Sales & Customer Management"
      ],
      stats: "New",
      useCases: ["Factories", "Workshops", "Wholesale Manufacturers"]
    },
    {
      title: "Hotel Management",
      subtitle: "Complete Hospitality Solution",
      icon: <HotelIcon sx={{ fontSize: 48 }} />,
      primaryColor: "#f57c00", // Warm orange
      accentColor: "#ff9800",
      bgGradient: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
      features: [
        "Room Type & Rate Management",
        "Booking & Reservation System",
        "Check-in & Check-out Management",
        "Online Payment via Razorpay",
        "Guest Registration & Records",
        "Occupancy Reports & Analytics"
      ],
      stats: "15+ Hotels",
      useCases: ["Hotels", "Resorts", "Guest Houses"]
    },
    {
      title: "Restaurant Management",
      subtitle: "Complete Dining Solution",
      icon: <RestaurantIcon sx={{ fontSize: 48 }} />,
      primaryColor: "#d32f2f", // Red
      accentColor: "#ef5350",
      bgGradient: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
      features: [
        "Menu Category & Item Management",
        "Table Management & Seating",
        "Order Taking & Processing",
        "Online Payment via Razorpay",
        "Cloud Kitchen & External API Integration",
        "Kitchen Display System",
        "Sales & Revenue Reports"
      ],
      stats: "40+ Restaurants",
      useCases: ["Restaurants", "Cafes", "Food Courts"]
    },
    {
      title: "Salon Management",
      subtitle: "Beauty & Spa Solution",
      icon: <PersonIcon sx={{ fontSize: 48 }} />,
      primaryColor: "#9c27b0", // Purple
      accentColor: "#ba68c8",
      bgGradient: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
      features: [
        "Service & Pricing Management",
        "Appointment Booking System",
        "Online Payment via Razorpay",
        "Stylist & Staff Management",
        "Customer Management",
        "Revenue & Performance Analytics"
      ],
      stats: "35+ Salons",
      useCases: ["Salons", "Spa Centers", "Beauty Parlors"]
    }
  ];

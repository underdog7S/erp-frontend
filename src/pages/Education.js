import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, CircularProgress, Alert, Avatar } from '@mui/material';
import { 
  School as SchoolIcon, 
  Person as PersonIcon, 
  AttachMoney as AttachMoneyIcon, 
  EventAvailable as EventAvailableIcon, 
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

import api from '../services/api';
import useUrlTab from '../hooks/useUrlTab';
import FeeManagement from '../components/FeeManagement';

// Modularized Tabs
import ClassesTab from './Education/components/ClassesTab';
import StudentsTab from './Education/components/StudentsTab';
import AttendanceTab from './Education/components/AttendanceTab';
import AcademicConfigurationTab from './Education/components/AcademicConfigurationTab';
import GradingTab from './Education/components/GradingTab';
import EducationAnalyticsTab from './Education/components/EducationAnalyticsTab';
import AdministrationTab from './Education/components/AdministrationTab';

const EDUCATION_TABS = ['classes', 'students', 'attendance', 'grading', 'academic', 'fees', 'analytics', 'administration'];

const Education = () => {
  const [tab, setTab] = useUrlTab(EDUCATION_TABS);
  
  // Global Data loaded once for use across tabs (like Classes)
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const [profRes, classRes, stuRes, subjRes, termRes, ayRes] = await Promise.all([
          api.get('/users/me/').catch(() => ({ data: {} })),
          api.get('/education/classes/').catch(() => ({ data: [] })),
          api.get('/education/students/').catch(() => ({ data: [] })),
          api.get('/education/subjects/').catch(() => ({ data: [] })),
          api.get('/education/terms/').catch(() => ({ data: [] })),
          api.get('/education/academic-years/').catch(() => ({ data: [] }))
        ]);
        
        setUserProfile(profRes.data);
        setClasses(classRes.data || []);
        setStudents(Array.isArray(stuRes.data) ? stuRes.data : stuRes.data.results || []);
        setSubjects(Array.isArray(subjRes.data) ? subjRes.data : subjRes.data.results || []);
        setTerms(Array.isArray(termRes.data) ? termRes.data : termRes.data.results || []);
        setAcademicYears(ayRes.data || []);
      } catch (err) {
        console.error("Error loading global education data", err);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchGlobalData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const isAdminOrPrincipal = userProfile?.role === 'admin' || userProfile?.role === 'principal';

  if (loadingInitial) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: 'primary.main' }}>
        Education Module
      </Typography>
      
      {/* Profile Header */}
      {userProfile && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
              {userProfile.username ? userProfile.username.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box>
              <Typography variant="h6">{userProfile.first_name} {userProfile.last_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Role: {userProfile.role ? userProfile.role.toUpperCase() : 'N/A'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Modern Scrollable Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tab} 
          onChange={handleTabChange} 
          variant="scrollable" 
          scrollButtons="auto"
          sx={{ '& .MuiTab-root': { fontWeight: 'bold' } }}
        >
          <Tab icon={<SchoolIcon />} label="Classes" />
          <Tab icon={<PersonIcon />} label="Students" />
          <Tab icon={<EventAvailableIcon />} label="Attendance" />
          <Tab icon={<AssessmentIcon />} label="Grading & Reports" />
          <Tab icon={<SettingsIcon />} label="Academic Config" />
          <Tab icon={<AttachMoneyIcon />} label="Fee Management" />
          <Tab icon={<TimelineIcon />} label="Analytics" />
          <Tab icon={<AdminIcon />} label="Administration" />
        </Tabs>
      </Box>

      {/* Tab Contents */}
      <Box sx={{ minHeight: 400 }}>
        {tab === 0 && <ClassesTab />}
        {tab === 1 && <StudentsTab classes={classes} />}
        {tab === 2 && <AttendanceTab classes={classes} />}
        {tab === 3 && <GradingTab students={students} subjects={subjects} terms={terms} academicYears={academicYears} />}
        {tab === 4 && <AcademicConfigurationTab classes={classes} />}
        {tab === 5 && <FeeManagement />}
        {tab === 6 && <EducationAnalyticsTab />}
        {tab === 7 && <AdministrationTab canAccessSettings={isAdminOrPrincipal} />}
      </Box>
    </Box>
  );
};

export default Education;
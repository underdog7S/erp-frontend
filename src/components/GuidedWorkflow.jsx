import React, { useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Button,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Chip
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon
} from '@mui/icons-material';

const GuidedWorkflow = ({ 
  title, 
  steps = [], 
  onComplete, 
  onCancel,
  showStepper = true,
  showProgress = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [stepData, setStepData] = useState({});

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete the workflow
      onComplete?.(stepData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = (stepIndex, data) => {
    setStepData(prev => ({ ...prev, ...data }));
    setCompletedSteps(prev => [...prev, stepIndex]);
    
    // Auto-advance to next step if not the last step
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const handleStepBack = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const isStepCompleted = (stepIndex) => {
    return completedSteps.includes(stepIndex);
  };

  const canProceedToNext = () => {
    const currentStepData = stepData[`step_${currentStep}`];
    return currentStepData && Object.keys(currentStepData).length > 0;
  };

  const getProgressPercentage = () => {
    return ((currentStep + 1) / steps.length) * 100;
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        {title}
      </Typography>

      {/* Progress Bar */}
      {showProgress && (
        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Step {currentStep + 1} of {steps.length}
            </Typography>
            <Typography variant="body2" color="primary">
              {Math.round(getProgressPercentage())}% Complete
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getProgressPercentage()}
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4
              }
            }}
          />
        </Box>
      )}

      {/* Stepper */}
      {showStepper && (
        <Stepper activeStep={currentStep} orientation="vertical" sx={{ mb: 3 }}>
          {steps.map((step, index) => (
            <Step key={index} completed={isStepCompleted(index)}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: { xs: '1rem', sm: '0.875rem' },
                    fontWeight: currentStep === index ? 'bold' : 'normal'
                  }
                }}
              >
                {step.title}
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>
                {step.component && (
                  <Box sx={{ mb: 2 }}>
                    {React.cloneElement(step.component, {
                      onComplete: (data) => handleStepComplete(index, data),
                      onBack: () => handleStepBack(index - 1),
                      data: stepData[`step_${index}`] || {},
                      isActive: currentStep === index
                    })}
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      )}

      {/* Current Step Content */}
      {!showStepper && steps[currentStep] && (
        <Card sx={{ mb: 3, borderRadius: { xs: 3, sm: 2 } }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              {steps[currentStep].title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {steps[currentStep].description}
            </Typography>
            
            {steps[currentStep].component && (
              <Box>
                {React.cloneElement(steps[currentStep].component, {
                  onComplete: (data) => handleStepComplete(currentStep, data),
                  onBack: () => handleStepBack(currentStep - 1),
                  data: stepData[`step_${currentStep}`] || {},
                  isActive: true
                })}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <Box>
          {currentStep > 0 && (
            <Button
              variant="outlined"
              startIcon={<PrevIcon />}
              onClick={handlePrevious}
              sx={{
                minHeight: { xs: 56, sm: 40 },
                fontSize: { xs: '1rem', sm: '0.875rem' },
                padding: { xs: '12px 24px', sm: '8px 16px' }
              }}
            >
              Previous
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {onCancel && (
            <Button
              variant="outlined"
              color="error"
              onClick={onCancel}
              sx={{
                minHeight: { xs: 56, sm: 40 },
                fontSize: { xs: '1rem', sm: '0.875rem' },
                padding: { xs: '12px 24px', sm: '8px 16px' }
              }}
            >
              Cancel
            </Button>
          )}
          
          <Button
            variant="contained"
            endIcon={currentStep === steps.length - 1 ? <CheckIcon /> : <NextIcon />}
            onClick={handleNext}
            disabled={!canProceedToNext()}
            sx={{
              minHeight: { xs: 56, sm: 40 },
              fontSize: { xs: '1rem', sm: '0.875rem' },
              padding: { xs: '12px 24px', sm: '8px 16px' },
              fontWeight: 'bold'
            }}
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </Box>
      </Box>

      {/* Step Summary */}
      {stepData && Object.keys(stepData).length > 0 && (
        <Paper sx={{ mt: 3, p: 2, backgroundColor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Summary
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(stepData).map(([key, value]) => (
              <Chip
                key={key}
                label={`${key}: ${value}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

// Example step components
export const CustomerSelectionStep = ({ onComplete, data, isActive }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(data.selectedCustomer || '');

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    onComplete({ selectedCustomer: customer });
  };

  if (!isActive) return null;

  return (
    <Box>
      <Typography variant="body2" gutterBottom>
        Select a customer for this transaction
      </Typography>
      {/* Add your customer selection component here */}
      <Button
        variant="outlined"
        onClick={() => handleCustomerSelect('John Doe')}
        sx={{ mt: 2 }}
      >
        Select Customer
      </Button>
    </Box>
  );
};

export const ItemSelectionStep = ({ onComplete, data, isActive }) => {
  const [selectedItems, setSelectedItems] = useState(data.selectedItems || []);

  const handleItemAdd = (item) => {
    const newItems = [...selectedItems, item];
    setSelectedItems(newItems);
    onComplete({ selectedItems: newItems });
  };

  if (!isActive) return null;

  return (
    <Box>
      <Typography variant="body2" gutterBottom>
        Add items to the transaction
      </Typography>
      {/* Add your item selection component here */}
      <Button
        variant="outlined"
        onClick={() => handleItemAdd('Medicine A')}
        sx={{ mt: 2 }}
      >
        Add Item
      </Button>
    </Box>
  );
};

export const ReviewStep = ({ onComplete, data, isActive }) => {
  if (!isActive) return null;

  return (
    <Box>
      <Typography variant="body2" gutterBottom>
        Review the transaction details
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Customer: {data.selectedCustomer}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Items: {data.selectedItems?.length || 0}
      </Typography>
      <Button
        variant="contained"
        onClick={() => onComplete({ reviewed: true })}
        sx={{ mt: 2 }}
      >
        Confirm
      </Button>
    </Box>
  );
};

export default GuidedWorkflow; 
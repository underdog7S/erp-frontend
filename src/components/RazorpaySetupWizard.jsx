import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Stepper, Step, StepLabel, Typography, TextField, Button,
  Alert, CircularProgress, Link, Card, CardContent, Divider, Checkbox,
  FormControlLabel, Accordion, AccordionSummary, AccordionDetails, Chip, Switch
} from '@mui/material';
import { CheckCircle, Error as ErrorIcon, ExpandMore, Lock, Security, Link as LinkIcon, ContentCopy } from '@mui/icons-material';
import { getRazorpaySetupStatus, getRazorpaySetupGuide, configureRazorpay, getUpiSettings, updateUpiSettings } from '../services/api';

const RazorpaySetupWizard = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [setupStatus, setSetupStatus] = useState(null);
  const [setupGuide, setSetupGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState('');
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [upiForm, setUpiForm] = useState({
    upi_payments_enabled: false,
    upi_id: '',
    upi_display_name: '',
    upi_notes: ''
  });
  const [upiLoading, setUpiLoading] = useState(true);
  const [upiSaving, setUpiSaving] = useState(false);
  const [upiError, setUpiError] = useState('');
  const [upiSuccess, setUpiSuccess] = useState('');

  useEffect(() => {
    loadSetupData();
    loadUpiSettings();
  }, []);

  const loadSetupData = async () => {
    try {
      setLoading(true);
      const [status, guide] = await Promise.all([
        getRazorpaySetupStatus(),
        getRazorpaySetupGuide()
      ]);
      setSetupStatus(status);
      setSetupGuide(guide);
      
      // Pre-fill form if keys exist (but mask secrets)
      if (status.has_key_id) {
        setRazorpayKeyId('***configured***');
      }
      if (status.has_key_secret) {
        setRazorpayKeySecret('***configured***');
      }
      if (status.has_webhook_secret) {
        setRazorpayWebhookSecret('***configured***');
      }
      setRazorpayEnabled(status.is_enabled);
      
      // Set active step based on completion
      if (status.setup_completed) {
        setActiveStep(4);
      } else if (status.has_key_id && status.has_key_secret) {
        setActiveStep(3);
      } else if (status.has_key_id) {
        setActiveStep(2);
      } else {
        setActiveStep(1);
      }
    } catch (err) {
      setError('Failed to load setup information: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadUpiSettings = async () => {
    try {
      setUpiLoading(true);
      const data = await getUpiSettings();
      setUpiForm({
        upi_payments_enabled: !!data.upi_payments_enabled,
        upi_id: data.upi_id || '',
        upi_display_name: data.upi_display_name || '',
        upi_notes: data.upi_notes || ''
      });
      setUpiError('');
    } catch (err) {
      setUpiError(err.response?.data?.error || 'Failed to load UPI settings.');
    } finally {
      setUpiLoading(false);
    }
  };

  const handleSaveUpi = async () => {
    try {
      setUpiSaving(true);
      setUpiError('');
      setUpiSuccess('');
      await updateUpiSettings(upiForm);
      setUpiSuccess('UPI settings saved successfully.');
      await loadUpiSettings();
    } catch (err) {
      setUpiError(err.response?.data?.error || 'Failed to save UPI settings.');
    } finally {
      setUpiSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Don't send masked values
      const data = {
        razorpay_enabled: razorpayEnabled
      };

      if (razorpayKeyId && !razorpayKeyId.includes('***')) {
        data.razorpay_key_id = razorpayKeyId;
      }
      if (razorpayKeySecret && !razorpayKeySecret.includes('***')) {
        data.razorpay_key_secret = razorpayKeySecret;
      }
      if (razorpayWebhookSecret && !razorpayWebhookSecret.includes('***')) {
        data.razorpay_webhook_secret = razorpayWebhookSecret;
      }

      await configureRazorpay(data);
      setSuccess('Razorpay configuration saved successfully!');
      await loadSetupData();
      
      if (onComplete) {
        setTimeout(() => onComplete(), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    'Create Razorpay Account',
    'Get API Keys',
    'Configure Webhook',
    'Enter Credentials',
    'Complete'
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Security sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4">Razorpay Payment Gateway Setup</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Quick Jump to Credentials Form Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Lock />}
          onClick={() => {
            const formElement = document.getElementById('razorpay-credentials-form');
            if (formElement) {
              formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          sx={{ 
            px: 4, 
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: 3
          }}
        >
          📝 Enter Credentials Here (Step 4)
        </Button>
      </Box>

      {setupGuide && (
        <Box sx={{ mb: 4 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Setup Guide:</strong> Follow these steps carefully to configure Razorpay payment gateway. 
              Each step includes detailed instructions and links to Razorpay Dashboard.
            </Typography>
          </Alert>
          
          {setupGuide.steps.map((step, index) => (
            <Card key={index} sx={{ 
              mb: 2, 
              border: activeStep === index ? '2px solid' : '1px solid', 
              borderColor: activeStep === index ? 'primary.main' : 'divider',
              bgcolor: activeStep === index ? 'action.hover' : 'background.paper',
              transition: 'all 0.3s ease'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Step {step.step}: {step.title}
                  </Typography>
                  {setupStatus?.setup_steps[index]?.completed && (
                    <Chip 
                      icon={<CheckCircle />} 
                      label="Completed" 
                      color="success" 
                      size="small"
                    />
                  )}
                  {activeStep === index && !setupStatus?.setup_steps[index]?.completed && (
                    <Chip 
                      label="Current Step" 
                      color="primary" 
                      size="small"
                    />
                  )}
                </Box>
                <Typography color="text.secondary" paragraph>
                  {step.description}
                </Typography>
                
                {step.instructions && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
                      Detailed Instructions:
                    </Typography>
                    <Box component="ol" sx={{ marginLeft: 3, paddingLeft: 0 }}>
                      {step.instructions.map((instruction, idx) => (
                        <Box component="li" key={idx} sx={{ marginBottom: 1.5 }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                            {instruction}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {step.estimated_time && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Estimated Time:</strong> {step.estimated_time}
                    </Typography>
                  </Alert>
                )}

                {step.note && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Note:</strong> {step.note}
                    </Typography>
                  </Alert>
                )}

                {step.webhook_url && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Webhook URL to configure in Razorpay Dashboard:</strong>
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mt: 1,
                      p: 1.5,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Box component="code" sx={{ 
                        flex: 1, 
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        wordBreak: 'break-all',
                        color: 'primary.main'
                      }}>
                        {step.webhook_url}
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ContentCopy />}
                        onClick={() => {
                          navigator.clipboard.writeText(step.webhook_url);
                          setSuccess('Webhook URL copied to clipboard!');
                          setTimeout(() => setSuccess(''), 3000);
                        }}
                        sx={{ flexShrink: 0 }}
                      >
                        Copy
                      </Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Copy this URL and paste it in Razorpay Dashboard → Settings → Webhooks → Add New Webhook
                    </Typography>
                  </Alert>
                )}

                {step.help_url && (
                  <Button
                    variant="contained"
                    href={step.help_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 2, mr: 1 }}
                    startIcon={<LinkIcon />}
                  >
                    Open {step.title.includes('Account') ? 'Razorpay Signup' : step.title.includes('API') ? 'API Keys Page' : step.title.includes('Webhook') ? 'Webhooks Page' : 'Dashboard'}
                  </Button>
                )}

                {step.action_url && !step.help_url && (
                  <Button
                    variant="outlined"
                    href={step.action_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 2 }}
                  >
                    Open {step.title.includes('Account') ? 'Razorpay' : 'Dashboard'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Step 4: Enter Credentials - Form is always visible for easy access */}
      {activeStep === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Enter Your Razorpay Credentials
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Enter the credentials you copied from Razorpay Dashboard. These settings will apply to all sectors (Education, Salon, Pharmacy, Retail, Restaurant, Hotel) for your organization.
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> These credentials are tenant-specific. Each organization has its own Razorpay configuration. Payments will be received by the respective tenant.
            </Typography>
          </Alert>

          <TextField
            fullWidth
            label="Razorpay Key ID"
            value={razorpayKeyId}
            onChange={(e) => setRazorpayKeyId(e.target.value)}
            placeholder="rzp_test_... or rzp_live_..."
            margin="normal"
            helperText="Your Razorpay Key ID (starts with rzp_)"
            InputProps={{
              endAdornment: razorpayKeyId.includes('***') ? (
                <Button size="small" onClick={() => setRazorpayKeyId('')}>
                  Edit
                </Button>
              ) : null
            }}
          />

          <TextField
            fullWidth
            label="Razorpay Key Secret"
            type={showSecrets ? 'text' : 'password'}
            value={razorpayKeySecret}
            onChange={(e) => setRazorpayKeySecret(e.target.value)}
            placeholder={razorpayKeySecret.includes('***') ? 'Enter new Key Secret to update' : 'Enter your Key Secret'}
            margin="normal"
            helperText="Your Razorpay Key Secret (keep it secure)"
            InputProps={{
              endAdornment: (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {razorpayKeySecret.includes('***') && (
                    <Button size="small" onClick={() => setRazorpayKeySecret('')}>
                      Edit
                    </Button>
                  )}
                  {!razorpayKeySecret.includes('***') && (
                    <Button size="small" onClick={() => setShowSecrets(!showSecrets)}>
                      {showSecrets ? 'Hide' : 'Show'}
                    </Button>
                  )}
                </Box>
              )
            }}
          />

          <TextField
            fullWidth
            label="Webhook Secret (Optional)"
            type={showSecrets ? 'text' : 'password'}
            value={razorpayWebhookSecret}
            onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
            placeholder={razorpayWebhookSecret.includes('***') ? 'Enter new Webhook Secret to update' : 'Enter webhook secret'}
            margin="normal"
            helperText="Webhook secret from Razorpay Dashboard (recommended for production)"
            InputProps={{
              endAdornment: (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {razorpayWebhookSecret.includes('***') && (
                    <Button size="small" onClick={() => setRazorpayWebhookSecret('')}>
                      Edit
                    </Button>
                  )}
                  {!razorpayWebhookSecret.includes('***') && (
                    <Button size="small" onClick={() => setShowSecrets(!showSecrets)}>
                      {showSecrets ? 'Hide' : 'Show'}
                    </Button>
                  )}
                </Box>
              )
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={razorpayEnabled}
                onChange={(e) => setRazorpayEnabled(e.target.checked)}
              />
            }
            label="Enable Razorpay payments for this organization"
            sx={{ mt: 2 }}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <Lock />}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
            <Button variant="outlined" onClick={loadSetupData}>
              Refresh Status
            </Button>
          </Box>
        </Box>
      )}

      {/* Credentials Form - Always visible at the bottom for easy access */}
      <Box 
        id="razorpay-credentials-form"
        sx={{ 
          mt: 4, 
          pt: 3, 
          border: '3px solid',
          borderColor: 'primary.main',
          bgcolor: activeStep === 3 ? 'action.hover' : 'background.paper',
          p: 4,
          borderRadius: 2,
          boxShadow: activeStep === 3 ? 4 : 2,
          position: 'relative'
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Lock sx={{ color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h6" gutterBottom sx={{ mb: 0, color: 'primary.main', fontWeight: 'bold' }}>
            {activeStep === 3 ? 'Step 4: Enter Your Razorpay Credentials' : 'Enter Razorpay Credentials (Step 4)'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          {activeStep === 3 
            ? 'Fill in your Razorpay credentials below. These will be saved securely for your organization.' 
            : 'You can enter your credentials here at any time. Complete Steps 1-3 first, then enter your credentials below.'}
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> These credentials are tenant-specific. Each organization has its own Razorpay configuration. Payments will be received by the respective tenant.
          </Typography>
        </Alert>

        <TextField
          fullWidth
          label="Razorpay Key ID"
          value={razorpayKeyId}
          onChange={(e) => setRazorpayKeyId(e.target.value)}
          placeholder="rzp_test_... or rzp_live_..."
          margin="normal"
          helperText="Your Razorpay Key ID (starts with rzp_)"
          InputProps={{
            endAdornment: razorpayKeyId.includes('***') ? (
              <Button size="small" onClick={() => setRazorpayKeyId('')}>
                Clear Masked Value
              </Button>
            ) : null
          }}
        />

        <TextField
          fullWidth
          label="Razorpay Key Secret"
          type={showSecrets ? 'text' : 'password'}
          value={razorpayKeySecret}
          onChange={(e) => setRazorpayKeySecret(e.target.value)}
          placeholder={razorpayKeySecret.includes('***') ? 'Enter new Key Secret to update' : 'Enter your Key Secret'}
          margin="normal"
          helperText="Your Razorpay Key Secret (keep it secure)"
          InputProps={{
            endAdornment: (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {razorpayKeySecret.includes('***') && (
                  <Button size="small" onClick={() => setRazorpayKeySecret('')}>
                    Clear Masked Value
                  </Button>
                )}
                {!razorpayKeySecret.includes('***') && (
                  <Button size="small" onClick={() => setShowSecrets(!showSecrets)}>
                    {showSecrets ? 'Hide' : 'Show'}
                  </Button>
                )}
              </Box>
            )
          }}
        />

        <TextField
          fullWidth
          label="Webhook Secret (Optional)"
          type={showSecrets ? 'text' : 'password'}
          value={razorpayWebhookSecret}
          onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
          placeholder={razorpayWebhookSecret.includes('***') ? 'Enter new Webhook Secret to update' : 'Enter webhook secret'}
          margin="normal"
          helperText="Webhook secret from Razorpay Dashboard (recommended for production)"
          InputProps={{
            endAdornment: (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {razorpayWebhookSecret.includes('***') && (
                  <Button size="small" onClick={() => setRazorpayWebhookSecret('')}>
                    Clear Masked Value
                  </Button>
                )}
                {!razorpayWebhookSecret.includes('***') && (
                  <Button size="small" onClick={() => setShowSecrets(!showSecrets)}>
                    {showSecrets ? 'Hide' : 'Show'}
                  </Button>
                )}
              </Box>
            )
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={razorpayEnabled}
              onChange={(e) => setRazorpayEnabled(e.target.checked)}
            />
          }
          label="Enable Razorpay payments for this organization"
          sx={{ mt: 2 }}
        />

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <Lock />}
            size="large"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
          <Button variant="outlined" onClick={loadSetupData}>
            Refresh Status
          </Button>
        </Box>
      </Box>

      {activeStep === 4 && (
        <Box>
          <Box textAlign="center" py={2} mb={3}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Setup Complete!
            </Typography>
            <Typography color="text.secondary" paragraph>
              Your Razorpay payment gateway is configured and ready to accept payments.
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Always show credential form for editing */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Edit Razorpay Credentials
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Update your Razorpay API keys and settings. Changes will apply to all sectors (Education, Salon, Pharmacy, Retail, Restaurant, Hotel).
            </Typography>

            <TextField
              fullWidth
              label="Razorpay Key ID"
              value={razorpayKeyId}
              onChange={(e) => setRazorpayKeyId(e.target.value)}
              placeholder="rzp_test_... or rzp_live_..."
              margin="normal"
              helperText="Your Razorpay Key ID (starts with rzp_)"
              InputProps={{
                endAdornment: razorpayKeyId.includes('***') ? (
                  <Button size="small" onClick={() => setRazorpayKeyId('')}>
                    Edit
                  </Button>
                ) : null
              }}
            />

            <TextField
              fullWidth
              label="Razorpay Key Secret"
              type={showSecrets ? 'text' : 'password'}
              value={razorpayKeySecret}
              onChange={(e) => setRazorpayKeySecret(e.target.value)}
              placeholder={razorpayKeySecret.includes('***') ? 'Enter new Key Secret to update' : 'Enter your Key Secret'}
              margin="normal"
              helperText="Your Razorpay Key Secret (keep it secure)"
              InputProps={{
                endAdornment: (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {razorpayKeySecret.includes('***') && (
                      <Button size="small" onClick={() => setRazorpayKeySecret('')}>
                        Edit
                      </Button>
                    )}
                    {!razorpayKeySecret.includes('***') && (
                      <Button size="small" onClick={() => setShowSecrets(!showSecrets)}>
                        {showSecrets ? 'Hide' : 'Show'}
                      </Button>
                    )}
                  </Box>
                )
              }}
            />

            <TextField
              fullWidth
              label="Webhook Secret (Optional)"
              type={showSecrets ? 'text' : 'password'}
              value={razorpayWebhookSecret}
              onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
              placeholder={razorpayWebhookSecret.includes('***') ? 'Enter new Webhook Secret to update' : 'Enter webhook secret'}
              margin="normal"
              helperText="Webhook secret from Razorpay Dashboard (recommended for production)"
              InputProps={{
                endAdornment: (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {razorpayWebhookSecret.includes('***') && (
                      <Button size="small" onClick={() => setRazorpayWebhookSecret('')}>
                        Edit
                      </Button>
                    )}
                    {!razorpayWebhookSecret.includes('***') && (
                      <Button size="small" onClick={() => setShowSecrets(!showSecrets)}>
                        {showSecrets ? 'Hide' : 'Show'}
                      </Button>
                    )}
                  </Box>
                )
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={razorpayEnabled}
                  onChange={(e) => setRazorpayEnabled(e.target.checked)}
                />
              }
              label="Enable Razorpay payments for this organization"
              sx={{ mt: 2 }}
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <Lock />}
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
              <Button variant="outlined" onClick={loadSetupData}>
                Refresh Status
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 4 }} />

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          UPI / Offline Payment Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Configure a fallback UPI ID so tenants can still accept money even if Razorpay is disabled. The Payment Center will show a QR code powered by these details.
        </Typography>
        {upiError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUpiError('')}>
            {upiError}
          </Alert>
        )}
        {upiSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setUpiSuccess('')}>
            {upiSuccess}
          </Alert>
        )}
        <FormControlLabel
          control={
            <Switch
              checked={upiForm.upi_payments_enabled}
              onChange={(e) => setUpiForm((prev) => ({ ...prev, upi_payments_enabled: e.target.checked }))}
              disabled={upiLoading}
            />
          }
          label="Enable UPI payment instructions in the Payment Center"
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="UPI ID"
          value={upiForm.upi_id}
          onChange={(e) => setUpiForm((prev) => ({ ...prev, upi_id: e.target.value }))}
          margin="normal"
          helperText="Example: business@upi. Required when UPI payments are enabled."
          disabled={upiLoading || !upiForm.upi_payments_enabled}
        />
        <TextField
          fullWidth
          label="Display Name"
          value={upiForm.upi_display_name}
          onChange={(e) => setUpiForm((prev) => ({ ...prev, upi_display_name: e.target.value }))}
          margin="normal"
          helperText="Shown under the QR code so payers know who they are paying."
          disabled={upiLoading || !upiForm.upi_payments_enabled}
        />
        <TextField
          fullWidth
          label="Payment Instructions"
          value={upiForm.upi_notes}
          onChange={(e) => setUpiForm((prev) => ({ ...prev, upi_notes: e.target.value }))}
          margin="normal"
          multiline
          rows={3}
          helperText="Optional short note (max ~60 chars) that appears next to the QR code."
          disabled={upiLoading || !upiForm.upi_payments_enabled}
        />
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSaveUpi}
            disabled={upiSaving || upiLoading}
            startIcon={upiSaving ? <CircularProgress size={20} /> : <Lock />}
          >
            {upiSaving ? 'Saving...' : 'Save UPI Settings'}
          </Button>
          <Button variant="outlined" onClick={loadUpiSettings} disabled={upiSaving}>
            Refresh
          </Button>
        </Box>
      </Box>

      {setupGuide?.faq && (
        <Accordion sx={{ mt: 4 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={600}>
              Frequently Asked Questions (FAQ)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {setupGuide.faq.map((item, idx) => (
              <Box key={idx} sx={{ mb: 3, pb: 2, borderBottom: idx < setupGuide.faq.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
                  {item.question}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {item.answer}
                </Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      )}

      {setupGuide?.support && (
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Need Help?
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            If you encounter any issues during setup, refer to these resources:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            {setupGuide.support.razorpay_docs && (
              <Button
                variant="outlined"
                href={setupGuide.support.razorpay_docs}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<Link />}
              >
                Razorpay Documentation
              </Button>
            )}
            {setupGuide.support.razorpay_support && (
              <Button
                variant="outlined"
                href={setupGuide.support.razorpay_support}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<Link />}
              >
                Razorpay Support
              </Button>
            )}
            {setupGuide.support.dashboard && (
              <Button
                variant="outlined"
                href={setupGuide.support.dashboard}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<Link />}
              >
                Razorpay Dashboard
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default RazorpaySetupWizard;


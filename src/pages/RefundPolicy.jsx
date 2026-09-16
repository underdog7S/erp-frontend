import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  Alert
} from '@mui/material';
import {
  MoneyOff as RefundIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  Help as HelpIcon
} from '@mui/icons-material';

const RefundPolicy = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', py: 6 }}>
      <Container maxWidth={{ xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1400px' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
            Cancellation & Refund Policy
          </Typography>
          <Chip 
            label={`Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`} 
            color="primary" 
            sx={{ mt: 2 }}
          />
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mt: 3, lineHeight: 1.8 }}>
            Zenith ERP offers flexible cancellation and refund options. We believe in fair policies that protect both our 
            customers and our business. Please read this policy carefully before making a purchase.
          </Typography>
        </Box>

        {/* 30-Day Money-Back Guarantee */}
        <Alert severity="success" sx={{ mb: 4, fontSize: '1.1rem', py: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            30-Day Money-Back Guarantee
          </Typography>
          <Typography variant="body1">
            We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with Zenith ERP within the 
            first 30 days of your subscription, contact us for a full refund - no questions asked.
          </Typography>
        </Alert>

        {/* Cancellation Policy */}
        <Card sx={{ mb: 4, p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, borderRadius: 2 }}>
              <CancelIcon />
            </Box>
            <Typography variant="h4" fontWeight={700}>
              Cancellation Policy
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Subscription Cancellation
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                You can cancel your subscription at any time from your account settings:
              </Typography>
              <Stack spacing={1.5}>
                <Typography variant="body1">
                  • <strong>Immediate Cancellation:</strong> Your subscription will remain active until the end of your current billing period.
                </Typography>
                <Typography variant="body1">
                  • <strong>No Immediate Access Loss:</strong> You will continue to have full access to all features until your paid period expires.
                </Typography>
                <Typography variant="body1">
                  • <strong>Auto-Renewal:</strong> Canceling disables auto-renewal. You won't be charged for the next billing cycle.
                </Typography>
              </Stack>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Free Plan Cancellation
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                Free plan accounts can be deleted at any time with immediate effect. All data associated with the account 
                will be permanently deleted after 90 days, during which you can still export your data.
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Refund Policy */}
        <Card sx={{ mb: 4, p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, borderRadius: 2 }}>
              <RefundIcon />
            </Box>
            <Typography variant="h4" fontWeight={700}>
              Refund Policy
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'success.main' }}>
                ✓ Eligible for Refund
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                <Typography variant="body1">
                  • <strong>30-Day Guarantee:</strong> Full refund if canceled within 30 days of initial subscription
                </Typography>
                <Typography variant="body1">
                  • <strong>Service Issues:</strong> Refund if we fail to deliver promised service levels
                </Typography>
                <Typography variant="body1">
                  • <strong>Billing Errors:</strong> Refund for duplicate charges or incorrect billing amounts
                </Typography>
                <Typography variant="body1">
                  • <strong>Plan Downgrades:</strong> Prorated refund when downgrading to a lower plan mid-cycle
                </Typography>
              </Stack>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'error.main' }}>
                ✗ Not Eligible for Refund
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                <Typography variant="body1">
                  • <strong>After 30 Days:</strong> No refunds after the initial 30-day guarantee period
                </Typography>
                <Typography variant="body1">
                  • <strong>Partial Usage:</strong> No prorated refunds for partial usage within a billing period
                </Typography>
                <Typography variant="body1">
                  • <strong>Renewal Payments:</strong> No refunds for auto-renewal payments made after the guarantee period
                </Typography>
                <Typography variant="body1">
                  • <strong>Custom Development:</strong> No refunds for custom development services once work has begun
                </Typography>
                <Typography variant="body1">
                  • <strong>Termination for Violations:</strong> No refunds if account is terminated due to Terms of Service violations
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Card>

        {/* Refund Process */}
        <Card sx={{ mb: 4, p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, borderRadius: 2 }}>
              <ScheduleIcon />
            </Box>
            <Typography variant="h4" fontWeight={700}>
              Refund Process
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Step 1: Request Refund
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                Contact our support team at support@zenitherp.online with your refund request. Include your account email 
                and reason for cancellation.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Step 2: Review
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                We will review your request within 2 business days and confirm eligibility based on our refund policy.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Step 3: Processing
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                Approved refunds are processed within 5-10 business days. The refund will be credited to your original 
                payment method. Processing time may vary depending on your payment provider.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Step 4: Confirmation
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                You will receive an email confirmation once the refund has been processed. The amount will appear in your 
                account within 1-2 billing cycles depending on your bank or payment provider.
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Plan Changes */}
        <Card sx={{ mb: 4, p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, borderRadius: 2 }}>
              <PaymentIcon />
            </Box>
            <Typography variant="h4" fontWeight={700}>
              Plan Upgrades & Downgrades
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
            When you change your plan, here's how billing and refunds work:
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Upgrading Plans
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                When upgrading, you'll be charged the prorated difference for the remaining billing period. The upgrade 
                takes effect immediately.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Downgrading Plans
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                When downgrading, you'll receive a prorated credit for the unused portion, which will be applied to your 
                next billing cycle. Downgrade takes effect at the end of your current billing period.
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Important Notes */}
        <Card sx={{ mb: 4, p: 4, bgcolor: '#fff3cd', border: '1px solid #ffc107' }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Important Notes
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            <Typography variant="body1">
              • Refunds are processed to the original payment method used for the purchase.
            </Typography>
            <Typography variant="body1">
              • International refunds may take longer to process (10-15 business days).
            </Typography>
            <Typography variant="body1">
              • Currency exchange rates at the time of refund may differ from the original purchase.
            </Typography>
            <Typography variant="body1">
              • All refunds are subject to verification of payment and account details.
            </Typography>
            <Typography variant="body1">
              • After receiving a refund, your account will be downgraded or canceled as applicable.
            </Typography>
          </Stack>
        </Card>

        {/* Contact */}
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <HelpIcon sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Need Help with Refunds?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Our support team is here to help. Contact us for any questions about cancellations or refunds:
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            Email: support@zenitherp.online
          </Typography>
          <Typography variant="body2" sx={{ mt: 3, opacity: 0.8 }}>
            Response time: Within 2 business days
          </Typography>
        </Card>
      </Container>
    </Box>
  );
};

export default RefundPolicy;


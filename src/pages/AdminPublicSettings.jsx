import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Switch, FormControlLabel, Alert, Paper, Tooltip, IconButton } from '@mui/material';
import { getTenantPublicSettings, updateTenantPublicSettings, fetchUserMe } from '../services/api';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LockIcon from '@mui/icons-material/Lock';
import UpgradeIcon from '@mui/icons-material/Upgrade';

const AdminPublicSettings = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [msg, setMsg] = useState('');
	const [slug, setSlug] = useState('');
	const [booking, setBooking] = useState(false);
	const [orders, setOrders] = useState(false);
	const [admissions, setAdmissions] = useState(false);
	const [hasKey, setHasKey] = useState(false);
    const [industry, setIndustry] = useState('');
    const [apiKey, setApiKey] = useState('');
	const [requiresPaidPlan, setRequiresPaidPlan] = useState(false);
	const [currentPlan, setCurrentPlan] = useState('');

	const load = async () => {
		try {
			setLoading(true);
			const data = await getTenantPublicSettings();
			setSlug(data.slug || '');
			setBooking(!!data.public_booking_enabled);
			setOrders(!!data.public_orders_enabled);
			setAdmissions(!!data.public_admissions_enabled);
			setHasKey(!!data.has_api_key);
            setApiKey(data.public_api_key || '');
			setError('');
			setRequiresPaidPlan(false);
		} catch (e) {
			// Check if error is due to unpaid plan
			if (e.response?.data?.requires_paid_plan) {
				setRequiresPaidPlan(true);
				setCurrentPlan(e.response?.data?.current_plan || 'Free');
				setError(e.response?.data?.error || 'Public settings require a paid plan');
			} else {
				setError('Failed to load settings');
			}
		} finally { setLoading(false); }
	};

	useEffect(() => { 
		load(); 
		// Load current user's industry to conditionally render relevant sections
        const storedIndustry = localStorage.getItem('userIndustry');
		fetchUserMe().then((u) => setIndustry((u.industry || storedIndustry || '').toLowerCase())).catch(()=>setIndustry(storedIndustry || ''));
	}, []);

	const save = async (extra = {}) => {
		try {
			setMsg(''); setError('');
			const res = await updateTenantPublicSettings({
				slug,
				public_booking_enabled: booking,
				public_orders_enabled: orders,
				public_admissions_enabled: admissions,
				...extra,
			});
			setMsg('Settings updated');
			setRequiresPaidPlan(false);
            if (res && typeof res.public_api_key === 'string') setApiKey(res.public_api_key);
            setHasKey(!!(res && res.public_api_key));
			load();
		} catch (e) {
			// Check if error is due to unpaid plan
			if (e.response?.data?.requires_paid_plan) {
				setRequiresPaidPlan(true);
				setCurrentPlan(e.response?.data?.current_plan || 'Free');
				setError(e.response?.data?.error || 'Public settings require a paid plan');
			} else {
				setError(e?.response?.data?.error || 'Save failed');
			}
		}
	};

	const embedOrigin = window.location.origin.replace(/:\d+$/, ':8000');
	const widgetOrigin = window.location.origin;
	const placeholderSlug = slug || 'your-salon-slug';
    const resolvedApiKey = apiKey || 'YOUR_KEY';
    const salonSnippet = `<script src="${widgetOrigin}/widgets/salon-booking-widget.js" data-slug="${placeholderSlug}" data-api-key="${resolvedApiKey}" data-target="salon-booking-widget"></script>`;

	// Show upgrade message if unpaid plan
	if (requiresPaidPlan) {
		return (
			<Box sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
				<Paper sx={{ p: 4, textAlign: 'center' }}>
					<LockIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
					<Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
						Paid Plan Required
					</Typography>
					<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
						Public settings, widgets, and API integrations are only available for paid plans.
						{currentPlan && (
							<> You are currently on the <strong>{currentPlan}</strong> plan.</>
						)}
					</Typography>
					<Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
						<strong>What you'll get with a paid plan:</strong>
						<ul style={{ marginTop: 8, marginBottom: 0 }}>
							<li>Public API integrations and widgets</li>
							<li>Custom domain slug for public endpoints</li>
							<li>API key generation for external integrations</li>
							<li>Enhanced features and support</li>
						</ul>
					</Alert>
					<Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
						<Button
							variant="contained"
							color="primary"
							size="large"
							startIcon={<UpgradeIcon />}
							onClick={() => window.location.href = '/pricing'}
						>
							View Plans & Upgrade
						</Button>
						<Button
							variant="outlined"
							onClick={() => window.location.href = '/dashboard'}
						>
							Back to Dashboard
						</Button>
					</Box>
				</Paper>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h5" gutterBottom>Public Integration Settings</Typography>
			{error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
			{msg && <Alert severity="success" sx={{ mb:2 }}>{msg}</Alert>}
			<Paper sx={{ p:2, mb:3 }}>
				<TextField label="Tenant Slug" value={slug} onChange={e=>setSlug(e.target.value)} sx={{ mr:2 }} />
				<Button variant="contained" onClick={()=>save()}>Save</Button>
				<Button variant="outlined" sx={{ ml:1 }} onClick={()=>save({ generate_api_key: true })}>{hasKey ? 'Regenerate API Key' : 'Generate API Key'}</Button>
                {apiKey && (
                    <Box sx={{ mt:2, display:'flex', alignItems:'center', gap:1 }}>
                        <TextField label="API Key" value={apiKey} InputProps={{ readOnly: true }} fullWidth />
                        <Tooltip title="Copy">
                            <IconButton onClick={()=>navigator.clipboard.writeText(apiKey)}>
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
				{(!industry || industry === 'salon' || industry === 'admin') && (
					<Box sx={{ mt:2 }}>
						<FormControlLabel control={<Switch checked={booking} onChange={e=>setBooking(e.target.checked)} />} label="Enable Public Bookings (Salon)" />
					</Box>
				)}
				{(!industry || industry === 'retail' || industry === 'admin') && (
					<Box sx={{ mt:2 }}>
						<FormControlLabel control={<Switch checked={orders} onChange={e=>setOrders(e.target.checked)} />} label="Enable Public Orders (Retail)" />
					</Box>
				)}
				{(!industry || industry === 'education' || industry === 'admin') && (
					<Box sx={{ mt:2 }}>
						<FormControlLabel control={<Switch checked={admissions} onChange={e=>setAdmissions(e.target.checked)} />} label="Enable Public Admissions (Education)" />
					</Box>
				)}
			</Paper>

			<Typography variant="h6" gutterBottom>Embeddable Snippets</Typography>
			
            {/* Salon Snippet */}
            {(!industry || industry === 'salon' || industry === 'admin') && (
				<Paper sx={{ p:2, mb:2 }}>
					<Typography variant="subtitle1" fontWeight="bold">Salon Booking (Widget)</Typography>
                    <Box sx={{ display:'flex', alignItems:'flex-start', gap:1, mt:1 }}>
                        <code style={{ flex:1, backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>{salonSnippet}</code>
                        <Tooltip title="Copy">
                            <IconButton onClick={()=>navigator.clipboard.writeText(salonSnippet)}>
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
				</Paper>
			)}
            
            {/* Retail Snippet */}
			{(!industry || industry === 'retail' || industry === 'admin') && (
				<Paper sx={{ p:2, mb:2 }}>
					<Typography variant="subtitle1" fontWeight="bold">Retail Order (Widget)</Typography>
                    <Box sx={{ display:'flex', alignItems:'flex-start', gap:1, mt:1 }}>
					    <code style={{ flex:1, backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>{`<script src="${widgetOrigin}/widgets/retail-order-widget.js" data-slug="${placeholderSlug}" data-api-key="YOUR_KEY" data-recaptcha-site-key="YOUR_SITE_KEY"></script>`}</code>
                        <Tooltip title="Copy">
                            <IconButton onClick={()=>navigator.clipboard.writeText(`<script src="${widgetOrigin}/widgets/retail-order-widget.js" data-slug="${placeholderSlug}" data-api-key="YOUR_KEY" data-recaptcha-site-key="YOUR_SITE_KEY"></script>`)}>
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
					<Typography variant="subtitle2" sx={{ mt:2 }}>APIs</Typography>
					<code>{`${embedOrigin}/api/public/retail/${placeholderSlug}/products/?api_key=YOUR_KEY`}</code>
					<br />
					<code>{`${embedOrigin}/api/public/retail/${placeholderSlug}/orders/`}</code>
				</Paper>
			)}
            
            {/* Education Snippet */}
			{(!industry || industry === 'education' || industry === 'admin') && (
				<Paper sx={{ p:2, mb:2 }}>
					<Typography variant="subtitle1" fontWeight="bold">Education Admission (Widget)</Typography>
                    <Box sx={{ display:'flex', alignItems:'flex-start', gap:1, mt:1 }}>
					    <code style={{ flex:1, backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>{`<script src="${widgetOrigin}/widgets/education-admission-widget.js" data-slug="${placeholderSlug}" data-api-key="YOUR_KEY" data-recaptcha-site-key="YOUR_SITE_KEY"></script>`}</code>
                        <Tooltip title="Copy">
                            <IconButton onClick={()=>navigator.clipboard.writeText(`<script src="${widgetOrigin}/widgets/education-admission-widget.js" data-slug="${placeholderSlug}" data-api-key="YOUR_KEY" data-recaptcha-site-key="YOUR_SITE_KEY"></script>`)}>
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
					<Typography variant="subtitle2" sx={{ mt:2 }}>API</Typography>
					<code>{`${embedOrigin}/api/public/education/${placeholderSlug}/admissions/`}</code>
				</Paper>
			)}
		</Box>
	);
};

export default AdminPublicSettings;


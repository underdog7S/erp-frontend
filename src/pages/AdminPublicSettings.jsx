import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Switch, FormControlLabel, Alert, Paper, Tooltip, IconButton } from '@mui/material';
import { getTenantPublicSettings, updateTenantPublicSettings, fetchUserMe } from '../services/api';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

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
		} catch (e) {
			setError('Failed to load settings');
		} finally { setLoading(false); }
	};

	useEffect(() => { 
		load(); 
		// Load current user's industry to conditionally render relevant sections
		fetchUserMe().then((u) => setIndustry((u.industry || '').toLowerCase())).catch(()=>setIndustry(''));
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
            if (res && typeof res.public_api_key === 'string') setApiKey(res.public_api_key);
            setHasKey(!!(res && res.public_api_key));
			load();
		} catch (e) {
			setError(e?.response?.data?.error || 'Save failed');
		}
	};

	const embedOrigin = window.location.origin.replace(/:\d+$/, ':8000');
	const widgetOrigin = window.location.origin;
	const placeholderSlug = slug || 'your-salon-slug';
    const resolvedApiKey = apiKey || 'YOUR_KEY';
    const salonSnippet = `<script src="${widgetOrigin}/widgets/salon-booking-widget.js" data-slug="${placeholderSlug}" data-api-key="${resolvedApiKey}" data-target="salon-booking-widget"></script>`;

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
				{(!industry || industry === 'salon') && (
					<Box sx={{ mt:2 }}>
						<FormControlLabel control={<Switch checked={booking} onChange={e=>setBooking(e.target.checked)} />} label="Enable Public Bookings (Salon)" />
					</Box>
				)}
				{industry === 'retail' && (
					<Box>
						<FormControlLabel control={<Switch checked={orders} onChange={e=>setOrders(e.target.checked)} />} label="Enable Public Orders (Retail)" />
					</Box>
				)}
				{industry === 'education' && (
					<Box>
						<FormControlLabel control={<Switch checked={admissions} onChange={e=>setAdmissions(e.target.checked)} />} label="Enable Public Admissions (Education)" />
					</Box>
				)}
			</Paper>

			<Typography variant="h6" gutterBottom>Embeddable Snippets</Typography>
			{(!industry || industry === 'salon') && (
				<Paper sx={{ p:2, mb:2 }}>
					<Typography variant="subtitle1">Salon Booking (Widget)</Typography>
                    <Box sx={{ display:'flex', alignItems:'flex-start', gap:1 }}>
                        <code style={{ flex:1 }}>{salonSnippet}</code>
                        <Tooltip title="Copy">
                            <IconButton onClick={()=>navigator.clipboard.writeText(salonSnippet)}>
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
				</Paper>
			)}
			{industry === 'retail' && (
				<Paper sx={{ p:2, mb:2 }}>
					<Typography variant="subtitle1">Retail Order (Widget)</Typography>
					<code>{`<script src="${widgetOrigin}/widgets/retail-order-widget.js" data-slug="${placeholderSlug}" data-api-key="YOUR_KEY" data-recaptcha-site-key="YOUR_SITE_KEY"></script>`}</code>
					<Typography variant="subtitle2" sx={{ mt:1 }}>APIs</Typography>
					<code>{`${embedOrigin}/api/public/retail/${placeholderSlug}/products/?api_key=YOUR_KEY`}</code>
					<br />
					<code>{`${embedOrigin}/api/public/retail/${placeholderSlug}/orders/`}</code>
				</Paper>
			)}
			{industry === 'education' && (
				<Paper sx={{ p:2, mb:2 }}>
					<Typography variant="subtitle1">Education Admission (Widget)</Typography>
					<code>{`<script src="${widgetOrigin}/widgets/education-admission-widget.js" data-slug="${placeholderSlug}" data-api-key="YOUR_KEY" data-recaptcha-site-key="YOUR_SITE_KEY"></script>`}</code>
					<Typography variant="subtitle2" sx={{ mt:1 }}>API</Typography>
					<code>{`${embedOrigin}/api/public/education/${placeholderSlug}/admissions/`}</code>
				</Paper>
			)}
		</Box>
	);
};

export default AdminPublicSettings;


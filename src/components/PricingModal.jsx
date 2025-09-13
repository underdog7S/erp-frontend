import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Card, CardContent, Typography, Chip, Avatar, Box } from '@mui/material';
import { fetchPlans, changePlan, fetchUserMe } from '../services/api';
import CheckIcon from '@mui/icons-material/Check';

const PricingModal = ({ open, onClose, onUpgraded }) => {
	const [plans, setPlans] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (open) {
			fetchPlans().then(setPlans).catch(()=>setPlans([]));
		}
	}, [open]);

	const handleSelect = async (planKey) => {
		setLoading(true);
		try {
			await changePlan(planKey);
			const updated = await fetchUserMe();
			localStorage.setItem('user', JSON.stringify(updated));
			window.dispatchEvent(new Event('userChanged'));
			window.dispatchEvent(new Event('planChanged'));
			onUpgraded && onUpgraded(updated);
			onClose();
		} catch (e) {
			alert('Upgrade failed. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
			<DialogTitle>Upgrade Your Plan</DialogTitle>
			<DialogContent>
				<Grid container columns={12} spacing={2} sx={{ mt: 1 }}>
					{plans.map((p) => (
						<Grid gridColumn="span 3" key={p.key}>
							<Card sx={{ height: '100%', border: p.popular ? '2px solid' : '1px solid', borderColor: p.popular ? 'primary.main' : 'divider' }}>
								<CardContent>
									{p.popular && <Chip label="Most Popular" color="primary" size="small" sx={{ mb: 1 }} />}
									<Typography variant="h6">{p.name}</Typography>
									<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{p.description}</Typography>
									<Typography variant="h5" sx={{ mb: 1 }}>{p.price === 0 ? 'Free' : `₹${p.price}/year`}</Typography>
									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
										{(p.features || []).slice(0, 5).map((f, idx) => (
											<Typography key={idx} variant="caption"><CheckIcon fontSize="inherit" style={{ verticalAlign: 'middle' }} /> {f}</Typography>
										))}
									</Box>
									<Button variant={p.popular ? 'contained' : 'outlined'} disabled={loading || p.key === 'free'} fullWidth onClick={() => handleSelect(p.key)}>
										{p.key === 'free' ? 'Current Plan' : `Upgrade to ${p.name}`}
									</Button>
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
};

export default PricingModal;

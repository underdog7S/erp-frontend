import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Divider, List, ListItem, ListItemText, MenuItem } from '@mui/material';
import { fetchRestaurantCategories, createRestaurantCategory, fetchRestaurantItems, createRestaurantItem } from '../../services/api';

const Section = ({ title, children }) => (
	<Paper sx={{ p: 2 }}>
		<Typography variant="h6" gutterBottom>{title}</Typography>
		<Divider sx={{ mb: 2 }} />
		{children}
	</Paper>
);

const RestaurantDashboard = () => {
	const [categories, setCategories] = useState([]);
	const [items, setItems] = useState([]);
	const [catName, setCatName] = useState('');
	const [itemName, setItemName] = useState('');
	const [itemPrice, setItemPrice] = useState('');
	const [itemCatId, setItemCatId] = useState('');

	const loadAll = async () => {
		try {
			const [cats, its] = await Promise.all([
				fetchRestaurantCategories(),
				fetchRestaurantItems(),
			]);
			setCategories(cats);
			setItems(its);
		} catch (e) {
			console.error('Restaurant load error', e);
		}
	};

	useEffect(() => { loadAll(); }, []);

	const handleAddCategory = async () => {
		if (!catName) return;
		await createRestaurantCategory({ name: catName });
		setCatName('');
		loadAll();
	};
	const handleAddItem = async () => {
		if (!itemName || !itemCatId) return;
		await createRestaurantItem({ name: itemName, category: Number(itemCatId), price: itemPrice ? Number(itemPrice) : 0 });
		setItemName(''); setItemCatId(''); setItemPrice('');
		loadAll();
	};

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" gutterBottom>Restaurant</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<Section title="Menu Categories">
						<Box display="flex" gap={1} mb={2}>
							<TextField size="small" label="Name" value={catName} onChange={e => setCatName(e.target.value)} fullWidth />
							<Button variant="contained" onClick={handleAddCategory}>Add</Button>
						</Box>
						<List dense>
							{categories.map(c => (
								<ListItem key={c.id} disableGutters>
									<ListItemText primary={c.name} />
								</ListItem>
							))}
						</List>
					</Section>
				</Grid>
				<Grid item xs={12} md={6}>
					<Section title="Menu Items">
						<Box display="flex" gap={1} mb={2}>
							<TextField size="small" label="Name" value={itemName} onChange={e => setItemName(e.target.value)} fullWidth />
							<TextField size="small" select label="Category" value={itemCatId} onChange={e => setItemCatId(e.target.value)} sx={{ width: 180 }}>
								{categories.map(c => (<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>))}
							</TextField>
							<TextField size="small" label="Price" type="number" value={itemPrice} onChange={e => setItemPrice(e.target.value)} sx={{ width: 140 }} />
							<Button variant="contained" onClick={handleAddItem}>Add</Button>
						</Box>
						<List dense>
							{items.map(i => (
								<ListItem key={i.id} disableGutters>
									<ListItemText primary={`${i.name}`} secondary={`Category: ${i.category_name || i.category} | Price: ${i.price}`} />
								</ListItem>
							))}
						</List>
					</Section>
				</Grid>
			</Grid>
		</Box>
	);
};

export default RestaurantDashboard;

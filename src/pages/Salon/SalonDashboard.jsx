import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Divider, List, ListItem, ListItemText, MenuItem, Avatar, ListItemAvatar } from '@mui/material';
import { fetchSalonServiceCategories, createSalonServiceCategory, fetchSalonServices, createSalonService, fetchSalonStylists, createSalonStylist, fetchSalonAppointments, createSalonAppointment, checkInSalonAppointment, completeSalonAppointment, cancelSalonAppointment, updateSalonServiceCategory, deleteSalonServiceCategory, updateSalonService, deleteSalonService, updateSalonStylist, deleteSalonStylist, deleteSalonAppointment } from '../../services/api';

const Section = ({ title, children }) => (
	<Paper sx={{ p: 2 }}>
		<Typography variant="h6" gutterBottom>{title}</Typography>
		<Divider sx={{ mb: 2 }} />
		{children}
	</Paper>
);

const SalonDashboard = () => {
	const [categories, setCategories] = useState([]);
	const [services, setServices] = useState([]);
	const [stylists, setStylists] = useState([]);
	const [appointments, setAppointments] = useState([]);
	const [catName, setCatName] = useState('');
	const [serviceName, setServiceName] = useState('');
	const [serviceDuration, setServiceDuration] = useState('');
	const [servicePrice, setServicePrice] = useState('');
	const [serviceCatId, setServiceCatId] = useState('');
	const [serviceImage, setServiceImage] = useState(null);
	const [stylistFirst, setStylistFirst] = useState('');
	const [stylistLast, setStylistLast] = useState('');
	const [stylistPhone, setStylistPhone] = useState('');
	const [apptCustomer, setApptCustomer] = useState('');
	const [apptServiceId, setApptServiceId] = useState('');
	const [apptStylistId, setApptStylistId] = useState('');
	const [apptStart, setApptStart] = useState('');
	const [selectedService, setSelectedService] = useState(null);

	// Inline edit state
	const [editCatId, setEditCatId] = useState(null);
	const [editCatName, setEditCatName] = useState('');
	const [editServiceId, setEditServiceId] = useState(null);
	const [editServiceName, setEditServiceName] = useState('');
	const [editServiceDuration, setEditServiceDuration] = useState('');
	const [editServicePrice, setEditServicePrice] = useState('');
	const [editServiceCategory, setEditServiceCategory] = useState('');
	const [editStylistId, setEditStylistId] = useState(null);
	const [editStylistFirst, setEditStylistFirst] = useState('');
	const [editStylistLast, setEditStylistLast] = useState('');
	const [editStylistPhone, setEditStylistPhone] = useState('');

	const loadAll = async () => {
		try {
			const [cats, servs, stys, appts] = await Promise.all([
				fetchSalonServiceCategories(),
				fetchSalonServices(),
				fetchSalonStylists(),
				fetchSalonAppointments(),
			]);
			setCategories(cats);
			setServices(servs);
			setStylists(stys);
			setAppointments(appts);
		} catch (e) {
			console.error('Salon load error', e);
		}
	};

	useEffect(() => { loadAll(); }, []);

	const handleAddCategory = async () => {
		if (!catName) return;
		try {
			console.log('Creating category with data:', { name: catName });
			const result = await createSalonServiceCategory({ name: catName });
			console.log('Category created successfully:', result);
			setCatName('');
			loadAll();
		} catch (error) {
			console.error('Error creating category:', error);
			console.error('Error response:', error.response?.data);
			console.error('Error status:', error.response?.status);
			console.error('Error headers:', error.response?.headers);
			alert(`Error creating category: ${error.response?.data?.detail || error.response?.data?.name || error.message}`);
		}
	};
	const handleAddService = async () => {
		if (!serviceName || !serviceCatId) return;
		
		try {
			// Create FormData for multipart upload
			const formData = new FormData();
			formData.append('name', serviceName);
			formData.append('category', Number(serviceCatId));
			formData.append('duration_minutes', serviceDuration ? Number(serviceDuration) : 30);
			formData.append('price', servicePrice ? Number(servicePrice) : 0);
			
			// Add image if selected
			if (serviceImage) {
				formData.append('image', serviceImage);
			}
			
			await createSalonService(formData);
			setServiceName(''); setServiceCatId(''); setServiceDuration(''); setServicePrice(''); setServiceImage(null);
			loadAll();
		} catch (error) {
			console.error('Error creating service:', error);
			console.error('Error response:', error.response?.data);
			alert(`Error creating service: ${error.response?.data?.detail || error.message}`);
		}
	};
	const handleAddStylist = async () => {
		if (!stylistFirst) return;
		await createSalonStylist({ first_name: stylistFirst, last_name: stylistLast, phone: stylistPhone });
		setStylistFirst(''); setStylistLast(''); setStylistPhone('');
		loadAll();
	};

	const handleAddAppointment = async () => {
		if (!apptCustomer || !apptServiceId || !apptStylistId || !apptStart) return;
		const svc = services.find(s => String(s.id) === String(apptServiceId));
		const duration = svc && svc.duration_minutes ? Number(svc.duration_minutes) : 30;
		const startIso = new Date(apptStart).toISOString();
		const endIso = new Date(new Date(apptStart).getTime() + duration * 60000).toISOString();
		await createSalonAppointment({ customer_name: apptCustomer, service: Number(apptServiceId), stylist: Number(apptStylistId), start_time: startIso, end_time: endIso, price: svc && svc.price ? Number(svc.price) : 0 });
		setApptCustomer(''); setApptServiceId(''); setApptStylistId(''); setApptStart(''); setSelectedService(null);
		loadAll();
	};

	const handleApptAction = async (id, action) => {
		if (action === 'checkin') await checkInSalonAppointment(id);
		if (action === 'complete') await completeSalonAppointment(id);
		if (action === 'cancel') await cancelSalonAppointment(id);
		loadAll();
	};

	const beginEditCategory = (c) => {
		setEditCatId(c.id);
		setEditCatName(c.name);
	};
	const saveEditCategory = async () => {
		if (!editCatId || !editCatName) { setEditCatId(null); return; }
		await updateSalonServiceCategory(editCatId, { name: editCatName });
		setEditCatId(null); setEditCatName('');
		loadAll();
	};
	const removeCategory = async (id) => { await deleteSalonServiceCategory(id); loadAll(); };

	const beginEditService = (s) => {
		setEditServiceId(s.id);
		setEditServiceName(s.name || '');
		setEditServiceDuration(String(s.duration_minutes || ''));
		setEditServicePrice(String(s.price || ''));
		setEditServiceCategory(String(s.category || ''));
	};
	const saveEditService = async () => {
		if (!editServiceId || !editServiceName) { setEditServiceId(null); return; }
		await updateSalonService(editServiceId, {
			name: editServiceName,
			duration_minutes: editServiceDuration ? Number(editServiceDuration) : 30,
			price: editServicePrice ? Number(editServicePrice) : 0,
			category: editServiceCategory ? Number(editServiceCategory) : undefined,
		});
		setEditServiceId(null); setEditServiceName(''); setEditServiceDuration(''); setEditServicePrice(''); setEditServiceCategory('');
		loadAll();
	};
	const removeService = async (id) => { await deleteSalonService(id); loadAll(); };

	const beginEditStylist = (st) => {
		setEditStylistId(st.id);
		setEditStylistFirst(st.first_name || '');
		setEditStylistLast(st.last_name || '');
		setEditStylistPhone(st.phone || '');
	};
	const saveEditStylist = async () => {
		if (!editStylistId || !editStylistFirst) { setEditStylistId(null); return; }
		await updateSalonStylist(editStylistId, { first_name: editStylistFirst, last_name: editStylistLast, phone: editStylistPhone });
		setEditStylistId(null); setEditStylistFirst(''); setEditStylistLast(''); setEditStylistPhone('');
		loadAll();
	};
	const removeStylist = async (id) => { await deleteSalonStylist(id); loadAll(); };

	const removeAppointment = async (id) => { await deleteSalonAppointment(id); loadAll(); };

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" gutterBottom>Salon</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12} md={4}>
					<Section title="Service Categories">
						<Box display="flex" gap={1} mb={2}>
							<TextField size="small" label="Name" value={catName} onChange={e => setCatName(e.target.value)} fullWidth />
							<Button variant="contained" onClick={handleAddCategory} disabled={!catName.trim()}>Add</Button>
						</Box>
						<List dense>
							{categories.map(c => (
								<ListItem key={c.id} disableGutters secondaryAction={editCatId === c.id ? null : (
									<Box display="flex" gap={1}>
										<Button size="small" onClick={() => beginEditCategory(c)}>Edit</Button>
										<Button size="small" color="error" onClick={() => removeCategory(c.id)}>Delete</Button>
									</Box>
								)}>
									{editCatId === c.id ? (
										<Box display="flex" gap={1} width="100%">
											<TextField size="small" label="Name" value={editCatName} onChange={e => setEditCatName(e.target.value)} fullWidth />
											<Button size="small" variant="contained" onClick={saveEditCategory} disabled={!editCatName.trim()}>Save</Button>
											<Button size="small" onClick={() => { setEditCatId(null); setEditCatName(''); }}>Cancel</Button>
										</Box>
									) : (
										<ListItemText primary={c.name} />
									)}
								</ListItem>
							))}
						</List>
					</Section>
				</Grid>
				<Grid item xs={12} md={4}>
					<Section title="Services">
						<Box display="flex" gap={1} mb={2}>
							<TextField size="small" label="Name" value={serviceName} onChange={e => setServiceName(e.target.value)} fullWidth />
							<TextField size="small" select label="Category" value={serviceCatId} onChange={e => setServiceCatId(e.target.value)} sx={{ width: 180 }}>
								{categories.map(c => (<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>))}
							</TextField>
							<TextField size="small" label="Duration (min)" type="number" value={serviceDuration} onChange={e => setServiceDuration(e.target.value)} sx={{ width: 140 }} />
							<TextField size="small" label="Price" type="number" value={servicePrice} onChange={e => setServicePrice(e.target.value)} sx={{ width: 140 }} />
							<Button variant="contained" onClick={handleAddService} disabled={!serviceName.trim() || !serviceCatId}>Add</Button>
						</Box>
						<Box display="flex" gap={1} mb={2} alignItems="center">
							<input
								accept="image/*"
								style={{ display: 'none' }}
								id="service-image-upload"
								type="file"
								onChange={(e) => setServiceImage(e.target.files[0])}
							/>
							<label htmlFor="service-image-upload">
								<Button variant="outlined" component="span" size="small">
									{serviceImage ? 'Change Image' : 'Upload Image'}
								</Button>
							</label>
							{serviceImage && (
								<Typography variant="body2" color="text.secondary">
									Selected: {serviceImage.name}
								</Typography>
							)}
						</Box>
						<List dense>
							{services.map(s => (
								<ListItem key={s.id} disableGutters secondaryAction={editServiceId === s.id ? null : (
									<Box display="flex" gap={1}>
										<Button size="small" onClick={() => beginEditService(s)}>Edit</Button>
										<Button size="small" color="error" onClick={() => removeService(s.id)}>Delete</Button>
									</Box>
								)}>
									{editServiceId === s.id ? (
										<Box display="flex" gap={1} width="100%" alignItems="center">
											<TextField size="small" label="Name" value={editServiceName} onChange={e => setEditServiceName(e.target.value)} fullWidth />
											<TextField size="small" label="Duration" type="number" value={editServiceDuration} onChange={e => setEditServiceDuration(e.target.value)} sx={{ width: 110 }} />
											<TextField size="small" label="Price" type="number" value={editServicePrice} onChange={e => setEditServicePrice(e.target.value)} sx={{ width: 110 }} />
											<TextField size="small" select label="Category" value={editServiceCategory} onChange={e => setEditServiceCategory(e.target.value)} sx={{ width: 160 }}>
												{categories.map(c => (<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>))}
											</TextField>
											<Button size="small" variant="contained" onClick={saveEditService} disabled={!editServiceName.trim()}>Save</Button>
											<Button size="small" onClick={() => { setEditServiceId(null); setEditServiceName(''); setEditServiceDuration(''); setEditServicePrice(''); setEditServiceCategory(''); }}>Cancel</Button>
										</Box>
									) : (
										<ListItemText primary={`${s.name}`} secondary={`Category: ${s.category_name || s.category} | Duration: ${s.duration_minutes}m | Price: ${s.price}`} />
									)}
								</ListItem>
							))}
						</List>
					</Section>
				</Grid>
				<Grid item xs={12} md={4}>
					<Section title="Stylists">
						<Box display="flex" gap={1} mb={2}>
							<TextField size="small" label="First Name" value={stylistFirst} onChange={e => setStylistFirst(e.target.value)} fullWidth />
							<TextField size="small" label="Last Name" value={stylistLast} onChange={e => setStylistLast(e.target.value)} sx={{ width: 140 }} />
							<TextField size="small" label="Phone" value={stylistPhone} onChange={e => setStylistPhone(e.target.value)} sx={{ width: 160 }} />
							<Button variant="contained" onClick={handleAddStylist} disabled={!stylistFirst.trim()}>Add</Button>
						</Box>
						<List dense>
							{stylists.map(st => (
								<ListItem key={st.id} disableGutters secondaryAction={editStylistId === st.id ? null : (
									<Box display="flex" gap={1}>
										<Button size="small" onClick={() => beginEditStylist(st)}>Edit</Button>
										<Button size="small" color="error" onClick={() => removeStylist(st.id)}>Delete</Button>
									</Box>
								)}>
									{editStylistId === st.id ? (
										<Box display="flex" gap={1} width="100%">
											<TextField size="small" label="First" value={editStylistFirst} onChange={e => setEditStylistFirst(e.target.value)} sx={{ width: 150 }} />
											<TextField size="small" label="Last" value={editStylistLast} onChange={e => setEditStylistLast(e.target.value)} sx={{ width: 150 }} />
											<TextField size="small" label="Phone" value={editStylistPhone} onChange={e => setEditStylistPhone(e.target.value)} sx={{ width: 160 }} />
											<Button size="small" variant="contained" onClick={saveEditStylist} disabled={!editStylistFirst.trim()}>Save</Button>
											<Button size="small" onClick={() => { setEditStylistId(null); setEditStylistFirst(''); setEditStylistLast(''); setEditStylistPhone(''); }}>Cancel</Button>
										</Box>
									) : (
										<ListItemText primary={`${st.first_name} ${st.last_name || ''}`} secondary={st.phone || ''} />
									)}
								</ListItem>
							))}
						</List>
					</Section>
				</Grid>
				<Grid item xs={12} md={12}>
					<Section title="Appointments">
						<Box display="flex" gap={1} mb={2}>
							<TextField size="small" label="Customer" value={apptCustomer} onChange={e => setApptCustomer(e.target.value)} sx={{ width: 200 }} />
							<TextField size="small" select label="Service" value={apptServiceId} onChange={e => {
								setApptServiceId(e.target.value);
								const service = services.find(s => s.id === e.target.value);
								setSelectedService(service);
							}} sx={{ width: 220 }}>
								{services.map(s => (
									<MenuItem key={s.id} value={s.id}>
										<Box display="flex" alignItems="center" gap={1}>
											<Avatar 
												src={s.image_url} 
												sx={{ width: 24, height: 24 }}
												alt={s.name}
											>
												{s.name.charAt(0).toUpperCase()}
											</Avatar>
											<Typography variant="body2">{s.name}</Typography>
										</Box>
									</MenuItem>
								))}
							</TextField>
							<TextField size="small" select label="Stylist" value={apptStylistId} onChange={e => setApptStylistId(e.target.value)} sx={{ width: 220 }}>
								{stylists.map(st => (<MenuItem key={st.id} value={st.id}>{`${st.first_name} ${st.last_name || ''}`}</MenuItem>))}
							</TextField>
							<TextField size="small" type="datetime-local" label="Start" value={apptStart} onChange={e => setApptStart(e.target.value)} sx={{ width: 220 }} InputLabelProps={{ shrink: true }} />
							<Button variant="contained" onClick={handleAddAppointment} disabled={!apptCustomer.trim() || !apptServiceId || !apptStylistId || !apptStart}>Book</Button>
						</Box>
						
						{/* Service Preview */}
						{selectedService && (
							<Box display="flex" alignItems="center" gap={2} p={2} bgcolor="grey.50" borderRadius={1} mb={2}>
								<Avatar 
									src={selectedService.image_url} 
									sx={{ width: 60, height: 60 }}
									alt={selectedService.name}
								>
									{selectedService.name.charAt(0).toUpperCase()}
								</Avatar>
								<Box>
									<Typography variant="h6">{selectedService.name}</Typography>
									<Typography variant="body2" color="text.secondary">
										Duration: {selectedService.duration_minutes || 30} minutes
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Price: ${selectedService.price || 0}
									</Typography>
								</Box>
							</Box>
						)}
						<List dense>
							{appointments.map(a => {
								const service = services.find(s => s.id === a.service || s.name === a.service_name);
								return (
									<ListItem key={a.id} disableGutters secondaryAction={
										<Box display="flex" gap={1}>
											<Button size="small" onClick={() => handleApptAction(a.id, 'checkin')}>Check-in</Button>
											<Button size="small" color="success" onClick={() => handleApptAction(a.id, 'complete')}>Complete</Button>
											<Button size="small" color="error" onClick={() => handleApptAction(a.id, 'cancel')}>Cancel</Button>
											<Button size="small" color="error" onClick={() => removeAppointment(a.id)}>Delete</Button>
										</Box>
									}>
										<ListItemAvatar>
											<Avatar 
												src={service?.image_url} 
												sx={{ width: 40, height: 40 }}
												alt={a.service_name || a.service}
											>
												{(a.service_name || a.service || 'S').charAt(0).toUpperCase()}
											</Avatar>
										</ListItemAvatar>
										<ListItemText 
											primary={`${a.customer_name} - ${a.service_name || a.service}`} 
											secondary={`${a.stylist_name || a.stylist} | ${a.start_time?.toString().replace('T',' ').slice(0,16)} | ${a.status}`} 
										/>
									</ListItem>
								);
							})}
						</List>
					</Section>
				</Grid>
			</Grid>
		</Box>
	);
};

export default SalonDashboard;

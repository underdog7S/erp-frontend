import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Divider, List, ListItem, ListItemText, MenuItem } from '@mui/material';
import { fetchHotelRoomTypes, createHotelRoomType, fetchHotelRooms, createHotelRoom, fetchHotelGuests, createHotelGuest } from '../../services/api';

const Section = ({ title, children }) => (
	<Paper sx={{ p: 2 }}>
		<Typography variant="h6" gutterBottom>{title}</Typography>
		<Divider sx={{ mb: 2 }} />
		{children}
	</Paper>
);

const HotelDashboard = () => {
	const [roomTypes, setRoomTypes] = useState([]);
	const [rooms, setRooms] = useState([]);
	const [guests, setGuests] = useState([]);
	const [rtName, setRtName] = useState('');
	const [rtRate, setRtRate] = useState('');
	const [roomNumber, setRoomNumber] = useState('');
	const [roomTypeId, setRoomTypeId] = useState('');
	const [guestFirst, setGuestFirst] = useState('');
	const [guestLast, setGuestLast] = useState('');
	const [guestPhone, setGuestPhone] = useState('');

	const loadAll = async () => {
		try {
			const [rt, r, g] = await Promise.all([
				fetchHotelRoomTypes(),
				fetchHotelRooms(),
				fetchHotelGuests(),
			]);
			setRoomTypes(rt);
			setRooms(r);
			setGuests(g);
		} catch (e) {
			console.error('Hotel load error', e);
		}
	};

	useEffect(() => { loadAll(); }, []);

	const handleAddRoomType = async () => {
		if (!rtName) return;
		await createHotelRoomType({ name: rtName, base_rate: rtRate ? Number(rtRate) : 0 });
		setRtName(''); setRtRate('');
		loadAll();
	};
	const handleAddRoom = async () => {
		if (!roomNumber || !roomTypeId) return;
		await createHotelRoom({ room_number: roomNumber, room_type: Number(roomTypeId) });
		setRoomNumber(''); setRoomTypeId('');
		loadAll();
	};
	const handleAddGuest = async () => {
		if (!guestFirst) return;
		await createHotelGuest({ first_name: guestFirst, last_name: guestLast, phone: guestPhone });
		setGuestFirst(''); setGuestLast(''); setGuestPhone('');
		loadAll();
	};

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" gutterBottom>Hotel</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12} md={4}>
					<Section title="Room Types">
						<Box display="flex" gap={1} mb={2}>
							<TextField size="small" label="Name" value={rtName} onChange={e => setRtName(e.target.value)} fullWidth />
							<TextField size="small" label="Base Rate" type="number" value={rtRate} onChange={e => setRtRate(e.target.value)} sx={{ width: 140 }} />
							<Button variant="contained" onClick={handleAddRoomType}>Add</Button>
						</Box>
						<List dense>
							{roomTypes.map(rt => (
								<ListItem key={rt.id} disableGutters>
									<ListItemText primary={rt.name} secondary={`Base: ${rt.base_rate || 0}`} />
								</ListItem>
							))}
						</List>
					</Section>
				</Grid>
				<Grid item xs={12} md={4}>
					<Section title="Rooms">
						<Box display="flex" gap={1} mb={2}>
							<TextField size="small" label="Room Number" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} fullWidth />
							<TextField size="small" select label="Room Type" value={roomTypeId} onChange={e => setRoomTypeId(e.target.value)} sx={{ width: 180 }}>
								{roomTypes.map(rt => (<MenuItem key={rt.id} value={rt.id}>{rt.name}</MenuItem>))}
							</TextField>
							<Button variant="contained" onClick={handleAddRoom}>Add</Button>
						</Box>
						<List dense>
							{rooms.map(r => (
								<ListItem key={r.id} disableGutters>
									<ListItemText primary={`Room ${r.room_number}`} secondary={`Type: ${r.room_type_name || r.room_type}`} />
								</ListItem>
							))}
						</List>
					</Section>
				</Grid>
				<Grid item xs={12} md={4}>
					<Section title="Guests">
						<Box display="flex" gap={1} mb={2}>
							<TextField size="small" label="First Name" value={guestFirst} onChange={e => setGuestFirst(e.target.value)} fullWidth />
							<TextField size="small" label="Last Name" value={guestLast} onChange={e => setGuestLast(e.target.value)} sx={{ width: 140 }} />
							<TextField size="small" label="Phone" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} sx={{ width: 160 }} />
							<Button variant="contained" onClick={handleAddGuest}>Add</Button>
						</Box>
						<List dense>
							{guests.map(g => (
								<ListItem key={g.id} disableGutters>
									<ListItemText primary={`${g.first_name} ${g.last_name || ''}`} secondary={g.phone || ''} />
								</ListItem>
							))}
						</List>
					</Section>
				</Grid>
			</Grid>
		</Box>
	);
};

export default HotelDashboard;

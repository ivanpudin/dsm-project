import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Typography,
  Modal,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  IconButton,
  Grid,
  TextField,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  InputAdornment
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { alpha } from '@mui/material/styles'
import { useNotification } from '../context/NotificationContext'
import { Customer, Location } from '../types/schema'
import { LiquidWrapper, GlassPanel, glassModalStyle } from './GlassUI'

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  
  // Delete Customer State
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  
  // Create Customer State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerEmail, setNewCustomerEmail] = useState('')
  const [newCustomerLid, setNewCustomerLid] = useState<number | null>(null)
  const [locationSearch, setLocationSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Create Location State
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [newLocationAddress, setNewLocationAddress] = useState('')
  const [newLocationCountry, setNewLocationCountry] = useState('')
  const [isCreatingLocation, setIsCreatingLocation] = useState(false)

  const { showNotification } = useNotification()

  const getRole = () => localStorage.getItem('appRole') || 'ADMIN'

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch('/api/customer/get-all', {
        headers: { 'x-role': getRole() }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch customers')
      setCustomers(data)
    } catch (err: any) {
      showNotification(err.message)
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch('/api/location/get-all', {
        headers: { 'x-role': getRole() }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch locations')
      setLocations(data)
    } catch (err: any) {
      showNotification(err.message)
    }
  }, [showNotification])

  useEffect(() => {
    fetchCustomers()
    fetchLocations()
  }, [fetchCustomers, fetchLocations])

  const handleDelete = async () => {
    if (!customerToDelete) return
    try {
      const res = await fetch(`/api/customer/${customerToDelete.cid}/delete`, {
        method: 'DELETE',
        headers: { 'x-role': getRole() }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete customer')
      
      showNotification('Customer deleted successfully', 'success')
      setCustomerToDelete(null)
      fetchCustomers()
    } catch (err: any) {
      showNotification(err.message)
    }
  }

  const handleCreateCustomer = async () => {
    if (!newCustomerName || !newCustomerEmail || !newCustomerLid) {
      showNotification('Please provide a name, email, and select a location')
      return
    }

    setIsCreating(true)
    try {
      const payload = {
        name: newCustomerName,
        email: newCustomerEmail,
        lid: newCustomerLid
      }

      const res = await fetch('/api/customer/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': getRole() },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to create customer')

      showNotification('Customer created successfully', 'success')
      setIsCreateOpen(false)
      
      setNewCustomerName('')
      setNewCustomerEmail('')
      setNewCustomerLid(null)
      
      fetchCustomers()
    } catch (err: any) {
      showNotification(err.message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateLocation = async () => {
    if (!newLocationAddress) {
      showNotification('Please provide an address for the new location')
      return
    }

    setIsCreatingLocation(true)
    try {
      const payload = {
        address: newLocationAddress,
        country: newLocationCountry || undefined
      }

      const res = await fetch('/api/location/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': getRole() },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to create location')

      showNotification('Location created successfully', 'success')
      
      // Reset state and close modal
      setNewLocationAddress('')
      setNewLocationCountry('')
      setIsLocationModalOpen(false)
      
      // Refetch locations and auto-select the newly created one
      await fetchLocations()
      setNewCustomerLid(data.lid)
    } catch (err: any) {
      showNotification(err.message)
    } finally {
      setIsCreatingLocation(false)
    }
  }

  const filteredLocations = locations.filter(l => 
    l.address.toLowerCase().includes(locationSearch.toLowerCase()) ||
    l.country.toLowerCase().includes(locationSearch.toLowerCase())
  )

  const glassPanelStyle = {
    bgcolor: (theme: any) => alpha(theme.palette.background.paper, 0.2), 
    borderRadius: 3, 
    p: 2, 
    height: '100%', 
    border: '1px solid', 
    borderColor: (theme: any) => alpha(theme.palette.divider, 0.1),
    display: 'flex',
    flexDirection: 'column'
  }

  const scrollableListStyle = {
    flexGrow: 1, 
    overflowY: 'auto', 
    minHeight: 0,
    maxHeight: { xs: 300, md: 'calc(90vh - 250px)' },
    pr: 1, 
    '&::-webkit-scrollbar': { width: '6px' }, 
    '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: '10px' }
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress />
    </Box>
  )

  return (
    <LiquidWrapper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
          Customers
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setIsCreateOpen(true)}
          sx={{ 
            borderRadius: 3, 
            textTransform: 'none', 
            fontWeight: 600,
            boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
          }}
        >
          New Customer
        </Button>
      </Box>

      <GlassPanel sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ 
          maxHeight: 'calc(100vh - 210px)', 
          '&::-webkit-scrollbar': { width: '6px' }, 
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: '10px' } 
        }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(10px)' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(10px)' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(10px)' }}>Location</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(10px)' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.cid} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{(customer as any).address ? `${(customer as any).address}, ${(customer as any).country}` : 'Unknown'}</TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => setCustomerToDelete(customer)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">No customers found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassPanel>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal open={!!customerToDelete} onClose={() => setCustomerToDelete(null)}>
        <Box sx={{ ...glassModalStyle, width: 400, maxWidth: '90vw' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="error">
              Delete Customer
            </Typography>
            <IconButton onClick={() => setCustomerToDelete(null)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Are you sure you want to delete <strong>{customerToDelete?.name}</strong>? This action cannot be undone.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => setCustomerToDelete(null)} sx={{ borderRadius: 2, textTransform: 'none' }}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: 2, textTransform: 'none' }}>
              Delete
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* CREATE CUSTOMER MODAL */}
      <Modal open={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <Box sx={{ 
          ...glassModalStyle, 
          width: 800, 
          maxWidth: '70vw', 
          p: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          maxHeight: '95vh',
          overflow: 'hidden' 
        }}>
          <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: (theme) => alpha(theme.palette.divider, 0.1) }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              CREATE NEW CUSTOMER
            </Typography>
            <IconButton onClick={() => setIsCreateOpen(false)} size="small" sx={{ color: 'text.primary' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1 }}>
            <Grid container spacing={3} justifyContent="center" alignItems="stretch">
              
              <Grid item xs={12} sm={10} md={6}>
                <Box sx={{ ...glassPanelStyle, gap: 2 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight="bold">CUSTOMER DETAILS</Typography>
                  <Divider sx={{ opacity: 0.3 }} />
                  
                  <TextField 
                    label="Customer Name" 
                    fullWidth 
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
                  />
                  <TextField 
                    label="Email Address" 
                    type="email"
                    fullWidth 
                    required
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
                  />
                  
                  <Box sx={{ flexGrow: 1 }} />
                  
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    fullWidth
                    disabled={isCreating || !newCustomerName || !newCustomerEmail || !newCustomerLid}
                    onClick={handleCreateCustomer}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold', py: 1.5, mt: 2 }}
                  >
                    {isCreating ? <CircularProgress size={24} color="inherit" /> : 'Create Customer'}
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} sm={10} md={6}>
                <Box sx={glassPanelStyle}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="overline" color="text.secondary" fontWeight="bold">SELECT LOCATION</Typography>
                    {newCustomerLid && (
                      <Chip label="Selected" size="small" color="success" sx={{ fontWeight: 'bold' }} />
                    )}
                  </Stack>
                  
                  <Stack direction="row" spacing={1} sx={{ my: 1.5, flexShrink: 0 }}>
                    <TextField 
                      fullWidth 
                      size="small" 
                      placeholder="Search locations..." 
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                      }}
                    />
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => setIsLocationModalOpen(true)}
                      sx={{ minWidth: '40px', px: 0, borderRadius: 2 }}
                      aria-label="Add Location"
                    >
                      <AddIcon />
                    </Button>
                  </Stack>
                  <Divider sx={{ mb: 1, opacity: 0.3, flexShrink: 0 }} />
                  
                  <List sx={scrollableListStyle}>
                    {filteredLocations.map((loc) => {
                      const isSelected = newCustomerLid === loc.lid
                      return (
                        <ListItem key={loc.lid} disablePadding sx={{ mb: 1 }}>
                          <ListItemButton 
                            onClick={() => setNewCustomerLid(loc.lid)}
                            sx={{ 
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: isSelected ? 'primary.main' : (theme) => alpha(theme.palette.divider, 0.1),
                              bgcolor: isSelected ? (theme) => alpha(theme.palette.primary.main, 0.1) : 'transparent',
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <ListItemText 
                              primary={loc.address} 
                              secondary={loc.country}
                              primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500 }}
                            />
                          </ListItemButton>
                        </ListItem>
                      )
                    })}
                    {filteredLocations.length === 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                        No locations found.
                      </Typography>
                    )}
                  </List>
                </Box>
              </Grid>

            </Grid>
          </Box>
        </Box>
      </Modal>

      {/* CREATE LOCATION MODAL (STACKED) */}
      <Modal open={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)}>
        <Box sx={{ ...glassModalStyle, width: 450, maxWidth: '90vw' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Add New Location
            </Typography>
            <IconButton onClick={() => setIsLocationModalOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Stack spacing={3}>
            <TextField 
              label="Address" 
              fullWidth 
              required
              value={newLocationAddress}
              onChange={(e) => setNewLocationAddress(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
            />
            <TextField 
              label="Country (Default: Finland)" 
              fullWidth 
              value={newLocationCountry}
              onChange={(e) => setNewLocationCountry(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
            />
            
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              disabled={isCreatingLocation || !newLocationAddress}
              onClick={handleCreateLocation}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
            >
              {isCreatingLocation ? <CircularProgress size={24} color="inherit" /> : 'Save Location'}
            </Button>
          </Stack>
        </Box>
      </Modal>

    </LiquidWrapper>
  )
}

export default Customers

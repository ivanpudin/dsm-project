import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  CardContent,
  CardActionArea,
  Typography,
  Modal,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Divider,
  Stack,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNotification } from '../context/NotificationContext'
import { Project, Employee, Customer } from '../types/schema'
import { LiquidWrapper, GlassCard, glassModalStyle } from './GlassUI'

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([])
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectStart, setNewProjectStart] = useState('')
  const [newProjectDeadline, setNewProjectDeadline] = useState('')
  const [newProjectBudget, setNewProjectBudget] = useState('')
  const [newProjectCid, setNewProjectCid] = useState<number | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  
  const { showNotification } = useNotification()

  const getRole = () => localStorage.getItem('appRole') || 'ADMIN'

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:1234/api/project/get-all', {
        headers: { 'x-role': getRole() }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch projects')
      setProjects(data)
    } catch (err: any) {
      showNotification(err.message)
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:1234/api/customer/get-all', {
        headers: { 'x-role': getRole() }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch customers')
      setCustomers(data)
    } catch (err: any) {
      showNotification(err.message)
    }
  }, [showNotification])

  useEffect(() => {
    fetchProjects()
    fetchCustomers()
  }, [fetchProjects, fetchCustomers])

  const handleCardClick = async (project: Project) => {
    setSelectedProject(project)
    setEmployeesLoading(true)
    try {
      const headers = { 'x-role': getRole() }
      const [assignedRes, availableRes] = await Promise.all([
        fetch(`http://localhost:1234/api/project/${project.prid}/employees`, { headers }),
        fetch(`http://localhost:1234/api/employee/${project.prid}/get-all-filtered`, { headers })
      ])
      
      const assignedData = await assignedRes.json()
      const availableData = await availableRes.json()

      if (!assignedRes.ok) throw new Error(assignedData.error || 'Failed to fetch assigned')
      if (!availableRes.ok) throw new Error(availableData.error || 'Failed to fetch available')

      setEmployees(assignedData)
      setAvailableEmployees(availableData)
    } catch (err: any) {
      showNotification(err.message)
      setSelectedProject(null)
    } finally {
      setEmployeesLoading(false)
    }
  }

  const handleAssign = async (empid: number) => {
    if (!selectedProject) return
    try {
      const res = await fetch(`http://localhost:1234/api/employee/${selectedProject.prid}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': getRole() },
        body: JSON.stringify({ empid })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to assign employee')
      
      showNotification('Employee assigned successfully', 'success')
      handleCardClick(selectedProject)
    } catch (err: any) {
      showNotification(err.message)
    }
  }

  const handleRemove = async (empid: number) => {
    if (!selectedProject) return
    try {
      const res = await fetch(`http://localhost:1234/api/employee/${selectedProject.prid}/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': getRole() },
        body: JSON.stringify({ empid })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to remove employee')
      
      showNotification('Employee removed successfully', 'success')
      handleCardClick(selectedProject)
    } catch (err: any) {
      showNotification(err.message)
    }
  }

  const handleCreateProject = async () => {
    if (!newProjectName || !newProjectCid) {
      showNotification('Please provide a project name and select a customer')
      return
    }

    setIsCreating(true)
    try {
      const payload = {
        name: newProjectName,
        startdate: newProjectStart || null,
        deadline: newProjectDeadline || null,
        budget: newProjectBudget ? parseFloat(newProjectBudget) : null,
        cid: newProjectCid
      }

      const res = await fetch('http://localhost:1234/api/project/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': getRole() },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to create project')

      showNotification('Project created successfully', 'success')
      setIsCreateOpen(false)
      
      setNewProjectName('')
      setNewProjectStart('')
      setNewProjectDeadline('')
      setNewProjectBudget('')
      setNewProjectCid(null)
      
      fetchProjects()
    } catch (err: any) {
      showNotification(err.message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!selectedProject) return

    try {
      const res = await fetch(`http://localhost:1234/api/project/${selectedProject.prid}/delete`, {
        method: 'DELETE',
        headers: { 'x-role': getRole() }
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to delete project')

      showNotification('Project deleted successfully', 'success')
      setSelectedProject(null)
      fetchProjects()
    } catch (err: any) {
      showNotification(err.message)
    }
  }

  const filteredAvailable = availableEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
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

      {/* PAGE TITLE */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
          Projects
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
          New Project
        </Button>
      </Box>

      {/* MAIN CONTENT */}
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.prid}>
            <GlassCard>
              <CardActionArea 
                onClick={() => handleCardClick(project)} 
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <CardContent sx={{ width: '100%', flexGrow: 1, p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }} noWrap>
                    {project.name}
                  </Typography>

                  <Divider sx={{ my: 2, opacity: 0.3 }} />

                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Timeline:</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.startdate ? new Date(project.startdate).toLocaleDateString() : 'TBD'} - {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD'}
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" sx={{ fontWeight: 600, flexGrow: 1 }}>Budget:</Typography>
                      <Chip 
                        label={project.budget ? `$${Number(project.budget).toLocaleString()}` : 'Unspecified'} 
                        size="small" 
                        color="secondary"
                        sx={{ fontWeight: 'bold', borderRadius: 2 }} 
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      {/* PROJECT MODAL */}
      <Modal open={!!selectedProject} onClose={() => setSelectedProject(null)}>
        <Box sx={{ 
          ...glassModalStyle, 
          width: 1000, 
          maxWidth: '70vw', 
          p: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          maxHeight: '95vh',
          overflow: 'hidden' 
        }}>
          
          <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: (theme) => alpha(theme.palette.divider, 0.1) }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              PROJECT DETAILS: {selectedProject?.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button 
                color="error" 
                size="small" 
                startIcon={<DeleteIcon />} 
                onClick={handleDeleteProject}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Delete
              </Button>
              <IconButton onClick={() => setSelectedProject(null)} size="small" sx={{ color: 'text.primary' }}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Box>

          <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1 }}>
            <Grid container spacing={3} justifyContent="center" alignItems="stretch">
              
              <Grid item xs={12} sm={10} md={3}>
                <Box sx={{ ...glassPanelStyle, width: 200 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight="bold">PROJECT CUSTOMER</Typography>
                  <Divider sx={{ my: 1, opacity: 0.3 }} />
                  <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>
                    {customers.find(c => c.cid === selectedProject?.cid)?.name || 'Unknown Customer'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={10} md={4.5}>
                <Box sx={{ ...glassPanelStyle, minWidth: 220 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="overline" color="text.secondary" fontWeight="bold">ASSIGNED EMPLOYEES</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>({employees.length})</Typography>
                  </Stack>
                  <Divider sx={{ my: 1, opacity: 0.3 }} />
                  
                  {employeesLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, flexGrow: 1 }}><CircularProgress size={24} /></Box> : (
                    <List sx={scrollableListStyle}>
                      {employees.map((emp) => (
                        <ListItem key={emp.empid} disableGutters sx={{ borderBottom: '1px solid', borderColor: (theme) => alpha(theme.palette.divider, 0.05) }}>
                          <ListItemText 
                            primary={emp.name} 
                            secondary={emp.email}
                            primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }} 
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                          <Button size="small" color="error" variant="outlined" onClick={() => handleRemove(emp.empid)} sx={{ borderRadius: 2, textTransform: 'none', ml: 1 }}>
                            Remove
                          </Button>
                        </ListItem>
                      ))}
                      {employees.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No employees assigned.</Typography>}
                    </List>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} sm={10} md={4.5}>
                <Box sx={glassPanelStyle}>
                  <Typography variant="overline" color="text.secondary" fontWeight="bold">AVAILABLE FOR ASSIGNMENT</Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    placeholder="Search employees..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ my: 1.5, flexShrink: 0, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                    }}
                  />
                  <Divider sx={{ mb: 1, opacity: 0.3, flexShrink: 0 }} />
                  
                  {employeesLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, flexGrow: 1 }}><CircularProgress size={24} /></Box> : (
                    <List sx={scrollableListStyle}>
                      {filteredAvailable.map((emp) => (
                        <ListItem key={emp.empid} disableGutters sx={{ borderBottom: '1px solid', borderColor: (theme) => alpha(theme.palette.divider, 0.05) }}>
                          <ListItemText 
                            primary={emp.name} 
                            secondary={emp.email}
                            primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }} 
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                          <Button size="small" color="primary" variant="contained" disableElevation onClick={() => handleAssign(emp.empid)} sx={{ borderRadius: 2, textTransform: 'none', ml: 1 }}>
                            Assign
                          </Button>
                        </ListItem>
                      ))}
                      {filteredAvailable.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No available employees match.</Typography>}
                    </List>
                  )}
                </Box>
              </Grid>

            </Grid>
          </Box>
        </Box>
      </Modal>

      {/* CREATE PROJECT MODAL */}
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
              CREATE NEW PROJECT
            </Typography>
            <IconButton onClick={() => setIsCreateOpen(false)} size="small" sx={{ color: 'text.primary' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1 }}>
            <Grid container spacing={3} justifyContent="center" alignItems="stretch">
              
              <Grid item xs={12} sm={10} md={6}>
                <Box sx={{ ...glassPanelStyle, gap: 2 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight="bold">PROJECT DETAILS</Typography>
                  <Divider sx={{ opacity: 0.3 }} />
                  
                  <TextField 
                    label="Project Name" 
                    fullWidth 
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
                  />
                  <TextField 
                    label="Start Date (Optional)" 
                    type="date"
                    fullWidth 
                    value={newProjectStart}
                    onChange={(e) => setNewProjectStart(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
                  />
                  <TextField 
                    label="Deadline (Optional)" 
                    type="date"
                    fullWidth 
                    value={newProjectDeadline}
                    onChange={(e) => setNewProjectDeadline(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
                  />
                  <TextField 
                    label="Budget (Optional)" 
                    type="number"
                    fullWidth 
                    value={newProjectBudget}
                    onChange={(e) => setNewProjectBudget(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
                  />
                  
                  <Box sx={{ flexGrow: 1 }} />
                  
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    fullWidth
                    disabled={isCreating || !newProjectName || !newProjectCid}
                    onClick={handleCreateProject}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold', py: 1.5, mt: 2 }}
                  >
                    {isCreating ? <CircularProgress size={24} color="inherit" /> : 'Create Project'}
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} sm={10} md={6}>
                <Box sx={glassPanelStyle}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="overline" color="text.secondary" fontWeight="bold">SELECT CUSTOMER</Typography>
                    {newProjectCid && (
                      <Chip label="Selected" size="small" color="success" sx={{ fontWeight: 'bold' }} />
                    )}
                  </Stack>
                  
                  <TextField 
                    fullWidth 
                    size="small" 
                    placeholder="Search customers..." 
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    sx={{ my: 1.5, flexShrink: 0, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                    }}
                  />
                  <Divider sx={{ mb: 1, opacity: 0.3, flexShrink: 0 }} />
                  
                  <List sx={scrollableListStyle}>
                    {filteredCustomers.map((c) => {
                      const isSelected = newProjectCid === c.cid
                      return (
                        <ListItem key={c.cid} disablePadding sx={{ mb: 1 }}>
                          <ListItemButton 
                            onClick={() => setNewProjectCid(c.cid)}
                            sx={{ 
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: isSelected ? 'primary.main' : (theme) => alpha(theme.palette.divider, 0.1),
                              bgcolor: isSelected ? (theme) => alpha(theme.palette.primary.main, 0.1) : 'transparent',
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <ListItemText 
                              primary={c.name} 
                              secondary={c.email}
                              primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500 }}
                            />
                          </ListItemButton>
                        </ListItem>
                      )
                    })}
                    {filteredCustomers.length === 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                        No customers found.
                      </Typography>
                    )}
                  </List>
                </Box>
              </Grid>

            </Grid>
          </Box>
        </Box>
      </Modal>

    </LiquidWrapper>
  )
}

export default Dashboard

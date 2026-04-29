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
  IconButton,
  Chip,
  Stack,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  TextField,
  InputAdornment
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { alpha } from '@mui/material/styles'
import { useNotification } from '../context/NotificationContext'
import { LiquidWrapper, GlassPanel, glassModalStyle } from './GlassUI'
import { Employee, Role, UserGroup, Department, Location } from '../types/schema'

interface ExtendedEmployee extends Employee {
  department_name: string
  roles: string[]
  user_groups: string[]
}

const Employees = () => {
  const [employees, setEmployees] = useState<ExtendedEmployee[]>([])
  const [loading, setLoading] = useState(true)
  
  // Edit Modal States
  const [selectedEmployee, setSelectedEmployee] = useState<ExtendedEmployee | null>(null)
  const [assignedRoles, setAssignedRoles] = useState<Role[]>([])
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [assignedGroups, setAssignedGroups] = useState<UserGroup[]>([])
  const [availableGroups, setAvailableGroups] = useState<UserGroup[]>([])
  const [modalLoading, setModalLoading] = useState(false)
  const [roleSearch, setRoleSearch] = useState('')
  const [groupSearch, setGroupSearch] = useState('')

  // Create Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newDepId, setNewDepId] = useState<number | null>(null)
  const [newRoles, setNewRoles] = useState<number[]>([])
  const [newGroups, setNewGroups] = useState<number[]>([])

  // Create Department States
  const [isCreateDepOpen, setIsCreateDepOpen] = useState(false)
  const [newDepName, setNewDepName] = useState('')
  const [newDepLid, setNewDepLid] = useState<number | null>(null)
  const [isCreatingDep, setIsCreatingDep] = useState(false)

  // Create Role States
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [isCreatingRole, setIsCreatingRole] = useState(false)

  // Create User Group States
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)

  // Create Location States
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [newLocationAddress, setNewLocationAddress] = useState('')
  const [newLocationCountry, setNewLocationCountry] = useState('')
  const [isCreatingLocation, setIsCreatingLocation] = useState(false)

  // Change Department States
  const [isChangeDepOpen, setIsChangeDepOpen] = useState(false)
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([])
  const [selectedNewDepId, setSelectedNewDepId] = useState<number | null>(null)
  const [isChangingDep, setIsChangingDep] = useState(false)
  const [changeDepSearch, setChangeDepSearch] = useState('')
  
  // Create Modal Reference Data
  const [allDepartments, setAllDepartments] = useState<Department[]>([])
  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [allGroups, setAllGroups] = useState<UserGroup[]>([])
  const [allLocations, setAllLocations] = useState<Location[]>([])
  
  // Create Modal Search States
  const [depSearchCreate, setDepSearchCreate] = useState('')
  const [roleSearchCreate, setRoleSearchCreate] = useState('')
  const [groupSearchCreate, setGroupSearchCreate] = useState('')
  const [locationSearchCreate, setLocationSearchCreate] = useState('')

  const { showNotification } = useNotification()
  const getRole = () => localStorage.getItem('appRole') || 'ADMIN'

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch('/api/employee/get-all', {
        headers: { 'x-role': getRole() }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch employees')
      setEmployees(data)
    } catch (err: any) {
      showNotification(err.message)
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  // Fetch reference data for the Create form
  const fetchCreateReferenceData = useCallback(async () => {
    try {
      const headers = { 'x-role': getRole() }
      const [depRes, roleRes, groupRes, locRes] = await Promise.all([
        fetch('/api/department/get-all', { headers }),
        fetch('/api/role/get-all', { headers }),
        fetch('/api/group/get-all', { headers }),
        fetch('/api/location/get-all', { headers })
      ])
      
      if (depRes.ok) setAllDepartments(await depRes.json())
      if (roleRes.ok) setAllRoles(await roleRes.json())
      if (groupRes.ok) setAllGroups(await groupRes.json())
      if (locRes.ok) setAllLocations(await locRes.json())
    } catch (err: any) {
      console.error('Failed to load reference data', err)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
    fetchCreateReferenceData()
  }, [fetchEmployees, fetchCreateReferenceData])

  const fetchModalData = async (empid: number) => {
    setModalLoading(true)
    try {
      const headers = { 'x-role': getRole() }
      const [assRolesRes, avRolesRes, assGroupsRes, avGroupsRes] = await Promise.all([
        fetch(`/api/employee/${empid}/get-roles`, { headers }),
        fetch(`/api/role/${empid}/get-all-filtered`, { headers }),
        fetch(`/api/employee/${empid}/get-groups`, { headers }),
        fetch(`/api/group/${empid}/get-all-filtered`, { headers })
      ])

      const assRoles = await assRolesRes.json()
      const avRoles = await avRolesRes.json()
      const assGroups = await assGroupsRes.json()
      const avGroups = await avGroupsRes.json()

      if (!assRolesRes.ok) throw new Error(assRoles.error || 'Failed to fetch assigned roles')
      if (!avRolesRes.ok) throw new Error(avRoles.error || 'Failed to fetch available roles')
      if (!assGroupsRes.ok) throw new Error(assGroups.error || 'Failed to fetch assigned groups')
      if (!avGroupsRes.ok) throw new Error(avGroups.error || 'Failed to fetch available groups')

      setAssignedRoles(assRoles)
      setAvailableRoles(avRoles)
      setAssignedGroups(assGroups)
      setAvailableGroups(avGroups)
    } catch (err: any) {
      showNotification(err.message)
    } finally {
      setModalLoading(false)
    }
  }

  const handleEditClick = (employee: ExtendedEmployee) => {
    setSelectedEmployee(employee)
    setRoleSearch('')
    setGroupSearch('')
    fetchModalData(employee.empid)
  }

  const handleCreateEmployee = async () => {
    if (!newName || !newEmail || !newDepId || newRoles.length === 0 || newGroups.length === 0) {
      showNotification('Please fill out all fields and select at least one department, role, and group')
      return
    }

    setIsCreating(true)
    try {
      const payload = {
        name: newName,
        email: newEmail,
        depid: newDepId,
        roles: newRoles,
        groups: newGroups
      }

      const res = await fetch('/api/employee/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': getRole() },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to create employee')

      showNotification('Employee created successfully', 'success')
      setIsCreateOpen(false)
      
      // Reset form
      setNewName('')
      setNewEmail('')
      setNewDepId(null)
      setNewRoles([])
      setNewGroups([])
      
      fetchEmployees()
    } catch (err: any) {
      showNotification(err.message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateDepartment = async () => {
    if (!newDepName || !newDepLid) {
      showNotification('Please provide a name and select a location')
      return
    }
    setIsCreatingDep(true)
    try {
      const res = await fetch('/api/department/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': getRole() },
        body: JSON.stringify({ name: newDepName, lid: newDepLid })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create department')
      
      showNotification('Department created successfully', 'success')
      setIsCreateDepOpen(false)
      setNewDepName('')
      setNewDepLid(null)
      fetchCreateReferenceData()
    } catch (err: any) { showNotification(err.message) } 
    finally { setIsCreatingDep(false) }
  }

  const handleCreateRole = async () => {
    if (!newRoleName) return showNotification('Please provide a role name')
    setIsCreatingRole(true)
    try {
      const res = await fetch('/api/role/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': getRole() },
        body: JSON.stringify({ name: newRoleName })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create role')
      
      showNotification('Role created successfully', 'success')
      setIsCreateRoleOpen(false)
      setNewRoleName('')
      fetchCreateReferenceData()
    } catch (err: any) { showNotification(err.message) } 
    finally { setIsCreatingRole(false) }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName) return showNotification('Please provide a group name')
    setIsCreatingGroup(true)
    try {
      const res = await fetch('/api/group/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': getRole() },
        body: JSON.stringify({ name: newGroupName })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create group')
      
      showNotification('Group created successfully', 'success')
      setIsCreateGroupOpen(false)
      setNewGroupName('')
      fetchCreateReferenceData()
    } catch (err: any) { showNotification(err.message) } 
    finally { setIsCreatingGroup(false) }
  }

  const handleCreateLocation = async () => {
    if (!newLocationAddress) return showNotification('Please provide an address')
    setIsCreatingLocation(true)
    try {
      const res = await fetch('/api/location/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': getRole() },
        body: JSON.stringify({ address: newLocationAddress, country: newLocationCountry || undefined })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create location')
      
      showNotification('Location created successfully', 'success')
      setNewLocationAddress('')
      setNewLocationCountry('')
      setIsLocationModalOpen(false)
      await fetchCreateReferenceData()
      setNewDepLid(data.lid)
    } catch (err: any) { showNotification(err.message) } 
    finally { setIsCreatingLocation(false) }
  }

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return
    try {
      const res = await fetch(`/api/employee/${selectedEmployee.empid}/delete`, {
        method: 'DELETE',
        headers: { 'x-role': getRole() }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete employee')
      
      showNotification('Employee deleted successfully', 'success')
      setSelectedEmployee(null)
      fetchEmployees()
    } catch (err: any) { showNotification(err.message) }
  }

  const handleOpenChangeDep = async () => {
    if (!selectedEmployee) return
    try {
      const res = await fetch(`/api/department/${selectedEmployee.depid}/get-all-filtered`, {
        headers: { 'x-role': getRole() }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch departments')
      
      setFilteredDepartments(data)
      setIsChangeDepOpen(true)
    } catch (err: any) { showNotification(err.message) }
  }

  const handleChangeDepartment = async () => {
    if (!selectedEmployee || !selectedNewDepId) return
    setIsChangingDep(true)
    try {
      const res = await fetch(`/api/employee/change-department`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': getRole() },
        body: JSON.stringify({ empid: selectedEmployee.empid, depid: selectedNewDepId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to change department')
      
      showNotification('Department changed successfully', 'success')
      setIsChangeDepOpen(false)
      setSelectedNewDepId(null)
      await fetchEmployees()
      
      const newDep = filteredDepartments.find(d => d.depid === selectedNewDepId)
      if (newDep) {
        setSelectedEmployee({ ...selectedEmployee, depid: newDep.depid, department_name: newDep.name })
      }
    } catch (err: any) { showNotification(err.message) } 
    finally { setIsChangingDep(false) }
  }

  const toggleCreateRole = (roleid: number) => {
    setNewRoles(prev => prev.includes(roleid) ? prev.filter(id => id !== roleid) : [...prev, roleid])
  }

  const toggleCreateGroup = (grid: number) => {
    setNewGroups(prev => prev.includes(grid) ? prev.filter(id => id !== grid) : [...prev, grid])
  }

  // ASSIGNMENT ACTIONS (EDIT MODAL)
  const handleAddRole = async (roleid: number) => {
    if (!selectedEmployee) return
    try {
      const res = await fetch(`/api/employee/add-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': getRole() },
        body: JSON.stringify({ empid: selectedEmployee.empid, roleid })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to assign role')
      
      showNotification('Role assigned successfully', 'success')
      await fetchModalData(selectedEmployee.empid)
      fetchEmployees()
    } catch (err: any) {
      showNotification(err.message)
    }
  }

  const handleRemoveRole = async (roleid: number) => {
    if (!selectedEmployee) return
    try {
      const res = await fetch(`/api/employee/remove-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': getRole() },
        body: JSON.stringify({ empid: selectedEmployee.empid, roleid })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to remove role')
      
      showNotification('Role removed successfully', 'success')
      await fetchModalData(selectedEmployee.empid)
      fetchEmployees()
    } catch (err: any) {
      showNotification(err.message)
    }
  }

  const handleAddGroup = async (grid: number) => {
    if (!selectedEmployee) return
    try {
      const res = await fetch(`/api/employee/add-group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': getRole() },
        body: JSON.stringify({ empid: selectedEmployee.empid, grid })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to assign group')
      
      showNotification('Group assigned successfully', 'success')
      await fetchModalData(selectedEmployee.empid)
      fetchEmployees()
    } catch (err: any) {
      showNotification(err.message)
    }
  }

  const handleRemoveGroup = async (grid: number) => {
    if (!selectedEmployee) return
    try {
      const res = await fetch(`/api/employee/remove-group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': getRole() },
        body: JSON.stringify({ empid: selectedEmployee.empid, grid })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to remove group')
      
      showNotification('Group removed successfully', 'success')
      await fetchModalData(selectedEmployee.empid)
      fetchEmployees()
    } catch (err: any) {
      showNotification(err.message)
    }
  }

  // Filters
  const filteredAvRoles = availableRoles.filter(r => r.name.toLowerCase().includes(roleSearch.toLowerCase()))
  const filteredAvGroups = availableGroups.filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase()))
  
  const filteredDepCreate = allDepartments.filter(d => d.name.toLowerCase().includes(depSearchCreate.toLowerCase()))
  const filteredRoleCreate = allRoles.filter(r => r.name.toLowerCase().includes(roleSearchCreate.toLowerCase()))
  const filteredGroupCreate = allGroups.filter(g => g.name.toLowerCase().includes(groupSearchCreate.toLowerCase()))
  const filteredLocationsCreate = allLocations.filter(l => l.address.toLowerCase().includes(locationSearchCreate.toLowerCase()) || l.country.toLowerCase().includes(locationSearchCreate.toLowerCase()))
  const filteredChangeDep = filteredDepartments.filter(d => d.name.toLowerCase().includes(changeDepSearch.toLowerCase()))

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
    maxHeight: 250,
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
          Employees
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="primary" onClick={() => setIsCreateRoleOpen(true)} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}>
            New Role
          </Button>
          <Button variant="outlined" color="primary" onClick={() => setIsCreateGroupOpen(true)} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}>
            New Group
          </Button>
          <Button variant="outlined" color="primary" onClick={() => setIsCreateDepOpen(true)} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}>
            New Department
          </Button>
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
            New Employee
          </Button>
        </Stack>
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
                <TableCell sx={{ fontWeight: 'bold', bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(10px)' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(10px)' }}>Roles</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(10px)' }}>User Groups</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(10px)' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.empid} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.department_name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {emp.roles && emp.roles.length > 0 && emp.roles[0] !== null ? emp.roles.map((role, idx) => (
                        <Chip key={idx} label={role} size="small" color="primary" variant="outlined" />
                      )) : <Typography variant="caption" color="text.secondary">None</Typography>}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {emp.user_groups && emp.user_groups.length > 0 && emp.user_groups[0] !== null ? emp.user_groups.map((group, idx) => (
                        <Chip key={idx} label={group} size="small" color="secondary" />
                      )) : <Typography variant="caption" color="text.secondary">None</Typography>}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleEditClick(emp)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No employees found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassPanel>

      {/* CREATE EMPLOYEE MODAL */}
      <Modal open={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <Box sx={{ 
          ...glassModalStyle, 
          width: 1200, 
          maxWidth: '95vw',
          p: 0,
          display: 'flex', 
          flexDirection: 'column', 
          maxHeight: '95vh',
          overflow: 'hidden'
        }}>
          <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: (theme) => alpha(theme.palette.divider, 0.1) }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              CREATE NEW EMPLOYEE
            </Typography>
            <IconButton onClick={() => setIsCreateOpen(false)} size="small" sx={{ color: 'text.primary' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1 }}>
            <Grid container spacing={3} alignItems="stretch" justifyContent="center">
              
              {/* Details Form */}
              <Grid item xs={12} md={6}>
                <Box sx={{ ...glassPanelStyle, gap: 2 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight="bold">EMPLOYEE DETAILS</Typography>
                  <Divider sx={{ opacity: 0.3 }} />
                  
                  <TextField 
                    label="Full Name" 
                    fullWidth 
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
                  />
                  <TextField 
                    label="Email Address" 
                    type="email"
                    fullWidth 
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
                  />
                  
                  <Box sx={{ flexGrow: 1 }} />
                  
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    fullWidth
                    disabled={isCreating || !newName || !newEmail || !newDepId || newRoles.length === 0 || newGroups.length === 0}
                    onClick={handleCreateEmployee}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold', py: 1.5, mt: 2 }}
                  >
                    {isCreating ? <CircularProgress size={24} color="inherit" /> : 'Create Employee'}
                  </Button>
                </Box>
              </Grid>

              {/* Department Selection */}
              <Grid item xs={12} md={6}>
                <Box sx={{ ...glassPanelStyle, width: 250 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="overline" color="text.secondary" fontWeight="bold">SELECT DEPARTMENT</Typography>
                    {newDepId && <Chip label="Selected" size="small" color="success" sx={{ fontWeight: 'bold' }} />}
                  </Stack>
                  <TextField 
                    fullWidth 
                    size="small" 
                    placeholder="Search departments..." 
                    value={depSearchCreate}
                    onChange={(e) => setDepSearchCreate(e.target.value)}
                    sx={{ my: 1.5, flexShrink: 0, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                  />
                  <Divider sx={{ mb: 1, opacity: 0.3, flexShrink: 0 }} />
                  <List sx={scrollableListStyle}>
                    {filteredDepCreate.map((dep) => {
                      const isSelected = newDepId === dep.depid
                      return (
                        <ListItem key={dep.depid} disablePadding sx={{ mb: 1 }}>
                          <ListItemButton 
                            onClick={() => setNewDepId(dep.depid)}
                            sx={{ 
                              borderRadius: 2, border: '1px solid',
                              borderColor: isSelected ? 'primary.main' : (theme) => alpha(theme.palette.divider, 0.1),
                              bgcolor: isSelected ? (theme) => alpha(theme.palette.primary.main, 0.1) : 'transparent',
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <ListItemText primary={dep.name} primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500 }} />
                          </ListItemButton>
                        </ListItem>
                      )
                    })}
                  </List>
                </Box>
              </Grid>

              {/* Roles Selection */}
              <Grid item xs={12} md={6}>
                <Box sx={{ ...glassPanelStyle, width: 250 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="overline" color="text.secondary" fontWeight="bold">SELECT ROLES</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>({newRoles.length} selected)</Typography>
                  </Stack>
                  <TextField 
                    fullWidth 
                    size="small" 
                    placeholder="Search roles..." 
                    value={roleSearchCreate}
                    onChange={(e) => setRoleSearchCreate(e.target.value)}
                    sx={{ my: 1.5, flexShrink: 0, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                  />
                  <Divider sx={{ mb: 1, opacity: 0.3, flexShrink: 0 }} />
                  <List sx={scrollableListStyle}>
                    {filteredRoleCreate.map((role) => {
                      const isSelected = newRoles.includes(role.roleid)
                      return (
                        <ListItem key={role.roleid} disablePadding sx={{ mb: 1 }}>
                          <ListItemButton 
                            onClick={() => toggleCreateRole(role.roleid)}
                            sx={{ 
                              borderRadius: 2, border: '1px solid',
                              borderColor: isSelected ? 'primary.main' : (theme) => alpha(theme.palette.divider, 0.1),
                              bgcolor: isSelected ? (theme) => alpha(theme.palette.primary.main, 0.1) : 'transparent',
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <ListItemText primary={role.name} primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500 }} />
                          </ListItemButton>
                        </ListItem>
                      )
                    })}
                  </List>
                </Box>
              </Grid>

              {/* Groups Selection */}
              <Grid item xs={12} md={6}>
                <Box sx={{ ...glassPanelStyle, width: 250 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="overline" color="text.secondary" fontWeight="bold">SELECT USER GROUPS</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>({newGroups.length} selected)</Typography>
                  </Stack>
                  <TextField 
                    fullWidth 
                    size="small" 
                    placeholder="Search groups..." 
                    value={groupSearchCreate}
                    onChange={(e) => setGroupSearchCreate(e.target.value)}
                    sx={{ my: 1.5, flexShrink: 0, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                  />
                  <Divider sx={{ mb: 1, opacity: 0.3, flexShrink: 0 }} />
                  <List sx={scrollableListStyle}>
                    {filteredGroupCreate.map((group) => {
                      const isSelected = newGroups.includes(group.grid)
                      return (
                        <ListItem key={group.grid} disablePadding sx={{ mb: 1 }}>
                          <ListItemButton 
                            onClick={() => toggleCreateGroup(group.grid)}
                            sx={{ 
                              borderRadius: 2, border: '1px solid',
                              borderColor: isSelected ? 'secondary.main' : (theme) => alpha(theme.palette.divider, 0.1),
                              bgcolor: isSelected ? (theme) => alpha(theme.palette.secondary.main, 0.1) : 'transparent',
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <ListItemText primary={group.name} primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500 }} />
                          </ListItemButton>
                        </ListItem>
                      )
                    })}
                  </List>
                </Box>
              </Grid>

            </Grid>
          </Box>
        </Box>
      </Modal>

      {/* EDIT EMPLOYEE MODAL */}
      <Modal open={!!selectedEmployee} onClose={() => setSelectedEmployee(null)}>
        <Box sx={{ 
          ...glassModalStyle, 
          width: 1200, 
          maxWidth: '95vw',
          p: 0,
          display: 'flex', 
          flexDirection: 'column', 
          maxHeight: '95vh',
          overflow: 'hidden'
        }}>
          <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: (theme) => alpha(theme.palette.divider, 0.1) }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              MANAGE EMPLOYEE: {selectedEmployee?.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="outlined" size="small" onClick={handleOpenChangeDep} sx={{ textTransform: 'none', borderRadius: 2 }}>Change Department</Button>
              <Button color="error" size="small" onClick={handleDeleteEmployee} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
              <IconButton onClick={() => setSelectedEmployee(null)} size="small" sx={{ color: 'text.primary' }}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Box>
          
          <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1 }}>
            <Grid container spacing={3} alignItems="stretch" justifyContent="center">
              
              {/* ROLES ROW */}
              <Grid item xs={12} md={6}>
                <Box sx={glassPanelStyle}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="overline" color="text.secondary" fontWeight="bold">ASSIGNED ROLES</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>({assignedRoles.length})</Typography>
                  </Stack>
                  <Divider sx={{ my: 1, opacity: 0.3 }} />
                  
                  {modalLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, flexGrow: 1 }}><CircularProgress size={24} /></Box> : (
                    <List sx={scrollableListStyle}>
                      {assignedRoles.map((role) => (
                        <ListItem key={role.roleid} disableGutters sx={{ borderBottom: '1px solid', borderColor: (theme) => alpha(theme.palette.divider, 0.05) }}>
                          <ListItemText primary={role.name} primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }} />
                          <Button size="small" color="error" variant="outlined" onClick={() => handleRemoveRole(role.roleid)} sx={{ borderRadius: 2, textTransform: 'none', ml: 1 }}>
                            Remove
                          </Button>
                        </ListItem>
                      ))}
                      {assignedRoles.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No roles assigned.</Typography>}
                    </List>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={glassPanelStyle}>
                  <Typography variant="overline" color="text.secondary" fontWeight="bold">AVAILABLE ROLES</Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    placeholder="Search roles..." 
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    sx={{ my: 1.5, flexShrink: 0, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                    }}
                  />
                  <Divider sx={{ mb: 1, opacity: 0.3, flexShrink: 0 }} />
                  
                  {modalLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, flexGrow: 1 }}><CircularProgress size={24} /></Box> : (
                    <List sx={scrollableListStyle}>
                      {filteredAvRoles.map((role) => (
                        <ListItem key={role.roleid} disableGutters sx={{ borderBottom: '1px solid', borderColor: (theme) => alpha(theme.palette.divider, 0.05) }}>
                          <ListItemText primary={role.name} primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }} />
                          <Button size="small" color="primary" variant="contained" disableElevation onClick={() => handleAddRole(role.roleid)} sx={{ borderRadius: 2, textTransform: 'none', ml: 1 }}>
                            Assign
                          </Button>
                        </ListItem>
                      ))}
                      {filteredAvRoles.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No available roles match.</Typography>}
                    </List>
                  )}
                </Box>
              </Grid>

              {/* GROUPS ROW */}
              <Grid item xs={12} md={6}>
                <Box sx={glassPanelStyle}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="overline" color="text.secondary" fontWeight="bold">ASSIGNED USER GROUPS</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>({assignedGroups.length})</Typography>
                  </Stack>
                  <Divider sx={{ my: 1, opacity: 0.3 }} />
                  
                  {modalLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, flexGrow: 1 }}><CircularProgress size={24} /></Box> : (
                    <List sx={scrollableListStyle}>
                      {assignedGroups.map((group) => (
                        <ListItem key={group.grid} disableGutters sx={{ borderBottom: '1px solid', borderColor: (theme) => alpha(theme.palette.divider, 0.05) }}>
                          <ListItemText primary={group.name} primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }} />
                          <Button size="small" color="error" variant="outlined" onClick={() => handleRemoveGroup(group.grid)} sx={{ borderRadius: 2, textTransform: 'none', ml: 1 }}>
                            Remove
                          </Button>
                        </ListItem>
                      ))}
                      {assignedGroups.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No groups assigned.</Typography>}
                    </List>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={glassPanelStyle}>
                  <Typography variant="overline" color="text.secondary" fontWeight="bold">AVAILABLE USER GROUPS</Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    placeholder="Search user groups..." 
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    sx={{ my: 1.5, flexShrink: 0, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3) } }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                    }}
                  />
                  <Divider sx={{ mb: 1, opacity: 0.3, flexShrink: 0 }} />
                  
                  {modalLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, flexGrow: 1 }}><CircularProgress size={24} /></Box> : (
                    <List sx={scrollableListStyle}>
                      {filteredAvGroups.map((group) => (
                        <ListItem key={group.grid} disableGutters sx={{ borderBottom: '1px solid', borderColor: (theme) => alpha(theme.palette.divider, 0.05) }}>
                          <ListItemText primary={group.name} primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }} />
                          <Button size="small" color="primary" variant="contained" disableElevation onClick={() => handleAddGroup(group.grid)} sx={{ borderRadius: 2, textTransform: 'none', ml: 1 }}>
                            Assign
                          </Button>
                        </ListItem>
                      ))}
                      {filteredAvGroups.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No available groups match.</Typography>}
                    </List>
                  )}
                </Box>
              </Grid>

            </Grid>
          </Box>
        </Box>
      </Modal>

      {/* CREATE DEPARTMENT MODAL */}
      <Modal open={isCreateDepOpen} onClose={() => setIsCreateDepOpen(false)}>
        <Box sx={{ ...glassModalStyle, width: 800, maxWidth: '70vw', p: 0, display: 'flex', flexDirection: 'column', maxHeight: '95vh', overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: (theme) => alpha(theme.palette.divider, 0.1) }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>CREATE NEW DEPARTMENT</Typography>
            <IconButton onClick={() => setIsCreateDepOpen(false)} size="small"><CloseIcon /></IconButton>
          </Box>
          <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1 }}>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ ...glassPanelStyle, gap: 2 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight="bold">DETAILS</Typography>
                  <Divider sx={{ opacity: 0.3 }} />
                  <TextField label="Department Name" fullWidth required value={newDepName} onChange={(e) => setNewDepName(e.target.value)} />
                  <Box sx={{ flexGrow: 1 }} />
                  <Button variant="contained" color="primary" size="large" fullWidth disabled={isCreatingDep || !newDepName || !newDepLid} onClick={handleCreateDepartment} sx={{ borderRadius: 2, fontWeight: 'bold' }}>
                    {isCreatingDep ? <CircularProgress size={24} /> : 'Create Department'}
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={glassPanelStyle}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="overline" color="text.secondary" fontWeight="bold">SELECT LOCATION</Typography>
                    {newDepLid && <Chip label="Selected" size="small" color="success" />}
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ my: 1.5, flexShrink: 0 }}>
                    <TextField fullWidth size="small" placeholder="Search..." value={locationSearchCreate} onChange={(e) => setLocationSearchCreate(e.target.value)} />
                    <Button variant="contained" color="primary" onClick={() => setIsLocationModalOpen(true)} sx={{ minWidth: '40px', px: 0, borderRadius: 2 }}><AddIcon /></Button>
                  </Stack>
                  <Divider sx={{ mb: 1, opacity: 0.3, flexShrink: 0 }} />
                  <List sx={scrollableListStyle}>
                    {filteredLocationsCreate.map((loc) => {
                      const isSelected = newDepLid === loc.lid
                      return (
                        <ListItem key={loc.lid} disablePadding sx={{ mb: 1 }}>
                          <ListItemButton onClick={() => setNewDepLid(loc.lid)} sx={{ borderRadius: 2, border: '1px solid', borderColor: isSelected ? 'primary.main' : 'transparent', bgcolor: isSelected ? alpha('#1976d2', 0.1) : 'transparent' }}>
                            <ListItemText primary={loc.address} secondary={loc.country} primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500 }} />
                          </ListItemButton>
                        </ListItem>
                      )
                    })}
                  </List>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Modal>

      {/* CREATE ROLE MODAL */}
      <Modal open={isCreateRoleOpen} onClose={() => setIsCreateRoleOpen(false)}>
        <Box sx={{ ...glassModalStyle, width: 450, maxWidth: '90vw' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">Add New Role</Typography>
            <IconButton onClick={() => setIsCreateRoleOpen(false)} size="small"><CloseIcon /></IconButton>
          </Box>
          <Stack spacing={3}>
            <TextField label="Role Name" fullWidth required value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} />
            <Button variant="contained" color="primary" size="large" disabled={isCreatingRole || !newRoleName} onClick={handleCreateRole} sx={{ borderRadius: 2, fontWeight: 'bold' }}>
              {isCreatingRole ? <CircularProgress size={24} /> : 'Save Role'}
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* CREATE GROUP MODAL */}
      <Modal open={isCreateGroupOpen} onClose={() => setIsCreateGroupOpen(false)}>
        <Box sx={{ ...glassModalStyle, width: 450, maxWidth: '90vw' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">Add New Group</Typography>
            <IconButton onClick={() => setIsCreateGroupOpen(false)} size="small"><CloseIcon /></IconButton>
          </Box>
          <Stack spacing={3}>
            <TextField label="Group Name" fullWidth required value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
            <Button variant="contained" color="primary" size="large" disabled={isCreatingGroup || !newGroupName} onClick={handleCreateGroup} sx={{ borderRadius: 2, fontWeight: 'bold' }}>
              {isCreatingGroup ? <CircularProgress size={24} /> : 'Save Group'}
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* CREATE LOCATION MODAL (STACKED) */}
      <Modal open={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)}>
        <Box sx={{ ...glassModalStyle, width: 450, maxWidth: '90vw' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">Add New Location</Typography>
            <IconButton onClick={() => setIsLocationModalOpen(false)} size="small"><CloseIcon /></IconButton>
          </Box>
          <Stack spacing={3}>
            <TextField label="Address" fullWidth required value={newLocationAddress} onChange={(e) => setNewLocationAddress(e.target.value)} />
            <TextField label="Country (Optional)" fullWidth value={newLocationCountry} onChange={(e) => setNewLocationCountry(e.target.value)} />
            <Button variant="contained" color="primary" size="large" disabled={isCreatingLocation || !newLocationAddress} onClick={handleCreateLocation} sx={{ borderRadius: 2, fontWeight: 'bold' }}>
              {isCreatingLocation ? <CircularProgress size={24} /> : 'Save Location'}
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* CHANGE DEPARTMENT MODAL (STACKED) */}
      <Modal open={isChangeDepOpen} onClose={() => setIsChangeDepOpen(false)}>
        <Box sx={{ ...glassModalStyle, width: 450, maxWidth: '90vw', display: 'flex', flexDirection: 'column', p: 0 }}>
          <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: (theme) => alpha(theme.palette.divider, 0.1) }}>
            <Typography variant="h6" fontWeight="bold">Change Department</Typography>
            <IconButton onClick={() => setIsChangeDepOpen(false)} size="small"><CloseIcon /></IconButton>
          </Box>
          <Box sx={{ p: 3 }}>
            <TextField fullWidth size="small" placeholder="Search departments..." value={changeDepSearch} onChange={(e) => setChangeDepSearch(e.target.value)} sx={{ mb: 2 }} />
            <List sx={{ maxHeight: 200, overflowY: 'auto', mb: 3 }}>
              {filteredChangeDep.map((dep) => {
                const isSelected = selectedNewDepId === dep.depid
                return (
                  <ListItem key={dep.depid} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton onClick={() => setSelectedNewDepId(dep.depid)} sx={{ borderRadius: 2, border: '1px solid', borderColor: isSelected ? 'primary.main' : 'transparent', bgcolor: isSelected ? alpha('#1976d2', 0.1) : 'transparent' }}>
                      <ListItemText primary={dep.name} primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500 }} />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
            <Button variant="contained" color="primary" fullWidth disabled={!selectedNewDepId || isChangingDep} onClick={handleChangeDepartment} sx={{ borderRadius: 2, fontWeight: 'bold' }}>
              {isChangingDep ? <CircularProgress size={24} /> : 'Confirm Change'}
            </Button>
          </Box>
        </Box>
      </Modal>

    </LiquidWrapper>
  )
}

export default Employees

import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Chip,
  TextField,
  Button,
  Stack,
  Divider
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useNotification } from '../context/NotificationContext'
import { LiquidWrapper, GlassPanel } from './GlassUI'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  
  // Data States
  const [occupationStatus, setOccupationStatus] = useState<any[]>([])
  const [countryCoverage, setCountryCoverage] = useState<any[]>([])
  const [upcomingProjects, setUpcomingProjects] = useState<any[]>([])
  const [currentProjects, setCurrentProjects] = useState<any[]>([])
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([])
  const [investors, setInvestors] = useState<any[]>([])
  const [projectsByEmp, setProjectsByEmp] = useState<any[]>([])

  // Form States
  const [minInvestment, setMinInvestment] = useState<number | string>(1000)
  const [minEmployees, setMinEmployees] = useState<number | string>(1)

  const { showNotification } = useNotification()
  const getRole = () => localStorage.getItem('appRole') || 'ADMIN'

  // Helper to extract Postgres errors passed through Express
  const handleResponse = async (res: Response) => {
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to fetch data')
    return data
  }

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const headers = { 'x-role': getRole() }
      
      const [occRes, covRes, upRes, curRes, availRes] = await Promise.all([
        fetch('/api/query/occupation-status', { headers }),
        fetch('/api/query/country-coverage', { headers }),
        fetch('/api/query/upcoming-projects', { headers }),
        fetch('/api/query/current-projects', { headers }),
        fetch('/api/query/available-employees', { headers })
      ])

      setOccupationStatus(await handleResponse(occRes))
      setCountryCoverage(await handleResponse(covRes))
      setUpcomingProjects(await handleResponse(upRes))
      setCurrentProjects(await handleResponse(curRes))
      setAvailableEmployees(await handleResponse(availRes))
    } catch (err: any) {
      showNotification(err.message)
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  const fetchInvestors = useCallback(async () => {
    try {
      const res = await fetch('/api/query/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': getRole() },
        body: JSON.stringify({ number: Number(minInvestment) || 0 })
      })
      setInvestors(await handleResponse(res))
    } catch (err: any) {
      showNotification(err.message)
      setInvestors([]) // Clear data on access denied
    }
  }, [minInvestment, showNotification])

  const fetchProjectsByEmp = useCallback(async () => {
    try {
      const res = await fetch('/api/query/projects-by-employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': getRole() },
        body: JSON.stringify({ number: Number(minEmployees) || 0 })
      })
      setProjectsByEmp(await handleResponse(res))
    } catch (err: any) {
      showNotification(err.message)
      setProjectsByEmp([]) // Clear data on access denied
    }
  }, [minEmployees, showNotification])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  useEffect(() => {
    fetchInvestors()
  }, [fetchInvestors])

  useEffect(() => {
    fetchProjectsByEmp()
  }, [fetchProjectsByEmp])

  const tableHeaderStyle = { 
    fontWeight: 'bold', 
    bgcolor: (theme: any) => alpha(theme.palette.background.paper, 0.8), 
    backdropFilter: 'blur(10px)' 
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress />
    </Box>
  )

  return (
    <LiquidWrapper>
      <Grid container spacing={3}>
        
        {/* OCCUPATION STATUS */}
        <Grid item xs={12}>
          <GlassPanel>
            <Typography variant="overline" color="text.secondary" fontWeight="bold" sx={{ px: 2, pt: 2, display: 'block' }}>
              Occupation Status
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeaderStyle}>Employee</TableCell>
                    <TableCell sx={tableHeaderStyle}>Project</TableCell>
                    <TableCell sx={tableHeaderStyle}>Customer</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {occupationStatus.map((row, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{row.employee_name}</TableCell>
                      <TableCell>{row.project_name}</TableCell>
                      <TableCell>{row.customer_name}</TableCell>
                    </TableRow>
                  ))}
                  {occupationStatus.length === 0 && (
                    <TableRow><TableCell colSpan={3} align="center">No data found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassPanel>
        </Grid>

        {/* COUNTRY COVERAGE */}
        <Grid item xs={12}>
          <GlassPanel sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 1 }}>
              Country Coverage
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {countryCoverage.map((row, idx) => (
                <Chip key={idx} label={row.country} color="primary" variant="outlined" />
              ))}
              {countryCoverage.length === 0 && <Typography variant="caption" color="text.secondary">No countries found</Typography>}
            </Box>
          </GlassPanel>
        </Grid>

        {/* CURRENT & UPCOMING PROJECTS */}
        <Grid item xs={12} md={6}>
          <GlassPanel>
            <Typography variant="overline" color="text.secondary" fontWeight="bold" sx={{ px: 2, pt: 2, display: 'block' }}>
              Current Projects
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeaderStyle}>Name</TableCell>
                    <TableCell sx={tableHeaderStyle}>Budget</TableCell>
                    <TableCell sx={tableHeaderStyle}>Start Date</TableCell>
                    <TableCell sx={tableHeaderStyle}>Deadline</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentProjects.map((row, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>${Number(row.budget).toLocaleString()}</TableCell>
                      <TableCell>{row.startdate ? new Date(row.startdate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{row.deadline ? new Date(row.deadline).toLocaleDateString() : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                  {currentProjects.length === 0 && (
                    <TableRow><TableCell colSpan={4} align="center">No current projects</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassPanel>
        </Grid>

        <Grid item xs={12} md={6}>
          <GlassPanel>
            <Typography variant="overline" color="text.secondary" fontWeight="bold" sx={{ px: 2, pt: 2, display: 'block' }}>
              Upcoming Projects
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeaderStyle}>Name</TableCell>
                    <TableCell sx={tableHeaderStyle}>Budget</TableCell>
                    <TableCell sx={tableHeaderStyle}>Start Date</TableCell>
                    <TableCell sx={tableHeaderStyle}>Deadline</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingProjects.map((row, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>${Number(row.budget).toLocaleString()}</TableCell>
                      <TableCell>{row.startdate ? new Date(row.startdate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{row.deadline ? new Date(row.deadline).toLocaleDateString() : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                  {upcomingProjects.length === 0 && (
                    <TableRow><TableCell colSpan={4} align="center">No upcoming projects</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassPanel>
        </Grid>

        {/* AVAILABLE EMPLOYEES */}
        <Grid item xs={12}>
          <GlassPanel>
            <Typography variant="overline" color="text.secondary" fontWeight="bold" sx={{ px: 2, pt: 2, display: 'block' }}>
              Available Employees
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeaderStyle}>Emp ID</TableCell>
                    <TableCell sx={tableHeaderStyle}>Name</TableCell>
                    <TableCell sx={tableHeaderStyle}>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableEmployees.map((row, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{row.empid}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                    </TableRow>
                  ))}
                  {availableEmployees.length === 0 && (
                    <TableRow><TableCell colSpan={3} align="center">No available employees</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassPanel>
        </Grid>

        {/* PARAMETERIZED QUERIES */}
        <Grid item xs={12} md={6}>
          <GlassPanel sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">
                Investors
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField 
                  size="small" 
                  type="number" 
                  label="Min Investment" 
                  value={minInvestment} 
                  onChange={(e) => setMinInvestment(e.target.value)} 
                  sx={{ width: 140 }}
                />
                <Button variant="contained" onClick={fetchInvestors}>Apply</Button>
              </Stack>
            </Stack>
            <Divider sx={{ mb: 1, opacity: 0.3 }} />
            <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 250 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeaderStyle}>Customer Name</TableCell>
                    <TableCell sx={tableHeaderStyle} align="right">Total Investment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {investors.map((row, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right">${Number(row.total_investment).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {investors.length === 0 && (
                    <TableRow><TableCell colSpan={2} align="center">No investors match</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </GlassPanel>
        </Grid>

        <Grid item xs={12} md={6}>
          <GlassPanel sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">
                Projects by Employees
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField 
                  size="small" 
                  type="number" 
                  label="Min Employees" 
                  value={minEmployees} 
                  onChange={(e) => setMinEmployees(e.target.value)} 
                  sx={{ width: 140 }}
                />
                <Button variant="contained" onClick={fetchProjectsByEmp}>Apply</Button>
              </Stack>
            </Stack>
            <Divider sx={{ mb: 1, opacity: 0.3 }} />
            <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 250 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeaderStyle}>Project Name</TableCell>
                    <TableCell sx={tableHeaderStyle} align="right">Assigned Employees</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectsByEmp.map((row, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{row.project_name}</TableCell>
                      <TableCell align="right">{row.assigned_empoyees}</TableCell>
                    </TableRow>
                  ))}
                  {projectsByEmp.length === 0 && (
                    <TableRow><TableCell colSpan={2} align="center">No projects match</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </GlassPanel>
        </Grid>

      </Grid>
    </LiquidWrapper>
  )
}

export default Dashboard

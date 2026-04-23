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
  CircularProgress,
  Divider,
  Stack,
  Chip
} from '@mui/material'
import { useNotification } from '../context/NotificationContext'
import { Project, Employee } from '../types/schema'
import { LiquidWrapper, GlassCard, glassModalStyle } from './GlassUI'

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const { showNotification } = useNotification()

  const getRole = () => localStorage.getItem('appRole') || 'ADMIN'

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:1234/api/project/getAll', {
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

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleCardClick = async (project: Project) => {
    setSelectedProject(project)
    setEmployeesLoading(true)
    try {
      const response = await fetch(`http://localhost:1234/api/project/${project.prid}/employees`, {
        headers: { 'x-role': getRole() }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch employees')
      setEmployees(data)
    } catch (err: any) {
      showNotification(err.message)
      setSelectedProject(null)
    } finally {
      setEmployeesLoading(false)
    }
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress />
    </Box>
  )

  return (
    <LiquidWrapper>
      <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold', mb: 4 }}>
        Projects
      </Typography>
      
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
                        {new Date(project.startdate).toLocaleDateString()} - {new Date(project.deadline).toLocaleDateString()}
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" sx={{ fontWeight: 600, flexGrow: 1 }}>Budget:</Typography>
                      <Chip 
                        label={`$${Number(project.budget).toLocaleString()}`} 
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

      <Modal open={!!selectedProject} onClose={() => setSelectedProject(null)}>
        <Box sx={glassModalStyle}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            Employees: {selectedProject?.name}
          </Typography>
          <Divider sx={{ mb: 2, opacity: 0.3 }} />
          
          {employeesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={24} /></Box>
          ) : (
            <List>
              {employees.length > 0 ? employees.map((emp) => (
                <ListItem key={emp.empid} disableGutters>
                  <ListItemText 
                    primary={emp.name} 
                    secondary={emp.email}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
              )) : <Typography variant="body2" color="text.secondary">No assignments found.</Typography>}
            </List>
          )}
        </Box>
      </Modal> 
    </LiquidWrapper>
  )
}

export default Dashboard

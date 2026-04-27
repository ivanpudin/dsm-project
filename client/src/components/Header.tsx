import * as React from 'react'
import { Link } from 'react-router-dom'
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Menu, 
  Container, 
  Button, 
  MenuItem, 
  IconButton 
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { useColorMode } from '../context/ThemeContext'


/**
 * Global navigation and app controls
 * Renders the top AppBar containing the application logo, navigation links,
 * theme toggle and database role access control.
 */


const DATABASE_ROLES = [
  { code: 'ADMIN', label: 'Admin' },
  { code: 'ALICE', label: 'Alice' },
  { code: 'BOB', label: 'Bob' },
]

function Header() {
  const theme = useTheme()
  const colorMode = useColorMode()

  const [anchorElRole, setAnchorElRole] = React.useState<null | HTMLElement>(null)

  const [selectedRole, setSelectedRole] = React.useState<string>(
    localStorage.getItem('appRole') || "ADMIN"
  )

  const handleOpenRoleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElRole(event.currentTarget)
  }

  const handleCloseRoleMenu = () => {
    setAnchorElRole(null)
  }

  const handleRoleSelect = (code: string) => {
    setSelectedRole(code)
    localStorage.setItem('appRole', code)
    window.location.reload()
    handleCloseRoleMenu()
  }

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: 'flex',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.08rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            BiDi
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-start', ml: { xs: 0, md: 2 } }}>
            <Button
              key="Home"
              component={Link}
              to="/"
              sx={{ my: 2, color: 'white', display: 'block', textTransform: 'none' }}
            >
              Projects
            </Button>
            <Button
              key="Queries"
              component={Link}
              to="/queries"
              sx={{ my: 2, color: 'white', display: 'block', textTransform: 'none' }}
            >
              SQL
            </Button>
          </Box>

          <Box>
            <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 0, ml: 1 }}>
            <Button
              onClick={handleOpenRoleMenu}
              sx={{ p: 0, color: 'white', textTransform: 'none' }}
              endIcon={<ArrowDropDownIcon />}
            >
              {selectedRole}
            </Button>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-language-switcher"
              anchorEl={anchorElRole}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElRole)}
              onClose={handleCloseRoleMenu}
            >
              {DATABASE_ROLES.map((role) => (
                <MenuItem
                  key={role.code}
                  onClick={() => handleRoleSelect(role.code)}
                  selected={role.code === selectedRole}
                >
                  <Typography sx={{ textAlign: 'center' }}>{role.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
export default Header

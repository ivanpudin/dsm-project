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
import MenuIcon from '@mui/icons-material/Menu'
import { useColorMode } from '../context/ThemeContext'

const DATABASE_ROLES = [
  { code: 'ADMIN', label: 'Admin' },
  { code: 'ALICE', label: 'Alice' },
  { code: 'BOB', label: 'Bob' }
]

const PAGES = [
  { label: 'Dashboard', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Customers', path: '/customers' },
  { label: 'Employees', path: '/employees' }
]

function Header() {
  const theme = useTheme()
  const colorMode = useColorMode()

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null)
  const [anchorElRole, setAnchorElRole] = React.useState<null | HTMLElement>(null)

  const [selectedRole, setSelectedRole] = React.useState<string>(
    localStorage.getItem('appRole') || "ADMIN"
  )

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleOpenRoleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElRole(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
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
          {/* DESKTOP LOGO */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', sm: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.08rem',
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            BiDi
          </Typography>

          {/* MOBILE NAV MENU */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', sm: 'none' } }}>
            <IconButton
              size="large"
              aria-label="open navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', sm: 'none' }
              }}
            >
              {PAGES.map((page) => (
                <MenuItem 
                  key={page.label} 
                  component={Link} 
                  to={page.path} 
                  onClick={handleCloseNavMenu}
                >
                  <Typography textAlign="center">{page.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* MOBILE LOGO */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', sm: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.08rem',
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            BiDi
          </Typography>

          {/* DESKTOP NAV LINKS */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' }, ml: 2 }}>
            {PAGES.map((page) => (
              <Button
                key={page.label}
                component={Link}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block', textTransform: 'none' }}
              >
                {page.label}
              </Button>
            ))}
          </Box>

          {/* CONTROLS */}
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
              id="menu-role-switcher"
              anchorEl={anchorElRole}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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

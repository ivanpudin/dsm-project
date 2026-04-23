import { Box, Card, type CardProps } from '@mui/material'
import { alpha } from '@mui/material/styles'
import type { ReactNode } from 'react'

export const LiquidWrapper = ({ children }: { children: ReactNode }) => (
  <Box sx={{ 
    p: { xs: 2, md: 4 }, 
    position: 'relative', 
    overflow: 'hidden',
    minHeight: 'calc(100vh - 69px)',
    zIndex: 0
  }}>
    {/* Background Blobs */}
    {[
      { top: '5%', left: '0%', color: 'primary.main', size: '45vw', blur: '100px', op: 0.6 },
      { bottom: '5%', right: '0%', color: 'secondary.main', size: '40vw', blur: '120px', op: 0.5 }
    ].map((blob, i) => (
      <Box key={i} sx={{
        position: 'absolute',
        top: blob.top,
        left: blob.left,
        right: blob.right,
        bottom: blob.bottom,
        width: blob.size,
        height: blob.size,
        bgcolor: blob.color,
        borderRadius: '50%',
        filter: `blur(${blob.blur})`,
        opacity: (theme) => theme.palette.mode === 'light' ? blob.op : blob.op / 2,
        zIndex: -1,
        transform: blob.left ? 'translate(-10%, -10%)' : 'translate(10%, 10%)'
      }} />
    ))}
    {children}
  </Box>
)

export const GlassCard = (props: CardProps) => (
  <Card 
    {...props}
    sx={{ 
      bgcolor: (theme) => theme.palette.mode === 'light' 
        ? alpha(theme.palette.background.paper, 0.5) 
        : alpha(theme.palette.background.paper, 0.2),
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      height: '100%',
      borderRadius: 4,
      border: '1px solid',
      borderColor: (theme) => theme.palette.mode === 'light' 
        ? 'rgba(255, 255, 255, 0.7)' 
        : alpha(theme.palette.divider, 0.2),
      boxShadow: (theme) => theme.palette.mode === 'light' 
        ? '0 8px 32px rgba(31, 38, 135, 0.08)' 
        : '0 8px 32px rgba(0, 0, 0, 0.2)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: (theme) => theme.palette.mode === 'light'
          ? `0 16px 48px ${alpha(theme.palette.primary.main, 0.15)}`
          : `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
        borderColor: (theme) => theme.palette.mode === 'light'
          ? 'rgba(255, 255, 255, 1)'
          : alpha(theme.palette.primary.main, 0.4)
      },
      ...props.sx 
    }}
  />
)

export const glassModalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: (theme: any) => theme.palette.mode === 'light' 
    ? alpha(theme.palette.background.paper, 0.8) 
    : alpha(theme.palette.background.paper, 0.4),
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: (theme: any) => theme.palette.mode === 'light' 
    ? 'rgba(255, 255, 255, 0.8)' 
    : alpha(theme.palette.divider, 0.3),
  borderRadius: 4,
  boxShadow: (theme: any) => theme.palette.mode === 'light' 
    ? '0 24px 48px rgba(31, 38, 135, 0.15)' 
    : '0 24px 48px rgba(0,0,0,0.4)',
  p: 4
}

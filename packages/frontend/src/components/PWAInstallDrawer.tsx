import React from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from './ui/drawer'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
  Smartphone,
  Chrome,
  Globe,
  Download,
  MoreVertical,
  Share,
  Plus,
  Menu
} from 'lucide-react'

interface PWAInstallDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface BrowserInstruction {
  name: string
  icon: React.ReactNode
  steps: (string | React.ReactNode)[]
  badge?: string
}

export function PWAInstallDrawer({ open, onOpenChange }: PWAInstallDrawerProps) {
  const getBrowserInstructions = (): BrowserInstruction[] => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    const instructions: BrowserInstruction[] = []
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      instructions.push({
        name: 'Chrome',
        icon: <Chrome className="h-5 w-5" />,
        badge: 'Recommended',
        steps: [
          <>Look for the install icon <Download className="inline h-3 w-3 mx-1" /> in the address bar</>,
          <>Or click the three dots menu <MoreVertical className="inline h-3 w-3 mx-1" /> → "Install app"</>,
          'Click "Install" in the popup dialog',
          'The app will be added to your desktop/home screen'
        ]
      })
    }
    
    if (userAgent.includes('edg')) {
      instructions.push({
        name: 'Microsoft Edge',
        icon: <Globe className="h-5 w-5" />,
        badge: 'Recommended',
        steps: [
          <>Look for the install icon <Download className="inline h-3 w-3 mx-1" /> in the address bar</>,
          <>Or click the three dots menu <MoreVertical className="inline h-3 w-3 mx-1" /> → "Apps" → "Install this site as an app"</>,
          'Click "Install" in the popup dialog',
          'The app will be added to your desktop/start menu'
        ]
      })
    }
    
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      instructions.push({
        name: 'Safari',
        icon: <Globe className="h-5 w-5" />,
        steps: [
          <>Tap the Share button <Share className="inline h-3 w-3 mx-1" /> at the bottom of the screen</>,
          <>Scroll down and tap <Plus className="inline h-3 w-3 mx-1" /> "Add to Home Screen"</>,
          'Edit the name if desired, then tap "Add"',
          'The app icon will appear on your home screen'
        ]
      })
    }
    
    if (userAgent.includes('firefox')) {
      instructions.push({
        name: 'Firefox',
        icon: <Globe className="h-5 w-5" />,
        steps: [
          'Firefox has limited PWA support',
          'You can bookmark this page for quick access',
          'Consider using Chrome or Edge for the full PWA experience'
        ]
      })
    }
    
    // Fallback for other browsers
    if (instructions.length === 0) {
      instructions.push({
        name: 'Your Browser',
        icon: <Globe className="h-5 w-5" />,
        steps: [
          <>Look for an "Install app" option in your browser menu <Menu className="inline h-3 w-3 mx-1" /></>,
          <>Check the address bar for an install icon <Download className="inline h-3 w-3 mx-1" /></>,
          'Some browsers may not support PWA installation',
          'Try using Chrome or Edge for the best experience'
        ]
      })
    }
    
    return instructions
  }

  const instructions = getBrowserInstructions()

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="text-center">
          <DrawerTitle className="flex items-center justify-center gap-2">
            <Smartphone className="h-5 w-5" />
            Install PWA App
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 pb-4 space-y-4">
          {/* Instructions Section */}
          <div className="space-y-4">
            {instructions.map((instruction, index) => (
              <div key={index} className="space-y-3 p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2">
                  {instruction.icon}
                  <span className="font-medium">{instruction.name}</span>
                  {instruction.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {instruction.badge}
                    </Badge>
                  )}
                </div>
                
                <ol className="space-y-2">
                  {instruction.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                        {stepIndex + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Got it, thanks!
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

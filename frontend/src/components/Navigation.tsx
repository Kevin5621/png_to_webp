'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileImage, FileVideo, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

const navigationItems = [
  {
    title: 'Home',
    href: '/',
    description: 'PNG to WebP converter',
    icon: Home,
    isActive: (pathname: string) => pathname === '/',
  },
  {
    title: 'Image Converter',
    href: '/',
    description: 'Convert PNG images to WebP format',
    icon: FileImage,
    isActive: (pathname: string) => pathname === '/',
  },
  {
    title: 'Video Converter',
    href: '/mp4-to-webm',
    description: 'Convert MP4 videos to WebM format',
    icon: FileVideo,
    isActive: (pathname: string) => pathname === '/mp4-to-webm',
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = item.isActive(pathname)
          
          return (
            <NavigationMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    'flex items-center gap-2 px-4 py-2',
                    isActive && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function NavigationDropdown() {
  const pathname = usePathname()

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            Converters
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {navigationItems.slice(1).map((item) => {
                const Icon = item.icon
                const isActive = item.isActive(pathname)
                
                return (
                  <li key={item.href}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                          isActive && 'bg-accent text-accent-foreground'
                        )}
                      >
                        <div className="flex items-center gap-2 text-sm font-medium leading-none">
                          <Icon className="h-4 w-4" />
                          {item.title}
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          {item.description}
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                )
              })}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

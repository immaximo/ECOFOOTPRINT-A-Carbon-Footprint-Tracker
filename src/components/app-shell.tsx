
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ClipboardPenLine,
  LayoutDashboard,
  PanelLeft,
  LogOut,
  LogIn,
  FileDown,
  History,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Logo } from './icons/logo';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Explicitly push to the login page after sign out to ensure redirection
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const userProfile = isUserLoading ? (
    <div className="flex items-center gap-2">
      <Avatar className="size-8">
        <AvatarFallback>...</AvatarFallback>
      </Avatar>
    </div>
  ) : user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="size-8">
            {user.photoURL && (
              <AvatarImage
                src={user.photoURL}
                alt={user.displayName || user.email || 'User'}
              />
            )}
            <AvatarFallback>
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName || user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button asChild size="sm">
      <Link href="/login">
        <LogIn className="mr-2" />
        Login
      </Link>
    </Button>
  );

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo />
            <h1 className="text-2xl font-semibold font-headline text-sidebar-foreground group-data-[state=collapsed]:hidden">
              EcoFootprint
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex-1">
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/'}
                  tooltip="Dashboard"
                  size="lg"
                >
              <Link href="/">
                  <LayoutDashboard />
                  <span className="group-data-[state=collapsed]:hidden">Dashboard</span>
              </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/data-input'}
                  tooltip="Data Input"
                  size="lg"
                >
              <Link href="/data-input">
                  <ClipboardPenLine />
                  <span className="group-data-[state=collapsed]:hidden">Data Input</span>
              </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/reports'}
                  tooltip="Reports"
                  size="lg"
                >
              <Link href="/reports">
                  <FileDown />
                  <span className="group-data-[state=collapsed]:hidden">Reports</span>
              </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/activity-log'}
                  tooltip="Activity Log"
                  size="lg"
                >
              <Link href="/activity-log">
                  <History />
                  <span className="group-data-[state=collapsed]:hidden">Activity Log</span>
              </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {/* Footer content can go here if needed in the future */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6 sticky top-0 z-30">
          <SidebarTrigger className="flex md:hidden" />
          <SidebarTrigger className="hidden md:flex" />
          <div className="flex-1"></div>
          {userProfile}
        </header>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

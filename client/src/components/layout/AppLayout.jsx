import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderOpen,
    Tags,
    Receipt,
    User,
    LogOut,
    Menu,
    X,
    Wallet,
    CalendarClock,
} from 'lucide-react';
import { NotificationBell } from '@/components/common/NotificationBell';
import { useNotifications } from '@/hooks/useNotifications';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { logoutUser } from '@/features/auth/authSlice';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/expenses', label: 'Expenses', icon: Receipt },
    { to: '/scheduled-expenses', label: 'Scheduled', icon: CalendarClock },
    { to: '/categories', label: 'Categories', icon: FolderOpen },
    { to: '/expense-types', label: 'Expense Types', icon: Tags },
    { to: '/profile', label: 'Profile', icon: User },
];

function NavItem({ to, label, icon: Icon, onClick }) {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
            }
        >
            <Icon className="h-4 w-4" />
            {label}
        </NavLink>
    );
}

export function AppLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);
    const { unreadCount, pushPermission, requestPermission } = useNotifications(!!user);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const closeMobile = () => setMobileOpen(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile header */}
            <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2 font-semibold">
                    <Wallet className="h-5 w-5 text-primary" />
                    Expense Tracker
                </div>
                <div className="ml-auto flex items-center gap-1">
                    <NotificationBell
                        unreadCount={unreadCount}
                        pushPermission={pushPermission}
                        onRequestPermission={requestPermission}
                    />
                    <ThemeToggle />
                </div>
            </header>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={closeMobile} />
                    <aside className="fixed inset-y-0 left-0 w-64 border-r bg-background p-4">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2 font-semibold">
                                <Wallet className="h-5 w-5 text-primary" />
                                Expense Tracker
                            </div>
                            <Button variant="ghost" size="icon" onClick={closeMobile}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <nav className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <NavItem key={item.to} {...item} onClick={closeMobile} />
                            ))}
                        </nav>
                        <div className="mt-auto space-y-3 border-t pt-4">
                            {user && (
                                <div className="px-3">
                                    <p className="truncate text-sm font-medium">{user.firstName} {user.lastName}</p>
                                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                                </div>
                            )}
                            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { closeMobile(); handleLogout(); }}>
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </aside>
                </div>
            )}

            <div className="flex">
                {/* Desktop sidebar */}
                <aside className="hidden w-64 shrink-0 border-r lg:block">
                    <div className="sticky top-0 flex h-screen flex-col p-4">
                        <div className="mb-8 flex items-center gap-2 px-3 pt-2 text-lg font-bold">
                            <Wallet className="h-6 w-6 text-primary" />
                            Expense Tracker
                        </div>
                        <nav className="flex flex-1 flex-col gap-1">
                            {navItems.map((item) => (
                                <NavItem key={item.to} {...item} />
                            ))}
                        </nav>
                        <div className="mt-auto space-y-3 border-t pt-4">
                            {user && (
                                <div className="px-3">
                                    <p className="truncate text-sm font-medium">{user.firstName} {user.lastName}</p>
                                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                                </div>
                            )}
                            <div className="flex items-center gap-2 px-1">
                                <NotificationBell
                        unreadCount={unreadCount}
                        pushPermission={pushPermission}
                        onRequestPermission={requestPermission}
                    />
                                <ThemeToggle />
                                <Button variant="ghost" className="flex-1 justify-start gap-2" onClick={handleLogout}>
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 overflow-auto">
                    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

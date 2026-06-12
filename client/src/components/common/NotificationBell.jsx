import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import {
    fetchNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from '@/features/notification/notificationSlice';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function NotificationBell({ unreadCount, pushPermission, onRequestPermission }) {
    const dispatch = useAppDispatch();
    const { notifications } = useAppSelector((state) => state.notification);

    const handleOpenChange = (open) => {
        if (open) {
            dispatch(fetchNotifications({ page: 1, limit: 20 }));
        }
    };

    const handleMarkRead = (id) => {
        dispatch(markNotificationRead(id));
    };

    const handleMarkAllRead = () => {
        dispatch(markAllNotificationsRead());
    };

    return (
        <DropdownMenu onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px]"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs"
                            onClick={handleMarkAllRead}
                        >
                            <CheckCheck className="mr-1 h-3 w-3" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                {pushPermission === 'default' && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-2">
                            <p className="mb-2 text-xs text-muted-foreground">
                                Enable browser notifications to get alerts when schedules run.
                            </p>
                            <Button size="sm" variant="outline" className="w-full" onClick={onRequestPermission}>
                                Enable notifications
                            </Button>
                        </div>
                    </>
                )}
                {pushPermission === 'denied' && (
                    <>
                        <DropdownMenuSeparator />
                        <p className="px-2 py-1 text-xs text-muted-foreground">
                            Browser notifications are blocked. Allow them in your browser settings.
                        </p>
                    </>
                )}
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                        No notifications yet
                    </p>
                ) : (
                    notifications.slice(0, 10).map((notification) => (
                        <DropdownMenuItem
                            key={notification.notificationId}
                            className={cn(
                                'flex cursor-pointer flex-col items-start gap-1 p-3',
                                !notification.isRead && 'bg-accent/50'
                            )}
                            onClick={() => {
                                if (!notification.isRead) {
                                    handleMarkRead(notification.notificationId);
                                }
                            }}
                        >
                            <div className="flex w-full items-start justify-between gap-2">
                                <span className="text-sm font-medium">{notification.title}</span>
                                {!notification.isRead && (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {notification.message}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                    addSuffix: true,
                                })}
                            </span>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

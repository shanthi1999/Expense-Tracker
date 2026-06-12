import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import {
    fetchNotifications,
    setPushPermission,
} from '@/features/notification/notificationSlice';

const POLL_INTERVAL_MS = 15_000;

const showBrowserNotification = (title, body) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
        return;
    }

    try {
        new Notification(title, { body, icon: '/vite.svg' });
    } catch {
        // Ignore if browser blocks notifications
    }
};

export function useNotifications(enabled = true) {
    const dispatch = useAppDispatch();
    const { unreadCount, notifications, pushPermission } = useAppSelector(
        (state) => state.notification
    );
    const user = useAppSelector((state) => state.auth.user);
    const knownIdsRef = useRef(new Set());
    const initializedRef = useRef(false);

    useEffect(() => {
        initializedRef.current = false;
        knownIdsRef.current = new Set();
    }, [user?.userId]);

    useEffect(() => {
        if (!enabled || !user) return;

        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
                dispatch(setPushPermission(permission));
            });
        } else if (typeof Notification !== 'undefined') {
            dispatch(setPushPermission(Notification.permission));
        }
    }, [dispatch, enabled, user]);

    useEffect(() => {
        if (!enabled || !user) return;

        const load = () => {
            dispatch(fetchNotifications({ page: 1, limit: 20 }));
        };

        load();
        const interval = setInterval(load, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [dispatch, enabled, user]);

    useEffect(() => {
        if (!notifications.length) return;

        if (!initializedRef.current) {
            notifications.forEach((n) => knownIdsRef.current.add(n.notificationId));
            initializedRef.current = true;
            return;
        }

        const newUnread = notifications.filter(
            (n) => !n.isRead && !knownIdsRef.current.has(n.notificationId)
        );

        newUnread.forEach((n) => {
            knownIdsRef.current.add(n.notificationId);
            toast.info(n.title, { description: n.message });
            showBrowserNotification(n.title, n.message);
        });
    }, [notifications]);

    const requestPermission = () => {
        if (typeof Notification === 'undefined') return;
        Notification.requestPermission().then((permission) => {
            dispatch(setPushPermission(permission));
        });
    };

    return { unreadCount, pushPermission, requestPermission };
}

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './useAppDispatch.js';
import { fetchCurrentUser } from '../features/auth/authSlice.js';
import { getAccessToken } from '../lib/axios.js';

/** Bootstrap auth state on app load when a token exists in storage. */
export const useAuthInit = () => {
    const dispatch = useAppDispatch();
    const { user, status } = useAppSelector((state) => state.auth);

    useEffect(() => {
        const token = getAccessToken();
        if (token && !user && status === 'idle') {
            dispatch(fetchCurrentUser());
        }
    }, [dispatch, user, status]);
};

export const useAuth = () => useAppSelector((state) => state.auth);

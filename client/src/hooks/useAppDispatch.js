import { useDispatch, useSelector } from 'react-redux';

/** Typed Redux hooks — use throughout the app instead of plain useDispatch/useSelector. */
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

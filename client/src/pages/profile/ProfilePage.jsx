import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { updateProfileSchema } from '@/schemas/auth.schema';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { fetchProfile, updateProfile } from '@/features/user/userSlice';
import { fetchCurrentUser } from '@/features/auth/authSlice';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProfileImageUpload } from '@/components/common/ProfileImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function ProfilePage() {
    const dispatch = useAppDispatch();
    const { profile, status } = useAppSelector((state) => state.user);
    const authUser = useAppSelector((state) => state.auth.user);

    const form = useForm({
        resolver: zodResolver(updateProfileSchema),
    });

    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    useEffect(() => {
        const user = profile || authUser;
        if (user) {
            form.reset({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                dob: user.dob ? user.dob.split('T')[0] : '',
                gender: user.gender || '',
                monthlyIncome: user.monthlyIncome ?? '',
                budget: user.budget ?? '',
                currency: user.currency || 'USD',
                profileImage: user.profileImage || '',
            });
        }
    }, [profile, authUser, form]);

    const onSubmit = async (data) => {
        const userId = profile?.userId || authUser?.userId;
        if (!userId) return;

        const payload = {
            ...data,
            lastName: data.lastName || undefined,
            gender: data.gender || undefined,
            monthlyIncome: data.monthlyIncome !== '' ? Number(data.monthlyIncome) : undefined,
            budget: data.budget !== '' ? Number(data.budget) : undefined,
            profileImage: data.profileImage || undefined,
        };

        const result = await dispatch(updateProfile({ id: userId, payload }));
        if (result.meta.requestStatus === 'fulfilled') {
            toast.success('Profile updated successfully');
            dispatch(fetchCurrentUser());
        } else {
            toast.error(result.payload || 'Update failed');
        }
    };

    if (status === 'loading' && !profile) {
        return <LoadingSpinner />;
    }

    const user = profile || authUser;

    return (
        <div>
            <PageHeader title="Profile" description="Manage your account settings and preferences" />

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Account Info</CardTitle>
                        <CardDescription>Your registered details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex justify-center">
                            {user?.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt={`${user.firstName} profile`}
                                    className="h-24 w-24 rounded-full border-2 border-border object-cover"
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted text-muted-foreground">
                                    No photo
                                </div>
                            )}
                        </div>
                        <p>
                            <span className="text-muted-foreground">Email:</span>{' '}
                            <span className="font-medium">{user?.email}</span>
                        </p>
                        <p>
                            <span className="text-muted-foreground">Member since:</span>{' '}
                            {user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : '—'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Edit Profile</CardTitle>
                        <CardDescription>Update your personal information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" {...form.register('firstName')} />
                                    {form.formState.errors.firstName && (
                                        <p className="text-sm text-destructive">
                                            {form.formState.errors.firstName.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" {...form.register('lastName')} />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="dob">Date of Birth</Label>
                                    <Input id="dob" type="date" {...form.register('dob')} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Select
                                        value={form.watch('gender') || ''}
                                        onValueChange={(v) => form.setValue('gender', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALE">Male</SelectItem>
                                            <SelectItem value="FEMALE">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="monthlyIncome">Monthly Income</Label>
                                    <Input id="monthlyIncome" type="number" min="0" step="0.01" {...form.register('monthlyIncome')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="budget">Budget</Label>
                                    <Input id="budget" type="number" min="0" step="0.01" {...form.register('budget')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Input id="currency" {...form.register('currency')} />
                                </div>
                            </div>
                            <ProfileImageUpload
                                userId={user?.userId}
                                value={form.watch('profileImage')}
                                onChange={(url) => form.setValue('profileImage', url, { shouldDirty: true })}
                                onUploaded={() => {
                                    dispatch(fetchCurrentUser());
                                    dispatch(fetchProfile());
                                }}
                            />
                            <input type="hidden" {...form.register('profileImage')} />
                            {form.formState.errors.profileImage && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.profileImage.message}
                                </p>
                            )}
                            <Button type="submit" disabled={form.formState.isSubmitting || status === 'loading'}>
                                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

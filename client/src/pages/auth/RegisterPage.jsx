import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Wallet } from 'lucide-react';
import { registerSchema } from '@/schemas/auth.schema';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { clearAuthError, registerUser } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function RegisterPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { status, error } = useAppSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            dob: '',
            gender: '',
            monthlyIncome: '',
            budget: '',
            currency: 'USD',
            profileImage: '',
        },
    });

    const onSubmit = async (data) => {
        dispatch(clearAuthError());
        const payload = {
            ...data,
            lastName: data.lastName || undefined,
            gender: data.gender || undefined,
            monthlyIncome: data.monthlyIncome !== '' ? Number(data.monthlyIncome) : undefined,
            budget: data.budget !== '' ? Number(data.budget) : undefined,
            profileImage: data.profileImage || undefined,
        };
        const result = await dispatch(registerUser(payload));
        if (registerUser.fulfilled.match(result)) {
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } else {
            toast.error(result.payload || 'Registration failed');
        }
    };

    return (
        <div className="relative min-h-screen py-8">
            <div className="absolute right-4 top-4">
                <ThemeToggle />
            </div>
            <div className="mx-auto w-full max-w-2xl px-4">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Wallet className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Create an account</CardTitle>
                        <CardDescription>Start tracking your expenses today</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input id="firstName" {...register('firstName')} />
                                    {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" {...register('lastName')} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input id="email" type="email" {...register('email')} />
                                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <Input id="password" type="password" {...register('password')} />
                                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                    <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
                                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="dob">Date of Birth *</Label>
                                    <Input id="dob" type="date" {...register('dob')} />
                                    {errors.dob && <p className="text-sm text-destructive">{errors.dob.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Select value={watch('gender') || ''} onValueChange={(v) => setValue('gender', v)}>
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
                                    <Input id="monthlyIncome" type="number" min="0" step="0.01" {...register('monthlyIncome')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="budget">Budget</Label>
                                    <Input id="budget" type="number" min="0" step="0.01" {...register('budget')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency *</Label>
                                    <Input id="currency" {...register('currency')} />
                                    {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={status === 'loading'}>
                                {status === 'loading' ? 'Creating account...' : 'Create account'}
                            </Button>
                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-primary hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}

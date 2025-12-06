'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import { LoaderCircle } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
});

type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });
  
  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = (values: ForgotPasswordInput) => {
    startTransition(async () => {
      try {
        await sendPasswordResetEmail(auth, values.email);
        toast({
          title: 'Password Reset Email Sent',
          description: 'Check your inbox for instructions to reset your password.',
        });
        router.push('/login');
      } catch (error: any) {
        console.error(error);
        let description = 'An unexpected error occurred. Please try again.';
         if (error.code === 'auth/user-not-found') {
          description = 'No account found with that email address.';
        }
        toast({
          variant: 'destructive',
          title: 'Error',
          description,
        });
      }
    });
  };
  
  if (isUserLoading || user) {
     return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter your email and we'll send you a link to reset it."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
             {isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Send reset link
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Remembered your password?{' '}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </div>
    </AuthLayout>
  );
}

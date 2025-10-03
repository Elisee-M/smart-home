import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { authUtils } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Home, Lock, Mail } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      const result = await authUtils.verifyCredentials(values.email, values.password);
      
      if (result) {
        authUtils.saveAuthState(result.user, result.userKey);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.user.name}!`,
        });
        
        // Redirect based on role
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-full shadow-glow">
              <Home className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">SmartNest</h1>
            <p className="text-xl text-white/80">IoT Dashboard Login</p>
          </div>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-card p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-white/60" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/60 focus:ring-white/20"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-white/60" />
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/60 focus:ring-white/20"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-white text-primary font-bold text-lg shadow-button hover:shadow-glow hover:bg-white/90 transition-all duration-300"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Form>

        </Card>

        <p className="text-center text-white/60 text-sm">
          SmartNest IoT Project
        </p>
      </div>
    </div>
  );
};

export default Login;
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { authUtils } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

const userSchema = z.object({
  userKey: z.string().min(1, 'Username key is required').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores allowed'),
  email: z.string().email('Please enter a valid email'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(3, 'Password must be at least 3 characters'),
  role: z.enum(['user', 'admin'], { required_error: 'Please select a role' }),
});

interface AddUserFormProps {
  onUserAdded?: () => void;
}

const AddUserForm = ({ onUserAdded }: AddUserFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      userKey: '',
      email: '',
      name: '',
      password: '',
      role: 'user',
    },
  });

  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    setLoading(true);
    try {
      const userData = {
        email: values.email,
        name: values.name,
        password: values.password,
        role: values.role,
      };

      const success = await authUtils.addUser(values.userKey, userData);
      
      if (success) {
        toast({
          title: "User Added",
          description: `${values.name} has been added successfully`,
        });
        form.reset();
        onUserAdded?.();
      } else {
        toast({
          title: "Error",
          description: "Failed to add user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card border-0 p-6 animate-slide-up">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-secondary/20 text-secondary rounded-full">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Add New User</h3>
            <p className="text-muted-foreground">Create a new user account</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username Key</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., user2, admin2"
                      className="bg-background/50 border-border/50 focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      className="bg-background/50 border-border/50 focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      className="bg-background/50 border-border/50 focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      className="bg-background/50 border-border/50 focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-secondary text-white font-semibold h-12 shadow-button hover:shadow-glow transition-all duration-300"
            >
              {loading ? 'Adding User...' : 'Add User'}
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  );
};

export default AddUserForm;
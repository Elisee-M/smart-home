import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { authUtils, User } from '@/lib/auth';
import { Users, Shield, User as UserIcon, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UsersTableProps {
  refreshTrigger?: number;
}

const UsersTable = ({ refreshTrigger }: UsersTableProps) => {
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const allUsers = await authUtils.getAllUsers();
        if (allUsers) {
          setUsers(allUsers);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [refreshTrigger]);

  const handleDeleteUser = async (userKey: string, userName: string) => {
    try {
      const success = await authUtils.deleteUser(userKey);
      if (success) {
        toast({
          title: "User Deleted",
          description: `${userName} has been successfully deleted`,
        });
        // Refresh the users list
        const allUsers = await authUtils.getAllUsers();
        if (allUsers) {
          setUsers(allUsers);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-card shadow-card border-0 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-card border-0 p-6 animate-slide-up">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-accent/20 text-accent rounded-full">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">All Users</h3>
            <p className="text-muted-foreground">{Object.keys(users).length} total users</p>
          </div>
        </div>

        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(users).map(([userKey, userData]) => (
                <TableRow key={userKey} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-primary/20 text-primary rounded-full">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <span>{userData.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{userData.email}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={userData.role === 'admin' ? 'default' : 'secondary'}
                      className={`${
                        userData.role === 'admin' 
                          ? 'bg-accent text-accent-foreground' 
                          : 'bg-secondary text-secondary-foreground'
                      } font-medium`}
                    >
                      {userData.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                      {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border-destructive/30 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user "{userData.name}" and remove all their data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(userKey, userData.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete User
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};

export default UsersTable;
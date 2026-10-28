import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Users, UserPlus, Mail, Shield, Trash2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2 hours ago'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Manager',
      status: 'Active',
      lastLogin: '1 day ago'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'User',
      status: 'Inactive',
      lastLogin: '1 week ago'
    }
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user'
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleInviteUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Please fill in all fields');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1),
      status: 'Pending',
      lastLogin: 'Never'
    };

    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: 'user' });
    setIsDialogOpen(false);
    toast.success(`Invitation sent to ${user.email}`);
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    toast.success('User removed successfully');
  };

  const updateUserRole = (id: string, newRole: string) => {
    setUsers(users.map(user =>
      user.id === id ? { ...user, role: newRole } : user
    ));
    toast.success('User role updated');
  };

  return (
    <div className="space-y-6">
      {/* User List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage users and their permissions
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New User</DialogTitle>
                  <DialogDescription>
                    Send an invitation to add a new team member
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="userName">Full Name</Label>
                    <Input
                      id="userName"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userEmail">Email Address</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userRole">Role</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger id="userRole">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleInviteUser} className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">{user.name}</h4>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-muted rounded">{user.role}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' :
                        user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                      <span className="text-xs text-muted-foreground">Last login: {user.lastLogin}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => updateUserRole(user.id, 'Admin')}>
                      Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => updateUserRole(user.id, 'Manager')}>
                      Make Manager
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => updateUserRole(user.id, 'User')}>
                      Make User
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onSelect={() => deleteUser(user.id)}
                      className="text-red-600"
                    >
                      Remove User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role Permissions
          </CardTitle>
          <CardDescription>
            Define what each role can access and modify
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 p-3 border-b font-medium">
              <div>Permission</div>
              <div className="text-center">Admin</div>
              <div className="text-center">Manager</div>
              <div className="text-center">Accountant</div>
              <div className="text-center">User</div>
            </div>

            {[
              { name: 'View Dashboard', admin: true, manager: true, accountant: true, user: true },
              { name: 'Create Invoices', admin: true, manager: true, accountant: true, user: false },
              { name: 'Delete Invoices', admin: true, manager: true, accountant: false, user: false },
              { name: 'Manage Users', admin: true, manager: false, accountant: false, user: false },
              { name: 'View Reports', admin: true, manager: true, accountant: true, user: true },
              { name: 'Manage Settings', admin: true, manager: false, accountant: false, user: false },
              { name: 'Process Payments', admin: true, manager: true, accountant: true, user: false }
            ].map((permission, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 p-3 items-center border-b">
                <div className="text-sm">{permission.name}</div>
                <div className="text-center">
                  <input type="checkbox" checked={permission.admin} disabled className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <input type="checkbox" checked={permission.manager} disabled className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <input type="checkbox" checked={permission.accountant} disabled className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <input type="checkbox" checked={permission.user} disabled className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

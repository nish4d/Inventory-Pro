'use client'

import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, User, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Account } from '@/lib/types'
import { useAuth } from '@/contexts/auth-context'

export function Settings() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [newAccount, setNewAccount] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

  // Load accounts from API on component mount
  useEffect(() => {
    // Redirect non-admin users or show access denied message
    if (!isAdmin) {
      return
    }
    
    fetchAccounts()
  }, [isAdmin])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch accounts',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch accounts',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // If user is not admin, show access denied message
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-2xl font-bold text-destructive mb-2">Access Denied</div>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
          <p className="text-sm text-muted-foreground mt-2">Only administrators can access the Settings page.</p>
        </div>
      </div>
    )
  }

  const handleCreateAccount = async () => {
    if (!newAccount.name || !newAccount.email) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newAccount.email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      })
      return
    }

    // Validate password strength
    if (newAccount.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAccount),
      })

      if (response.ok) {
        const createdAccount = await response.json()
        setAccounts([...accounts, createdAccount])
        setNewAccount({ name: '', email: '', password: '', role: 'user' })
        setIsCreating(false)
        
        toast({
          title: 'Account Created',
          description: `Account for ${createdAccount.name} has been created successfully.`,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to create account',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating account:', error)
      toast({
        title: 'Error',
        description: 'Failed to create account',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateAccount = async () => {
    if (!editingAccount) return
    
    if (!editingAccount.name || !editingAccount.email) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editingAccount.email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      })
      return
    }

    // Validate password strength (only if password is being changed)
    if (editingAccount.password && editingAccount.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch(`/api/accounts/${editingAccount.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingAccount.name,
          email: editingAccount.email,
          password: editingAccount.password || undefined, // Only send password if it's being changed
          role: editingAccount.role,
        }),
      })

      if (response.ok) {
        const updatedAccount = await response.json()
        setAccounts(accounts.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc))
        setEditingAccount(null)
        
        toast({
          title: 'Account Updated',
          description: `Account for ${updatedAccount.name} has been updated successfully.`,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update account',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating account:', error)
      toast({
        title: 'Error',
        description: 'Failed to update account',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteAccount = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setAccounts(accounts.filter(acc => acc.id !== id))
        toast({
          title: 'Account Deleted',
          description: `Account for ${name} has been deleted successfully.`,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to delete account',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete account',
        variant: 'destructive',
      })
    }
  }

  const cancelCreate = () => {
    setIsCreating(false)
    setNewAccount({ name: '', email: '', password: '', role: 'user' })
  }

  const cancelEdit = () => {
    setEditingAccount(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and configuration</p>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account Management
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Account Management</CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </div>
                <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Account
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isCreating && (
                <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-4">Create New Account</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="new-name">Name *</Label>
                      <Input
                        id="new-name"
                        value={newAccount.name}
                        onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                        placeholder="Enter name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-email">Email *</Label>
                      <Input
                        id="new-email"
                        type="email"
                        value={newAccount.email}
                        onChange={(e) => setNewAccount({...newAccount, email: e.target.value})}
                        placeholder="Enter email"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">Password *</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newAccount.password}
                        onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                        placeholder="Min. 6 characters"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-role">Role</Label>
                      <select
                        id="new-role"
                        className="w-full h-10 px-3 py-2 text-sm border border-input rounded-md bg-background mt-1"
                        value={newAccount.role}
                        onChange={(e) => setNewAccount({...newAccount, role: e.target.value})}
                      >
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                    <div className="flex items-end space-x-2 pt-1">
                      <Button onClick={handleCreateAccount} className="flex items-center gap-1 h-9">
                        <Save className="h-4 w-4" />
                        <span>Create</span>
                      </Button>
                      <Button variant="outline" onClick={cancelCreate} className="flex items-center gap-1 h-9">
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden md:table-cell">Name</TableHead>
                      <TableHead className="hidden lg:table-cell">Email</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden sm:table-cell">Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => (
                      editingAccount && editingAccount.id === account.id ? (
                        <TableRow key={account.id}>
                          <TableCell>
                            <Input
                              value={editingAccount.name}
                              onChange={(e) => setEditingAccount({...editingAccount, name: e.target.value})}
                              className="mt-1"
                            />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Input
                              type="email"
                              value={editingAccount.email}
                              onChange={(e) => setEditingAccount({...editingAccount, email: e.target.value})}
                              className="mt-1"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="password"
                              value={editingAccount.password}
                              onChange={(e) => setEditingAccount({...editingAccount, password: e.target.value})}
                              className="mt-1"
                              placeholder="Min. 6 characters or leave blank"
                            />
                          </TableCell>
                          <TableCell>
                            <select
                              className="w-full h-10 px-3 py-2 text-sm border border-input rounded-md bg-background mt-1"
                              value={editingAccount.role}
                              onChange={(e) => setEditingAccount({...editingAccount, role: e.target.value})}
                            >
                              <option value="admin">Admin</option>
                              <option value="user">User</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {new Date(account.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button onClick={handleUpdateAccount} className="flex items-center gap-1 h-8 px-2">
                                <Save className="h-3 w-3" />
                                <span className="sr-only md:not-sr-only">Save</span>
                              </Button>
                              <Button variant="outline" onClick={cancelEdit} className="flex items-center gap-1 h-8 px-2">
                                <X className="h-3 w-3" />
                                <span className="sr-only md:not-sr-only">Cancel</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium hidden md:table-cell">{account.name}</TableCell>
                          <TableCell className="hidden lg:table-cell">{account.email}</TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">••••••••</span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              account.role === 'admin' 
                                ? 'bg-blue-100 text-blue-800' 
                                : account.role === 'user' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {account.role.charAt(0).toUpperCase() + account.role.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{new Date(account.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setEditingAccount(account)}
                                className="flex items-center gap-1 h-8 px-2"
                              >
                                <Edit className="h-3 w-3" />
                                <span className="sr-only md:not-sr-only">Edit</span>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex items-center gap-1 h-8 px-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span className="sr-only md:not-sr-only">Delete</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the account for {account.name}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteAccount(account.id, account.name)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                      Delete Account
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your application settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <SettingsIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Preferences Coming Soon</h3>
                  <p className="text-muted-foreground">We're working on implementing preference settings.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
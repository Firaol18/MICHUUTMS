import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Column } from '@/components/data-display/DataTable';
import { DataTable } from '@/components/data-display/DataTable';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { Search, RefreshCw, UserPlus } from 'lucide-react';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  regDate: string;
  status: 'active' | 'blocked';
}

const INITIAL_USERS: UserAccount[] = [
  { id: 'usr-1', name: 'Eleanor Vance', email: 'eleanor.vance@example.com', mobile: '+1 (555) 321-7890', role: 'Tourist', regDate: '2026-07-15', status: 'active' },
  { id: 'usr-2', name: 'Juma Mwangi', email: 'juma.m@tourismsystem.com', mobile: '+255 712 345 678', role: 'Tour Guide', regDate: '2026-06-10', status: 'active' },
  { id: 'usr-3', name: 'Heidi Weber', email: 'heidi.w@tourismsystem.com', mobile: '+41 79 123 45 67', role: 'Tour Guide', regDate: '2026-06-12', status: 'active' },
  { id: 'usr-4', name: 'Sophia Rossi', email: 'sophia.r@example.it', mobile: '+39 06 6987 1234', role: 'Tourist', regDate: '2026-08-01', status: 'active' },
  { id: 'usr-5', name: 'Alex Morgan', email: 'alex.m@tmslogistics.com', mobile: '+1 (555) 998-1122', role: 'Administrator', regDate: '2026-05-01', status: 'active' },
  { id: 'usr-6', name: 'Liam Hemsworth', email: 'liam.h@example.co.uk', mobile: '+44 20 7946 0912', role: 'Tourist', regDate: '2026-08-03', status: 'active' },
];

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newRole, setNewRole] = useState('Tourist');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: newName || 'New Traveler User',
      email: newEmail || 'user@example.com',
      mobile: newMobile || '+1 (555) 000-0000',
      role: newRole,
      regDate: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    setUsers([newUser, ...users]);
    setIsAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewMobile('');
  };

  const toggleStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u));
  };

  const columns: Column<UserAccount>[] = [
    {
      header: 'Name',
      cell: (row) => (
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
      ),
    },
    { header: 'Email Address', accessorKey: 'email' },
    { header: 'Mobile Number', accessorKey: 'mobile' },
    {
      header: 'Role',
      cell: (row) => <Badge variant="info">{row.role}</Badge>,
    },
    { header: 'Registration Date', accessorKey: 'regDate' },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'danger'}>
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <PermissionGuard resource="users" action="update">
          <Button variant={row.status === 'active' ? 'ghost' : 'outline'} size="sm" onClick={() => toggleStatus(row.id)}>
            {row.status === 'active' ? 'Block' : 'Unblock'}
          </Button>
        </PermissionGuard>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Manage Users"
        description="View registered travelers, manage account permissions, and control access statuses."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={() => setIsLoading(false)}>
              Refresh
            </Button>
            <PermissionGuard resource="users" action="create">
              <Button variant="primary" size="sm" icon={<UserPlus size={14} />} onClick={() => setIsAddModalOpen(true)}>
                Add New User
              </Button>
            </PermissionGuard>
          </>
        }
      />

      <div style={{ marginBottom: '1.25rem', maxWidth: '320px' }}>
        <Input
          placeholder="Search users by name, email, role..."
          icon={<Search size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New System User"
        footer={
          <div className="flex-between" style={{ width: '100%' }}>
            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddUser} icon={<UserPlus size={16} />}>
              Create User Account
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Full Name" placeholder="e.g. John Doe" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          <Input label="Email Address" type="email" placeholder="e.g. john@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          <Input label="Mobile Number" placeholder="e.g. +1 (555) 123-4567" value={newMobile} onChange={(e) => setNewMobile(e.target.value)} />
          <div className="tms-input-group">
            <label className="tms-input-label">User Role</label>
            <select className="tms-input" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <option value="Tourist">Tourist / Traveler</option>
              <option value="Tour Guide">Tour Guide</option>
              <option value="Tour Operator">Tour Operator</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

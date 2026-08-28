import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { corporateService } from '@tms/shared/services/corporateService';
import type { CorporateUser, CorporateRole } from '@tms/shared/types/corporate';
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  Clock,
  Send,
  X,
  Shield,
  Key,
  KeyRound,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';

const ROLE_COLORS: Record<string, string> = {
  CORPORATE_ADMIN: '#8b5cf6',
  TRAVEL_MANAGER: '#2563eb',
  APPROVER: '#f59e0b',
  TRAVELER: '#059669',
};

const CORPORATE_ROLES: { role: CorporateRole; label: string; desc: string }[] = [
  { role: 'TRAVELER', label: 'Employee / Traveler', desc: 'Can search and book travel under company policy rules' },
  { role: 'APPROVER', label: 'Department Approver', desc: 'Can review, approve, and reject out-of-policy trips' },
  { role: 'TRAVEL_MANAGER', label: 'Travel Manager', desc: 'Can book for any employee and manage all travel requests' },
  { role: 'CORPORATE_ADMIN', label: 'Corporate Admin', desc: 'Full company administrator with employee invite rights' },
];

export const CorporateEmployeesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<CorporateUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Invitation Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteEmployeeId, setInviteEmployeeId] = useState('');
  const [inviteJobTitle, setInviteJobTitle] = useState('');
  const [inviteDepartment, setInviteDepartment] = useState('Sales & Business Development');
  const [inviteRole, setInviteRole] = useState<CorporateRole>('TRAVELER');
  const [invitePhone, setInvitePhone] = useState('+251 9');
  const [inviteTempPassword, setInviteTempPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');

  // Credentials Generated Confirmation Dialog
  const [credentialsModalData, setCredentialsModalData] = useState<{
    name: string;
    email: string;
    role: string;
    tempPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const companyId = user?.companyId || 'comp-1';
  const companyName = user?.companyName || 'Corporate Workspace';
  const isCompanyAdmin = user?.role === 'CORPORATE_ADMIN' || user?.role === 'TRAVEL_MANAGER';

  const loadEmployees = async () => {
    try {
      let cid = companyId;
      const compList = await corporateService.getCompanies({ limit: 50 });
      const matched = compList.items.find(
        (c) => c.id === companyId || (user?.companyName && c.name.toLowerCase() === user.companyName.toLowerCase())
      );
      if (matched) cid = matched.id;

      const membersRes = await corporateService.getMembers(cid, { limit: 100 });
      if (membersRes?.items?.length) {
        setEmployees(membersRes.items.map((m) => ({
          id: m.id,
          name: m.userName || (m as any).user?.name || 'Member',
          email: m.userEmail || (m as any).user?.email || '',
          corporateRole: m.corporateRole as any,
          department: m.department?.name || 'General',
          departmentName: m.department?.name || 'General',
          jobTitle: m.jobTitle || m.corporateRole,
          companyId: m.companyId,
          companyName: companyName,
          isActive: m.isActive,
          createdAt: m.createdAt,
        })));
      } else {
        const all = await corporateService.getCorporateUsers();
        setEmployees(all.filter((u) => u.companyId === cid || u.companyId === companyId));
      }
    } catch {
      const all = await corporateService.getCorporateUsers();
      setEmployees(all.filter((u) => u.companyId === companyId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [companyId, user?.companyName]);

  const handleRandomizePassword = () => {
    const words = ['Michuu', 'Habesha', 'Abyssinia', 'Safari', 'Expedition', 'Summit'];
    const prefix = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const symbols = ['!', '@', '#', '$', '&'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    setInviteTempPassword(`${prefix}#${num}${symbol}`);
  };

  const handleOpenInvite = () => {
    setInviteName('');
    setInviteEmail('');
    setInviteEmployeeId(`EMP-${Math.floor(100 + Math.random() * 900)}`);
    setInviteJobTitle('');
    setInviteDepartment(user?.departmentName || 'Operations');
    setInviteRole('TRAVELER');
    setInvitePhone('+251 9');
    setInviteSuccessMsg('');
    handleRandomizePassword();
    setIsInviteModalOpen(true);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await corporateService.inviteEmployee({
        name: inviteName,
        email: inviteEmail,
        companyId,
        companyName,
        department: inviteDepartment,
        corporateRole: inviteRole,
        employeeId: inviteEmployeeId,
        jobTitle: inviteJobTitle || inviteDepartment,
        phone: invitePhone,
        customTempPassword: inviteTempPassword,
      });

      setIsInviteModalOpen(false);
      loadEmployees();

      // Show credentials dialog
      setCredentialsModalData({
        name: created.name,
        email: created.email,
        role: created.corporateRole,
        tempPassword: created.tempPassword || inviteTempPassword,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!credentialsModalData) return;
    const roleLabel = CORPORATE_ROLES.find((r) => r.role === credentialsModalData.role)?.label || credentialsModalData.role;
    const text = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MICHUU TMS — Employee Travel Credentials
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Organization : ${companyName}
Employee Name: ${credentialsModalData.name}
Role         : ${roleLabel}
Login Email  : ${credentialsModalData.email}
Temp Password: ${credentialsModalData.tempPassword}
Portal URL   : ${window.location.origin}/login

🔒 NOTE: You will be required to change your temporary password immediately upon your first sign in.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filtered = employees.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.employeeId && e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || e.corporateRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, margin: 0 }}>
            Company Employee Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '0.3rem' }}>
            {companyName} · Manage corporate travel authorizations & invite team members · {employees.length} enrolled
          </p>
        </div>

        {isCompanyAdmin && (
          <Button variant="primary" icon={<UserPlus size={16} />} onClick={handleOpenInvite}>
            Invite Employee
          </Button>
        )}
      </div>

      {/* ── Search and Role Filter Strip ── */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '380px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name, email, employee ID or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.9rem 0.6rem 2.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['ALL', 'CORPORATE_ADMIN', 'TRAVEL_MANAGER', 'APPROVER', 'TRAVELER'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: 700,
                border: `1px solid ${roleFilter === r ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                backgroundColor: roleFilter === r ? 'var(--brand-primary-light)' : 'transparent',
                color: roleFilter === r ? 'var(--brand-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Employees Cards Grid ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading employee roster...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((emp) => {
            const isInvited = emp.status === 'INVITED';
            return (
              <Card
                key={emp.id}
                glass
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: isInvited ? '1.5px dashed rgba(245,158,11,0.4)' : '1px solid var(--border-color)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: 46, height: 46, borderRadius: 'var(--radius-full)', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: 'var(--font-size-sm)', color: 'white',
                      background: `linear-gradient(135deg, ${ROLE_COLORS[emp.corporateRole] || '#64748b'}, ${ROLE_COLORS[emp.corporateRole] || '#64748b'}aa)`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    }}
                  >
                    {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {emp.name}
                      </div>
                      {emp.employeeId && (
                        <span style={{ fontSize: '9px', fontWeight: 800, padding: '0.1rem 0.35rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', color: 'var(--text-muted)' }}>
                          {emp.employeeId}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.jobTitle || emp.department}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <Badge
                      style={{ backgroundColor: `${ROLE_COLORS[emp.corporateRole]}22`, color: ROLE_COLORS[emp.corporateRole], flexShrink: 0 }}
                    >
                      {emp.corporateRole.replace('_', ' ')}
                    </Badge>
                    {isInvited ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '9px', fontWeight: 800, color: '#d97706' }}>
                        <Clock size={10} /> Pending Invite
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '9px', fontWeight: 800, color: '#16a34a' }}>
                        <CheckCircle2 size={10} /> Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={11} /> {emp.email}
                  </div>
                  {emp.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={11} /> {emp.phone}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Building2 size={11} /> {emp.department}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '11px' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                      {emp.totalBookings || 0}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Bookings</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                      ${(emp.totalSpend || 0).toLocaleString()}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Spent</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: isInvited ? '#f59e0b' : '#16a34a' }}>
                      {isInvited ? 'INVITED' : 'ACTIVE'}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Status</div>
                  </div>
                </div>
              </Card>
            );
          })}

          {filtered.length === 0 && !loading && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No employees found. Click "Invite Employee" to onboard team members.
            </div>
          )}
        </div>
      )}

      {/* ── Invite Employee Modal ── */}
      {isInviteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <Card
            glass
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '2rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '16px',
              boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            }}
          >
            {inviteSuccessMsg ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'rgba(22,163,74,0.15)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, margin: 0 }}>
                  Invitation Sent!
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '0.5rem' }}>
                  {inviteSuccessMsg}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '0.25rem' }}>
                  The employee will receive instructions to accept the invitation and set up their password.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInvite}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
                      Invite Company Employee
                    </h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                      Add a team member to {companyName}'s corporate travel roster
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--text-muted)' }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.25rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Almaz Bekele"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                      Work Email *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. almaz.b@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                      Employee ID / Badge
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. EMP-304"
                      value={inviteEmployeeId}
                      onChange={(e) => setInviteEmployeeId(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                      Department *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Finance, Sales, Engineering"
                      value={inviteDepartment}
                      onChange={(e) => setInviteDepartment(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                      Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Regional Manager"
                      value={inviteJobTitle}
                      onChange={(e) => setInviteJobTitle(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                      Corporate Role *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {CORPORATE_ROLES.map((r) => (
                        <div
                          key={r.role}
                          onClick={() => setInviteRole(r.role)}
                          style={{
                            padding: '0.6rem 0.75rem',
                            borderRadius: '8px',
                            border: `1.5px solid ${inviteRole === r.role ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                            backgroundColor: inviteRole === r.role ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '11px', color: inviteRole === r.role ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                            {r.label}
                          </div>
                          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            {r.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={invitePhone}
                      onChange={(e) => setInvitePhone(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Temporary Password Box */}
                  <div style={{ gridColumn: '1 / -1', padding: '0.85rem', borderRadius: '8px', backgroundColor: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--brand-primary)' }}>
                        Temporary Password (First-Time Login)
                      </label>
                      <button
                        type="button"
                        onClick={handleRandomizePassword}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--brand-primary)',
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <RotateCcw size={10} /> Generate New
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <KeyRound size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }} />
                      <input
                        type="text"
                        value={inviteTempPassword}
                        onChange={(e) => setInviteTempPassword(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.6rem 0.5rem 2rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(37, 99, 235, 0.3)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--brand-primary)',
                          fontWeight: 800,
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.4 }}>
                      🔒 The employee will be required to create their permanent private password when they first log in.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <Button variant="ghost" type="button" onClick={() => setIsInviteModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={isSubmitting} icon={<Send size={15} />}>
                    {isSubmitting ? 'Creating Employee...' : 'Create Employee & Generate Credentials'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* ── Credentials Created Confirmation Dialog ── */}
      {credentialsModalData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1.25rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: 'var(--bg-primary, #ffffff)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(37, 99, 235, 0.08) 100%)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Employee Account Created</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                  Ready to share credentials with team member
                </p>
              </div>
            </div>

            {/* Content & Credentials Box */}
            <div style={{ padding: '1.5rem' }}>
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary, #f8fafc)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Employee Name:</span>
                  <span style={{ fontWeight: 700 }}>{credentialsModalData.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned Role:</span>
                  <span style={{ fontWeight: 700, color: ROLE_COLORS[credentialsModalData.role] || 'inherit' }}>
                    {CORPORATE_ROLES.find((r) => r.role === credentialsModalData.role)?.label || credentialsModalData.role}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Login Email:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{credentialsModalData.email}</span>
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.2rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Temporary Password:</span>
                  <span
                    style={{
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      color: 'var(--brand-primary)',
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '13px',
                    }}
                  >
                    {credentialsModalData.tempPassword}
                  </span>
                </div>
              </div>

              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  color: '#b45309',
                  fontSize: '11px',
                  lineHeight: 1.4,
                  marginBottom: '1.25rem',
                }}
              >
                🔒 <strong>First-Time Password Reset:</strong> When this employee signs in, the system will automatically prompt them to set their permanent private password.
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button
                  variant="primary"
                  onClick={handleCopyCredentials}
                  icon={copied ? <Check size={15} /> : <Copy size={15} />}
                  style={{ flex: 1, backgroundColor: copied ? '#10b981' : undefined }}
                >
                  {copied ? 'Credentials Copied!' : 'Copy Credentials'}
                </Button>
                <Button variant="ghost" onClick={() => setCredentialsModalData(null)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

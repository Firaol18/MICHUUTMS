import React, { useState, useEffect } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { Modal } from '@tms/shared/components/common/Modal';
import { Badge } from '@tms/shared/components/common/Badge';
import { http } from '@tms/shared/services/apiClient';
import { Building2, Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export interface SupplierItem {
  id: string;
  name: string;
  category: 'Hotel & Lodge' | 'Transport & 4x4' | 'Catering' | 'Aviation' | 'Equipment';
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  status: 'Active' | 'Inactive';
  rating: number;
}

export const AdminSuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<SupplierItem['category']>('Hotel & Lodge');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');

  const fetchSuppliers = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await http.get('/suppliers');
      setSuppliers(
        Array.isArray(res.data)
          ? res.data.map((s: any) => ({
              id: String(s.id),
              name: s.name,
              category: s.category || 'Hotel & Lodge',
              contactPerson: s.contactPerson || '',
              phone: s.phone || '',
              email: s.email || '',
              city: s.location || s.city || '',
              status: s.status || 'Active',
              rating: Number(s.rating) || 5.0,
            }))
          : []
      );
    } catch (err: any) {
      setApiError('Failed to load suppliers from server.');
      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setCategory('Hotel & Lodge');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setCity('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      await http.patch(`/suppliers/${editingId}`, { name, category, contactPerson, phone, email, location: city });
    } else {
      await http.post('/suppliers', {
        name,
        category,
        contactPerson: contactPerson || 'Operations Contact',
        phone: phone || '+251 911 000 000',
        email: email || 'contact@supplier.et',
        location: city || 'Addis Ababa',
        status: 'Active',
        rating: 5.0,
      });
    }
    await fetchSuppliers();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await http.delete(`/suppliers/${id}`);
    await fetchSuppliers();
  };


  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEntries = filtered.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalEntries);
  const currentSuppliersPage = filtered.slice(startIndex, endIndex);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 style={{ color: '#034ea2' }} /> Suppliers & Tourism Vendors
            </h1>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Manage hotel partners, transport fleets, catering vendors, and equipment suppliers
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={16} />}
            onClick={handleOpenAdd}
            style={{ backgroundColor: '#034ea2', borderColor: '#034ea2', fontWeight: 700 }}
          >
            + Create Supplier
          </Button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', backgroundColor: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative', minWidth: 280, flex: 1, maxWidth: 450 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search suppliers by name, category, or city..."
            style={{
              width: '100%',
              padding: '0.45rem 0.875rem 0.45rem 2.25rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-xs)',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Rows Per Page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}
          >
            <option value={5}>5 Rows</option>
            <option value={10}>10 Rows</option>
            <option value={25}>25 Rows</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <Card glass style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, width: 50, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}># ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, minWidth: 200, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>SUPPLIER NAME ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, minWidth: 120, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>CATEGORY ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, minWidth: 180, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>CONTACT PERSON ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, minWidth: 140, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>LOCATION ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 800, width: 100, minWidth: 100, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>STATUS ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 800, width: 160, minWidth: 160, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentSuppliersPage.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No supplier records match your search criteria.
                </td>
              </tr>
            ) : (
              currentSuppliersPage.map((sup, idx) => (
                <tr key={sup.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{startIndex + idx + 1}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{sup.name}</div>
                    <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, marginTop: 2 }}>★ {sup.rating} Rating</div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}><Badge variant="info">{sup.category}</Badge></td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontWeight: 700 }}>{sup.contactPerson}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600 }}>{sup.phone}</span> · {sup.email}
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>📍 {sup.city}</td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <Badge variant={sup.status === 'Active' ? 'success' : 'danger'}>{sup.status}</Badge>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(sup.id);
                          setName(sup.name);
                          setCategory(sup.category);
                          setContactPerson(sup.contactPerson);
                          setPhone(sup.phone);
                          setEmail(sup.email);
                          setCity(sup.city);
                          setIsModalOpen(true);
                        }}
                        style={{
                          padding: '0.4rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid rgba(37,99,235,0.3)',
                          backgroundColor: 'rgba(37,99,235,0.08)',
                          color: 'var(--brand-primary)',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                                                  }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button type="button" onClick={() => handleDelete(sup.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2, display: 'inline-flex', alignItems: 'center' }} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── PAGINATION FOOTER ── */}
        <div className="flex-between" style={{ padding: '0.875rem 1rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Showing <strong>{totalEntries === 0 ? 0 : startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{totalEntries}</strong> suppliers
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}
            >
              <ChevronLeft size={14} /> Previous
            </Button>

            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, padding: '0 0.5rem' }}>
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}
            >
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Supplier' : 'Add New Supplier'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Supplier Company Name *" value={name} onChange={(e) => setName(e.target.value)} required />
          
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SupplierItem['category'])}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
            >
              <option value="Hotel & Lodge">Hotel & Lodge</option>
              <option value="Transport & 4x4">Transport & 4x4</option>
              <option value="Catering">Catering</option>
              <option value="Aviation">Aviation</option>
              <option value="Equipment">Equipment</option>
            </select>
          </div>

          <Input label="Contact Person Full Name" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
          <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Location City" value={city} onChange={(e) => setCity(e.target.value)} />

          <Button variant="primary" size="sm" type="submit" style={{ backgroundColor: '#034ea2', borderColor: '#034ea2', fontWeight: 700 }}>
            {editingId ? 'Save Changes' : 'Save Supplier'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

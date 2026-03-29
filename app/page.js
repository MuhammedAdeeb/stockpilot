'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

// ─── API helpers ─────────────────────────────────────────────
async function api(path, options = {}) {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── Toast ───────────────────────────────────────────────────
function Toast({ message, isError, onDone }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [message, onDone]);
  if (!message) return null;
  return <div className={`toast${isError ? ' error' : ''}`}>{message}</div>;
}

// ─── Spinner ─────────────────────────────────────────────────
function Spinner() {
  return <div className="loading"><div className="spinner" /><span>Loading...</span></div>;
}

// ─── Modal ───────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);
  return (
    <div className={`modal-overlay${open ? ' open' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{title}</div>
        {children}
      </div>
    </div>
  );
}

// ─── Stock Bar ───────────────────────────────────────────────
function StockBar({ units, max }) {
  const pct = max > 0 ? Math.max(Math.round((units / max) * 100), 0) : 0;
  const col = units === 0 ? 'var(--red)' : units < 10 ? 'var(--orange)' : 'var(--green)';
  return (
    <div className="stock-bar-wrap">
      <div className="stock-bar-bg">
        <div className="stock-bar-fill" style={{ width: `${pct}%`, background: col }} />
      </div>
    </div>
  );
}

function StockBadge({ units }) {
  if (units === 0) return <span className="badge badge-red">Out of Stock</span>;
  if (units < 10)  return <span className="badge badge-orange">Low Stock</span>;
  return <span className="badge badge-green">In Stock</span>;
}

function StatusBadge({ status }) {
  const cls = status === 'Completed' ? 'badge-green' : status === 'Returned' ? 'badge-red' : 'badge-blue';
  return <span className={`badge ${cls}`}>{status}</span>;
}

// ─── Donut Chart ─────────────────────────────────────────────
function DonutChart({ pending, completed, returned }) {
  const circ = 220;
  const total = (pending + completed + returned) || 1;
  const pendLen = circ * (pending / total);
  const compLen = circ * (completed / total);
  const retLen  = circ * (returned  / total);
  return (
    <div className="donut-wrap">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r="35" fill="none" stroke="var(--surface2)" strokeWidth="14" />
        <circle cx="45" cy="45" r="35" fill="none" stroke="var(--accent2)" strokeWidth="14"
          strokeDasharray={`${pendLen} ${circ - pendLen}`} strokeDashoffset={0}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'all 0.5s' }} />
        <circle cx="45" cy="45" r="35" fill="none" stroke="var(--green)" strokeWidth="14"
          strokeDasharray={`${compLen} ${circ - compLen}`} strokeDashoffset={-pendLen}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'all 0.5s' }} />
        <circle cx="45" cy="45" r="35" fill="none" stroke="var(--red)" strokeWidth="14"
          strokeDasharray={`${retLen} ${circ - retLen}`} strokeDashoffset={-(pendLen + compLen)}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'all 0.5s' }} />
      </svg>
      <div className="donut-legend">
        <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--accent2)' }} /><span>Pending: {pending}</span></div>
        <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--green)' }} /><span>Completed: {completed}</span></div>
        <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--red)' }} /><span>Returned: {returned}</span></div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════
function Dashboard({ refreshTick }) {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api('/dashboard'), api('/products')])
      .then(([s, p]) => { setStats(s); setProducts(p); })
      .finally(() => setLoading(false));
  }, [refreshTick]); // re-runs every time any mutation happens anywhere

  const lowStock = products.filter(p => Number(p.units) <= 10).sort((a, b) => Number(a.units) - Number(b.units));
  const maxUnits = Math.max(...products.map(p => Number(p.units)), 1);
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <>
      <div className="page-header">
        <div className="page-title">Dashboard <span>Overview</span></div>
        <div className="mono">{today}</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card yellow">
          <div className="stat-label">Total Products</div>
          <div className="stat-value yellow">{loading ? '—' : String(stats?.total_products ?? 0)}</div>
          <div className="stat-sub">SKUs in catalog</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value blue">{loading ? '—' : String(stats?.total_orders ?? 0)}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Completed</div>
          <div className="stat-value green">{loading ? '—' : String(stats?.completed ?? 0)}</div>
          <div className="stat-sub">Fulfilled orders</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Returned</div>
          <div className="stat-value red">{loading ? '—' : String(stats?.returned ?? 0)}</div>
          <div className="stat-sub">Return requests</div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-card-title">Stock Levels</div>
          <div className="bar-chart">
            {loading ? <Spinner /> : products.length === 0
              ? <div style={{ color: 'var(--muted)', fontSize: 12, width: '100%', textAlign: 'center' }}>Add products to see chart</div>
              : products.slice(0, 6).map(p => {
                  const u = Number(p.units);
                  const pct = Math.max(Math.round((u / maxUnits) * 100), 4);
                  const col = u === 0 ? 'var(--red)' : u < 10 ? 'var(--orange)' : 'var(--accent)';
                  return (
                    <div key={p.id} className="bar-col">
                      <div className="bar" style={{ height: `${pct}%`, background: col }} />
                      <div className="bar-label">{p.name.split(' ')[0]}</div>
                    </div>
                  );
                })}
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-card-title">Order Status</div>
          {loading || !stats
            ? <Spinner />
            : <DonutChart pending={Number(stats.pending)} completed={Number(stats.completed)} returned={Number(stats.returned)} />}
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-header"><div className="table-title">Low Stock Alert</div></div>
        <table>
          <thead><tr><th>Product</th><th>Price</th><th>Units Left</th><th>Status</th></tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={4}><Spinner /></td></tr>
              : lowStock.length === 0
                ? <tr><td colSpan={4}><div className="empty-state"><div className="icon">✓</div><p>All products are well-stocked!</p></div></td></tr>
                : lowStock.map(p => (
                    <tr key={p.id}>
                      <td className="font-head">{p.name}</td>
                      <td className="text-accent">₹{Number(p.price).toLocaleString()}</td>
                      <td>{Number(p.units)}</td>
                      <td><StockBadge units={Number(p.units)} /></td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
//  PRODUCTS
// ════════════════════════════════════════════════════════════
function Products({ toast, onMutate }) {
  const [products, setProducts] = useState(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', units: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const p = await api('/products'); setProducts(p);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ name: '', price: '', units: '' }); setModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, price: p.price, units: p.units }); setModal(true); };

  const save = async () => {
    if (!form.name || form.price === '' || form.units === '') { toast('Please fill all fields.', true); return; }
    setSaving(true);
    try {
      if (editing) {
        await api(`/products/${editing.id}`, { method: 'PUT', body: { name: form.name, price: +form.price, units: +form.units } });
        toast('Product updated!');
      } else {
        await api('/products', { method: 'POST', body: { name: form.name, price: +form.price, units: +form.units } });
        toast('Product added!');
      }
      setModal(false);
      await load();
      onMutate(); // notify root to refresh dashboard
    } catch (e) { toast(e.message, true); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      toast('Product deleted.');
      await load();
      onMutate();
    } catch (e) { toast(e.message, true); }
  };

  const filtered = (products || []).filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const maxUnits = Math.max(...(products || []).map(p => Number(p.units)), 1);

  return (
    <>
      <div className="page-header">
        <div className="page-title">Products <span>Catalog</span></div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Product</button>
      </div>
      <div className="table-wrap">
        <div className="table-header">
          <div className="table-title">All Products</div>
          <input className="search-input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <table>
          <thead><tr><th>Name</th><th>Price</th><th>Units</th><th>Stock Level</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {products === null ? <tr><td colSpan={6}><Spinner /></td></tr>
              : filtered.length === 0 ? <tr><td colSpan={6}><div className="empty-state"><div className="icon">▦</div><p>No products found.</p></div></td></tr>
              : filtered.map(p => (
                  <tr key={p.id}>
                    <td className="font-head">{p.name}</td>
                    <td className="text-accent">₹{Number(p.price).toLocaleString()}</td>
                    <td>{Number(p.units)}</td>
                    <td><StockBar units={Number(p.units)} max={maxUnits} /></td>
                    <td><StockBadge units={Number(p.units)} /></td>
                    <td><div className="actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}>Delete</button>
                    </div></td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <div className="form-group"><label className="form-label">Product Name</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Wireless Headphones" /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Price (₹)</label><input className="form-input" type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" /></div>
          <div className="form-group"><label className="form-label">Units in Stock</label><input className="form-input" type="number" min="0" value={form.units} onChange={e => setForm(f => ({ ...f, units: e.target.value }))} placeholder="0" /></div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
        </div>
      </Modal>
    </>
  );
}

// ════════════════════════════════════════════════════════════
//  CUSTOMERS
// ════════════════════════════════════════════════════════════
function Customers({ toast, onMutate }) {
  const [customers, setCustomers] = useState(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const c = await api('/customers'); setCustomers(c);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ name: '', phone: '', address: '' }); setModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, phone: c.phone, address: c.address }); setModal(true); };

  const save = async () => {
    if (!form.name || !form.phone || !form.address) { toast('Please fill all fields.', true); return; }
    setSaving(true);
    try {
      if (editing) {
        await api(`/customers/${editing.id}`, { method: 'PUT', body: form });
        toast('Customer updated!');
      } else {
        await api('/customers', { method: 'POST', body: form });
        toast('Customer added!');
      }
      setModal(false);
      await load();
      onMutate();
    } catch (e) { toast(e.message, true); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await api(`/customers/${id}`, { method: 'DELETE' });
      toast('Customer deleted.');
      await load();
      onMutate();
    } catch (e) { toast(e.message, true); }
  };

  const filtered = (customers || []).filter(c =>
    `${c.name} ${c.phone} ${c.address}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div className="page-title">Customers <span>Directory</span></div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Customer</button>
      </div>
      <div className="table-wrap">
        <div className="table-header">
          <div className="table-title">All Customers</div>
          <input className="search-input" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <table>
          <thead><tr><th>Name</th><th>Phone</th><th>Address</th><th>Orders</th><th>Actions</th></tr></thead>
          <tbody>
            {customers === null ? <tr><td colSpan={5}><Spinner /></td></tr>
              : filtered.length === 0 ? <tr><td colSpan={5}><div className="empty-state"><div className="icon">◉</div><p>No customers found.</p></div></td></tr>
              : filtered.map(c => (
                  <tr key={c.id}>
                    <td className="font-head">{c.name}</td>
                    <td className="mono" style={{ color: 'var(--text)' }}>{c.phone}</td>
                    <td>{c.address}</td>
                    <td><span className="badge badge-yellow">{Number(c.order_count)} order{Number(c.order_count) !== 1 ? 's' : ''}</span></td>
                    <td><div className="actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(c.id)}>Delete</button>
                    </div></td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Customer' : 'Add Customer'}>
        <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Arjun Menon" /></div>
        <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" /></div>
        <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street, City, State" /></div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Customer'}</button>
        </div>
      </Modal>
    </>
  );
}

// ════════════════════════════════════════════════════════════
//  ORDERS
// ════════════════════════════════════════════════════════════
function Orders({ toast, onMutate }) {
  const [orders, setOrders] = useState(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ customer_id: '', product_id: '', qty: 1, status: 'Pending' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const o = await api('/orders'); setOrders(o);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = async () => {
    const [c, p] = await Promise.all([api('/customers'), api('/products')]);
    setCustomers(c);
    setProducts(p.filter(x => Number(x.units) > 0));
    setForm({ customer_id: c[0]?.id || '', product_id: p.find(x => Number(x.units) > 0)?.id || '', qty: 1, status: 'Pending' });
    setModal(true);
  };

  const selectedProduct = products.find(p => p.id === form.product_id);
  const orderTotal = selectedProduct ? Number(selectedProduct.price) * (Number(form.qty) || 0) : 0;

  const save = async () => {
    if (!form.customer_id || !form.product_id || !form.qty) { toast('Please fill all fields.', true); return; }
    setSaving(true);
    try {
      await api('/orders', { method: 'POST', body: { ...form, qty: +form.qty } });
      toast('Order placed!');
      setModal(false);
      await load();
      onMutate();
    } catch (e) { toast(e.message, true); }
    finally { setSaving(false); }
  };

  const changeStatus = async (id, status) => {
    try {
      await api(`/orders/${id}`, { method: 'PATCH', body: { status } });
      toast(`Order ${id} → ${status}`);
      await load();
      onMutate();
    } catch (e) { toast(e.message, true); load(); }
  };

  const del = async (id) => {
    if (!confirm('Delete this order?')) return;
    try {
      await api(`/orders/${id}`, { method: 'DELETE' });
      toast('Order deleted.');
      await load();
      onMutate();
    } catch (e) { toast(e.message, true); }
  };

  const filtered = (orders || []).filter(o =>
    `${o.id} ${o.customer_name} ${o.product_name} ${o.status}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div className="page-title">Orders <span>Management</span></div>
        <button className="btn btn-primary" onClick={openAdd}>＋ New Order</button>
      </div>
      <div className="table-wrap">
        <div className="table-header">
          <div className="table-title">All Orders</div>
          <input className="search-input" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <table>
          <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Qty</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {orders === null ? <tr><td colSpan={8}><Spinner /></td></tr>
              : filtered.length === 0 ? <tr><td colSpan={8}><div className="empty-state"><div className="icon">◫</div><p>No orders found.</p></div></td></tr>
              : filtered.map(o => (
                  <tr key={o.id}>
                    <td className="mono" style={{ color: 'var(--accent)' }}>{o.id}</td>
                    <td className="font-head">{o.customer_name || '—'}</td>
                    <td>{o.product_name || '—'}</td>
                    <td>{Number(o.qty)}</td>
                    <td className="text-green">₹{Number(o.total).toLocaleString()}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="mono" style={{ color: 'var(--text)' }}>{o.date}</td>
                    <td><div className="actions">
                      <select className="form-select" style={{ padding: '4px 8px', fontSize: 12, width: 120 }}
                        value={o.status} onChange={e => changeStatus(o.id, e.target.value)}>
                        <option>Pending</option>
                        <option>Completed</option>
                        <option>Returned</option>
                      </select>
                      <button className="btn btn-danger btn-sm" onClick={() => del(o.id)}>✕</button>
                    </div></td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="New Order">
        <div className="form-group">
          <label className="form-label">Customer</label>
          <select className="form-select" value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}>
            {customers.length === 0 ? <option disabled>No customers — add one first</option>
              : customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Product</label>
          <select className="form-select" value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}>
            {products.length === 0 ? <option disabled>No products in stock</option>
              : products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{Number(p.price).toLocaleString()}) — {Number(p.units)} left</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input className="form-input" type="number" min="1" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Total</label>
            <input className="form-input" readOnly value={`₹${orderTotal.toLocaleString()}`} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option>Pending</option><option>Completed</option><option>Returned</option>
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Placing...' : 'Place Order'}</button>
        </div>
      </Modal>
    </>
  );
}

// ════════════════════════════════════════════════════════════
//  ROOT APP
// ════════════════════════════════════════════════════════════
export default function Home() {
  const [page, setPage] = useState('dashboard');
  const [refreshTick, setRefreshTick] = useState(0);
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState(false);

  const showToast = useCallback((msg, isError = false) => {
    setToastMsg(msg); setToastError(isError);
  }, []);

  // Called by any page after any add/edit/delete — increments tick which Dashboard watches
  const onMutate = useCallback(() => {
    setRefreshTick(t => t + 1);
  }, []);

  const navItems = [
    { key: 'dashboard', icon: '◈', label: 'Dashboard' },
    { key: 'products',  icon: '▦', label: 'Products' },
    { key: 'orders',    icon: '◫', label: 'Orders' },
    { key: 'customers', icon: '◉', label: 'Customers' },
  ];

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="logo">StockPilot<span>Inventory System</span></div>
        <div className="nav">
          {navItems.map(n => (
            <div key={n.key} className={`nav-link${page === n.key ? ' active' : ''}`} onClick={() => setPage(n.key)}>
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </div>
          ))}
        </div>
      </nav>

      <main className="main">
        {/* Dashboard always stays mounted and reacts to refreshTick */}
        <div style={{ display: page === 'dashboard' ? 'block' : 'none' }}>
          <Dashboard refreshTick={refreshTick} />
        </div>
        {page === 'products'  && <Products  key="products"  toast={showToast} onMutate={onMutate} />}
        {page === 'orders'    && <Orders    key="orders"    toast={showToast} onMutate={onMutate} />}
        {page === 'customers' && <Customers key="customers" toast={showToast} onMutate={onMutate} />}
      </main>

      <Toast message={toastMsg} isError={toastError} onDone={() => setToastMsg('')} />
    </div>
  );
}

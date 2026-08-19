/**
 * Aegis IAM Dashboard - Client Script (Single Page Application)
 */

// Global Application State
const state = {
  currentSection: 'employees', // employees, service-accounts, users, login-history, roles, permission-resources, permission-actions
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  },
  filters: {
    search: '',
    isActive: '',
    department: '',
    roleId: ''
  },
  // Cache for associations
  roles: [],
  resources: [],
  actions: []
};

// API Base URL
const API_BASE = 'http://localhost:3000';

// DOM Elements Cache
const elements = {
  viewTitle: document.getElementById('view-title'),
  viewSubtitle: document.getElementById('view-subtitle'),
  globalSearchInput: document.getElementById('global-search-input'),
  searchClearBtn: document.getElementById('search-clear-btn'),
  headerActionBtn: document.getElementById('header-action-btn'),
  headerActionText: document.getElementById('header-action-text'),
  statsStrip: document.getElementById('view-stats-strip'),
  filtersPanel: document.getElementById('view-filters-panel'),
  tableHeaderRow: document.getElementById('table-header-row'),
  tableBody: document.getElementById('table-body'),
  tableEmptyState: document.getElementById('table-empty-state'),
  tablePaginationNav: document.getElementById('table-pagination-nav'),
  pageRange: document.getElementById('page-range'),
  totalRecords: document.getElementById('total-records'),
  btnPagePrev: document.getElementById('btn-page-prev'),
  btnPageNext: document.getElementById('btn-page-next'),
  paginationPagesList: document.getElementById('pagination-pages-list'),
  toastContainer: document.getElementById('toast-container'),
  
  // Modal DOM
  modalContainer: document.getElementById('modal-container'),
  modalTitle: document.getElementById('modal-title'),
  modalForm: document.getElementById('modal-form'),
  modalCancelBtn: document.getElementById('modal-cancel-btn'),
  modalSubmitBtn: document.getElementById('modal-submit-btn'),
  modalSubmitText: document.getElementById('modal-submit-text'),
  closeModalBtn: document.getElementById('close-modal-btn')
};

// Section Configuration Registry
const sectionConfig = {
  employees: {
    title: 'Employees List',
    subtitle: 'Manage organization employee profiles and access rights.',
    actionText: 'Add Employee',
    hasAction: true,
    hasFilters: true,
    endpoint: '/employees'
  },
  'service-accounts': {
    title: 'Service Accounts',
    subtitle: 'Administer automated client credentials and secure API keys.',
    actionText: 'Add Service Account',
    hasAction: true,
    hasFilters: true,
    endpoint: '/service-accounts'
  },
  users: {
    title: 'Registered Users',
    subtitle: 'Manage front-facing consumer and customer access accounts.',
    actionText: 'Add User',
    hasAction: true,
    hasFilters: true,
    endpoint: '/users'
  },
  'login-history': {
    title: 'Employee Login History',
    subtitle: 'Audit access logs, connection IP addresses, and browsers.',
    actionText: '',
    hasAction: false,
    hasFilters: false,
    endpoint: '/login-history'
  },
  roles: {
    title: 'Access Roles',
    subtitle: 'Define role access templates and map actions to system resources.',
    actionText: 'Create Role',
    hasAction: true,
    hasFilters: false,
    endpoint: '/roles'
  },
  'permission-resources': {
    title: 'Permission Resources',
    subtitle: 'System endpoints and models configured for security policies.',
    actionText: 'New Resource',
    hasAction: true,
    hasFilters: false,
    endpoint: '/permissions/resources'
  },
  'permission-actions': {
    title: 'Permission Actions',
    subtitle: 'Granular operations permissible on system resources (CRUD).',
    actionText: 'New Action',
    hasAction: true,
    hasFilters: false,
    endpoint: '/permissions/actions'
  }
};

// Initialize the Application
window.addEventListener('DOMContentLoaded', async () => {
  setupSidebarNavigation();
  setupEventListeners();
  
  // Initial Cache Load
  await refreshCache();
  
  // Load initial view
  const hash = window.location.hash.replace('#', '') || 'employees';
  navigateToSection(hash);
});

// Refresh global associations caches (Roles, Resources, Actions)
async function refreshCache() {
  try {
    const rolesRes = await fetch(`${API_BASE}/roles`);
    if (rolesRes.ok) state.roles = await rolesRes.json();

    const resourcesRes = await fetch(`${API_BASE}/permissions/resources`);
    if (resourcesRes.ok) state.resources = await resourcesRes.json();

    const actionsRes = await fetch(`${API_BASE}/permissions/actions`);
    if (actionsRes.ok) state.actions = await actionsRes.json();
  } catch (error) {
    showToast('Failed to fetch support cache data from API server', 'error');
    console.error(error);
  }
}

// Navigation flow
function navigateToSection(section) {
  if (!sectionConfig[section]) return;
  
  state.currentSection = section;
  state.pagination.page = 1;
  
  // Clear section-specific filters, retain search if appropriate
  state.filters.isActive = '';
  state.filters.department = '';
  state.filters.roleId = '';
  state.filters.search = '';
  elements.globalSearchInput.value = '';
  elements.searchClearBtn.style.display = 'none';

  // Update Sidebar active state
  document.querySelectorAll('.sidebar-menu a').forEach(el => {
    el.classList.remove('active');
  });
  const activeBtn = document.getElementById(`nav-btn-${section}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Update Header UI
  const config = sectionConfig[section];
  elements.viewTitle.innerText = config.title;
  elements.viewSubtitle.innerText = config.subtitle;
  
  if (config.hasAction) {
    elements.headerActionBtn.style.display = 'flex';
    elements.headerActionText.innerText = config.actionText;
  } else {
    elements.headerActionBtn.style.display = 'none';
  }

  // Render Section-specific features
  renderFilters();
  
  // Fetch & Render Grid
  fetchAndRenderGrid();
}

// Setup Left Sidebar Listeners
function setupSidebarNavigation() {
  document.querySelectorAll('.sidebar-menu a').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('href').replace('#', '');
      window.location.hash = target;
      navigateToSection(target);
    });
  });
  
  // Handle backward/forward browser navigation
  window.addEventListener('hashchange', () => {
    const target = window.location.hash.replace('#', '') || 'employees';
    if (target !== state.currentSection) {
      navigateToSection(target);
    }
  });
}

// Setup form and general listeners
function setupEventListeners() {
  // Search bar input
  let searchTimeout;
  elements.globalSearchInput.addEventListener('input', (e) => {
    state.filters.search = e.target.value;
    elements.searchClearBtn.style.display = e.target.value ? 'block' : 'none';
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.pagination.page = 1;
      fetchAndRenderGrid();
    }, 300);
  });

  // Clear search button
  elements.searchClearBtn.addEventListener('click', () => {
    elements.globalSearchInput.value = '';
    state.filters.search = '';
    elements.searchClearBtn.style.display = 'none';
    state.pagination.page = 1;
    fetchAndRenderGrid();
  });

  // Pagination navigation clicks
  elements.btnPagePrev.addEventListener('click', () => {
    if (state.pagination.page > 1) {
      state.pagination.page--;
      fetchAndRenderGrid();
    }
  });

  elements.btnPageNext.addEventListener('click', () => {
    if (state.pagination.page < state.pagination.totalPages) {
      state.pagination.page++;
      fetchAndRenderGrid();
    }
  });

  // Header Add Action Button click
  elements.headerActionBtn.addEventListener('click', () => {
    openCreateModal();
  });

  // Modal actions
  elements.closeModalBtn.addEventListener('click', closeModal);
  elements.modalCancelBtn.addEventListener('click', closeModal);
  elements.modalForm.addEventListener('submit', handleFormSubmit);
}

// Render dynamic filter panels
function renderFilters() {
  const container = elements.filtersPanel;
  container.innerHTML = '';
  
  if (!sectionConfig[state.currentSection].hasFilters) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'flex';

  // Active status filter (used for Employees, ServiceAccounts, Users)
  const statusGroup = document.createElement('div');
  statusGroup.className = 'filter-group';
  statusGroup.innerHTML = `
    <label for="filter-status">Status</label>
    <select id="filter-status" class="filter-input">
      <option value="">All Statuses</option>
      <option value="true" ${state.filters.isActive === 'true' ? 'selected' : ''}>Active</option>
      <option value="false" ${state.filters.isActive === 'false' ? 'selected' : ''}>Inactive</option>
    </select>
  `;
  container.appendChild(statusGroup);
  
  statusGroup.querySelector('select').addEventListener('change', (e) => {
    state.filters.isActive = e.target.value;
    state.pagination.page = 1;
    fetchAndRenderGrid();
  });

  // Department filter for Employees
  if (state.currentSection === 'employees') {
    const deptGroup = document.createElement('div');
    deptGroup.className = 'filter-group';
    deptGroup.innerHTML = `
      <label for="filter-dept">Department</label>
      <select id="filter-dept" class="filter-input">
        <option value="">All Departments</option>
        <option value="Engineering" ${state.filters.department === 'Engineering' ? 'selected' : ''}>Engineering</option>
        <option value="Operations" ${state.filters.department === 'Operations' ? 'selected' : ''}>Operations</option>
        <option value="Marketing" ${state.filters.department === 'Marketing' ? 'selected' : ''}>Marketing</option>
        <option value="HR" ${state.filters.department === 'HR' ? 'selected' : ''}>HR</option>
      </select>
    `;
    container.appendChild(deptGroup);
    
    deptGroup.querySelector('select').addEventListener('change', (e) => {
      state.filters.department = e.target.value;
      state.pagination.page = 1;
      fetchAndRenderGrid();
    });
  }

  // Role filter for Employees / Service Accounts / Users
  if (['employees', 'service-accounts', 'users'].includes(state.currentSection)) {
    const roleOptions = state.roles.map(r => `<option value="${r.id}" ${state.filters.roleId == r.id ? 'selected' : ''}>${r.name}</option>`).join('');
    const roleGroup = document.createElement('div');
    roleGroup.className = 'filter-group';
    roleGroup.innerHTML = `
      <label for="filter-role">Role</label>
      <select id="filter-role" class="filter-input">
        <option value="">All Roles</option>
        ${roleOptions}
      </select>
    `;
    container.appendChild(roleGroup);
    
    roleGroup.querySelector('select').addEventListener('change', (e) => {
      state.filters.roleId = e.target.value;
      state.pagination.page = 1;
      fetchAndRenderGrid();
    });
  }

  // Reset filter button
  const clearBtn = document.createElement('button');
  clearBtn.className = 'filter-clear-btn';
  clearBtn.innerText = 'Reset Filters';
  clearBtn.addEventListener('click', () => {
    state.filters.isActive = '';
    state.filters.department = '';
    state.filters.roleId = '';
    state.filters.search = '';
    elements.globalSearchInput.value = '';
    elements.searchClearBtn.style.display = 'none';
    
    // Reset selections
    const statusSelect = document.getElementById('filter-status');
    if (statusSelect) statusSelect.value = '';
    const deptSelect = document.getElementById('filter-dept');
    if (deptSelect) deptSelect.value = '';
    const roleSelect = document.getElementById('filter-role');
    if (roleSelect) roleSelect.value = '';

    state.pagination.page = 1;
    fetchAndRenderGrid();
  });
  container.appendChild(clearBtn);
}

// Toast notification helper
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-content">${message}</div>
    <button class="toast-close">&times;</button>
  `;
  
  elements.toastContainer.appendChild(toast);
  
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });
  
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Fetch lists from endpoint and trigger renders
async function fetchAndRenderGrid() {
  const section = state.currentSection;
  const config = sectionConfig[section];
  
  // Construct API Url params
  const params = new URLSearchParams();
  
  // Only paginate if it's not resource, action, or roles grids (roles/actions/resources are generally flat lists in simple UI)
  const shouldPaginate = ['employees', 'service-accounts', 'users', 'login-history'].includes(section);
  
  if (shouldPaginate) {
    params.append('page', state.pagination.page);
    params.append('limit', state.pagination.limit);
  }
  
  if (state.filters.search) params.append('search', state.filters.search);
  if (state.filters.isActive) params.append('isActive', state.filters.isActive);
  if (state.filters.department) params.append('department', state.filters.department);
  if (state.filters.roleId) params.append('roleId', state.filters.roleId);

  let url = `${API_BASE}${config.endpoint}`;
  if (params.toString()) url += `?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    
    if (shouldPaginate) {
      state.pagination.total = data.total || 0;
      state.pagination.totalPages = data.totalPages || 1;
      renderTable(data.items || []);
      renderPagination();
      renderStats(data.total || 0);
    } else {
      // flat list
      renderTable(data);
      elements.tablePaginationNav.style.display = 'none';
      renderStats(data.length || 0);
    }
  } catch (error) {
    showToast(`Failed to load data for ${section}`, 'error');
    console.error(error);
  }
}

// Renders the stats block depending on the section
function renderStats(totalRecordsCount) {
  const container = elements.statsStrip;
  container.innerHTML = '';
  
  const section = state.currentSection;
  let statsHTML = '';
  
  if (section === 'employees') {
    const active = state.roles.length; // Placeholder calculation or count
    statsHTML = `
      <div class="stat-card">
        <div class="stat-details">
          <span class="stat-title">Total Staff</span>
          <span class="stat-value">${totalRecordsCount}</span>
        </div>
        <div class="stat-icon-wrapper">
          <svg viewBox="0 0 24 24" class="stat-icon"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-details">
          <span class="stat-title">Security Roles</span>
          <span class="stat-value">${state.roles.length}</span>
        </div>
        <div class="stat-icon-wrapper">
          <svg viewBox="0 0 24 24" class="stat-icon"><path d="M12 2c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l2.79-2.79C10.09 18.66 11.03 19 12 19c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-details">
          <span class="stat-title">API Gateways</span>
          <span class="stat-value">${state.resources.length}</span>
        </div>
        <div class="stat-icon-wrapper">
          <svg viewBox="0 0 24 24" class="stat-icon"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/></svg>
        </div>
      </div>
    `;
  } else if (section === 'service-accounts') {
    statsHTML = `
      <div class="stat-card">
        <div class="stat-details">
          <span class="stat-title">Service Clients</span>
          <span class="stat-value">${totalRecordsCount}</span>
        </div>
        <div class="stat-icon-wrapper">
          <svg viewBox="0 0 24 24" class="stat-icon"><path d="M20 13c0-5.52-4.48-10-10-10S0 7.48 0 13c0 4.88 3.5 8.94 8 9.81V15H5v-2h3v-2.5c0-3.04 2.46-5.5 5.5-5.5H15v3h-1.5c-1.38 0-2.5 1.12-2.5 2.5V13h3.5l-.5 2h-3v7.81c4.5-.87 8-4.93 8-9.81z"/></svg>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-details">
          <span class="stat-title">Encryption Scope</span>
          <span class="stat-value">AES-256</span>
        </div>
        <div class="stat-icon-wrapper">
          <svg viewBox="0 0 24 24" class="stat-icon"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
        </div>
      </div>
    `;
  } else if (section === 'roles') {
    statsHTML = `
      <div class="stat-card">
        <div class="stat-details">
          <span class="stat-title">Configured Roles</span>
          <span class="stat-value">${totalRecordsCount}</span>
        </div>
        <div class="stat-icon-wrapper">
          <svg viewBox="0 0 24 24" class="stat-icon"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z"/></svg>
        </div>
      </div>
    `;
  } else {
    statsHTML = `
      <div class="stat-card">
        <div class="stat-details">
          <span class="stat-title">Database Records</span>
          <span class="stat-value">${totalRecordsCount}</span>
        </div>
        <div class="stat-icon-wrapper">
          <svg viewBox="0 0 24 24" class="stat-icon"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        </div>
      </div>
    `;
  }
  container.innerHTML = statsHTML;
}

// Generate headers and table structure dynamically
function renderTable(items) {
  const section = state.currentSection;
  const headerRow = elements.tableHeaderRow;
  const body = elements.tableBody;
  
  headerRow.innerHTML = '';
  body.innerHTML = '';
  
  if (items.length === 0) {
    elements.tableEmptyState.style.display = 'flex';
    elements.tablePaginationNav.style.display = 'none';
    return;
  }
  
  elements.tableEmptyState.style.display = 'none';

  // 1. Render Headers
  let headers = [];
  if (section === 'employees') {
    headers = ['ID', 'Name', 'Email', 'Department', 'Role', 'Status', 'Actions'];
  } else if (section === 'service-accounts') {
    headers = ['ID', 'Name', 'Client ID', 'Client Secret', 'Assigned Role', 'Status', 'Actions'];
  } else if (section === 'users') {
    headers = ['ID', 'Name', 'Email', 'Assigned Role', 'Status', 'Actions'];
  } else if (section === 'login-history') {
    headers = ['Timestamp', 'Employee', 'Email', 'IP Address', 'User Agent'];
  } else if (section === 'roles') {
    headers = ['ID', 'Role Name', 'Description', 'Lock', 'Editable', 'Switchable', 'Actions'];
  } else if (section === 'permission-resources') {
    headers = ['ID', 'Resource Key', 'Description', 'Actions'];
  } else if (section === 'permission-actions') {
    headers = ['ID', 'Action Name', 'Description', 'Actions'];
  }

  headers.forEach(h => {
    const th = document.createElement('th');
    th.innerText = h;
    headerRow.appendChild(th);
  });

  // 2. Render Rows
  items.forEach(item => {
    const tr = document.createElement('tr');
    let cellsHTML = '';

    if (section === 'employees') {
      const statusBadge = item.isActive 
        ? `<span class="badge active">Active</span>` 
        : `<span class="badge inactive">Inactive</span>`;
      const roleName = item.role ? item.role.name : '<span class="text-muted">None</span>';
      
      cellsHTML = `
        <td>#${item.id}</td>
        <td style="font-weight:600;">${escapeHTML(item.name)}</td>
        <td>${escapeHTML(item.email)}</td>
        <td>${escapeHTML(item.department || 'N/A')}</td>
        <td><span class="badge role-badge">${escapeHTML(roleName)}</span></td>
        <td>${statusBadge}</td>
        <td>
          <div class="row-actions">
            <button class="action-icon-btn edit" onclick="openEditModal(${item.id})" title="Edit Employee">
              <svg viewBox="0 0 24 24" class="action-btn-svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
            <button class="action-icon-btn delete" onclick="deleteRecord(${item.id})" title="Delete Employee">
              <svg viewBox="0 0 24 24" class="action-btn-svg"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </td>
      `;
    } 
    else if (section === 'service-accounts') {
      const statusBadge = item.isActive 
        ? `<span class="badge active">Active</span>` 
        : `<span class="badge inactive">Inactive</span>`;
      const roleName = item.role ? item.role.name : '<span class="text-muted">None</span>';
      
      cellsHTML = `
        <td>#${item.id}</td>
        <td style="font-weight:600;">${escapeHTML(item.name)}</td>
        <td><code class="security-code">${escapeHTML(item.clientId)}</code></td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <code class="security-code" id="secret-${item.id}">••••••••••••••••</code>
            <button class="action-icon-btn" onclick="toggleSecretDisplay(${item.id}, '${escapeHTML(item.clientSecret)}')" style="width:24px; height:24px;">
              <svg viewBox="0 0 24 24" class="action-btn-svg" style="width:14px; height:14px;"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
            </button>
          </div>
        </td>
        <td><span class="badge role-badge">${escapeHTML(roleName)}</span></td>
        <td>${statusBadge}</td>
        <td>
          <div class="row-actions">
            <button class="action-icon-btn edit" onclick="openEditModal(${item.id})" title="Edit Account">
              <svg viewBox="0 0 24 24" class="action-btn-svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
            <button class="action-icon-btn delete" onclick="deleteRecord(${item.id})" title="Delete Account">
              <svg viewBox="0 0 24 24" class="action-btn-svg"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </td>
      `;
    } 
    else if (section === 'users') {
      const statusBadge = item.isActive 
        ? `<span class="badge active">Active</span>` 
        : `<span class="badge inactive">Inactive</span>`;
      const roleName = item.role ? item.role.name : '<span class="text-muted">None</span>';
      
      cellsHTML = `
        <td>#${item.id}</td>
        <td style="font-weight:600;">${escapeHTML(item.name)}</td>
        <td>${escapeHTML(item.email)}</td>
        <td><span class="badge role-badge">${escapeHTML(roleName)}</span></td>
        <td>${statusBadge}</td>
        <td>
          <div class="row-actions">
            <button class="action-icon-btn edit" onclick="openEditModal(${item.id})" title="Edit User">
              <svg viewBox="0 0 24 24" class="action-btn-svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
            <button class="action-icon-btn delete" onclick="deleteRecord(${item.id})" title="Delete User">
              <svg viewBox="0 0 24 24" class="action-btn-svg"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </td>
      `;
    } 
    else if (section === 'login-history') {
      const empName = item.employee ? item.employee.name : '<span class="text-muted">Deleted Employee</span>';
      const empEmail = item.employee ? item.employee.email : 'N/A';
      const timeStr = new Date(item.loginTime).toLocaleString();
      
      cellsHTML = `
        <td style="font-weight:600; color:var(--color-primary);">${timeStr}</td>
        <td>${escapeHTML(empName)}</td>
        <td>${escapeHTML(empEmail)}</td>
        <td><code class="security-code">${escapeHTML(item.ipAddress || 'Unknown')}</code></td>
        <td style="font-size:12px; color:var(--text-muted); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHTML(item.userAgent)}">
          ${escapeHTML(item.userAgent || 'N/A')}
        </td>
      `;
    } 
    else if (section === 'roles') {
      const lockBadge = item.isLocked 
        ? `<span class="badge locked">Locked</span>` 
        : `<span class="badge active" style="color:var(--text-muted); background:none; border-color:transparent;">No</span>`;
      
      const editableBadge = item.editable 
        ? `<span class="badge active">Yes</span>` 
        : `<span class="badge inactive">No</span>`;

      const switchableBadge = item.switchable 
        ? `<span class="badge active">Yes</span>` 
        : `<span class="badge inactive">No</span>`;

      cellsHTML = `
        <td>#${item.id}</td>
        <td style="font-weight:600;">${escapeHTML(item.name)}</td>
        <td>${escapeHTML(item.description || 'N/A')}</td>
        <td>${lockBadge}</td>
        <td>${editableBadge}</td>
        <td>${switchableBadge}</td>
        <td>
          <div class="row-actions">
            ${item.isLocked ? '' : `
              <button class="action-icon-btn edit" onclick="openEditModal(${item.id})" title="Edit Role">
                <svg viewBox="0 0 24 24" class="action-btn-svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
            `}
            ${!item.editable ? '' : `
              <button class="action-icon-btn delete" onclick="deleteRecord(${item.id})" title="Delete Role">
                <svg viewBox="0 0 24 24" class="action-btn-svg"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            `}
          </div>
        </td>
      `;
    } 
    else if (section === 'permission-resources') {
      cellsHTML = `
        <td>#${item.id}</td>
        <td style="font-weight:600; color:var(--color-secondary);"><code class="security-code">${escapeHTML(item.name)}</code></td>
        <td>${escapeHTML(item.description || 'N/A')}</td>
        <td>
          <div class="row-actions">
            <button class="action-icon-btn delete" onclick="deleteRecord(${item.id})" title="Delete Resource">
              <svg viewBox="0 0 24 24" class="action-btn-svg"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </td>
      `;
    } 
    else if (section === 'permission-actions') {
      cellsHTML = `
        <td>#${item.id}</td>
        <td style="font-weight:600; color:var(--color-success);">${escapeHTML(item.action)}</td>
        <td>${escapeHTML(item.description || 'N/A')}</td>
        <td>
          <div class="row-actions">
            <button class="action-icon-btn delete" onclick="deleteRecord(${item.id})" title="Delete Action">
              <svg viewBox="0 0 24 24" class="action-btn-svg"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </td>
      `;
    }

    tr.innerHTML = cellsHTML;
    body.appendChild(tr);
  });
}

// Render dynamic pagination layout
function renderPagination() {
  const pag = state.pagination;
  if (pag.total === 0) {
    elements.tablePaginationNav.style.display = 'none';
    return;
  }
  
  elements.tablePaginationNav.style.display = 'flex';
  
  // Calculate range text
  const start = (pag.page - 1) * pag.limit + 1;
  const end = Math.min(pag.page * pag.limit, pag.total);
  elements.pageRange.innerText = `${start}-${end}`;
  elements.totalRecords.innerText = pag.total;

  // Enable/disable arrows
  elements.btnPagePrev.disabled = pag.page === 1;
  elements.btnPageNext.disabled = pag.page === pag.totalPages;

  // Render numbers
  elements.paginationPagesList.innerHTML = '';
  
  // Basic sliding window for pagination buttons
  const startPage = Math.max(1, pag.page - 2);
  const endPage = Math.min(pag.totalPages, startPage + 4);
  
  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement('button');
    btn.className = `page-num-btn ${i === pag.page ? 'active' : ''}`;
    btn.innerText = i;
    btn.addEventListener('click', () => {
      state.pagination.page = i;
      fetchAndRenderGrid();
    });
    elements.paginationPagesList.appendChild(btn);
  }
}

// Helper to escape HTML characters
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Helper to toggle service account secret visibility
function toggleSecretDisplay(id, secret) {
  const secretEl = document.getElementById(`secret-${id}`);
  if (!secretEl) return;
  
  if (secretEl.innerText === '••••••••••••••••') {
    secretEl.innerText = secret;
  } else {
    secretEl.innerText = '••••••••••••••••';
  }
}

// Open Form Modal for Creating
function openCreateModal() {
  const section = state.currentSection;
  elements.modalTitle.innerText = sectionConfig[section].actionText;
  elements.modalForm.innerHTML = '';
  elements.modalForm.removeAttribute('data-edit-id');
  elements.modalSubmitText.innerText = 'Confirm & Save';
  
  // Render form contents dynamically
  renderFormFields(null);
  
  elements.modalContainer.style.display = 'flex';
}

// Open Form Modal for Editing
async function openEditModal(id) {
  const section = state.currentSection;
  elements.modalTitle.innerText = `Edit ${section.slice(0, -1)}`;
  elements.modalForm.innerHTML = '';
  elements.modalForm.setAttribute('data-edit-id', id);
  elements.modalSubmitText.innerText = 'Update Changes';

  try {
    const endpoint = sectionConfig[section].endpoint;
    const res = await fetch(`${API_BASE}${endpoint}/${id}`);
    if (!res.ok) throw new Error('Could not retrieve record details');
    const record = await res.json();
    
    renderFormFields(record);
    elements.modalContainer.style.display = 'flex';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Render input fields depending on active section and record value
function renderFormFields(record = null) {
  const section = state.currentSection;
  const form = elements.modalForm;
  
  let html = '';

  if (section === 'employees') {
    const roleOptions = state.roles.map(r => `
      <option value="${r.id}" ${record && record.roleId === r.id ? 'selected' : ''}>${escapeHTML(r.name)}</option>
    `).join('');

    html = `
      <div class="form-grid">
        <div class="form-field form-full-row">
          <label for="emp-name">Full Name</label>
          <input type="text" id="emp-name" value="${record ? escapeHTML(record.name) : ''}" required>
        </div>
        <div class="form-field">
          <label for="emp-email">Email Address</label>
          <input type="email" id="emp-email" value="${record ? escapeHTML(record.email) : ''}" required>
        </div>
        <div class="form-field">
          <label for="emp-phone">Phone Number</label>
          <input type="text" id="emp-phone" value="${record ? escapeHTML(record.phone || '') : ''}">
        </div>
        <div class="form-field">
          <label for="emp-dept">Department</label>
          <select id="emp-dept">
            <option value="">Choose Department</option>
            <option value="Engineering" ${record && record.department === 'Engineering' ? 'selected' : ''}>Engineering</option>
            <option value="Operations" ${record && record.department === 'Operations' ? 'selected' : ''}>Operations</option>
            <option value="Marketing" ${record && record.department === 'Marketing' ? 'selected' : ''}>Marketing</option>
            <option value="HR" ${record && record.department === 'HR' ? 'selected' : ''}>HR</option>
          </select>
        </div>
        <div class="form-field">
          <label for="emp-role">Security Role</label>
          <select id="emp-role">
            <option value="">Choose Role</option>
            ${roleOptions}
          </select>
        </div>
        <div class="form-field checkbox-row form-full-row">
          <input type="checkbox" id="emp-active" ${!record || record.isActive ? 'checked' : ''}>
          <label for="emp-active" style="text-transform:none; font-weight:500;">Account Status is Active</label>
        </div>
      </div>
    `;
  } 
  else if (section === 'service-accounts') {
    const roleOptions = state.roles.map(r => `
      <option value="${r.id}" ${record && record.roleId === r.id ? 'selected' : ''}>${escapeHTML(r.name)}</option>
    `).join('');

    html = `
      <div class="form-grid">
        <div class="form-field form-full-row">
          <label for="sa-name">Client Application Name</label>
          <input type="text" id="sa-name" value="${record ? escapeHTML(record.name) : ''}" placeholder="e.g. Stripe Webhooks Client" required>
        </div>
        ${record ? '' : `
          <div class="form-field">
            <label for="sa-client-id">Client ID (Optional)</label>
            <input type="text" id="sa-client-id" placeholder="Auto-generated if blank">
          </div>
          <div class="form-field">
            <label for="sa-client-secret">Client Secret (Optional)</label>
            <input type="text" id="sa-client-secret" placeholder="Auto-generated if blank">
          </div>
        `}
        <div class="form-field form-full-row">
          <label for="sa-role">Assigned Role Scope</label>
          <select id="sa-role">
            <option value="">Choose Role</option>
            ${roleOptions}
          </select>
        </div>
        <div class="form-field checkbox-row form-full-row">
          <input type="checkbox" id="sa-active" ${!record || record.isActive ? 'checked' : ''}>
          <label for="sa-active" style="text-transform:none; font-weight:500;">Client ID Status Active</label>
        </div>
      </div>
    `;
  } 
  else if (section === 'users') {
    const roleOptions = state.roles.map(r => `
      <option value="${r.id}" ${record && record.roleId === r.id ? 'selected' : ''}>${escapeHTML(r.name)}</option>
    `).join('');

    html = `
      <div class="form-grid">
        <div class="form-field form-full-row">
          <label for="usr-name">Username / Display Name</label>
          <input type="text" id="usr-name" value="${record ? escapeHTML(record.name) : ''}" required>
        </div>
        <div class="form-field form-full-row">
          <label for="usr-email">Email Address</label>
          <input type="email" id="usr-email" value="${record ? escapeHTML(record.email) : ''}" required>
        </div>
        ${record ? '' : `
          <div class="form-field form-full-row">
            <label for="usr-password">Login Password</label>
            <input type="text" id="usr-password" placeholder="e.g. SuperSecretPass123" required>
          </div>
        `}
        <div class="form-field form-full-row">
          <label for="usr-role">Access Role Scope</label>
          <select id="usr-role">
            <option value="">Choose Role</option>
            ${roleOptions}
          </select>
        </div>
        <div class="form-field checkbox-row form-full-row">
          <input type="checkbox" id="usr-active" ${!record || record.isActive ? 'checked' : ''}>
          <label for="usr-active" style="text-transform:none; font-weight:500;">User is Active</label>
        </div>
      </div>
    `;
  }
  else if (section === 'roles') {
    // Render Permissions Matrix Selector using new nested structure
    const matrixRows = state.resources.map(res => {
      const actionItems = state.actions.map(act => {
        // Check if record already has this resource+action in rolePermissionResources
        let checked = '';
        if (record && record.rolePermissionResources) {
          const rpr = record.rolePermissionResources.find(r => r.permission_resource_id === res.id);
          if (rpr && rpr.rolePermissionResourceActions) {
            const hasAction = rpr.rolePermissionResourceActions.some(a => a.permission_action_id === act.id);
            if (hasAction) checked = 'checked';
          }
        }

        return `
          <label class="matrix-action-item">
            <input type="checkbox" class="permission-checkbox" data-resource-id="${res.id}" data-action-id="${act.id}" ${checked}>
            <span>${escapeHTML(act.action)}</span>
          </label>
        `;
      }).join('');

      return `
        <div class="permissions-matrix-row">
          <span class="matrix-resource-name">${escapeHTML(res.name)}</span>
          <div class="matrix-actions-list">${actionItems}</div>
        </div>
      `;
    }).join('');

    html = `
      <div class="form-field">
        <label for="role-name">Role Code Name</label>
        <input type="text" id="role-name" value="${record ? escapeHTML(record.name) : ''}" placeholder="e.g. Audit Manager" required>
      </div>
      <div class="form-field">
        <label for="role-desc">Role Description</label>
        <textarea id="role-desc" placeholder="Explain the role permissions boundary...">${record ? escapeHTML(record.description || '') : ''}</textarea>
      </div>
      <div class="form-grid">
        <div class="form-field checkbox-row">
          <input type="checkbox" id="role-active" ${!record || record.is_active ? 'checked' : ''}>
          <label for="role-active" style="text-transform:none; font-weight:500;">Active</label>
        </div>
        <div class="form-field checkbox-row">
          <input type="checkbox" id="role-editable" ${!record || record.editable ? 'checked' : ''}>
          <label for="role-editable" style="text-transform:none; font-weight:500;">Editable</label>
        </div>
        <div class="form-field checkbox-row">
          <input type="checkbox" id="role-switchable" ${!record || record.switchable ? 'checked' : ''}>
          <label for="role-switchable" style="text-transform:none; font-weight:500;">Switchable</label>
        </div>
      </div>
      
      <div class="form-field" style="margin-top:16px;">
        <label>Role Resource Policies Matrix</label>
        <div class="permissions-selection-container">
          <div class="permissions-selection-header">Map Operations Allowed</div>
          ${matrixRows || '<div style="padding:14px; font-size:12px; color:var(--text-muted);">Please seed permission resources and actions first.</div>'}
        </div>
      </div>
    `;
  }
  else if (section === 'permission-resources') {
    html = `
      <div class="form-field">
        <label for="res-name">Resource Name (Key)</label>
        <input type="text" id="res-name" placeholder="e.g. Document" required>
      </div>
      <div class="form-field">
        <label for="res-desc">Resource Details</label>
        <textarea id="res-desc" placeholder="Briefly describe what this resource protects..."></textarea>
      </div>
    `;
  }
  else if (section === 'permission-actions') {
    html = `
      <div class="form-field">
        <label for="act-action">Action Type Name</label>
        <input type="text" id="act-action" placeholder="e.g. Approve" required>
      </div>
      <div class="form-field">
        <label for="act-desc">Action Description</label>
        <textarea id="act-desc" placeholder="Describe the scope of this operation..."></textarea>
      </div>
      <div class="form-field checkbox-row">
        <input type="checkbox" id="act-draft">
        <label for="act-draft" style="text-transform:none; font-weight:500;">Save as Draft</label>
      </div>
    `;
  }
  else if (section === 'permission-resources') {
    html = `
      <div class="form-field">
        <label for="res-name">Resource Name (Key)</label>
        <input type="text" id="res-name" placeholder="e.g. Document" required>
      </div>
      <div class="form-field">
        <label for="res-desc">Resource Details</label>
        <textarea id="res-desc" placeholder="Briefly describe what this resource protects..."></textarea>
      </div>
      <div class="form-field checkbox-row">
        <input type="checkbox" id="res-draft">
        <label for="res-draft" style="text-transform:none; font-weight:500;">Save as Draft</label>
      </div>
    `;
  }

  form.innerHTML = html;
}

// Close current modal
function closeModal() {
  elements.modalContainer.style.display = 'none';
  elements.modalForm.innerHTML = '';
}

// Process modal form submit triggers (POST or PUT)
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const section = state.currentSection;
  const editId = elements.modalForm.getAttribute('data-edit-id');
  const isEdit = !!editId;
  
  let payload = {};
  
  // Compile payload data based on active section inputs
  if (section === 'employees') {
    payload = {
      name: document.getElementById('emp-name').value,
      email: document.getElementById('emp-email').value,
      phone: document.getElementById('emp-phone').value || null,
      department: document.getElementById('emp-dept').value || null,
      roleId: document.getElementById('emp-role').value ? Number(document.getElementById('emp-role').value) : null,
      isActive: document.getElementById('emp-active').checked
    };
  } 
  else if (section === 'service-accounts') {
    payload = {
      name: document.getElementById('sa-name').value,
      isActive: document.getElementById('sa-active').checked,
      roleId: document.getElementById('sa-role').value ? Number(document.getElementById('sa-role').value) : null
    };
    
    // Client credentials only during initial create
    if (!isEdit) {
      const clientIdVal = document.getElementById('sa-client-id').value;
      const clientSecretVal = document.getElementById('sa-client-secret').value;
      if (clientIdVal) payload.clientId = clientIdVal;
      if (clientSecretVal) payload.clientSecret = clientSecretVal;
    }
  } 
  else if (section === 'users') {
    payload = {
      name: document.getElementById('usr-name').value,
      email: document.getElementById('usr-email').value,
      roleId: document.getElementById('usr-role').value ? Number(document.getElementById('usr-role').value) : null,
      isActive: document.getElementById('usr-active').checked
    };
    
    if (!isEdit) {
      payload.password = document.getElementById('usr-password').value;
    }
  }
  else if (section === 'roles') {
    // Build nested rolePermissionResources payload from matrix checkboxes
    const checkedBoxes = document.querySelectorAll('.permission-checkbox:checked');
    
    // Group checked actions by resource
    const resourceMap = {};
    checkedBoxes.forEach(cb => {
      const resourceId = Number(cb.getAttribute('data-resource-id'));
      const actionId = Number(cb.getAttribute('data-action-id'));
      if (!resourceMap[resourceId]) resourceMap[resourceId] = [];
      resourceMap[resourceId].push({ permission_action_id: actionId });
    });

    const rolePermissionResources = Object.entries(resourceMap).map(([resourceId, actions]) => ({
      permission_resource_id: Number(resourceId),
      rolePermissionResourceActions: actions
    }));

    const editId = elements.modalForm.getAttribute('data-edit-id');
    payload = {
      name: document.getElementById('role-name').value,
      description: document.getElementById('role-desc').value || null,
      is_active: document.getElementById('role-active').checked,
      editable: document.getElementById('role-editable').checked,
      switchable: document.getElementById('role-switchable').checked,
      rolePermissionResources
    };
    // For UpdateRoleDto, include id
    if (editId) payload.id = Number(editId);
  }
  else if (section === 'permission-resources') {
    payload = {
      name: document.getElementById('res-name').value,
      description: document.getElementById('res-desc').value || null,
      draft: document.getElementById('res-draft').checked
    };
  }
  else if (section === 'permission-actions') {
    payload = {
      action: document.getElementById('act-action').value,
      description: document.getElementById('act-desc').value || null,
      draft: document.getElementById('act-draft').checked
    };
  }

  // Send request
  const endpoint = sectionConfig[section].endpoint;
  const url = isEdit ? `${API_BASE}${endpoint}/${editId}` : `${API_BASE}${endpoint}`;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error occurred while saving data');
    }

    showToast(`Record successfully ${isEdit ? 'updated' : 'created'}!`, 'success');
    closeModal();
    
    // Refresh Cache & Redraw grid
    await refreshCache();
    fetchAndRenderGrid();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Delete row handler
async function deleteRecord(id) {
  const section = state.currentSection;
  const confirmDelete = confirm(`Are you sure you want to delete this ${section.slice(0, -1)}?`);
  if (!confirmDelete) return;

  const endpoint = sectionConfig[section].endpoint;
  try {
    const res = await fetch(`${API_BASE}${endpoint}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Error deleting record');
    }

    showToast('Record deleted successfully', 'success');
    
    // Refresh Cache & Redraw grid
    await refreshCache();
    fetchAndRenderGrid();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

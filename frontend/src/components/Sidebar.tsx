import { NavLink } from 'react-router-dom';
import { FiTruck, FiHome, FiUsers, FiMapPin, FiDollarSign, FiSettings, FiBox } from 'react-icons/fi';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { to: '/loads', label: 'Loads', icon: <FiTruck /> },
  { to: '/dispatch', label: 'Dispatch', icon: <FiTruck /> },
  { to: '/customers', label: 'Customers', icon: <FiUsers /> },
  { to: '/carriers', label: 'Carriers', icon: <FiTruck /> },
  { to: '/drivers', label: 'Drivers', icon: <FiUsers /> },
  { to: '/equipment', label: 'Equipment', icon: <FiBox /> },
  { to: '/locations', label: 'Locations', icon: <FiMapPin /> },
  { to: '/billing/invoices', label: 'Billing', icon: <FiDollarSign /> },
  { to: '/settings/profile', label: 'Settings', icon: <FiSettings /> },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-950/70 border-r border-slate-800 px-4 py-6 hidden md:block">
      <div className="mb-8">
        <div className="text-lg font-semibold">FleetTMS</div>
        <div className="text-xs text-slate-400">Multi-tenant logistics OS</div>
      </div>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-slate-800/60 ${isActive ? 'bg-slate-800 text-white' : 'text-slate-300'}`
            }
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

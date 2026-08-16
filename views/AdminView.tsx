import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Plus, Edit2, Trash2, Tag, X, ArrowUpCircle, ArrowDownCircle, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';
import { User, PermissionModule } from '../types';
import { storage } from '../services/storage';

interface Props {
  users: User[];
  setUsers: (data: User[]) => void;
}

const AdminView: React.FC<Props> = ({ users, setUsers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'user',
    permissions: [] as PermissionModule[]
  });

  const handleOpenModal = (item?: User) => {
    if (item) {
      setEditingUser(item);
      setFormData({ name: item.name, email: item.email, role: item.role, permissions: item.permissions });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'user', permissions: [] });
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (module: PermissionModule) => {
    const current = [...formData.permissions];
    if (current.includes(module)) {
      setFormData({ ...formData, permissions: current.filter(m => m !== module) });
    } else {
      setFormData({ ...formData, permissions: [...current, module] });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await storage.updateUsers(editingUser.id, formData);
        setUsers(users.map(u => 
          u.id === editingUser.id ? { ...u, ...formData } : u
        ));
      } else {
        const newUser: User = {
          id: crypto.randomUUID(),
          ...formData
        };
        await storage.saveUsers([...users, newUser]);
        const updatedUsers = await storage.getUsers();
        setUsers(updatedUsers);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('❌ Error al guardar usuario:', error);
      alert(error.message || 'Error al guardar usuario');
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await storage.deleteUsers(itemToDelete);
        const newUsers = users.filter(u => u.id !== itemToDelete);
        setUsers(newUsers);
        setItemToDelete(null);
      } catch (error: any) {
        console.error('❌ Error al eliminar usuario:', error);
        alert(error.message || 'Error al eliminar');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Administración de Usuarios</h1>
          <p className="text-slate-500 text-sm">Gestiona roles y matriz de permisos por módulo en el sistema.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          style={{ backgroundColor: 'var(--color-primary)' }}
          className="text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition-all hover:-translate-y-0.5"
        >
          <UserPlus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* User List */}
      <div className="grid grid-cols-1 gap-4">
        {users.map(u => (
          <div 
            key={u.id} 
            className="p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md"
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <div className="flex items-center gap-4">
              <img src={u.avatar || `https://picsum.photos/seed/${u.id}/200`} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm" alt="User" />
              <div>
                <h3 className="font-bold text-slate-900 text-lg leading-snug">{u.name}</h3>
                <p className="text-xs text-slate-400 font-mono font-medium">{u.email}</p>
                <span 
                  style={{
                    backgroundColor: u.role === 'admin' ? 'var(--color-primary)' : undefined
                  }}
                  className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${u.role === 'admin' ? 'text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {u.role === 'admin' ? 'Administrador Root' : 'Usuario Estándar'}
                </span>
              </div>
            </div>

            <div className="flex-1 md:max-w-md">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Accesos Asignados</p>
              <div className="flex flex-wrap gap-1.5">
                {u.role === 'admin' ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Acceso Total (SuperAdmin)
                  </span>
                ) : (
                  u.permissions.map(p => (
                    <span key={p} className="text-[10px] font-bold bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                      {p}
                    </span>
                  ))
                )}
                {!u.permissions.length && u.role !== 'admin' && (
                  <span className="text-xs text-slate-400 italic">Sin permisos asignados</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={() => handleOpenModal(u)} 
                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all" 
                title="Editar permisos"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button 
                disabled={u.role === 'admin' && users.filter(x => x.role === 'admin').length === 1}
                onClick={() => setItemToDelete(u.id)} 
                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Eliminar usuario"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative p-6 text-white shrink-0 animate-in fade-in duration-100" style={{ backgroundColor: 'var(--color-form-header-bg)' }}>
              <h3 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold" style={{ color: 'var(--color-form-title-color)' }}>
                {editingUser ? 'Editar Permisos de Usuario' : 'Nuevo Usuario'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 z-10">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-form-label)' }}>Nombre Completo</label>
                <input 
                  required 
                  type="text" 
                  style={{ color: 'var(--color-form-input-text)' }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 text-sm font-bold" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-form-label)' }}>Email (Cuenta de Acceso)</label>
                <input 
                  required 
                  type="email" 
                  style={{ color: 'var(--color-form-input-text)' }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 text-sm font-bold" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-form-label)' }}>Rol Principal</label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-50 border border-slate-200 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'user'})}
                    className={`py-2.5 rounded-xl font-bold text-xs transition-all ${formData.role === 'user' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                  >
                    Estándar
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'admin'})}
                    style={{
                      backgroundColor: formData.role === 'admin' ? 'var(--color-primary)' : undefined,
                      color: formData.role === 'admin' ? '#ffffff' : undefined
                    }}
                    className={`py-2.5 rounded-xl font-bold text-xs transition-all ${formData.role === 'admin' ? 'shadow-sm' : 'text-slate-400'}`}
                  >
                    Admin Total
                  </button>
                </div>
              </div>

              {formData.role === 'user' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest block" style={{ color: 'var(--color-form-label)' }}>Permisos por Módulo</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(PermissionModule).map(m => {
                      const isSelected = formData.permissions.includes(m);
                      return (
                        <button 
                          key={m}
                          type="button"
                          onClick={() => handleTogglePermission(m)}
                          className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${isSelected ? 'border-indigo-300 bg-indigo-50/70 text-indigo-900' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                        >
                          <span className="text-xs font-bold">{m}</span>
                          {isSelected ? <CheckCircle2 className="w-4 h-4 text-indigo-600" /> : <Circle className="w-4 h-4 text-slate-300" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-xs">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  className="text-white px-8 py-2.5 rounded-2xl font-bold text-xs shadow-lg hover:opacity-90 transition-all"
                >
                  {editingUser ? "Guardar Permisos" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 text-center">Eliminar Usuario</h3>
            <p className="text-sm text-slate-500 text-center">
              ¿Estás seguro de que deseas eliminar los permisos de acceso de este usuario?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-red-200"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
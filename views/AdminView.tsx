
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
    permissions: []
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
        // Actualizar usuario existente
        console.log('📝 Actualizando usuario:', editingUser.id);
        await storage.updateUsers(editingUser.id, formData);
        
        // Actualizar estado local
        setUsers(users.map(u => 
          u.id === editingUser.id ? { ...u, ...formData } : u
        ));
        console.log('✅ Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario
        console.log('➕ Creando nuevo usuario');
        const newUser: User = {
          id: crypto.randomUUID(),
          ...formData
        };
        
        // Intentar guardar en la API
        await storage.saveUsers([...users, newUser]);
        
        // Si es exitoso, refrescar la lista desde la API
        const updatedUsers = await storage.getUsers();
        setUsers(updatedUsers);
        
        console.log('✅ Usuario creado correctamente');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('❌ Error al guardar usuario:', error);
      const errorMessage = error.message || 'Error desconocido al guardar';
      alert(errorMessage);
    }
  };

 const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        console.log('🗑️ Eliminando usuario:', itemToDelete);
        await storage.deleteUsers(itemToDelete);
        
        // Actualizar estado local
        const newUsers = users.filter(u => u.id !== itemToDelete);
        setUsers(newUsers);
        setItemToDelete(null);
        
        console.log('✅ Usuario eliminado correctamente');
      } catch (error: any) {
        console.error('❌ Error al eliminar usuario:', error);
        const errorMessage = error.message || 'Error desconocido al eliminar';
        alert(errorMessage);
      }
    }
  };

 return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administración de Usuarios</h1>
          <p className="text-slate-500">Controla quién accede a cada módulo del sistema.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md"
        >
          <UserPlus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {users.map(u => (
          <div key={u.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={u.avatar} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-slate-50" alt="User" />
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{u.name}</h3>
                <p className="text-sm text-slate-400 font-medium">{u.email}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-tight ${u.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {u.role}
                </span>
              </div>
            </div>

            <div className="flex-1 md:max-w-md">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Accesos Permitidos</p>
              <div className="flex flex-wrap gap-2">
                {u.role === 'admin' ? (
                  <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">Acceso Total (Root)</span>
                ) : (
                  u.permissions.map(p => (
                    <span key={p} className="text-[10px] font-bold bg-slate-50 text-slate-600 px-2 py-1 rounded-md border border-slate-100">
                      {p}
                    </span>
                  ))
                )}
                {!u.permissions.length && u.role !== 'admin' && <span className="text-xs text-slate-400 italic">Sin permisos asignados</span>}
              </div>
            </div>

             <div className="flex items-center justify-end gap-2">

              <button onClick={() => handleOpenModal(u)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>

                <button 
              disabled={u.role === 'admin' && users.filter(x => x.role === 'admin').length === 1}
              onClick={() => setItemToDelete(u.id)} 
              className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-0"
            >
              <Trash2 className="w-5 h-5" />
            </button>
              </div>

          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Nuevo Usuario</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nombre Completo</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Email (Gmail)</label>
                <input required type="email" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Rol Principal</label>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" className="hidden" name="role" checked={formData.role === 'user'} onChange={() => setFormData({...formData, role: 'user'})} />
                    <div className={`p-3 rounded-xl border text-center font-bold text-sm transition-all ${formData.role === 'user' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-slate-200 text-slate-400'}`}>Estándar</div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" className="hidden" name="role" checked={formData.role === 'admin'} onChange={() => setFormData({...formData, role: 'admin'})} />
                    <div className={`p-3 rounded-xl border text-center font-bold text-sm transition-all ${formData.role === 'admin' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-slate-200 text-slate-400'}`}>Admin (Total)</div>
                  </label>
                </div>
              </div>

              {formData.role === 'user' && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 block">Permisos por Módulo</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(PermissionModule).map(m => (
                      <button 
                        key={m}
                        type="button"
                        onClick={() => handleTogglePermission(m)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${formData.permissions.includes(m) ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-100 bg-white'}`}
                      >
                        <span className={`text-xs font-bold ${formData.permissions.includes(m) ? 'text-indigo-600' : 'text-slate-500'}`}>{m}</span>
                        {formData.permissions.includes(m) ? <CheckCircle2 className="w-4 h-4 text-indigo-600" /> : <Circle className="w-4 h-4 text-slate-200" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 flex items-center justify-end gap-3 mt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl">Cancelar</button>
                <button type="submit" className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100">Crear Acceso</button>
              </div>
            </form>
          </div>
        </div>
      )}

       {itemToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-6">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 text-center mb-3">Eliminar Usuario</h3>
            <p className="text-slate-600 text-center mb-8">
              ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-100"
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

const DetailItem: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 transition-colors border border-transparent hover:border-indigo-100">
    <div className="text-indigo-600 p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
      {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-slate-900 font-bold leading-tight mt-0.5">{value}</p>
    </div>
  </div>
);

export default AdminView;    
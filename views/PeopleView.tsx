
import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Search, X, Upload, Maximize2, AlertTriangle, 
  Eye, Phone, MapPin, Church, Award, User, Mail, Heart, Calendar, 
  Star, Briefcase, UserCheck, ShieldCheck, PartyPopper, Briefcase as OccupationIcon
} from 'lucide-react';
import { 
  Person, Ministry, IdType, Gender, Population, MinistryStatus, 
  CivilStatus, MembershipType, PersonStatus, Occupation 
} from '../types';
import { storage } from '../services/storage';

interface Props {
  people: Person[];
  setPeople: (data: Person[]) => void;
  ministries: Ministry[];
}

const PeopleView: React.FC<Props> = ({ people, setPeople, ministries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Person | null>(null);
  const [viewingItem, setViewingItem] = useState<Person | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const activeMinistries = ministries.filter(m => m.status === MinistryStatus.ACTIVE);

  const [formData, setFormData] = useState<Omit<Person, 'id'>>({
    identification: '',
    idType: IdType.CC,
    fullName: '',
    email: '',
    sex: Gender.MALE,
    civilStatus: CivilStatus.SINGLE,
    birthDate: '',
    phone: '',
    address: '',
    neighborhood: '',
    ministryId: activeMinistries[0]?.id || '',
    membershipType: MembershipType.ASSISTANT,
    membershipDate: new Date().toISOString().split('T')[0],
    status: PersonStatus.ACTIVE,
    occupation: Occupation.EMPLOYEE,
    isBaptized: false,
    populationGroup: Population.ADULT,
    photoUrl: ''
  });

  const handleOpenModal = (item?: Person) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        identification: '',
        idType: IdType.CC,
        fullName: '',
        email: '',
        sex: Gender.MALE,
        civilStatus: CivilStatus.SINGLE,
        birthDate: '',
        phone: '',
        address: '',
        neighborhood: '',
        ministryId: activeMinistries[0]?.id || '',
        membershipType: MembershipType.ASSISTANT,
        membershipDate: new Date().toISOString().split('T')[0],
        status: PersonStatus.ACTIVE,
        occupation: Occupation.EMPLOYEE,
        isBaptized: false,
        populationGroup: Population.ADULT,
        photoUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        // Actualizar persona existente
        console.log('📝 Actualizando persona:', editingItem.id);
        await storage.updatePeople(editingItem.id, formData);
        
        // Actualizar estado local
        setPeople(people.map(p => 
          p.id === editingItem.id ? { ...p, ...formData } : p
        ));
        console.log('✅ Persona actualizada correctamente');
      } else {
        // Crear nueva persona
        console.log('➕ Creando nueva persona');
        const newPerson: Person = {
          id: crypto.randomUUID(),
          ...formData
        };
        
        // Intentar guardar en la API
        await storage.savePeople([...people, newPerson]);
        
        // Si es exitoso, refrescar la lista desde la API
        const updatedPeople = await storage.getPeople();
        setPeople(updatedPeople);
        
        console.log('✅ Persona creada correctamente');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('❌ Error al guardar persona:', error);
      const errorMessage = error.message || 'Error desconocido al guardar';
      alert(errorMessage);
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        console.log('🗑️ Eliminando persona:', itemToDelete);
        await storage.deletePeople(itemToDelete);
        
        // Actualizar estado local
        const newPeople = people.filter(p => p.id !== itemToDelete);
        setPeople(newPeople);
        setItemToDelete(null);
        
        console.log('✅ Persona eliminada correctamente');
      } catch (error: any) {
        console.error('❌ Error al eliminar persona:', error);
        const errorMessage = error.message || 'Error desconocido al eliminar';
        alert(errorMessage);
      }
    }
  };

  const filtered = people.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.identification.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Personas</h1>
          <p className="text-slate-500">Administra los miembros de la comunidad.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          Agregar Persona
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o identificación..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Persona</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Identificación</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Membresía</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="relative group/photo overflow-hidden rounded-2xl">
                        <img 
                          src={p.photoUrl || `https://picsum.photos/seed/${p.id}/100`} 
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 cursor-pointer transition-transform hover:scale-110"
                          alt="Avatar"
                          onClick={() => setSelectedPhoto(p.photoUrl || `https://picsum.photos/seed/${p.id}/400`)}
                        />
                        <div 
                          onClick={() => setSelectedPhoto(p.photoUrl || `https://picsum.photos/seed/${p.id}/400`)}
                          className="absolute inset-0 bg-black/20 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                        >
                          <Maximize2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{p.fullName}</div>
                        <div className="text-xs text-slate-400">{p.email || 'Sin email'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-700">{p.idType}: {p.identification}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700">
                      {p.membershipType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                      p.status === PersonStatus.ACTIVE ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setViewingItem(p)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Visualizar">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleOpenModal(p)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setItemToDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox para ampliar imagen */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-3xl w-full flex items-center justify-center">
            <button className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors">
              <X className="w-8 h-8" />
            </button>
            <img 
              src={selectedPhoto} 
              className="max-w-full max-h-[85vh] rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 ring-8 ring-white/10" 
              alt="Ampliada" 
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-6">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 text-center mb-3">Eliminar Persona</h3>
            <p className="text-slate-600 text-center mb-8">
              ¿Estás seguro de que deseas eliminar esta persona? Esta acción no se puede deshacer.
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

      {/* Perfil Detallado (Rediseñado según solicitud) */}
      {viewingItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl my-8 overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Fondo gradiente de encabezado */}
            <div className="relative h-48 bg-gradient-to-r from-indigo-600 to-violet-700">
              <button 
                onClick={() => setViewingItem(null)}
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Foto de perfil flotante */}
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0">
                <img 
                  src={viewingItem.photoUrl || `https://picsum.photos/seed/${viewingItem.id}/400`} 
                  className="w-40 h-40 rounded-[2.5rem] object-cover ring-8 ring-white shadow-2xl cursor-pointer hover:scale-105 transition-transform"
                  alt="Perfil"
                  onClick={() => setSelectedPhoto(viewingItem.photoUrl || `https://picsum.photos/seed/${viewingItem.id}/400`)}
                />
              </div>
            </div>

            <div className="pt-20 px-8 md:px-12 pb-12">
              {/* Encabezado refinado: Nombre */}
              <div className="text-center md:text-left mb-10 pb-10 border-b border-slate-100">
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-6">{viewingItem.fullName}</h2>
                
                {/* Visual ajustada: Email, ID, Celular, Ministerio en una fila destacada */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                   <div className="flex items-center gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 shadow-sm">
                      <Mail className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Email</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{viewingItem.email || 'No registrado'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <UserCheck className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{viewingItem.idType}</p>
                        <p className="text-sm font-bold text-slate-700">{viewingItem.identification}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <Phone className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Celular</p>
                        <p className="text-sm font-bold text-slate-700">{viewingItem.phone || 'No registrado'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <Church className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ministerio</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{ministries.find(m => m.id === viewingItem.ministryId)?.name || 'General'}</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Grid de detalles secundarios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Datos Personales</h3>
                  <DetailItem icon={<Heart />} label="Estado Civil" value={viewingItem.civilStatus} />
                  <DetailItem icon={<Calendar />} label="Nacimiento" value={viewingItem.birthDate || 'No registrado'} />
                  <DetailItem icon={<OccupationIcon />} label="Ocupación" value={viewingItem.occupation} />
                  <DetailItem icon={<User />} label="Sexo / Grupo" value={`${viewingItem.sex} • ${viewingItem.populationGroup}`} />
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Membresía</h3>
                  <DetailItem icon={<Star />} label="Tipo de Miembro" value={viewingItem.membershipType} />
                  <DetailItem icon={<ShieldCheck />} label="Fecha Membresía" value={viewingItem.membershipDate} />
                  <DetailItem icon={<Award />} label="Bautizado" value={viewingItem.isBaptized ? 'Sí' : 'No'} />
                  <DetailItem icon={<PartyPopper />} label="Estado" value={viewingItem.status} />
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Ubicación</h3>
                  <DetailItem icon={<MapPin />} label="Dirección" value={viewingItem.address || 'No registrado'} />
                  <DetailItem icon={<Briefcase />} label="Barrio" value={viewingItem.neighborhood || 'No registrado'} />
                </div>
              </div>

              <div className="mt-12 flex justify-center md:justify-end">
                <button 
                  onClick={() => { setViewingItem(null); handleOpenModal(viewingItem); }}
                  className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  <Edit2 className="w-5 h-5" />
                  Editar Expediente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Registro/Edición ajustado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl my-8">
            <div className="flex items-center justify-between p-8 border-b border-slate-100 sticky top-0 bg-white rounded-t-[2.5rem] z-10">
              <h3 className="text-2xl font-bold text-slate-900">{editingItem ? 'Editar Perfil' : 'Crear Perfil'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex justify-center mb-6">
                  <div className="relative group">
                    <img 
                      src={formData.photoUrl || 'https://via.placeholder.com/150'} 
                      className="w-40 h-40 rounded-[2.5rem] object-cover ring-4 ring-slate-50 shadow-xl"
                      alt="Preview"
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <div className="flex flex-col items-center text-white">
                        <Upload className="w-8 h-8" />
                        <span className="text-xs font-bold mt-2 uppercase tracking-widest">Cambiar Foto</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo Documento</label>
                  <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" value={formData.idType} onChange={(e) => setFormData({ ...formData, idType: e.target.value as IdType })}>
                    {Object.values(IdType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Identificación</label>
                  <input required type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" value={formData.identification} onChange={(e) => setFormData({ ...formData, identification: e.target.value })} />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre Completo</label>
                  <input required type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</label>
                  <input type="email" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Celular</label>
                  <input type="tel" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Barrio</label>
                  <input type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" value={formData.neighborhood} onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })} />
                </div>
        
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dirección</label>
                  <input type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                </div>


                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ocupación</label>
                  <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" value={formData.occupation} onChange={(e) => setFormData({ ...formData, occupation: e.target.value as Occupation })}>
                    {Object.values(Occupation).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha Nacimiento (Picker)</label>
                  <input required type="date" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo Membresía</label>
                  <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" value={formData.membershipType} onChange={(e) => setFormData({ ...formData, membershipType: e.target.value as MembershipType })}>
                    {Object.values(MembershipType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estado</label>
                  <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as PersonStatus })}>
                    {Object.values(PersonStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha Membresía (Picker)</label>
                  <input type="date" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" value={formData.membershipDate} onChange={(e) => setFormData({ ...formData, membershipDate: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ministerio</label>
                  <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" value={formData.ministryId} onChange={(e) => setFormData({ ...formData, ministryId: e.target.value })}>
                    {activeMinistries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-6 md:col-span-2 pt-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-6 h-6 accent-indigo-600 rounded-lg cursor-pointer" checked={formData.isBaptized} onChange={(e) => setFormData({ ...formData, isBaptized: e.target.checked })} />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Bautizado</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-bold text-slate-700">Sexo:</label>
                    {Object.values(Gender).map(g => (
                      <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="sex" className="w-4 h-4 accent-indigo-600" checked={formData.sex === g} onChange={() => setFormData({...formData, sex: g})} />
                        <span className="text-sm text-slate-600">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-10 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-6 border-t border-slate-50 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
                <button type="submit" className="bg-indigo-600 text-white px-12 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {editingItem ? 'Actualizar Registro' : 'Guardar Nuevo Miembro'}
                </button>
              </div>
            </form>
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

export default PeopleView;

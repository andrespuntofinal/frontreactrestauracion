
import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Search, X, Upload, Maximize2, AlertTriangle, 
  Eye, Phone, MapPin, Church, Award, User, Mail, Heart, Calendar, 
  Star, Briefcase, UserCheck, ShieldCheck, PartyPopper, Briefcase as OccupationIcon,
  Check
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
  const [currentPage, setCurrentPage] = useState(1);  // ← AGREGAR ESTO
  const itemsPerPage = 5;  // ← AGREGAR ESTO
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
    membershipType: MembershipType.MIEMBRO,
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
        membershipType: MembershipType.MIEMBRO,
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

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filtered.slice(startIndex, endIndex);
  
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

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
              onChange={(e) => handleSearch(e.target.value)}
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
              {paginatedData.map(p => (
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

      {/* Paginador */}
        <div className="px-6 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-600 font-medium">
            Mostrando <span className="font-bold">{startIndex + 1}</span> a <span className="font-bold">{Math.min(endIndex, filtered.length)}</span> de <span className="font-bold">{filtered.length}</span> registros
          </div>
        

        <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-slate-600"
            >
              ← Anterior
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
                        <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-slate-600"
            >
              Siguiente →
            </button>
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
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center md:p-4 overflow-hidden animate-in fade-in duration-300">
           <div className="bg-white w-full h-full md:h-auto md:max-h-[95vh] md:max-w-4xl md:rounded-[3rem] flex flex-col shadow-2xl overflow-y-auto custom-scrollbar">
              <div className="relative h-40 md:h-56 bg-gradient-to-br from-indigo-600 to-violet-700 shrink-0">
              <button 
                onClick={() => setViewingItem(null)}
                className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              {/* Foto de perfil flotante */}
              <div className="absolute -bottom-12 sm:-bottom-16 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0">
                <img 
                  src={viewingItem.photoUrl || `https://picsum.photos/seed/${viewingItem.id}/400`} 
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-[2.5rem] object-cover ring-8 ring-white shadow-2xl cursor-pointer hover:scale-105 transition-transform"
                  alt="Perfil"
                  onClick={() => setSelectedPhoto(viewingItem.photoUrl || `https://picsum.photos/seed/${viewingItem.id}/400`)}
                />
              </div>
            </div>

            <div className="pt-14 sm:pt-16 md:pt-20 px-4 sm:px-8 md:px-12 pb-8 md:pb-12">
              {/* Encabezado refinado: Nombre */}
              <div className="text-center md:text-left mb-6 sm:mb-8 md:mb-10 pb-6 sm:pb-8 md:pb-10 border-b border-slate-100">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4 sm:mb-6">{viewingItem.fullName}</h2>
                
                {/* Visual ajustada: Email, ID, Celular, Ministerio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                   <div className="flex items-center gap-3 bg-indigo-50/50 p-3 sm:p-4 rounded-2xl border border-indigo-100 shadow-sm">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Email</p>
                        <p className="text-xs sm:text-sm font-bold text-slate-700 truncate">{viewingItem.email || 'No registrado'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{viewingItem.idType}</p>
                        <p className="text-xs sm:text-sm font-bold text-slate-700 truncate">{viewingItem.identification}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Celular</p>
                        <p className="text-xs sm:text-sm font-bold text-slate-700 truncate">{viewingItem.phone || 'No registrado'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <Church className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ministerio</p>
                        <p className="text-xs sm:text-sm font-bold text-slate-700 truncate">{ministries.find(m => m.id === viewingItem.ministryId)?.name || 'General'}</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Grid de detalles secundarios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Datos Personales</h3>
                  <DetailItem icon={<Heart />} label="Estado Civil11" value={viewingItem.civilStatus} />
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
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center md:p-4 overflow-hidden animate-in fade-in duration-300">
          <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-3xl md:rounded-[2.5rem] flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 sticky top-0 bg-white z-20">
              <h3 className="text-2xl font-bold text-slate-900">{editingItem ? 'Editar Perfil' : 'Crear Perfil'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="hidden md:block p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            
                        {/* Body Scrollable */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
              
              {/* Sección de Foto Refinada para Móvil */}
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="relative group">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] overflow-hidden ring-4 ring-slate-50 shadow-xl bg-slate-100">
                    <img src={formData.photoUrl || 'https://via.placeholder.com/150?text=SIN+FOTO'} className="w-full h-full object-cover" alt="" />
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2rem] opacity-0 md:group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Upload className="text-white w-8 h-8" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                  <label className="md:hidden absolute bottom-0 right-0 bg-indigo-600 p-3 rounded-2xl shadow-lg text-white">
                    <Upload className="w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto de Perfil</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="grid grid-cols-3 gap-3 md:col-span-1">
                  <div className="col-span-1 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                    <select className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none" value={formData.idType} onChange={e => setFormData({...formData, idType: e.target.value as IdType})}>
                      {Object.values(IdType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificación</label>
                    <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-bold" value={formData.identification} onChange={e => setFormData({...formData, identification: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-bold" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Celular</label>
                  <input type="tel" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Barrio</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-bold" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ocupación</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value as Occupation})}>
                    {Object.values(Occupation).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Nacimiento</label>
                  <input required type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ministerio</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={formData.ministryId} onChange={e => setFormData({...formData, ministryId: e.target.value})}>
                    {activeMinistries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Membresía</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={formData.membershipType} onChange={e => setFormData({...formData, membershipType: e.target.value as MembershipType})}>
                    {Object.values(MembershipType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 pt-4">
                <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer border border-transparent hover:border-indigo-200 transition-all flex-1">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${formData.isBaptized ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200'}`}>
                    {formData.isBaptized && <Check className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-bold text-slate-700">¿Es Bautizado?</span>
                  <input type="checkbox" className="hidden" checked={formData.isBaptized} onChange={e => setFormData({...formData, isBaptized: e.target.checked})} />
                </label>

                <div className="flex-1 p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                   <span className="text-sm font-bold text-slate-700">Sexo</span>
                   <div className="flex gap-2">
                    {Object.values(Gender).map(g => (
                      <button key={g} type="button" onClick={() => setFormData({...formData, sex: g})} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${formData.sex === g ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                        {g === Gender.MALE ? 'MAS' : 'FEM'}
                      </button>
                    ))}
                   </div>
                </div>

                  <div className="flex-1 p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado civil</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={formData.civilStatus} onChange={e => setFormData({...formData, civilStatus: e.target.value as CivilStatus})}>
                    {Object.values(CivilStatus).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

              </div>
            </form>
            {/* Footer Sticky Corregido para Móvil */}
            <div className="p-6 md:p-8 bg-white border-t border-slate-100 flex flex-col md:flex-row gap-3 sticky bottom-0 z-20">
              <button type="button" onClick={() => setIsModalOpen(false)} className="order-2 md:order-1 flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">
                Cancelar
              </button>
              <button onClick={handleSave} className="order-1 md:order-2 flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                {editingItem ? 'Actualizar' : 'Guardar'} Miembro
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

export default PeopleView;

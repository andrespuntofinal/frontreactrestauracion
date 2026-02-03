
import React, { useState } from 'react';
import { 
  Save, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Type, 
  Calendar, 
  Share2, 
  Layout,
  Upload,
  X
} from 'lucide-react';
import { SiteParameters, SiteEvent } from '../types';

interface Props {
  params: SiteParameters;
  setParams: (data: SiteParameters) => void;
}

const SiteParamsView: React.FC<Props> = ({ params, setParams }) => {
  const [formData, setFormData] = useState<SiteParameters>({ ...params });
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'HERO' | 'EVENTS' | 'CONTACT'>('CONTENT');

  const handleSave = () => {
    setParams(formData);
    alert('¡Parámetros guardados correctamente!');
  };

  const handleAddHeroImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, heroImages: [...formData.heroImages, reader.result as string] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEvent = () => {
    const newEvent: SiteEvent = {
      id: crypto.randomUUID(),
      title: 'Nuevo Evento',
      date: 'Proximamente',
      imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800'
    };
    setFormData({ ...formData, events: [...formData.events, newEvent] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Parámetros del Sitio</h1>
          <p className="text-slate-500">Administra el contenido que ven los visitantes.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Save className="w-5 h-5" />
          Guardar Cambios
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 border-r border-slate-100 bg-slate-50/30 p-4 space-y-2">
          <TabButton active={activeTab === 'CONTENT'} icon={<Type />} label="Contenido General" onClick={() => setActiveTab('CONTENT')} />
          <TabButton active={activeTab === 'HERO'} icon={<ImageIcon />} label="Carrusel Principal" onClick={() => setActiveTab('HERO')} />
          <TabButton active={activeTab === 'EVENTS'} icon={<Calendar />} label="Gestión de Eventos" onClick={() => setActiveTab('EVENTS')} />
          <TabButton active={activeTab === 'CONTACT'} icon={<Share2 />} label="Contacto y Redes" onClick={() => setActiveTab('CONTACT')} />
        </div>

        {/* Form Area */}
        <div className="flex-1 p-8">
          {activeTab === 'CONTENT' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Type className="text-indigo-600" /> Información Institucional
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">¿Quiénes Somos?</label>
                  <textarea 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 min-h-[120px]"
                    value={formData.aboutUs}
                    onChange={e => setFormData({ ...formData, aboutUs: e.target.value })}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Misión</label>
                    <textarea 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 min-h-[100px]"
                      value={formData.mission}
                      onChange={e => setFormData({ ...formData, mission: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Visión</label>
                    <textarea 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 min-h-[100px]"
                      value={formData.vision}
                      onChange={e => setFormData({ ...formData, vision: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'HERO' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="text-indigo-600" /> Carrusel Principal
                </h2>
                <label className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-indigo-100 transition-all flex items-center gap-2 border border-indigo-100">
                  <Plus className="w-4 h-4" /> Agregar Imagen
                  <input type="file" className="hidden" accept="image/*" onChange={handleAddHeroImage} />
                </label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.heroImages.map((img, idx) => (
                  <div key={idx} className="group relative aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    <button 
                      onClick={() => setFormData({ ...formData, heroImages: formData.heroImages.filter((_, i) => i !== idx) })}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'EVENTS' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="text-indigo-600" /> Próximos Eventos
                </h2>
                <button 
                  onClick={handleAddEvent}
                  className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 flex items-center gap-2 border border-indigo-100"
                >
                  <Plus className="w-4 h-4" /> Nuevo Evento
                </button>
              </div>
              <div className="space-y-4">
                {formData.events.map(event => (
                  <div key={event.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-32 aspect-video md:aspect-square bg-white rounded-2xl overflow-hidden shadow-sm">
                      <img src={event.imageUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Título</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                          value={event.title}
                          onChange={e => setFormData({
                            ...formData,
                            events: formData.events.map(ev => ev.id === event.id ? { ...ev, title: e.target.value } : ev)
                          })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Fecha / Info</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                          value={event.date}
                          onChange={e => setFormData({
                            ...formData,
                            events: formData.events.map(ev => ev.id === event.id ? { ...ev, date: e.target.value } : ev)
                          })}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => setFormData({ ...formData, events: formData.events.filter(ev => ev.id !== event.id) })}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl self-center"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'CONTACT' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
                  <Share2 className="text-indigo-600" /> Datos de Contacto
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Dirección Física</label>
                    <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={formData.contact.address} onChange={e => setFormData({...formData, contact: {...formData.contact, address: e.target.value}})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Teléfono / WhatsApp</label>
                    <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={formData.contact.phone} onChange={e => setFormData({...formData, contact: {...formData.contact, phone: e.target.value}})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Correo Electrónico</label>
                    <input type="email" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={formData.contact.email} onChange={e => setFormData({...formData, contact: {...formData.contact, email: e.target.value}})} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-6">Redes Sociales</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Facebook URL</label>
                    <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={formData.contact.facebook} onChange={e => setFormData({...formData, contact: {...formData.contact, facebook: e.target.value}})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Instagram URL</label>
                    <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={formData.contact.instagram} onChange={e => setFormData({...formData, contact: {...formData.contact, instagram: e.target.value}})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">YouTube URL</label>
                    <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={formData.contact.youtube} onChange={e => setFormData({...formData, contact: {...formData.contact, youtube: e.target.value}})} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
      active 
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
      : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
    }`}
  >
    {React.cloneElement(icon, { className: 'w-4 h-4' })}
    {label}
  </button>
);

export default SiteParamsView;

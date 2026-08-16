import React, { useState } from 'react';
import { 
  Save, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Type, 
  Calendar, 
  Share2, 
  Palette,
  Sparkles,
  Check,
  RotateCcw
} from 'lucide-react';
import { SiteParameters, SiteEvent, SiteTheme } from '../types';
import { DEFAULT_THEME, THEME_PRESETS, applyTheme } from '../services/theme';

interface Props {
  params: SiteParameters;
  setParams: (data: SiteParameters) => void;
}

const SiteParamsView: React.FC<Props> = ({ params, setParams }) => {
  const [formData, setFormData] = useState<SiteParameters>({
    ...params,
    theme: params.theme || { ...DEFAULT_THEME }
  });
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'HERO' | 'EVENTS' | 'CONTACT' | 'THEME'>('CONTENT');

  const currentTheme = formData.theme || { ...DEFAULT_THEME };

  const updateTheme = (updatedFields: Partial<SiteTheme>) => {
    const newTheme: SiteTheme = { ...currentTheme, ...updatedFields };
    const newFormData = { ...formData, theme: newTheme };
    setFormData(newFormData);
    // Aplicación en vivo inmediata del tema
    applyTheme(newTheme);
  };

  const applyPreset = (presetTheme: SiteTheme) => {
    updateTheme(presetTheme);
  };

  const handleSave = () => {
    setParams(formData);
    applyTheme(formData.theme);
    alert('¡Parámetros y tema del sitio guardados correctamente!');
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
          <p className="text-slate-500">Administra el contenido e identidad visual del sitio.</p>
        </div>
        <button 
          onClick={handleSave}
          style={{ backgroundColor: currentTheme.primaryColor }}
          className="text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:opacity-90"
        >
          <Save className="w-5 h-5" />
          Guardar Cambios
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 border-r border-slate-100 bg-slate-50/30 p-4 space-y-2">
          <TabButton active={activeTab === 'CONTENT'} icon={<Type />} label="Contenido General" onClick={() => setActiveTab('CONTENT')} theme={currentTheme} />
          <TabButton active={activeTab === 'HERO'} icon={<ImageIcon />} label="Carrusel Principal" onClick={() => setActiveTab('HERO')} theme={currentTheme} />
          <TabButton active={activeTab === 'EVENTS'} icon={<Calendar />} label="Gestión de Eventos" onClick={() => setActiveTab('EVENTS')} theme={currentTheme} />
          <TabButton active={activeTab === 'CONTACT'} icon={<Share2 />} label="Contacto y Redes" onClick={() => setActiveTab('CONTACT')} theme={currentTheme} />
          <TabButton active={activeTab === 'THEME'} icon={<Palette />} label="Tema del sitio" onClick={() => setActiveTab('THEME')} theme={currentTheme} />
        </div>

        {/* Form Area */}
        <div className="flex-1 p-8">
          {activeTab === 'CONTENT' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Type style={{ color: currentTheme.primaryColor }} /> Información Institucional
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
                  <ImageIcon style={{ color: currentTheme.primaryColor }} /> Carrusel Principal
                </h2>
                <label className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-slate-200 transition-all flex items-center gap-2 border border-slate-200">
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
                  <Calendar style={{ color: currentTheme.primaryColor }} /> Próximos Eventos
                </h2>
                <button 
                  onClick={handleAddEvent}
                  className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 flex items-center gap-2 border border-slate-200"
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
                  <Share2 style={{ color: currentTheme.primaryColor }} /> Datos de Contacto
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

          {activeTab === 'THEME' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Palette style={{ color: currentTheme.primaryColor }} /> Tema y Estilo del Sitio
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Personaliza la paleta cromática de botones, tarjetas, tablas y páneles en tiempo real.
                  </p>
                </div>
                <button 
                  onClick={() => updateTheme(DEFAULT_THEME)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-2 rounded-xl transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restaurar Predeterminados
                </button>
              </div>

              {/* Presets Rápidos */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Paletas Prediseñadas (1-Clic)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = currentTheme.primaryColor === preset.theme.primaryColor &&
                                       currentTheme.sidebarBg === preset.theme.sidebarBg;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset.theme)}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-24 ${
                          isSelected 
                            ? 'border-2 shadow-md ring-2 ring-offset-1' 
                            : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        }`}
                        style={{ borderColor: isSelected ? preset.theme.primaryColor : undefined }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 truncate">{preset.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          <div className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: preset.theme.primaryColor }} title="Color Primario" />
                          <div className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: preset.theme.accentColor }} title="Color Acento" />
                          <div className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: preset.theme.sidebarBg }} title="Color Barra Lateral" />
                          <div className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: preset.theme.cardBg }} title="Color Tarjeta" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personalización Detallada por Categorías */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Botones y Acentos */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2">🔘 Botones e Interacciones</h4>
                  <ColorPickerInput 
                    label="Color Principal (Botones)" 
                    value={currentTheme.primaryColor} 
                    onChange={val => updateTheme({ primaryColor: val })} 
                  />
                  <ColorPickerInput 
                    label="Color Hover (Al pasar el ratón)" 
                    value={currentTheme.primaryHover} 
                    onChange={val => updateTheme({ primaryHover: val })} 
                  />
                  <ColorPickerInput 
                    label="Color Secundario (Oscuro / Títulos)" 
                    value={currentTheme.secondaryColor} 
                    onChange={val => updateTheme({ secondaryColor: val })} 
                  />
                  <ColorPickerInput 
                    label="Color Acento / Destacados" 
                    value={currentTheme.accentColor} 
                    onChange={val => updateTheme({ accentColor: val })} 
                  />
                </div>

                {/* Tarjetas y Contenedores */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2">🎴 Tarjetas (Cards)</h4>
                  <ColorPickerInput 
                    label="Fondo de Tarjetas" 
                    value={currentTheme.cardBg} 
                    onChange={val => updateTheme({ cardBg: val })} 
                  />
                  <ColorPickerInput 
                    label="Borde de Tarjetas" 
                    value={currentTheme.cardBorder} 
                    onChange={val => updateTheme({ cardBorder: val })} 
                  />
                  <h4 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2 pt-2">📊 Tablas de Datos</h4>
                  <ColorPickerInput 
                    label="Fondo Encabezados de Tabla" 
                    value={currentTheme.tableHeaderBg} 
                    onChange={val => updateTheme({ tableHeaderBg: val })} 
                  />
                  <ColorPickerInput 
                    label="Texto Encabezados de Tabla" 
                    value={currentTheme.tableHeaderText} 
                    onChange={val => updateTheme({ tableHeaderText: val })} 
                  />
                </div>
              </div>

              {/* Panel y Navegación */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2">📐 Barra Lateral de Navegación</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <ColorPickerInput 
                    label="Fondo de Barra Lateral" 
                    value={currentTheme.sidebarBg} 
                    onChange={val => updateTheme({ sidebarBg: val })} 
                  />
                  <ColorPickerInput 
                    label="Fondo Botón Menú Activo" 
                    value={currentTheme.activeNavBg} 
                    onChange={val => updateTheme({ activeNavBg: val })} 
                  />
                  <ColorPickerInput 
                    label="Texto Botón Menú Activo" 
                    value={currentTheme.activeNavText} 
                    onChange={val => updateTheme({ activeNavText: val })} 
                  />
                  <ColorPickerInput 
                    label="Color Hover Menú" 
                    value={currentTheme.sidebarHoverBg} 
                    onChange={val => updateTheme({ sidebarHoverBg: val })} 
                  />
                  <ColorPickerInput 
                    label="Texto Menú (Inactivo)" 
                    value={currentTheme.sidebarTextColor} 
                    onChange={val => updateTheme({ sidebarTextColor: val })} 
                  />
                </div>
              </div>

              {/* Formularios */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2">📋 Formularios</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <ColorPickerInput 
                    label="Fondo Cabecera Formulario" 
                    value={currentTheme.formHeaderBg} 
                    onChange={val => updateTheme({ formHeaderBg: val })} 
                  />
                  <ColorPickerInput 
                    label="Color Título (Formulario)" 
                    value={currentTheme.formTitleColor} 
                    onChange={val => updateTheme({ formTitleColor: val })} 
                  />
                  <ColorPickerInput 
                    label="Color del Título de Campos (Labels)" 
                    value={currentTheme.formLabelColor} 
                    onChange={val => updateTheme({ formLabelColor: val })} 
                  />
                  <ColorPickerInput 
                    label="Color del Texto de Textbox" 
                    value={currentTheme.formInputText} 
                    onChange={val => updateTheme({ formInputText: val })} 
                  />
                </div>
              </div>

              {/* Vista Previa en Tiempo Real */}
              <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Vista Previa de Componentes en Vivo
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Real-time Theme Engine</span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-slate-900">
                  {/* Preview Card */}
                  <div 
                    className="p-4 rounded-2xl border shadow-sm transition-all"
                    style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}
                  >
                    <p className="text-xs font-bold text-slate-400 uppercase">Tarjeta Demo</p>
                    <h5 className="text-base font-bold" style={{ color: currentTheme.secondaryColor }}>Módulo de Miembros</h5>
                    <p className="text-xs text-slate-500 mt-1">Vista de prueba para tarjetas y contenedores.</p>
                    <button 
                      className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md"
                      style={{ backgroundColor: currentTheme.primaryColor }}
                    >
                      Botón Primario
                    </button>
                  </div>

                  {/* Preview Navigation */}
                  <div 
                    className="p-4 rounded-2xl border flex flex-col justify-between"
                    style={{ backgroundColor: currentTheme.sidebarBg }}
                  >
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase" style={{ color: currentTheme.sidebarTextColor }}>Menú Demo</p>
                      <div 
                        className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-between shadow-sm"
                        style={{ backgroundColor: currentTheme.activeNavBg, color: currentTheme.activeNavText }}
                      >
                        <span>Activo</span>
                        <Check className="w-3 h-3" />
                      </div>
                      <div 
                        className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-between"
                        style={{ color: currentTheme.sidebarTextColor }}
                      >
                        <span>Inactivo</span>
                      </div>
                      <div 
                        className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-between"
                        style={{ backgroundColor: currentTheme.sidebarHoverBg, color: currentTheme.sidebarTextColor }}
                      >
                        <span>Hover</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold mt-2" style={{ color: currentTheme.sidebarTextColor }}>Prueba de Sidebar</span>
                  </div>

                  {/* Preview Table */}
                  <div className="bg-white rounded-2xl border overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead style={{ backgroundColor: currentTheme.tableHeaderBg, color: currentTheme.tableHeaderText }}>
                        <tr>
                          <th className="p-2.5 font-bold">Columna A</th>
                          <th className="p-2.5 font-bold">Columna B</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2.5 font-medium">Dato 1</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: currentTheme.accentColor }}>
                              Acento
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
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

const ColorPickerInput = ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-600 uppercase tracking-tight">{label}</label>
    <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100">
      <input 
        type="color" 
        value={value || '#000000'} 
        onChange={e => onChange(e.target.value)}
        className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0 bg-transparent flex-shrink-0"
      />
      <input 
        type="text" 
        value={value || ''} 
        onChange={e => onChange(e.target.value)}
        className="w-full text-xs font-mono font-bold text-slate-700 outline-none uppercase"
        placeholder="#000000"
      />
    </div>
  </div>
);

const TabButton = ({ active, icon, label, onClick, theme }: any) => (
  <button 
    onClick={onClick}
    style={{
      backgroundColor: active ? theme.primaryColor : undefined,
      color: active ? '#ffffff' : undefined
    }}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
      active 
      ? 'shadow-lg' 
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    {React.cloneElement(icon, { className: 'w-4 h-4' })}
    {label}
  </button>
);

export default SiteParamsView;

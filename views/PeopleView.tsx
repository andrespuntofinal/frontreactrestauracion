import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Upload,
  Maximize2,
  AlertTriangle,
  Eye,
  Phone,
  MapPin,
  Church,
  Award,
  User,
  Mail,
  Heart,
  Calendar,
  Star,
  Briefcase,
  UserCheck,
  ShieldCheck,
  PartyPopper,
  Briefcase as OccupationIcon,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter
} from "lucide-react";
import {
  Person,
  Ministry,
  IdType,
  Gender,
  Population,
  MinistryStatus,
  CivilStatus,
  MembershipType,
  PersonStatus,
  Occupation,
} from "../types";
import { storage } from "../services/storage";

interface Props {
  people: Person[];
  setPeople: (data: Person[]) => void;
  ministries: Ministry[];
}

type SortField = 'fullName' | 'identification' | 'ministry' | 'address';

const PeopleView: React.FC<Props> = ({ people, setPeople, ministries }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ministryFilter, setMinistryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState<SortField>('fullName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Person | null>(null);
  const [viewingItem, setViewingItem] = useState<Person | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const activeMinistries = ministries.filter(
    (m) => m.status === MinistryStatus.ACTIVE,
  );
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<Omit<Person, "id">>({
    identification: "",
    idType: IdType.CC,
    fullName: "",
    email: "",
    sex: Gender.MALE,
    civilStatus: CivilStatus.SINGLE,
    birthDate: "",
    phone: "",
    address: "",
    neighborhood: "",
    ministryId: activeMinistries[0]?.id || "",
    membershipType: MembershipType.MIEMBRO,
    membershipDate: new Date().toISOString().split("T")[0],
    status: PersonStatus.ACTIVE,
    occupation: Occupation.EMPLOYEE,
    isBaptized: false,
    populationGroup: Population.ADULT,
    photoUrl: "",
  });

  const handleOpenModal = (item?: Person) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        identification: "",
        idType: IdType.CC,
        fullName: "",
        email: "",
        sex: Gender.MALE,
        civilStatus: CivilStatus.SINGLE,
        birthDate: "",
        phone: "",
        address: "",
        neighborhood: "",
        ministryId: activeMinistries[0]?.id || "",
        membershipType: MembershipType.MIEMBRO,
        membershipDate: new Date().toISOString().split("T")[0],
        status: PersonStatus.ACTIVE,
        occupation: Occupation.EMPLOYEE,
        isBaptized: false,
        populationGroup: Population.ADULT,
        photoUrl: "",
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
    e.target.value = "";
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-menu-button]') && !target.closest('[data-menu-content]')) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        await storage.updatePeople(editingItem.id, formData);
        setPeople(
          people.map((p) =>
            p.id === editingItem.id ? { ...p, ...formData } : p,
          ),
        );
      } else {
        const newPerson: Person = {
          id: crypto.randomUUID(),
          ...formData,
        };
        await storage.savePeople([...people, newPerson]);
        const updatedPeople = await storage.getPeople();
        setPeople(updatedPeople);
      }
      showToast("success", "Registro guardado correctamente.");
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("❌ Error al guardar persona:", error);
      showToast("error", "Registro no guardado correctamente.");
      alert(error.message || "Error al guardar la persona");
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await storage.deletePerson(itemToDelete);
        setPeople(people.filter((p) => p.id !== itemToDelete));
        setItemToDelete(null);
        showToast("success", "Persona eliminada correctamente.");
      } catch (error: any) {
        console.error("❌ Error al eliminar persona:", error);
        alert(error.message || "Error al eliminar");
      }
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    return people
      .filter((p) => {
        const matchesSearch =
          p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.identification.includes(searchTerm) ||
          p.phone.includes(searchTerm);

        const matchesMinistry = ministryFilter === "ALL" || p.ministryId === ministryFilter;
        const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

        return matchesSearch && matchesMinistry && matchesStatus;
      })
      .sort((a, b) => {
        let valA = "";
        let valB = "";

        if (sortField === 'fullName') {
          valA = a.fullName.toLowerCase();
          valB = b.fullName.toLowerCase();
        } else if (sortField === 'identification') {
          valA = a.identification;
          valB = b.identification;
        } else if (sortField === 'ministry') {
          valA = ministries.find(m => m.id === a.ministryId)?.name || "";
          valB = ministries.find(m => m.id === b.ministryId)?.name || "";
        } else if (sortField === 'address') {
          valA = a.address.toLowerCase();
          valB = b.address.toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [people, searchTerm, ministryFilter, statusFilter, sortField, sortDirection, ministries]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSorted.slice(startIndex, startIndex + itemsPerPage);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-current" /> : <ArrowDown className="w-3.5 h-3.5 text-current" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Personas</h1>
          <p className="text-slate-500 text-sm">
            Gestión y expedientes de miembros de la comunidad ({filteredAndSorted.length} registros).
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{ backgroundColor: 'var(--color-primary)' }}
          className="text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Agregar Persona
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm space-y-3 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nombre, identificación o teléfono..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={ministryFilter}
              onChange={(e) => { setMinistryFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none"
            >
              <option value="ALL">Todos los Ministerios</option>
              {ministries.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none"
            >
              <option value="ALL">Todos los Estados</option>
              <option value={PersonStatus.ACTIVE}>Activos</option>
              <option value={PersonStatus.INACTIVE}>Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        className="rounded-3xl border shadow-sm overflow-hidden transition-all"
        style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead style={{ backgroundColor: 'var(--color-table-header-bg)', color: 'var(--color-table-header-text)' }}>
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider w-16">Acción</th>
                <th
                  onClick={() => handleSort('fullName')}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-black/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Persona {renderSortIcon('fullName')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('ministry')}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-black/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Ministerio {renderSortIcon('ministry')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('address')}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-black/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Ubicación {renderSortIcon('address')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium text-sm">
                    No se encontraron personas registradas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedData.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                        <button
                          data-menu-button
                          onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                          className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                          title="Opciones"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.5 1.5H9.5V3.5H10.5V1.5ZM10.5 8.5H9.5V10.5H10.5V8.5ZM10.5 15.5H9.5V17.5H10.5V15.5Z" />
                          </svg>
                        </button>

                        {/* Context Menu */}
                        {openMenuId === p.id && (
                          <div data-menu-content className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[90] animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                            <button
                              onClick={() => { setViewingItem(p); setOpenMenuId(null); }}
                              className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 text-xs font-bold"
                            >
                              <Eye className="w-4 h-4 text-indigo-600" />
                              Visualizar Expediente
                            </button>
                            <button
                              onClick={() => { handleOpenModal(p); setOpenMenuId(null); }}
                              className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 text-xs font-bold"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                              Editar Datos
                            </button>
                            <button
                              onClick={() => { setItemToDelete(p.id); setOpenMenuId(null); }}
                              className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center gap-3 text-xs font-bold"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Persona */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={p.photoUrl || `https://picsum.photos/seed/${p.id}/300`}
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                            alt={p.fullName}
                            onClick={() => setSelectedPhoto(p.photoUrl || `https://picsum.photos/seed/${p.id}/300`)}
                          />
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white ${p.status === PersonStatus.ACTIVE ? "bg-emerald-500" : "bg-red-500"}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">{p.fullName}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{p.idType} • {p.identification}</p>
                        </div>
                      </div>
                    </td>

                    {/* Ministerio */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                          <Church className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {ministries.find((m) => m.id === p.ministryId)?.name || "Sin ministerio"}
                          </p>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {p.membershipType}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Ubicación */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-800 truncate max-w-xs">{p.address || "No registrada"}</p>
                          <p className="text-xs text-slate-400">{p.neighborhood || "Sin barrio"}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Foto de Perfil Ampliada */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-2" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedPhoto(null)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70">
              <X className="w-5 h-5" />
            </button>
            <img src={selectedPhoto} className="w-full h-auto rounded-2xl object-cover" alt="Foto ampliada" />
          </div>
        </div>
      )}

      {/* Modal Eliminar Persona */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center">Eliminar Persona</h3>
            <p className="text-sm text-slate-500 text-center">
              ¿Estás seguro de eliminar esta persona? Esta acción eliminará su expediente del sistema.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 bg-slate-100 font-bold text-slate-700 rounded-2xl hover:bg-slate-200">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 font-bold text-white rounded-2xl hover:bg-red-700 shadow-lg shadow-red-200">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Expediente */}
      {viewingItem && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative p-6 text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
              <button onClick={() => setViewingItem(null)} className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <img
                  src={viewingItem.photoUrl || `https://picsum.photos/seed/${viewingItem.id}/300`}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white/40 shadow-md"
                  alt=""
                />
                <div>
                  <h2 className="text-2xl font-bold">{viewingItem.fullName}</h2>
                  <p className="text-xs text-white/80 font-mono mt-0.5">{viewingItem.idType} • {viewingItem.identification}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                    {viewingItem.membershipType}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 text-slate-800">
              <div className="grid md:grid-cols-3 gap-4 text-xs font-semibold">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 uppercase text-[10px]">Email</p>
                  <p className="text-slate-900 font-bold truncate mt-0.5">{viewingItem.email || "No registrado"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 uppercase text-[10px]">Teléfono</p>
                  <p className="text-slate-900 font-bold truncate mt-0.5">{viewingItem.phone || "No registrado"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 uppercase text-[10px]">Ministerio</p>
                  <p className="text-slate-900 font-bold truncate mt-0.5">{ministries.find(m => m.id === viewingItem.ministryId)?.name || "Sin ministerio"}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Detalles Personales</p>
                  <p className="text-slate-700">Estado Civil: <strong>{viewingItem.civilStatus}</strong></p>
                  <p className="text-slate-700">Ocupación: <strong>{viewingItem.occupation}</strong></p>
                  <p className="text-slate-700">Bautizado: <strong>{viewingItem.isBaptized ? "Sí" : "No"}</strong></p>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Dirección y Ubicación</p>
                  <p className="text-slate-700">Dirección: <strong>{viewingItem.address || "No registrada"}</strong></p>
                  <p className="text-slate-700">Barrio: <strong>{viewingItem.neighborhood || "No registrado"}</strong></p>
                  <p className="text-slate-700">Estado: <strong>{viewingItem.status}</strong></p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setViewingItem(null)} className="px-5 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs">
                Cerrar
              </button>
              <button
                onClick={() => { const item = viewingItem; setViewingItem(null); handleOpenModal(item); }}
                style={{ backgroundColor: 'var(--color-primary)' }}
                className="px-5 py-2.5 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Formulario Registro / Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <div className="relative p-6 text-white shrink-0" style={{ backgroundColor: 'var(--color-form-header-bg)' }}>
              <h3 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold" style={{ color: 'var(--color-form-title-color)' }}>
                {editingItem ? "EDITAR PERFIL" : "NUEVO PERFIL"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-slate-800">
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative group w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={formData.photoUrl || "https://via.placeholder.com/150?text=SIN+FOTO"} className="w-full h-full object-cover" alt="" />
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Cambiar</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Foto de Perfil</span>
              </div>

              {/* Grid Inputs */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Tipo</label>
                    <select
                      style={{ color: 'var(--color-form-input-text)' }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                      value={formData.idType}
                      onChange={e => setFormData({ ...formData, idType: e.target.value as IdType })}
                    >
                      {Object.values(IdType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Identificación</label>
                    <input
                      required
                      type="text"
                      style={{ color: 'var(--color-form-input-text)' }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                      value={formData.identification}
                      onChange={e => setFormData({ ...formData, identification: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Nombre Completo</label>
                  <input
                    required
                    type="text"
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Email</label>
                  <input
                    type="email"
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Celular / Teléfono</label>
                  <input
                    type="tel"
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Dirección</label>
                  <input
                    type="text"
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Barrio</label>
                  <input
                    type="text"
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                    value={formData.neighborhood}
                    onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Ocupación</label>
                  <select
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                    value={formData.occupation}
                    onChange={e => setFormData({ ...formData, occupation: e.target.value as Occupation })}
                  >
                    {Object.values(Occupation).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Fecha de Nacimiento</label>
                  <input
                    type="date"
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                    value={formData.birthDate}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Ministerio</label>
                  <select
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                    value={formData.ministryId}
                    onChange={e => setFormData({ ...formData, ministryId: e.target.value })}
                  >
                    {activeMinistries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Tipo de Membresía</label>
                  <select
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                    value={formData.membershipType}
                    onChange={e => setFormData({ ...formData, membershipType: e.target.value as MembershipType })}
                  >
                    {Object.values(MembershipType).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid md:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.isBaptized}
                    onChange={e => setFormData({ ...formData, isBaptized: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="text-xs font-bold text-slate-700">¿Bautizado?</span>
                </label>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Sexo</span>
                  <div className="flex gap-1">
                    {Object.values(Gender).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData({ ...formData, sex: g })}
                        style={{ backgroundColor: formData.sex === g ? 'var(--color-primary)' : undefined }}
                        className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${formData.sex === g ? 'text-white' : 'bg-white text-slate-600 border'}`}
                      >
                        {g === Gender.MALE ? 'Mas' : 'Fem'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Estado Civil</label>
                  <select
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full bg-transparent text-xs font-bold outline-none"
                    value={formData.civilStatus}
                    onChange={e => setFormData({ ...formData, civilStatus: e.target.value as CivilStatus })}
                  >
                    {Object.values(CivilStatus).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 text-xs">
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  className="px-8 py-3 text-white font-bold rounded-2xl text-xs shadow-lg hover:opacity-90 transition-all"
                >
                  {editingItem ? "Actualizar Persona" : "Guardar Persona"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[120] animate-in slide-in-from-top-4 duration-200">
          <div className={`px-5 py-3 rounded-2xl shadow-xl border font-bold text-xs flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleView;

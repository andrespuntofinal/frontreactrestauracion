import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Trash2,
  Search,
  X,
  Filter,
  Download,
  FileText,
  File,
  ArrowUpCircle,
  ArrowDownCircle,
  Edit2,
  Wallet,
  CreditCard,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Scale,
  Upload
} from "lucide-react";
import {
  Transaction,
  TransactionType,
  PaymentMethod,
  Category,
  Person,
  Ministry,
  IdType,
  Gender,
  CivilStatus,
  MembershipType,
  PersonStatus,
  Occupation,
  MinistryStatus,
  Population,
} from "../types";
import { storage } from "../services/storage";

interface Props {
  transactions: Transaction[];
  setTransactions: (data: Transaction[]) => void;
  categories: Category[];
  people: Person[];
  setPeople: (data: Person[]) => void;
  ministries: Ministry[];
}

type SortField = 'date' | 'value' | 'category';

const TransactionsView: React.FC<Props> = ({
  transactions,
  setTransactions,
  categories,
  people,
  setPeople,
  ministries,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<TransactionType | "ALL">("ALL");
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const activeMinistries = useMemo(() => ministries.filter(
    (m) => m.status === MinistryStatus.ACTIVE
  ), [ministries]);

  const defaultPersonData = useMemo<Omit<Person, "id">>(() => ({
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
  }), [activeMinistries]);

  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [personFormData, setPersonFormData] = useState<Omit<Person, "id">>(defaultPersonData);
  const [isDateSticky, setIsDateSticky] = useState(false);
  const [stickyDate, setStickyDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Restablecer/inicializar formulario de persona cuando cambien los datos por defecto (como los ministerios activos)
  useEffect(() => {
    setPersonFormData(defaultPersonData);
  }, [defaultPersonData]);

  const [displayValue, setDisplayValue] = useState("");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Omit<Transaction, "id">>({
    type: TransactionType.INCOME,
    medioTrx: PaymentMethod.CASH,
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
    value: 0,
    personId: "",
    observations: "",
    attachmentUrl: "",
    attachmentName: "",
  });

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const filteredFormCategories = useMemo(() => {
    return categories.filter((c) => c.type === formData.type);
  }, [categories, formData.type]);

  const formatNumber = (num: string) => {
    const cleanValue = num.replace(/\D/g, "");
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatNumber(rawValue);
    setDisplayValue(formattedValue);

    const numericValue = parseInt(rawValue.replace(/\D/g, ""), 10) || 0;
    setFormData({ ...formData, value: numericValue });
  };

  const handleOpenModal = (item?: Transaction) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
      setDisplayValue(
        item.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
      );
      setSelectedFile(null);
    } else {
      setEditingItem(null);
      setFormData({
        type: TransactionType.INCOME,
        medioTrx: PaymentMethod.CASH,
        categoryId:
          categories.find((c) => c.type === TransactionType.INCOME)?.id || "",
        date: isDateSticky ? stickyDate : new Date().toISOString().split("T")[0],
        value: 0,
        personId: "",
        observations: "",
        attachmentUrl: "",
        attachmentName: "",
      });
      setDisplayValue("");
      setSelectedFile(null);
    }
    setIsModalOpen(true);
  };

  const handleTypeChange = (type: TransactionType) => {
    const firstCatOfType = categories.find((c) => c.type === type);
    setFormData({
      ...formData,
      type,
      categoryId: firstCatOfType ? firstCatOfType.id : "",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData({
        ...formData,
        attachmentName: file.name,
        attachmentUrl: URL.createObjectURL(file),
      });
    }
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

  const handlePersonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonFormData({ ...personFormData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newPerson: Person = {
        id: crypto.randomUUID(),
        ...personFormData,
      };
      await storage.savePeople([...people, newPerson]);
      const updatedPeople = await storage.getPeople();
      setPeople(updatedPeople);

      // Pre-seleccionar la persona recién creada en el formulario de transacciones
      setFormData((prev) => ({ ...prev, personId: newPerson.id }));
      
      showToast("success", "Persona guardada correctamente.");
      setIsPersonModalOpen(false);
    } catch (error: any) {
      console.error("❌ Error al guardar persona:", error);
      showToast("error", "Registro no guardado correctamente.");
      alert(error.message || "Error al guardar la persona");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let uploadedFileUrl = formData.attachmentUrl;
    let uploadedFileName = formData.attachmentName;

    try {
      if (selectedFile) {
        const uploadResult = await storage.uploadFile(selectedFile);
        uploadedFileUrl = uploadResult.url;
        uploadedFileName = uploadResult.publicId;
      }

      const normalizedFormData: Omit<Transaction, "id"> = {
        ...formData,
        attachmentUrl: uploadedFileUrl || null,
        attachmentName: uploadedFileName || null,
        personId: formData.personId ? formData.personId : undefined,
      };

      if (editingItem) {
        await storage.updateTransactions(editingItem.id, normalizedFormData);
        setTransactions(
          transactions.map((t) =>
            t.id === editingItem.id ? { ...t, ...normalizedFormData } : t,
          ),
        );
      } else {
        const newTransaction: Transaction = {
          id: crypto.randomUUID(),
          ...normalizedFormData,
        };
        await storage.saveTransactions([...transactions, newTransaction]);
        const updatedTransactions = await storage.getTransactions();
        setTransactions(updatedTransactions);
      }

      showToast("success", "Registro guardado correctamente.");
      setIsModalOpen(false);
      setSelectedFile(null);
    } catch (error: any) {
      console.error("❌ Error al guardar transacción:", error);
      showToast("error", "Registro no guardado correctamente.");
      alert(error.message || "Error al guardar la transacción");
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        const trxToDelete = transactions.find((t) => t.id === itemToDelete);
        if (trxToDelete?.attachmentName) {
          await storage.deleteFile(trxToDelete.attachmentName);
        }
        await storage.deleteTransactions(itemToDelete);
        const newTransactions = transactions.filter((t) => t.id !== itemToDelete);
        setTransactions(newTransactions);
        setItemToDelete(null);
        showToast("success", "Registro eliminado correctamente.");
      } catch (error: any) {
        console.error("❌ Error al eliminar transacción:", error);
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
    return transactions
      .filter((t) => {
        const matchesSearch = t.observations.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (categories.find(c => c.id === t.categoryId)?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "ALL" || t.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          return sortDirection === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
        } else if (sortField === 'value') {
          return sortDirection === 'asc' ? a.value - b.value : b.value - a.value;
        } else if (sortField === 'category') {
          const catA = categories.find(c => c.id === a.categoryId)?.name || "";
          const catB = categories.find(c => c.id === b.categoryId)?.name || "";
          return sortDirection === 'asc' ? catA.localeCompare(catB) : catB.localeCompare(catA);
        }
        return 0;
      });
  }, [transactions, searchTerm, filterType, sortField, sortDirection, categories]);

  const totalIncome = useMemo(() => transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.value, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.value, 0), [transactions]);
  const balance = totalIncome - totalExpense;

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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Transacciones</h1>
          <p className="text-slate-500 text-sm">
            Registro histórico e integridad financiera ({filteredAndSorted.length} registros).
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{ backgroundColor: 'var(--color-primary)' }}
          className="text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Agregar Transacción
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-5 rounded-3xl border shadow-sm flex items-center justify-between"
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Ingresos</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">${totalIncome.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div
          className="p-5 rounded-3xl border shadow-sm flex items-center justify-between"
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Egresos</span>
            <p className="text-2xl font-black text-rose-600 mt-1">${totalExpense.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div
          className="p-5 rounded-3xl border shadow-sm flex items-center justify-between"
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Balance Neto</span>
            <p className={`text-2xl font-black mt-1 ${balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              ${balance.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-2xl" style={{ color: 'var(--color-primary)' }}>
            <Scale className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm space-y-3 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por observaciones o concepto..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              className="bg-transparent text-xs font-bold text-slate-700 outline-none"
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value as any); setCurrentPage(1); }}
            >
              <option value="ALL">Todos los tipos</option>
              <option value={TransactionType.INCOME}>Ingresos</option>
              <option value={TransactionType.EXPENSE}>Gastos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div
        className="rounded-3xl border shadow-sm overflow-hidden"
        style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead style={{ backgroundColor: 'var(--color-table-header-bg)', color: 'var(--color-table-header-text)' }}>
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider w-16">Acción</th>
                <th
                  onClick={() => handleSort('date')}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-black/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Fecha {renderSortIcon('date')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('value')}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-black/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Monto {renderSortIcon('value')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-black/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Categoría / Miembro {renderSortIcon('category')}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Medio / Soporte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium text-sm">
                    No hay transacciones que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                paginatedData.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                        <button
                          data-menu-button
                          onClick={() => setOpenMenuId(openMenuId === t.id ? null : t.id)}
                          className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                          title="Opciones"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.5 1.5H9.5V3.5H10.5V1.5ZM10.5 8.5H9.5V10.5H10.5V8.5ZM10.5 15.5H9.5V17.5H10.5V15.5Z" />
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === t.id && (
                          <div data-menu-content className="absolute left-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[90] animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                            <button
                              onClick={() => { handleOpenModal(t); setOpenMenuId(null); }}
                              className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 border-b border-slate-100 text-xs font-bold"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                              Editar Transacción
                            </button>
                            <button
                              onClick={() => { setItemToDelete(t.id); setOpenMenuId(null); }}
                              className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center gap-2.5 text-xs font-bold"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-700">
                      {t.date}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-1.5 font-black text-base ${t.type === TransactionType.INCOME ? "text-emerald-600" : "text-rose-600"}`}>
                        {t.type === TransactionType.INCOME ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                        ${t.value.toLocaleString()}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">
                        {categories.find((c) => c.id === t.categoryId)?.name || "Sin categoría"}
                      </div>
                      {t.personId && (
                        <p className="text-xs text-slate-500 font-medium">
                          {people.find((p) => p.id === t.personId)?.fullName}
                        </p>
                      )}
                      {t.observations && (
                        <p className="text-[11px] text-slate-400 truncate max-w-xs italic">{t.observations}</p>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {t.medioTrx === PaymentMethod.CASH ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 uppercase bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                            <Wallet className="w-3 h-3" /> Efectivo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 uppercase bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                            <CreditCard className="w-3 h-3" /> Transferencia
                          </span>
                        )}
                        {t.attachmentUrl && (
                          <a
                            href={t.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all"
                            title={t.attachmentName || "Ver adjunto"}
                          >
                            <File className="w-4 h-4" />
                          </a>
                        )}
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

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative p-6 text-white shrink-0" style={{ backgroundColor: 'var(--color-form-header-bg)' }}>
              <h3 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold" style={{ color: 'var(--color-form-title-color)' }}>
                {editingItem ? "EDITAR TRANSACCIÓN" : "NUEVA TRANSACCIÓN"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Tipo</label>
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.type === TransactionType.INCOME ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500"}`}
                      onClick={() => handleTypeChange(TransactionType.INCOME)}
                    >
                      Ingreso
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.type === TransactionType.EXPENSE ? "bg-rose-600 text-white shadow-sm" : "text-slate-500"}`}
                      onClick={() => handleTypeChange(TransactionType.EXPENSE)}
                    >
                      Gasto
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Medio de Pago</label>
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.medioTrx === PaymentMethod.CASH ? "bg-white text-amber-700 shadow-sm" : "text-slate-500"}`}
                      onClick={() => setFormData({ ...formData, medioTrx: PaymentMethod.CASH })}
                    >
                      Efectivo
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.medioTrx === PaymentMethod.TRANSFER ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
                      onClick={() => setFormData({ ...formData, medioTrx: PaymentMethod.TRANSFER })}
                    >
                      Transferencia
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Fecha</label>
                    <label className="flex items-center gap-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isDateSticky}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setIsDateSticky(checked);
                          if (checked) {
                            setStickyDate(formData.date);
                          }
                        }}
                        className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="text-[10px] font-bold uppercase text-slate-500">Establecer</span>
                    </label>
                  </div>
                  <input
                    required
                    type="date"
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    value={formData.date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setFormData({ ...formData, date: newDate });
                      if (isDateSticky) {
                        setStickyDate(newDate);
                      }
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Valor ($)</label>
                  <input
                    required
                    type="text"
                    style={{ color: 'var(--color-form-input-text)' }}
                    placeholder="0"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 text-slate-900"
                    value={displayValue}
                    onChange={handleValueChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Categoría</label>
                  <select
                    required
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Seleccionar categoría...</option>
                    {filteredFormCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Persona (Opcional)</label>
                  <div className="flex gap-2">
                    <select
                      style={{ color: 'var(--color-form-input-text)' }}
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100"
                      value={formData.personId}
                      onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
                    >
                      <option value="">Ninguna seleccionada</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>{p.fullName} ({p.identification})</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setPersonFormData(defaultPersonData);
                        setIsPersonModalOpen(true);
                      }}
                      style={{ 
                        color: 'var(--color-primary)', 
                        borderColor: 'var(--color-card-border)', 
                        backgroundColor: 'var(--color-table-header-bg)' 
                      }}
                      className="px-3 border rounded-xl transition-all flex items-center justify-center shadow-sm hover:opacity-80"
                      title="Agregar nueva persona"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Observaciones</label>
                  <textarea
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 min-h-[80px]"
                    placeholder="Detalles adicionales..."
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Soporte Adjunto</label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 truncate max-w-xs">{formData.attachmentName || "Sin soporte adjunto"}</span>
                    <label className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 cursor-pointer hover:bg-indigo-50">
                      Adjuntar Archivo
                      <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-xs">
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  className="text-white px-8 py-2.5 rounded-2xl font-bold text-xs shadow-lg hover:opacity-90 transition-all"
                >
                  {editingItem ? "Actualizar Transacción" : "Guardar Transacción"}
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
            <h3 className="text-xl font-bold text-slate-900 text-center">Eliminar Transacción</h3>
            <p className="text-sm text-slate-500 text-center">
              ¿Estás seguro de que deseas eliminar este registro financiero?
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs hover:bg-slate-200">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl text-xs hover:bg-red-700 shadow-lg shadow-red-200">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Formulario Registro / Edición de Persona (desde Transacciones) */}
      {isPersonModalOpen && (
        <div className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <div className="relative p-6 text-white shrink-0" style={{ backgroundColor: 'var(--color-form-header-bg)' }}>
              <h3 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold" style={{ color: 'var(--color-form-title-color)' }}>
                NUEVO PERFIL DE PERSONA
              </h3>
              <button type="button" onClick={() => setIsPersonModalOpen(false)} className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePerson} className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-slate-800">
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative group w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={personFormData.photoUrl || "https://via.placeholder.com/150?text=SIN+FOTO"} className="w-full h-full object-cover" alt="" />
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Cambiar</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handlePersonFileChange} />
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
                      value={personFormData.idType}
                      onChange={e => setPersonFormData({ ...personFormData, idType: e.target.value as IdType })}
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
                      value={personFormData.identification}
                      onChange={e => setPersonFormData({ ...personFormData, identification: e.target.value })}
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
                    value={personFormData.fullName}
                    onChange={e => setPersonFormData({ ...personFormData, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Email</label>
                  <input
                    type="email"
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                    value={personFormData.email}
                    onChange={e => setPersonFormData({ ...personFormData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Celular / Teléfono</label>
                  <input
                    type="tel"
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                    value={personFormData.phone}
                    onChange={e => setPersonFormData({ ...personFormData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Dirección</label>
                  <input
                    type="text"
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                    value={personFormData.address}
                    onChange={e => setPersonFormData({ ...personFormData, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Barrio</label>
                  <input
                    type="text"
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                    value={personFormData.neighborhood}
                    onChange={e => setPersonFormData({ ...personFormData, neighborhood: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Ocupación</label>
                  <select
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                    value={personFormData.occupation}
                    onChange={e => setPersonFormData({ ...personFormData, occupation: e.target.value as Occupation })}
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
                    value={personFormData.birthDate}
                    onChange={e => setPersonFormData({ ...personFormData, birthDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Ministerio</label>
                  <select
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                    value={personFormData.ministryId}
                    onChange={e => setPersonFormData({ ...personFormData, ministryId: e.target.value })}
                  >
                    {activeMinistries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-form-label)' }}>Tipo de Membresía</label>
                  <select
                    style={{ color: 'var(--color-form-input-text)' }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500"
                    value={personFormData.membershipType}
                    onChange={e => setPersonFormData({ ...personFormData, membershipType: e.target.value as MembershipType })}
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
                    checked={personFormData.isBaptized}
                    onChange={e => setPersonFormData({ ...personFormData, isBaptized: e.target.checked })}
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
                        onClick={() => setPersonFormData({ ...personFormData, sex: g })}
                        style={{ backgroundColor: personFormData.sex === g ? 'var(--color-primary)' : undefined }}
                        className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${personFormData.sex === g ? 'text-white' : 'bg-white text-slate-600 border'}`}
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
                    className="w-full bg-transparent text-xs font-bold outline-none font-sans"
                    value={personFormData.civilStatus}
                    onChange={e => setPersonFormData({ ...personFormData, civilStatus: e.target.value as CivilStatus })}
                  >
                    {Object.values(CivilStatus).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsPersonModalOpen(false)} className="px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 text-xs">
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  className="px-8 py-3 text-white font-bold rounded-2xl text-xs shadow-lg hover:opacity-90 transition-all"
                >
                  Guardar Persona
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

export default TransactionsView;

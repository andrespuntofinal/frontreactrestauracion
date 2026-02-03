
import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Youtube, 
  Church, 
  Calendar,
  ShieldCheck,
  Heart,
  Target,
  Eye
} from 'lucide-react';
import { SiteParameters } from '../types';

interface Props {
  params: SiteParameters;
  onAdminAccess: () => void;
}

const LandingView: React.FC<Props> = ({ params, onAdminAccess }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (params.heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % params.heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [params.heroImages.length]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <nav className="fixed top-0 inset-x-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <Church className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">ComunidadPro</span>
        </div>
        
        <button 
          onClick={onAdminAccess}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-100"
        >
          <ShieldCheck className="w-4 h-4" />
          Acceso Administrativo
        </button>
      </nav>

      {/* Hero Section / Carousel */}
      <section className="relative h-[85vh] overflow-hidden mt-16">
        <div className="absolute inset-0 transition-all duration-1000">
          <img 
            src={params.heroImages[currentSlide]} 
            className="w-full h-full object-cover" 
            alt="Hero Slide" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            Creciendo Juntos <br /> en Comunidad
          </h1>
          <p className="text-xl text-slate-200 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Un espacio donde cada persona cuenta y cada servicio transforma vidas.
          </p>
          <div className="mt-10 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <button className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/30">
              Conócenos más
            </button>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
          {params.heroImages.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2.5 rounded-full transition-all ${currentSlide === i ? 'w-10 bg-indigo-500' : 'w-2.5 bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      {/* Institutional Info */}
      <section className="py-24 px-6 max-w-6xl mx-auto space-y-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-4xl font-black text-slate-900">¿Quiénes Somos?</h2>
            <p className="text-xl text-slate-500 leading-relaxed">
              {params.aboutUs}
            </p>
          </div>
          <div className="bg-slate-50 rounded-[3rem] p-12 border border-slate-100 shadow-inner">
            <div className="space-y-12">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Target className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Misión</h3>
                  <p className="text-slate-500">{params.mission}</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Eye className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Visión</h3>
                  <p className="text-slate-500">{params.vision}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-slate-900">Nuestros Eventos</h2>
            <p className="text-slate-500 text-lg">No te pierdas de nada. ¡Te esperamos!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {params.events.map(event => (
              <div key={event.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all">
                <div className="h-64 overflow-hidden relative">
                  <img src={event.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={event.title} />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md text-indigo-600 font-bold px-4 py-1.5 rounded-xl text-sm shadow-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {event.date}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{event.title}</h3>
                  <button className="text-indigo-600 font-bold flex items-center gap-2 group/btn">
                    Ver detalles 
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 px-6 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Church className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">ComunidadPro</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Trabajamos por una comunidad más unida, solidaria y llena de fe.
            </p>
            <div className="flex gap-4">
              <a href={params.contact.facebook} target="_blank" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-all"><Facebook className="w-5 h-5" /></a>
              <a href={params.contact.instagram} target="_blank" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-all"><Instagram className="w-5 h-5" /></a>
              <a href={params.contact.youtube} target="_blank" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-all"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-bold">Contacto</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-indigo-400 mt-1" />
                <p className="text-slate-400">{params.contact.address}</p>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-indigo-400" />
                <p className="text-slate-400">{params.contact.phone}</p>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-indigo-400" />
                <p className="text-slate-400">{params.contact.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-bold">Suscríbete</h4>
            <p className="text-slate-400">Recibe noticias y actualizaciones de nuestros eventos.</p>
            <div className="relative">
              <input type="email" placeholder="Tu correo" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 outline-none focus:border-indigo-500 transition-all" />
              <button className="absolute right-2 top-2 p-1.5 bg-indigo-600 rounded-xl hover:bg-indigo-500"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} ComunidadPro. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default LandingView;

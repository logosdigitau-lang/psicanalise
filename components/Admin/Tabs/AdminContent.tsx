
import React, { useState } from 'react';
import { ClinicalSettings, PageContent } from '../../../types';
import { StorageService } from '../../../services/storageService';

interface AdminContentProps {
    clinicalSettings: ClinicalSettings;
    onUpdateSettings: (settings: ClinicalSettings) => void;
}

export const AdminContent: React.FC<AdminContentProps> = ({ clinicalSettings, onUpdateSettings }) => {
    const [tempSettings, setTempSettings] = useState<ClinicalSettings>(clinicalSettings);
    const [uploading, setUploading] = useState<string | null>(null);

    const updateContentField = (field: keyof PageContent, value: string) => {
        const newSettings = {
            ...tempSettings,
            content: {
                ...tempSettings.content,
                [field]: value
            }
        };
        setTempSettings(newSettings);
        onUpdateSettings(newSettings);
    };

    const handleImageUpload = async (field: keyof PageContent, file: File) => {
        setUploading(field);
        const url = await StorageService.uploadImage(file);
        if (url) {
            updateContentField(field, url);
        } else {
            alert("Erro ao fazer upload da imagem.");
        }
        setUploading(null);
    };

    return (
        <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm space-y-12">
            <h2 className="text-3xl font-serif text-slate-900 italic">Gestão de Conteúdo</h2>

            {/* Hero Section Management */}
            <div className="space-y-8">
                <h3 className="text-xl font-serif font-bold border-b pb-4">Seção de Início (Hero)</h3>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Título Principal</label>
                            <input type="text" value={tempSettings.content.heroTitle} onChange={e => updateContentField('heroTitle', e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Subtítulo (Etiqueta)</label>
                            <input type="text" value={tempSettings.content.heroSubtitle} onChange={e => updateContentField('heroSubtitle', e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Descrição</label>
                            <textarea value={tempSettings.content.heroDescription} onChange={e => updateContentField('heroDescription', e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none h-32 resize-none" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Foto de Perfil (Hero)</label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files && handleImageUpload('heroImageUrl', e.target.files[0])}
                                    className="hidden"
                                    id="hero-upload"
                                />
                                <label htmlFor="hero-upload" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                                    <span className="text-sm text-slate-500">{uploading === 'heroImageUrl' ? 'Enviando...' : 'Selecionar Imagem...'}</span>
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                </label>
                                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest">Recomendado: 800x1000px (Vertical)</p>
                            </div>
                        </div>
                        <div className="aspect-[4/5] rounded-3xl overflow-hidden border bg-slate-50 relative group">
                            <img src={tempSettings.content.heroImageUrl} alt="Preview Hero" className="w-full h-full object-cover" />
                            {uploading === 'heroImageUrl' && (
                                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                                    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bio Section Management */}
            <div className="space-y-8 pt-8">
                <h3 className="text-xl font-serif font-bold border-b pb-4">Biografia</h3>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Título da Bio</label>
                            <input type="text" value={tempSettings.content.bioTitle} onChange={e => updateContentField('bioTitle', e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Subtítulo da Bio</label>
                            <input type="text" value={tempSettings.content.bioSubtitle} onChange={e => updateContentField('bioSubtitle', e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Texto Biográfico</label>
                            <textarea value={tempSettings.content.bioText} onChange={e => updateContentField('bioText', e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none h-64 resize-none" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Foto Bio</label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files && handleImageUpload('bioImageUrl', e.target.files[0])}
                                    className="hidden"
                                    id="bio-upload"
                                />
                                <label htmlFor="bio-upload" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                                    <span className="text-sm text-slate-500">{uploading === 'bioImageUrl' ? 'Enviando...' : 'Selecionar Imagem...'}</span>
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                </label>
                                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest">Recomendado: 1000x800px (Horizontal/Quadrada)</p>
                            </div>
                        </div>
                        <div className="aspect-[4/5] rounded-3xl overflow-hidden border bg-slate-50 relative">
                            <img src={tempSettings.content.bioImageUrl} alt="Preview Bio" className="w-full h-full object-cover" />
                            {uploading === 'bioImageUrl' && (
                                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                                    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Management */}
            <div className="space-y-8 pt-8">
                <h3 className="text-xl font-serif font-bold border-b pb-4">Informações de Contato</h3>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400">E-mail de Contato</label>
                            <input type="email" value={tempSettings.content.clinicEmail} onChange={e => updateContentField('clinicEmail', e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400">WhatsApp</label>
                            <input type="text" value={tempSettings.content.clinicPhone} onChange={e => updateContentField('clinicPhone', e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400">URL Instagram</label>
                            <input type="text" value={tempSettings.content.instagramUrl} onChange={e => updateContentField('instagramUrl', e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

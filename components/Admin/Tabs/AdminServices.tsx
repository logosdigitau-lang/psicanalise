import React, { useState } from 'react';
import { Service } from '../../../types';

interface AdminServicesProps {
    services: Service[];
    onUpdateServices: (services: Service[]) => void;
}

export const AdminServices: React.FC<AdminServicesProps> = ({ services, onUpdateServices }) => {

    // Function to update a specific service
    const updateService = (id: string, field: keyof Service, value: any) => {
        const newServices = services.map(s => s.id === id ? { ...s, [field]: value } : s);
        onUpdateServices(newServices);
    };

    // Function to add a new empty service
    const handleAddService = () => {
        const newService: Service = {
            id: Math.random().toString(36).substr(2, 9), // Fallback ID generation
            name: 'Novo Serviço',
            description: 'Descrição do serviço...',
            price: 150,
            duration: 50,
            type: 'regular' // Default type
        };
        onUpdateServices([...services, newService]);
    };

    // Function to remove a service
    const handleRemoveService = (id: string) => {
        if (confirm('Tem certeza que deseja remover este serviço?')) {
            onUpdateServices(services.filter(s => s.id !== id));
        }
    };

    return (
        <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm space-y-12">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif text-slate-900 italic">Serviços e Valores</h2>
                <button
                    onClick={handleAddService}
                    className="px-6 py-3 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg"
                >
                    Adicionar Serviço
                </button>
            </div>

            <div className="grid gap-8">
                {services.map(service => (
                    <div key={service.id} className="relative p-8 rounded-[35px] border border-slate-100 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:shadow-md transition-all">

                        <div className="flex-grow w-full md:max-w-[60%] space-y-3">
                            {/* Service Name */}
                            <input
                                type="text"
                                value={service.name}
                                onChange={e => updateService(service.id, 'name', e.target.value)}
                                className="bg-transparent border-b border-transparent focus:border-slate-200 text-xl font-serif font-bold text-slate-900 w-full outline-none transition-all placeholder:text-slate-300"
                                placeholder="Nome do Serviço"
                            />

                            {/* Service Description */}
                            <textarea
                                value={service.description}
                                onChange={e => updateService(service.id, 'description', e.target.value)}
                                className="w-full bg-slate-50 rounded-xl p-3 text-sm text-slate-500 font-light italic outline-none focus:ring-2 focus:ring-slate-100 resize-none"
                                rows={2}
                                placeholder="Descrição detalhada..."
                            />

                            {/* Duration & Type */}
                            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <span>Duração:</span>
                                    <input
                                        type="number"
                                        value={service.duration}
                                        onChange={e => updateService(service.id, 'duration', parseInt(e.target.value))}
                                        className="w-10 bg-transparent text-center font-bold text-slate-700 outline-none"
                                    />
                                    <span>min</span>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <span>Tipo:</span>
                                    <select
                                        value={service.type}
                                        onChange={e => updateService(service.id, 'type', e.target.value as any)}
                                        className="bg-transparent font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="initial">Sessão Inicial</option>
                                        <option value="regular">Sessão Regular</option>
                                        <option value="plan">Pacote / Plano</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border min-w-[180px]">
                                <span className="text-slate-400">R$</span>
                                <input
                                    type="number"
                                    value={service.price}
                                    onChange={e => updateService(service.id, 'price', parseFloat(e.target.value))}
                                    className="w-full border-none p-0 text-right font-bold text-2xl bg-transparent outline-none text-slate-900"
                                />
                            </div>
                            <button
                                onClick={() => handleRemoveService(service.id)}
                                className="text-red-300 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors pr-2"
                            >
                                Remover
                            </button>
                        </div>
                    </div>
                ))}

                {services.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-[35px] border border-dashed border-slate-200">
                        <p className="text-slate-400 italic">Nenhum serviço cadastrado.</p>
                        <button onClick={handleAddService} className="mt-4 text-[#7E9084] font-bold underline text-sm">Criar primeiro serviço</button>
                    </div>
                )}
            </div>
        </div>
    );
};

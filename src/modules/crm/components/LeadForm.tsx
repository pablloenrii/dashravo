/**
 * RAVO OS — LeadForm Component
 * Formulário para criar/editar leads
 */

import { useState } from 'react';
import { Lead, useCRMStore } from '../store';
import { Button, Input, Card } from '@/components/ui';

interface LeadFormProps {
  lead?: Lead;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function LeadForm({ lead, onSuccess, onCancel }: LeadFormProps) {
  const { createLead, updateLead, isLoading } = useCRMStore();
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    company: lead?.company || '',
    status: (lead?.status || 'lead') as Lead['status'],
    value: lead?.value?.toString() || '',
    notes: lead?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (lead?.id) {
        await updateLead(lead.id, {
          ...formData,
          value: formData.value ? parseFloat(formData.value) : undefined,
        });
      } else {
        await createLead({
          ...formData,
          value: formData.value ? parseFloat(formData.value) : undefined,
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nome"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Telefone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            label="Empresa"
            name="company"
            value={formData.company}
            onChange={handleChange}
          />
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="lead">Lead</option>
              <option value="qualified">Qualified</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          <Input
            label="Valor"
            name="value"
            type="number"
            value={formData.value}
            onChange={handleChange}
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Notas
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : lead ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

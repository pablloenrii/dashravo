/**
 * RAVO OS — LeadsList Component
 * Lista de leads com status e ações
 */

import { Lead, useCRMStore } from '../store';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';

interface LeadsListProps {
  leads: Lead[];
  onEdit?: (lead: Lead) => void;
}

const statusColors = {
  lead: 'bg-blue-100 text-blue-800',
  qualified: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-purple-100 text-purple-800',
  converted: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
};

export default function LeadsList({ leads, onEdit }: LeadsListProps) {
  const { deleteLead } = useCRMStore();

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este lead?')) {
      await deleteLead(id);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Nome
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Email
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Empresa
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Valor
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900">{lead.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{lead.email}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{lead.company || '-'}</td>
              <td className="px-6 py-4">
                <Badge className={statusColors[lead.status]}>
                  {lead.status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {lead.value ? `$${lead.value.toFixed(2)}` : '-'}
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onEdit?.(lead)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(lead.id)}
                  >
                    Deletar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * RAVO OS — Testes do componente Table (src/components/Table.tsx)
 * Cobre render, ordenação, paginação, seleção e row click.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table } from '@/components/Table';

interface Row {
  id: number;
  nome: string;
  valor: number;
}

const rows: Row[] = [
  { id: 1, nome: 'Beta', valor: 30 },
  { id: 2, nome: 'Alfa', valor: 10 },
  { id: 3, nome: 'Gama', valor: 20 },
];

const columns = [
  { key: 'nome' as const, label: 'Nome', sortable: true },
  { key: 'valor' as const, label: 'Valor', align: 'right' as const },
];

function table() {
  return render(<Table<Row> columns={columns} data={rows} />);
}

describe('Table', () => {
  it('renderiza cabeçalhos e linhas', () => {
    table();
    expect(screen.getByText('Nome')).toBeTruthy();
    expect(screen.getByText('Valor')).toBeTruthy();
    expect(screen.getByText('Beta')).toBeTruthy();
    expect(screen.getByText('Gama')).toBeTruthy();
  });

  it('usa a função render para exibir valores', () => {
    render(
      <Table<Row>
        columns={[{ key: 'valor', label: 'Valor', render: (v: number) => `R$ ${v}` }]}
        data={rows}
      />
    );
    expect(screen.getByText('R$ 30')).toBeTruthy();
  });

  it('ordena ao clicar no cabeçalho sortable (asc e desc)', () => {
    table();
    fireEvent.click(screen.getByText('Nome'));

    // asc: Alfa, Beta, Gama
    const cells = screen.getAllByRole('row').slice(1).map((r) => r.textContent);
    expect(cells[0]).toContain('Alfa');

    // desc: Gama, Beta, Alfa
    fireEvent.click(screen.getByText('Nome'));
    const cellsDesc = screen.getAllByRole('row').slice(1).map((r) => r.textContent);
    expect(cellsDesc[0]).toContain('Gama');
  });

  it('dispara onRowClick com a linha e o índice', () => {
    const onRowClick = vi.fn();
    render(<Table<Row> columns={columns} data={rows} onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText('Beta'));
    expect(onRowClick).toHaveBeenCalledWith({ id: 1, nome: 'Beta', valor: 30 }, 0);
  });

  it('pagina quando há mais linhas que pageSize', () => {
    const many = Array.from({ length: 25 }, (_, i) => ({ id: i, nome: `Item ${i}`, valor: i }));
    render(<Table<Row> columns={columns} data={many} pageSize={10} />);

    expect(screen.getByText(/Mostrando 1 até 10 de 25/)).toBeTruthy();
    expect(screen.getByText('Item 0')).toBeTruthy();
    expect(screen.queryByText('Item 15')).toBeNull();

    fireEvent.click(screen.getByText('Próxima'));
    expect(screen.getByText('Item 15')).toBeTruthy();
    expect(screen.getByText(/Mostrando 11 até 20 de 25/)).toBeTruthy();

    fireEvent.click(screen.getByText('3'));
    expect(screen.getByText(/Mostrando 21 até 25 de 25/)).toBeTruthy();

    // Anterior volta para a página 2
    fireEvent.click(screen.getByText('Anterior'));
    expect(screen.getByText(/Mostrando 11 até 20 de 25/)).toBeTruthy();
  });

  it('não mostra paginação quando paginated=false', () => {
    render(<Table<Row> columns={columns} data={rows} paginated={false} />);
    expect(screen.queryByText(/Mostrando/)).toBeNull();
  });

  it('seleciona uma linha e reporta a seleção', () => {
    const onSelectionChange = vi.fn();
    render(
      <Table<Row> columns={columns} data={rows} selectable onSelectionChange={onSelectionChange} />
    );

    // botões de seleção ficam na primeira coluna de cada linha
    const rowButtons = screen.getAllByRole('button');
    fireEvent.click(rowButtons[1]);
    expect(onSelectionChange).toHaveBeenLastCalledWith([0]);
  });

  it('seleciona todas as linhas da página e alterna', () => {
    const onSelectionChange = vi.fn();
    render(
      <Table<Row> columns={columns} data={rows} selectable onSelectionChange={onSelectionChange} />
    );

    const headerButton = screen.getAllByRole('button')[0];
    fireEvent.click(headerButton);
    expect(onSelectionChange).toHaveBeenLastCalledWith([0, 1, 2]);

    fireEvent.click(headerButton);
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
  });

  it('seleção de linha não dispara onRowClick (stopPropagation)', () => {
    const onRowClick = vi.fn();
    const onSelectionChange = vi.fn();
    render(
      <Table<Row>
        columns={columns}
        data={rows}
        selectable
        onRowClick={onRowClick}
        onSelectionChange={onSelectionChange}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[1]);
    expect(onRowClick).not.toHaveBeenCalled();
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('aplica striped/hoverable sem quebrar', () => {
    const { container } = table();
    const firstRow = container.querySelector('tbody tr')!;
    fireEvent.mouseEnter(firstRow);
    fireEvent.mouseLeave(firstRow);
  });
});

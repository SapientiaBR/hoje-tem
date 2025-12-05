import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Evento {
  id: string;
  nome: string;
  categoria: string;
  cidade: string;
  estado: string;
  local: string;
  endereco: string | null;
  data: string;
  data_fim: string | null;
  descricao: string | null;
  imagem: string | null;
  preco: number;
  preco_max: number | null;
  coordenadas_lat: number | null;
  coordenadas_lng: number | null;
  origem: string | null;
  destaque: boolean;
  created_at: string;
}

export interface Filtros {
  busca: string;
  categoria: string;
  dataInicio: Date | null;
  dataFim: Date | null;
  precoMin: number;
  precoMax: number;
  cidade: string;
}

export function useEventos(filtros: Filtros) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventos();
  }, [filtros]);

  const fetchEventos = async () => {
    setLoading(true);
    
    let query = supabase
      .from('eventos')
      .select('*')
      .order('data', { ascending: true });

    if (filtros.busca) {
      query = query.or(`nome.ilike.%${filtros.busca}%,local.ilike.%${filtros.busca}%,descricao.ilike.%${filtros.busca}%`);
    }

    if (filtros.categoria && filtros.categoria !== 'Todos') {
      query = query.eq('categoria', filtros.categoria);
    }

    if (filtros.cidade) {
      query = query.eq('cidade', filtros.cidade);
    }

    if (filtros.dataInicio) {
      query = query.gte('data', filtros.dataInicio.toISOString());
    }

    if (filtros.dataFim) {
      query = query.lte('data', filtros.dataFim.toISOString());
    }

    if (filtros.precoMax < 500) {
      query = query.lte('preco', filtros.precoMax);
    }

    if (filtros.precoMin > 0) {
      query = query.gte('preco', filtros.precoMin);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching eventos:', error);
    } else {
      setEventos(data || []);
    }
    
    setLoading(false);
  };

  return { eventos, loading, refetch: fetchEventos };
}

export function useCategorias() {
  return [
    'Todos',
    'Shows',
    'Teatro',
    'Stand-up',
    'Gastronomia',
    'Feiras',
    'Eventos de Rua',
    'Exposições',
    'Esportes',
    'Infantil'
  ];
}
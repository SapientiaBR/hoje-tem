import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function useFavoritos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavoritos();
    } else {
      setFavoritos([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavoritos = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('favoritos')
      .select('evento_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching favoritos:', error);
    } else {
      setFavoritos(data?.map(f => f.evento_id) || []);
    }
    setLoading(false);
  };

  const toggleFavorito = async (eventoId: string) => {
    if (!user) return;

    const isFavorito = favoritos.includes(eventoId);

    if (isFavorito) {
      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('user_id', user.id)
        .eq('evento_id', eventoId);

      if (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível remover dos favoritos',
          variant: 'destructive'
        });
      } else {
        setFavoritos(prev => prev.filter(id => id !== eventoId));
        toast({
          title: 'Removido',
          description: 'Evento removido dos favoritos'
        });
      }
    } else {
      const { error } = await supabase
        .from('favoritos')
        .insert({ user_id: user.id, evento_id: eventoId });

      if (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível adicionar aos favoritos',
          variant: 'destructive'
        });
      } else {
        setFavoritos(prev => [...prev, eventoId]);
        toast({
          title: 'Adicionado',
          description: 'Evento salvo nos favoritos'
        });
      }
    }
  };

  const isFavorito = (eventoId: string) => favoritos.includes(eventoId);

  return { favoritos, loading, toggleFavorito, isFavorito, refetch: fetchFavoritos };
}
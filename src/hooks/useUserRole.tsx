import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'user' | 'organizador' | 'local' | 'admin';

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching roles:', error);
        setRoles([]);
      } else {
        setRoles((data || []).map(r => r.role as AppRole));
      }
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: AppRole) => roles.includes(role);
  const isOrganizador = hasRole('organizador') || hasRole('admin');
  const isLocal = hasRole('local') || hasRole('admin');
  const isAdmin = hasRole('admin');

  const requestOrganizadorRole = async () => {
    if (!user) return { error: 'Usuário não autenticado' };
    
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: user.id, role: 'organizador' as AppRole });
    
    if (error) {
      if (error.code === '23505') {
        return { error: 'Você já é um organizador' };
      }
      return { error: error.message };
    }
    
    setRoles([...roles, 'organizador']);
    return { error: null };
  };

  return {
    roles,
    loading,
    hasRole,
    isOrganizador,
    isLocal,
    isAdmin,
    requestOrganizadorRole,
  };
}

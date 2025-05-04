// src/lib/profile.js
import { supabase } from './supabaseClient';

export async function getUserProfile() {
  const user = supabase.auth.user(); // Obtém o usuário logado

  if (user) {
    const { data, error } = await supabase
      .from('profile')
      .select('cpf')
      .eq('id', user.id)
      .single(); // Pega apenas um registro

    if (error) {
      return null;
    }

    return data?.cpf; // Retorna o CPF
  }
  
  return null; // Retorna null se não tiver um usuário logado
}

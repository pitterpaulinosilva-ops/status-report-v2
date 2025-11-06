/**
 * useComments Hook
 * Custom hook for managing comments on actions
 * Integrates with Supabase with localStorage fallback
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Comment, CommentInsert } from '@/types/supabase';

interface CommentWithProfile extends Comment {
  author_name?: string;
  author_email?: string;
}

export const useComments = (actionId: number) => {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  /**
   * Load comments from Supabase
   */
  const loadComments = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('action_id', actionId)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      // Mapear dados com informações do perfil
      const commentsWithProfiles: CommentWithProfile[] = (data || []).map(comment => ({
        ...comment,
        author_name: (comment.profiles as any)?.full_name || 'Usuário',
        author_email: (comment.profiles as any)?.email || '',
      }));
      
      setComments(commentsWithProfiles);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Erro ao carregar comentários');
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [actionId, user]);
  
  /**
   * Create a new comment
   */
  const createComment = useCallback(async (content: string): Promise<boolean> => {
    if (!user) {
      setError('Você precisa estar autenticado para comentar');
      return false;
    }

    if (!content.trim()) {
      setError('O comentário não pode estar vazio');
      return false;
    }

    setError(null);
    
    try {
      const commentInsert: CommentInsert = {
        action_id: actionId,
        user_id: user.id,
        content: content.trim(),
        type: 'comment',
      };
      
      const { error: insertError } = await supabase
        .from('comments')
        .insert(commentInsert);
      
      if (insertError) throw insertError;
      
      // Recarregar comentários
      await loadComments();
      return true;
    } catch (err) {
      console.error('Error creating comment:', err);
      setError('Erro ao criar comentário');
      return false;
    }
  }, [actionId, user, loadComments]);
  
  /**
   * Load comments on mount and setup realtime subscription
   */
  useEffect(() => {
    loadComments();
    
    if (!user) return;
    
    // Setup realtime subscription
    const channel = supabase
      .channel(`comments_${actionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `action_id=eq.${actionId}`
        },
        (payload) => {
          console.log('Comment change received:', payload);
          loadComments();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadComments, user, actionId]);
  
  const refresh = useCallback(() => {
    loadComments();
  }, [loadComments]);
  
  return {
    comments,
    isLoading,
    error,
    createComment,
    refresh
  };
};

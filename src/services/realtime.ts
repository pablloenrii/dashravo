/**
 * RAVO OS — Real-Time Service
 * Gerencia subscriptions Supabase para live updates
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { sb } from './supabase';

interface RealtimeCallback {
  onInsert?: (data: any) => void;
  onUpdate?: (data: any) => void;
  onDelete?: (data: any) => void;
}

/**
 * Gerenciador de subscriptions real-time
 */
export class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private listeners: Map<string, RealtimeCallback[]> = new Map();

  /**
   * Subscrever a tabela
   */
  subscribe(
    tableName: string,
    callbacks: RealtimeCallback
  ): () => void {
    if (!sb) {
      console.error('Supabase não inicializado');
      return () => {};
    }

    // Criar channel se não existir
    let channel = this.channels.get(tableName);
    if (!channel) {
      channel = sb
        .channel(`public:${tableName}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
          },
          (payload) => {
            this.handleChange(tableName, payload, callbacks);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`✅ Subscribed to ${tableName}`);
          }
          if (status === 'CHANNEL_ERROR') {
            console.error(`❌ Error subscribing to ${tableName}`);
          }
        });

      this.channels.set(tableName, channel);
    }

    // Guardar callback para múltiplas subscriptions
    if (!this.listeners.has(tableName)) {
      this.listeners.set(tableName, []);
    }
    this.listeners.get(tableName)!.push(callbacks);

    // Retornar função de unsubscribe
    return () => this.unsubscribe(tableName, callbacks);
  }

  /**
   * Lidar com mudanças
   */
  private handleChange(
    tableName: string,
    payload: any,
    callbacks: RealtimeCallback
  ) {
    const { eventType, new: newData, old: oldData } = payload;

    console.log(`📡 ${tableName} - ${eventType}`, newData || oldData);

    if (eventType === 'INSERT' && callbacks.onInsert) {
      callbacks.onInsert(newData);
    }
    if (eventType === 'UPDATE' && callbacks.onUpdate) {
      callbacks.onUpdate(newData);
    }
    if (eventType === 'DELETE' && callbacks.onDelete) {
      callbacks.onDelete(oldData);
    }
  }

  /**
   * Desinscrever
   */
  unsubscribe(tableName: string, callbacks: RealtimeCallback) {
    const listeners = this.listeners.get(tableName);
    if (listeners) {
      const index = listeners.indexOf(callbacks);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }

    // Se nenhum listener, remover channel
    if (listeners?.length === 0) {
      const channel = this.channels.get(tableName);
      if (channel) {
        sb?.removeChannel(channel);
        this.channels.delete(tableName);
      }
    }
  }

  /**
   * Limpar todas as subscriptions
   */
  cleanup() {
    this.channels.forEach((channel) => {
      sb?.removeChannel(channel);
    });
    this.channels.clear();
    this.listeners.clear();
    console.log('🧹 Real-time cleanup completo');
  }
}

// Singleton
export const realtimeManager = new RealtimeManager();

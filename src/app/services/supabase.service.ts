import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
    private supabase: SupabaseClient;
    private supabaseUrl = 'https://SEU-PROJETO.supabase.co';
    private supabaseKey = 'SUA-CHAVE-ANON';

    constructor() {
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    }

    async addProduct(product: any) {
        const { data, error } = await this.supabase.from('products').insert([product]);
        if (error) throw error;
        return data;
    }

    async getProducts() {
        const { data, error } = await this.supabase.from('products').select('*');
        if (error) throw error;
        return data;
    }

    async updateProduct(id: number, updates: any) {
        const { data, error } = await this.supabase.from('products').update(updates).eq('id', id);
        if (error) throw error;
        return data;
    }

    async deleteProduct(id: number) {
        const { data, error } = await this.supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        return data;
    }

    async logout() {
        await this.supabase.auth.signOut();
    }
}
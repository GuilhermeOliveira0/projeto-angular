import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product } from '../models/product';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  products = signal<Product[]>([]);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async loadProducts() {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    this.products.set(data as Product[]);
  }

  async addProduct(product: Product) {
    const { error } = await this.supabase.from('products').insert([product]);
    if (error) throw error;
    await this.loadProducts();
  }

  async updateProduct(id: number, updates: Partial<Product>) {
    const { error } = await this.supabase.from('products').update(updates).eq('id', id);
    if (error) throw error;
    await this.loadProducts();
  }

  async deleteProduct(id: number) {
    const { error } = await this.supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    await this.loadProducts();
  }
}

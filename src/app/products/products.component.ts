import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';
import { Product } from '../Models/products';
 
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    ProductDialogComponent
  ],
  templateUrl: './products.component.html',
  styles: [`
    .spacer { flex:1 1 auto; }
    .card-container { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:20px; margin-top:20px; }
    .product-card { border-radius:12px; transition:transform 0.2s, box-shadow 0.2s; }
    .product-card:hover { transform:translateY(-5px); box-shadow:0 15px 30px rgba(0,0,0,0.2); }
    mat-toolbar { position:sticky; top:0; z-index:1000; }
  `]
})
export class ProductsComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
 
  products = signal<Product[]>([]);
 
  ngOnInit() { this.loadProducts(); }
 
  async loadProducts() {
    await this.supabase.loadProducts();
    this.products.set(this.supabase.products());
  }
 
  addProduct() {
    const dialogRef = this.dialog.open(ProductDialogComponent, { width:'400px', data:{ isEdit:false } });
    dialogRef.afterClosed().subscribe(async result => { if(result) await this.supabase.addProduct(result); this.loadProducts(); });
  }
 
  editProduct(product: Product) {
    const dialogRef = this.dialog.open(ProductDialogComponent, { width:'400px', data:{ product, isEdit:true } });
    dialogRef.afterClosed().subscribe(async result => { if(result) await this.supabase.updateProduct(product.id!, result); this.loadProducts(); });
  }
 
  deleteProduct(id: number) {
    if(confirm('Deseja realmente deletar este produto?')) { this.supabase.deleteProduct(id); this.loadProducts(); }
  }
 
  logout() { this.supabase.logout(); this.router.navigate(['/']); }
}
 
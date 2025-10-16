import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SupabaseService } from '../services/supabase.service';
import { Product } from '../models/product';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTableModule, MatIconModule, MatTooltipModule, MatDialogModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  displayedColumns: string[] = ['image', 'name', 'description', 'price', 'actions'];
  supabaseService = inject(SupabaseService);
  dialog = inject(MatDialog);
  router = inject(Router);

  ngOnInit() {
    this.supabaseService.loadProducts();
  }

  get products(): Product[] {
    return this.supabaseService.products();
  }

  openDialog(product?: Product) {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '500px',
      data: { product: product ? { ...product } : { name: '', description: '', price: 0, imageUrl: '' } }
    });

    dialogRef.afterClosed().subscribe((result: Product) => {
      if (result) {
        if (product?.id) {
          this.supabaseService.updateProduct(product.id, result);
        } else {
          this.supabaseService.addProduct({
            ...result,
            createdAt: new Date().toISOString()
          });
        }
      }
    });
  }

  deleteProduct(id: number) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.supabaseService.deleteProduct(id);
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/60?text=Sem+Imagem';
  }

  goBack() {
    this.router.navigate(['/']);
  }
}

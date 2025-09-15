// src/app/product-dialog/product-dialog.component.ts
import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
 
@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h1 mat-dialog-title>{{data.isEdit ? 'Editar Produto' : 'Adicionar Produto'}}</h1>
    <div mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field style="width:100%">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>
 
        <mat-form-field style="width:100%">
          <mat-label>Descrição</mat-label>
          <input matInput formControlName="description">
        </mat-form-field>
 
        <mat-form-field style="width:100%">
          <mat-label>Preço</mat-label>
          <input matInput type="number" formControlName="price">
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">Cancelar</button>
      <button mat-button color="primary" [disabled]="form.invalid" (click)="save()">Salvar</button>
    </div>
  `
})
export class ProductDialogComponent {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<ProductDialogComponent>);
  data = inject(MAT_DIALOG_DATA);
 
  form = this.fb.group({
    name: [this.data.product?.name || '', Validators.required],
    description: [this.data.product?.description || '', Validators.required],
    price: [this.data.product?.price || 0, Validators.required]
  });
 
  close() { this.dialogRef.close(); }
  save() { this.dialogRef.close(this.form.value); }
}
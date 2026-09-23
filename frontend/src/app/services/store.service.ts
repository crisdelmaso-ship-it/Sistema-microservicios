import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { ApiMessage, DesiredProduct, Product, Purchase } from './models';

const API = '';
@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly http = inject(HttpClient);
  products() { return this.http.get<Product[]>(`${API}/api/products`).pipe(timeout(12000)); }
  wishlist() { return this.http.get<ApiMessage<never>>(`${API}/api/products-wanted`).pipe(timeout(12000)); }
  addToWishlist(productoId: number, cantidad: number) { return this.http.post(`${API}/api/products-wanted`, { productoId, cantidad }).pipe(timeout(12000)); }
  removeFromWishlist(id: number) { return this.http.delete(`${API}/api/products-wanted/${id}`).pipe(timeout(12000)); }
  buy(productId: number, quantity: number) { return this.http.post<Purchase>(`${API}/api/v1/purchases`, { productoId: productId, cantidad: quantity }).pipe(timeout(12000)); }
  purchases() { return this.http.get<Purchase[]>(`${API}/api/v1/purchases`).pipe(timeout(12000)); }
}
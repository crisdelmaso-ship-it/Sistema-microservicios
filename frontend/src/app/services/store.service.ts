import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiMessage, DesiredProduct, Product, Purchase } from './models';

const API = 'http://localhost:3000';
@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly http = inject(HttpClient);
  products() { return this.http.get<Product[]>(`${API}/api/products`); }
  wishlist() { return this.http.get<ApiMessage<never>>(`${API}/api/products-wanted`); }
  addToWishlist(productoId: number, cantidad: number) { return this.http.post(`${API}/api/products-wanted`, { productoId, cantidad }); }
  removeFromWishlist(id: number) { return this.http.delete(`${API}/api/products-wanted/${id}`); }
  buy(productId: number, quantity: number) { return this.http.post<Purchase>(`${API}/api/v1/purchases`, { productoId: productId, cantidad: quantity }); }
  purchases() { return this.http.get<Purchase[]>(`${API}/api/v1/purchases`); }
}
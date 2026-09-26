import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AuthService } from './services/auth.service';
import { Product } from './services/models';
import { StoreService } from './services/store.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: () => false, isAdmin: () => false, logout: () => undefined } },
        { provide: StoreService, useValue: {} }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('reenables purchase after an admin logs out and a regular user signs in', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const app = fixture.componentInstance;
    app.isAdmin = true;
    app.showAdminForm = true;
    app.logout();
    expect(app.showAdminForm).toBe(false);

    app.loggedIn = true;
    app.isAdmin = false;
    app.products = [{ id: 1, nombre: 'Producto', precio: 100, stock: 1, activo: true } as Product];
    fixture.detectChanges();

    const buyButton = fixture.nativeElement.querySelector('.buy-button') as HTMLButtonElement;
    expect(buyButton.disabled).toBe(false);
  });
});

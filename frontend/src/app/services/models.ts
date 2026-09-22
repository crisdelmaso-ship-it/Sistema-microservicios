export interface Product { id: number; nombre: string; descripcion?: string; precio: number; stock: number; categoria?: string; imagenUrl?: string; activo: boolean; }
export interface DesiredProduct { id: number; productoId: number; cantidad: number; disponible: boolean; producto?: Product; }
export interface Purchase { identificador: number; productoId: number; cantidad: number; total: number; fechaCreacion: string; }
export interface ApiMessage<T> { message?: string; mensaje?: string; data?: T; productos?: DesiredProduct[]; }
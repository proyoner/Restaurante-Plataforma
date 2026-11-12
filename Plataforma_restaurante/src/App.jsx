import React, { useState, useMemo } from 'react';
import { 
  UtensilsCrossed, 
  ChefHat, 
  Wallet, 
  BarChart3, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Coffee,
  Pizza,
  CupSoda
} from 'lucide-react';

// --- DATOS SIMULADOS (Catálogos) ---
const MENU_ITEMS = [
  { id: 1, name: 'Tacos de Asada', price: 120, category: 'Comida', icon: Pizza },
  { id: 2, name: 'Hamburguesa Clásica', price: 150, category: 'Comida', icon: Pizza },
  { id: 3, name: 'Pizza Pepperoni', price: 200, category: 'Comida', icon: Pizza },
  { id: 4, name: 'Refresco Cola', price: 35, category: 'Bebida', icon: CupSoda },
  { id: 5, name: 'Agua Fresca', price: 40, category: 'Bebida', icon: CupSoda },
  { id: 6, name: 'Café Americano', price: 45, category: 'Bebida', icon: Coffee },
  { id: 7, name: 'Pastel de Chocolate', price: 70, category: 'Postre', icon: Coffee },
  { id: 8, name: 'Flan Napolitano', price: 60, category: 'Postre', icon: Coffee },
];

const TABLES = [1, 2, 3, 4, 5, 6, 7, 8];

export default function App() {
  // --- ESTADO GLOBAL ---
  const [activeView, setActiveView] = useState('mesero');
  const [orders, setOrders] = useState([]);
  
  // Estado local para la vista del mesero
  const [currentTable, setCurrentTable] = useState('');
  const [cart, setCart] = useState([]);

  // --- LÓGICA DE NEGOCIO ---

  // Obtener mesas que ya tienen un pedido activo (no pagado)
  const occupiedTables = useMemo(() => {
    return orders.filter(o => o.status !== 'pagado').map(o => o.table);
  }, [orders]);

  // Manejar el carrito del mesero
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Enviar pedido desde el mesero a la cocina
  const submitOrder = () => {
    if (!currentTable || cart.length === 0) return;
    
    const newOrder = {
      id: Date.now().toString().slice(-6), // ID simple de 6 dígitos
      table: currentTable,
      items: [...cart],
      total: cartTotal,
      status: 'recibido', // Estados: recibido -> preparacion -> listo -> pagado
      timestamp: new Date()
    };

    setOrders([...orders, newOrder]);
    setCart([]);
    setCurrentTable('');
  };

  // Actualizar el estado de un pedido (Cocina y Cajero)
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };


  // --- VISTAS (Componentes internos para mantener un solo archivo) ---

  const renderMesero = () => (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {/* Catálogo de Menú */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full overflow-hidden">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <UtensilsCrossed className="text-blue-500" /> Nuevo Pedido
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4">
          {MENU_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button 
                key={item.id}
                onClick={() => addToCart(item)}
                className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-400 hover:bg-blue-50 transition-all text-center group active:scale-95"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Icon size={24} />
                </div>
                <span className="font-semibold text-slate-700 text-sm leading-tight">{item.name}</span>
                <span className="text-blue-600 font-bold mt-1">${item.price}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Ticket actual */}
      <div className="w-full md:w-96 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Resumen de Cuenta</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-600 mb-2">Mesa Asignada:</label>
          <div className="grid grid-cols-4 gap-2">
            {TABLES.map(t => {
              const isOccupied = occupiedTables.includes(t);
              const isSelected = currentTable === t;
              return (
                <button
                  key={t}
                  disabled={isOccupied && !isSelected}
                  onClick={() => setCurrentTable(t)}
                  className={`py-2 rounded-lg font-bold transition-colors ${
                    isSelected ? 'bg-blue-600 text-white' : 
                    isOccupied ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' : 
                    'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 border-t border-b border-slate-100 py-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <UtensilsCrossed size={48} className="mb-2 opacity-20" />
              <p>Agrega productos al pedido</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                    <p className="text-slate-500 text-xs">${item.price} c/u</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                    <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded text-slate-600"><Minus size={14} /></button>
                    <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded text-slate-600"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="ml-3 text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2">
          <div className="flex justify-between text-lg font-bold text-slate-800 mb-4">
            <span>Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <button 
            onClick={submitOrder}
            disabled={!currentTable || cart.length === 0}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            Enviar a Cocina <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderCocina = () => {
    const pendingOrders = orders.filter(o => o.status === 'recibido' || o.status === 'preparacion');

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-full">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ChefHat className="text-orange-500" /> Tablero de Cocina
        </h2>
        
        {pendingOrders.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <CheckCircle2 size={64} className="mx-auto mb-4 text-emerald-400 opacity-50" />
            <p className="text-lg">No hay pedidos pendientes. ¡Buen trabajo!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingOrders.map(order => (
              <div key={order.id} className={`rounded-xl border-2 p-5 ${order.status === 'recibido' ? 'border-red-100 bg-red-50' : 'border-orange-100 bg-orange-50'}`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-slate-800 text-white px-3 py-1 rounded-lg font-bold text-sm">Mesa {order.table}</span>
                  <span className="text-slate-500 text-sm flex items-center gap-1"><Clock size={14} /> {order.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-slate-700 font-medium">
                      <span><span className="font-bold text-slate-900">{item.qty}x</span> {item.name}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  {order.status === 'recibido' ? (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'preparacion')}
                      className="w-full py-2.5 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors"
                    >
                      Iniciar Preparación
                    </button>
                  ) : (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'listo')}
                      className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors"
                    >
                      Marcar como Listo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCajero = () => {
    const readyOrders = orders.filter(o => o.status === 'listo');

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-full">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Wallet className="text-emerald-500" /> Cuentas por Cobrar
        </h2>
        
        {readyOrders.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg">No hay cuentas pendientes de cobro en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readyOrders.map(order => (
              <div key={order.id} className="rounded-xl border border-slate-200 p-5 shadow-sm bg-white">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-bold">Mesa {order.table}</span>
                  <span className="text-slate-500 text-sm">Folio: #{order.id}</span>
                </div>
                
                <div className="space-y-1 mb-4 text-sm text-slate-600">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.qty}x {item.name}</span>
                      <span>${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-100">
                  <span className="font-bold text-slate-500">Total a pagar:</span>
                  <span className="text-2xl font-bold text-slate-800">${order.total.toFixed(2)}</span>
                </div>

                <button 
                  onClick={() => updateOrderStatus(order.id, 'pagado')}
                  className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                >
                  Registrar Pago <CheckCircle2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAdmin = () => {
    const completedOrders = orders.filter(o => o.status === 'pagado');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const activeOrdersCount = orders.filter(o => o.status !== 'pagado').length;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-full">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BarChart3 className="text-purple-500" /> Panel Administrativo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
            <p className="text-purple-600 font-semibold mb-1">Ingresos del Día</p>
            <p className="text-4xl font-bold text-purple-900">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <p className="text-blue-600 font-semibold mb-1">Pedidos Atendidos</p>
            <p className="text-4xl font-bold text-blue-900">{completedOrders.length}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
            <p className="text-orange-600 font-semibold mb-1">Mesas Ocupadas (Activas)</p>
            <p className="text-4xl font-bold text-orange-900">{activeOrdersCount}</p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Historial de Ventas Recientes</h3>
        {completedOrders.length === 0 ? (
          <p className="text-slate-500 text-sm">Aún no hay ventas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-800 font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Folio</th>
                  <th className="px-4 py-3">Mesa</th>
                  <th className="px-4 py-3">Artículos</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3 rounded-tr-lg">Estado</th>
                </tr>
              </thead>
              <tbody>
                {completedOrders.slice().reverse().map(order => (
                  <tr key={order.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">#{order.id}</td>
                    <td className="px-4 py-3">Mesa {order.table}</td>
                    <td className="px-4 py-3">{order.items.reduce((s, i) => s + i.qty, 0)} items</td>
                    <td className="px-4 py-3 font-bold text-slate-800">${order.total.toFixed(2)}</td>
                    <td className="px-4 py-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">Pagado</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Barra de Navegación Lateral */}
      <nav className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col md:h-screen shrink-0 sticky top-0">
        <div className="p-6 pb-2">
          <h1 className="text-xl font-black text-white flex items-center gap-2 mb-1">
            <UtensilsCrossed size={24} className="text-blue-400" />
            RestoWeb Pro
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Prototipo Funcional</p>
        </div>
        
        <div className="flex-1 px-4 py-6 space-y-2 overflow-x-auto flex md:flex-col">
          {[
            { id: 'mesero', label: 'Vista Mesero', icon: UtensilsCrossed, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { id: 'cocina', label: 'Vista Cocina', icon: ChefHat, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { id: 'cajero', label: 'Vista Cajero', icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { id: 'admin', label: 'Administrador', icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map(tab => {
            const isActive = activeView === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 md:w-full rounded-xl transition-all whitespace-nowrap md:whitespace-normal font-medium ${
                  isActive ? `bg-slate-800 text-white ${tab.color} border-l-4 border-current` : 'hover:bg-slate-800/50 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? tab.bg : ''}`}>
                  <Icon size={20} className={isActive ? tab.color : 'text-slate-400'} />
                </div>
                {tab.label}
              </button>
            )
          })}
        </div>
        
        <div className="hidden md:block p-6 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
              UR
            </div>
            <div>
              <p className="text-sm font-bold text-white">Usuario Raíz</p>
              <p className="text-xs text-slate-500">Sesión Activa</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto h-full">
          {activeView === 'mesero' && renderMesero()}
          {activeView === 'cocina' && renderCocina()}
          {activeView === 'cajero' && renderCajero()}
          {activeView === 'admin' && renderAdmin()}
        </div>
      </main>

    </div>
  );
}

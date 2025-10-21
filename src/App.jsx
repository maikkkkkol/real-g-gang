import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Zap, CreditCard, ArrowLeft, Trash2, CheckCircle, Info, XCircle } from 'lucide-react';

// --- CONFIGURACIÓN DE PAGO POR TRANSFERENCIA BANCARIA ---
const PAYMENT_INFO = {
  nombre: "Michel Amir Antonio Isuani Sandoval",
  rut: "21.899.952-2",
  cuenta: "00000094192714", // Se simula el formato para que sea más fácil de copiar
  banco: "Banco Santander",
  tipoCuenta: "Cuenta Corriente",
  email: "michelvacuna@gmail.com"
};

// --- DATOS SIMULADOS DE 100 CARTAS POKÉMON ---
// Se usan URLs reales de alta calidad para las primeras cartas y placeholders para el resto
const generateMockProducts = () => {
  const products = [
    { id: 1, name: "Charizard VMAX (Shiny)", price: 95.00, imageUrl: "https://images.pokemontcg.io/swsh4_sv/SV107_hires.png", rarity: "Secret Rare" },
    { id: 2, name: "Pikachu (Base Set, 1st Ed)", price: 60.50, imageUrl: "https://images.pokemontcg.io/base1/58_hires.png", rarity: "Common" },
    { id: 3, name: "Blastoise V", price: 32.75, imageUrl: "https://images.pokemontcg.io/swsh3/31_hires.png", rarity: "Rare Holo" },
    { id: 4, name: "Mewtwo GX (Rainbow)", price: 88.99, imageUrl: "https://images.pokemontcg.io/sm3/78_hires.png", rarity: "Secret Rare" },
    { id: 5, name: "Umbreon VMAX (Alternate Art)", price: 150.00, imageUrl: "https://images.pokemontcg.io/swsh7/215_hires.png", rarity: "Alternate Art" },
  ];
  
  // Rellenar hasta 100 productos con placeholders para simular un catálogo grande
  for (let i = products.length + 1; i <= 100; i++) {
    products.push({
      id: i,
      name: `Carta Genérica #${i}`,
      price: (1 + Math.floor(Math.random() * 200)) / 10, // Precio entre 0.10 y 20.00
      imageUrl: `https://placehold.co/100x140/805AD5/fff?text=Card+${i}`,
      rarity: ["Common", "Uncommon", "Rare"][Math.floor(Math.random() * 3)],
    });
  }
  return products;
};

const ALL_PRODUCTS = generateMockProducts();

// Función utilitaria para formatear el precio
const formatCurrency = (amount) => {
  return `$${amount.toFixed(2)}`;
};

// Función para generar un ID de pedido simple y aleatorio (simulación)
const generateOrderId = () => {
    return 'ORD-' + Math.floor(100000 + Math.random() * 900000);
};

// ----------------------------------------------------------------------
// 1. Componente: Lista de Productos (La Tienda)
// ----------------------------------------------------------------------
const ProductList = ({ onAddToCart }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {ALL_PRODUCTS.map(pokemon => (
      <div 
        key={pokemon.id} 
        className="bg-white p-2 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 flex flex-col items-center border border-indigo-100 transform hover:scale-[1.03] cursor-pointer"
      >
        <img 
          src={pokemon.imageUrl} 
          alt={pokemon.name} 
          className="w-full h-auto mb-2 rounded-lg object-contain max-h-40 border border-gray-200" 
          onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/100x140/E0F2FE/1E40AF?text=${pokemon.id}`}}
        />
        <h3 className="text-sm font-semibold text-gray-800 text-center truncate w-full px-1">{pokemon.name}</h3>
        <p className={`text-xs font-medium mb-2 ${pokemon.rarity === 'Secret Rare' ? 'text-yellow-600' : 'text-gray-500'}`}>{pokemon.rarity}</p>
        <p className="text-lg font-extrabold text-green-600 mb-2">
          {formatCurrency(pokemon.price)}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onAddToCart(pokemon); }}
          className="w-full text-xs flex items-center justify-center space-x-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-1.5 px-2 rounded-lg shadow-md transition duration-200 active:scale-95"
        >
          <ShoppingCart className="w-4 h-4"/>
          <span>Añadir</span>
        </button>
      </div>
    ))}
  </div>
);

// ----------------------------------------------------------------------
// 2. Componente: Carrito de Compras
// ----------------------------------------------------------------------
const CartView = ({ cart, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const taxRate = 0.10; // Impuesto simulado (10%)
  const taxes = subtotal * taxRate;
  const total = subtotal + taxes;

  if (cart.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-xl shadow-inner">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
        <p className="text-xl text-gray-500">Tu carrito está vacío. ¡Añade cartas para coleccionar!</p>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0">
      
      {/* Columna 1: Items del Carrito */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 lg:col-span-2">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Items del Pedido</h3>
        <div className="max-h-96 overflow-y-auto pr-2">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
              <div className="flex items-center space-x-4">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-12 h-16 rounded-md object-cover border border-gray-200" 
                  onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/40x40/E0F2FE/1E40AF?text=P`}}
                />
                <div>
                  <p className="font-semibold text-gray-800 truncate w-32 sm:w-auto">{item.name}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(item.price)} c/u</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Controles de cantidad */}
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                  className="w-16 p-2 border rounded-lg text-center focus:ring-indigo-500 focus:border-indigo-500"
                />
                
                {/* Precio total por item */}
                <p className="font-bold text-gray-900 w-20 text-right hidden sm:block">
                  {formatCurrency(item.price * item.quantity)}
                </p>

                {/* Botón para eliminar */}
                <button onClick={() => onRemoveItem(item.id)} className="text-red-500 hover:text-red-700 transition duration-200 p-1 rounded-full hover:bg-red-50">
                  <Trash2 className="w-5 h-5"/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Columna 2: Resumen de Totales y Botón de Pago */}
      <div className="space-y-6 lg:col-span-1">
        <div className="bg-indigo-50 p-6 rounded-xl shadow-lg space-y-3">
          <h3 className="text-xl font-bold text-indigo-700">Resumen del Pedido</h3>
          <div className="flex justify-between text-lg text-gray-700">
            <span>Subtotal:</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-lg text-gray-700 border-b pb-3">
            <span>Impuesto (10%):</span>
            <span className="font-semibold">{formatCurrency(taxes)}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-indigo-800 pt-3">
            <span>Total Final:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Botón de Pago */}
        <button
          onClick={() => onCheckout(total)}
          className="w-full flex items-center justify-center space-x-2 py-4 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-xl shadow-lg transition duration-200 transform hover:scale-[1.01] active:scale-95"
        >
          <CreditCard className="w-6 h-6"/>
          <span>Pagar con Transferencia</span>
        </button>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. Componente: Pantalla de Pago (Transferencia Bancaria)
// ----------------------------------------------------------------------
const CheckoutView = ({ total, onGoBackToShop }) => {
  const [orderId, setOrderId] = useState(null);
  const [hasPaid, setHasPaid] = useState(false);

  // Genera el ID del pedido solo una vez al cargar la vista de checkout
  useEffect(() => {
    if (!orderId) {
        setOrderId(generateOrderId());
    }
  }, [orderId]);
  
  // Función para copiar al portapapeles (adaptado para iFrames)
  const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert('Copiado al portapapeles: ' + text); // Usamos un simple alert para simular feedback
  };


  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-xl mx-auto space-y-6 text-center">
      <h2 className="text-3xl font-bold text-indigo-700">Finalizar Compra y Pago</h2>
      
      {/* Mensaje de Pedido */}
      <div className="bg-indigo-100 p-4 rounded-lg border-l-4 border-indigo-500 text-indigo-800">
        <p className="text-lg font-semibold flex items-center justify-center">
            <Info className="w-5 h-5 mr-2"/>
            Tu Número de Pedido es: <span className="ml-2 font-extrabold text-2xl text-indigo-900">{orderId}</span>
        </p>
        <p className="text-sm mt-1">
            **Recuerda incluir este número en el asunto de tu comprobante de transferencia.**
        </p>
      </div>

      <p className="text-xl text-gray-700">Total a Transferir: <span className="text-4xl font-extrabold text-green-600">{formatCurrency(total)}</span></p>

      {/* Instrucciones y Datos Bancarios */}
      <div className="p-6 bg-gray-500 rounded-lg border space-y-4 text-left">
        <h3 className="text-2xl font-semibold mb-3 text-gray-800 border-b pb-2">Datos para la Transferencia</h3>
        
        {/* Contenedor de Datos */}
        <div className="space-y-3">
            {Object.entries(PAYMENT_INFO).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-600 capitalize">
                        {key === 'rut' ? 'RUT' : key === 'email' ? 'Email' : key === 'cuenta' ? 'Nro. de Cuenta' : key === 'tipoCuenta' ? 'Tipo de Cuenta' : key}:
                    </span>
                    <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900 text-right">{value}</span>
                        <button 
                            onClick={() => copyToClipboard(value)}
                            className="text-indigo-500 hover:text-indigo-700 text-xs font-semibold py-1 px-2 rounded-md border border-indigo-300 hover:bg-indigo-50 transition duration-150"
                        >
                            Copiar
                        </button>
                    </div>
                </div>
            ))}
        </div>
        
        <p className="mt-4 text-sm text-red-700 font-semibold">
            IMPORTANTE: La transferencia debe ser al RUT y Cuenta Corriente indicados.
        </p>
      </div>

      {/* Botón de Confirmación de Pago */}
      <button
        onClick={() => setHasPaid(true)}
        disabled={hasPaid}
        className="w-full flex items-center justify-center space-x-2 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-xl font-bold rounded-xl shadow-lg transition duration-200 disabled:opacity-50"
      >
        <CheckCircle className="w-5 h-5"/>
        <span>{hasPaid ? 'Comprobante Enviado' : 'Ya Realicé la Transferencia'}</span>
      </button>

      {/* Mensaje Post-Pago */}
      {hasPaid && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mt-4" role="alert">
          <p className="font-bold text-lg">¡Proceso Completado!</p>
          <p>
            Hemos registrado tu confirmación. Revisa tu email **michelvacuna@gmail.com** con el comprobante de pago junto con el número de pedido **{orderId}** para finalizar la compra. 
            Una vez validada la transferencia, recibirás una confirmación final.
          </p>
        </div>
      )}


      <button
        onClick={onGoBackToShop}
        className="mt-4 flex items-center justify-center space-x-2 text-indigo-500 hover:text-indigo-700 transition duration-200"
      >
        <ArrowLeft className="w-4 h-4"/>
        <span>Volver a la tienda</span>
      </button>
    </div>
  );
};

// ----------------------------------------------------------------------
// 4. Componente Raíz: App
// ----------------------------------------------------------------------
const App = () => {
  // Estado para el carrito: [{ id, name, price, quantity, ... }]
  const [cart, setCart] = useState([]);
  // Estado para la vista: 'shop', 'cart', 'checkout'
  const [currentView, setCurrentView] = useState('shop');
  const [checkoutTotal, setCheckoutTotal] = useState(0);

  // Calcula el número total de items únicos en el carrito
  const cartItemCount = cart.length;

  // 1. Añadir Pokémon al Carrito
  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Si ya existe, incrementa la cantidad
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Si es nuevo, añádelo con cantidad 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // 2. Actualizar Cantidad en el Carrito
  const handleUpdateQuantity = (id, quantity) => {
    setCart(prevCart => {
      // Usamos Math.max para asegurar que la cantidad nunca baje de 1
      const newQuantity = Math.max(1, parseInt(quantity) || 1); 
      return prevCart.map(item =>
        item.id === id
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  // 3. Eliminar Item del Carrito
  const handleRemoveItem = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  // 4. Proceder al Pago
  const handleCheckout = (total) => {
    if (cart.length === 0) {
        // En lugar de alert, usamos una forma visual de notificar
        alert("El carrito está vacío. ¡Por favor, añade cartas!");
        return;
    }
    setCheckoutTotal(total);
    setCurrentView('checkout');
  };
  
  // 5. Función para cambiar la vista y limpiar el carrito después de una confirmación de pago (simulado)
  const handleGoBackToShop = () => {
    // Si volvemos de checkout, asumimos que el usuario ha terminado con ese pedido.
    // Podríamos limpiar el carrito o mantenerlo, lo mantendremos para que el usuario 
    // pueda seguir comprando, pero lo limpiamos si se confirmó la transferencia.
    setCurrentView('shop');
  };

  // 6. Función para renderizar el contenido según la vista actual
  const renderContent = () => {
    switch (currentView) {
      case 'shop':
        return <ProductList onAddToCart={handleAddToCart} />;
      case 'cart':
        return (
          <CartView 
            cart={cart} 
            onUpdateQuantity={handleUpdateQuantity} 
            onRemoveItem={handleRemoveItem} 
            onCheckout={handleCheckout} 
          />
        );
      case 'checkout':
        return <CheckoutView total={checkoutTotal} onGoBackToShop={handleGoBackToShop} />;
      default:
        return <ProductList onAddToCart={handleAddToCart} />;
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 p-4 md:p-8 font-sans">
      
      {/* Encabezado Fijo y Barra de Navegación */}
      <header className="fixed top-0 left-0 right-0 bg-indigo-700 text-white shadow-2xl z-20">
        <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:text-yellow-300 transition duration-150"
            onClick={() => setCurrentView('shop')}
          >
            {/* Logo */}
            <img src="https://i.imgur.com/K502X5E.png" alt="OniStore TCG Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-black">
              OniStore TCG
            </h1>
          </div>
          
          <div className="flex space-x-4">
            {/* Botón de Tienda */}
            <button
              onClick={() => setCurrentView('shop')}
              className={`p-2 rounded-full transition duration-150 ${currentView === 'shop' ? 'bg-indigo-800 text-yellow-300' : 'hover:bg-indigo-600'}`}
              title="Tienda"
            >
              <Zap className="w-6 h-6"/>
            </button>

            {/* Botón de Carrito */}
            <button
              onClick={() => setCurrentView('cart')}
              className={`relative p-2 rounded-full transition duration-150 ${currentView === 'cart' ? 'bg-indigo-800 text-yellow-300' : 'hover:bg-indigo-600'}`}
              title="Ver Carrito"
            >
              <ShoppingCart className="w-6 h-6"/>
              {/* Contador de items únicos en el carrito */}
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-indigo-700 animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-4xl mx-auto pt-24 pb-10">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
            {currentView === 'shop' && "Colección de Cartas Pokémon (100+)"}
            {currentView === 'cart' && "Carrito de Compras"}
            {currentView === 'checkout' && "Transferencia Bancaria"}
        </h2>
        
        {renderContent()}

      </main>
    </div>
  );
};

export default App;

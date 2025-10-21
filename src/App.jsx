<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OniStore TCG - Tienda de Cartas</title>
    <!-- Carga de Tailwind CSS para el estilo -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Carga de Iconos (Lucide Icons) -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        /* Configuración personalizada de Tailwind */
        :root { font-family: 'Inter', sans-serif; }
        .grid-cards {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        }
        @media (min-width: 640px) {
            .grid-cards {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            }
        }
        /* Estilos para el scroll del carrito */
        #cart-items-container {
            max-height: 400px;
            overflow-y: auto;
        }
    </style>
</head>
<body class="min-h-screen bg-indigo-50">

    <!-- Encabezado Fijo y Barra de Navegación -->
    <header class="fixed top-0 left-0 right-0 bg-indigo-700 text-white shadow-2xl z-20">
        <div class="max-w-4xl mx-auto p-4 flex justify-between items-center">
            <div id="logo-button" class="flex items-center space-x-2 cursor-pointer hover:text-yellow-300 transition duration-150">
                <!-- Logo -->
                <img 
                    src="https://i.imgur.com/K502X5E.png" 
                    alt="OniStore TCG Logo" 
                    class="h-10 w-auto object-contain" 
                    onerror="this.onerror=null;this.src='https://placehold.co/40x40/FF4500/fff?text=Oni'"
                />
                <h1 class="text-2xl font-black">OniStore TCG</h1>
            </div>
            
            <div class="flex space-x-4">
                <!-- Botón de Carrito -->
                <button id="cart-button" class="relative p-2 rounded-full transition duration-150 hover:bg-indigo-600" title="Ver Carrito">
                    <i data-lucide="shopping-cart" class="w-6 h-6"></i>
                    <span id="cart-count" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-indigo-700 hidden animate-bounce">0</span>
                </button>
            </div>
        </div>
    </header>

    <!-- Contenido Principal -->
    <main class="max-w-4xl mx-auto pt-24 pb-10 p-4 md:p-8">
        <h2 id="main-title" class="text-4xl font-extrabold text-gray-800 mb-8 text-center">Colección de Cartas Pokémon (100+)</h2>
        
        <!-- Contenedor donde se cargará la vista ('shop', 'cart', 'checkout') -->
        <div id="content-container">
            <!-- La tienda se cargará aquí -->
        </div>

    </main>

    <script>
        // --- CONFIGURACIÓN DE PAGO POR TRANSFERENCIA BANCARIA ---
        const PAYMENT_INFO = {
            nombre: "Michel Amir Antonio Isuani Sandoval",
            rut: "21.899.952-2",
            cuenta: "00000094192714",
            banco: "Banco Santander",
            tipoCuenta: "Cuenta Corriente",
            email: "michelvacuna@gmail.com"
        };
        
        // --- DATOS SIMULADOS DE 100 CARTAS POKÉMON ---
        const ALL_PRODUCTS = (function() {
            const products = [
                { id: 1, name: "Carta Pikachu", price: 3000, imageUrl: "https://images.pokemontcg.io/base1/58_hires.png", rarity: "Common" },
                { id: 2, name: "Carta Charizard", price: 10000, imageUrl: "https://images.pokemontcg.io/base1/4_hires.png", rarity: "Rare Holo" },
                { id: 3, name: "Carta Eevee", price: 2500, imageUrl: "https://images.pokemontcg.io/xy11/108_hires.png", rarity: "Uncommon" },
                { id: 4, name: "Charizard VMAX (Shiny)", price: 95000, imageUrl: "https://images.pokemontcg.io/swsh4_sv/SV107_hires.png", rarity: "Secret Rare" },
                { id: 5, name: "Umbreon VMAX (Alternate Art)", price: 150000, imageUrl: "https://images.pokemontcg.io/swsh7/215_hires.png", rarity: "Alternate Art" },
            ];
            
            for (let i = products.length + 1; i <= 100; i++) {
                products.push({
                    id: i,
                    name: `Carta Genérica #${i}`,
                    price: Math.floor(1000 + Math.random() * 50000),
                    imageUrl: `https://placehold.co/150x210/805AD5/fff?text=Card+${i}`,
                    rarity: ["Common", "Uncommon", "Rare"][Math.floor(Math.random() * 3)],
                });
            }
            return products;
        })();

        // --- ESTADO GLOBAL (SIMULACIÓN DE REACT) ---
        let cart = [];
        let currentView = 'shop'; // 'shop', 'cart', 'checkout'
        let checkoutTotal = 0;
        let orderId = null;

        const contentContainer = document.getElementById('content-container');
        const cartCountElement = document.getElementById('cart-count');
        const mainTitleElement = document.getElementById('main-title');

        // Función utilitaria para formatear el precio
        const formatCurrency = (amount) => {
            return `$${new Intl.NumberFormat('es-CL').format(amount)}`;
        };

        // Función para generar un ID de pedido simple
        const generateOrderId = () => 'ORD-' + Math.floor(100000 + Math.random() * 900000);

        // Función para copiar al portapapeles (necesario en el entorno iFrame)
        const copyToClipboard = (text) => {
            const el = document.createElement('textarea');
            el.value = text;
            el.setAttribute('readonly', '');
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            document.body.appendChild(el);
            el.select();
            try {
                document.execCommand('copy');
                alert(`¡Copiado! ${text}`);
            } catch (err) {
                console.error('No se pudo copiar: ', err);
            }
            document.body.removeChild(el);
        };
        
        // --- LÓGICA DEL CARRITO ---

        // Actualiza el contador del carrito en el header
        const updateCartCount = () => {
            if (cart.length > 0) {
                cartCountElement.textContent = cart.length;
                cartCountElement.classList.remove('hidden');
            } else {
                cartCountElement.classList.add('hidden');
            }
        };

        const handleAddToCart = (productId) => {
            const product = ALL_PRODUCTS.find(p => p.id === productId);
            if (!product) return;

            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                // Incrementa la cantidad
                cart = cart.map(item =>
                    item.id === productId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // Añade el nuevo item
                cart.push({ ...product, quantity: 1 });
            }
            
            updateCartCount();
        };

        const handleUpdateQuantity = (productId, newQuantity) => {
            const quantity = Math.max(1, parseInt(newQuantity) || 1);
            cart = cart.map(item =>
                item.id === productId
                    ? { ...item, quantity: quantity }
                    : item
            );
            // Si estamos en la vista del carrito, volvemos a renderizar para actualizar totales
            if (currentView === 'cart') renderCartView();
        };

        const handleRemoveItem = (productId) => {
            cart = cart.filter(item => item.id !== productId);
            updateCartCount();
            if (currentView === 'cart') renderCartView();
        };

        // --- RENDERIZADO DE VISTAS ---

        const renderShopView = () => {
            mainTitleElement.textContent = "Colección de Cartas Pokémon (100+)";
            contentContainer.innerHTML = `
                <div id="product-list" class="grid grid-cards gap-4">
                    ${ALL_PRODUCTS.map(pokemon => `
                        <div 
                            class="bg-white p-2 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 flex flex-col items-center border border-indigo-100 transform hover:scale-[1.03]"
                        >
                            <img 
                                src="${pokemon.imageUrl}" 
                                alt="${pokemon.name}" 
                                class="w-full h-auto mb-2 rounded-lg object-contain max-h-40 border border-gray-200" 
                                onerror="this.onerror=null;this.src='https://placehold.co/150x210/E0F2FE/1E40AF?text=Card+${pokemon.id}'"
                            />
                            <h3 class="text-sm font-semibold text-gray-800 text-center truncate w-full px-1">${pokemon.name}</h3>
                            <p class="text-xs font-medium mb-2 ${pokemon.rarity.includes('Rare') ? 'text-yellow-600' : 'text-gray-500'}">${pokemon.rarity}</p>
                            <p class="text-lg font-extrabold text-green-600 mb-2">
                                ${formatCurrency(pokemon.price)}
                            </p>
                            <button
                                data-product-id="${pokemon.id}"
                                class="add-to-cart-btn w-full text-xs flex items-center justify-center space-x-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-1.5 px-2 rounded-lg shadow-md transition duration-200 active:scale-95"
                            >
                                <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                                <span>Agregar</span>
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;

            // Agregar listeners después de renderizar
            contentContainer.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.dataset.productId);
                    handleAddToCart(id);
                    // Opcional: Mostrar un mensaje de éxito
                });
            });
            
            // Recargar iconos de Lucide
            lucide.createIcons();
            currentView = 'shop';
        };


        const renderCartView = () => {
            mainTitleElement.textContent = "Carrito de Compras";

            if (cart.length === 0) {
                contentContainer.innerHTML = `
                    <div class="text-center p-10 bg-white rounded-xl shadow-inner">
                        <i data-lucide="shopping-cart" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
                        <p class="text-xl text-gray-500">Tu carrito está vacío. ¡Añade cartas para coleccionar!</p>
                        <button id="back-to-shop-empty" class="mt-4 text-indigo-500 hover:text-indigo-700 font-semibold">
                            Volver a la tienda
                        </button>
                    </div>
                `;
                document.getElementById('back-to-shop-empty').addEventListener('click', () => renderView('shop'));
                lucide.createIcons();
                currentView = 'cart';
                return;
            }

            const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
            const shipping = subtotal > 50000 ? 0 : 5000;
            checkoutTotal = subtotal + shipping; // Actualiza el total global

            contentContainer.innerHTML = `
                <div class="lg:grid lg:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0">
                    
                    <!-- Columna 1: Items del Carrito -->
                    <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100 lg:col-span-2">
                        <h3 class="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Items del Pedido</h3>
                        <div id="cart-items-container" class="pr-2">
                            ${cart.map(item => `
                                <div class="flex justify-between items-center py-3 border-b last:border-b-0">
                                    <div class="flex items-center space-x-4">
                                        <img 
                                            src="${item.imageUrl}" 
                                            alt="${item.name}" 
                                            class="w-12 h-16 rounded-md object-cover border border-gray-200" 
                                            onerror="this.onerror=null;this.src='https://placehold.co/40x40/E0F2FE/1E40AF?text=P'"
                                        />
                                        <div>
                                            <p class="font-semibold text-gray-800 truncate w-32 sm:w-auto">${item.name}</p>
                                            <p class="text-sm text-gray-500">${formatCurrency(item.price)} c/u</p>
                                        </div>
                                    </div>

                                    <div class="flex items-center space-x-3">
                                        <!-- Controles de cantidad -->
                                        <input
                                            type="number"
                                            min="1"
                                            value="${item.quantity}"
                                            data-item-id="${item.id}"
                                            class="quantity-input w-16 p-2 border rounded-lg text-center focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        
                                        <!-- Precio total por item -->
                                        <p class="font-bold text-gray-900 w-20 text-right hidden sm:block">
                                            ${formatCurrency(item.price * item.quantity)}
                                        </p>

                                        <!-- Botón para eliminar -->
                                        <button data-item-id="${item.id}" class="remove-item-btn text-red-500 hover:text-red-700 transition duration-200 p-1 rounded-full hover:bg-red-50">
                                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Columna 2: Resumen de Totales y Botón de Pago -->
                    <div class="space-y-6 lg:col-span-1">
                        <div class="bg-indigo-50 p-6 rounded-xl shadow-lg space-y-3">
                            <h3 class="text-xl font-bold text-indigo-700">Resumen del Pedido</h3>
                            <div class="flex justify-between text-lg text-gray-700">
                                <span>Subtotal:</span>
                                <span class="font-semibold">${formatCurrency(subtotal)}</span>
                            </div>
                            <div class="flex justify-between text-lg text-gray-700 border-b pb-3">
                                <span>Envío:</span>
                                <span class="font-semibold ${shipping === 0 ? 'text-green-500 font-bold' : ''}">
                                    ${shipping === 0 ? '¡GRATIS!' : formatCurrency(shipping)}
                                </span>
                            </div>
                            <div class="flex justify-between text-2xl font-bold text-indigo-800 pt-3">
                                <span>Total Final:</span>
                                <span>${formatCurrency(checkoutTotal)}</span>
                            </div>
                        </div>

                        <!-- Botón de Pago (Transferencia Bancaria) -->
                        <button
                            id="checkout-btn"
                            class="w-full flex items-center justify-center space-x-2 py-4 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-xl shadow-lg transition duration-200 transform hover:scale-[1.01] active:scale-95"
                        >
                            <i data-lucide="credit-card" class="w-6 h-6"></i>
                            <span>Proceder al Pago</span>
                        </button>
                    </div>
                </div>
            `;

            // Agregar listeners
            contentContainer.querySelectorAll('.quantity-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const id = parseInt(e.target.dataset.itemId);
                    handleUpdateQuantity(id, e.target.value);
                });
            });

            contentContainer.querySelectorAll('.remove-item-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.dataset.itemId);
                    handleRemoveItem(id);
                });
            });

            document.getElementById('checkout-btn').addEventListener('click', () => renderView('checkout'));

            lucide.createIcons();
            currentView = 'cart';
        };

        const renderCheckoutView = () => {
            // Generar ID del pedido solo si es la primera vez en esta compra
            if (!orderId) {
                orderId = generateOrderId();
            }

            mainTitleElement.textContent = "Pago por Transferencia Bancaria";
            
            contentContainer.innerHTML = `
                <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-xl mx-auto space-y-6 text-center">
                    <h2 class="text-3xl font-bold text-indigo-700">Finalizar Compra - Transferencia</h2>
                    
                    <!-- Mensaje de Pedido -->
                    <div class="bg-indigo-100 p-4 rounded-lg border-l-4 border-indigo-500 text-indigo-800">
                        <p class="text-lg font-semibold flex items-center justify-center">
                            <i data-lucide="info" class="w-5 h-5 mr-2"></i>
                            Tu Número de Pedido es: <span class="ml-2 font-extrabold text-2xl text-indigo-900">${orderId}</span>
                        </p>
                        <p class="text-sm mt-1">
                            **Recuerda incluir este número en el asunto de tu comprobante de transferencia.**
                        </p>
                    </div>

                    <p class="text-xl text-gray-700">Total a Transferir: <span class="text-4xl font-extrabold text-green-600">${formatCurrency(checkoutTotal)}</span></p>

                    <!-- Instrucciones y Datos Bancarios -->
                    <div class="p-6 bg-gray-50 rounded-lg border space-y-4 text-left">
                        <h3 class="text-2xl font-semibold mb-3 text-gray-800 border-b pb-2">Datos para la Transferencia</h3>
                        
                        <!-- Contenedor de Datos -->
                        <div class="space-y-3" id="payment-details">
                            
                        </div>
                        
                        <p class="mt-4 text-sm text-red-700 font-semibold">
                            IMPORTANTE: Realiza la transferencia y luego presiona "Confirmar Transferencia".
                        </p>
                    </div>

                    <!-- Botón de Confirmación de Pago -->
                    <button
                        id="confirm-transfer-btn"
                        class="w-full flex items-center justify-center space-x-2 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-xl font-bold rounded-xl shadow-lg transition duration-200 active:scale-95"
                    >
                        <i data-lucide="check-circle" class="w-5 h-5"></i>
                        <span>Confirmar Transferencia</span>
                    </button>

                    <div id="confirmation-message" class="hidden bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mt-4" role="alert">
                        <p class="font-bold text-lg">¡Confirmación Enviada!</p>
                        <p>
                            Hemos registrado tu confirmación. Revisa tu correo **${PAYMENT_INFO.email}** para enviar el comprobante de pago junto con el número de pedido **${orderId}**. Una vez validada la transferencia, recibirás una confirmación final.
                        </p>
                    </div>


                    <button
                        id="back-to-shop-btn"
                        class="mt-4 flex items-center justify-center space-x-2 text-indigo-500 hover:text-indigo-700 transition duration-200"
                    >
                        <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        <span>Volver a la Tienda</span>
                    </button>
                </div>
            `;

            // Rellenar detalles de pago
            const paymentDetails = document.getElementById('payment-details');
            Object.entries(PAYMENT_INFO).forEach(([key, value]) => {
                const label = key === 'rut' ? 'RUT' : key === 'email' ? 'Email para Comprobante' : key === 'cuenta' ? 'Nro. de Cuenta' : key === 'tipoCuenta' ? 'Tipo de Cuenta' : key.charAt(0).toUpperCase() + key.slice(1);
                
                const detailDiv = document.createElement('div');
                detailDiv.className = 'flex justify-between items-center text-sm';
                detailDiv.innerHTML = `
                    <span class="font-medium text-gray-600 capitalize">${label}:</span>
                    <div class="flex items-center space-x-2">
                        <span class="font-bold text-gray-900 text-right">${value}</span>
                        <button data-copy-text="${value}" class="copy-btn text-indigo-500 hover:text-indigo-700 text-xs font-semibold py-1 px-2 rounded-md border border-indigo-300 hover:bg-indigo-50 transition duration-150">
                            Copiar
                        </button>
                    </div>
                `;
                paymentDetails.appendChild(detailDiv);
            });


            // Agregar listeners
            document.getElementById('back-to-shop-btn').addEventListener('click', () => {
                // Limpiar carrito al volver de checkout para simular fin de compra
                cart = [];
                orderId = null;
                updateCartCount();
                renderView('shop');
            });

            document.getElementById('confirm-transfer-btn').addEventListener('click', (e) => {
                e.currentTarget.disabled = true;
                e.currentTarget.classList.add('opacity-50');
                e.currentTarget.innerHTML = '<i data-lucide="check-circle" class="w-5 h-5"></i><span>Confirmación Recibida</span>';
                document.getElementById('confirmation-message').classList.remove('hidden');
                lucide.createIcons();
            });

            document.querySelectorAll('.copy-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const textToCopy = e.currentTarget.dataset.copyText;
                    copyToClipboard(textToCopy);
                });
            });

            lucide.createIcons();
            currentView = 'checkout';
        };

        // Función principal para cambiar de vista
        const renderView = (view) => {
            currentView = view;
            if (view === 'shop') {
                renderShopView();
            } else if (view === 'cart') {
                renderCartView();
            } else if (view === 'checkout') {
                renderCheckoutView();
            }
        };

        // --- INICIALIZACIÓN ---
        document.addEventListener('DOMContentLoaded', () => {
            // Inicializar la vista de la tienda al cargar
            renderView('shop');

            // Listeners de navegación globales
            document.getElementById('logo-button').addEventListener('click', () => renderView('shop'));
            document.getElementById('cart-button').addEventListener('click', () => renderView('cart'));
        });

    </script>
</body>
</html>

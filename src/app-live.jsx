// MICOZ — Live app entry (no design canvas)
// Renders the full shopping site at the home page, fully navigable.

const { useState: useSL, useCallback: useCL } = React;

function MicozApp() {
  const [page, setPage] = useSL('home');
  const [activeProduct, setActiveProduct] = useSL(null);
  const [cart, setCart] = useSL([]);
  const [toast, setToast] = useSL({ show: false, message: '' });

  const onNav = useCL((p, prod) => {
    if (p === 'detail' && prod) setActiveProduct(prod);
    setPage(p);
  }, []);

  const onOpenProduct = useCL((p) => { setActiveProduct(p); setPage('detail'); }, []);

  const onAdd = useCL((product, opt, qty = 1) => {
    const useOpt = opt || product.options[0];
    const cartId = `${product.id}-${useOpt.id}`;
    setCart(prev => {
      const exist = prev.find(i => i.cartId === cartId);
      if (exist) return prev.map(i => i.cartId === cartId ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { cartId, product, opt: useOpt, qty }];
    });
    setToast({ show: true, message: `${product.name}이(가) 장바구니에 담겼습니다.` });
  }, []);

  const updateQty = (id, q) => setCart(prev => prev.map(i => i.cartId === id ? { ...i, qty: q } : i));
  const removeItem = (id) => setCart(prev => prev.filter(i => i.cartId !== id));

  const showHeader = page !== 'login' && page !== 'signup';

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {showHeader && (
        <DesktopHeader
          page={page} cart={cart}
          onNav={onNav}
          onOpenCart={() => setPage('cart')}
        />
      )}
      <PageFade pageKey={page + (page === 'detail' ? activeProduct?.id : '')}>
        <div>
          {page === 'home' && <HomePage onNav={onNav} onOpenProduct={onOpenProduct} onAdd={onAdd} />}
          {page === 'products' && <ProductsPage onOpenProduct={onOpenProduct} onAdd={onAdd} />}
          {page === 'detail' && activeProduct && <DetailPage product={activeProduct} onAdd={onAdd} onNav={onNav} />}
          {page === 'cart' && <CartPage cart={cart} onUpdateQty={updateQty} onRemove={removeItem} onCheckout={() => setPage('checkout')} onNav={onNav} />}
          {page === 'checkout' && <CheckoutPage cart={cart} onNav={onNav} onPlaceOrder={() => { setCart([]); setPage('confirm'); }} />}
          {page === 'confirm' && <OrderConfirm onNav={onNav} />}
          {page === 'story' && <StoryPage onNav={onNav} />}
          {page === 'mypage' && <MyPage onNav={onNav} />}
          {page === 'login' && <LoginPage onNav={onNav} />}
          {page === 'signup' && <SignupPage onNav={onNav} />}
        </div>
      </PageFade>

      <Toast show={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<MicozApp />);

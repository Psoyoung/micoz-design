// MICOZ — Cart / Story / MyPage (desktop) + 추가 화면들
const { useState: useStateE } = React;

// ─── CART (drawer or page) ─────────────────────────────
function CartDrawer({ open, cart, onClose, onUpdateQty, onRemove, onCheckout }) {
  const { won } = window.MICOZ_DATA;
  const sub = cart.reduce((s, i) => s + i.opt.price * i.qty, 0);
  const ship = sub === 0 ? 0 : sub >= 50000 ? 0 : 3000;
  const total = sub + ship;

  return (
    <>
      {/* backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(20,12,30,0.4)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity .3s', zIndex: 200, backdropFilter: 'blur(4px)',
      }}/>
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 480, maxWidth: '100vw',
        background: 'var(--cream)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .4s cubic-bezier(.2,.7,.3,1)',
        zIndex: 201,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px rgba(20,12,30,0.15)',
      }}>
        <div style={{
          padding: '32px 36px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderBottom: '1px solid var(--line)',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em',
              color: 'var(--plum-500)',
            }}>YOUR BAG</div>
            <h2 style={{
              fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 28,
              margin: '8px 0 0', color: 'var(--plum-800)', letterSpacing: '-0.01em',
            }}>장바구니 ({cart.length})</h2>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink)',
            padding: 8,
          }}>{Icon.close(20)}</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 36px' }}>
          {cart.length === 0 ? (
            <div style={{
              padding: '80px 0', textAlign: 'center',
              fontFamily: 'var(--serif)', color: 'var(--muted)', fontSize: 16, fontWeight: 300,
            }}>
              <div style={{ marginBottom: 18, opacity: 0.5 }}>{Icon.bag(36, 'var(--muted)')}</div>
              장바구니가 비어 있어요.
            </div>
          ) : cart.map((it) => (
            <div key={it.cartId} style={{
              display: 'grid', gridTemplateColumns: '88px 1fr auto', gap: 20,
              padding: '24px 0', borderBottom: '1px solid var(--line)',
            }}>
              <div style={{ width: 88, height: 110, background: it.product.grad }}/>
              <div>
                <div style={{
                  fontFamily: 'var(--serif-en)', fontSize: 10, letterSpacing: '0.3em',
                  color: 'var(--muted)', marginBottom: 6,
                }}>{it.product.line.toUpperCase()}</div>
                <div style={{
                  fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 400,
                  color: 'var(--plum-800)',
                }}>{it.product.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{it.opt.label}</div>
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Counter value={it.qty} onChange={(v) => onUpdateQty(it.cartId, v)} />
                  <button onClick={() => onRemove(it.cartId)} style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontSize: 12, color: 'var(--muted)',
                    textDecoration: 'underline', textUnderlineOffset: 3,
                  }}>삭제</button>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--serif-en)', fontSize: 15, color: 'var(--plum-800)', whiteSpace: 'nowrap' }}>
                {won(it.opt.price * it.qty)}
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{
            padding: '24px 36px 36px', borderTop: '1px solid var(--line)',
            background: 'var(--paper)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10 }}>
              <span style={{ color: 'var(--muted)' }}>소계</span>
              <span style={{ fontFamily: 'var(--serif-en)' }}>{won(sub)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 16 }}>
              <span style={{ color: 'var(--muted)' }}>배송비 {sub >= 50000 && <span style={{ color: 'var(--plum-500)', marginLeft: 6 }}>· 무료</span>}</span>
              <span style={{ fontFamily: 'var(--serif-en)' }}>{ship === 0 ? '— ' : won(ship)}</span>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '20px 0', borderTop: '1px solid var(--line)',
            }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--plum-800)' }}>합계</span>
              <span style={{ fontFamily: 'var(--serif-en)', fontSize: 24, color: 'var(--plum-800)' }}>{won(total)}</span>
            </div>
            <PrimaryBtn full size="lg" onClick={onCheckout}>결제하기</PrimaryBtn>
            <div style={{
              textAlign: 'center', marginTop: 14,
              fontSize: 12, color: 'var(--muted)',
            }}>모든 주문에 시그니처 샘플 3종 동봉</div>
          </div>
        )}
      </aside>
    </>
  );
}

// ─── CHECKOUT PAGE (한국식 주문서) ──────────────────────
function CheckoutPage({ cart, onNav, onPlaceOrder }) {
  const { won } = window.MICOZ_DATA;
  const [pay, setPay] = useStateE('credit');
  const [shipMemo, setShipMemo] = useStateE('default');
  const [point, setPoint] = useStateE('');
  const [coupon, setCoupon] = useStateE('');
  const [agreeAll, setAgreeAll] = useStateE(false);
  const [agree1, setAgree1] = useStateE(false);
  const [agree2, setAgree2] = useStateE(false);

  const sub = cart.reduce((s, i) => s + i.opt.price * i.qty, 0);
  const ship = sub >= 50000 ? 0 : 3000;
  const discount = cart.length > 0 ? 2500 : 0; // 회원 할인 예시
  const usePoint = Math.min(parseInt(point) || 0, 28400);
  const total = sub + ship - discount - usePoint;
  const earn = Math.floor(sub * 0.05);

  const toggleAll = () => {
    const v = !agreeAll;
    setAgreeAll(v); setAgree1(v); setAgree2(v);
  };

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Page header */}
      <section style={{
        padding: '60px 56px 0',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em',
            color: 'var(--plum-500)', marginBottom: 14,
          }}>CHECKOUT</div>
          <h1 style={{
            fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 56,
            margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.02em',
          }}>주문서 작성</h1>
        </div>
      </section>

      <section style={{ padding: '60px 56px 120px' }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32,
          alignItems: 'start',
        }}>
          {/* LEFT — form sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* 주문자 정보 */}
            <FormSection title="주문자 정보">
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 14, columnGap: 24, fontSize: 14, alignItems: 'center' }}>
                <FormLabel>이름</FormLabel>
                <CKInput defaultValue="박지우" />

                <FormLabel>휴대폰</FormLabel>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 12px 1fr 12px 1fr', gap: 6, alignItems: 'center' }}>
                  <CKInput defaultValue="010" />
                  <span style={{ textAlign: 'center', color: 'var(--muted)' }}>-</span>
                  <CKInput defaultValue="9999" />
                  <span style={{ textAlign: 'center', color: 'var(--muted)' }}>-</span>
                  <CKInput defaultValue="4165" />
                </div>

                <FormLabel>이메일</FormLabel>
                <CKInput defaultValue="jiwoo.park@email.net" />
              </div>
            </FormSection>

            {/* 배송지 정보 */}
            <FormSection title="배송지 정보" action="배송지 관리">
              <div style={{
                padding: 24,
                border: '1.5px solid var(--plum-700)',
                background: 'var(--paper)',
                position: 'relative',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{
                    padding: '5px 12px',
                    background: 'var(--plum-700)', color: 'var(--cream)',
                    fontSize: 11, letterSpacing: '0.2em',
                  }}>기본 배송지</span>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500, color: 'var(--plum-800)' }}>박지우</span>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>· 010-9999-4165</span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.7 }}>
                  서울특별시 강남구 청담동 37 (청담동, 헤르츠1번지) 402호
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
                  우편번호 06070
                </div>
              </div>
            </FormSection>

            {/* 배송 요청 사항 */}
            <FormSection title="배송 요청 사항">
              <select value={shipMemo} onChange={(e) => setShipMemo(e.target.value)} style={{
                width: '100%', padding: '14px 16px',
                background: 'var(--paper)', border: '1px solid var(--line-strong)',
                fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)',
                outline: 'none', borderRadius: 0, cursor: 'pointer',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%236b5d72\' fill=\'none\' stroke-width=\'1.4\'/%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 18px center',
              }}>
                <option value="default">배송 요청 사항 선택</option>
                <option>문 앞에 놓아주세요</option>
                <option>경비실에 맡겨주세요</option>
                <option>택배함에 넣어주세요</option>
                <option>배송 전 연락 바랍니다</option>
                <option>직접 받겠습니다 (부재 시 재방문)</option>
              </select>
            </FormSection>

            {/* 주문 상품 */}
            <FormSection title={`주문 상품 (${cart.length})`}>
              <div style={{
                display: 'grid', gridTemplateColumns: '120px 1fr 80px 140px 100px',
                gap: 16, padding: '14px 0',
                borderBottom: '1px solid var(--line-strong)',
                fontFamily: 'var(--serif-en)', fontSize: 11,
                color: 'var(--muted)', letterSpacing: '0.2em',
              }}>
                <span>상품 정보</span>
                <span></span>
                <span style={{ textAlign: 'center' }}>수량</span>
                <span style={{ textAlign: 'right' }}>판매 금액</span>
                <span style={{ textAlign: 'right' }}>포인트</span>
              </div>

              {cart.map((it) => {
                const total = it.opt.price * it.qty;
                const before = Math.round(total * 1.1);
                const pts = Math.floor(total * 0.05);
                return (
                  <div key={it.cartId} style={{
                    display: 'grid', gridTemplateColumns: '120px 1fr 80px 140px 100px',
                    gap: 16, padding: '24px 0', alignItems: 'center',
                    borderBottom: '1px solid var(--line)',
                  }}>
                    <div style={{ width: 100, height: 124, background: it.product.grad }}/>
                    <div>
                      <div style={{
                        fontFamily: 'var(--serif-en)', fontSize: 10, letterSpacing: '0.3em',
                        color: 'var(--muted)', marginBottom: 6,
                      }}>{it.product.line.toUpperCase()}</div>
                      <div style={{
                        fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 400,
                        color: 'var(--plum-800)', marginBottom: 4,
                      }}>{it.product.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{it.opt.label}</div>
                    </div>
                    <div style={{ textAlign: 'center', fontFamily: 'var(--serif-en)', fontSize: 14, color: 'var(--ink)' }}>
                      {it.qty}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: 11, color: 'var(--muted)', textDecoration: 'line-through',
                        fontFamily: 'var(--serif-en)',
                      }}>{won(before)}</div>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 2,
                      }}>
                        <span style={{
                          fontSize: 11, color: '#c14b3a', fontFamily: 'var(--serif-en)',
                          fontWeight: 500,
                        }}>10%</span>
                        <span style={{ fontFamily: 'var(--serif-en)', fontSize: 16, color: 'var(--plum-800)', fontWeight: 500 }}>
                          {won(total)}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'var(--serif-en)', fontSize: 13, color: 'var(--plum-500)' }}>
                      {pts} P
                    </div>
                  </div>
                );
              })}
            </FormSection>

            {/* 쿠폰 및 포인트 적용 */}
            <FormSection title="쿠폰 및 포인트 적용">
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 18, columnGap: 24, alignItems: 'center' }}>
                <FormLabel>쿠폰</FormLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <select value={coupon} onChange={(e) => setCoupon(e.target.value)} style={{
                    flex: 1, padding: '12px 16px',
                    background: 'var(--paper)', border: '1px solid var(--line-strong)',
                    fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink)',
                    outline: 'none', borderRadius: 0, cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%236b5d72\' fill=\'none\' stroke-width=\'1.4\'/%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                  }}>
                    <option value="">쿠폰 선택 (3장 사용 가능)</option>
                    <option>웰컴 ₩ 5,000 할인 쿠폰</option>
                    <option>VIP 5% 할인 쿠폰</option>
                    <option>봄맞이 ₩ 3,000 할인 쿠폰</option>
                  </select>
                </div>

                <FormLabel>포인트</FormLabel>
                <div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        value={point}
                        onChange={(e) => setPoint(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="0"
                        style={{
                          width: '100%', padding: '12px 30px 12px 16px',
                          background: 'var(--paper)', border: '1px solid var(--line-strong)',
                          fontFamily: 'var(--serif-en)', fontSize: 14, color: 'var(--ink)',
                          outline: 'none', borderRadius: 0, textAlign: 'right',
                        }}
                      />
                      <span style={{
                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                        fontFamily: 'var(--serif-en)', fontSize: 13, color: 'var(--muted)',
                      }}>P</span>
                    </div>
                    <button onClick={() => setPoint('28400')} style={{
                      padding: '12px 18px',
                      background: 'transparent',
                      border: '1.5px solid var(--plum-700)', color: 'var(--plum-700)',
                      cursor: 'pointer', fontSize: 12, letterSpacing: '0.18em',
                      whiteSpace: 'nowrap', fontWeight: 500,
                    }}>전액 사용</button>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
                    보유 포인트 <span style={{ fontFamily: 'var(--serif-en)', color: 'var(--plum-700)' }}>28,400 P</span>
                    {' · '}최소 사용 1,000P · 최대 사용 가능 28,400P
                  </div>
                </div>
              </div>
            </FormSection>

            {/* 결제 수단 */}
            <FormSection title="결제 수단">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {[
                  ['credit', '신용카드 결제'],
                  ['vbank', '가상계좌 결제'],
                  ['rtbank', '실시간 계좌이체'],
                  ['phone', '휴대폰 결제'],
                  ['payco', '페이코'],
                  ['kakao', '카카오페이'],
                  ['samsung', '삼성페이'],
                  ['toss', 'TOSS', { weight: 700, color: '#0064ff' }],
                  ['naver', 'NAVER pay', { color: '#03c75a', italic: true }],
                  ['mpay', 'M pay'],
                  ['smile', '스마일페이'],
                  ['point', '포인트 결제'],
                ].map(([k, l, style]) => {
                  const sel = pay === k;
                  return (
                    <button key={k} onClick={() => setPay(k)} style={{
                      padding: '18px 12px',
                      background: sel ? 'var(--plum-700)' : 'var(--paper)',
                      color: sel ? 'var(--cream)' : 'var(--ink)',
                      border: `1px solid ${sel ? 'var(--plum-700)' : 'var(--line-strong)'}`,
                      cursor: 'pointer',
                      fontFamily: 'var(--sans)', fontSize: 13, fontWeight: sel ? 600 : 400,
                      transition: 'all .2s',
                      ...(style || {}),
                      ...(sel ? {} : (style || {})),
                    }}>{l}</button>
                  );
                })}
              </div>

              {pay === 'credit' && (
                <div style={{
                  marginTop: 20, padding: 24, background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 14, columnGap: 24, alignItems: 'center',
                }}>
                  <FormLabel>카드 종류</FormLabel>
                  <select style={{
                    padding: '12px 16px', background: '#fff',
                    border: '1px solid var(--line-strong)', fontSize: 13,
                    fontFamily: 'var(--sans)', outline: 'none', borderRadius: 0,
                    appearance: 'none', cursor: 'pointer',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%236b5d72\' fill=\'none\' stroke-width=\'1.4\'/%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                  }}>
                    <option>카드 종류를 선택해주세요</option>
                    <option>현대카드</option><option>신한카드</option><option>국민카드</option>
                    <option>삼성카드</option><option>롯데카드</option><option>BC카드</option>
                  </select>
                  <FormLabel>할부 개월</FormLabel>
                  <select style={{
                    padding: '12px 16px', background: '#fff',
                    border: '1px solid var(--line-strong)', fontSize: 13,
                    fontFamily: 'var(--sans)', outline: 'none', borderRadius: 0,
                    appearance: 'none', cursor: 'pointer',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%236b5d72\' fill=\'none\' stroke-width=\'1.4\'/%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                  }}>
                    <option>일시불</option>
                    <option>2개월 무이자</option><option>3개월 무이자</option>
                    <option>6개월 무이자</option><option>12개월</option>
                  </select>
                </div>
              )}
            </FormSection>

            {/* 안내 */}
            <div style={{
              padding: 24,
              background: 'rgba(245, 237, 247, 0.6)',
              border: '1px solid var(--line)',
              fontSize: 12, color: 'var(--muted)', lineHeight: 1.9,
            }}>
              <div style={{ marginBottom: 10, color: 'var(--plum-800)', fontWeight: 500, fontSize: 13 }}>
                · 구매 전 꼭 확인해 주세요.
              </div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>주문 완료 후, 자동 발송되는 결제 정보 메일을 꼭 확인해 주세요.</li>
                <li>제품 색상은 디바이스 환경에 따라 실제와 다르게 보일 수 있어요.</li>
                <li>모든 주문에는 시그니처 샘플 3종이 동봉되어 발송됩니다.</li>
                <li>VIP 회원은 매 주문 시 5% 적립이 자동으로 적용됩니다.</li>
                <li>배송 완료 후 30일 이내 미개봉 제품은 무료 반품이 가능해요.</li>
              </ul>
            </div>
          </div>

          {/* RIGHT — sticky summary */}
          <aside style={{
            position: 'sticky', top: 100,
            border: '1.5px solid var(--plum-800)',
            background: 'var(--paper)',
          }}>
            <div style={{
              padding: '20px 28px',
              background: 'var(--plum-900)', color: 'var(--cream)',
              fontFamily: 'var(--serif-en)', fontSize: 12, letterSpacing: '0.3em',
            }}>PAYMENT</div>

            <div style={{ padding: 28 }}>
              <div style={{
                fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500,
                color: 'var(--plum-800)', marginBottom: 20,
              }}>결제 정보</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                <SummaryRow label="주문 금액" value={won(sub)} />
                <SummaryRow label="배송비" value={ship === 0 ? '— ' : `+ ${won(ship)}`} />
                <SummaryRow label="총 할인 금액" value={`- ${won(discount + usePoint)}`} accent />
              </div>

              <div style={{
                marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--line)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--plum-800)', fontWeight: 500 }}>
                  총 결제 예상 금액
                </span>
                <span style={{
                  fontFamily: 'var(--serif-en)', fontSize: 28, color: '#c14b3a', fontWeight: 600,
                }}>{won(total)}</span>
              </div>

              <div style={{
                marginTop: 16, padding: '12px 14px',
                background: 'rgba(42, 26, 62, 0.04)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>총 적립 예상 포인트</span>
                <span style={{ fontFamily: 'var(--serif-en)', fontSize: 14, color: 'var(--plum-700)', fontWeight: 500 }}>
                  + {earn.toLocaleString('ko-KR')} P
                </span>
              </div>

              {/* 약관 동의 */}
              <div style={{
                marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--line)',
              }}>
                <div style={{
                  fontFamily: 'var(--serif-en)', fontSize: 10, letterSpacing: '0.3em',
                  color: 'var(--muted)', marginBottom: 14,
                }}>TERMS</div>
                <CKCheck checked={agreeAll} onClick={toggleAll} bold>
                  구매 이용약관 동의 <span style={{ color: 'var(--muted)', fontSize: 12 }}>모두 동의</span>
                </CKCheck>
                <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }}/>
                <CKCheck checked={agree1} onClick={() => { setAgree1(!agree1); setAgreeAll((!agree1) && agree2); }}>
                  개인정보 수집 및 이용 동의 <span style={{ color: '#c14b3a' }}>(필수)</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 11, textDecoration: 'underline' }}>내용보기</span>
                </CKCheck>
                <CKCheck checked={agree2} onClick={() => { setAgree2(!agree2); setAgreeAll(agree1 && (!agree2)); }}>
                  개인정보 제3자 제공 동의 <span style={{ color: '#c14b3a' }}>(필수)</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 11, textDecoration: 'underline' }}>내용보기</span>
                </CKCheck>
              </div>

              <button
                onClick={onPlaceOrder}
                disabled={!agree1 || !agree2}
                style={{
                  width: '100%', marginTop: 24,
                  padding: '18px 0',
                  background: (agree1 && agree2) ? 'var(--plum-800)' : 'var(--line-strong)',
                  color: 'var(--cream)',
                  border: 'none',
                  fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500,
                  letterSpacing: '0.2em',
                  cursor: (agree1 && agree2) ? 'pointer' : 'not-allowed',
                  transition: 'background .2s',
                }}>결제하기</button>
            </div>
          </aside>
        </div>
      </section>

      <DesktopFooter />
    </main>
  );
}

// ─── Checkout helpers ──────────────────────────────────
function FormSection({ title, action, children }) {
  return (
    <section>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        paddingBottom: 16, marginBottom: 24, borderBottom: '2px solid var(--plum-800)',
      }}>
        <h3 style={{
          fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 19,
          margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.005em',
        }}>{title}</h3>
        {action && (
          <button style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 12, color: '#c14b3a', textDecoration: 'underline',
            textUnderlineOffset: 3, fontFamily: 'var(--sans)',
          }}>{action} ›</button>
        )}
      </div>
      {children}
    </section>
  );
}

function FormLabel({ children }) {
  return (
    <span style={{
      fontSize: 13, color: 'var(--ink)', fontWeight: 500,
    }}>{children}</span>
  );
}

function CKInput({ defaultValue, placeholder }) {
  return (
    <input defaultValue={defaultValue} placeholder={placeholder} style={{
      width: '100%', padding: '12px 16px',
      background: 'var(--paper)', border: '1px solid var(--line-strong)',
      fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)',
      outline: 'none', borderRadius: 0,
    }} onFocus={(e) => e.target.style.borderColor = 'var(--plum-700)'}
       onBlur={(e) => e.target.style.borderColor = 'var(--line-strong)'} />
  );
}

function CKCheck({ children, checked, onClick, bold }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0',
      cursor: 'pointer', fontSize: bold ? 14 : 13,
      color: 'var(--ink)', fontWeight: bold ? 600 : 400,
    }}>
      <span style={{
        width: 18, height: 18, flex: '0 0 18px',
        background: checked ? 'var(--plum-700)' : 'transparent',
        border: `1.5px solid ${checked ? 'var(--plum-700)' : 'var(--line-strong)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && Icon.check(11, 'var(--cream)')}
      </span>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{
        fontFamily: 'var(--serif-en)',
        color: accent ? '#c14b3a' : 'var(--ink)',
        fontWeight: accent ? 500 : 400,
      }}>{value}</span>
    </div>
  );
}


function FormField({ label, placeholder, textarea }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: 'block', fontSize: 12, color: 'var(--muted)',
        letterSpacing: '0.15em', marginBottom: 8,
      }}>{label}</label>
      {textarea ? (
        <textarea placeholder={placeholder} rows={2} style={inputStyle} />
      ) : (
        <input placeholder={placeholder} style={inputStyle} />
      )}
    </div>
  );
}
const inputStyle = {
  width: '100%', padding: '14px 16px',
  background: 'transparent', border: '1px solid var(--line-strong)',
  fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)',
  outline: 'none', borderRadius: 0, resize: 'none',
};

// ─── ORDER CONFIRMATION ─────────────────────────────────
function OrderConfirm({ onNav }) {
  return (
    <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 56px' }}>
      <div style={{ maxWidth: 540, textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--plum-100)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 32,
        }}>{Icon.check(28, 'var(--plum-700)')}</div>
        <div style={{
          fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em',
          color: 'var(--plum-500)', marginBottom: 14,
        }}>ORDER COMPLETED</div>
        <h1 style={{
          fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 44,
          color: 'var(--plum-800)', margin: 0, letterSpacing: '-0.01em',
        }}>주문이 완료되었어요.</h1>
        <p style={{
          fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.9,
          color: 'var(--muted)', marginTop: 24, fontWeight: 300,
        }}>
          주문번호 <span style={{ fontFamily: 'var(--serif-en)', color: 'var(--plum-700)' }}>MZ-26050700428</span><br/>
          소중한 의식이 시작되는 순간까지, 정성껏 준비해 보내드릴게요.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 40 }}>
          <PrimaryBtn dark={false} onClick={() => onNav('mypage')}>주문 내역 보기</PrimaryBtn>
          <PrimaryBtn onClick={() => onNav('home')}>쇼핑 계속하기</PrimaryBtn>
        </div>
      </div>
    </main>
  );
}

// ─── BRAND STORY ────────────────────────────────────────
function StoryPage({ onNav }) {
  return (
    <main style={{ background: 'var(--cream)' }}>
      {/* Hero */}
      <section style={{
        height: 'calc(100vh - 80px)', minHeight: 620,
        background: 'linear-gradient(170deg, #18102a 0%, #2a1a3e 50%, #4d3470 100%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 30%, rgba(196, 176, 216, 0.18), transparent 60%)',
        }}/>
        <div style={{ position: 'relative', textAlign: 'center', color: 'var(--cream)', padding: '0 56px' }}>
          <div style={{
            fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.5em',
            opacity: 0.6, marginBottom: 36,
          }}>OUR PHILOSOPHY · SINCE 2018</div>
          <h1 style={{
            fontFamily: 'var(--serif)', fontWeight: 200, fontSize: 92,
            margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em',
          }}>
            깊은 밤이<br/>
            <em style={{ fontFamily: 'var(--serif-en)', fontWeight: 200, opacity: 0.7 }}>피워낸</em><br/>
            보랏빛 의식
          </h1>
          <p style={{
            fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.9,
            opacity: 0.78, fontWeight: 300, maxWidth: 620, margin: '40px auto 0',
          }}>
            MICOZ는 한국의 한방 전통과 현대의 정제된 미니멀리즘이 만나는 자리에서 시작되었습니다.
          </p>
        </div>
      </section>

      {/* Story sections */}
      <section style={{ padding: '160px 56px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          {[
            ['01', 'ORIGIN', '시간이 빚어낸 정수', '한 잔의 차를 우리듯, 한방의 깊이를 천천히 길어 올립니다. 28일의 자연 발효, 그 시간이 보랏빛으로 응축된 한 병이 됩니다. 우리는 빠른 효과보다 단단한 변화를 믿습니다.'],
            ['02', 'CRAFT', '조용한 럭셔리', '절제된 텍스처, 절제된 향, 절제된 디자인. 화장대 위에 놓였을 때 마음이 차분해지는 것. 그것이 MICOZ가 말하는 럭셔리입니다.'],
            ['03', 'RITUAL', '하루의 의식', '바쁜 하루 끝에서, 잠시 자신에게 돌아오는 다섯 단계의 작은 의식. 화장품은 도구가 아니라, 자기 자신과 마주하는 방법이 됩니다.'],
          ].map(([n, t, h, p], i) => (
            <div key={n} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80,
              padding: '80px 0', alignItems: 'center',
              borderTop: i === 0 ? 'none' : '1px solid var(--line)',
            }}>
              <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                <div style={{
                  fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em',
                  color: 'var(--plum-500)', marginBottom: 12,
                }}>{n} · {t}</div>
                <h2 style={{
                  fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 48,
                  margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.01em', lineHeight: 1.25,
                }}>{h}</h2>
                <p style={{
                  fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.95,
                  color: 'var(--muted)', marginTop: 28, fontWeight: 300,
                }}>{p}</p>
              </div>
              <div style={{
                aspectRatio: '4 / 5',
                background: [
                  'linear-gradient(155deg, #18102a, #4d3470)',
                  'linear-gradient(165deg, #221638, #6b4d8f, #c4b0d8)',
                  'linear-gradient(140deg, #2a1a3e, #9a7fb8, #e8d8f0)',
                ][i],
                order: i % 2 === 0 ? 1 : 0,
              }}/>
            </div>
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section style={{
        padding: '120px 56px', background: 'var(--plum-900)', color: 'var(--cream)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, textAlign: 'center',
        }}>
          {[
            ['28', '일의 발효', '시그니처 컴파운드'],
            ['7', '가지 한방', '동양의 지혜'],
            ['96', '%', '재구매 의사'],
            ['2018', '', '브랜드 시작'],
          ].map(([n, u, l], i) => (
            <div key={i}>
              <div style={{
                fontFamily: 'var(--serif)', fontWeight: 200, fontSize: 80,
                color: 'var(--cream)', lineHeight: 1, letterSpacing: '-0.02em',
              }}>{n}<span style={{ fontSize: 28, opacity: 0.5, marginLeft: 4 }}>{u}</span></div>
              <div style={{ marginTop: 16, fontSize: 13, opacity: 0.6, letterSpacing: '0.1em' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <DesktopFooter />
    </main>
  );
}

// ─── RETURNS TAB (취소 · 교환 · 반품) ────────────────────
function ReturnsTab({ onNav }) {
  const { won, PRODUCTS } = window.MICOZ_DATA;
  const [subTab, setSubTab] = useStateE('list'); // list | request | history

  // 신청 가능한 주문 (배송완료 30일 이내)
  const eligible = [
    {
      no: 'MZ-26041200312', date: '2026.04.12', received: '2026.04.15',
      product: PRODUCTS[1], opt: PRODUCTS[1].options[0], qty: 1, total: 168000,
      daysLeft: 18,
    },
    {
      no: 'MZ-26032800189', date: '2026.03.28', received: '2026.04.02',
      product: PRODUCTS[3], opt: PRODUCTS[3].options[0], qty: 1, total: 78000,
      daysLeft: 4,
    },
  ];

  // 신청 이력
  const history = [
    {
      no: 'MZ-26022000098', kind: '환불 완료', kindColor: '#3a8a5b',
      product: PRODUCTS[4], opt: PRODUCTS[4].options[0], qty: 1,
      reason: '단순 변심',
      applied: '2026.02.24', completed: '2026.02.28',
      refund: 58000,
    },
    {
      no: 'MZ-26011500041', kind: '교환 진행중', kindColor: '#b89968',
      product: PRODUCTS[6], opt: PRODUCTS[6].options[0], qty: 1,
      reason: '제품 파손',
      applied: '2026.05.16', completed: null,
      step: 2,
    },
  ];

  return (
    <div>
      <h3 style={{
        fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26,
        margin: '0 0 8px', color: 'var(--plum-800)',
      }}>취소 · 교환 · 반품</h3>
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 32px', lineHeight: 1.7 }}>
        배송 완료 후 <span style={{ color: 'var(--plum-700)' }}>30일 이내</span> 미개봉 제품에 한해 무료 반품이 가능해요. 개봉 또는 사용 흔적이 있는 경우 반품이 어려울 수 있습니다.
      </p>

      {/* Sub tabs */}
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--line-strong)', marginBottom: 32,
      }}>
        {[
          ['list', '신청하기'],
          ['history', '신청 내역', 2],
        ].map(([k, l, c]) => {
          const sel = subTab === k;
          return (
            <button key={k} onClick={() => setSubTab(k)} style={{
              padding: '16px 28px', background: 'transparent', border: 'none',
              borderBottom: sel ? '2px solid var(--plum-800)' : '2px solid transparent',
              marginBottom: -1, cursor: 'pointer',
              fontFamily: 'var(--sans)', fontSize: 14,
              color: sel ? 'var(--plum-800)' : 'var(--muted)',
              fontWeight: sel ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {l}
              {c && <span style={{
                fontFamily: 'var(--serif-en)', fontSize: 11,
                background: sel ? 'var(--plum-800)' : 'var(--line-strong)',
                color: 'var(--cream)',
                padding: '1px 7px', borderRadius: 9999,
              }}>{c}</span>}
            </button>
          );
        })}
      </div>

      {subTab === 'list' && (
        <div>
          {/* Process steps */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
            background: 'var(--paper)', border: '1px solid var(--line)',
            padding: '24px 0', marginBottom: 32,
          }}>
            {[
              ['01', '주문 선택', '신청할 주문을 선택해요.'],
              ['02', '사유 작성', '취소·교환·반품 사유를 알려주세요.'],
              ['03', '회수 안내', '회수가 시작되면 알림으로 알려드려요.'],
              ['04', '환불 완료', '검수 후 3-5일 내 환불됩니다.'],
            ].map(([n, t, d], i, arr) => (
              <div key={n} style={{
                position: 'relative',
                padding: '8px 24px',
                borderRight: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
              }}>
                <div style={{
                  fontFamily: 'var(--serif-en)', fontSize: 11,
                  color: 'var(--plum-500)', letterSpacing: '0.3em', marginBottom: 8,
                }}>STEP {n}</div>
                <div style={{
                  fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 500,
                  color: 'var(--plum-800)', marginBottom: 6,
                }}>{t}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{d}</div>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: 16,
          }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, color: 'var(--plum-800)' }}>
              신청 가능한 주문
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              총 <span style={{ fontFamily: 'var(--serif-en)', color: 'var(--plum-700)' }}>{eligible.length}</span>건
            </div>
          </div>

          {eligible.map((o) => (
            <ReturnEligibleCard key={o.no} order={o} onRequest={() => setSubTab('request')} />
          ))}

          {/* Notice */}
          <div style={{
            marginTop: 32, padding: 24,
            background: 'rgba(245, 237, 247, 0.6)',
            border: '1px solid var(--line)',
            fontSize: 12, color: 'var(--muted)', lineHeight: 1.9,
          }}>
            <div style={{ marginBottom: 10, color: 'var(--plum-800)', fontWeight: 500, fontSize: 13 }}>
              · 신청 전 확인해주세요.
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>단순 변심에 의한 반품은 왕복 배송비 ₩ 6,000이 부과돼요. (5만원 이상 주문은 회수 배송비만)</li>
              <li>제품 불량 또는 오배송의 경우 배송비 전액을 부담해드립니다.</li>
              <li>한정판, 샘플, 기프트 세트는 단순 변심 반품이 어려워요.</li>
              <li>교환은 동일 제품의 다른 옵션(용량·색상)으로만 가능합니다.</li>
            </ul>
          </div>
        </div>
      )}

      {subTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {history.map((h) => (
            <ReturnHistoryCard key={h.no} item={h} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReturnEligibleCard({ order, onRequest }) {
  const { won } = window.MICOZ_DATA;
  const urgent = order.daysLeft <= 7;
  return (
    <div style={{
      border: '1px solid var(--line)', background: 'var(--paper)',
      marginBottom: 14,
    }}>
      <div style={{
        padding: '16px 24px', borderBottom: '1px solid var(--line)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(42, 26, 62, 0.02)',
      }}>
        <div>
          <span style={{ fontFamily: 'var(--serif-en)', fontSize: 13, color: 'var(--plum-700)' }}>{order.no}</span>
          <span style={{ marginLeft: 14, fontSize: 12, color: 'var(--muted)' }}>주문일 {order.date}</span>
          <span style={{ marginLeft: 14, fontSize: 12, color: 'var(--muted)' }}>· 수령일 {order.received}</span>
        </div>
        <span style={{
          fontSize: 11, padding: '4px 12px', letterSpacing: '0.1em',
          background: urgent ? 'rgba(193, 75, 58, 0.1)' : 'var(--plum-100)',
          color: urgent ? '#c14b3a' : 'var(--plum-700)',
        }}>반품 기한 {order.daysLeft}일 남음</span>
      </div>
      <div style={{
        padding: 24,
        display: 'grid', gridTemplateColumns: '90px 1fr auto auto', gap: 20, alignItems: 'center',
      }}>
        <div style={{ width: 90, height: 110, background: order.product.grad }}/>
        <div>
          <div style={{
            fontFamily: 'var(--serif-en)', fontSize: 10, letterSpacing: '0.3em',
            color: 'var(--muted)', marginBottom: 6,
          }}>{order.product.line.toUpperCase()}</div>
          <div style={{
            fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 400,
            color: 'var(--plum-800)', marginBottom: 4,
          }}>{order.product.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{order.opt.label} · {order.qty}개</div>
        </div>
        <div style={{ textAlign: 'right', fontFamily: 'var(--serif-en)', fontSize: 16, color: 'var(--plum-800)' }}>
          {won(order.total)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={onRequest} style={{
            padding: '10px 18px',
            background: 'var(--plum-700)', color: 'var(--cream)',
            border: 'none', cursor: 'pointer',
            fontSize: 12, letterSpacing: '0.15em', fontWeight: 500, whiteSpace: 'nowrap',
          }}>반품 신청</button>
          <button onClick={onRequest} style={{
            padding: '10px 18px',
            background: 'transparent', color: 'var(--plum-700)',
            border: '1px solid var(--plum-700)', cursor: 'pointer',
            fontSize: 12, letterSpacing: '0.15em', whiteSpace: 'nowrap',
          }}>교환 신청</button>
        </div>
      </div>
    </div>
  );
}

function ReturnHistoryCard({ item }) {
  const { won } = window.MICOZ_DATA;
  const isInProgress = !item.completed;
  return (
    <div style={{
      border: '1px solid var(--line)', background: 'var(--paper)',
    }}>
      <div style={{
        padding: '16px 24px', borderBottom: '1px solid var(--line)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <span style={{
            fontSize: 11, padding: '4px 12px', letterSpacing: '0.1em',
            background: item.kindColor, color: 'var(--cream)',
            marginRight: 14,
          }}>{item.kind}</span>
          <span style={{ fontFamily: 'var(--serif-en)', fontSize: 13, color: 'var(--plum-700)' }}>{item.no}</span>
          <span style={{ marginLeft: 14, fontSize: 12, color: 'var(--muted)' }}>신청일 {item.applied}</span>
        </div>
        <button style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 12, color: 'var(--muted)',
          textDecoration: 'underline', textUnderlineOffset: 3,
        }}>상세 보기</button>
      </div>

      <div style={{
        padding: 24,
        display: 'grid', gridTemplateColumns: '90px 1fr 200px', gap: 24, alignItems: 'center',
      }}>
        <div style={{ width: 90, height: 110, background: item.product.grad }}/>
        <div>
          <div style={{
            fontFamily: 'var(--serif-en)', fontSize: 10, letterSpacing: '0.3em',
            color: 'var(--muted)', marginBottom: 6,
          }}>{item.product.line.toUpperCase()}</div>
          <div style={{
            fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 400,
            color: 'var(--plum-800)', marginBottom: 4,
          }}>{item.product.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{item.opt.label} · {item.qty}개</div>
          <div style={{ fontSize: 12, color: 'var(--ink)' }}>
            <span style={{ color: 'var(--muted)' }}>사유 ·</span> {item.reason}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {item.refund && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.15em', marginBottom: 4 }}>환불 완료</div>
              <div style={{ fontFamily: 'var(--serif-en)', fontSize: 18, color: 'var(--plum-800)' }}>
                {won(item.refund)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>완료일 {item.completed}</div>
            </div>
          )}
          {isInProgress && (
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              <div style={{ marginBottom: 8 }}>진행 단계</div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                {[1, 2, 3, 4].map(s => (
                  <span key={s} style={{
                    width: 24, height: 3,
                    background: s <= item.step ? 'var(--plum-700)' : 'var(--line)',
                  }}/>
                ))}
              </div>
              <div style={{ marginTop: 8, color: 'var(--plum-700)', fontWeight: 500 }}>
                회수 진행중 (2/4)
              </div>
            </div>
          )}
        </div>
      </div>

      {isInProgress && (
        <div style={{
          padding: '14px 24px', background: 'rgba(184, 153, 104, 0.08)',
          borderTop: '1px solid var(--line)',
          fontSize: 12, color: 'var(--ink)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>
            <span style={{ color: 'var(--muted)' }}>회수 송장번호 ·</span>{' '}
            <span style={{ fontFamily: 'var(--serif-en)', color: 'var(--plum-700)' }}>CJ 4928-1059-3372</span>
          </span>
          <button style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 12, color: 'var(--plum-700)', fontWeight: 500,
          }}>배송 조회 →</button>
        </div>
      )}
    </div>
  );
}

// ─── MYPAGE ─────────────────────────────────────────────
function MyPage({ onNav, initialTab = 'orders' }) {
  const { won, PRODUCTS } = window.MICOZ_DATA;
  const [tab, setTab] = useStateE(initialTab);
  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <section style={{
        padding: '80px 56px 60px',
        background: 'linear-gradient(180deg, #f5edf7 0%, var(--cream) 100%)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em',
            color: 'var(--plum-500)', marginBottom: 14,
          }}>MY MICOZ</div>
          <h1 style={{
            fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 64,
            margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.02em',
          }}>안녕하세요, 지우 님.</h1>
          <div style={{
            marginTop: 20, fontSize: 14, color: 'var(--muted)',
            display: 'flex', gap: 40, alignItems: 'center',
          }}>
            <span><span style={{ color: 'var(--plum-700)' }}>VIP</span> 등급 · 보랏빛 의식의 동반자</span>
            <span>가입일 2024.03.18</span>
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 56px 120px' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '240px 1fr', gap: 60,
        }}>
          <aside>
            <div style={{
              padding: 24, background: 'var(--plum-900)', color: 'var(--cream)',
              marginBottom: 28,
            }}>
              <div style={{
                fontFamily: 'var(--serif-en)', fontSize: 10, letterSpacing: '0.3em',
                opacity: 0.6, marginBottom: 10,
              }}>MICOZ POINT</div>
              <div style={{ fontFamily: 'var(--serif-en)', fontSize: 30 }}>
                {won(28400).replace('₩ ', '')}
                <span style={{ fontSize: 13, opacity: 0.6, marginLeft: 4 }}>P</span>
              </div>
              <div style={{ marginTop: 20, fontSize: 11, opacity: 0.5 }}>다음 등급까지 ₩ 121,600</div>
              <div style={{ marginTop: 8, height: 2, background: 'rgba(245,241,234,0.18)', overflow: 'hidden' }}>
                <div style={{ width: '62%', height: '100%', background: 'var(--plum-200)' }}/>
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                ['orders', '주문 내역', 12],
                ['returns', '취소 · 교환 · 반품', 2],
                ['wishlist', '찜한 제품', 8],
                ['reviews', '내 리뷰', 4],
                ['address', '배송지 관리', null],
                ['profile', '회원 정보', null],
                ['support', '1:1 문의', null],
              ].map(([k, l, c]) => (
                <li key={k}>
                  <button onClick={() => setTab(k)} style={{
                    display: 'flex', justifyContent: 'space-between', width: '100%',
                    padding: '14px 0', background: 'transparent', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                    borderBottom: '1px solid var(--line)',
                    fontFamily: 'var(--sans)', fontSize: 14,
                    color: tab === k ? 'var(--plum-800)' : 'var(--muted)',
                    fontWeight: tab === k ? 500 : 400,
                  }}>
                    <span>{l}</span>
                    {c !== null && <span style={{ fontFamily: 'var(--serif-en)', fontSize: 12, opacity: 0.7 }}>{c}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div>
            {tab === 'orders' && (
              <div>
                <h3 style={{
                  fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26,
                  margin: '0 0 32px', color: 'var(--plum-800)',
                }}>주문 내역</h3>
                {[
                  ['MZ-26050700428', '2026.05.07', '배송 준비', [PRODUCTS[0], PRODUCTS[2]], 336000],
                  ['MZ-26041200312', '2026.04.12', '배송 완료', [PRODUCTS[1]], 168000],
                  ['MZ-26032800189', '2026.03.28', '배송 완료', [PRODUCTS[3], PRODUCTS[4]], 136000],
                ].map(([no, d, st, items, total]) => (
                  <div key={no} style={{
                    border: '1px solid var(--line)', marginBottom: 16,
                    background: 'var(--paper)',
                  }}>
                    <div style={{
                      padding: '20px 28px', borderBottom: '1px solid var(--line)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <span style={{ fontFamily: 'var(--serif-en)', fontSize: 14, color: 'var(--plum-700)' }}>{no}</span>
                        <span style={{ marginLeft: 14, fontSize: 12, color: 'var(--muted)' }}>{d}</span>
                      </div>
                      <span style={{
                        fontSize: 11, padding: '4px 12px',
                        background: st === '배송 준비' ? 'var(--plum-100)' : 'transparent',
                        border: st === '배송 준비' ? 'none' : '1px solid var(--line-strong)',
                        color: st === '배송 준비' ? 'var(--plum-700)' : 'var(--muted)',
                        letterSpacing: '0.1em',
                      }}>{st}</span>
                    </div>
                    <div style={{ padding: 28 }}>
                      {items.map((p, j) => (
                        <div key={j} style={{
                          display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 16,
                          alignItems: 'center', padding: '8px 0',
                        }}>
                          <div style={{ width: 60, height: 76, background: p.grad }}/>
                          <div>
                            <div style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--plum-800)' }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{p.options[0].label} · 1개</div>
                          </div>
                          <div style={{ fontFamily: 'var(--serif-en)', fontSize: 14 }}>{won(p.price)}</div>
                        </div>
                      ))}
                      <div style={{
                        marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <span style={{ fontSize: 13, color: 'var(--muted)' }}>총 {items.length}개 상품</span>
                        <span style={{ fontFamily: 'var(--serif-en)', fontSize: 18, color: 'var(--plum-800)' }}>{won(total)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'wishlist' && (
              <div>
                <h3 style={{
                  fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26,
                  margin: '0 0 32px', color: 'var(--plum-800)',
                }}>찜한 제품</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
                  {PRODUCTS.slice(0, 6).map(p => (
                    <ProductCard key={p.id} p={p} compact onClick={() => onNav('detail', p)} />
                  ))}
                </div>
              </div>
            )}

            {tab === 'returns' && <ReturnsTab onNav={onNav} />}

            {tab !== 'orders' && tab !== 'wishlist' && tab !== 'returns' && (
              <div style={{
                padding: 80, textAlign: 'center',
                fontFamily: 'var(--serif)', color: 'var(--muted)', fontSize: 16, fontWeight: 300,
                background: 'var(--paper)', border: '1px solid var(--line)',
              }}>
                <div style={{
                  fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em',
                  color: 'var(--plum-500)', marginBottom: 14,
                }}>COMING SECTION</div>
                선택하신 메뉴의 콘텐츠가 여기 표시됩니다.
              </div>
            )}
          </div>
        </div>
      </section>
      <DesktopFooter />
    </main>
  );
}

Object.assign(window, {
  CartDrawer, CheckoutPage, OrderConfirm, StoryPage, MyPage,
});

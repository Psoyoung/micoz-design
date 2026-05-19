// MICOZ — 데스크탑 화면들
// Home, Products, Detail, Cart, Story, MyPage

const { useState: useStateD, useEffect: useEffectD, useMemo: useMemoD } = React;

// ─── 헤더 / 네비게이션 ──────────────────────────────────
function DesktopHeader({ page, nav, cart, onNav, onOpenCart, dark = false }) {
  const fg = dark ? 'var(--cream)' : 'var(--ink)';
  const items = [
    { id: 'home',    label: '홈' },
    { id: 'products',label: '제품' },
    { id: 'story',   label: '브랜드' },
    { id: 'mypage',  label: '마이페이지' },
  ];
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: dark ? 'var(--plum-800)' : 'var(--cream)',
      borderBottom: `1px solid ${dark ? 'rgba(245,241,234,0.10)' : 'var(--line)'}`,
      transition: 'background .35s',
    }}>
      <div style={{
        maxWidth: 1440, margin: '0 auto',
        padding: '0 56px',
        height: 80,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
      }}>
        <nav style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
          {items.map((it) => (
            <button key={it.id} onClick={() => onNav(it.id === 'products' ? 'products' : it.id)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 400,
                letterSpacing: '0.05em', color: fg,
                padding: '4px 0',
                opacity: page === it.id || (it.id === 'products' && (page === 'products' || page === 'detail')) ? 1 : 0.7,
                borderBottom: (page === it.id || (it.id === 'products' && (page === 'products' || page === 'detail')))
                  ? `1px solid ${fg}` : '1px solid transparent',
                transition: 'opacity .2s',
              }}>{it.label}</button>
          ))}
        </nav>

        <button onClick={() => onNav('home')} style={{
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
        }}>
          <MicozLogo size={26} color={fg} />
        </button>

        <div style={{ display: 'flex', gap: 22, alignItems: 'center', justifyContent: 'flex-end', color: fg }}>
          <span style={{ cursor: 'pointer' }}>{Icon.search(18, fg)}</span>
          <span style={{ cursor: 'pointer' }} onClick={() => onNav('login')}>{Icon.user(18, fg)}</span>
          <button onClick={onOpenCart} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            position: 'relative', padding: 4, color: fg,
          }}>
            {Icon.bag(18, fg)}
            {cart.length > 0 && (
              <span style={{
                position: 'absolute', top: -2, right: -4,
                width: 16, height: 16, borderRadius: '50%',
                background: dark ? 'var(--cream)' : 'var(--plum-700)',
                color: dark ? 'var(--plum-700)' : 'var(--cream)',
                fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--serif-en)',
              }}>{cart.reduce((s, i) => s + i.qty, 0)}</span>
            )}
          </button>
          <span style={{
            fontSize: 11, letterSpacing: '0.2em', opacity: 0.6,
            paddingLeft: 16, borderLeft: `1px solid ${dark ? 'rgba(245,241,234,0.18)' : 'var(--line)'}`,
            color: fg,
          }}>KR · KRW</span>
        </div>
      </div>
    </header>
  );
}

// ─── 푸터 ──────────────────────────────────────────────
function DesktopFooter() {
  return (
    <footer style={{
      background: 'var(--plum-900)',
      color: 'var(--plum-100)',
      padding: '80px 56px 40px',
    }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 60,
          paddingBottom: 60, borderBottom: '1px solid rgba(245,237,247,0.12)',
        }}>
          <div>
            <MicozLogo size={28} color="var(--cream)" />
            <p style={{
              marginTop: 28, fontFamily: 'var(--serif)', fontSize: 14, lineHeight: 1.9,
              opacity: 0.7, maxWidth: 280, fontWeight: 300,
            }}>
              깊은 밤, 한 송이 보랏빛 꽃이 피어나듯<br/>
              조용한 의식을 위한 화장품.
            </p>
            <div style={{ marginTop: 36 }}>
              <ThinLink color="var(--cream)" size={11}>뉴스레터 구독</ThinLink>
            </div>
          </div>
          {[
            ['SHOP', ['전체 제품', '에센스', '세럼', '크림', '한정판']],
            ['CARE', ['스킨케어 가이드', '성분 사전', '매장 안내']],
            ['BRAND', ['브랜드 스토리', '저널', '필로소피']],
            ['HELP', ['고객센터', '배송 · 반품', 'FAQ', '문의']],
          ].map(([title, links]) => (
            <div key={title}>
              <div style={{
                fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.3em',
                opacity: 0.5, marginBottom: 24,
              }}>{title}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {links.map((l) => (
                  <li key={l} style={{
                    fontSize: 13, padding: '7px 0', cursor: 'pointer',
                    opacity: 0.85, fontWeight: 300,
                  }}>{l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{
          paddingTop: 32, display: 'flex', justifyContent: 'space-between',
          fontSize: 11, opacity: 0.5, letterSpacing: '0.05em',
        }}>
          <span>© 2026 MICOZ. All rights reserved.</span>
          <span style={{ display: 'flex', gap: 24 }}>
            <span>개인정보처리방침</span><span>이용약관</span><span>사업자정보</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── HOME ──────────────────────────────────────────────
function HomePage({ onNav, onOpenProduct, onAdd }) {
  const { PRODUCTS, COLLECTIONS } = window.MICOZ_DATA;
  const [heroIdx, setHeroIdx] = useStateD(0);
  useEffectD(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % COLLECTIONS.length), 6500);
    return () => clearInterval(t);
  }, []);
  const c = COLLECTIONS[heroIdx];

  return (
    <main style={{ background: 'var(--cream)' }}>
      {/* HERO */}
      <section style={{
        position: 'relative',
        height: 'calc(100vh - 80px)',
        minHeight: 640,
        background: c.grad,
        overflow: 'hidden',
        transition: 'background 1.6s ease',
      }}>
        {/* radial soft */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 70% 40%, rgba(196, 176, 216, 0.18), transparent 60%)',
        }}/>

        <div style={{
          position: 'relative', zIndex: 2, height: '100%',
          maxWidth: 1440, margin: '0 auto', padding: '0 56px',
          display: 'grid', gridTemplateColumns: '1.1fr 1fr', alignItems: 'center', gap: 60,
        }}>
          <div style={{ color: 'var(--cream)' }}>
            <FadeIn key={`tag-${heroIdx}`} delay={50}>
              <div style={{
                fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.5em',
                opacity: 0.7, marginBottom: 28,
              }}>NEW COLLECTION · 2026</div>
            </FadeIn>
            <FadeIn key={`t-${heroIdx}`} delay={150}>
              <h1 style={{
                fontFamily: 'var(--serif)', fontWeight: 300,
                fontSize: 96, lineHeight: 1, letterSpacing: '-0.02em',
                margin: 0, marginBottom: 12,
              }}>
                {c.title}<br/>
                <span style={{ fontFamily: 'var(--serif-en)', fontStyle: 'italic', fontWeight: 200, opacity: 0.65 }}>{c.sub}</span>
              </h1>
            </FadeIn>
            <FadeIn key={`d-${heroIdx}`} delay={300}>
              <p style={{
                fontFamily: 'var(--serif)', fontWeight: 300,
                fontSize: 19, lineHeight: 1.7, opacity: 0.85,
                maxWidth: 460, marginTop: 32, marginBottom: 48,
              }}>{c.desc}. 시간을 머금은 보랏빛 정수가 피부의 결을 천천히 다듬어줍니다.</p>
            </FadeIn>
            <FadeIn key={`b-${heroIdx}`} delay={420}>
              <div style={{ display: 'flex', gap: 20 }}>
                <PrimaryBtn onClick={() => onNav('products')} dark={false} style={{
                  background: 'var(--cream)', color: 'var(--plum-800)', border: 'none',
                }}>컬렉션 보기</PrimaryBtn>
                <button onClick={() => onNav('story')} style={{
                  padding: '14px 28px', background: 'transparent',
                  color: 'var(--cream)', border: '1px solid rgba(245,241,234,0.4)',
                  fontSize: 13, fontFamily: 'var(--sans)', fontWeight: 500,
                  letterSpacing: '0.18em', cursor: 'pointer', textTransform: 'uppercase',
                }}>브랜드 이야기</button>
              </div>
            </FadeIn>
          </div>
          <div style={{ position: 'relative', height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FadeIn key={`p-${heroIdx}`} delay={200} y={20}>
              <div style={{ width: 360, height: 540, position: 'relative' }}>
                <Bottle grad={c.grad} h={540} line={c.sub} shape="tall" />
              </div>
            </FadeIn>
          </div>
        </div>

        {/* hero indicators */}
        <div style={{
          position: 'absolute', bottom: 36, left: 56,
          display: 'flex', gap: 8, alignItems: 'center', zIndex: 3,
        }}>
          {COLLECTIONS.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)} style={{
              width: i === heroIdx ? 32 : 8, height: 1.5,
              background: i === heroIdx ? 'var(--cream)' : 'rgba(245,241,234,0.4)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all .4s',
            }}/>
          ))}
          <span style={{
            marginLeft: 18, fontFamily: 'var(--serif-en)',
            fontSize: 11, color: 'var(--cream)', opacity: 0.6, letterSpacing: '0.15em',
          }}>0{heroIdx + 1} / 0{COLLECTIONS.length}</span>
        </div>

        <div style={{
          position: 'absolute', bottom: 36, right: 56, zIndex: 3,
          color: 'var(--cream)', opacity: 0.6,
          fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.3em',
        }}>
          SCROLL ↓
        </div>
      </section>

      {/* INTRO */}
      <section style={{ padding: '160px 56px 120px' }}>
        <div style={{
          maxWidth: 920, margin: '0 auto', textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.5em',
            color: 'var(--plum-500)', marginBottom: 36,
          }}>PHILOSOPHY</div>
          <h2 style={{
            fontFamily: 'var(--serif)', fontWeight: 300,
            fontSize: 52, lineHeight: 1.35, letterSpacing: '-0.01em',
            margin: 0, color: 'var(--plum-800)',
          }}>
            가장 깊은 보랏빛 안에<br/>
            가장 조용한 회복이 머문다.
          </h2>
          <p style={{
            fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.9,
            color: 'var(--muted)', maxWidth: 620, margin: '40px auto 0', fontWeight: 300,
          }}>
            MICOZ는 한 잔의 차를 우리듯, 시간이 빚어낸 한방 추출의 정수를 한 병에 담습니다.<br/>
            바쁜 하루의 끝에 잠시, 자신을 위한 의식.
          </p>
        </div>
      </section>

      {/* COLLECTIONS GRID */}
      <section style={{ padding: '0 56px 120px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            marginBottom: 56,
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em',
                color: 'var(--plum-500)', marginBottom: 16,
              }}>SIGNATURE LINES</div>
              <h2 style={{
                fontFamily: 'var(--serif)', fontWeight: 300,
                fontSize: 44, margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.01em',
              }}>세 가지 컬렉션</h2>
            </div>
            <ThinLink onClick={() => onNav('products')}>전체 보기 →</ThinLink>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
            {COLLECTIONS.map((col, idx) => (
              <button key={col.id} onClick={() => onNav('products')} style={{
                position: 'relative', height: 540,
                background: col.grad,
                overflow: 'hidden', cursor: 'pointer',
                border: 'none', padding: 0, textAlign: 'left',
                color: 'var(--cream)',
              }}
              onMouseEnter={(e) => { e.currentTarget.querySelector('.col-veil').style.opacity = '0.8'; }}
              onMouseLeave={(e) => { e.currentTarget.querySelector('.col-veil').style.opacity = '0.5'; }}
              >
                <div className="col-veil" style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg, transparent 30%, rgba(20, 12, 30, 0.7) 100%)',
                  transition: 'opacity .5s', opacity: 0.5,
                }}/>
                <div style={{
                  position: 'absolute', top: 32, left: 32,
                  fontFamily: 'var(--serif-en)', fontSize: 12, letterSpacing: '0.4em',
                  opacity: 0.7,
                }}>0{idx + 1}</div>
                <div style={{
                  position: 'absolute', bottom: 36, left: 32, right: 32, zIndex: 2,
                }}>
                  <div style={{
                    fontFamily: 'var(--serif-en)', fontSize: 12, letterSpacing: '0.4em',
                    opacity: 0.7, marginBottom: 14,
                  }}>{col.sub}</div>
                  <div style={{
                    fontFamily: 'var(--serif)', fontSize: 38, fontWeight: 300,
                    marginBottom: 12, letterSpacing: '-0.01em',
                  }}>{col.title}</div>
                  <div style={{ fontSize: 13, opacity: 0.85, fontWeight: 300, lineHeight: 1.6 }}>
                    {col.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* BEST PRODUCTS */}
      <section style={{ padding: '40px 56px 120px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            marginBottom: 56,
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em',
                color: 'var(--plum-500)', marginBottom: 16,
              }}>BESTSELLERS</div>
              <h2 style={{
                fontFamily: 'var(--serif)', fontWeight: 300,
                fontSize: 44, margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.01em',
              }}>가장 사랑받는</h2>
            </div>
            <ThinLink onClick={() => onNav('products')}>모든 제품 →</ThinLink>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
            {PRODUCTS.slice(0, 4).map((p) => (
              <ProductCard key={p.id} p={p}
                onClick={() => onOpenProduct(p)}
                onAdd={onAdd} />
            ))}
          </div>
        </div>
      </section>

      {/* RITUAL BANNER */}
      <section style={{
        padding: '120px 56px',
        background: 'var(--plum-900)',
        color: 'var(--cream)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.5em',
              opacity: 0.6, marginBottom: 28,
            }}>NIGHT RITUAL</div>
            <h2 style={{
              fontFamily: 'var(--serif)', fontWeight: 300,
              fontSize: 56, lineHeight: 1.2, margin: 0, marginBottom: 32,
              letterSpacing: '-0.01em',
            }}>
              밤의 의식<br/>
              <em style={{ fontFamily: 'var(--serif-en)', fontWeight: 200, opacity: 0.7 }}>The Night Ritual</em>
            </h2>
            <p style={{
              fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.9,
              opacity: 0.78, fontWeight: 300, marginBottom: 40,
            }}>
              하루의 흔적을 가만히 닦아내고, 한 방울씩 천천히<br/>
              피부에 머무는 시간을 들이는 일. 다섯 단계의 작은 의식.
            </p>
            <PrimaryBtn dark={false} style={{
              background: 'transparent', color: 'var(--cream)', border: '1px solid var(--cream)',
            }} onClick={() => onNav('story')}>루틴 가이드 →</PrimaryBtn>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[1,2,3,4].map((i, idx) => (
              <div key={i} style={{
                aspectRatio: '1',
                background: [
                  'linear-gradient(150deg, #18102a, #4d3470)',
                  'linear-gradient(160deg, #221638, #6b4d8f)',
                  'linear-gradient(140deg, #3a2552, #9a7fb8)',
                  'linear-gradient(170deg, #4d3470, #c4b0d8)',
                ][idx],
                position: 'relative',
                display: 'flex', alignItems: 'flex-end', padding: 24,
              }}>
                <div>
                  <div style={{
                    fontFamily: 'var(--serif-en)', fontSize: 11,
                    opacity: 0.6, letterSpacing: '0.3em',
                  }}>STEP 0{i}</div>
                  <div style={{
                    fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 300,
                    marginTop: 8,
                  }}>{['클렌징', '토닝', '에센스', '크림'][idx]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DesktopFooter />
    </main>
  );
}

// ─── PRODUCTS LIST ──────────────────────────────────────
function ProductsPage({ onOpenProduct, onAdd }) {
  const { PRODUCTS, CATEGORIES } = window.MICOZ_DATA;
  const [cat, setCat] = useStateD('all');
  const [sort, setSort] = useStateD('featured');

  const filtered = useMemoD(() => {
    let arr = [...PRODUCTS];
    if (cat !== 'all') {
      const map = { essence: '에센스', serum: '세럼', cream: '크림', toner: '토너', mask: '마스크', cleanser: '클렌징' };
      arr = arr.filter(p => p.category === map[cat] || (cat === 'mask' && (p.category === '마스크' || p.category === '미스트' || p.category === '아이케어')));
    }
    if (sort === 'price-asc') arr.sort((a,b) => a.price - b.price);
    if (sort === 'price-desc') arr.sort((a,b) => b.price - a.price);
    if (sort === 'name') arr.sort((a,b) => a.name.localeCompare(b.name, 'ko'));
    return arr;
  }, [cat, sort]);

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Page header */}
      <section style={{
        padding: '80px 56px 64px',
        background: 'linear-gradient(180deg, #f5edf7 0%, var(--cream) 100%)',
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em',
            color: 'var(--plum-500)', marginBottom: 18,
          }}>SHOP · ALL</div>
          <h1 style={{
            fontFamily: 'var(--serif)', fontWeight: 300,
            fontSize: 76, margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.02em',
          }}>제품 전체</h1>
          <p style={{
            fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--muted)',
            marginTop: 20, fontWeight: 300, maxWidth: 540,
          }}>총 {filtered.length}개의 제품 · 모든 제품은 무료배송과 샘플 3종으로 발송됩니다.</p>
        </div>
      </section>

      <section style={{ padding: '40px 56px 120px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 64 }}>
          {/* Sidebar */}
          <aside>
            <div style={{
              fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.3em',
              color: 'var(--muted)', marginBottom: 20, paddingBottom: 16,
              borderBottom: '1px solid var(--line)',
            }}>CATEGORY</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <button onClick={() => setCat(c.id)} style={{
                    display: 'flex', justifyContent: 'space-between', width: '100%',
                    padding: '10px 0', background: 'transparent', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'var(--sans)', fontSize: 14,
                    color: cat === c.id ? 'var(--plum-800)' : 'var(--muted)',
                    fontWeight: cat === c.id ? 500 : 400,
                  }}>
                    <span>{c.name}</span>
                    <span style={{ fontFamily: 'var(--serif-en)', fontSize: 12, opacity: 0.6 }}>({c.count})</span>
                  </button>
                </li>
              ))}
            </ul>

            <div style={{
              fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.3em',
              color: 'var(--muted)', marginTop: 48, marginBottom: 20, paddingBottom: 16,
              borderBottom: '1px solid var(--line)',
            }}>CONCERN</div>
            {['수분', '결 정돈', '탄력', '진정', '광채'].map((t) => (
              <button key={t} style={{
                display: 'block', padding: '8px 0', background: 'transparent', border: 'none',
                cursor: 'pointer', fontSize: 13, color: 'var(--muted)', fontWeight: 300,
              }}>{t}</button>
            ))}
          </aside>

          <div>
            {/* Sort row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 36, paddingBottom: 20, borderBottom: '1px solid var(--line)',
            }}>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{filtered.length}개 제품</div>
              <select value={sort} onChange={(e) => setSort(e.target.value)} style={{
                background: 'transparent', border: 'none', fontFamily: 'var(--sans)',
                fontSize: 13, color: 'var(--ink)', cursor: 'pointer', letterSpacing: '0.05em',
                outline: 'none',
              }}>
                <option value="featured">추천순</option>
                <option value="price-asc">가격 낮은순</option>
                <option value="price-desc">가격 높은순</option>
                <option value="name">이름순</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, rowGap: 64 }}>
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p}
                  onClick={() => onOpenProduct(p)}
                  onAdd={onAdd} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <DesktopFooter />
    </main>
  );
}

// ─── PRODUCT DETAIL ─────────────────────────────────────
function DetailPage({ product, onAdd, onNav }) {
  const { PRODUCTS, won } = window.MICOZ_DATA;
  const [optId, setOptId] = useStateD(product.options[0].id);
  const [qty, setQty] = useStateD(1);
  const [tab, setTab] = useStateD('detail');
  const opt = product.options.find(o => o.id === optId);
  const related = PRODUCTS.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <main style={{ background: 'var(--cream)' }}>
      {/* Breadcrumb */}
      <div style={{
        padding: '24px 56px', maxWidth: 1440, margin: '0 auto',
        fontSize: 12, color: 'var(--muted)', letterSpacing: '0.1em',
      }}>
        <span style={{ cursor: 'pointer' }} onClick={() => onNav('home')}>HOME</span>
        <span style={{ margin: '0 10px', opacity: 0.5 }}>/</span>
        <span style={{ cursor: 'pointer' }} onClick={() => onNav('products')}>SHOP</span>
        <span style={{ margin: '0 10px', opacity: 0.5 }}>/</span>
        <span style={{ color: 'var(--ink)' }}>{product.name}</span>
      </div>

      {/* Detail hero */}
      <section style={{ padding: '20px 56px 80px' }}>
        <div style={{
          maxWidth: 1440, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 80,
        }}>
          {/* left — product image */}
          <div>
            <Bottle grad={product.grad} h={720} line={product.nameEn} shape={product.category === '크림' ? 'jar' : product.category === '토너' ? 'wide' : 'tall'} />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{
                  flex: 1, aspectRatio: '1',
                  background: [
                    product.grad,
                    'linear-gradient(155deg, #4d3470, #c4b0d8)',
                    'linear-gradient(140deg, #18102a, #6b4d8f)',
                    'linear-gradient(170deg, #221638, #9a7fb8)',
                  ][i],
                  border: i === 0 ? '1.5px solid var(--plum-700)' : '1.5px solid transparent',
                  cursor: 'pointer',
                }}/>
              ))}
            </div>
          </div>

          {/* right — info */}
          <div style={{ paddingTop: 32 }}>
            <div style={{
              fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em',
              color: 'var(--plum-500)', marginBottom: 16,
            }}>{product.line.toUpperCase()}</div>

            <h1 style={{
              fontFamily: 'var(--serif)', fontWeight: 300,
              fontSize: 56, margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.01em',
              lineHeight: 1.1,
            }}>{product.name}</h1>
            <div style={{
              fontFamily: 'var(--serif-en)', fontStyle: 'italic',
              fontSize: 18, color: 'var(--muted)', marginTop: 6,
              fontWeight: 300, letterSpacing: '0.05em',
            }}>{product.nameEn}</div>

            <p style={{
              fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.9,
              color: 'var(--ink)', marginTop: 32, fontWeight: 300, marginBottom: 0,
            }}>{product.desc}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 36 }}>
              <span style={{
                fontFamily: 'var(--serif-en)', fontSize: 28, color: 'var(--plum-800)',
              }}>{won(opt.price)}</span>
              <span style={{
                fontSize: 11, padding: '4px 10px', background: 'var(--plum-100)',
                color: 'var(--plum-700)', letterSpacing: '0.15em',
              }}>5% 적립</span>
            </div>

            <div style={{ marginTop: 36, paddingTop: 32, borderTop: '1px solid var(--line)' }}>
              <div style={{
                fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.3em',
                color: 'var(--muted)', marginBottom: 14,
              }}>OPTION · 용량</div>
              <OptionPicker options={product.options} value={optId} onChange={setOptId} />
            </div>

            <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 24 }}>
              <div>
                <div style={{
                  fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.3em',
                  color: 'var(--muted)', marginBottom: 12,
                }}>QUANTITY</div>
                <Counter value={qty} onChange={setQty} />
              </div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{
                  fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.3em',
                  color: 'var(--muted)', marginBottom: 12,
                }}>TOTAL</div>
                <div style={{ fontFamily: 'var(--serif-en)', fontSize: 26, color: 'var(--plum-800)' }}>
                  {won(opt.price * qty)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <PrimaryBtn full size="lg" onClick={() => onAdd(product, opt, qty)}>
                장바구니 담기
              </PrimaryBtn>
              <button style={{
                width: 56, height: 56, background: 'transparent',
                border: '1px solid var(--plum-700)', cursor: 'pointer',
                color: 'var(--plum-700)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{Icon.heart(18)}</button>
            </div>

            <ul style={{
              listStyle: 'none', padding: 0, margin: '36px 0 0',
              fontSize: 13, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <li>· 5만원 이상 구매 시 무료배송 (3-5 영업일 내 도착)</li>
              <li>· 모든 주문에 시그니처 샘플 3종 동봉</li>
              <li>· 미개봉 30일 이내 무료반품</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section style={{ padding: '0 56px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'flex', gap: 48, borderBottom: '1px solid var(--line)',
            marginBottom: 48,
          }}>
            {[['detail', '상세 설명'], ['ingredients', '성분'], ['howto', '사용법'], ['reviews', '리뷰 (286)']].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={{
                padding: '20px 0', background: 'transparent', border: 'none',
                borderBottom: tab === k ? '1.5px solid var(--plum-800)' : '1.5px solid transparent',
                fontFamily: 'var(--sans)', fontSize: 14, fontWeight: tab === k ? 500 : 400,
                color: tab === k ? 'var(--plum-800)' : 'var(--muted)',
                cursor: 'pointer', letterSpacing: '0.05em',
                marginBottom: -1,
              }}>{l}</button>
            ))}
          </div>

          {tab === 'detail' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
              <div style={{
                aspectRatio: '4 / 5',
                background: product.grad,
              }}/>
              <div>
                <div style={{
                  fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em',
                  color: 'var(--plum-500)', marginBottom: 20,
                }}>SIGNATURE INGREDIENT</div>
                <h3 style={{
                  fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 36,
                  margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.01em', lineHeight: 1.3,
                }}>28일의 발효, 보랏빛 정수</h3>
                <p style={{
                  fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.9,
                  color: 'var(--muted)', marginTop: 24, fontWeight: 300,
                }}>
                  자연 발효된 한방 추출물이 피부의 결을 천천히 다듬어줍니다. 깊은 밤 피어나는 보랏빛 꽃잎에서 영감을 얻은 시그니처 컴파운드.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: 32, fontSize: 13, color: 'var(--ink)' }}>
                  {['보랏빛 정수 컴파운드', '자연 발효 28일', '한방 7종 추출', '피부 자극 테스트 완료'].map((t) => (
                    <li key={t} style={{
                      padding: '14px 0', borderBottom: '1px solid var(--line)',
                      display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                      <span style={{ color: 'var(--plum-500)' }}>{Icon.check(14, 'var(--plum-500)')}</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {tab === 'ingredients' && (
            <div style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 2, color: 'var(--ink)', maxWidth: 800, fontWeight: 300 }}>
              정제수, 부틸렌글라이콜, 글리세린, 보라색 작약 추출물, 자색 고구마 발효 추출물, 한방 복합 추출물(인삼·감초·당귀 등 7종), 나이아신아마이드, 아데노신, 판테놀, 스쿠알란, 토코페롤, 시트르산…
            </div>
          )}
          {tab === 'howto' && (
            <ol style={{ paddingLeft: 0, listStyle: 'none', counterReset: 'step', maxWidth: 720 }}>
              {[
                '클렌징 후 토너로 결을 정돈합니다.',
                '본 제품 2-3 방울을 손바닥에 덜어 부드럽게 펴 바릅니다.',
                '얼굴 안쪽에서 바깥쪽으로 천천히 흡수시킵니다.',
                '아침과 저녁, 하루 두 번 사용을 권장합니다.',
              ].map((t, i) => (
                <li key={i} style={{
                  padding: '24px 0', borderBottom: '1px solid var(--line)',
                  display: 'grid', gridTemplateColumns: '60px 1fr', alignItems: 'baseline',
                }}>
                  <span style={{
                    fontFamily: 'var(--serif-en)', fontSize: 22, color: 'var(--plum-500)',
                  }}>0{i + 1}</span>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 300, lineHeight: 1.7 }}>{t}</span>
                </li>
              ))}
            </ol>
          )}
          {tab === 'reviews' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              {[
                ['김**', '결이 차분히 정돈되는 느낌이 좋아요. 향도 은은하고 끈적임 없이 깊이 흡수돼요.', 5],
                ['이**', '발림성이 정말 부드럽고, 다음날 아침 피부가 한결 매끄러워요.', 5],
                ['박**', '용기 디자인부터 향까지 럭셔리합니다. 선물용으로도 좋아요.', 4],
                ['최**', '재구매 의사 100%. 가을 겨울 건조함 잡아주는 데 최고.', 5],
              ].map(([n, t, s], i) => (
                <div key={i} style={{
                  padding: 28, background: 'var(--paper)', border: '1px solid var(--line)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontFamily: 'var(--serif-en)', fontSize: 13, color: 'var(--plum-700)' }}>{'★'.repeat(s)}{'☆'.repeat(5-s)}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{n} · 2026.04.{20+i}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.8, color: 'var(--ink)', margin: 0, fontWeight: 300 }}>{t}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related */}
      <section style={{ padding: '0 56px 120px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em',
            color: 'var(--plum-500)', marginBottom: 16,
          }}>YOU MAY ALSO LIKE</div>
          <h2 style={{
            fontFamily: 'var(--serif)', fontWeight: 300,
            fontSize: 36, margin: 0, marginBottom: 48, color: 'var(--plum-800)',
          }}>함께 추천하는 제품</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
            {related.map((p) => (
              <ProductCard key={p.id} p={p} compact
                onClick={() => onNav('detail', p)}
                onAdd={onAdd} />
            ))}
          </div>
        </div>
      </section>

      <DesktopFooter />
    </main>
  );
}

Object.assign(window, {
  DesktopHeader, DesktopFooter, HomePage, ProductsPage, DetailPage,
});

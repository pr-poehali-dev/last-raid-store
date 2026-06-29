import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const API = 'https://functions.poehali.dev/f6e893f9-0e04-4777-a5bb-77e9307a7a58';

type AdminTab = 'stats' | 'products' | 'users' | 'promos' | 'withdrawals';

interface Product { id: number; name: string; description: string; full_description: string; price: number; category: string; tag: string; icon: string; active: boolean; }
interface User { id: number; steam_id: string; nickname: string; balance: number; total_spent: number; is_banned: boolean; ban_reason: string; purchase_count: number; }
interface Promo { id: number; code: string; discount: number; max_uses: number; used_count: number; active: boolean; expires_at: string | null; }
interface Withdrawal { id: number; user_id: number; nickname: string; amount: number; method: string; details: string; status: string; admin_comment: string; created_at: string; }
interface Stats { total_revenue: number; total_purchases: number; total_users: number; pending_withdrawals: number; active_products: number; }

const CATEGORIES = ['Оружие', 'Снаряжение', 'Транспорт', 'VIP', 'Ресурсы'];
const TAGS = ['NEW', 'TOP', 'OLD'];
const tagLabel: Record<string, string> = { NEW: 'НОВИНКА', TOP: 'ТОП', OLD: 'КЛАССИКА' };
const tagStyle: Record<string, string> = {
  NEW: 'bg-toxic text-background', TOP: 'bg-rust text-foreground',
  OLD: 'bg-secondary text-muted-foreground border border-border',
};

function Input({ label, value, onChange, type = 'text', placeholder = '' }: { label: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-background border border-border px-3 py-2 text-sm clip-corner text-foreground placeholder:text-muted-foreground outline-none focus:border-toxic/50"
      />
    </div>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full bg-background border border-border px-3 py-2 text-sm clip-corner text-foreground placeholder:text-muted-foreground outline-none focus:border-toxic/50 resize-none"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-border px-3 py-2 text-sm clip-corner text-foreground outline-none focus:border-toxic/50"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function AdminPanel() {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token') || '');
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<AdminTab>('stats');
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  // Modal states
  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [userModal, setUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [promoModal, setPromoModal] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: '', discount: '10', max_uses: '0' });
  const [balanceModal, setBalanceModal] = useState(false);
  const [balanceUser, setBalanceUser] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');

  const api = useCallback(async (action: string, method = 'GET', body?: object) => {
    const url = `${API}?action=${action}`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  }, [token]);

  const load = useCallback(async (t: AdminTab) => {
    setLoading(true);
    try {
      if (t === 'stats') setStats(await api('get_stats'));
      if (t === 'products') setProducts(await api('get_products'));
      if (t === 'users') setUsers(await api('get_users'));
      if (t === 'promos') setPromos(await api('get_promos'));
      if (t === 'withdrawals') setWithdrawals(await api('get_withdrawals'));
    } finally { setLoading(false); }
  }, [api]);

  useEffect(() => { if (token) load(tab); }, [token, tab, load]);

  const handleLogin = async () => {
    setLoginError('');
    const res = await fetch(`${API}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: loginInput }),
    });
    const data = await res.json();
    if (data.success) {
      sessionStorage.setItem('admin_token', loginInput);
      setToken(loginInput);
    } else {
      setLoginError('Неверный пароль');
    }
  };

  const logout = () => { sessionStorage.removeItem('admin_token'); setToken(''); };

  // === LOGIN SCREEN ===
  if (!token) {
    return (
      <section className="container py-12 flex justify-center">
        <div className="w-full max-w-sm border border-border bg-card p-8 clip-corner">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 grid place-items-center bg-rust clip-corner">
              <Icon name="ShieldAlert" size={22} className="text-foreground" />
            </div>
            <div>
              <div className="font-display text-xl">Админ панель</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">LAST RAID</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Пароль администратора</label>
              <input
                type="password"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="w-full bg-background border border-border px-3 py-2 text-sm clip-corner text-foreground placeholder:text-muted-foreground outline-none focus:border-toxic/50"
              />
              {loginError && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><Icon name="X" size={12} />{loginError}</p>}
            </div>
            <Button onClick={handleLogin} className="w-full bg-toxic hover:bg-toxic/90 text-background font-display uppercase tracking-wider clip-corner gap-2 glow-toxic">
              <Icon name="LogIn" size={16} />Войти
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const TABS: { key: AdminTab; label: string; icon: string }[] = [
    { key: 'stats', label: 'Статистика', icon: 'BarChart3' },
    { key: 'products', label: 'Товары', icon: 'Package' },
    { key: 'users', label: 'Пользователи', icon: 'Users' },
    { key: 'promos', label: 'Промокоды', icon: 'Tag' },
    { key: 'withdrawals', label: 'Выводы', icon: 'ArrowUpRight' },
  ];

  const saveProduct = async () => {
    if (!editingProduct) return;
    const action = editingProduct.id ? 'update_product' : 'create_product';
    await api(action, 'POST', editingProduct);
    setProductModal(false);
    load('products');
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Удалить товар?')) return;
    await api('delete_product', 'POST', { id });
    load('products');
  };

  const saveUser = async () => {
    if (!editingUser) return;
    await api('update_user', 'POST', editingUser);
    setUserModal(false);
    load('users');
  };

  const addBalance = async () => {
    if (!balanceUser || !balanceAmount) return;
    await api('add_balance', 'POST', { id: balanceUser.id, amount: parseInt(balanceAmount) });
    setBalanceModal(false);
    setBalanceAmount('');
    load('users');
  };

  const createPromo = async () => {
    await api('create_promo', 'POST', { code: newPromo.code, discount: parseInt(newPromo.discount), max_uses: parseInt(newPromo.max_uses) });
    setPromoModal(false);
    setNewPromo({ code: '', discount: '10', max_uses: '0' });
    load('promos');
  };

  const togglePromo = async (id: number) => {
    await api('toggle_promo', 'POST', { id });
    load('promos');
  };

  const deletePromo = async (id: number) => {
    if (!confirm('Удалить промокод?')) return;
    await api('delete_promo', 'POST', { id });
    load('promos');
  };

  const processWithdrawal = async (w: Withdrawal, status: 'approved' | 'rejected') => {
    await api('process_withdrawal', 'POST', { id: w.id, status, amount: w.amount, user_id: w.user_id });
    load('withdrawals');
  };

  return (
    <section className="container py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl md:text-4xl font-bold">Админ панель</h2>
          <span className="px-2 py-0.5 text-[10px] font-display tracking-widest bg-rust/20 text-rust border border-rust/30 clip-corner">ADMIN</span>
        </div>
        <Button onClick={logout} variant="outline" className="border-border clip-corner gap-2 font-display uppercase text-sm">
          <Icon name="LogOut" size={14} />Выйти
        </Button>
      </div>

      {/* Tab nav */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-display uppercase tracking-wider border clip-corner transition-colors ${
              tab === t.key ? 'bg-rust border-rust text-foreground' : 'bg-card/50 border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={t.icon} size={14} />{t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-muted-foreground py-8">
          <Icon name="Loader2" size={20} className="animate-spin text-toxic" />
          <span className="font-display uppercase text-sm tracking-wider">Загрузка...</span>
        </div>
      )}

      {/* ===== STATS ===== */}
      {tab === 'stats' && !loading && stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { label: 'Выручка', value: `${stats.total_revenue.toLocaleString()} ₽`, icon: 'TrendingUp', color: 'text-toxic' },
            { label: 'Покупок', value: stats.total_purchases, icon: 'ShoppingCart', color: 'text-foreground' },
            { label: 'Пользователей', value: stats.total_users, icon: 'Users', color: 'text-foreground' },
            { label: 'Активных товаров', value: stats.active_products, icon: 'Package', color: 'text-foreground' },
            { label: 'Выводов ожидают', value: stats.pending_withdrawals, icon: 'Clock', color: stats.pending_withdrawals > 0 ? 'text-rust' : 'text-foreground' },
          ].map((s) => (
            <div key={s.label} className="border border-border bg-card p-6 clip-corner">
              <Icon name={s.icon} size={24} className="text-muted-foreground mb-3" />
              <div className={`font-display text-3xl mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
            </div>
          ))}
          <div className="border border-border bg-card p-6 clip-corner sm:col-span-2 lg:col-span-1">
            <Icon name="RefreshCw" size={24} className="text-muted-foreground mb-3" />
            <div className="font-display text-xl mb-1">Обновить</div>
            <div className="text-xs text-muted-foreground mb-4">Данные в реальном времени</div>
            <Button onClick={() => load('stats')} className="bg-secondary hover:bg-secondary/80 clip-corner gap-2 font-display uppercase text-sm">
              <Icon name="RefreshCw" size={14} />Обновить
            </Button>
          </div>
        </div>
      )}

      {/* ===== PRODUCTS ===== */}
      {tab === 'products' && !loading && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-xl">Товары магазина</h3>
            <Button onClick={() => { setEditingProduct({ name: '', description: '', full_description: '', price: 500, category: 'Оружие', tag: 'NEW', icon: 'Package', active: true }); setProductModal(true); }}
              className="bg-toxic hover:bg-toxic/90 text-background clip-corner gap-2 font-display uppercase text-sm">
              <Icon name="Plus" size={14} />Добавить товар
            </Button>
          </div>
          <div className="border border-border bg-card clip-corner overflow-hidden">
            <div className="hidden md:grid grid-cols-6 px-5 py-3 border-b border-border bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground">
              <div className="col-span-2">Название</div><div>Категория</div><div>Цена</div><div>Метка</div><div className="text-right">Действия</div>
            </div>
            {products.map((p) => (
              <div key={p.id} className={`grid grid-cols-2 md:grid-cols-6 px-5 py-3 border-b border-border/50 last:border-0 items-center gap-2 ${!p.active ? 'opacity-50' : ''}`}>
                <div className="col-span-2 md:col-span-2">
                  <div className="font-display text-sm">{p.name}</div>
                  {!p.active && <div className="text-xs text-destructive">СКРЫТ</div>}
                </div>
                <div className="text-xs text-muted-foreground hidden md:block">{p.category}</div>
                <div className="font-display text-toxic hidden md:block">{p.price} ₽</div>
                <div className="hidden md:block"><span className={`text-[10px] px-2 py-0.5 clip-corner ${tagStyle[p.tag]}`}>{tagLabel[p.tag]}</span></div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setEditingProduct({ ...p }); setProductModal(true); }}
                    className="h-7 w-7 grid place-items-center border border-border hover:border-toxic/50 clip-corner transition-colors">
                    <Icon name="Pencil" size={12} />
                  </button>
                  <button onClick={() => deleteProduct(p.id)}
                    className="h-7 w-7 grid place-items-center border border-border hover:border-destructive/50 clip-corner transition-colors">
                    <Icon name="Trash2" size={12} className="text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== USERS ===== */}
      {tab === 'users' && !loading && (
        <>
          <h3 className="font-display text-xl mb-4">Пользователи</h3>
          <div className="border border-border bg-card clip-corner overflow-hidden">
            <div className="hidden md:grid grid-cols-5 px-5 py-3 border-b border-border bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground">
              <div className="col-span-2">Игрок</div><div>Баланс</div><div>Потрачено</div><div className="text-right">Действия</div>
            </div>
            {users.map((u) => (
              <div key={u.id} className={`grid grid-cols-2 md:grid-cols-5 px-5 py-3 border-b border-border/50 last:border-0 items-center gap-2 ${u.is_banned ? 'opacity-50' : ''}`}>
                <div className="col-span-2 md:col-span-2">
                  <div className="font-display text-sm flex items-center gap-2">
                    {u.nickname}
                    {u.is_banned && <span className="text-[10px] px-1 bg-destructive/20 text-destructive border border-destructive/30 clip-corner">БАН</span>}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">{u.steam_id}</div>
                </div>
                <div className="font-display text-toxic hidden md:block">{u.balance.toLocaleString()} ₽</div>
                <div className="text-sm text-muted-foreground hidden md:block">{u.total_spent.toLocaleString()} ₽</div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setBalanceUser(u); setBalanceModal(true); }}
                    className="h-7 px-2 text-xs font-display uppercase border border-border hover:border-toxic/50 clip-corner transition-colors text-toxic">
                    +₽
                  </button>
                  <button onClick={() => { setEditingUser({ ...u }); setUserModal(true); }}
                    className="h-7 w-7 grid place-items-center border border-border hover:border-toxic/50 clip-corner transition-colors">
                    <Icon name="Pencil" size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== PROMOS ===== */}
      {tab === 'promos' && !loading && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-xl">Промокоды</h3>
            <Button onClick={() => setPromoModal(true)} className="bg-toxic hover:bg-toxic/90 text-background clip-corner gap-2 font-display uppercase text-sm">
              <Icon name="Plus" size={14} />Создать
            </Button>
          </div>
          <div className="space-y-3 max-w-2xl">
            {promos.length === 0 && <div className="border border-dashed border-border p-8 clip-corner text-center text-muted-foreground text-sm">Промокодов нет</div>}
            {promos.map((p) => (
              <div key={p.id} className={`border border-border bg-card p-4 clip-corner flex items-center gap-4 ${!p.active ? 'opacity-50' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display text-lg text-toxic">{p.code}</span>
                    <span className={`text-[10px] px-2 py-0.5 clip-corner ${p.active ? 'bg-toxic/20 text-toxic border border-toxic/30' : 'bg-secondary text-muted-foreground border border-border'}`}>
                      {p.active ? 'АКТИВЕН' : 'ОТКЛЮЧЁН'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Скидка {p.discount}% · Использований: {p.used_count}{p.max_uses > 0 ? `/${p.max_uses}` : ''}
                    {p.expires_at && ` · До ${new Date(p.expires_at).toLocaleDateString('ru')}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => togglePromo(p.id)}
                    className="h-7 px-2 text-xs font-display uppercase border border-border hover:border-toxic/50 clip-corner transition-colors">
                    {p.active ? 'Выкл' : 'Вкл'}
                  </button>
                  <button onClick={() => deletePromo(p.id)}
                    className="h-7 w-7 grid place-items-center border border-border hover:border-destructive/50 clip-corner transition-colors">
                    <Icon name="Trash2" size={12} className="text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== WITHDRAWALS ===== */}
      {tab === 'withdrawals' && !loading && (
        <>
          <h3 className="font-display text-xl mb-4">Заявки на вывод</h3>
          <div className="space-y-3 max-w-2xl">
            {withdrawals.length === 0 && <div className="border border-dashed border-border p-8 clip-corner text-center text-muted-foreground text-sm">Заявок нет</div>}
            {withdrawals.map((w) => (
              <div key={w.id} className="border border-border bg-card p-4 clip-corner">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="font-display">{w.nickname}</div>
                    <div className="text-xs text-muted-foreground">{w.method} · {w.details}</div>
                    <div className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString('ru')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl text-toxic">{w.amount.toLocaleString()} ₽</div>
                    <span className={`text-[10px] px-2 py-0.5 clip-corner ${
                      w.status === 'pending' ? 'bg-rust/20 text-rust border border-rust/30' :
                      w.status === 'approved' ? 'bg-toxic/20 text-toxic border border-toxic/30' :
                      'bg-destructive/20 text-destructive border border-destructive/30'
                    }`}>{w.status === 'pending' ? 'ОЖИДАЕТ' : w.status === 'approved' ? 'ОДОБРЕН' : 'ОТКЛОНЁН'}</span>
                  </div>
                </div>
                {w.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => processWithdrawal(w, 'approved')}
                      className="bg-toxic/20 hover:bg-toxic/30 text-toxic border border-toxic/40 clip-corner font-display uppercase text-xs gap-1">
                      <Icon name="Check" size={12} />Одобрить
                    </Button>
                    <Button size="sm" onClick={() => processWithdrawal(w, 'rejected')}
                      className="bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 clip-corner font-display uppercase text-xs gap-1">
                      <Icon name="X" size={12} />Отклонить (вернуть средства)
                    </Button>
                  </div>
                )}
                {w.admin_comment && <div className="mt-2 text-xs text-muted-foreground border-t border-border/50 pt-2">Комментарий: {w.admin_comment}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* === Product Modal === */}
      <Dialog open={productModal} onOpenChange={setProductModal}>
        <DialogContent className="bg-card border-border clip-corner max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editingProduct?.id ? 'Редактировать товар' : 'Новый товар'}</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <Input label="Название" value={editingProduct.name || ''} onChange={(v) => setEditingProduct({ ...editingProduct, name: v })} />
              <Input label="Краткое описание" value={editingProduct.description || ''} onChange={(v) => setEditingProduct({ ...editingProduct, description: v })} />
              <Textarea label="Полное описание" value={editingProduct.full_description || ''} onChange={(v) => setEditingProduct({ ...editingProduct, full_description: v })} />
              <Input label="Цена (₽)" type="number" value={editingProduct.price || ''} onChange={(v) => setEditingProduct({ ...editingProduct, price: parseInt(v) || 0 })} />
              <Select label="Категория" value={editingProduct.category || 'Оружие'} onChange={(v) => setEditingProduct({ ...editingProduct, category: v })} options={CATEGORIES} />
              <Select label="Метка" value={editingProduct.tag || 'NEW'} onChange={(v) => setEditingProduct({ ...editingProduct, tag: v })} options={TAGS} />
              <Input label="Иконка (lucide)" value={editingProduct.icon || 'Package'} onChange={(v) => setEditingProduct({ ...editingProduct, icon: v })} placeholder="Package, Shield, Car..." />
              <div className="flex items-center gap-3">
                <input type="checkbox" id="active" checked={editingProduct.active ?? true}
                  onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })}
                  className="h-4 w-4 accent-[hsl(var(--toxic))]" />
                <label htmlFor="active" className="text-sm text-muted-foreground">Товар активен (виден в магазине)</label>
              </div>
              <Button onClick={saveProduct} className="w-full bg-toxic hover:bg-toxic/90 text-background font-display uppercase clip-corner gap-2">
                <Icon name="Check" size={16} />{editingProduct.id ? 'Сохранить' : 'Создать товар'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* === User Edit Modal === */}
      <Dialog open={userModal} onOpenChange={setUserModal}>
        <DialogContent className="bg-card border-border clip-corner max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Редактировать пользователя</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <Input label="Никнейм" value={editingUser.nickname} onChange={(v) => setEditingUser({ ...editingUser, nickname: v })} />
              <Input label="Steam ID" value={editingUser.steam_id} onChange={(v) => setEditingUser({ ...editingUser, steam_id: v })} />
              <Input label="Баланс (₽)" type="number" value={editingUser.balance} onChange={(v) => setEditingUser({ ...editingUser, balance: parseInt(v) || 0 })} />
              <div className="flex items-center gap-3">
                <input type="checkbox" id="banned" checked={editingUser.is_banned}
                  onChange={(e) => setEditingUser({ ...editingUser, is_banned: e.target.checked })}
                  className="h-4 w-4 accent-red-500" />
                <label htmlFor="banned" className="text-sm text-muted-foreground">Заблокировать пользователя</label>
              </div>
              {editingUser.is_banned && (
                <Input label="Причина бана" value={editingUser.ban_reason || ''} onChange={(v) => setEditingUser({ ...editingUser, ban_reason: v })} placeholder="Причина блокировки..." />
              )}
              <Button onClick={saveUser} className="w-full bg-toxic hover:bg-toxic/90 text-background font-display uppercase clip-corner gap-2">
                <Icon name="Check" size={16} />Сохранить
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* === Add Balance Modal === */}
      <Dialog open={balanceModal} onOpenChange={setBalanceModal}>
        <DialogContent className="bg-card border-border clip-corner max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Пополнить баланс</DialogTitle>
          </DialogHeader>
          {balanceUser && (
            <div className="space-y-4">
              <div className="border border-border bg-background/50 p-3 clip-corner">
                <div className="font-display">{balanceUser.nickname}</div>
                <div className="text-sm text-muted-foreground">Текущий баланс: <span className="text-toxic">{balanceUser.balance.toLocaleString()} ₽</span></div>
              </div>
              <Input label="Сумма пополнения (₽)" type="number" value={balanceAmount} onChange={setBalanceAmount} placeholder="500" />
              <Button onClick={addBalance} className="w-full bg-toxic hover:bg-toxic/90 text-background font-display uppercase clip-corner gap-2">
                <Icon name="Plus" size={16} />Пополнить
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* === Create Promo Modal === */}
      <Dialog open={promoModal} onOpenChange={setPromoModal}>
        <DialogContent className="bg-card border-border clip-corner max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Новый промокод</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input label="Код" value={newPromo.code} onChange={(v) => setNewPromo({ ...newPromo, code: v.toUpperCase() })} placeholder="SUMMER25" />
            <Input label="Скидка (%)" type="number" value={newPromo.discount} onChange={(v) => setNewPromo({ ...newPromo, discount: v })} />
            <Input label="Макс. использований (0 = безлимит)" type="number" value={newPromo.max_uses} onChange={(v) => setNewPromo({ ...newPromo, max_uses: v })} />
            <Button onClick={createPromo} className="w-full bg-toxic hover:bg-toxic/90 text-background font-display uppercase clip-corner gap-2">
              <Icon name="Plus" size={16} />Создать промокод
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

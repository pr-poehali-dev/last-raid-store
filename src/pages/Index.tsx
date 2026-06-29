import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import AdminPanel from '@/components/AdminPanel';

const HERO = 'https://cdn.poehali.dev/projects/7414a8b7-2ca5-4b12-953c-308219850e86/files/d1c103bc-6f72-4bf7-abd7-819adc14fe1c.jpg';

type Tag = 'NEW' | 'OLD' | 'TOP';
type Section = 'Главная' | 'Магазин' | 'О сервере' | 'Тех поддержка' | 'Правила' | 'Рейтинги' | 'Админ панель';

interface Product { id: number; name: string; desc: string; full: string; price: number; tag: Tag; category: string; icon: string; }
interface CartItem extends Product { qty: number; }
interface Ticket { id: number; title: string; category: string; text: string; status: string; date: string; }

const NAV: Section[] = ['Главная', 'Магазин', 'О сервере', 'Тех поддержка', 'Правила', 'Рейтинги', 'Админ панель'];
const CATEGORIES = ['Все', 'Оружие', 'Снаряжение', 'Транспорт', 'VIP', 'Ресурсы'];

const PRODUCTS: Product[] = [
  { id: 1, name: 'M4A1 Custom', desc: 'Штурмовая винтовка с полным обвесом', full: 'Полностью укомплектованная M4A1: коллиматор, глушитель, расширенный магазин на 60 патронов и 300 единиц боезапаса 5.56мм. Выдаётся мгновенно в инвентарь после покупки.', price: 890, tag: 'TOP', category: 'Оружие', icon: 'Crosshair' },
  { id: 2, name: 'Набор выживальщика', desc: 'Палатка, еда, аптечки, инструменты', full: 'Стартовый набор для базы: палатка 4x4, 10 банок тушёнки, 5 аптечек, набор инструментов и канистра топлива. Идеально для старта на сервере.', price: 450, tag: 'NEW', category: 'Снаряжение', icon: 'Backpack' },
  { id: 3, name: 'УАЗ-469 Военный', desc: 'Полноприводный внедорожник', full: 'Военный УАЗ с полным баком, запасным колесом и канистрой. Спавнится в безопасной зоне рядом с вашей последней точкой выхода. Ключи выдаются автоматически.', price: 1500, tag: 'TOP', category: 'Транспорт', icon: 'Car' },
  { id: 4, name: 'VIP статус — 30 дней', desc: 'Приоритет в очереди, метка на карте', full: 'VIP-доступ на 30 дней: приоритетный вход на сервер, личная метка на карте, +20% к лимиту инвентаря и закрытый Discord-канал.', price: 700, tag: 'TOP', category: 'VIP', icon: 'Crown' },
  { id: 5, name: 'Mosin 9130', desc: 'Снайперская винтовка + оптика', full: 'Классическая винтовка Мосина с оптическим прицелом ПУ и 80 патронами 7.62x54. Лучший выбор для дальнего боя на Chernarus 2035.', price: 520, tag: 'OLD', category: 'Оружие', icon: 'Crosshair' },
  { id: 6, name: 'Ящик ресурсов', desc: 'Доски, гвозди, металл для базы', full: 'Строительный набор: 50 досок, 200 гвоздей, 20 листов металла и 10 мешков с цементом. Всё для постройки неприступной базы.', price: 380, tag: 'NEW', category: 'Ресурсы', icon: 'Package' },
  { id: 7, name: 'Бронежилет Plate', desc: 'Тяжёлая броня + шлем', full: 'Комплект защиты: бронежилет с керамическими плитами, тактический шлем и наколенники. Снижает урон от пуль на 40%.', price: 640, tag: 'TOP', category: 'Снаряжение', icon: 'Shield' },
  { id: 8, name: 'Вертолёт Mi-8', desc: 'Транспортный вертолёт', full: 'Легендарный Ми-8 с полным баком. Спавнится на закрытом ангаре. Требует уровень доступа 5+. Самый быстрый способ перемещения по карте.', price: 4200, tag: 'NEW', category: 'Транспорт', icon: 'Plane' },
];

const RULES = [
  { n: '1', title: 'Читерство запрещено', text: 'Использование любых читов, макросов, дюп-багов — бан без предупреждения.' },
  { n: '2', title: 'Уважение к игрокам', text: 'Оскорбления, харассмент и дискриминация в чате недопустимы.' },
  { n: '3', title: 'Стройка в безопасных зонах', text: 'Возводить базы ближе 500м от спауна запрещено.' },
  { n: '4', title: 'Захват лута администрации', text: 'Попытки взломать серверные контейнеры — перманентный бан.' },
  { n: '5', title: 'Гридинг спавна', text: 'Убийство игроков в стартовой зоне (1 км от спауна) запрещено.' },
  { n: '6', title: 'Реклама других серверов', text: 'Реклама иных серверов в любом чате — немедленный бан.' },
];

const RATINGS = [
  { rank: 1, name: 'ShadowWalker_RU', kills: 347, playtime: '218ч', level: 42 },
  { rank: 2, name: 'DarkSniper', kills: 289, playtime: '189ч', level: 38 },
  { rank: 3, name: 'ZombieKiller99', kills: 256, playtime: '204ч', level: 35 },
  { rank: 4, name: 'Survival_Pro', kills: 198, playtime: '156ч', level: 29 },
  { rank: 5, name: 'LastManStanding', kills: 187, playtime: '143ч', level: 27 },
  { rank: 6, name: 'RaidBoss_2035', kills: 154, playtime: '121ч', level: 24 },
  { rank: 7, name: 'NightHunter', kills: 132, playtime: '98ч', level: 21 },
  { rank: 8, name: 'GhostSniper_X', kills: 119, playtime: '87ч', level: 19 },
];

const tagStyle: Record<Tag, string> = {
  NEW: 'bg-toxic text-background',
  TOP: 'bg-rust text-foreground',
  OLD: 'bg-secondary text-muted-foreground border border-border',
};
const tagLabel: Record<Tag, string> = { NEW: 'НОВИНКА', TOP: 'ТОП', OLD: 'КЛАССИКА' };

function Monitoring() {
  return (
    <div className="border border-border bg-card/80 backdrop-blur clip-corner relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
        <div className="h-full w-1/3 bg-toxic/70 animate-scan" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
        <div className="p-4 flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-toxic animate-pulse-dot shrink-0" />
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Статус</div>
            <div className="font-display text-toxic text-lg">ONLINE</div>
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">Игроки</div>
          <div className="font-display text-lg">0 / 60</div>
        </div>
        <div className="p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">Карта</div>
          <div className="font-display text-lg">Chernarus 2035</div>
        </div>
        <div className="p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">IP сервера</div>
          <div className="font-display text-lg text-rust">109.248.4.139:2302</div>
        </div>
      </div>
    </div>
  );
}

const Index = () => {
  const [active, setActive] = useState<Section>('Главная');
  const [category, setCategory] = useState('Все');
  const [selected, setSelected] = useState<Product | null>(null);
  const [buyConfirmed, setBuyConfirmed] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCheckout, setCartCheckout] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);
  const [steamLogin, setSteamLogin] = useState(false);
  const [steamUser, setSteamUser] = useState<string | null>(null);
  const [ipCopied, setIpCopied] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketForm, setTicketForm] = useState({ title: '', category: 'Общие вопросы', text: '' });
  const [ticketSent, setTicketSent] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const filtered = category === 'Все' ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartFinal = promoApplied ? Math.round(cartTotal * 0.9) : cartTotal;

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const ex = prev.find((x) => x.id === p.id);
      if (ex) return prev.map((x) => x.id === p.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { ...p, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) => setCart((prev) => prev.filter((x) => x.id !== id));
  const changeQty = (id: number, delta: number) => setCart((prev) =>
    prev.map((x) => x.id === id ? { ...x, qty: Math.max(1, x.qty + delta) } : x)
  );

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'LASTRAID10') { setPromoApplied(true); setPromoError(false); }
    else { setPromoError(true); setPromoApplied(false); }
  };

  const handleSteamLogin = () => {
    setSteamUser('ShadowWalker_RU');
    setSteamLogin(false);
  };

  const copyIp = () => {
    navigator.clipboard.writeText('109.248.4.139:2302');
    setIpCopied(true);
    setTimeout(() => setIpCopied(false), 2000);
  };

  const openProduct = (p: Product) => { setSelected(p); setBuyConfirmed(false); };

  const submitTicket = () => {
    if (!ticketForm.title || !ticketForm.text) return;
    setTickets((prev) => [...prev, {
      id: prev.length + 1,
      title: ticketForm.title,
      category: ticketForm.category,
      text: ticketForm.text,
      status: 'Открыт',
      date: new Date().toLocaleDateString('ru'),
    }]);
    setTicketForm({ title: '', category: 'Общие вопросы', text: '' });
    setTicketSent(true);
  };

  const navigate = (s: Section) => { setActive(s); setMobileMenu(false); };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16 gap-4">
          <button onClick={() => navigate('Главная')} className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 grid place-items-center bg-rust clip-corner">
              <Icon name="Skull" size={20} className="text-foreground" />
            </div>
            <div className="leading-none text-left">
              <div className="font-display text-xl tracking-widest">LAST RAID</div>
              <div className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase">DayZ Standalone</div>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((item) => (
              <button
                key={item}
                onClick={() => navigate(item)}
                className={`px-3 py-2 text-sm font-display uppercase tracking-wider transition-colors ${
                  active === item ? 'text-toxic' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative h-10 w-10 grid place-items-center border border-border bg-card/50 hover:border-toxic/50 clip-corner transition-colors"
            >
              <Icon name="ShoppingCart" size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 grid place-items-center bg-rust text-foreground text-[10px] font-display rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {steamUser ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 border border-toxic/40 bg-toxic/10 clip-corner">
                <Icon name="User" size={14} className="text-toxic" />
                <span className="text-sm font-display text-toxic">{steamUser}</span>
              </div>
            ) : (
              <Button
                onClick={() => setSteamLogin(true)}
                className="bg-secondary hover:bg-secondary/80 text-foreground border border-border clip-corner gap-2"
              >
                <Icon name="Gamepad2" size={16} />
                <span className="hidden sm:inline">Войти через Steam</span>
              </Button>
            )}

            {/* Mobile burger */}
            <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden h-10 w-10 grid place-items-center border border-border bg-card/50 clip-corner">
              <Icon name={mobileMenu ? 'X' : 'Menu'} size={18} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="lg:hidden border-t border-border bg-background/95 px-4 pb-4">
            {NAV.map((item) => (
              <button
                key={item}
                onClick={() => navigate(item)}
                className={`block w-full text-left px-3 py-3 text-sm font-display uppercase tracking-wider border-b border-border/50 transition-colors ${
                  active === item ? 'text-toxic' : 'text-muted-foreground'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ===== ГЛАВНАЯ ===== */}
      {active === 'Главная' && (
        <>
          <section className="relative">
            <div className="absolute inset-0 scanlines">
              <img src={HERO} alt="LAST RAID" className="w-full h-full object-cover opacity-40" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/40 to-background" />
            <div className="container relative py-16 md:py-24">
              <div className="inline-flex items-center gap-2 border border-toxic/40 bg-toxic/10 px-3 py-1 mb-6 clip-corner">
                <span className="h-2 w-2 rounded-full bg-toxic animate-pulse-dot" />
                <span className="text-xs uppercase tracking-widest text-toxic">Сервер активен</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-none mb-4">
                LAST RAID
                <span className="block text-rust text-3xl md:text-4xl mt-2">Выживи или умри</span>
              </h1>
              <p className="max-w-xl text-muted-foreground text-lg mb-8">
                Хардкорный сервер DayZ Standalone на карте Chernarus 2035. Автоматическая выдача товаров,
                честный PvP и активная админ-команда. Заходи и докажи, что выживешь.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => navigate('Магазин')}
                  className="bg-toxic hover:bg-toxic/90 text-background font-display uppercase tracking-wider clip-corner gap-2 glow-toxic"
                >
                  <Icon name="ShoppingCart" size={18} />
                  В магазин
                </Button>
                <Button
                  variant="outline"
                  onClick={copyIp}
                  className="border-border bg-card/50 hover:bg-card font-display uppercase tracking-wider clip-corner gap-2"
                >
                  <Icon name={ipCopied ? 'Check' : 'Copy'} size={18} className={ipCopied ? 'text-toxic' : ''} />
                  {ipCopied ? 'Скопировано!' : '109.248.4.139:2302'}
                </Button>
              </div>
              <div className="mt-12"><Monitoring /></div>
            </div>
          </section>

          <section className="container py-12 border-t border-border">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: 'Map', title: 'Chernarus 2035', text: 'Обновлённая карта с новыми военными базами и зонами высокого риска.' },
                { icon: 'Users', title: '60 слотов', text: 'Оптимальное население для насыщенного, но не перегруженного PvP.' },
                { icon: 'ShieldCheck', title: 'Защита от читеров', text: 'Активный анти-чит и круглосуточный мониторинг администрацией.' },
              ].map((f) => (
                <div key={f.title} className="border border-border bg-card/60 p-6 clip-corner">
                  <Icon name={f.icon} size={28} className="text-rust mb-3" />
                  <h3 className="font-display text-xl mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.text}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ===== МАГАЗИН ===== */}
      {active === 'Магазин' && (
        <section className="container py-12">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Магазин</h2>
              <p className="text-muted-foreground">Автоматическая выдача товара прямо на сервере</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Zap" size={16} className="text-toxic" />
              Мгновенная доставка в игру
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 text-sm font-display uppercase tracking-wider border clip-corner transition-colors ${
                  category === c ? 'bg-rust border-rust text-foreground' : 'bg-card/50 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((p, i) => (
              <div
                key={p.id}
                style={{ animationDelay: `${i * 60}ms` }}
                className="group border border-border bg-card clip-corner overflow-hidden flex flex-col opacity-0 animate-fade-in hover:border-toxic/50 transition-colors"
              >
                <div className="relative h-36 bg-gradient-to-br from-secondary to-background grid place-items-center overflow-hidden">
                  <Icon name={p.icon} size={56} className="text-muted-foreground group-hover:text-toxic group-hover:scale-110 transition-all" fallback="Box" />
                  <span className={`absolute top-3 left-3 px-2 py-0.5 text-[10px] font-display tracking-widest clip-corner ${tagStyle[p.tag]}`}>
                    {tagLabel[p.tag]}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{p.category}</div>
                  <h3 className="font-display text-lg mb-1 leading-tight">{p.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">{p.desc}</p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-display text-xl text-toxic">{p.price} <span className="text-sm text-muted-foreground">₽</span></div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => addToCart(p)} className="h-8 w-8 p-0 border-border clip-corner hover:border-toxic/50">
                        <Icon name="Plus" size={14} />
                      </Button>
                      <Button size="sm" onClick={() => openProduct(p)} className="bg-secondary hover:bg-rust text-foreground font-display uppercase tracking-wider clip-corner text-xs px-3">
                        Купить
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== О СЕРВЕРЕ ===== */}
      {active === 'О сервере' && (
        <section className="container py-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">О сервере</h2>
          <p className="text-muted-foreground mb-10">Всё, что нужно знать о LAST RAID</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="border border-border bg-card p-6 clip-corner">
                <h3 className="font-display text-xl mb-4 text-toxic">Характеристики</h3>
                {[
                  ['Карта', 'Chernarus 2035'],
                  ['Слоты', '60 игроков'],
                  ['IP', '109.248.4.139:2302'],
                  ['Рестарты', 'Каждые 6 часов'],
                  ['PvP зоны', 'Вся карта'],
                  ['Базы', 'Разрешены'],
                  ['Версия', 'DayZ 1.24'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground text-sm">{k}</span>
                    <span className="font-display text-sm">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="border border-border bg-card p-6 clip-corner">
                <h3 className="font-display text-xl mb-4 text-rust">Описание</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  LAST RAID — хардкорный сервер выживания в постапокалиптическом мире Черноруссии 2035 года. Здесь нет места слабым: каждый лут добыт потом и кровью, каждая база — это крепость, построенная руками выживших.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Активная экономика, торговля между игроками, ивенты каждые выходные и живая администрация — мы создаём атмосферу настоящего выживания.
                </p>
                <Button onClick={copyIp} className="bg-toxic/20 hover:bg-toxic/30 text-toxic border border-toxic/40 clip-corner gap-2 font-display uppercase text-sm">
                  <Icon name="Copy" size={16} />
                  Скопировать IP
                </Button>
              </div>
              <div className="border border-border bg-card p-6 clip-corner">
                <h3 className="font-display text-xl mb-3 text-rust">Особенности</h3>
                <ul className="space-y-2">
                  {['Кастомные военные базы', 'Уникальное оружие', 'Торговые зоны (нейтральные)', 'Еженедельные ивенты', 'Авто-бекапы баз', 'Анти-чит EAC+'].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="CheckCircle" size={14} className="text-toxic shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== ТЕХ ПОДДЕРЖКА ===== */}
      {active === 'Тех поддержка' && (
        <section className="container py-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Тех поддержка</h2>
          <p className="text-muted-foreground mb-10">Создайте тикет — мы ответим в течение 24 часов</p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Form */}
            <div className="border border-border bg-card p-6 clip-corner">
              {ticketSent ? (
                <div className="text-center py-8 animate-scale-in">
                  <div className="h-16 w-16 mx-auto grid place-items-center bg-toxic/15 border border-toxic clip-corner mb-4">
                    <Icon name="Check" size={32} className="text-toxic" />
                  </div>
                  <h3 className="font-display text-xl mb-2">Тикет создан</h3>
                  <p className="text-muted-foreground text-sm mb-6">Мы ответим вам в ближайшее время.</p>
                  <Button onClick={() => setTicketSent(false)} className="bg-secondary hover:bg-secondary/80 clip-corner font-display uppercase tracking-wider">
                    Создать ещё
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-display text-xl text-toxic">Новый тикет</h3>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Категория</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      className="w-full bg-background border border-border px-3 py-2 text-sm clip-corner text-foreground"
                    >
                      {['Общие вопросы', 'Проблемы с покупкой', 'Баг на сервере', 'Жалоба на игрока', 'Другое'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Тема</label>
                    <input
                      value={ticketForm.title}
                      onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                      placeholder="Краткое описание проблемы"
                      className="w-full bg-background border border-border px-3 py-2 text-sm clip-corner text-foreground placeholder:text-muted-foreground outline-none focus:border-toxic/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Описание</label>
                    <textarea
                      value={ticketForm.text}
                      onChange={(e) => setTicketForm({ ...ticketForm, text: e.target.value })}
                      placeholder="Опишите проблему подробно..."
                      rows={5}
                      className="w-full bg-background border border-border px-3 py-2 text-sm clip-corner text-foreground placeholder:text-muted-foreground outline-none focus:border-toxic/50 resize-none"
                    />
                  </div>
                  <Button
                    onClick={submitTicket}
                    disabled={!ticketForm.title || !ticketForm.text}
                    className="w-full bg-toxic hover:bg-toxic/90 text-background font-display uppercase tracking-wider clip-corner gap-2 disabled:opacity-40"
                  >
                    <Icon name="Send" size={16} />
                    Отправить тикет
                  </Button>
                </div>
              )}
            </div>

            {/* Ticket list */}
            <div>
              <h3 className="font-display text-lg mb-4 text-muted-foreground uppercase tracking-wider">Мои тикеты</h3>
              {tickets.length === 0 ? (
                <div className="border border-border border-dashed bg-card/30 p-10 clip-corner text-center text-muted-foreground">
                  <Icon name="Inbox" size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Тикетов пока нет</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((t) => (
                    <div key={t.id} className="border border-border bg-card p-4 clip-corner">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-display text-sm">{t.title}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-toxic/20 text-toxic border border-toxic/30 clip-corner">{t.status}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{t.category} · {t.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== ПРАВИЛА ===== */}
      {active === 'Правила' && (
        <section className="container py-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Правила сервера</h2>
          <p className="text-muted-foreground mb-10">Нарушение правил ведёт к бану без предупреждения</p>
          <div className="space-y-3 max-w-3xl">
            {RULES.map((r) => (
              <div key={r.n} className="border border-border bg-card p-5 clip-corner flex gap-4">
                <div className="font-display text-3xl text-rust/40 leading-none shrink-0 w-8">{r.n}</div>
                <div>
                  <h3 className="font-display text-lg mb-1">{r.title}</h3>
                  <p className="text-muted-foreground text-sm">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 border border-rust/30 bg-rust/10 p-5 clip-corner max-w-3xl">
            <div className="flex gap-3">
              <Icon name="AlertTriangle" size={20} className="text-rust shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">Администрация оставляет за собой право дополнять правила. Незнание правил не освобождает от ответственности. По спорным вопросам обращайтесь в тех. поддержку.</p>
            </div>
          </div>
        </section>
      )}

      {/* ===== РЕЙТИНГИ ===== */}
      {active === 'Рейтинги' && (
        <section className="container py-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Рейтинги</h2>
          <p className="text-muted-foreground mb-10">Лучшие выжившие LAST RAID</p>
          <div className="max-w-2xl border border-border bg-card clip-corner overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-border bg-secondary/50">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">#</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Игрок</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground text-center">Убийства</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground text-right">Уровень</div>
            </div>
            {RATINGS.map((r) => (
              <div key={r.rank} className={`grid grid-cols-4 gap-4 px-5 py-4 border-b border-border/50 last:border-0 ${r.rank <= 3 ? 'bg-card' : ''}`}>
                <div className={`font-display text-lg ${r.rank === 1 ? 'text-yellow-400' : r.rank === 2 ? 'text-zinc-400' : r.rank === 3 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}
                </div>
                <div>
                  <div className="font-display text-sm">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.playtime}</div>
                </div>
                <div className="text-center font-display text-toxic">{r.kills}</div>
                <div className="text-right font-display text-rust">{r.level}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">Рейтинг обновляется каждые 24 часа</p>
        </section>
      )}

      {/* ===== АДМИН ПАНЕЛЬ ===== */}
      {active === 'Админ панель' && <AdminPanel />}

      {/* Footer */}
      <footer className="border-t border-border bg-background/80 mt-8">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icon name="Skull" size={20} className="text-rust" />
            <span className="font-display tracking-widest">LAST RAID</span>
            <span className="text-muted-foreground text-sm">© 2035 DayZ Standalone Server</span>
          </div>
          <div className="flex gap-4 text-muted-foreground">
            <Icon name="MessageCircle" size={20} className="hover:text-toxic cursor-pointer transition-colors" />
            <Icon name="Send" size={20} className="hover:text-toxic cursor-pointer transition-colors" />
            <Icon name="Youtube" size={20} className="hover:text-toxic cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>

      {/* === Purchase Modal === */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="bg-card border-border clip-corner max-w-lg">
          {selected && !buyConfirmed && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl flex items-center gap-3">
                  <Icon name={selected.icon} size={28} className="text-toxic" fallback="Box" />
                  {selected.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <span className={`inline-block px-2 py-0.5 text-[10px] font-display tracking-widest clip-corner ${tagStyle[selected.tag]}`}>
                  {tagLabel[selected.tag]}
                </span>
                <p className="text-muted-foreground">{selected.full}</p>
                <div className="border border-border bg-background/50 p-4 clip-corner space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Категория</span><span>{selected.category}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Выдача</span><span className="text-toxic">Автоматическая</span></div>
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-muted-foreground">Итого</span>
                    <span className="font-display text-2xl text-toxic">{selected.price} ₽</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => { addToCart(selected); setSelected(null); }} variant="outline" className="flex-1 border-border clip-corner font-display uppercase text-sm gap-2">
                    <Icon name="ShoppingCart" size={16} />
                    В корзину
                  </Button>
                  <Button onClick={() => setBuyConfirmed(true)} className="flex-1 bg-toxic hover:bg-toxic/90 text-background font-display uppercase tracking-wider clip-corner gap-2 glow-toxic">
                    <Icon name="Check" size={18} />
                    Купить сейчас
                  </Button>
                </div>
              </div>
            </>
          )}
          {selected && buyConfirmed && (
            <div className="py-6 text-center animate-scale-in">
              <div className="h-16 w-16 mx-auto grid place-items-center bg-toxic/15 border border-toxic clip-corner mb-4">
                <Icon name="Check" size={32} className="text-toxic" />
              </div>
              <h3 className="font-display text-2xl mb-2">Покупка оформлена</h3>
              <p className="text-muted-foreground mb-6">«{selected.name}» будет автоматически выдан вам на сервере после входа в игру.</p>
              <Button onClick={() => setSelected(null)} className="bg-secondary hover:bg-secondary/80 clip-corner font-display uppercase tracking-wider">
                Отлично
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* === Cart Drawer === */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="bg-card border-border clip-corner max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-3">
              <Icon name="ShoppingCart" size={24} className="text-toxic" />
              Корзина
              {cartCount > 0 && <Badge className="bg-rust text-foreground font-display">{cartCount}</Badge>}
            </DialogTitle>
          </DialogHeader>

          {!cartCheckout ? (
            <>
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                  <Icon name="ShoppingCart" size={48} className="text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Корзина пуста</p>
                  <Button onClick={() => { setCartOpen(false); navigate('Магазин'); }} className="mt-4 bg-secondary clip-corner font-display uppercase text-sm">
                    Перейти в магазин
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="border border-border bg-background/50 p-3 clip-corner flex items-center gap-3">
                        <div className="h-10 w-10 grid place-items-center bg-secondary clip-corner shrink-0">
                          <Icon name={item.icon} size={20} className="text-muted-foreground" fallback="Box" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-display text-sm truncate">{item.name}</div>
                          <div className="text-xs text-toxic">{item.price} ₽</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => changeQty(item.id, -1)} className="h-6 w-6 grid place-items-center border border-border clip-corner hover:border-toxic/50">
                            <Icon name="Minus" size={10} />
                          </button>
                          <span className="font-display w-6 text-center text-sm">{item.qty}</span>
                          <button onClick={() => changeQty(item.id, 1)} className="h-6 w-6 grid place-items-center border border-border clip-corner hover:border-toxic/50">
                            <Icon name="Plus" size={10} />
                          </button>
                        </div>
                        <div className="font-display text-sm w-16 text-right text-toxic">{item.price * item.qty} ₽</div>
                        <button onClick={() => removeFromCart(item.id)} className="h-6 w-6 grid place-items-center hover:text-destructive transition-colors shrink-0">
                          <Icon name="X" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-border pt-4 space-y-3">
                    {/* Promo */}
                    <div className="flex gap-2">
                      <input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Промокод"
                        className="flex-1 bg-background border border-border px-3 py-2 text-sm clip-corner text-foreground placeholder:text-muted-foreground outline-none focus:border-toxic/50"
                      />
                      <Button onClick={applyPromo} variant="outline" className="border-border clip-corner font-display uppercase text-sm">
                        Применить
                      </Button>
                    </div>
                    {promoApplied && <p className="text-xs text-toxic flex items-center gap-1"><Icon name="Check" size={12} /> Промокод применён — скидка 10%</p>}
                    {promoError && <p className="text-xs text-destructive flex items-center gap-1"><Icon name="X" size={12} /> Неверный промокод</p>}

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Итого:</span>
                      <div className="text-right">
                        {promoApplied && <div className="text-xs line-through text-muted-foreground">{cartTotal} ₽</div>}
                        <div className="font-display text-2xl text-toxic">{cartFinal} ₽</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setCartCheckout(true)}
                      className="w-full bg-toxic hover:bg-toxic/90 text-background font-display uppercase tracking-wider clip-corner gap-2 glow-toxic"
                    >
                      <Icon name="CreditCard" size={18} />
                      Оформить заказ
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-6 text-center animate-scale-in">
              <div className="h-16 w-16 mx-auto grid place-items-center bg-toxic/15 border border-toxic clip-corner mb-4">
                <Icon name="Check" size={32} className="text-toxic" />
              </div>
              <h3 className="font-display text-2xl mb-2">Заказ принят!</h3>
              <p className="text-muted-foreground mb-2">Товары на сумму <span className="text-toxic font-display">{cartFinal} ₽</span> оформлены.</p>
              <p className="text-muted-foreground text-sm mb-6">Все предметы будут автоматически выданы после входа на сервер.</p>
              <Button onClick={() => { setCart([]); setCartOpen(false); setCartCheckout(false); setPromoApplied(false); setPromoCode(''); }}
                className="bg-secondary hover:bg-secondary/80 clip-corner font-display uppercase tracking-wider">
                Отлично
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* === Steam Login Modal === */}
      <Dialog open={steamLogin} onOpenChange={setSteamLogin}>
        <DialogContent className="bg-card border-border clip-corner max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-3">
              <Icon name="Gamepad2" size={22} className="text-toxic" />
              Вход через Steam
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">Авторизация через Steam позволяет автоматически привязать покупки к вашему аккаунту на сервере.</p>
            <div className="border border-border bg-background/50 p-4 clip-corner space-y-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Icon name="Check" size={14} className="text-toxic" />Автоматическая выдача товаров</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Icon name="Check" size={14} className="text-toxic" />История покупок</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Icon name="Check" size={14} className="text-toxic" />Привязка к персонажу</div>
            </div>
            <Button onClick={handleSteamLogin} className="w-full bg-[#1b2838] hover:bg-[#2a3f5f] text-white border border-[#4c6b8a]/50 clip-corner gap-2 font-display uppercase">
              <Icon name="Gamepad2" size={18} />
              Войти через Steam
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
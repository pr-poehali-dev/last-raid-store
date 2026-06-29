import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const HERO = 'https://cdn.poehali.dev/projects/7414a8b7-2ca5-4b12-953c-308219850e86/files/d1c103bc-6f72-4bf7-abd7-819adc14fe1c.jpg';

type Tag = 'NEW' | 'OLD' | 'TOP';

interface Product {
  id: number;
  name: string;
  desc: string;
  full: string;
  price: number;
  tag: Tag;
  category: string;
  icon: string;
}

const NAV = ['Главная', 'Магазин', 'О сервере', 'Тех поддержка', 'Правила', 'Рейтинги', 'Админ панель'];

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
  const [active, setActive] = useState('Главная');
  const [category, setCategory] = useState('Все');
  const [selected, setSelected] = useState<Product | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const filtered = category === 'Все' ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);

  const openProduct = (p: Product) => {
    setSelected(p);
    setConfirmed(false);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="container flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 grid place-items-center bg-rust clip-corner">
              <Icon name="Skull" size={20} className="text-foreground" />
            </div>
            <div className="leading-none">
              <div className="font-display text-xl tracking-widest">LAST RAID</div>
              <div className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase">DayZ Standalone</div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((item) => (
              <button
                key={item}
                onClick={() => setActive(item)}
                className={`px-3 py-2 text-sm font-display uppercase tracking-wider transition-colors ${
                  active === item ? 'text-toxic' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <Button className="bg-secondary hover:bg-secondary/80 text-foreground border border-border clip-corner gap-2 shrink-0">
            <Icon name="Gamepad2" size={16} />
            <span className="hidden sm:inline">Войти через Steam</span>
          </Button>
        </div>
      </header>

      {/* Hero */}
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
              onClick={() => setActive('Магазин')}
              className="bg-toxic hover:bg-toxic/90 text-background font-display uppercase tracking-wider clip-corner gap-2 glow-toxic"
            >
              <Icon name="ShoppingCart" size={18} />
              В магазин
            </Button>
            <Button
              variant="outline"
              className="border-border bg-card/50 hover:bg-card font-display uppercase tracking-wider clip-corner gap-2"
            >
              <Icon name="Copy" size={18} />
              109.248.4.139:2302
            </Button>
          </div>

          <div className="mt-12">
            <Monitoring />
          </div>
        </div>
      </section>

      {/* Shop */}
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

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 text-sm font-display uppercase tracking-wider border clip-corner transition-colors ${
                category === c
                  ? 'bg-rust border-rust text-foreground'
                  : 'bg-card/50 border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
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
                <div className="flex items-center justify-between">
                  <div className="font-display text-xl text-toxic">{p.price} <span className="text-sm text-muted-foreground">₽</span></div>
                  <Button
                    size="sm"
                    onClick={() => openProduct(p)}
                    className="bg-secondary hover:bg-rust text-foreground font-display uppercase tracking-wider clip-corner"
                  >
                    Купить
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
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

      {/* Footer */}
      <footer className="border-t border-border bg-background/80">
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

      {/* Purchase Modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="bg-card border-border clip-corner max-w-lg">
          {selected && !confirmed && (
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
                    <span className="text-muted-foreground">Итого к оплате</span>
                    <span className="font-display text-2xl text-toxic">{selected.price} ₽</span>
                  </div>
                </div>
                <Button
                  onClick={() => setConfirmed(true)}
                  className="w-full bg-toxic hover:bg-toxic/90 text-background font-display uppercase tracking-wider clip-corner gap-2 glow-toxic"
                >
                  <Icon name="Check" size={18} />
                  Подтвердить покупку
                </Button>
              </div>
            </>
          )}
          {selected && confirmed && (
            <div className="py-6 text-center animate-scale-in">
              <div className="h-16 w-16 mx-auto grid place-items-center bg-toxic/15 border border-toxic clip-corner mb-4">
                <Icon name="Check" size={32} className="text-toxic" />
              </div>
              <h3 className="font-display text-2xl mb-2">Покупка оформлена</h3>
              <p className="text-muted-foreground mb-6">
                «{selected.name}» будет автоматически выдан вам на сервере в течение минуты после входа в игру.
              </p>
              <Button onClick={() => setSelected(null)} className="bg-secondary hover:bg-secondary/80 clip-corner font-display uppercase tracking-wider">
                Отлично
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;


CREATE TABLE IF NOT EXISTS t_p47510967_last_raid_store.products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  full_description TEXT,
  price INTEGER NOT NULL,
  category VARCHAR(100) NOT NULL,
  tag VARCHAR(20) DEFAULT 'NEW',
  icon VARCHAR(100) DEFAULT 'Package',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p47510967_last_raid_store.users (
  id SERIAL PRIMARY KEY,
  steam_id VARCHAR(100) UNIQUE NOT NULL,
  nickname VARCHAR(255) NOT NULL,
  balance INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p47510967_last_raid_store.purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p47510967_last_raid_store.users(id),
  product_id INTEGER REFERENCES t_p47510967_last_raid_store.products(id),
  product_name VARCHAR(255),
  price INTEGER NOT NULL,
  qty INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p47510967_last_raid_store.promos (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  discount INTEGER NOT NULL,
  max_uses INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p47510967_last_raid_store.withdrawals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p47510967_last_raid_store.users(id),
  nickname VARCHAR(255),
  amount INTEGER NOT NULL,
  method VARCHAR(100) NOT NULL,
  details TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  admin_comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO t_p47510967_last_raid_store.products (name, description, full_description, price, category, tag, icon) VALUES
('M4A1 Custom', 'Штурмовая винтовка с полным обвесом', 'Полностью укомплектованная M4A1: коллиматор, глушитель, расширенный магазин на 60 патронов и 300 единиц боезапаса 5.56мм.', 890, 'Оружие', 'TOP', 'Crosshair'),
('Набор выживальщика', 'Палатка, еда, аптечки, инструменты', 'Стартовый набор для базы: палатка 4x4, 10 банок тушёнки, 5 аптечек, набор инструментов и канистра топлива.', 450, 'Снаряжение', 'NEW', 'Backpack'),
('УАЗ-469 Военный', 'Полноприводный внедорожник', 'Военный УАЗ с полным баком, запасным колесом и канистрой. Спавнится в безопасной зоне.', 1500, 'Транспорт', 'TOP', 'Car'),
('VIP статус — 30 дней', 'Приоритет в очереди, метка на карте', 'VIP-доступ на 30 дней: приоритетный вход, личная метка на карте, +20% к лимиту инвентаря.', 700, 'VIP', 'TOP', 'Crown'),
('Mosin 9130', 'Снайперская винтовка + оптика', 'Классическая винтовка Мосина с оптическим прицелом ПУ и 80 патронами 7.62x54.', 520, 'Оружие', 'OLD', 'Crosshair'),
('Ящик ресурсов', 'Доски, гвозди, металл для базы', 'Строительный набор: 50 досок, 200 гвоздей, 20 листов металла и 10 мешков с цементом.', 380, 'Ресурсы', 'NEW', 'Package'),
('Бронежилет Plate', 'Тяжёлая броня + шлем', 'Комплект защиты: бронежилет с керамическими плитами, тактический шлем и наколенники.', 640, 'Снаряжение', 'TOP', 'Shield'),
('Вертолёт Mi-8', 'Транспортный вертолёт', 'Легендарный Ми-8 с полным баком. Спавнится на закрытом ангаре. Требует уровень доступа 5+.', 4200, 'Транспорт', 'NEW', 'Plane')
ON CONFLICT DO NOTHING;

INSERT INTO t_p47510967_last_raid_store.promos (code, discount, max_uses, active) VALUES
('LASTRAID10', 10, 0, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO t_p47510967_last_raid_store.users (steam_id, nickname, balance, total_spent) VALUES
('76561198000000001', 'ShadowWalker_RU', 1200, 5400),
('76561198000000002', 'DarkSniper', 800, 3200),
('76561198000000003', 'ZombieKiller99', 450, 1890),
('76561198000000004', 'Survival_Pro', 200, 980),
('76561198000000005', 'LastManStanding', 0, 750)
ON CONFLICT DO NOTHING;

INSERT INTO t_p47510967_last_raid_store.withdrawals (user_id, nickname, amount, method, details, status) VALUES
(1, 'ShadowWalker_RU', 3200, 'ЮМани', '410011234567890', 'pending'),
(2, 'DarkSniper', 1800, 'USDT', 'TRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'pending')
ON CONFLICT DO NOTHING;

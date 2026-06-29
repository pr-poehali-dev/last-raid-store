"""
Единый API для админ панели LAST RAID.
Методы: auth, products CRUD, users, promos, withdrawals.
"""

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p47510967_last_raid_store')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def ok(data):
    return {'statusCode': 200, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, default=str)}

def err(msg, code=400):
    return {'statusCode': code, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg})}

def check_auth(event):
    token = event.get('headers', {}).get('X-Admin-Token', '')
    return token == os.environ.get('ADMIN_PASSWORD', '')

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    # === AUTH (не требует токена) ===
    if action == 'login':
        password = body.get('password', '')
        if password == os.environ.get('ADMIN_PASSWORD', ''):
            return ok({'success': True, 'token': password})
        return err('Неверный пароль', 401)

    # Все остальные — требуют токен
    if not check_auth(event):
        return err('Unauthorized', 401)

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # === PRODUCTS ===
        if action == 'get_products':
            cur.execute('SELECT * FROM ' + SCHEMA + '.products ORDER BY id')
            return ok(cur.fetchall())

        if action == 'create_product':
            cur.execute(
                'INSERT INTO ' + SCHEMA + '''.products (name, description, full_description, price, category, tag, icon, active)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING *''',
                (body['name'], body.get('description',''), body.get('full_description',''),
                 body['price'], body['category'], body.get('tag','NEW'), body.get('icon','Package'), True)
            )
            conn.commit()
            return ok(cur.fetchone())

        if action == 'update_product':
            pid = body['id']
            cur.execute(
                'UPDATE ' + SCHEMA + '''.products SET name=%s, description=%s, full_description=%s,
                    price=%s, category=%s, tag=%s, icon=%s, active=%s WHERE id=%s RETURNING *''',
                (body['name'], body.get('description',''), body.get('full_description',''),
                 body['price'], body['category'], body.get('tag','NEW'), body.get('icon','Package'),
                 body.get('active', True), pid)
            )
            conn.commit()
            return ok(cur.fetchone())

        if action == 'delete_product':
            cur.execute('DELETE FROM ' + SCHEMA + '.products WHERE id=%s', (body['id'],))
            conn.commit()
            return ok({'success': True})

        # === USERS ===
        if action == 'get_users':
            cur.execute('''
                SELECT u.*, COUNT(p.id) as purchase_count
                FROM ''' + SCHEMA + '''.users u
                LEFT JOIN ''' + SCHEMA + '''.purchases p ON p.user_id = u.id
                GROUP BY u.id ORDER BY u.total_spent DESC
            ''')
            return ok(cur.fetchall())

        if action == 'update_user':
            uid = body['id']
            cur.execute(
                'UPDATE ' + SCHEMA + '.users SET nickname=%s, balance=%s, is_banned=%s, ban_reason=%s WHERE id=%s RETURNING *',
                (body['nickname'], body['balance'], body.get('is_banned', False), body.get('ban_reason', ''), uid)
            )
            conn.commit()
            return ok(cur.fetchone())

        if action == 'add_balance':
            cur.execute(
                'UPDATE ' + SCHEMA + '.users SET balance = balance + %s WHERE id=%s RETURNING *',
                (body['amount'], body['id'])
            )
            conn.commit()
            return ok(cur.fetchone())

        if action == 'get_purchases':
            uid = params.get('user_id')
            if uid:
                cur.execute('SELECT * FROM ' + SCHEMA + '.purchases WHERE user_id=%s ORDER BY created_at DESC', (uid,))
            else:
                cur.execute('SELECT * FROM ' + SCHEMA + '.purchases ORDER BY created_at DESC LIMIT 100')
            return ok(cur.fetchall())

        # === PROMOS ===
        if action == 'get_promos':
            cur.execute('SELECT * FROM ' + SCHEMA + '.promos ORDER BY id DESC')
            return ok(cur.fetchall())

        if action == 'create_promo':
            cur.execute(
                'INSERT INTO ' + SCHEMA + '''.promos (code, discount, max_uses, active, expires_at)
                    VALUES (%s,%s,%s,%s,%s) RETURNING *''',
                (body['code'].upper(), body['discount'], body.get('max_uses', 0),
                 True, body.get('expires_at') or None)
            )
            conn.commit()
            return ok(cur.fetchone())

        if action == 'toggle_promo':
            cur.execute(
                'UPDATE ' + SCHEMA + '.promos SET active = NOT active WHERE id=%s RETURNING *',
                (body['id'],)
            )
            conn.commit()
            return ok(cur.fetchone())

        if action == 'delete_promo':
            cur.execute('DELETE FROM ' + SCHEMA + '.promos WHERE id=%s', (body['id'],))
            conn.commit()
            return ok({'success': True})

        # === WITHDRAWALS ===
        if action == 'get_withdrawals':
            cur.execute('SELECT * FROM ' + SCHEMA + '.withdrawals ORDER BY created_at DESC')
            return ok(cur.fetchall())

        if action == 'process_withdrawal':
            status = body['status']
            cur.execute(
                'UPDATE ' + SCHEMA + '.withdrawals SET status=%s, admin_comment=%s WHERE id=%s RETURNING *',
                (status, body.get('comment', ''), body['id'])
            )
            row = cur.fetchone()
            if status == 'rejected':
                cur.execute(
                    'UPDATE ' + SCHEMA + '.users SET balance = balance + %s WHERE id=%s',
                    (body['amount'], body['user_id'])
                )
            conn.commit()
            return ok(row)

        # === STATS ===
        if action == 'get_stats':
            cur.execute('SELECT COUNT(*) as cnt, COALESCE(SUM(price*qty),0) as revenue FROM ' + SCHEMA + '.purchases')
            purchases = cur.fetchone()
            cur.execute('SELECT COUNT(*) as cnt FROM ' + SCHEMA + '.users')
            users_cnt = cur.fetchone()
            cur.execute("SELECT COUNT(*) as cnt FROM " + SCHEMA + ".withdrawals WHERE status='pending'")
            pending_w = cur.fetchone()
            cur.execute('SELECT COUNT(*) as cnt FROM ' + SCHEMA + '.products WHERE active=TRUE')
            prod_cnt = cur.fetchone()
            return ok({
                'total_revenue': int(purchases['revenue']),
                'total_purchases': int(purchases['cnt']),
                'total_users': int(users_cnt['cnt']),
                'pending_withdrawals': int(pending_w['cnt']),
                'active_products': int(prod_cnt['cnt']),
            })

        return err('Unknown action')

    finally:
        cur.close()
        conn.close()

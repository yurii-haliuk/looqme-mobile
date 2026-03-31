0) Scope і принципи

Що входить у цю адмінку

Адмінка покриває лише адміністративні налаштування організації (org-level settings) і не проектує доменну логіку аналітики, ключових слів, клієнтів/проєктів тощо.

В межах цієї адмінки проектуємо такі розділи:

Account overview (стан акаунту)

Users (користувачі) + Roles (ролі)

Integrations (існуючий модуль у MVP, в адмінці — інтеграція/вбудовування + контроль доступу)

Billing (підписка/оплата/інвойси)

Documents (договір/рахунки/акти — автоматично підтягуються)

Data & Limits (ліміти й використання)

Security (2FA статуси)

Audit log (лог входів і дій)

Що НЕ входить

Проєкти/клієнти/групування ключових слів

CRUD ключових слів у межах адмінки (лише контроль права)

Модуль алертів Slack/Telegram як продуктова логіка (це інший модуль)

Базові принципи

Єдиний workspace на org. Немає багатьох workspace/клієнтів на рівні білінгу.

User має read доступ до всіх розділів адмінки, включно з білінгом, інвойсами, документами, аудитом.

User також може робити read-дії: download invoices/documents, export users/audit/limits.

Admin має всі write-дії: керування юзерами, інтеграціями, оплатою, налаштуваннями.

Попередження/нотифікації відображаються глобально у хедері (вже є) — адмінка повинна підв’язати коректні CTA.

1) Сутності та поняття (мінімальна модель)

Organization (Org)

id

name

plan_id / plan_name

subscription_status (active/trial/past_due/canceled)

renewal_date

limits (mentions, ai_coding, ai_assistants, pages, keywords)

usage (mentions_used, ai_coding_used, ai_assistants_used, pages_used, keywords_count)

User

id

email

full_name (опційно)

role (Admin | User)

status (Invited | Active | Suspended | Removed)

last_seen_at

invited_at

activated_at

suspended_at

two_fa_enabled (bool)

Seats

seats_total

seats_used = count(Active users)

invited_users НЕ споживають seats

Integrations

модуль інтеграцій уже існує (MVP). Адмінка використовує його як готовий блок.

Billing

payment_method (masked)

invoices list

auto_renew flag

add-ons (якщо є)

Documents

document: id, type (Contract/Invoice/Act/Other), number/title, date, period, status, url

документи з’являються автоматично (read-only)

Audit Event

timestamp (UTC)

actor_user_id

action_type

object_type

object_id (опційно)

summary/details

ip (для auth і чутливих)

user_agent (для auth і чутливих)

before/after (diff) (де доречно)

source (ui/api/integration) (опційно)

Retention: 180 днів.

2) Інформаційна архітектура (розділи та навігація)

Глобальні елементи

Header:

Назва org / контекст

Глобальні попередження (badge + dropdown)

Доступ до профілю

Side navigation (або вкладки):

Account

Users

Roles

Integrations

Billing

Documents

Data & Limits

Security

Audit

Правила видимості дій

Для ролі User:

усі сторінки доступні

всі write-кнопки приховані або disabled з поясненням “Only admins can …”

Для ролі Admin:

доступні всі дії
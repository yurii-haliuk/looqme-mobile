Users — вимоги

Список користувачів

Колонки/поля:

Name (опційно)

Email

Role (Admin/User)

Status (Active/Invited/Suspended)

2FA (on/off)

Last seen

Функції:

Search (email/name)

Filters: role, status, 2FA

Sort: last seen, email

Запрошення користувача (Invite flow A)

Модель: invite email → set password.

Дії Admin:

Invite user:

email (required)

role (required)

optional fields (name, etc.) — не блокують інвайт

Resend invite

Revoke invite (скасувати токен)

Стани:

Invited: відправлено

Active: прийняв інвайт і створив пароль

Suspended: доступ заблоковано

Seats правило

seats_used = count(Active)

Invited не споживає seat

Під час активації:

якщо seats доступні → activation success

якщо seats закінчились → activation blocked + upsell

Upsell при досягненні seat limit

На Users екрані показати seats: X/Y

Якщо seats_used == seats_total:

“Add user” веде в upsell modal

пояснення + CTA на Billing/Upgrade

Керування користувачами

Admin actions:

Change role (Admin ↔ User)

Suspend / Reactivate

Remove user

Правила:

не можна зняти роль Admin у останнього Admin

не можна видалити/заблокувати останнього Admin без переведення іншого в Admin

Експорт

Export users (CSV) доступний і Admin, і User

Export поважає фільтри

Експорт логувати в audit
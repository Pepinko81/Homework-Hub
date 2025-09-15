/*
  # Create demo data for testing

  1. Demo Data
    - Create demo courses
    - Create demo lectures  
    - Create demo assignments
  2. Security
    - Ensure RLS policies work with demo data
*/

-- Insert demo courses
INSERT INTO courses (id, name, description, code, created_by, is_active, start_date, end_date) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Уеб програмиране', 'Основи на HTML, CSS и JavaScript', 'WEB101', (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1), true, '2024-01-15', '2024-06-15'),
('550e8400-e29b-41d4-a716-446655440002', 'React разработка', 'Модерни React приложения', 'REACT201', (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1), true, '2024-02-01', '2024-07-01'),
('550e8400-e29b-41d4-a716-446655440003', 'AI и машинно обучение', 'Въведение в изкуствения интелект', 'AI301', (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1), true, '2024-03-01', '2024-08-01')
ON CONFLICT (id) DO NOTHING;

-- Insert demo lectures
INSERT INTO lectures (id, course_id, title, description, lecture_number, date) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'HTML основи', 'Въведение в HTML структурата', 1, '2024-01-20'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'CSS стилизиране', 'Основи на CSS и дизайн', 2, '2024-01-27'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'React компоненти', 'Създаване на React компоненти', 1, '2024-02-05'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'AI промптинг', 'Как да пишем ефективни промпти', 1, '2024-03-05')
ON CONFLICT (id) DO NOTHING;

-- Insert demo assignments
INSERT INTO assignments (id, lecture_id, title, description, instructions, due_date, max_points, status, allow_late_submission, created_by) VALUES
(
  '770e8400-e29b-41d4-a716-446655440001', 
  '660e8400-e29b-41d4-a716-446655440001', 
  'Създайте лична уеб страница', 
  'Използвайте AI за създаване на лична уеб страница с HTML и CSS',
  'Използвайте ChatGPT, Claude или друг AI инструмент за създаване на лична уеб страница. Страницата трябва да съдържа:
- Header с вашето име
- Секция "За мен" 
- Секция с умения
- Контакти
- Модерен CSS дизайн

Опишете подробно промпта който сте използвали и качете линк към готовата страница.',
  '2024-12-31 23:59:00',
  100,
  'published',
  true,
  (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)
),
(
  '770e8400-e29b-41d4-a716-446655440002', 
  '660e8400-e29b-41d4-a716-446655440002', 
  'CSS Grid Layout', 
  'Създайте responsive layout с CSS Grid използвайки AI помощ',
  'Използвайте AI инструмент за създаване на responsive уеб страница с CSS Grid. Изискванията са:
- Grid layout с header, sidebar, main content, footer
- Responsive дизайн за мобилни устройства  
- Минимум 3 различни grid области
- Модерни цветове и типография

Опишете промпта и споделете резултата.',
  '2025-01-15 23:59:00',
  80,
  'published',
  false,
  (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)
),
(
  '770e8400-e29b-41d4-a716-446655440003', 
  '660e8400-e29b-41d4-a716-446655440003', 
  'React Todo App', 
  'Създайте Todo приложение с React използвайки AI асистент',
  'Използвайте AI за създаване на функционално Todo приложение с React. Функционалности:
- Добавяне на нови задачи
- Маркиране като завършени
- Изтриване на задачи
- Филтриране (всички/активни/завършени)
- Local storage за запазване

Документирайте промпта и споделете GitHub repo или CodePen.',
  '2025-01-20 23:59:00',
  120,
  'published',
  true,
  (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)
),
(
  '770e8400-e29b-41d4-a716-446655440004', 
  '660e8400-e29b-41d4-a716-446655440004', 
  'AI Промпт оптимизация', 
  'Експериментирайте с различни промпт техники',
  'Изберете сложна задача (например създаване на игра, сложен алгоритъм, или дизайн система) и експериментирайте с различни промпт техники:
- Базов промпт
- Промпт с примери (few-shot)
- Стъпка по стъпка инструкции
- Ролеви промпт (act as expert)

Сравнете резултатите и анализирайте кой подход работи най-добре.',
  '2025-01-25 23:59:00',
  100,
  'published',
  true,
  (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;
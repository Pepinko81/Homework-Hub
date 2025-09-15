/* 
Complete Database Setup for Vibe Homework
1. New Tables
   - profiles - User profiles with roles
   - courses - Course information
   - lectures - Lecture content for courses
   - assignments - Assignments for lectures
   - course_enrollments - Student enrollments
   - submissions - Student assignment submissions

2. Security
   - Enable RLS on all tables
   - Add policies for proper access control

3. Demo Data
   - Create demo users and sample data
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    full_name text NOT NULL,
    role text CHECK (role IN ('student', 'teacher', 'admin')) DEFAULT 'student',
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    code text UNIQUE NOT NULL,
    created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
    is_active boolean DEFAULT true,
    start_date timestamptz,
    end_date timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create lectures table
CREATE TABLE IF NOT EXISTS lectures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    lecture_number integer NOT NULL,
    date timestamptz,
    materials_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lecture_id uuid REFERENCES lectures(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text NOT NULL,
    instructions text,
    due_date timestamptz NOT NULL,
    max_points integer DEFAULT 100,
    status text CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    allow_late_submission boolean DEFAULT false,
    created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create course_enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
    student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    enrolled_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    UNIQUE(course_id, student_id)
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE,
    student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    file_url text,
    file_name text,
    file_size integer,
    file_type text,
    prompt_text text NOT NULL,
    prompt_analysis text,
    grade integer,
    max_points integer,
    feedback text,
    status text CHECK (status IN ('submitted', 'graded', 'returned')) DEFAULT 'submitted',
    submitted_at timestamptz DEFAULT now(),
    graded_at timestamptz,
    graded_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(assignment_id, student_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DO $$ 
BEGIN
    -- Profiles policies
    DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    
    -- Courses policies
    DROP POLICY IF EXISTS "Anyone can read active courses" ON courses;
    DROP POLICY IF EXISTS "Teachers can manage own courses" ON courses;
    
    -- Lectures policies
    DROP POLICY IF EXISTS "Anyone can read lectures" ON lectures;
    DROP POLICY IF EXISTS "Teachers can manage lectures" ON lectures;
    
    -- Assignments policies
    DROP POLICY IF EXISTS "Anyone can read published assignments" ON assignments;
    DROP POLICY IF EXISTS "Teachers can manage assignments" ON assignments;
    
    -- Course enrollments policies
    DROP POLICY IF EXISTS "Students can read own enrollments" ON course_enrollments;
    DROP POLICY IF EXISTS "Students can enroll themselves" ON course_enrollments;
    
    -- Submissions policies
    DROP POLICY IF EXISTS "Students can manage own submissions" ON submissions;
    DROP POLICY IF EXISTS "Teachers can read submissions for their assignments" ON submissions;
    DROP POLICY IF EXISTS "Teachers can update grades" ON submissions;
END $$;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Courses policies
CREATE POLICY "Anyone can read active courses" ON courses FOR SELECT USING (is_active = true);
CREATE POLICY "Teachers can manage own courses" ON courses FOR ALL USING (created_by IN (
    SELECT id FROM profiles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
));

-- Lectures policies
CREATE POLICY "Anyone can read lectures" ON lectures FOR SELECT USING (true);
CREATE POLICY "Teachers can manage lectures" ON lectures FOR ALL USING (course_id IN (
    SELECT id FROM courses WHERE created_by IN (
        SELECT id FROM profiles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
    )
));

-- Assignments policies
CREATE POLICY "Anyone can read published assignments" ON assignments FOR SELECT USING (status = 'published');
CREATE POLICY "Teachers can manage assignments" ON assignments FOR ALL USING (created_by IN (
    SELECT id FROM profiles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
));

-- Course enrollments policies
CREATE POLICY "Students can read own enrollments" ON course_enrollments FOR SELECT USING (student_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
));
CREATE POLICY "Students can enroll themselves" ON course_enrollments FOR INSERT WITH CHECK (student_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'student'
));

-- Submissions policies
CREATE POLICY "Students can manage own submissions" ON submissions FOR ALL USING (student_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
));
CREATE POLICY "Teachers can read submissions for their assignments" ON submissions FOR SELECT USING (assignment_id IN (
    SELECT a.id 
    FROM assignments a 
    JOIN lectures l ON a.lecture_id = l.id 
    JOIN courses c ON l.course_id = c.id 
    WHERE c.created_by IN (
        SELECT id FROM profiles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
    )
));
CREATE POLICY "Teachers can update grades" ON submissions FOR UPDATE USING (assignment_id IN (
    SELECT a.id 
    FROM assignments a 
    JOIN lectures l ON a.lecture_id = l.id 
    JOIN courses c ON l.course_id = c.id 
    WHERE c.created_by IN (
        SELECT id FROM profiles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
    )
));
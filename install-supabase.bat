@echo off
echo Установка Supabase и удаление MongoDB зависимостей...
npm install @supabase/supabase-js
npm uninstall mongoose mongodb
echo Готово! Теперь выполните SQL из supabase-schema.sql в вашем проекте Supabase.
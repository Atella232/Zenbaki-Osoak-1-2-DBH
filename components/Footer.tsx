import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark py-10 px-10">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
          <div className="size-6 text-primary">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor"></path>
            </svg>
          </div>
          <span className="font-bold text-lg">Zenbaki Osoen Abentura</span>
        </div>
        <div className="flex gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a className="hover:text-primary transition-colors" href="#">Irakasleentzat</a>
          <a className="hover:text-primary transition-colors" href="#">Laguntza</a>
          <a className="hover:text-primary transition-colors" href="#">Pribatutasuna</a>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-500">© 2023 DBH Matematika</p>
      </div>
    </footer>
  );
};
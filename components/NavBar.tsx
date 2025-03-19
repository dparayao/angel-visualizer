"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();
  
  return (
    <nav className="flex justify-center mt-4">
      <ul className="flex space-x-8">
        <li>
          <Link 
            href="/" 
            className={`text-xl px-4 py-2 rounded-md transition-colors ${
              pathname === '/' 
                ? 'bg-blue-400 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            style={{ fontFamily: 'var(--font-nintendo-ds)' }}
          >
            Home
          </Link>
        </li>
        <li>
          <Link 
            href="/about" 
            className={`text-xl px-4 py-2 rounded-md transition-colors ${
              pathname === '/about' 
                ? 'bg-blue-400 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            style={{ fontFamily: 'var(--font-nintendo-ds)' }}
          >
            About
          </Link>
        </li>
        <li>
          <Link 
            href="/analysis" 
            className={`text-xl px-4 py-2 rounded-md transition-colors ${
              pathname === '/analysis' 
                ? 'bg-blue-400 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            style={{ fontFamily: 'var(--font-nintendo-ds)' }}
          >
            Analysis
          </Link>
        </li>
      </ul>
    </nav>
  );
}
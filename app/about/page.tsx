"use client";

import React from 'react';
import Link from 'next/link';
import NavBar from '../../components/NavBar';

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="p-4 bg-gray-900">
        <h1 className="text-4xl font-bold text-center" style={{ fontFamily: 'var(--font-nintendo-ds)' }}>Jungle/DnB Mix Visualizer</h1>
        <NavBar />
      </header>
      
      <main className="flex flex-col flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          
          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Project Overview</h3>
            <p className="mb-4">
                I made this project for my DH150 class! Our task was to create a project centered around audio. I was inspired by internet subgenre mixes on YouTube, and I wanted to make a cute music visualizer. The angel artwork is mine - it is drawn in Procreate and exported as an animated PNG. Their outfits are inspired by a Cyberdog (UK ravewear store) ad from the 90s. I used pixel shader brushes I found online to create a pixel art effect.
            </p>
          </section>
          
          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Technologies Used</h3>
            <ul className="list-disc list-inside">
              <li>Next.js React framework</li>
              <li>Website written in Typescript</li>
              <li>Music analysis performed using Python's Librosa and MIDI libraries</li>
              <li>YouTube Player API for audio playback</li>
              <li>Hosted on Vercel</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-4">About Me</h3>
            <p className="mb-4">
                I am a computer science major at UCLA. Please feel free to reach out at dagny.parayao@gmail.com! 
            </p>
          </section>
        </div>
      </main>
      
      <footer className="text-xl bg-gray-900 text-center" style={{ fontFamily: 'var(--font-nintendo-ds)' }}>
        <p>made by Dagny Parayao for DH150</p>
      </footer>
    </div>
  );
}
#!/usr/bin/env node
// Render build script that includes seed compilation
import { execSync } from 'child_process';

console.log('🔨 Starting Render-compatible build...');

try {
  // Build frontend
  console.log('📦 Building frontend...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Build backend server
  console.log('🖥️ Building server...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  // Build seed script
  console.log('🌱 Building seed script...');
  execSync('esbuild seed.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
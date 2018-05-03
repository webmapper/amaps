import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: {
    name: 'amaps',
    file: process.env.NODE_ENV === 'production' ? pkg.browser : 'test/amaps.iife.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    json(),
    resolve(), 
    commonjs() 
  ]
}

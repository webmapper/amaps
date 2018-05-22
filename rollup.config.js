import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import pkg from './package.json';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    name: 'amaps',
    file: process.env.NODE_ENV === 'production' ? pkg.browser : 'test/dist/amaps.iife.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    json(),
    babel({
      exclude: 'node_modules/**',
      presets: [[
        'env',
        {
          modules: false
        }
      ]],
      plugins: 'external-helpers'
    }),
    resolve(),
    commonjs(),
  ]
}

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import pkg from './package.json';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify-es';

export default [{
  input: 'src/index.js',
  output: {
    name: 'amaps',
    file: process.env.NODE_ENV === 'production' ? pkg.browser : 'test/dist/amaps.iife.js',
    format: 'iife',
    sourcemap: process.env.NODE_ENV === 'production' ? false : true
  },
  plugins: [
    json(),
    resolve({
      jsnext: true,
      commonjs: true,
      browser: true
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/(?!callbag)**',
      babelrc: false,
      presets: [[
        'env',
        {
          modules: false
        }
      ]],
      plugins: 'external-helpers'
    }),
    (process.env.NODE_ENV === 'production' && uglify()),
  ]
},{
  input: 'src/index.js',
  output: {
    name: 'amaps',
    file: process.env.NODE_ENV === 'production' ? pkg.module : 'test/dist/amaps.es.js',
    format: 'es',
    sourcemap: process.env.NODE_ENV === 'production' ? false : true
  },
  plugins: [
    json(),
    resolve({
      jsnext: true,
      commonjs: true,
      browser: true
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/(?!callbag)**',
      babelrc: false,
      presets: [[
        'env',
        {
          modules: false
        }
      ]],
      plugins: 'external-helpers'
    }),
    (process.env.NODE_ENV === 'production' && uglify()),
  ]
}]

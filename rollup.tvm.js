import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify-es';

export default [{
  input: 'src/tvm.js',
  output: {
    name: 'tvm',
    file: process.env.NODE_ENV === 'production' ? 'dist/tvm.iife.js' : 'test/dist/tvm.iife.js',
    format: 'iife',
    sourcemap: process.env.NODE_ENV === 'production' ? false : true
  },
  plugins: [
    json(),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [[
        'env',
        {
          modules: false
        }
      ]],
      plugins: 'external-helpers'
    }),
    resolve(),
    (process.env.NODE_ENV === 'production' && uglify()),
    commonjs()
  ]
},{
  input: 'src/tvm.js',
  output: {
    name: 'tvm',
    file: process.env.NODE_ENV === 'production' ? 'dist/tvm.es.js' : 'test/dist/tvm.es.js',
    format: 'es',
    sourcemap: process.env.NODE_ENV === 'production' ? false : true
  },
  plugins: [
    json(),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [[
        'env',
        {
          modules: false
        }
      ]],
      plugins: 'external-helpers'
    }),
    resolve(),
    (process.env.NODE_ENV === 'production' && uglify()),
    commonjs()
  ]
}]

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify-es';

export default [{
  input: 'src/pointquery.js',
  output: {
    name: 'pointquery',
    file: process.env.NODE_ENV === 'production' ? 'dist/pointquery.iife.js' : 'test/dist/pointquery.iife.js',
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
  input: 'src/pointquery.js',
  output: {
    name: 'pointquery',
    file: process.env.NODE_ENV === 'production' ? 'dist/pointquery.es.js' : 'test/dist/pointquery.es.js',
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

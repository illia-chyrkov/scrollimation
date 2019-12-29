import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'

export default {
	input: 'scrollimation.js',
	output: {
		name: 'Scrollimation',
		file: 'dist/scrollimation.js',
		format: 'umd',
		sourcemap: true
	},
	plugins: [
		babel({
			exclude: 'node_modules/**'
		}),
		uglify()
	]
}

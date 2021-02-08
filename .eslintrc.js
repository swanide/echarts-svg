module.exports = {
    extends: ['plugin:mew/esnext'],
    env: {
        commonjs: true,
        node: true
    },
    rules: {
        'import/no-commonjs': 0,
        'import/unambiguous': 0,
        'class-methods-use-this': 0
    }
};

/**
 * @file node-echarts
 * @author mengke(kekee000@gmail.com)
 */
const {Worker} = require('worker_threads');
const render = require('./render');

let isChartRendering = false;

class Chart {
    constructor(options) {
        this.svgOptions = {
            fontSize: '12px',
            // mode default or thread
            mode: 'default',
            ...options
        };
    }

    renderByThread(echartOption, opts) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(`${__dirname}/render.js`, {
                workerData: {
                    echartOption,
                    opts,
                    svgOptions: this.svgOptions
                }
            });
            worker.on('message', ({code, data}) => {
                if (code) {
                    reject(new Error(data));
                    return;
                }
                resolve(data);
            });
            worker.on('error', code => {
                reject(new Error(`render thread exit with code:${code}`));
            });
            worker.on('exit', code => {
                if (code !== 0) {
                    reject(new Error(`render thread exit with code:${code}`));
                }
            });
        });
    }

    async renderByDefault(echartOption, opts) {
        // 只支持一次运行单个 render，否则 document 变量会有问题
        if (isChartRendering) {
            throw new Error('last chart render not stopped!');
        }

        isChartRendering = true;

        try {
            const svgText = await render.renderSvg(echartOption, opts, this.svgOptions);
            return svgText;
        }
        finally {
            // eslint-disable-next-line require-atomic-updates
            isChartRendering = false;
        }
    }

    /**
     * 渲染一个 echarts 图表
     *
     * @param {Object} echartOption echart 渲染选项
     * @param {Object} opts echarts 初始化选项
     */
    render(echartOption, opts) {
        // 禁用动画
        echartOption.animation = false;

        if (this.svgOptions.mode === 'default') {
            return this.renderByDefault(echartOption, opts);
        }

        return this.renderByThread(echartOption, opts);
    }
}


exports.Chart = Chart;

/**
 * 创建一个 echarts 渲染器
 *
 * @param {Object} options 渲染选项
 * @param {string} options.fontSize svg font size
 * @param {string} options.mode render mode, default or thread
 * @description
 * options.mode:
 *  - default: use global document to init echarts
 *  - thread: use workthread to isolate echarts global context
 */
exports.create = function create(options) {
    return new Chart(options);
};

/**
 * @file 渲染 svg
 * @author mengke(kekee000@gmail.com)
 */
/* eslint-disable require-atomic-updates, no-magic-numbers */
const {isMainThread, parentPort, workerData} = require('worker_threads');
const {JSDOM} = require('jsdom');
const echarts = require('echarts');

const defaultOpts = {
    devicePixelRatio: 1,
    renderer: 'svg',
    width: 600,
    height: 480
};

function wrapperDocument(document) {
    const oldCreateElement = document.createElement;
    document.createElement = function createElement(name, ...args) {
        if (name === 'canvas') {
            return {
                getContext() {
                    return {
                        measureText(text) {
                            const fontSize = parseInt(this.font.match(/\b(\d+)px\b/) ? RegExp.$1 : '12', 10);
                            let width = 0;
                            for (let i = 0, l = text.length; i < l; i++) {
                                width += fontSize;
                                if (text.charCodeAt(i) > 0x7f) {
                                    width += fontSize;
                                }
                            }
                            return {width};
                        }
                    };
                }
            };
        }
        return oldCreateElement.call(document, name, ...args);
    };

    return document;
}

async function renderSvg(echartOption, opts, svgOptions) {
    const initOption = {...defaultOpts, ...opts};
    const {width, height} = initOption;
    const oldDocument = global.document;

    try {
        const {window} = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        const document = wrapperDocument(window.document);
        document.body.insertAdjacentHTML(
            'beforeEnd', `<div id="chart" style="width: ${width}px; height: ${height}px"></div>`
        );

        const chartDom = document.body.lastElementChild;
        document.clientWidth = width;
        document.clientHeight = height;

        global.document = document;

        const svgText = await new Promise((resolve, reject) => {
            const chart = echarts.init(chartDom, null, initOption);
            chart.on('finished', () => {
                if (!chartDom.firstElementChild || !chartDom.firstElementChild.firstElementChild) {
                    reject(new Error('no echarts rendered dom!'));
                    return;
                }
                const svgDom = chartDom.firstElementChild.firstElementChild;
                svgDom.style = `width: ${width}px;height:${height}px;font-size:${svgOptions.fontSize}`;
                resolve(svgDom.outerHTML);
            });
            chart.on('error', e => reject(e));
            chart.setOption(echartOption);
        });

        return svgText;
    }
    finally {
        if (null == oldDocument) {
            global.document = null;
        }
        else {
            global.document = oldDocument;
        }
    }
}

if (isMainThread) {
    exports.renderSvg = renderSvg;
}
else {
    const {echartOption, opts, svgOptions} = workerData;

    renderSvg(echartOption, opts, svgOptions)
        .then(svgText => {
            parentPort.postMessage({code: 0, data: svgText});
        })
        .catch(e => {
            parentPort.postMessage({code: 1, data: e.message});
        });
}

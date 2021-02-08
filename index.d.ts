/**
 * @file index.d.ts
 * @author mengke(kekee000@gmail.com)
 */

import {EChartsOption} from 'echarts';

interface Opts {
    devicePixelRatio?: number;
    width?: number;
    height?: number;
    locale?: string | object;
}

interface ChartOptions {

    /**
     * svg 字体大小
     */
    fontSize: string;

    /**
     * render mode
     *  - default: use global document to init echarts
     *  - thread: use workthread to isolate echarts global context
     */
    mode?: 'default' | 'thread';
}

export interface Chart {
    new(options: ChartOptions);

    /**
     * 渲染 chart
     * @param echartOption echarts 选项
     * @param opts echarts 初始化选项
     */
    render(echartOption: EChartsOption, opts: Opts): Promise<string>;
}

/**
 * 创建一个 echarts 渲染器
 *
 * @param {Object} options 渲染选项
 */
export function create(options?: ChartOptions): Chart;


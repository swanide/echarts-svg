echarts-svg
====

Output echarts svg image on node enviroment.

Required:

Node >= v12.16.1

Usage:

```javascript
const chart = require('echarts-svg').create({
    // svg font size
    fontSize: '12px',
    // render mode
    // default: use global document to init echarts
    // thread: use workthread to isolate echarts global context
    mode: 'default'
});
chart.render({
    color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
    title: {
        text: 'chart title'
    },
    //... echartOption
}, {
    width: 800,
    height: 600
})
    .then(svgText => {
        console.log(svgText)
    });
```
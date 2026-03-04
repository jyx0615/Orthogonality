const canvasL = document.getElementById('canvasLeft');
const canvasR = document.getElementById('canvasRight');
const canvasC = document.getElementById('canvasCombined');
const canvasI = document.getElementById('canvasIntegral');

const ctxL = canvasL.getContext('2d');
const ctxR = canvasR.getContext('2d');
const ctxC = canvasC.getContext('2d');
const ctxI = canvasI.getContext('2d');

// Left Controls
const funcLeft = document.getElementById('funcLeft');
const freqLeftNum = document.getElementById('freqLeftNum');
const freqLeftSlider = document.getElementById('freqLeftSlider');

// Right Controls
const funcRight = document.getElementById('funcRight');
const freqRightNum = document.getElementById('freqRightNum');
const freqRightSlider = document.getElementById('freqRightSlider');

const combinedPanelContainer = document.getElementById('combinedPanelContainer');
const integralPanelContainer = document.getElementById('integralPanelContainer');
const generateBtn = document.getElementById('generateBtn');
const visualizeAreaBtn = document.getElementById('visualizeAreaBtn');

const colors = {
    sin: '#fb7185',
    cos: '#34d399',
    combined: '#facc15',
    axis: 'rgba(248, 250, 252, 0.4)',
    positiveArea: 'rgba(16, 185, 129, 0.7)', // Green
    negativeArea: 'rgba(239, 68, 68, 0.7)'  // Red
};

const MIN_X = -4;
const MAX_X = 4;
const MIN_Y = -1.5;
const MAX_Y = 1.5;

function resizeCanvases() {
    const panels = [canvasL, canvasR, canvasC, canvasI];
    panels.forEach(canvas => {
        if (canvas.parentElement) {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
        }
    });
    draw();
    if (combinedPanelContainer.style.display === 'block') {
        drawCombined();
    }
    if (integralPanelContainer.style.display === 'block') {
        drawIntegral();
    }
}

// Draw basic graph outline function
function drawGraph(ctx, canvas, funcType, freq, color) {
    const width = canvas.width;
    const height = canvas.height;
    if (!width || !height) return;

    ctx.clearRect(0, 0, width, height);

    const mathFunc = funcType === 'sin' ? Math.sin : Math.cos;
    if (!color) {
        color = funcType === 'sin' ? colors.sin : colors.cos;
    }

    const mapX = (x) => ((x - MIN_X) / (MAX_X - MIN_X)) * width;
    const mapY = (y) => height - ((y - MIN_Y) / (MAX_Y - MIN_Y)) * height;

    // 1. Draw Axis
    ctx.beginPath();
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = window.devicePixelRatio;

    const y0 = mapY(0);
    ctx.moveTo(0, y0);
    ctx.lineTo(width, y0);

    const x0 = mapX(0);
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0, height);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = colors.axis;
    ctx.font = `${12 * window.devicePixelRatio}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    ctx.fillText('-4', mapX(-4), y0 + 10 * window.devicePixelRatio);
    ctx.fillText('-π', mapX(-Math.PI), y0 + 10 * window.devicePixelRatio);
    ctx.fillText('0', mapX(0) + 10 * window.devicePixelRatio, y0 + 10 * window.devicePixelRatio);
    ctx.fillText('π', mapX(Math.PI), y0 + 10 * window.devicePixelRatio);
    ctx.fillText('4', mapX(4), y0 + 10 * window.devicePixelRatio);

    // 2. Draw Waveform ONLY between -PI and PI
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3 * window.devicePixelRatio;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10 * window.devicePixelRatio;

    let isFirstPoint = true;
    for (let px = 0; px <= width; px++) {
        const x = MIN_X + (px / width) * (MAX_X - MIN_X);

        if (x >= -Math.PI && x <= Math.PI) {
            let y = 0;
            if (typeof funcType === 'function') {
                y = funcType(x);
            } else {
                y = mathFunc(freq * x);
            }

            const py = mapY(y);
            if (isFirstPoint) {
                ctx.moveTo(px, py);
                isFirstPoint = false;
            } else {
                ctx.lineTo(px, py);
            }
        } else {
            isFirstPoint = true;
        }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function getArea(area) {
    var newArea = area.toFixed(4);
    if (Math.abs(newArea) < 0.0001)
        return 0;
    return newArea;
}

function getAreaInPi(area) {
    var newArea = area.toFixed(4);
    if (Math.abs(newArea) < 0.0001)
        return 0;
    if (Math.abs(newArea / Math.PI - 1) < 0.01)
        return "π";
    return (newArea / Math.PI).toFixed(0) + "π";
}

// Dedicated drawing function for integration visualization with positive/negative fill colors
function drawIntegral() {
    const width = canvasI.width;
    const height = canvasI.height;
    if (!width || !height) return;

    ctxI.clearRect(0, 0, width, height);

    const freqL = parseInt(freqLeftNum.value, 10) || 1;
    const freqR = parseInt(freqRightNum.value, 10) || 1;
    const funcL = funcLeft.value === 'sin' ? Math.sin : Math.cos;
    const funcR = funcRight.value === 'sin' ? Math.sin : Math.cos;

    const combinedFunc = (x) => {
        return funcL(freqL * x) * funcR(freqR * x);
    };

    const mapX = (x) => ((x - MIN_X) / (MAX_X - MIN_X)) * width;
    const mapY = (y) => height - ((y - MIN_Y) / (MAX_Y - MIN_Y)) * height;

    // 1. Draw Axis first
    ctxI.beginPath();
    ctxI.strokeStyle = colors.axis;
    ctxI.lineWidth = window.devicePixelRatio;

    const y0 = mapY(0);
    ctxI.moveTo(0, y0);
    ctxI.lineTo(width, y0);

    const x0 = mapX(0);
    ctxI.moveTo(x0, 0);
    ctxI.lineTo(x0, height);
    ctxI.stroke();

    ctxI.fillStyle = colors.axis;
    ctxI.font = `${12 * window.devicePixelRatio}px Inter`;
    ctxI.textAlign = 'center';
    ctxI.textBaseline = 'top';
    ctxI.fillText('-4', mapX(-4), y0 + 10 * window.devicePixelRatio);
    ctxI.fillText('-π', mapX(-Math.PI), y0 + 10 * window.devicePixelRatio);
    ctxI.fillText('0', mapX(0) + 10 * window.devicePixelRatio, y0 + 10 * window.devicePixelRatio);
    ctxI.fillText('π', mapX(Math.PI), y0 + 10 * window.devicePixelRatio);
    ctxI.fillText('4', mapX(4), y0 + 10 * window.devicePixelRatio);

    // 2. Draw Vertical Area Fills and calculate integral
    let positiveArea = 0;
    let negativeArea = 0;
    const dx = (MAX_X - MIN_X) / width;

    for (let px = 0; px <= width; px++) {
        const x = MIN_X + (px / width) * (MAX_X - MIN_X);

        if (x >= -Math.PI && x <= Math.PI) {
            const y = combinedFunc(x);
            const py = mapY(y);

            if (y > 0) {
                ctxI.fillStyle = colors.positiveArea;
                ctxI.fillRect(px, py, 1, y0 - py);
                positiveArea += y * dx;
            } else if (y < 0) {
                ctxI.fillStyle = colors.negativeArea;
                ctxI.fillRect(px, y0, 1, py - y0);
                negativeArea += Math.abs(y * dx);
            }
        }
    }

    const totalArea = positiveArea - negativeArea;
    document.getElementById('integralValueDisplay').innerHTML = `Total Net Area = <span style="color: #10b981">${getArea(positiveArea)}</span> - <span style="color: #ef4444">${getArea(negativeArea)}</span> = ${getAreaInPi(totalArea)}`;

    // 3. Draw The Line Outline over the Area
    ctxI.beginPath();
    ctxI.strokeStyle = colors.combined;
    ctxI.lineWidth = 2 * window.devicePixelRatio;

    let isFirstPoint = true;
    for (let px = 0; px <= width; px++) {
        const x = MIN_X + (px / width) * (MAX_X - MIN_X);

        if (x >= -Math.PI && x <= Math.PI) {
            const y = combinedFunc(x);
            const py = mapY(y);
            if (isFirstPoint) {
                ctxI.moveTo(px, py);
                isFirstPoint = false;
            } else {
                ctxI.lineTo(px, py);
            }
        } else {
            isFirstPoint = true;
        }
    }
    ctxI.stroke();
}

function draw() {
    const freqL = parseInt(freqLeftNum.value, 10) || 1;
    drawGraph(ctxL, canvasL, funcLeft.value, freqL);

    const freqR = parseInt(freqRightNum.value, 10) || 1;
    drawGraph(ctxR, canvasR, funcRight.value, freqR);
}

function drawCombined() {
    const freqL = parseInt(freqLeftNum.value, 10) || 1;
    const freqR = parseInt(freqRightNum.value, 10) || 1;
    const funcL = funcLeft.value === 'sin' ? Math.sin : Math.cos;
    const funcR = funcRight.value === 'sin' ? Math.sin : Math.cos;

    const combinedFunc = (x) => {
        return funcL(freqL * x) * funcR(freqR * x);
    };

    const labelObj = document.getElementById('combinedLabel');
    labelObj.innerText = `Combined: ${funcLeft.value}(${freqL}x) * ${funcRight.value}(${freqR}x)`;

    drawGraph(ctxC, canvasC, combinedFunc, 1, colors.combined);
}

// --- Event Listeners ---
function updateAll() {
    draw();
    if (combinedPanelContainer.style.display === 'block') drawCombined();
    if (integralPanelContainer.style.display === 'block') drawIntegral();
}

// Left
funcLeft.addEventListener('change', updateAll);
freqLeftNum.addEventListener('input', (e) => {
    freqLeftSlider.value = e.target.value;
    updateAll();
});
freqLeftSlider.addEventListener('input', (e) => {
    freqLeftNum.value = e.target.value;
    updateAll();
});

// Right
funcRight.addEventListener('change', updateAll);
freqRightNum.addEventListener('input', (e) => {
    freqRightSlider.value = e.target.value;
    updateAll();
});
freqRightSlider.addEventListener('input', (e) => {
    freqRightNum.value = e.target.value;
    updateAll();
});

generateBtn.addEventListener('click', () => {
    combinedPanelContainer.style.display = 'block';
    resizeCanvases();
    drawCombined();
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

visualizeAreaBtn.addEventListener('click', () => {
    integralPanelContainer.style.display = 'block';
    resizeCanvases();
    drawIntegral();
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

window.addEventListener('resize', resizeCanvases);

// Initial setup
resizeCanvases();



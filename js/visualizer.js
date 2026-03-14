/**
 * 极致视觉体验 Canvas 绘图引擎 - 缓动优化版
 */

const VIS_RED = true;
const VIS_BLACK = false;

class CanvasVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nodeRadius = 22;
        this.levelHeight = 70;
        
        this.nodeStates = new Map();
        this.animationDuration = 600; 
        this.startTime = 0;
        this.isAnimating = false;
        this.activeNodeValue = null;
        this.currentEdges = [];

        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.renderLoop = this.renderLoop.bind(this);
        requestAnimationFrame(this.renderLoop);
    }

    resize() {
        const container = this.canvas.parentElement;
        if (!container) return;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = container.clientWidth * dpr;
        this.canvas.height = container.clientHeight * dpr;
        this.ctx.scale(dpr, dpr);
    }

    setAnimationSpeed(ms) {
        this.animationDuration = ms;
    }

    /**
     * 三次贝塞尔缓动函数 (Ease-In-Out Cubic)
     * 实现机械感与丝滑感的平衡
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    lerp(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * 辅助方法：解析十六进制颜色并进行插值 (Lerp)
     */
    lerpColor(a, b, t) {
        const hex = (x) => {
            const h = x.toString(16);
            return h.length === 1 ? '0' + h : h;
        };
        const parse = (c) => {
            if (c.startsWith('#')) {
                return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
            }
            return [30, 41, 59]; // 默认深色
        };
        const c1 = parse(a);
        const c2 = parse(b);
        const r = Math.round(this.lerp(c1[0], c2[0], t));
        const g = Math.round(this.lerp(c1[1], c2[1], t));
        const b_val = Math.round(this.lerp(c1[2], c2[2], t));
        return `#${hex(r)}${hex(g)}${hex(b_val)}`;
    }

    transitionTo(snapshot) {
        if (!snapshot) return;
        this.activeNodeValue = snapshot.activeNodeValue;
        const targetPositions = new Map();
        
        // 记录父节点以便新节点入场
        const parentMap = new Map();
        const buildParentMap = (node) => {
            if (!node) return;
            if (node.left) { parentMap.set(node.left.value, node); buildParentMap(node.left); }
            if (node.right) { parentMap.set(node.right.value, node); buildParentMap(node.right); }
        };
        buildParentMap(snapshot.root);

        const calculateTargetCoords = (node, x, y, xOffset) => {
            if (!node) return;
            targetPositions.set(node.value, {
                x: x,
                y: y,
                color: node.color === VIS_RED ? '#ef4444' : '#1e293b'
            });
            const nextXOffset = xOffset / 2;
            if (node.left) calculateTargetCoords(node.left, x - xOffset, y + this.levelHeight, nextXOffset);
            if (node.right) calculateTargetCoords(node.right, x + xOffset, y + this.levelHeight, nextXOffset);
        };

        const canvasWidth = this.canvas.clientWidth || 800;
        calculateTargetCoords(snapshot.root, canvasWidth / 2, 50, canvasWidth / 4);

        for (const value of this.nodeStates.keys()) {
            if (!targetPositions.has(value)) this.nodeStates.delete(value);
        }

        for (const [value, target] of targetPositions) {
            if (!this.nodeStates.has(value)) {
                // 【入场动画】如果是新节点，从父节点位置开始移动；若无父节点，从正上方落下
                const parent = parentMap.get(value);
                const prevState = parent ? this.nodeStates.get(parent.value) : null;
                
                const startX = prevState ? prevState.currentX : target.x;
                const startY = prevState ? prevState.currentY : -50;

                this.nodeStates.set(value, {
                    currentX: startX, currentY: startY, currentColor: target.color,
                    startX: startX, startY: startY, startColor: target.color,
                    targetX: target.x, targetY: target.y, targetColor: target.color
                });
            } else {
                const state = this.nodeStates.get(value);
                state.startX = state.currentX;
                state.startY = state.currentY;
                state.startColor = state.currentColor;
                state.targetX = target.x;
                state.targetY = target.y;
                state.targetColor = target.color;
            }
        }

        this.startTime = performance.now();
        this.isAnimating = true;
    }

    renderLoop(timestamp) {
        this.update(timestamp);
        this.draw();
        requestAnimationFrame(this.renderLoop);
    }

    update(timestamp) {
        if (!this.isAnimating) return;

        let elapsed = timestamp - this.startTime;
        let progress = Math.min(elapsed / this.animationDuration, 1);
        
        const t = this.easeInOutCubic(progress);

        for (const state of this.nodeStates.values()) {
            state.currentX = this.lerp(state.startX, state.targetX, t);
            state.currentY = this.lerp(state.startY, state.targetY, t);
            // 【平滑变色】使用 lerpColor 代替瞬切
            state.currentColor = this.lerpColor(state.startColor, state.targetColor, t);
        }

        if (progress === 1) this.isAnimating = false;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制连线
        if (this.currentEdges) {
            this.currentEdges.forEach(edge => {
                const start = this.nodeStates.get(edge.from);
                const end = this.nodeStates.get(edge.to);
                if (start && end) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(start.currentX, start.currentY);
                    this.ctx.lineTo(end.currentX, end.currentY);
                    this.ctx.strokeStyle = '#e2e8f0';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                }
            });
        }

        // 绘制节点
        for (const [value, state] of this.nodeStates) {
            const isHighlight = (value === this.activeNodeValue);
            this.drawNode(value, state.currentX, state.currentY, state.currentColor, isHighlight);
        }
    }

    setEdgesFromSnapshot(node) {
        this.currentEdges = [];
        const traverse = (n) => {
            if (!n) return;
            if (n.left) { this.currentEdges.push({ from: n.value, to: n.left.value }); traverse(n.left); }
            if (n.right) { this.currentEdges.push({ from: n.value, to: n.right.value }); traverse(n.right); }
        };
        traverse(node);
    }

    /**
     * 绘制带质感、投影和脉冲光环的节点
     */
    drawNode(value, x, y, color, highlight) {
        this.ctx.save();
        
        // 1. 绘制外部投影 (让球体浮起来)
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        this.ctx.shadowBlur = 12;
        this.ctx.shadowOffsetY = 6;

        if (highlight) {
            // 脉冲光环逻辑：基于时间的正弦波控制半径和透明度
            const time = performance.now();
            const pulse = (Math.sin(time / 250) + 1) / 2; // 0 到 1 循环
            const outerRadius = this.nodeRadius + 6 + pulse * 10;
            const alpha = 0.3 - pulse * 0.2;

            this.ctx.save();
            this.ctx.shadowColor = 'transparent'; // 脉冲不需要投影
            this.ctx.beginPath();
            this.ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = color === '#ef4444' ? `rgba(239, 68, 68, ${alpha})` : `rgba(30, 41, 59, ${alpha})`;
            this.ctx.fill();
            this.ctx.restore();
        }

        // 2. 绘制主球体 (带径向渐变)
        const gradient = this.ctx.createRadialGradient(
            x - this.nodeRadius * 0.3, y - this.nodeRadius * 0.3, this.nodeRadius * 0.1,
            x, y, this.nodeRadius
        );
        
        if (color === '#ef4444') { // 红色节点
            gradient.addColorStop(0, '#ff7171'); // 高光点
            gradient.addColorStop(0.6, '#ef4444');
            gradient.addColorStop(1, '#b91c1c'); // 阴影边
        } else { // 黑色节点
            gradient.addColorStop(0, '#475569'); // 高光点
            gradient.addColorStop(0.6, '#1e293b');
            gradient.addColorStop(1, '#0f172a'); // 阴影边
        }

        this.ctx.beginPath();
        this.ctx.arc(x, y, this.nodeRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // 3. 绘制球体表面的微弱反光边框
        this.ctx.shadowColor = 'transparent';
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // 4. 绘制文字
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetY = 1;
        this.ctx.font = 'bold 15px Inter, system-ui';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(value, x, y);

        this.ctx.restore();
    }
}

/**
 * 红黑树核心逻辑实现 - 支持“预告-执行”分步模式
 */

const RED = true;
const BLACK = false;

class RBNode {
    constructor(value, color = RED) {
        this.value = value;
        this.color = color;
        this.left = null;
        this.right = null;
        this.parent = null;
    }
}

class RBTree {
    constructor() {
        this.root = null;
        this.steps = []; // 存储每一步的状态快照
    }

    /**
     * 深拷贝当前树结构
     */
    cloneTree(node) {
        if (!node) return null;
        const newNode = new RBNode(node.value, node.color);
        newNode.left = this.cloneTree(node.left);
        newNode.right = this.cloneTree(node.right);
        if (newNode.left) newNode.left.parent = newNode;
        if (newNode.right) newNode.right.parent = newNode;
        return newNode;
    }

    /**
     * 保存当前状态快照 - 支持多语言
     */
    saveStep(descKey, params = [], activeNodeValue = null) {
        this.steps.push({
            root: this.cloneTree(this.root),
            descKey: descKey,
            params: params,
            activeNodeValue: activeNodeValue
        });
    }

    /**
     * 插入新节点
     */
    insert(value) {
        this.steps = [];
        let newNode = new RBNode(value, RED);
        
        if (this.root === null) {
            newNode.color = BLACK;
            this.root = newNode;
            this.saveStep('log_root_insert', [value], value);
            return;
        }

        let current = this.root;
        let parent = null;
        let pathValues = [];

        while (current !== null) {
            parent = current;
            pathValues.push(current.value);
            if (value < current.value) {
                current = current.left;
            } else if (value > current.value) {
                current = current.right;
            } else {
                return; // 不允许重复值
            }
        }

        newNode.parent = parent;
        if (value < parent.value) {
            parent.left = newNode;
        } else {
            parent.right = newNode;
        }

        const pathStr = pathValues.join(' -> ');
        const pos = value < parent.value ? 'left' : 'right';
        this.saveStep('log_search', [pathStr, value, pos], value);
        this.saveStep('log_inserted', [value], value);
        
        this.insertFixUp(newNode);
    }

    /**
     * 红黑树平衡修正 - 教学分步增强版
     */
    insertFixUp(z) {
        while (z.parent && z.parent.color === RED) {
            let p = z.parent;
            let g = p.parent;

            if (p === g.left) {
                let u = g.right;
                if (u && u.color === RED) {
                    this.saveStep('log_conflict', [z.value, p.value], z.value);
                    this.saveStep('log_recolor_decide', [u.value], g.value);
                    p.color = BLACK;
                    u.color = BLACK;
                    g.color = RED;
                    this.saveStep('log_recolor_done', [g.value], g.value);
                    z = g;
                } else {
                    if (z === p.right) {
                        this.saveStep('log_rotation_decide_lr', [p.value], p.value);
                        z = p;
                        this.leftRotate(z);
                        this.saveStep('log_rotation_done_lr', [z.value], z.value);
                        p = z.parent;
                        g = p.parent;
                    }
                    this.saveStep('log_rotation_decide_ll', [g.value], g.value);
                    p.color = BLACK;
                    g.color = RED;
                    this.rightRotate(g);
                    this.saveStep('log_rotation_done_ll', [p.value], p.value);
                }
            } else {
                let u = g.left;
                if (u && u.color === RED) {
                    this.saveStep('log_conflict', [z.value, p.value], z.value);
                    this.saveStep('log_recolor_decide', [u.value], g.value);
                    p.color = BLACK;
                    u.color = BLACK;
                    g.color = RED;
                    this.saveStep('log_recolor_done', [g.value], g.value);
                    z = g;
                } else {
                    if (z === p.left) {
                        this.saveStep('log_rotation_decide_lr', [p.value], p.value);
                        z = p;
                        this.rightRotate(z);
                        this.saveStep('log_rotation_done_lr', [z.value], z.value);
                        p = z.parent;
                        g = p.parent;
                    }
                    this.saveStep('log_rotation_decide_ll', [g.value], g.value);
                    p.color = BLACK;
                    g.color = RED;
                    this.leftRotate(g);
                    this.saveStep('log_rotation_done_ll', [p.value], p.value);
                }
            }
        }
        
        if (this.root.color === RED) {
            this.saveStep('log_root_fix', [], this.root.value);
            this.root.color = BLACK;
            this.saveStep('log_root_fixed', [], this.root.value);
        }
        this.saveStep('log_finish');
    }

    leftRotate(x) {
        let y = x.right;
        x.right = y.left;
        if (y.left !== null) y.left.parent = x;
        y.parent = x.parent;
        if (x.parent === null) this.root = y;
        else if (x === x.parent.left) x.parent.left = y;
        else x.parent.right = y;
        y.left = x;
        x.parent = y;
    }

    rightRotate(y) {
        let x = y.left;
        y.left = x.right;
        if (x.right !== null) x.right.parent = y;
        x.parent = y.parent;
        if (y.parent === null) this.root = x;
        else if (y === y.parent.left) y.parent.left = x;
        else y.parent.right = x;
        x.right = y;
        y.parent = x;
    }
}

/**
 * 增强版应用程序控制器 - 国际化支持版
 */

document.addEventListener('DOMContentLoaded', () => {
    const tree = new RBTree();
    const visualizer = new CanvasVisualizer('tree-canvas');

    // UI 元素
    const inputNodeValue = document.getElementById('node-value');
    const btnInsert = document.getElementById('btn-insert');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnFinish = document.getElementById('btn-finish');
    const btnAuto = document.getElementById('btn-auto');
    const btnReset = document.getElementById('btn-reset');
    const statusLog = document.getElementById('status-log');
    const stepCounter = document.getElementById('step-counter');
    const animSpeedInput = document.getElementById('anim-speed');
    const emptyHint = document.getElementById('empty-hint');
    const btnLangZh = document.getElementById('btn-lang-zh');
    const btnLangEn = document.getElementById('btn-lang-en');
    const speedValueDisplay = document.getElementById('speed-value');

    let currentSteps = []; 
    let currentStepIndex = -1;
    let insertionHistory = []; 
    let autoPlayTimer = null;
    let currentLang = 'zh';

    const BASE_ANIM_DURATION = 600;

    /**
     * 切换语言
     */
    function switchLanguage(lang) {
        currentLang = lang;
        btnLangZh.classList.toggle('active', lang === 'zh');
        btnLangEn.classList.toggle('active', lang === 'en');

        const dict = I18N[lang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.innerHTML = dict[key];
        });

        if (currentSteps.length > 0 && currentStepIndex !== -1) {
            statusLog.innerHTML = formatStepDescription(currentSteps[currentStepIndex]);
        } else {
            statusLog.textContent = dict.statusWait;
        }

        if (autoPlayTimer) btnAuto.textContent = dict.stopBtn;
    }

    function formatStepDescription(step) {
        if (!step || !step.descKey) return '';
        const dict = I18N[currentLang];
        const translation = dict[step.descKey];
        if (typeof translation === 'function') return translation(...step.params);
        return translation || '';
    }

    function updateAnimationSpeed() {
        const multiplier = parseFloat(animSpeedInput.value);
        speedValueDisplay.textContent = `${multiplier.toFixed(1)}x`;
        visualizer.setAnimationSpeed(BASE_ANIM_DURATION / multiplier);
    }

    function updateState(index) {
        if (index < 0 || index >= currentSteps.length) return;
        const step = currentSteps[index];
        
        emptyHint.style.opacity = step.root ? '0' : '1';
        setTimeout(() => {
            emptyHint.style.display = step.root ? 'none' : 'block';
        }, 300);

        visualizer.setEdgesFromSnapshot(step.root);
        visualizer.transitionTo(step);
        
        statusLog.innerHTML = formatStepDescription(step);
        currentStepIndex = index;
        stepCounter.textContent = `${index + 1} / ${currentSteps.length}`;

        btnPrev.disabled = (index === 0 && insertionHistory.length === 0);
        btnNext.disabled = (index === currentSteps.length - 1);
        btnFinish.disabled = (index === currentSteps.length - 1);
        btnAuto.disabled = (index === currentSteps.length - 1);
    }

    function handleInsert() {
        const value = parseInt(inputNodeValue.value);
        if (isNaN(value)) {
            alert(I18N[currentLang].inputAlert);
            return;
        }
        stopAutoPlay();
        if (currentSteps.length > 0 && currentStepIndex === currentSteps.length - 1) {
            insertionHistory.push([...currentSteps]);
        }
        tree.insert(value);
        currentSteps = tree.steps;
        if (currentSteps.length > 0) updateState(0);
        inputNodeValue.value = '';
        inputNodeValue.focus();
    }

    function handlePrev() {
        stopAutoPlay();
        if (currentStepIndex > 0) {
            updateState(currentStepIndex - 1);
        } else if (insertionHistory.length > 0) {
            currentSteps = insertionHistory.pop();
            tree.root = tree.cloneTree(currentSteps[currentSteps.length - 1].root);
            updateState(currentSteps.length - 1);
        }
    }

    function startAutoPlay() {
        if (currentStepIndex >= currentSteps.length - 1) return;
        btnAuto.textContent = I18N[currentLang].stopBtn;
        btnAuto.classList.add('btn-primary');
        const getInterval = () => (BASE_ANIM_DURATION / parseFloat(animSpeedInput.value)) + (300 / parseFloat(animSpeedInput.value));
        const playNext = () => {
            if (currentStepIndex < currentSteps.length - 1) {
                updateState(currentStepIndex + 1);
                autoPlayTimer = setTimeout(playNext, getInterval());
            } else {
                stopAutoPlay();
            }
        };
        autoPlayTimer = setTimeout(playNext, getInterval());
    }

    function stopAutoPlay() {
        if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
        btnAuto.textContent = I18N[currentLang].autoBtn;
        btnAuto.classList.remove('btn-primary');
    }

    // 事件监听
    btnLangZh.addEventListener('click', () => switchLanguage('zh'));
    btnLangEn.addEventListener('click', () => switchLanguage('en'));
    animSpeedInput.addEventListener('input', updateAnimationSpeed);
    btnInsert.addEventListener('click', handleInsert);
    inputNodeValue.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleInsert(); });
    btnNext.addEventListener('click', () => { if (currentStepIndex < currentSteps.length - 1) updateState(currentStepIndex + 1); });
    btnPrev.addEventListener('click', handlePrev);
    btnFinish.addEventListener('click', () => { stopAutoPlay(); updateState(currentSteps.length - 1); });
    btnAuto.addEventListener('click', () => { if (autoPlayTimer) stopAutoPlay(); else startAutoPlay(); });
    btnReset.addEventListener('click', () => {
        stopAutoPlay();
        tree.root = null; tree.steps = []; currentSteps = []; insertionHistory = []; currentStepIndex = -1;
        visualizer.nodeStates.clear(); visualizer.currentEdges = [];
        visualizer.transitionTo({root: null});
        emptyHint.style.display = 'block'; emptyHint.style.opacity = '1';
        statusLog.textContent = I18N[currentLang].statusReset;
        stepCounter.textContent = '- / -';
        btnPrev.disabled = btnNext.disabled = btnFinish.disabled = btnAuto.disabled = true;
    });

    updateAnimationSpeed();
    switchLanguage('zh');
});

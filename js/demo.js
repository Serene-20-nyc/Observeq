// ===============================
// ObserveQ Demo Page Script
// - Theme toggle (light/dark)
// - Drag & drop upload simulation
// ===============================

(function () {
    // ---------------------------
    // THEME TOGGLE LOGIC
    // ---------------------------
    const body = document.body;
    const toggleBtn = document.getElementById('demo-theme-toggle');
    const icon = document.getElementById('demo-theme-icon');

    // Load theme from localStorage if available
    const savedTheme = localStorage.getItem('observeq-demo-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
        body.setAttribute('data-theme', savedTheme);
    } else if (!body.getAttribute('data-theme')) {
        // Fallback if no data-theme set in HTML
        body.setAttribute('data-theme', 'dark');
    }

    function applyIcon(theme) {
        if (!icon) return;
        if (theme === 'light') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    // Initial icon state
    applyIcon(body.getAttribute('data-theme') || 'dark');

    toggleBtn?.addEventListener('click', () => {
        const current = body.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        body.setAttribute('data-theme', next);
        localStorage.setItem('observeq-demo-theme', next);
        applyIcon(next);
    });

    // ---------------------------
    // DRAG & DROP UPLOAD LOGIC
    // ---------------------------
    const uploadCard = document.getElementById('upload-card');
    const fileInput = document.getElementById('file-input');
    const progressContainer = document.getElementById('progress-container');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressStatus = document.getElementById('progress-status');
    const uploadSuccess = document.getElementById('upload-success');
    const fileNameDisplay = document.getElementById('file-name');

    if (!uploadCard || !fileInput) {
        // In case script is loaded on a different page
        return;
    }

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadCard.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadCard.addEventListener(eventName, () => uploadCard.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadCard.addEventListener(eventName, () => uploadCard.classList.remove('drag-over'), false);
    });

    uploadCard.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            simulateUpload(files[0]);
        }
    }

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            simulateUpload(e.target.files[0]);
        }
    });

    function simulateUpload(file) {
        // Reset states
        uploadSuccess.classList.add('hidden');
        progressContainer.classList.remove('hidden');
        progressBarFill.style.width = '0%';
        fileNameDisplay.textContent = file.name;

        let progress = 0;
        const intervalDuration = 100; // ms
        const totalTime = 4000;       // 4 seconds total
        const steps = totalTime / intervalDuration;
        const increment = 100 / steps;

        progressStatus.textContent = "Starting AI analysis...";

        const interval = setInterval(() => {
            progress += increment;

            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);

                progressBarFill.style.width = '100%';
                progressStatus.textContent = "Analysis Complete!";

                setTimeout(() => {
                    progressContainer.classList.add('hidden');
                    uploadSuccess.classList.remove('hidden');
                    fileInput.value = '';
                }, 500);

            } else {
                const pct = progress.toFixed(0);
                progressBarFill.style.width = `${pct}%`;
                progressStatus.textContent = `Processing video: ${pct}% completed...`;
            }

        }, intervalDuration);
    }
})();

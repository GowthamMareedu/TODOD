class FuturisticTodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('futuristic-todos')) || [];
        this.currentPriority = 'low';
        this.taskIdCounter = this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) + 1 : 1;
        
        this.initializeElements();
        this.bindEvents();
        this.createParticles();
        this.renderTasks();
        this.updateStats();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.tasksContainer = document.getElementById('tasksContainer');
        this.emptyState = document.getElementById('emptyState');
        this.priorityBtns = document.querySelectorAll('.priority-btn');
        
        // Stats elements
        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.pendingTasksEl = document.getElementById('pendingTasks');
        this.completionRateEl = document.getElementById('completionRate');
    }

    bindEvents() {
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        this.priorityBtns.forEach(btn => {
            btn.addEventListener('click', () => this.setPriority(btn.dataset.priority));
        });
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            
            const colors = ['#00ffff', '#ff00ff', '#00ff00', '#ffff00'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.background = color;
            particle.style.boxShadow = `0 0 10px ${color}`;
            
            particlesContainer.appendChild(particle);
        }
    }

    setPriority(priority) {
        this.currentPriority = priority;
        this.priorityBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.priority === priority);
        });
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;

        const task = {
            id: this.taskIdCounter++,
            text: text,
            priority: this.currentPriority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        this.taskInput.value = '';
        this.taskInput.focus();

        this.addTaskBtn.innerHTML = '<div class="loading"></div>';
        setTimeout(() => {
            this.addTaskBtn.innerHTML = '<span>DEPLOY TASK</span>';
        }, 500);
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }

    renderTasks() {
        if (this.tasks.length === 0) {
            this.emptyState.style.display = 'block';
            return;
        }

        this.emptyState.style.display = 'none';
        
        const tasksHTML = this.tasks.map(task => `
            <div class="task-item priority-${task.priority} ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-content">
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                    <div class="task-actions">
                        <button class="btn btn-complete" onclick="todoApp.toggleTask(${task.id})">
                            ${task.completed ? 'REACTIVATE' : 'COMPLETE'}
                        </button>
                        <button class="btn btn-danger" onclick="todoApp.deleteTask(${task.id})">
                            DELETE
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        this.tasksContainer.innerHTML = tasksHTML;
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        this.animateNumber(this.totalTasksEl, total);
        this.animateNumber(this.completedTasksEl, completed);
        this.animateNumber(this.pendingTasksEl, pending);
        this.animateNumber(this.completionRateEl, completionRate, '%');
    }

    animateNumber(element, targetValue, suffix = '') {
        const currentValue = parseInt(element.textContent) || 0;
        const increment = targetValue > currentValue ? 1 : -1;
        const duration = 50;

        const animate = () => {
            const current = parseInt(element.textContent) || 0;
            if (current !== targetValue) {
                element.textContent = (current + increment) + suffix;
                setTimeout(animate, duration);
            }
        };

        if (currentValue !== targetValue) {
            animate();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('futuristic-todos', JSON.stringify(this.tasks));
    }
}

// Initialize the app
const todoApp = new FuturisticTodoApp();

// Cursor Enhancement
document.addEventListener('mousemove', (e) => {
    let cursor = document.querySelector('.cursor');
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.className = 'cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(0,255,255,0.3) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: screen;
        `;
        document.body.appendChild(cursor);
    }

    cursor.style.left = e.clientX - 10 + 'px';
    cursor.style.top = e.clientY - 10 + 'px';
});

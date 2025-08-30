let studyData = {};
let currentQuiz = null;
let currentQuestion = 0;
let quizScore = 0;
let quizTimer = null;
let timeLeft = 15;
let currentTopic = 'topic1';
let quizAttempted = JSON.parse(localStorage.getItem('quizAttempted')) || {};
let studySwiper;
let userProgress = JSON.parse(localStorage.getItem('psychologyProgress')) || {
    studySessions: 0,
    quizAttempts: 0,
    scores: [],
    completedSections: []
};

function loadStudyData() {
    const fileName = currentTopic === 'topic1' ? 'study_data.json' : 'study_data_topic2.json';
    const savedKey = currentTopic === 'topic1' ? 'studyData' : 'studyDataTopic2';
    
    const savedData = localStorage.getItem(savedKey);
    if (savedData) {
        studyData = JSON.parse(savedData);
        initializeApp();
    } else {
        fetch(fileName)
            .then(response => response.json())
            .then(data => {
                studyData = data;
                localStorage.setItem(savedKey, JSON.stringify(data));
                initializeApp();
            })
            .catch(error => {
                console.error('Error loading study data:', error);
                initializeApp();
            });
    }
}

function switchTopic() {
    const dropdown = document.getElementById('topic-dropdown');
    currentTopic = dropdown.value;
    
    const title = document.getElementById('topic-title');
    title.textContent = currentTopic === 'topic1' ? 
        "Let's review Topic - 1 from GCSE TEXT BOOK" : 
        "Let's review Topic - 2 from GCSE TEXT BOOK";
    
    loadStudyData();
}

loadStudyData();

function initializeApp() {
    loadStudyTopics();
    loadQuizTopics();
    updateProgress();
    showStudy();
}

function showStudy() {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('study-section').classList.add('active');
    document.getElementById('study-btn').classList.add('active');
}

function showQuiz() {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('quiz-section').classList.add('active');
    document.getElementById('quiz-btn').classList.add('active');
}

function showProgress() {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('progress-section').classList.add('active');
    document.getElementById('progress-btn').classList.add('active');
    updateProgress();
}

function loadStudyTopics() {
    const container = document.getElementById('study-topics');
    if (!studyData.sections) return;
    
    container.innerHTML = studyData.sections.map(section => `
        <div class="swiper-slide">
            <div class="topic-card">
                <h3>${section.title}</h3>
                <div class="summary-preview">${section.summary.substring(0, 150).replace(/[#*]/g, '')}...</div>
                <div class="card-actions">
                    <button onclick="openStudyModal('${section.id}')" class="expand-btn">
                        📖 Study
                    </button>
                    <button onclick="startQuiz('${section.id}')" class="quiz-btn">
                        🧠 Quiz
                    </button>
                    <button onclick="markAsStudied('${section.id}')" class="study-btn">
                        ${userProgress.completedSections.includes(section.id) ? '✓ Done' : 'Mark Done'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    if (studySwiper) studySwiper.destroy();
    studySwiper = new Swiper('.study-swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            768: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
            }
        }
    });
}

function openStudyModal(sectionId) {
    const section = studyData.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const modal = document.createElement('div');
    modal.className = 'study-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${section.title}</h2>
                <button onclick="closeStudyModal()" class="close-btn">×</button>
            </div>
            <div class="modal-body">
                <div class="summary-content">${formatContent(section.summary)}</div>
                <div class="modal-actions">
                    <button onclick="editSummary('${section.id}')" class="edit-btn">✏️ Edit</button>
                    <button onclick="markAsStudied('${section.id}'); closeStudyModal();" class="study-btn">
                        ${userProgress.completedSections.includes(section.id) ? '✓ Mark as Reviewed' : 'Mark as Studied'}
                    </button>
                </div>
                <div class="edit-area" id="edit-${section.id}" style="display: none;">
                    <textarea id="textarea-${section.id}" class="edit-textarea"></textarea>
                    <div class="edit-actions">
                        <button onclick="saveSummary('${section.id}')" class="save-btn">Save</button>
                        <button onclick="cancelEdit('${section.id}')" class="cancel-btn">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeStudyModal();
    });
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscKey);
}

function closeStudyModal() {
    const modal = document.querySelector('.study-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEscKey);
        loadStudyTopics();
    }
}

function handleEscKey(e) {
    if (e.key === 'Escape') {
        closeStudyModal();
    }
}

function formatContent(content) {
    return content
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^## (.*$)/gm, '<h3>$1</h3>')
        .replace(/^• (.*$)/gm, '<li>$1</li>')
        .replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>')
        .replace(/^(.)/gm, '<p>$1')
        .replace(/<\/p><p>/g, '</p><p>')
        .replace(/<p><h3>/g, '<h3>')
        .replace(/<p><ul>/g, '<ul>')
        .replace(/<\/ul><\/p>/g, '</ul>');
}

function loadQuizTopics() {
    const container = document.getElementById('quiz-topics');
    if (!studyData.sections) return;
    
    container.innerHTML = studyData.sections.map(section => `
        <button onclick="startQuiz('${section.id}')" class="quiz-topic-btn">
            ${section.title}
        </button>
    `).join('');
}

function markAsStudied(sectionId) {
    const topicSectionId = `${currentTopic}_${sectionId}`;
    if (!userProgress.completedSections.includes(topicSectionId)) {
        userProgress.completedSections.push(topicSectionId);
        userProgress.studySessions++;
        saveProgress();
        loadStudyTopics();
        updateProgress();
    }
}

function startQuiz(sectionId) {
    const quizKey = `${currentTopic}_${sectionId}`;
    if (quizAttempted[quizKey]) {
        alert('You have already attempted this quiz. Only one attempt is allowed.');
        return;
    }
    
    const fileName = currentTopic === 'topic1' ? 'quiz_data.json' : 'quiz_data_topic2.json';
    
    fetch(fileName)
        .then(response => response.json())
        .then(quizData => {
            currentQuiz = quizData[sectionId] || [];
            currentQuestion = 0;
            quizScore = 0;
            
            showQuiz();
            document.getElementById('quiz-selection').style.display = 'none';
            document.getElementById('quiz-content').style.display = 'block';
            
            showQuestion();
        })
        .catch(error => {
            console.error('Error loading quiz:', error);
        });
}

function showQuestion() {
    if (currentQuestion >= currentQuiz.length) {
        showQuizResults();
        return;
    }
    
    const question = currentQuiz[currentQuestion];
    const container = document.getElementById('question-container');
    
    timeLeft = 15;
    startTimer();
    
    if (question.type === 'multiple') {
        container.innerHTML = `
            <div class="question">
                <div class="question-header">
                    <h3>Question ${currentQuestion + 1} of ${currentQuiz.length}</h3>
                    <div class="timer">Time: <span id="timer-display">15</span>s</div>
                </div>
                <p>${question.question}</p>
                <div class="options">
                    ${question.options.map((option, index) => `
                        <button onclick="selectAnswer(${index})" class="option-btn">
                            ${option}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="question">
                <div class="question-header">
                    <h3>Question ${currentQuestion + 1} of ${currentQuiz.length}</h3>
                    <div class="timer">Time: <span id="timer-display">15</span>s</div>
                </div>
                <p>${question.question}</p>
                <div class="short-answer">
                    <input type="text" id="short-answer" class="answer-input" placeholder="Type your answer...">
                    <button onclick="checkShortAnswer()" class="submit-btn">Submit</button>
                </div>
            </div>
        `;
    }
}

function startTimer() {
    clearInterval(quizTimer);
    quizTimer = setInterval(() => {
        timeLeft--;
        const display = document.getElementById('timer-display');
        if (display) display.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(quizTimer);
            autoMoveNext();
        }
    }, 1000);
}

function autoMoveNext() {
    const buttons = document.querySelectorAll('.option-btn');
    const input = document.getElementById('short-answer');
    
    if (buttons.length > 0) {
        buttons.forEach(btn => btn.disabled = true);
    }
    if (input) {
        input.disabled = true;
        input.style.backgroundColor = '#fed7d7';
    }
    
    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 1000);
}

function selectAnswer(selectedIndex) {
    clearInterval(quizTimer);
    const question = currentQuiz[currentQuestion];
    const buttons = document.querySelectorAll('.option-btn');
    
    buttons.forEach((btn, index) => {
        btn.disabled = true;
        if (index === question.correct) {
            btn.classList.add('correct');
        } else if (index === selectedIndex && index !== question.correct) {
            btn.classList.add('incorrect');
        }
    });
    
    if (selectedIndex === question.correct) {
        quizScore++;
    }
    
    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 1500);
}

function checkShortAnswer() {
    clearInterval(quizTimer);
    const question = currentQuiz[currentQuestion];
    const input = document.getElementById('short-answer');
    const userAnswer = input.value.toLowerCase().trim();
    const correctAnswer = question.answer.toLowerCase();
    
    const isCorrect = userAnswer === correctAnswer || userAnswer.includes(correctAnswer);
    
    input.disabled = true;
    input.style.backgroundColor = isCorrect ? '#c6f6d5' : '#fed7d7';
    input.style.color = isCorrect ? '#22543d' : '#742a2a';
    
    if (!isCorrect) {
        input.value = `${userAnswer} (Correct: ${question.answer})`;
    }
    
    if (isCorrect) {
        quizScore++;
    }
    
    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 2000);
}

function showQuizResults() {
    clearInterval(quizTimer);
    const percentage = Math.round((quizScore / currentQuiz.length) * 100);
    userProgress.quizAttempts++;
    userProgress.scores.push(percentage);
    
    // Mark quiz as attempted with topic prefix
    const lastSection = studyData.sections && studyData.sections.length > 0 ? 
        studyData.sections[0].id : 'default';
    const quizKey = `${currentTopic}_${lastSection}`;
    quizAttempted[quizKey] = true;
    localStorage.setItem('quizAttempted', JSON.stringify(quizAttempted));
    
    saveProgress();
    
    document.getElementById('quiz-content').style.display = 'none';
    document.getElementById('quiz-results').style.display = 'block';
    document.getElementById('quiz-results').innerHTML = `
        <h3>Quiz Complete!</h3>
        <div class="results">
            <p>Score: ${quizScore}/${currentQuiz.length} (${percentage}%)</p>
            <div class="result-message">
                ${percentage >= 80 ? '🎉 Excellent work!' : 
                  percentage >= 60 ? '👍 Good job!' : 
                  '📚 Keep studying!'}
            </div>
            <p class="attempt-note">⚠️ This was your only attempt for this topic</p>
            <button onclick="backToQuizSelection()" class="btn">Back to Topics</button>
        </div>
    `;
    
    updateProgress();
}

function resetQuiz() {
    currentQuestion = 0;
    quizScore = 0;
    document.getElementById('quiz-results').style.display = 'none';
    document.getElementById('quiz-content').style.display = 'block';
    showQuestion();
}

function backToQuizSelection() {
    document.getElementById('quiz-results').style.display = 'none';
    document.getElementById('quiz-content').style.display = 'none';
    document.getElementById('quiz-selection').style.display = 'block';
}

function updateProgress() {
    document.getElementById('study-count').textContent = userProgress.studySessions;
    document.getElementById('quiz-count').textContent = userProgress.quizAttempts;
    
    const avgScore = userProgress.scores.length > 0 
        ? Math.round(userProgress.scores.reduce((a, b) => a + b, 0) / userProgress.scores.length)
        : 0;
    document.getElementById('avg-score').textContent = avgScore + '%';
    
    const detailedContainer = document.getElementById('detailed-progress');
    if (studyData.sections) {
        detailedContainer.innerHTML = `
            <h3>Section Progress</h3>
            ${studyData.sections.map(section => `
                <div class="progress-item">
                    <span>${section.title}</span>
                    <span class="status ${userProgress.completedSections.includes(`${currentTopic}_${section.id}`) ? 'completed' : 'pending'}">
                        ${userProgress.completedSections.includes(`${currentTopic}_${section.id}`) ? '✓ Completed' : 'Not Started'}
                    </span>
                </div>
            `).join('')}
        `;
    }
}

function editSummary(sectionId) {
    const editDiv = document.getElementById(`edit-${sectionId}`);
    const textarea = document.getElementById(`textarea-${sectionId}`);
    
    editDiv.style.display = 'block';
    
    const section = studyData.sections.find(s => s.id === sectionId);
    textarea.value = section ? section.summary : '';
    textarea.focus();
}

function cancelEdit(sectionId) {
    const editDiv = document.getElementById(`edit-${sectionId}`);
    editDiv.style.display = 'none';
}

function saveSummary(sectionId) {
    const textarea = document.getElementById(`textarea-${sectionId}`);
    const editDiv = document.getElementById(`edit-${sectionId}`);
    
    const section = studyData.sections.find(s => s.id === sectionId);
    if (section) {
        section.summary = textarea.value;
        const savedKey = currentTopic === 'topic1' ? 'studyData' : 'studyDataTopic2';
        localStorage.setItem(savedKey, JSON.stringify(studyData));
    }
    
    editDiv.style.display = 'none';
    closeStudyModal();
    loadStudyTopics();
}

function saveProgress() {
    localStorage.setItem('psychologyProgress', JSON.stringify(userProgress));
}
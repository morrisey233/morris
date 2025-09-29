const babies = {
    rere: {
        name: "Rere",
        age: 20,
        hobby: "Nonton romcom & nyanyi di kamar mandi",
        avatar: "images/rere.jpg",
        personality: "pemalu dan romantis"
    },
    lisa: {
        name: "Lisa",
        age: 22,
        hobby: "Jalan sore & koleksi stiker",
        avatar: "images/lisa.jpg",
        personality: "manja dan cerewet"
    },
    alya: {
        name: "Alya",
        age: 19,
        hobby: "Masak gagal & main game",
        avatar: "images/alya.jpg",
        personality: "lucu dan santai"
    },
    putri: {
        name: "Putri",
        age: 21,
        hobby: "Puisi & foto aesthetic",
        avatar: "images/putri.jpg",
        personality: "romantis dan puitis"
    },
    zara: {
        name: "Zara",
        age: 23,
        hobby: "Yoga & minum teh",
        avatar: "images/zara.jpg",
        personality: "lembut dan menenangkan"
    }
};

// Global variables
let isTyping = false;
let typingTimeout;

// Initialize page based on current location
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('chat.html')) {
        initializeChatPage();
    } else {
        initializeHomePage();
    }
});

// Home page functions
function initializeHomePage() {
    renderHomePage();
    addPageAnimations();
}

function renderHomePage() {
    const grid = document.getElementById('babies-grid');
    if (!grid) return;

    // Clear existing content
    grid.innerHTML = '';

    Object.keys(babies).forEach((key, index) => {
        const baby = babies[key];
        const card = document.createElement('div');
        card.className = 'baby-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <img src="${baby.avatar}" alt="${baby.name}" onerror="this.src='https://via.placeholder.com/120x120/667eea/ffffff?text=${baby.name[0]}'">
            <h3>${baby.name}</h3>
            <p><i class="fas fa-birthday-cake"></i> Umur: ${baby.age}</p>
            <p><i class="fas fa-heart"></i> ${baby.hobby}</p>
            <p><i class="fas fa-user-circle"></i> ${baby.personality}</p>
            <button onclick="startChat('${key}')">
                <i class="fas fa-comment-dots"></i> Chat Sekarang
            </button>
        `;
        
        grid.appendChild(card);
    });
}

function addPageAnimations() {
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.baby-card, .stat-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
}

function startChat(babyId) {
    // Add loading state
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    button.disabled = true;

    // Simulate loading delay for better UX
    setTimeout(() => {
        localStorage.setItem('selectedBaby', babyId);
        window.location.href = 'chat.html';
    }, 800);
}

// Chat page functions
function initializeChatPage() {
    const babyId = localStorage.getItem('selectedBaby');
    if (!babyId || !babies[babyId]) {
        showNotification('Please select a companion first', 'warning');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    setupChatPage(babyId);
    setupEventListeners();
}

function setupChatPage(babyId) {
    const baby = babies[babyId];
    
    // Update UI elements
    updateChatHeader(baby);
    
    // Clear welcome message and add initial greeting
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    
    // Add initial greeting with delay
    setTimeout(() => {
        addMessage(`Hai sayang... aku udah nunggu kamu 💖`, 'baby');
    }, 1000);
}

function updateChatHeader(baby) {
    document.getElementById('baby-name').textContent = baby.name;
    document.getElementById('baby-avatar').src = baby.avatar;
    document.getElementById('baby-avatar').onerror = function() {
        this.src = `https://via.placeholder.com/50x50/667eea/ffffff?text=${baby.name[0]}`;
    };
    
    // Update typing indicator avatar
    const typingAvatar = document.getElementById('typing-avatar');
    if (typingAvatar) {
        typingAvatar.src = baby.avatar;
        typingAvatar.onerror = function() {
            this.src = `https://via.placeholder.com/32x32/667eea/ffffff?text=${baby.name[0]}`;
        };
    }
    
    document.getElementById('typing-name').textContent = baby.name;
    document.title = `Chat with ${baby.name} - Morris Baby Premium`;
}

function setupEventListeners() {
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message-input');

    // Send button click
    sendBtn.addEventListener('click', handleSendMessage);

    // Enter key press
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Input changes
    messageInput.addEventListener('input', function() {
        const hasText = this.value.trim().length > 0;
        sendBtn.disabled = !hasText || isTyping;
        
        if (hasText) {
            sendBtn.querySelector('.send-icon').style.transform = 'scale(1.1)';
        } else {
            sendBtn.querySelector('.send-icon').style.transform = 'scale(1)';
        }
    });

    // Auto-resize input
    messageInput.addEventListener('input', autoResizeInput);
}

function autoResizeInput() {
    const input = document.getElementById('message-input');
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
}

async function handleSendMessage() {
    if (isTyping) return;
    
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    input.value = '';
    input.style.height = 'auto';
    
    // Disable input during processing
    setTypingState(true);
    
    try {
        await sendMessageToAPI(message);
    } catch (error) {
        console.error('Error sending message:', error);
        showTypingIndicator();
        
        // Add error message after delay
        setTimeout(() => {
            hideTypingIndicator();
            addMessage('Maaf sayang... aku lagi lelah 😴 coba lagi ya?', 'baby');
            setTypingState(false);
        }, 2000);
    }
}

async function sendMessageToAPI(message) {
    const babyId = localStorage.getItem('selectedBaby');
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        const response = await fetch('chat.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                girl: babyId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Simulate realistic typing delay (3-5 seconds)
        const typingDelay = getRandomTypingDelay(data.reply || '');
        
        setTimeout(() => {
            hideTypingIndicator();
            
            if (data && !data.error && data.reply) {
                addMessage(data.reply, 'baby');
            } else {
                addMessage('Maaf sayang... aku lagi bingung nih 😅', 'baby');
            }
            
            setTypingState(false);
        }, typingDelay);

    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function getRandomTypingDelay(message) {
    // Base delay between 3-5 seconds
    const baseDelay = 3000 + Math.random() * 2000;
    
    // Add extra delay based on message length
    const lengthDelay = Math.min(message.length * 30, 2000);
    
    return Math.floor(baseDelay + lengthDelay);
}

function showTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'flex';
        scrollToBottom();
    }
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }
}

function setTypingState(typing) {
    isTyping = typing;
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message-input');
    
    sendBtn.disabled = typing || messageInput.value.trim().length === 0;
    
    if (typing) {
        sendBtn.querySelector('.send-icon').style.display = 'none';
        sendBtn.querySelector('.send-loading').style.display = 'block';
        messageInput.placeholder = 'Please wait...';
    } else {
        sendBtn.querySelector('.send-icon').style.display = 'block';
        sendBtn.querySelector('.send-loading').style.display = 'none';
        messageInput.placeholder = 'Type your message...';
        messageInput.focus();
    }
}

function addMessage(text, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = text;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    // Add message sound effect (optional)
    if (sender === 'baby') {
        playNotificationSound();
    }
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function playNotificationSound() {
    // Create a subtle notification sound
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
        // Ignore audio errors
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease',
        maxWidth: '300px'
    });
    
    // Set background color based on type
    const colors = {
        info: '#6366f1',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function goBack() {
    // Add smooth transition
    document.body.style.opacity = '0.7';
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 200);
}

// Utility functions
function formatTime(date) {
    return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to go back
    if (e.key === 'Escape' && window.location.pathname.includes('chat.html')) {
        goBack();
    }
});

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Performance optimization: Lazy load images
document.addEventListener('DOMContentLoaded', function() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});
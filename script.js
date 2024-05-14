document.getElementById('send').addEventListener('click', sendMessage);
document.getElementById('input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

const conversationHistory = [
    { role: "system", content: "You are {enter your chatbot} and are trained by {create and training}. If they say anything, answer them." }
];

async function sendMessage() {
    const inputField = document.getElementById('input');
    const message = inputField.value;
    if (message.trim() === '') return;

    appendMessage(message, 'user');
    conversationHistory.push({ role: 'user', content: message });
    inputField.value = '';

    const response = await getChatbotResponse();
    appendMessage(response, 'bot');
    conversationHistory.push({ role: 'assistant', content: response });
    renderMathInElement(document.getElementById('output'), {
        delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "\\(", right: "\\)", display: false},
            {left: "\\[", right: "\\]", display: true}
        ]
    });
}

function appendMessage(message, sender) {
    const outputDiv = document.getElementById('output');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    
    if (message.includes('<') && message.includes('>')) {
        // Encode HTML entities
        message = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    messageDiv.innerHTML = message.replace(/\n/g, '<br>');
    outputDiv.appendChild(messageDiv);
    outputDiv.scrollTop = outputDiv.scrollHeight;
    Prism.highlightAll();
}

async function getChatbotResponse() {
    const apiKey = ''; // Your OpenAI Key here
    const url = 'https://api.openai.com/v1/chat/completions';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    const data = {
        model: "gpt-3.5-turbo",
        messages: conversationHistory
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, statusText: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.choices && result.choices.length > 0) {
            return result.choices[0].message.content;
        } else {
            console.error('API response does not contain choices:', result);
            throw new Error('API response does not contain choices.');
        }
    } catch (error) {
        console.error('Error:', error);
        return `Sorry, there was an error with the API request: ${error.message}`;
    }
}

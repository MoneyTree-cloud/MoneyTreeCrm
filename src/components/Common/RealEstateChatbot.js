import { useEffect } from 'react';

const RealEstateChatbot = () => {

    const loadChatbotScript = () => {
        const script = document.createElement('script');
        script.src = 'https://mtrp1.in/assets/js/embed.js';
        script.id = 'real-estate-chatbot';
        script.dataset.websiteId = '454554';
        script.async = true;
        document.body.appendChild(script);
    };

    useEffect(() => {
        loadChatbotScript();
    }, []);

    return null;
};

export default RealEstateChatbot;

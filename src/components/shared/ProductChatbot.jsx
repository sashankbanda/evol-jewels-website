import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: Reverting to standard, explicit relative paths as the alias approach failed.
import { useVibe } from '../../context/VibeContext'; 
import { productData } from '../../data/productData';
import { MessageSquareText, Send, X, Loader2, ArrowDown } from 'lucide-react';

// Constant to hold the entire product data catalog as a string for the AI prompt
const productDataJson = JSON.stringify(productData);

// Initial messages to guide the user
const initialMessages = [
    { type: 'ai', text: "Hi there! I'm your Evol Jewels Product Assistant. Ask me anything about our collections, prices, or specifications!" },
];

/**
 * Utility function to convert simple Markdown (bold, list items) to HTML.
 * WARNING: This uses dangerouslySetInnerHTML, which is safe here as the source 
 * is a controlled AI prompt output, but should be used with caution in real apps.
 */
const renderMarkdown = (markdownText) => {
    // 1. Convert bolding: **text** -> <strong>text</strong>
    let html = markdownText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 2. Convert bullet points: * Item -> <li>Item</li> (within an ul)
    const lines = html.split('\n'); 
    let inList = false;
    let newLines = [];

    lines.forEach(line => {
        if (line.trim().startsWith('* ')) {
            const content = line.trim().substring(2);
            if (!inList) {
                newLines.push('<ul>');
                inList = true;
            }
            newLines.push(`<li>${content}</li>`);
        } else {
            if (inList) {
                newLines.push('</ul>');
                inList = false;
            }
            // Add a paragraph break for non-list content that isn't empty
            if (line.trim().length > 0) {
                 newLines.push(`<p>${line}</p>`);
            } else {
                 newLines.push('<br/>');
            }
        }
    });

    if (inList) {
        newLines.push('</ul>');
    }
    
    // Join everything back
    return newLines.join('');
};


const ProductChatbot = () => {
    
    // The previous error was specifically pointing to these paths:
    const { isDarkTheme, isChatOpen, toggleChat } = useVibe();
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef(null);

    // Dynamic Class Logic
    const floatingBtnClass = isDarkTheme ? 'bg-DAD5C1 text-111111 shadow-2xl hover:bg-D8CBAF' : 'bg-light-primary text-F5F5F5 shadow-2xl hover:bg-CC484D';
    const modalBg = isDarkTheme ? 'bg-2A2A2A border-DAD5C1/30' : 'bg-white border-gray-200';
    const inputBg = isDarkTheme ? 'bg-111111 text-F5F5F5 border-DAD5C1/30' : 'bg-white text-333333 border-gray-300';
    const aiMessageBg = isDarkTheme ? 'bg-DAD5C1/20 text-F5F5F5' : 'bg-gray-100 text-333333';
    const userMessageBg = 'bg-accent-platinum primary-cta'; // Use accent color for user messages

    // Auto-scroll to the bottom of the chat when new messages arrive
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Function to handle the API call to the backend
    const sendMessage = useCallback(async (userQuery) => {
        if (!userQuery.trim() || isLoading) return;

        // Add user message to state immediately
        const newUserMessage = { type: 'user', text: userQuery };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Implement exponential backoff for retry logic in case of temporary failure
            let result = null;
            let retries = 0;
            const maxRetries = 3;
            const initialDelay = 1000;

            const executeFetchWithRetry = async () => {
                try {
                    const response = await fetch('http://localhost:3001/api/product-chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            productDataJson: productDataJson, 
                            userQuery: userQuery 
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return await response.json();
                } catch (error) {
                    if (retries < maxRetries) {
                        retries++;
                        const delay = initialDelay * Math.pow(2, retries - 1);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        // Recursively try again
                        return executeFetchWithRetry(); 
                    }
                    throw error; // Throw after max retries
                }
            };
            
            result = await executeFetchWithRetry();
            
            // Add the AI's response to state
            const aiResponseText = result?.answer || "I'm sorry, I couldn't get an answer right now. Please try again.";
            setMessages(prev => [...prev, { type: 'ai', text: aiResponseText }]);

        } catch (error) {
            console.error("Chat API Error:", error);
            setMessages(prev => [...prev, { type: 'ai', text: "It looks like my connection is down. Try checking your backend server." }]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    if (!isChatOpen) {
        // Floating Chat Button (bottom-right)
        return (
            <button 
                onClick={toggleChat} 
                className={`fixed bottom-4 right-4 z-40 p-4 rounded-full transition-all duration-300 ${floatingBtnClass}`} 
                aria-label="Open Product Chatbot"
            >
                <MessageSquareText size={28} />
            </button>
        );
    }

    // Chat Modal UI
    return (
        // Chat Modal Container (bottom-right)
        <div 
            className={`fixed bottom-4 right-4 z-50 w-full max-w-sm h-[80vh] md:h-[600px] flex flex-col rounded-2xl shadow-2xl transition-all duration-300 ${modalBg} border-2 overflow-hidden`} 
        >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 shadow-md ${isDarkTheme ? 'bg-111111 text-DAD5C1' : 'bg-light-secondary text-F5F5F5'}`}>
                <div className='flex items-center'>
                    <MessageSquareText size={20} className='mr-2' />
                    <h3 className="text-xl font-serif font-bold">Product Vibe Assistant</h3>
                </div>
                <button onClick={toggleChat} className="p-1 rounded-full hover:opacity-70 transition">
                    <X size={20} />
                </button>
            </div>

            {/* Message Display Area */}
            <div 
                ref={chatContainerRef}
                className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar
            >
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div 
                            className={`max-w-[85%] p-3 rounded-xl shadow-md font-sans text-base leading-snug break-words ${msg.type === 'user' ? `${userMessageBg} text-111111 rounded-br-none` : `${aiMessageBg} rounded-tl-none`}`}
                        >
                            {/* RENDER MARKDOWN HERE */}
                            {msg.type === 'user' ? (
                                msg.text
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className={`p-3 rounded-xl shadow-md font-sans text-sm italic ${aiMessageBg}`}>
                            <Loader2 size={16} className='animate-spin inline mr-2' /> Assistant is typing...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${isDarkTheme ? 'border-DAD5C1/30' : 'border-gray-300'}`}>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about a product..."
                        className={`flex-1 p-3 rounded-xl focus:outline-none focus:ring-1 ${inputBg} ${isDarkTheme ? 'focus:ring-DAD5C1' : 'focus:ring-light-primary'}`}
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isLoading}
                        className={`p-3 rounded-xl primary-cta disabled:opacity-50 transition-opacity`}
                    >
                        <Send size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductChatbot;

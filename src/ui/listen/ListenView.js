import { html, css, LitElement } from '../assets/lit-core-2.7.4.min.js';
import { parser, parser_write, parser_end, default_renderer } from '../assets/smd.js';
import './stt/SttView.js';
import './summary/SummaryView.js';

export class ListenView extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 400px;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.2s ease-out;
            will-change: transform, opacity;
        }

        :host(.hiding) {
            animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.6, 1) forwards;
        }

        :host(.showing) {
            animation: slideDown 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        :host(.hidden) {
            opacity: 0;
            transform: translateY(-150%) scale(0.85);
            pointer-events: none;
        }


        * {
            font-family: 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            cursor: default;
            user-select: none;
        }

/* Allow text selection in insights responses */
.insights-container, .insights-container *, .markdown-content {
    user-select: text !important;
    cursor: text !important;
}

/* highlight.js 스타일 추가 */
.insights-container pre {
    background: rgba(0, 0, 0, 0.4) !important;
    border-radius: 8px !important;
    padding: 12px !important;
    margin: 8px 0 !important;
    overflow-x: auto !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    white-space: pre !important;
    word-wrap: normal !important;
    word-break: normal !important;
}

.insights-container code {
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace !important;
    font-size: 11px !important;
    background: transparent !important;
    white-space: pre !important;
    word-wrap: normal !important;
    word-break: normal !important;
}

.insights-container pre code {
    white-space: pre !important;
    word-wrap: normal !important;
    word-break: normal !important;
    display: block !important;
}

.insights-container p code {
    background: rgba(255, 255, 255, 0.1) !important;
    padding: 2px 4px !important;
    border-radius: 3px !important;
    color: #ffd700 !important;
}

.hljs-keyword {
    color: #ff79c6 !important;
}

.hljs-string {
    color: #f1fa8c !important;
}

.hljs-comment {
    color: #6272a4 !important;
}

.hljs-number {
    color: #bd93f9 !important;
}

.hljs-function {
    color: #50fa7b !important;
}

.hljs-title {
    color: #50fa7b !important;
}

.hljs-variable {
    color: #8be9fd !important;
}

.hljs-built_in {
    color: #ffb86c !important;
}

.hljs-attr {
    color: #50fa7b !important;
}

.hljs-tag {
    color: #ff79c6 !important;
}
        .assistant-container {
            display: flex;
            flex-direction: column;
            color: #ffffff;
            box-sizing: border-box;
            position: relative;
            background: rgba(0, 0, 0, 0.6);
            overflow: hidden;
            border-radius: 12px;
            width: 100%;
            height: 100%;
        }

        .assistant-container::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 12px;
            padding: 1px;
            background: linear-gradient(169deg, rgba(255, 255, 255, 0.17) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.17) 100%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: destination-out;
            mask-composite: exclude;
            pointer-events: none;
        }

        .assistant-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.15);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            z-index: -1;
        }

        .top-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 8px 4px 12px;
            min-height: 36px;
            position: relative;
            z-index: 1;
            width: 100%;
            box-sizing: border-box;
            flex-shrink: 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tab-bar {
            display: flex;
            gap: 2px;
            align-items: center;
            flex: 1;
        }

        .tab-btn {
            background: transparent;
            color: rgba(255, 255, 255, 0.45);
            border: none;
            outline: none;
            box-shadow: none;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: color 0.15s ease, background-color 0.15s ease;
            white-space: nowrap;
        }

        .tab-btn:hover {
            color: rgba(255, 255, 255, 0.8);
            background: rgba(255, 255, 255, 0.07);
        }

        .tab-btn.active {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.12);
        }

        .bar-controls {
            display: flex;
            gap: 4px;
            align-items: center;
            flex-shrink: 0;
            justify-content: flex-end;
            box-sizing: border-box;
            padding: 4px;
        }

        .content-area {
            position: relative;
            flex: 1;
            overflow: hidden;
            min-height: 120px;
        }

        .ai-response-container {
            padding: 12px 16px 16px 16px;
            min-height: 120px;
            max-height: 480px;
            overflow-y: auto;
            user-select: text;
            cursor: text;
        }

        .ai-response-container::-webkit-scrollbar {
            width: 6px;
        }
        .ai-response-container::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.1);
            border-radius: 3px;
        }
        .ai-response-container::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.2);
            border-radius: 3px;
        }

        .ai-question {
            font-size: 11px;
            color: rgba(255,255,255,0.4);
            margin-bottom: 10px;
            font-style: italic;
            border-left: 2px solid rgba(255,255,255,0.15);
            padding-left: 8px;
        }

        .ai-response-text {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.6;
            word-break: break-word;
        }

        .ai-response-text p {
            margin: 0 0 10px 0;
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.6;
        }

        .ai-response-text p:first-child {
            margin-top: 0;
        }

        .ai-response-text p:last-child {
            margin-bottom: 0;
        }

        .ai-response-text h1,
        .ai-response-text h2,
        .ai-response-text h3,
        .ai-response-text h4,
        .ai-response-text h5,
        .ai-response-text h6 {
            color: rgba(255, 255, 255, 0.98);
            font-weight: 600;
            margin: 14px 0 6px 0;
            line-height: 1.4;
        }

        .ai-response-text h1:first-child,
        .ai-response-text h2:first-child,
        .ai-response-text h3:first-child {
            margin-top: 0;
        }

        .ai-response-text ul,
        .ai-response-text ol {
            margin: 6px 0 10px 0;
            padding-left: 20px;
        }

        .ai-response-text li {
            margin: 4px 0;
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.5;
        }

        .ai-response-text strong,
        .ai-response-text b {
            font-weight: 600;
            color: rgba(255, 255, 255, 0.98);
        }

        .ai-response-text em,
        .ai-response-text i {
            font-style: italic;
            color: rgba(255, 255, 255, 0.85);
        }

        .ai-response-text code {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.95);
            padding: 1px 5px;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 12px;
        }

        .ai-response-text pre {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            padding: 10px 12px;
            margin: 8px 0;
            overflow-x: auto;
        }

        .ai-response-text pre code {
            background: none;
            padding: 0;
            font-size: 11px;
        }

        .ai-response-text blockquote {
            border-left: 3px solid rgba(255, 255, 255, 0.25);
            margin: 8px 0;
            padding: 6px 12px;
            color: rgba(255, 255, 255, 0.75);
        }

        .cursor-blink {
            display: inline-block;
            animation: cursorPulse 0.8s step-end infinite;
            color: rgba(255,255,255,0.5);
            font-size: 12px;
        }

        @keyframes cursorPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }

        .ai-empty {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.3);
            padding-top: 20px;
            text-align: center;
        }

        .ai-thinking {
            display: flex;
            gap: 5px;
            align-items: center;
            padding: 24px 0;
            justify-content: center;
        }

        .thinking-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            animation: thinkingPulse 1.2s ease-in-out infinite;
        }

        .thinking-dot:nth-child(2) { animation-delay: 0.2s; }
        .thinking-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes thinkingPulse {
            0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
        }

        .quick-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            padding: 8px 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.07);
        }

        .action-btn {
            background: rgba(255, 255, 255, 0.08);
            color: rgba(255, 255, 255, 0.75);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 20px;
            padding: 4px 12px;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.15s ease, color 0.15s ease;
            white-space: nowrap;
            outline: none;
        }

        .action-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            color: rgba(255, 255, 255, 0.95);
        }

        .input-row {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px 10px 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.07);
        }

        .input-row input {
            flex: 1;
            background: rgba(255, 255, 255, 0.07);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 10px;
            padding: 7px 12px;
            color: rgba(255, 255, 255, 0.9);
            font-size: 12px;
            outline: none;
            font-family: 'Helvetica Neue', sans-serif;
            transition: border-color 0.15s ease;
            cursor: text;
            user-select: text;
        }

        .input-row input::placeholder {
            color: rgba(255, 255, 255, 0.3);
        }

        .input-row input:focus {
            border-color: rgba(255, 255, 255, 0.3);
        }

        .input-row input:disabled {
            opacity: 0.5;
        }

        .send-btn {
            background: rgba(147, 51, 234, 0.7);
            color: white;
            border: none;
            border-radius: 8px;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            flex-shrink: 0;
            transition: background-color 0.15s ease;
            outline: none;
            padding: 0;
        }

        .send-btn:hover:not(:disabled) {
            background: rgba(147, 51, 234, 0.9);
        }

        .send-btn:disabled {
            opacity: 0.4;
            cursor: default;
        }

        .copy-button {
            background: transparent;
            color: rgba(255, 255, 255, 0.9);
            border: none;
            outline: none;
            box-shadow: none;
            padding: 4px;
            border-radius: 3px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 24px;
            height: 24px;
            flex-shrink: 0;
            transition: background-color 0.15s ease;
            position: relative;
            overflow: hidden;
        }

        .copy-button:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        .copy-button svg {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
        }

        .copy-button .check-icon {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }

        .copy-button.copied .copy-icon {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }

        .copy-button.copied .check-icon {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }

        .timer {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 10px;
            color: rgba(255, 255, 255, 0.7);
        }
        
        /* ────────────────[ GLASS BYPASS ]─────────────── */
        :host-context(body.has-glass) .assistant-container,
        :host-context(body.has-glass) .top-bar,
        :host-context(body.has-glass) .tab-btn,
        :host-context(body.has-glass) .copy-button,
        :host-context(body.has-glass) .action-btn,
        :host-context(body.has-glass) .input-row,
        :host-context(body.has-glass) .input-row input,
        :host-context(body.has-glass) .send-btn,
        :host-context(body.has-glass) .ai-response-container,
        :host-context(body.has-glass) .transcription-container,
        :host-context(body.has-glass) .insights-container,
        :host-context(body.has-glass) .stt-message,
        :host-context(body.has-glass) .outline-item,
        :host-context(body.has-glass) .request-item,
        :host-context(body.has-glass) .markdown-content,
        :host-context(body.has-glass) .insights-container pre,
        :host-context(body.has-glass) .insights-container p code,
        :host-context(body.has-glass) .insights-container pre code {
            background: transparent !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            filter: none !important;
            backdrop-filter: none !important;
        }

        :host-context(body.has-glass) .assistant-container::before,
        :host-context(body.has-glass) .assistant-container::after {
            display: none !important;
        }

        :host-context(body.has-glass) .toggle-button:hover,
        :host-context(body.has-glass) .copy-button:hover,
        :host-context(body.has-glass) .outline-item:hover,
        :host-context(body.has-glass) .request-item.clickable:hover,
        :host-context(body.has-glass) .markdown-content:hover {
            background: transparent !important;
            transform: none !important;
        }

        :host-context(body.has-glass) .transcription-container::-webkit-scrollbar-track,
        :host-context(body.has-glass) .transcription-container::-webkit-scrollbar-thumb,
        :host-context(body.has-glass) .insights-container::-webkit-scrollbar-track,
        :host-context(body.has-glass) .insights-container::-webkit-scrollbar-thumb {
            background: transparent !important;
        }
        :host-context(body.has-glass) * {
            animation: none !important;
            transition: none !important;
            transform: none !important;
            filter: none !important;
            backdrop-filter: none !important;
            box-shadow: none !important;
        }

        :host-context(body.has-glass) .assistant-container,
        :host-context(body.has-glass) .stt-message,
        :host-context(body.has-glass) .toggle-button,
        :host-context(body.has-glass) .copy-button {
            border-radius: 0 !important;
        }

        :host-context(body.has-glass) ::-webkit-scrollbar,
        :host-context(body.has-glass) ::-webkit-scrollbar-track,
        :host-context(body.has-glass) ::-webkit-scrollbar-thumb {
            background: transparent !important;
            width: 0 !important;      /* 스크롤바 자체 숨기기 */
        }
        :host-context(body.has-glass) .assistant-container,
        :host-context(body.has-glass) .top-bar,
        :host-context(body.has-glass) .toggle-button,
        :host-context(body.has-glass) .copy-button,
        :host-context(body.has-glass) .transcription-container,
        :host-context(body.has-glass) .insights-container,
        :host-context(body.has-glass) .stt-message,
        :host-context(body.has-glass) .outline-item,
        :host-context(body.has-glass) .request-item,
        :host-context(body.has-glass) .markdown-content,
        :host-context(body.has-glass) .insights-container pre,
        :host-context(body.has-glass) .insights-container p code,
        :host-context(body.has-glass) .insights-container pre code {
            background: transparent !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            filter: none !important;
            backdrop-filter: none !important;
        }

        :host-context(body.has-glass) .assistant-container::before,
        :host-context(body.has-glass) .assistant-container::after {
            display: none !important;
        }

        :host-context(body.has-glass) .tab-btn:hover,
        :host-context(body.has-glass) .copy-button:hover,
        :host-context(body.has-glass) .action-btn:hover,
        :host-context(body.has-glass) .outline-item:hover,
        :host-context(body.has-glass) .request-item.clickable:hover,
        :host-context(body.has-glass) .markdown-content:hover {
            background: transparent !important;
            transform: none !important;
        }

        :host-context(body.has-glass) .transcription-container::-webkit-scrollbar-track,
        :host-context(body.has-glass) .transcription-container::-webkit-scrollbar-thumb,
        :host-context(body.has-glass) .insights-container::-webkit-scrollbar-track,
        :host-context(body.has-glass) .insights-container::-webkit-scrollbar-thumb {
            background: transparent !important;
        }
        :host-context(body.has-glass) * {
            animation: none !important;
            transition: none !important;
            transform: none !important;
            filter: none !important;
            backdrop-filter: none !important;
            box-shadow: none !important;
        }

        :host-context(body.has-glass) .assistant-container,
        :host-context(body.has-glass) .stt-message,
        :host-context(body.has-glass) .tab-btn,
        :host-context(body.has-glass) .copy-button {
            border-radius: 0 !important;
        }

        :host-context(body.has-glass) ::-webkit-scrollbar,
        :host-context(body.has-glass) ::-webkit-scrollbar-track,
        :host-context(body.has-glass) ::-webkit-scrollbar-thumb {
            background: transparent !important;
            width: 0 !important;
        }
    `;

    static properties = {
        activeTab: { type: String },
        isHovering: { type: Boolean },
        isAnimating: { type: Boolean },
        copyState: { type: String },
        elapsedTime: { type: String },
        captureStartTime: { type: Number },
        isSessionActive: { type: Boolean },
        hasCompletedRecording: { type: Boolean },
        // Ask state
        askCurrentResponse: { type: String },
        askCurrentQuestion: { type: String },
        askIsLoading: { type: Boolean },
        askIsStreaming: { type: Boolean },
        inputValue: { type: String },
    };

    constructor() {
        super();
        this.isSessionActive = false;
        this.hasCompletedRecording = false;
        this.activeTab = 'ai-response';
        this.isHovering = false;
        this.isAnimating = false;
        this.elapsedTime = '00:00';
        this.captureStartTime = null;
        this.timerInterval = null;
        this.adjustHeightThrottle = null;
        this.isThrottled = false;
        this.copyState = 'idle';
        this.copyTimeout = null;
        this.askCurrentResponse = '';
        this.askCurrentQuestion = '';
        this.askIsLoading = false;
        this.askIsStreaming = false;
        this.inputValue = '';

        this._smdParser = null;
        this._smdContainer = null;
        this._lastProcessedLength = 0;

        this.adjustWindowHeight = this.adjustWindowHeight.bind(this);
        this.handleSendMessage = this.handleSendMessage.bind(this);
        this.handleInputKeydown = this.handleInputKeydown.bind(this);
    }

    _resetSmdParser() {
        this._smdParser = null;
        this._smdContainer = null;
        this._lastProcessedLength = 0;
    }

    _renderAiResponse() {
        const container = this.shadowRoot?.getElementById('aiResponseContent');
        if (!container) return;

        if (this.askIsLoading && !this.askCurrentResponse) {
            container.innerHTML = '';
            this._resetSmdParser();
            return;
        }

        if (!this.askCurrentResponse) {
            container.innerHTML = '';
            this._resetSmdParser();
            return;
        }

        try {
            if (!this._smdParser || this._smdContainer !== container) {
                this._smdContainer = container;
                this._smdContainer.innerHTML = '';
                const renderer = default_renderer(this._smdContainer);
                this._smdParser = parser(renderer);
                this._lastProcessedLength = 0;
            }

            const newText = this.askCurrentResponse.slice(this._lastProcessedLength);
            if (newText.length > 0) {
                parser_write(this._smdParser, newText);
                this._lastProcessedLength = this.askCurrentResponse.length;
            }

            if (!this.askIsStreaming && !this.askIsLoading) {
                parser_end(this._smdParser);
            }
        } catch (error) {
            console.error('Error rendering AI response markdown:', error);
            container.textContent = this.askCurrentResponse;
        }
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.isSessionActive) {
            this.startTimer();
        }
        if (window.api) {
            window.api.listenView.onSessionStateChanged((event, { isActive }) => {
                const wasActive = this.isSessionActive;
                this.isSessionActive = isActive;

                if (!wasActive && isActive) {
                    this.hasCompletedRecording = false;
                    this.startTimer();
                    this.updateComplete.then(() => {
                        const sttView = this.shadowRoot.querySelector('stt-view');
                        const summaryView = this.shadowRoot.querySelector('summary-view');
                        if (sttView) sttView.resetTranscript();
                        if (summaryView) summaryView.resetAnalysis();
                    });
                    this.requestUpdate();
                }
                if (wasActive && !isActive) {
                    this.hasCompletedRecording = true;
                    this.stopTimer();
                    this.requestUpdate();
                }
            });

            // Listen to ask state updates from the backend
            window.api.askView.onAskStateUpdate((event, state) => {
                const hadResponse = this.askCurrentResponse || this.askIsLoading || this.askIsStreaming;
                this.askCurrentResponse = state.currentResponse || '';
                this.askCurrentQuestion = state.currentQuestion || '';
                this.askIsLoading = state.isLoading || false;
                this.askIsStreaming = state.isStreaming || false;
                // Auto-switch to AI Response tab when response arrives
                if ((state.isLoading || state.isStreaming || state.currentResponse) && this.activeTab !== 'ai-response') {
                    this.activeTab = 'ai-response';
                }
                this.requestUpdate();
                this.adjustWindowHeightThrottled();
            });
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.stopTimer();

        if (this.adjustHeightThrottle) {
            clearTimeout(this.adjustHeightThrottle);
            this.adjustHeightThrottle = null;
        }
        if (this.copyTimeout) {
            clearTimeout(this.copyTimeout);
        }
    }

    startTimer() {
        this.captureStartTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.captureStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            this.elapsedTime = `${minutes}:${seconds}`;
            this.requestUpdate();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    adjustWindowHeight() {
        if (!window.api) return;

        this.updateComplete
            .then(() => {
                const topBar = this.shadowRoot.querySelector('.top-bar');
                const quickActions = this.shadowRoot.querySelector('.quick-actions');
                const inputRow = this.shadowRoot.querySelector('.input-row');

                let activeContent;
                if (this.activeTab === 'transcript') {
                    activeContent = this.shadowRoot.querySelector('stt-view');
                } else if (this.activeTab === 'ai-response') {
                    activeContent = this.shadowRoot.querySelector('.ai-response-container');
                } else {
                    activeContent = this.shadowRoot.querySelector('summary-view');
                }

                if (!topBar) return;

                const topBarHeight = topBar.offsetHeight;
                const contentHeight = activeContent ? activeContent.scrollHeight : 150;
                const quickActionsHeight = quickActions ? quickActions.offsetHeight : 0;
                const inputRowHeight = inputRow ? inputRow.offsetHeight : 0;

                const idealHeight = topBarHeight + contentHeight + quickActionsHeight + inputRowHeight;
                const targetHeight = Math.min(700, Math.max(260, idealHeight));

                window.api.listenView.adjustWindowHeight('listen', targetHeight);
            })
            .catch(error => {
                console.error('Error in adjustWindowHeight:', error);
            });
    }

    async handleCopy() {
        if (this.copyState === 'copied') return;

        let textToCopy = '';

        if (this.activeTab === 'transcript') {
            const sttView = this.shadowRoot.querySelector('stt-view');
            textToCopy = sttView ? sttView.getTranscriptText() : '';
        } else if (this.activeTab === 'ai-response') {
            textToCopy = this.askCurrentResponse || '';
        } else {
            const summaryView = this.shadowRoot.querySelector('summary-view');
            textToCopy = summaryView ? summaryView.getSummaryText() : '';
        }

        try {
            await navigator.clipboard.writeText(textToCopy);
            this.copyState = 'copied';
            this.requestUpdate();

            if (this.copyTimeout) clearTimeout(this.copyTimeout);
            this.copyTimeout = setTimeout(() => {
                this.copyState = 'idle';
                this.requestUpdate();
            }, 1500);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    adjustWindowHeightThrottled() {
        if (this.isThrottled) return;

        this.adjustWindowHeight();
        this.isThrottled = true;
        this.adjustHeightThrottle = setTimeout(() => {
            this.isThrottled = false;
        }, 16);
    }

    updated(changedProperties) {
        super.updated(changedProperties);

        if (changedProperties.has('activeTab')) {
            this.adjustWindowHeight();
            if (this.activeTab === 'ai-response') {
                this._resetSmdParser();
                this._renderAiResponse();
            }
        }

        if (changedProperties.has('askCurrentResponse') || changedProperties.has('askIsLoading') || changedProperties.has('askIsStreaming')) {
            this._renderAiResponse();
        }
    }

    handleSttMessagesUpdated() {
        this.adjustWindowHeightThrottled();
    }

    firstUpdated() {
        super.firstUpdated();
        setTimeout(() => this.adjustWindowHeight(), 200);
    }

    async handleSendMessage(promptOverride) {
        const text = typeof promptOverride === 'string' ? promptOverride : this.inputValue.trim();
        if (!text || this.askIsLoading || this.askIsStreaming) return;

        this.inputValue = '';
        const inputEl = this.shadowRoot?.getElementById('listenTextInput');
        if (inputEl) inputEl.value = '';

        if (window.api) {
            try {
                await window.api.listenView.sendMessageFromListen(text);
            } catch (err) {
                console.error('Error sending message from listen view:', err);
            }
        }
    }

    handleInputKeydown(e) {
        if (e.isComposing) return;
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSendMessage();
        }
    }

    handleInputChange(e) {
        this.inputValue = e.target.value;
    }

    getInputPlaceholder() {
        if (this.activeTab === 'transcript') return 'Ask about the transcript...';
        if (this.activeTab === 'ai-response') return 'Ask a follow-up...';
        return 'Ask about the meeting...';
    }

    render() {
        const isBusy = this.askIsLoading || this.askIsStreaming;

        return html`
            <div class="assistant-container">
                <!-- Top bar with tabs and timer -->
                <div class="top-bar">
                    <div class="tab-bar">
                        <button class="tab-btn ${this.activeTab === 'ai-response' ? 'active' : ''}" @click=${() => { this.activeTab = 'ai-response'; }}>AI Response</button>
                        <button class="tab-btn ${this.activeTab === 'transcript' ? 'active' : ''}" @click=${() => { this.activeTab = 'transcript'; }}>Transcript</button>
                        <button class="tab-btn ${this.activeTab === 'activity' ? 'active' : ''}" @click=${() => { this.activeTab = 'activity'; }}>Activity</button>
                    </div>
                    <div class="bar-controls">
                        ${this.isSessionActive ? html`<span class="timer">${this.elapsedTime}</span>` : ''}
                        <button
                            class="copy-button ${this.copyState === 'copied' ? 'copied' : ''}"
                            @click=${this.handleCopy}
                        >
                            <svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                            </svg>
                            <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Content area -->
                <div class="content-area">
                    <stt-view
                        .isVisible=${this.activeTab === 'transcript'}
                        @stt-messages-updated=${this.handleSttMessagesUpdated}
                    ></stt-view>

                    <summary-view
                        .isVisible=${this.activeTab === 'activity'}
                        .hasCompletedRecording=${this.hasCompletedRecording}
                    ></summary-view>

                    ${this.activeTab === 'ai-response' ? html`
                        <div class="ai-response-container">
                            ${isBusy && !this.askCurrentResponse ? html`
                                <div class="ai-thinking">
                                    <span class="thinking-dot"></span>
                                    <span class="thinking-dot"></span>
                                    <span class="thinking-dot"></span>
                                </div>
                            ` : this.askCurrentResponse ? html`
                                ${this.askCurrentQuestion ? html`
                                    <div class="ai-question">${this.askCurrentQuestion}</div>
                                ` : ''}
                                <div class="ai-response-text" id="aiResponseContent"></div>
                                ${isBusy ? html`<span class="cursor-blink">▋</span>` : ''}
                            ` : html`
                                <div class="ai-empty">No response yet. Ask a question below.</div>
                            `}
                        </div>
                    ` : ''}
                </div>

                <!-- Quick action buttons -->
                <div class="quick-actions">
                    <button class="action-btn" @click=${() => this.handleSendMessage('Recap the conversation so far')}>Recap</button>
                    <button class="action-btn" @click=${() => this.handleSendMessage('What should I say next?')}>What should I say?</button>
                    <button class="action-btn" @click=${() => this.handleSendMessage('Suggest follow-up questions')}>Follow-up question</button>
                    <button class="action-btn" @click=${() => this.handleSendMessage('List action items from this conversation')}>Action items</button>
                </div>

                <!-- Persistent input -->
                <div class="input-row">
                    <input
                        type="text"
                        id="listenTextInput"
                        .value=${this.inputValue}
                        placeholder="${this.getInputPlaceholder()}"
                        @input=${this.handleInputChange}
                        @keydown=${this.handleInputKeydown}
                        ?disabled=${isBusy}
                    />
                    <button class="send-btn" @click=${this.handleSendMessage} ?disabled=${isBusy || !this.inputValue.trim()}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }
}

customElements.define('listen-view', ListenView);

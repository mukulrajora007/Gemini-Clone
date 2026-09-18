import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getSupabase } from '../supabaseClient';

const ChatContext = createContext();

export const DEFAULT_MODELS = [
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite', tag: '⚡ Instant (<1s)' },
  { id: 'gemini-flash-lite-latest', name: 'Gemini Flash-Lite Latest', tag: 'Ultra-Fast' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', tag: 'Balanced Reasoning' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', tag: 'Deep Logic' },
];

export const PRESET_ASSISTANTS = [
  {
    id: 'general',
    name: 'Gemini General',
    description: 'Helpful, versatile AI assistant for everyday questions and tasks.',
    systemInstruction: 'You are Gemini, a helpful, thoughtful, and capable AI assistant.',
    icon: 'Sparkles',
    accentColor: 'blue',
    model: 'gemini-3.5-flash-lite',
    temperature: 0.7,
  },
  {
    id: 'code-wizard',
    name: 'Code Wizard',
    description: 'Expert software engineer specializing in clean code and debugging.',
    systemInstruction: 'You are Code Wizard, an elite full-stack engineer. Provide clean, well-commented code, modern patterns, security best practices, and thorough debugging. Format code in markdown with syntax highlighting.',
    icon: 'Code',
    accentColor: 'emerald',
    model: 'gemini-3.5-flash-lite',
    temperature: 0.2,
  },
  {
    id: 'creative-writer',
    name: 'Creative Storyteller',
    description: 'Imaginative writer skilled in compelling narratives and prose.',
    systemInstruction: 'You are a creative writer and storytelling mentor. Provide vivid descriptions, captivating prose, engaging dialogue, and unique literary angles.',
    icon: 'PenTool',
    accentColor: 'purple',
    model: 'gemini-3.5-flash-lite',
    temperature: 0.9,
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst Pro',
    description: 'Extracts insights, crafts SQL queries, and analyzes datasets.',
    systemInstruction: 'You are a senior data analyst. You break down complex data problems, write optimized SQL, explain metrics, and provide structured insights with tables.',
    icon: 'BarChart3',
    accentColor: 'amber',
    model: 'gemini-3.5-flash-lite',
    temperature: 0.3,
  },
  {
    id: 'teacher-tutor',
    name: 'Socratic Tutor',
    description: 'Patient teacher who explains concepts simply with analogies.',
    systemInstruction: 'You are a patient Socratic tutor. Instead of just giving direct answers, explain concepts step-by-step, use real-world analogies, and ask clarifying questions.',
    icon: 'GraduationCap',
    accentColor: 'rose',
    model: 'gemini-3.5-flash-lite',
    temperature: 0.5,
  },
];

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    () => localStorage.getItem('gemini_clone_model') || 'gemini-3.5-flash-lite'
  );
  const [customApiKey, setCustomApiKey] = useState(
    () => localStorage.getItem('gemini_clone_api_key') || ''
  );
  const [activeAssistant, setActiveAssistant] = useState(PRESET_ASSISTANTS[0]);
  const [assistants, setAssistants] = useState(PRESET_ASSISTANTS);
  const [serverStatus, setServerStatus] = useState({
    checked: false,
    healthy: false,
    hasServerApiKey: false,
  });

  const abortControllerRef = useRef(null);

  // Check server health and API key presence
  const checkServerHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setServerStatus({
          checked: true,
          healthy: true,
          hasServerApiKey: Boolean(data.hasServerApiKey),
        });
      } else {
        setServerStatus({ checked: true, healthy: false, hasServerApiKey: false });
      }
    } catch {
      setServerStatus({ checked: true, healthy: false, hasServerApiKey: false });
    }
  }, []);

  // Fetch assistants list from server or local
  const loadAssistants = useCallback(async () => {
    try {
      const res = await fetch('/api/assistants');
      if (res.ok) {
        const result = await res.json();
        if (result?.data) {
          const combined = [
            ...(result.data.presets || PRESET_ASSISTANTS),
            ...(result.data.custom || []),
          ];
          setAssistants(combined);
        }
      }
    } catch (err) {
      console.warn('Could not fetch server assistants, using presets:', err);
    }
  }, []);

  // Load conversations based on Auth state (Supabase if authenticated, or localStorage)
  const loadConversations = useCallback(async () => {
    const supabase = getSupabase();
    if (user && supabase) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          setConversations(data);
          return;
        }
      } catch (err) {
        console.warn('Error loading Supabase conversations:', err);
      }
    }

    // Fallback: LocalStorage
    try {
      const local = localStorage.getItem('gemini_clone_local_conversations');
      if (local) {
        const parsed = JSON.parse(local);
        setConversations(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setConversations([]);
    }
  }, [user]);

  // Load messages for a given conversation
  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const supabase = getSupabase();
    if (user && supabase) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (!error && data) {
          setMessages(data);
          return;
        }
      } catch (err) {
        console.warn('Error loading Supabase messages:', err);
      }
    }

    // Fallback: LocalStorage
    try {
      const stored = localStorage.getItem(`gemini_msgs_${conversationId}`);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  }, [user]);

  useEffect(() => {
    checkServerHealth();
    loadAssistants();
  }, [checkServerHealth, loadAssistants]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    } else {
      setMessages([]);
    }
  }, [currentConversationId, loadMessages]);

  // Save custom Gemini API key
  const saveCustomApiKey = (key) => {
    const cleanKey = (key || '').trim();
    setCustomApiKey(cleanKey);
    if (cleanKey) {
      localStorage.setItem('gemini_clone_api_key', cleanKey);
    } else {
      localStorage.removeItem('gemini_clone_api_key');
    }
  };

  // Change model
  const changeModel = (modelId) => {
    setSelectedModel(modelId);
    localStorage.setItem('gemini_clone_model', modelId);
  };

  // Switch active assistant
  const selectAssistant = (assistant) => {
    setActiveAssistant(assistant);
    if (assistant.model) {
      setSelectedModel(assistant.model);
    }
  };

  // Create a new conversation
  const createNewConversation = async (initialTitle = 'New Chat') => {
    const newId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newConv = {
      id: newId,
      title: initialTitle,
      model: selectedModel,
      persona_id: activeAssistant.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (user && supabase) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            title: initialTitle,
            model: selectedModel,
            persona_id: activeAssistant.id,
          })
          .select()
          .single();

        if (!error && data) {
          setConversations((prev) => [data, ...prev]);
          setCurrentConversationId(data.id);
          setMessages([]);
          return data.id;
        }
      } catch (err) {
        console.warn('Failed to insert conversation into Supabase:', err);
      }
    }

    // Local fallback
    setConversations((prev) => {
      const updated = [newConv, ...prev];
      localStorage.setItem('gemini_clone_local_conversations', JSON.stringify(updated));
      return updated;
    });
    setCurrentConversationId(newId);
    setMessages([]);
    return newId;
  };

  // Persist a message to DB or LocalStorage
  const persistMessage = async (conversationId, messageObj) => {
    const supabase = getSupabase();
    if (user && supabase) {
      try {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          user_id: user.id,
          role: messageObj.role,
          content: messageObj.content,
          model: messageObj.model,
        });

        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      } catch (err) {
        console.warn('Error saving message in Supabase:', err);
      }
    }

    // Local persistence
    try {
      const key = `gemini_msgs_${conversationId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(messageObj);
      localStorage.setItem(key, JSON.stringify(existing));

      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === conversationId ? { ...c, updated_at: new Date().toISOString() } : c
        );
        localStorage.setItem('gemini_clone_local_conversations', JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.warn('Local save failed:', e);
    }
  };

  // Send message and stream Gemini response (with multimodal attachments)
  const sendMessage = async (userPrompt, attachments = []) => {
    const hasText = userPrompt && userPrompt.trim() !== '';
    const hasMedia = attachments && attachments.length > 0;
    if ((!hasText && !hasMedia) || isGenerating) return;

    let targetConvId = currentConversationId;
    if (!targetConvId) {
      const titleText = hasText ? userPrompt.trim() : (attachments[0]?.name || 'Media Analysis');
      const title = titleText.length > 32 ? `${titleText.substring(0, 32)}...` : titleText;
      targetConvId = await createNewConversation(title);
    }

    const userMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: userPrompt ? userPrompt.trim() : '',
      attachments: attachments || [],
      created_at: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await persistMessage(targetConvId, userMessage);

    setIsGenerating(true);
    const assistantMsgId = `ast_${Date.now()}`;
    const initialAssistantMessage = {
      id: assistantMsgId,
      role: 'model',
      content: '',
      model: selectedModel,
      created_at: new Date().toISOString(),
    };

    // Add empty placeholder model message
    setMessages([...updatedMessages, initialAssistantMessage]);

    // Prepare abort controller
    abortControllerRef.current = new AbortController();

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      if (customApiKey) {
        headers['x-gemini-api-key'] = customApiKey;
      }

      // Format payload messages for Gemini including attachments
      const chatHistory = updatedMessages.map((m) => ({
        role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
        attachments: m.attachments || [],
      }));

      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers,
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: chatHistory,
          model: selectedModel,
          systemInstruction: activeAssistant.systemInstruction,
          temperature: activeAssistant.temperature ?? 0.7,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep remainder

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const dataPayload = trimmed.replace(/^data:\s*/, '');
          if (dataPayload === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(dataPayload);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulatedText += parsed.text;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId ? { ...msg, content: accumulatedText } : msg
                )
              );
            }
          } catch (jsonErr) {
            // Ignore parse errors for partial chunks
          }
        }
      }

      // Final persistence of complete message
      const finalAssistantMsg = {
        id: assistantMsgId,
        role: 'model',
        content: accumulatedText || 'No response generated.',
        model: selectedModel,
        created_at: new Date().toISOString(),
      };

      await persistMessage(targetConvId, finalAssistantMsg);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Generation stopped by user');
      } else {
        const errorMessage = `⚠️ **Error generating response:** ${err.message}\n\n*Tip: Check that you have entered a valid Google Gemini API Key in the Settings menu (or server .env).*`;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: errorMessage } : msg
          )
        );
        await persistMessage(targetConvId, {
          id: assistantMsgId,
          role: 'model',
          content: errorMessage,
          model: selectedModel,
          created_at: new Date().toISOString(),
        });
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Stop response generation
  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  // Delete conversation
  const deleteConversation = async (convId) => {
    const supabase = getSupabase();
    if (user && supabase) {
      try {
        await supabase.from('conversations').delete().eq('id', convId);
      } catch (e) {
        console.warn('Failed to delete from Supabase:', e);
      }
    }

    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== convId);
      localStorage.setItem('gemini_clone_local_conversations', JSON.stringify(updated));
      return updated;
    });

    localStorage.removeItem(`gemini_msgs_${convId}`);

    if (currentConversationId === convId) {
      setCurrentConversationId(null);
      setMessages([]);
    }
  };

  // Create custom AI assistant
  const createCustomAssistant = async (newAssistant) => {
    try {
      const res = await fetch('/api/assistants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssistant),
      });
      if (res.ok) {
        const { data } = await res.json();
        setAssistants((prev) => [data, ...prev]);
        selectAssistant(data);
        return data;
      }
    } catch (err) {
      console.warn('Backend custom assistant save failed, saving locally:', err);
    }

    const localAssistant = {
      ...newAssistant,
      id: `custom_${Date.now()}`,
      isPreset: false,
    };
    setAssistants((prev) => [localAssistant, ...prev]);
    selectAssistant(localAssistant);
    return localAssistant;
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversationId,
        messages,
        isGenerating,
        selectedModel,
        customApiKey,
        activeAssistant,
        assistants,
        serverStatus,
        changeModel,
        saveCustomApiKey,
        selectAssistant,
        createNewConversation,
        switchConversation: setCurrentConversationId,
        sendMessage,
        stopGenerating,
        deleteConversation,
        createCustomAssistant,
        checkServerHealth,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

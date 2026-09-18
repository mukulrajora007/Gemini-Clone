import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import AssistantModal from './components/AssistantModal';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] w-full bg-gemini-dark text-gemini-text overflow-hidden relative">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAssistantModal={() => setIsAssistantModalOpen(true)}
      />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#131314]">
        <Header
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        <main className="flex-1 flex flex-col min-h-0 relative">
          <ChatArea />
          <ChatInput onOpenSettings={() => setIsSettingsOpen(true)} />
        </main>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <AssistantModal
        isOpen={isAssistantModalOpen}
        onClose={() => setIsAssistantModalOpen(false)}
      />
    </div>
  );
}

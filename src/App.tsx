/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { MessageCard } from './components/MessageCard';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { Message } from './types';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channels, setChannels] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = messages;

    if (selectedChannel) {
      result = result.filter(msg => msg.channel === selectedChannel);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(msg => 
        msg.text.toLowerCase().includes(term) || 
        msg.channel.toLowerCase().includes(term)
      );
    }

    setFilteredMessages(result);
  }, [messages, selectedChannel, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/data.json');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data: Message[] = await response.json();
      
      // Sort by date descending
      data.sort((a, b) => b.timestamp - a.timestamp);
      
      setMessages(data);
      setFilteredMessages(data);
      
      // Extract unique channels
      const uniqueChannels = Array.from(new Set(data.map(msg => msg.channel)));
      setChannels(uniqueChannels);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Filter size={20} />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Telegram Archive</h1>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              
              <select
                value={selectedChannel || ''}
                onChange={(e) => setSelectedChannel(e.target.value || null)}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="">All Channels</option>
                {channels.map(channel => (
                  <option key={channel} value={channel}>@{channel}</option>
                ))}
              </select>

              <button
                onClick={fetchData}
                className="p-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-zinc-500">
              Showing {filteredMessages.length} messages
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMessages.map((msg) => (
                <MessageCard key={msg.id} message={msg} />
              ))}
            </div>

            {filteredMessages.length === 0 && (
              <div className="text-center py-20 text-zinc-400">
                <p>No messages found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}


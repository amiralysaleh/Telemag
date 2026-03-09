import React from 'react';
import { Copy, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';
import { Message } from '../types';

interface MessageCardProps {
  message: Message;
}

export const MessageCard: React.FC<MessageCardProps> = ({ message }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    // Ideally show a toast here
  };

  return (
    <div
      className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md">
              @{message.channel}
            </span>
            <span className="text-xs text-zinc-500">
              {new Date(message.timestamp).toLocaleString()}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              title="Copy text"
            >
              <Copy size={16} />
            </button>
            <a
              href={message.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              title="Open in Telegram"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {message.text && (
          <div className="prose prose-sm dark:prose-invert max-w-none mb-4 whitespace-pre-wrap font-sans text-sm text-zinc-700 dark:text-zinc-300 break-words">
            {message.text.split(/(https?:\/\/[^\s]+)/g).map((part, i) => 
              part.match(/https?:\/\/[^\s]+/) ? (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                  {part}
                </a>
              ) : part
            )}
          </div>
        )}

        {message.images && message.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {message.images.map((img, idx) => (
              <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={img}
                  alt={`Attachment ${idx + 1}`}
                  className="object-cover w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        )}

        {message.files && message.files.length > 0 && (
          <div className="space-y-2">
            {message.files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <div className="p-2 bg-zinc-200 dark:bg-zinc-700 rounded-md">
                  <FileText size={16} className="text-zinc-600 dark:text-zinc-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {file.size}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Plus, MoreVertical, Trash2, Pin, Search, Edit2, Check, X } from "lucide-react";
import { AiSession } from "@/services/aiStorage.service";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface SidebarHistoryProps {
  sessions: AiSession[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

export function SidebarHistory({ sessions, activeSessionId, onSelect, onNew, onDelete, onTogglePin, onRename }: SidebarHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredSessions = sessions.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const pinned = filteredSessions.filter(s => s.isPinned);
  const recent = filteredSessions.filter(s => !s.isPinned);

  const startEditing = (e: React.MouseEvent, session: AiSession) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleRename = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const SessionItem = ({ session }: { session: AiSession }) => (
    <div 
      className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
        activeSessionId === session.id 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      }`}
      onClick={() => onSelect(session.id)}
    >
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
        {editingId === session.id ? (
          <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
            <Input 
              value={editTitle} 
              onChange={e => setEditTitle(e.target.value)}
              className="h-6 text-xs p-1 w-full border-primary"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleRename(e as any, session.id);
                if (e.key === 'Escape') cancelRename(e as any);
              }}
            />
            <Button variant="ghost" size="icon" className="h-6 w-6 text-success shrink-0" onClick={e => handleRename(e, session.id)}>
              <Check className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={cancelRename}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <span className="truncate text-sm">{session.title}</span>
        )}
      </div>
      {!editingId && (
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTogglePin(session.id); }}>
            <Pin className="h-4 w-4 mr-2" />
            {session.isPinned ? 'Unpin' : 'Pin'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => startEditing(e, session)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-4 space-y-3">
        <Button onClick={onNew} className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20 shadow-none border-0">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-8 h-8 text-xs bg-muted/30 border-transparent focus-visible:bg-background" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-6 pt-0">
        {pinned.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-muted-foreground px-2 mb-2 uppercase tracking-wider">Pinned</div>
            {pinned.map(s => <SessionItem key={s.id} session={s} />)}
          </div>
        )}
        <div className="space-y-1">
          <div className="text-xs font-semibold text-muted-foreground px-2 mb-2 uppercase tracking-wider">Recent</div>
          {recent.length > 0 ? (
            recent.map(s => <SessionItem key={s.id} session={s} />)
          ) : (
            <div className="px-2 text-sm text-muted-foreground/50 italic">No recent chats</div>
          )}
        </div>
      </div>
    </div>
  );
}

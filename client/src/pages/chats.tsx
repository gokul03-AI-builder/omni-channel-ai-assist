import { MessageSquare } from "lucide-react";

export default function ChatsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground" data-testid="page-chats">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <MessageSquare className="w-7 h-7 text-primary opacity-60" />
      </div>
      <h3 className="font-semibold text-foreground mb-1" data-testid="text-no-chats">No active chats</h3>
      <p className="text-sm">Waiting for customer sessions...</p>
    </div>
  );
}

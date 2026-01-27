import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquareQuote, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const location = useLocation();

  const ADMIN_PHONE = "6282387025429"; 

  const handleSend = () => {
    if (!message.trim()) return;

    const greeting = "Halo Admin, saya ingin memberikan feedback/laporan:";
    const currentPage = `Halaman: ${window.location.origin}${location.pathname}`;
    const userMessage = `Pesan: ${message}`;
    const fullMessage = `${greeting}\n\n${userMessage}\n\n${currentPage}`;
    const encodedMessage = encodeURIComponent(fullMessage);
    const waUrl = `https://wa.me/${ADMIN_PHONE}?text=${encodedMessage}`;
    window.open(waUrl, '_blank');

    setMessage('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <MessageSquareQuote className="w-7 h-7" />
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kirim Feedback</DialogTitle>
          <DialogDescription>
            Temukan bug atau butuh fitur baru? Beritahu admin langsung via WhatsApp.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="feedback">Pesan Feedback</Label>
            <Textarea
              id="feedback"
              placeholder="Contoh: Tolong update bagian input tiket agar bisa upload gambar..."
              className="col-span-3 min-h-[100px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSend} disabled={!message.trim()} className="gap-2">
            <Send className="w-4 h-4" />
            Kirim ke WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
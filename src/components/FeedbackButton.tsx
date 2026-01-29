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
import Groq from "groq-sdk";
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const location = useLocation();
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const ADMIN_PHONE = "6282387025429"; 

  const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const handleAskAI = async () => {
    if (!message.trim()) return;
    setIsLoading(true);
    setAiResponse("");
    
    try {
      const { data: tickets, error: dbError } = await supabase
        .from('tickets')
        .select('site_code, kategori, status, created_at, jenis_gangguan')
        .order('created_at', { ascending: false })
        .limit(5);

      if (dbError) throw new Error("Gagal mengambil data tiket");

      const formattedData = tickets?.map(t => ({
        ...t,
        created_at: new Date(t.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }),
        jenis_gangguan: t.jenis_gangguan || "Tidak ada detail"
      }));

      const ticketContext = JSON.stringify(formattedData, null, 2);
      const currentTime = new Date().toLocaleString('id-ID');
        
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Kamu adalah asisten cerdas untuk SiTiket. 
            Waktu saat ini: ${currentTime}.

            DATA TIKET (HANYA UNTUK REFERENSI KAMU, JANGAN TAMPILKAN KE USER):
            ${ticketContext}

            ATURAN MENJAWAB (PENTING):
            1. JANGAN PERNAH menampilkan format JSON, array, atau object mentah dalam jawabanmu.
            2. Jawablah dengan bahasa Indonesia yang natural, sopan, dan seperti manusia.
            3. Rangkum informasi dari data di atas. Contoh: "Ada tiket baru di site X dengan status Y..."
            4. Jika data kosong/null, katakan saja "tidak ada informasi", jangan tulis "null".`
          },
          {
            role: "user",
            content: message,
          },
        ],
        model: "groq/compound",
        temperature: 0.3,
      });

      setAiResponse(chatCompletion.choices[0]?.message?.content || "Maaf, tidak ada respon.");
    } catch (error) {
      setAiResponse("Error: Gagal menghubungi AI.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bantuan & Feedback</DialogTitle>
          <DialogDescription>
            Pilih metode bantuan yang Anda butuhkan.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="wa" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="wa">Lapor Admin (WA)</TabsTrigger>
            <TabsTrigger value="ai">Tanya AI</TabsTrigger>
          </TabsList>

          <TabsContent value="wa">
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="feedback">Pesan Laporan</Label>
                <Textarea
                  id="feedback"
                  placeholder="Contoh: Tolong update bagian input tiket agar bisa upload gambar..."
                  className="col-span-3 min-h-[100px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit" onClick={handleSend} disabled={!message.trim()} className="gap-2 w-full sm:w-auto">
                <Send className="w-4 h-4" />
                Kirim ke WhatsApp
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="ai-question">Pertanyaan</Label>
              <Textarea
                id="ai-question"
                placeholder="Contoh: Bagaimana cara membuat tiket atau solusi error..."
                className="min-h-[100px]"
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {aiResponse && (
              <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                <p className="font-semibold mb-1 flex items-center gap-2">
                  🤖 Jawaban Asisten:
                </p>
                <ReactMarkdown>{aiResponse}</ReactMarkdown>
              </div>
            )}

            <Button 
              onClick={handleAskAI} 
              disabled={isLoading || !message.trim()} 
              className="w-full"
              variant="secondary"
            >
              {isLoading ? "Sedang Berpikir..." : "Tanya Asisten Virtual"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
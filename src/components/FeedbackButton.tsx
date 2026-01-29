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
            content: `Kamu adalah Asisten Virtual cerdas untuk aplikasi SiTiket. 
            Waktu saat ini: ${currentTime}.

            DATA TIKET TERBARU:
            ${ticketContext}

            TUGAS ANDA:
            1. Jawab pertanyaan user dengan gaya bahasa profesional namun ramah (seperti Customer Service senior).
            2. Gunakan format Markdown yang SANGAT RAPI.
            3. Gunakan HEADING 3 (###) untuk judul bagian.
            4. Gunakan BOLD (**) untuk poin penting (Site Code, Status).
            5. Gunakan BLOCKQUOTE (>) untuk kesimpulan atau saran penting.
            6. Jika user bertanya status, buat daftar dengan bullet points yang jelas.
            7. JANGAN tampilkan JSON mentah.`
          },
          {
            role: "user",
            content: message,
          },
        ],
        model: "groq/compound",
        temperature: 0.5,
      });

      setAiResponse(chatCompletion.choices[0]?.message?.content || "Maaf, tidak ada respon.");
      setMessage('');
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
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-primary/5 border border-primary/10 rounded-lg text-sm shadow-inner max-h-[250px] overflow-y-auto"
              >
                <p className="font-bold mb-3 flex items-center gap-2 text-primary">
                  <span className="text-lg">🤖</span> Jawaban Asisten:
                </p>
                <div className="text-foreground/90 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-4 space-y-2" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-4 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="pl-1" {...props} />,
                      p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-primary" {...props} />,
                    }}
                  >
                    {aiResponse}
                  </ReactMarkdown>
                </div>
              </motion.div>
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
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
import { MessageSquareQuote, Send, Loader2, Bot, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Groq from "groq-sdk";
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const SUGGESTED_QUESTIONS = [
  "Apa status tiket terbaru?",
  "Ada gangguan apa hari ini?",
  "Siapa teknisi yang sedang bertugas?",
  "Apa kendala umum yang sering terjadi?"
];

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

  const handleAskAI = async (textToAsk?: string) => {
    const question = typeof textToAsk === 'string' ? textToAsk : message;
    if (!question.trim()) return;

    if (typeof textToAsk === 'string') {
      setMessage(textToAsk);
    }

    setIsLoading(true);
    setAiResponse("");

    try {
      const { data: tickets, error: dbError } = await supabase
        .from('tickets')
        .select(`
          id,
          site_code,
          site_name,
          kategori,
          status,
          created_at,
          jenis_gangguan,
          perbaikan,
          kendala,
          penyebab,
          teknisi_list,
          sisa_ttr_hours,
          lokasi_text
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (dbError) throw new Error("Gagal mengambil data tiket");

      const formattedData = tickets?.map(t => ({
        Ticket_ID: t.id.substring(0, 8) + "...",
        Lokasi: `${t.site_name} (${t.site_code})`,
        Status: t.status,
        Kategori: t.kategori,
        Waktu_Dibuat: new Date(t.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }),
        Gangguan: t.jenis_gangguan || "Tidak ada detail",
        Teknisi: t.teknisi_list && t.teknisi_list.length > 0 ? t.teknisi_list.join(", ") : "Belum ada teknisi",
        Progress_Perbaikan: t.perbaikan || "Belum ada update perbaikan",
        Kendala_Lapangan: t.kendala || "-",
        Penyebab: t.penyebab || "Masih investigasi",
        Sisa_SLA: `${t.sisa_ttr_hours} Jam`
      }));

      const ticketContext = JSON.stringify(formattedData, null, 2);
      const currentTime = new Date().toLocaleString('id-ID');

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Kamu adalah Asisten Virtual cerdas untuk aplikasi SiTiket (Sistem Monitoring Tiket). 
            Waktu saat ini: ${currentTime}.

            DATA 10 TIKET TERAKHIR:
            ${ticketContext}

            TUGAS ANDA:
            1. Jawab pertanyaan user secara langsung dan informatif.
            2. Gunakan data tiket di atas sebagai referensi utama jika user bertanya tentang status, kendala, atau progress.
            3. Jika user bertanya tentang tiket spesifik, analisis field 'Kendala_Lapangan' atau 'Progress_Perbaikan'.
            4. Gaya bahasa: Profesional, Solutif, dan Ramah (seperti Senior Support Engineer).
            5. FORMATTING:
               - Gunakan **Bold** untuk poin penting (Nama Site, Status, Teknisi).
               - Gunakan list bullet/numbering untuk keterbacaan.
               - JANGAN gunakan heading (#) yang terlalu besar, maksimal Heading 3 (###).
               - JANGAN tampilkan raw JSON.
            
            DISCLAIMER: Jika data tidak ditemukan, katakan dengan sopan bahwa data tiket tersebut tidak ada di 10 tiket terakhir.`
          },
          {
            role: "user",
            content: question,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.6,
        max_tokens: 1024,
        top_p: 1,
        stream: true,
        stop: null
      });

      for await (const chunk of completion) {
        setAiResponse((prev) => prev + (chunk.choices[0]?.delta?.content || ""));
      }
      setMessage('');
    } catch (error) {
      setAiResponse("Maaf, terjadi kesalahan saat menghubungi asisten virtual. Silakan coba lagi nanti.");
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
            <TabsTrigger value="ai" className="gap-2">
              <Bot className="w-4 h-4" />
              Tanya AI
            </TabsTrigger>
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

          <TabsContent value="ai" className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid gap-2">
              <Label htmlFor="ai-question">Pertanyaan</Label>
              <Textarea
                id="ai-question"
                placeholder="Contoh: Bagaimana progress tiket site PBR123?"
                className="min-h-[100px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAskAI();
                  }
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-2 justify-start font-normal text-muted-foreground hover:text-primary hover:border-primary/50 whitespace-normal text-left"
                    onClick={() => handleAskAI(q)}
                    disabled={isLoading}
                  >
                    <ChevronRight className="w-3 h-3 mr-1 shrink-0" />
                    {q}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => handleAskAI()}
              disabled={isLoading || !message.trim()}
              className="w-full"
              variant="secondary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sedang Berpikir...
                </>
              ) : (
                "Tanya Asisten Virtual"
              )}
            </Button>

            <AnimatePresence>
              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-4 bg-primary/5 border border-primary/10 rounded-lg text-sm shadow-inner overflow-hidden"
                >
                  <p className="font-bold mb-3 flex items-center gap-2 text-primary">
                    <span className="text-lg">🤖</span> Jawaban Asisten:
                  </p>
                  <div className="text-foreground/90 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        ol: ({ node, ...props }) => <ol className="list-decimal ml-5 mb-4 space-y-2" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc ml-5 mb-4 space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-bold text-primary" {...props} />,
                      }}
                    >
                      {aiResponse + (isLoading ? " ▍" : "")}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
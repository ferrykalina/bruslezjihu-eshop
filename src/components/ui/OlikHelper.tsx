import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Award, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  options?: string[];
}

export function OlikHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'Ahoj! 🏒 Jsem hokejový poradce Olík. Rád ti pomůžu vybrat ideální brusle a výstroj. Jaká je tvá hráčská úroveň?',
      options: ['Hobby / Začátečník', 'Amatérská liga / Pokročilý', 'Poloprofesionál / Profík']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const navigate = useNavigate();

  // Průběh dotazování
  const [step, setStep] = useState(1);
  const [userAnswers, setUserAnswers] = useState({
    level: '',
    frequency: '',
    budget: ''
  });

  const handleOptionClick = (option: string) => {
    // Přidáme zprávu od uživatele
    const newMessages = [...messages, { sender: 'user', text: option } as ChatMessage];

    if (step === 1) {
      setUserAnswers(prev => ({ ...prev, level: option }));
      setStep(2);
      newMessages.push({
        sender: 'bot',
        text: 'Super! A jak často chodíš týdně na led?',
        options: ['1x týdně', '2x až 3x týdně', '4x a více (intenzivní trénink)']
      });
    } else if (step === 2) {
      setUserAnswers(prev => ({ ...prev, frequency: option }));
      setStep(3);
      newMessages.push({
        sender: 'bot',
        text: 'Rozumím. A jaký máš přibližný rozpočet na nové brusle?',
        options: ['Do 5 000 Kč', '5 000 Kč - 12 000 Kč', 'Chci to nejlepší (bez limitu)']
      });
    } else if (step === 3) {
      setUserAnswers(prev => ({ ...prev, budget: option }));
      setStep(4);
      
      // AI Vyhodnocení doporučení
      let recommendation = '';
      if (option.includes('Do 5 000')) {
        recommendation = 'Doporučuji ti brusle CCM Tacks AS-550 nebo Bauer Supreme M1. Jsou ideální pro lehčí váhu, odpouštějí chyby a jsou neskutečně pohodlné hned po vybalení.';
      } else if (option.includes('12 000')) {
        recommendation = 'Pro tvé potřeby jsou skvělé brusle Bauer Vapor 3X nebo CCM Super Tacks AS-580. Nabízejí výborný poměr cena/výkon, tepelně tvarovatelný skelet a pevnější nože pro ostřejší oblouky.';
      } else {
        recommendation = 'Bez váhání zvol Bauer Vapor Hyperlite 2 nebo CCM Jetspeed FT6 Pro. To je absolutní technologická špička. Extrémně lehký kompozit, karbonové nože a maximální přenos energie do odrazu.';
      }

      newMessages.push({
        sender: 'bot',
        text: `📊 **Mám pro tebe výsledek:** \n\n${recommendation}\n\nChceš se rovnou podívat do katalogu na tyto modely?`,
        options: ['👉 Ukázat doporučené brusle', 'Zkusit doporučení znovu']
      });
    } else if (step === 4) {
      if (option.includes('Ukázat')) {
        navigate('/katalog');
        setIsOpen(false);
      } else {
        // Reset
        setStep(1);
        newMessages.push({
          sender: 'bot',
          text: 'Pojďme na to znovu! Jaká je tvá hráčská úroveň?',
          options: ['Hobby / Začátečník', 'Amatérská liga / Pokročilý', 'Poloprofesionál / Profík']
        });
      }
    }

    setMessages(newMessages);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const newMessages = [...messages, { sender: 'user', text: userText } as ChatMessage];
    setInputText('');

    // Pre-programmed smart bot replies
    let botReply = 'Zajímavý dotaz! Doporučuji se zeptat přímo na naší prodejně v Českých Budějovicích nebo napsat na e-mail info@bruslezjihu.cz.';
    
    const query = userText.toLowerCase();
    if (query.includes('doprava') || query.includes('posta') || query.includes('dhl')) {
      botReply = 'Dopravu u nás máš zdarma při nákupu nad 2 500 Kč! Posíláme přes Zásilkovnu (79 Kč) nebo DHL (120 Kč).';
    } else if (query.includes('brouseni') || query.includes('ostri')) {
      botReply = 'Ano, brusle ti rádi nabrousíme! Můžeš si v košíku přikoupit službu "První profesionální nabroušení bruslí" za 199 Kč a brusle dorazí připravené na led.';
    } else if (query.includes('velikost') || query.includes('tabulka')) {
      botReply = 'Nevíš si rady s velikostí? Otevři si detail libovolného produktu a klikni na "📐 Průvodce velikostí (Size Advisor)" – kalkulačka ti doporučí přesnou velikost v mm.';
    } else if (query.includes('sleva') || query.includes('kod') || query.includes('kupon')) {
      botReply = 'Přihlas se do Olíkova bonusového klubu! Získáš body za každý nákup, které pak v košíku uplatníš jako slevu.';
    }

    newMessages.push({
      sender: 'bot',
      text: botReply
    });

    setMessages(newMessages);
  };

  return (
    <>
      {/* FLOATING BANNER / MASCOT BUTTON */}
      <div className="fixed bottom-6 right-6 z-[150] select-none">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-primary/30 transition-all overflow-visible border-2 border-white/20"
        >
          {isOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <div className="relative flex items-center justify-center w-full h-full">
              {/* Pulsing indicator ring */}
              <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping scale-110" />
              {/* Mascot avatar mockup */}
              <span className="text-3xl">🤖</span>
            </div>
          )}
        </motion.button>
      </div>

      {/* CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-full max-w-sm bg-white/95 backdrop-blur-md border border-border shadow-2xl rounded-3xl z-[150] overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="bg-primary p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <div>
                  <h4 className="font-outfit font-bold text-sm leading-tight">Olíkův AI Hokejový Poradce</h4>
                  <span className="text-[10px] text-white/70 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online & aktivní
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className="space-y-2">
                  <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-muted/60 text-foreground border border-border/60 rounded-tl-none'
                      }`}
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {msg.text}
                    </div>
                  </div>

                  {/* Options suggestions buttons */}
                  {msg.sender === 'bot' && msg.options && (
                    <div className="flex flex-col gap-1.5 pl-2">
                      {msg.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOptionClick(opt)}
                          className="w-fit text-left px-3 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary text-[11px] font-bold text-primary rounded-xl transition-all"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendText} className="border-t border-border p-3 flex gap-2 bg-muted/20">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Zeptej se Olíka na cokoliv..."
                className="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:border-primary text-xs bg-white"
              />
              <button
                type="submit"
                className="p-2 bg-primary hover:bg-primary/95 text-white rounded-xl shadow transition-colors flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

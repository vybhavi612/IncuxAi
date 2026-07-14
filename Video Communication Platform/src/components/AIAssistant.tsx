"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, BrainCircuit, ListTodo, Globe, Play, Square } from "lucide-react";

interface TranscriptLine {
  time: string;
  speaker: string;
  text: string;
}

const BOT_SPEECHES = [
  { speaker: "Alex Rivera", text: "Alright team, thanks for joining. Let's run through the Q3 release schedule." },
  { speaker: "Sarah Jenkins", text: "I have finished setting up the collaborative whiteboard canvas in the staging app." },
  { speaker: "David Chen", text: "Perfect. I'll make sure the database is configured to sync messages properly." },
  { speaker: "Alex Rivera", text: "Excellent. Let's target Thursday morning for our production deployment." },
  { speaker: "Sarah Jenkins", text: "Should I write the unit tests for WebRTC signaling components before then?" },
  { speaker: "Alex Rivera", text: "Yes please, let's keep test coverage above 85% to be safe." }
];

const TRANSLATIONS: { [key: string]: { [key: string]: string } } = {
  Spanish: {
    "Alright team, thanks for joining. Let's run through the Q3 release schedule.": "Muy bien equipo, gracias por unirse. Repasemos el calendario de lanzamientos del tercer trimestre.",
    "I have finished setting up the collaborative whiteboard canvas in the staging app.": "He terminado de configurar el lienzo de pizarra colaborativa en la aplicación de prueba.",
    "Perfect. I'll make sure the database is configured to sync messages properly.": "Perfecto. Me aseguraré de que la base de datos esté configurada para sincronizar los mensajes correctamente.",
    "Excellent. Let's target Thursday morning for our production deployment.": "Excelente. Apuntemos al jueves por la mañana para nuestro despliegue en producción.",
    "Should I write the unit tests for WebRTC signaling components before then?": "¿Debería escribir las pruebas unitarias para los componentes de señalización WebRTC antes de esa fecha?",
    "Yes please, let's keep test coverage above 85% to be safe.": "Sí, por favor, mantengamos la cobertura de pruebas por encima del 85% para estar seguros."
  },
  French: {
    "Alright team, thanks for joining. Let's run through the Q3 release schedule.": "Très bien l'équipe, merci de vous joindre à nous. Passons en revue le calendrier des sorties du troisième trimestre.",
    "I have finished setting up the collaborative whiteboard canvas in the staging app.": "J'ai fini de configurer le tableau blanc collaboratif dans l'application de staging.",
    "Perfect. I'll make sure the database is configured to sync messages properly.": "Parfait. Je vais m'assurer que la base de données est configurée pour synchroniser correctement les messages.",
    "Excellent. Let's target Thursday morning for our production deployment.": "Excellent. Visons jeudi matin pour notre déploiement en production.",
    "Should I write the unit tests for WebRTC signaling components before then?": "Dois-je écrire les tests unitaires pour les composants de signalisation WebRTC avant cela ?",
    "Yes please, let's keep test coverage above 85% to be safe.": "Oui s'il vous plaît, gardons une couverture de test supérieure à 85% pour être sûrs."
  },
  German: {
    "Alright team, thanks for joining. Let's run through the Q3 release schedule.": "Alles klar Team, danke fürs Dabeisein. Lassen Sie uns den Zeitplan für die Q3-Veröffentlichung durchgehen.",
    "I have finished setting up the collaborative whiteboard canvas in the staging app.": "Ich habe die Einrichtung des kollaborativen Whiteboards in der Staging-App abgeschlossen.",
    "Perfect. I'll make sure the database is configured to sync messages properly.": "Perfekt. Ich werde sicherstellen, dass die Datenbank so konfiguriert ist, dass Nachrichten ordnungsgemäß synchronisiert werden.",
    "Excellent. Let's target Thursday morning for our production deployment.": "Ausgezeichnet. Lasst uns Donnerstagmorgen für unsere Produktionsbereitstellung anvisieren.",
    "Should I write the unit tests for WebRTC signaling components before then?": "Soll ich vorher die Unit-Tests für WebRTC-Signalisierungskomponenten schreiben?",
    "Yes please, let's keep test coverage above 85% to be safe.": "Ja bitte, lasst uns die Testabdeckung über 85% halten, um sicherzugehen."
  }
};

export const AIAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"transcript" | "summary" | "actions">("transcript");
  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([
    { time: "10:00", speaker: "Alex Rivera", text: "Alright team, thanks for joining. Let's run through the Q3 release schedule." }
  ]);
  const [language, setLanguage] = useState("Original");
  
  const [summaryPoints, setSummaryPoints] = useState<string[]>([
    "Initial sync regarding the Q3 product release target timeline.",
    "Whiteboard feature implementation is ready in staging environment.",
    "Database message synchronization protocols under review.",
  ]);

  const [actions, setActions] = useState<{ text: string; done: boolean }[]>([
    { text: "Sarah: Deploy the whiteboard canvas improvements to production.", done: false },
    { text: "David: Validate index configuration on SQL messages table.", done: false },
    { text: "Sarah: Write unit tests for WebRTC signaling logic (min 85% coverage).", done: false },
  ]);

  // Simulate incoming live transcript speech
  useEffect(() => {
    if (!isListening) return;

    let speechIdx = 1;
    const interval = setInterval(() => {
      if (speechIdx >= BOT_SPEECHES.length) {
        clearInterval(interval);
        return;
      }
      
      const speech = BOT_SPEECHES[speechIdx];
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      
      setTranscript((prev) => [...prev, { time, speaker: speech.speaker, text: speech.text }]);
      speechIdx++;

      // Update AI summary and actions as new context comes in
      if (speechIdx === 3) {
        setSummaryPoints((prev) => [...prev, "Database replication setup discussed to synchronize chat logs."]);
        setActions((prev) => [...prev, { text: "David: Hook up SQLite client wrapper APIs.", done: false }]);
      } else if (speechIdx === 5) {
        setSummaryPoints((prev) => [...prev, "Agreed on target release for Thursday morning."]);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isListening]);

  const getTranslatedText = (originalText: string) => {
    if (language === "Original" || !TRANSLATIONS[language]) return originalText;
    return TRANSLATIONS[language][originalText] || originalText;
  };

  const toggleAction = (idx: number) => {
    setActions(
      actions.map((act, i) => (i === idx ? { ...act, done: !act.done } : act))
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#111625] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 bg-[#161D2F] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-purple" />
          <h3 className="text-sm font-semibold text-white">AI Copilot</h3>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "transcript" && (
            <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 px-2 py-1 rounded-lg">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-[10px] text-zinc-300 outline-none cursor-pointer border-none p-0 font-medium"
              >
                <option value="Original">Original</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
          )}

          <button
            onClick={() => setIsListening(!isListening)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              isListening
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-green-500/10 text-green-400 border border-green-500/20"
            }`}
          >
            {isListening ? (
              <>
                <Square className="w-3 h-3 fill-red-400" /> Stop AI
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-green-400" /> Start AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#161D2F] border-b border-white/5">
        {(["transcript", "summary", "actions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-center text-xs font-semibold capitalize border-b-2 transition-all ${
              activeTab === tab
                ? "border-accent-purple text-white bg-white/[0.01]"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {activeTab === "transcript" && (
          <div className="space-y-4">
            {transcript.map((line, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="font-bold text-accent-purple">{line.speaker}</span>
                  <span className="text-zinc-600">{line.time}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  {getTranslatedText(line.text)}
                </p>
              </div>
            ))}
            {isListening && (
              <div className="flex items-center gap-2 text-zinc-500 text-[10px] italic">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Listening for speech...</span>
              </div>
            )}
          </div>
        )}

        {activeTab === "summary" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-accent-purple/5 border border-accent-purple/10 rounded-xl">
              <BrainCircuit className="w-5 h-5 text-accent-purple shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-white">Smart Summary</h4>
                <p className="text-[10px] text-zinc-400">AI automatically summarizes notes, key points, and metrics.</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {summaryPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                  <span className="text-accent-purple text-base leading-none">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "actions" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-accent-blue/5 border border-accent-blue/10 rounded-xl">
              <ListTodo className="w-5 h-5 text-accent-blue shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-white">Action Items</h4>
                <p className="text-[10px] text-zinc-400">Assigned items extracted from the speech transcript.</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {actions.map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleAction(idx)}
                  className="w-full flex items-start gap-3 text-left bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 p-3 rounded-xl transition-all"
                >
                  <input
                    type="checkbox"
                    checked={act.done}
                    onChange={() => {}} // Controlled by button click
                    className="mt-0.5 rounded border-zinc-700 bg-zinc-800 text-accent-purple focus:ring-accent-purple outline-none cursor-pointer"
                  />
                  <span className={`text-xs font-medium leading-relaxed ${
                    act.done ? "line-through text-zinc-500" : "text-zinc-300"
                  }`}>
                    {act.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

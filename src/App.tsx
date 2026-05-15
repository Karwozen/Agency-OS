import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Progress } from "./components/ui/progress";
import { ArrowRight, ArrowLeft, Check, Copy, UploadCloud, Loader2 } from "lucide-react";

type WizardData = {
  projectType: string;
  objective: string;
  audience: string;
  avoid: string;
  references: string;
  filesAttached: boolean;
  projectName: string;
  location: string;
  hours: string;
  services: string;
  typography: string;
  typographyCustom: string;
  borders: string;
  bordersCustom: string;
  textures: string;
  texturesCustom: string;
  immersion: string;
  immersionCustom: string;
  microinteractions: string;
  microinteractionsCustom: string;
};

const INITIAL_DATA: WizardData = {
  projectType: "",
  objective: "",
  audience: "",
  avoid: "",
  references: "",
  filesAttached: false,
  projectName: "",
  location: "",
  hours: "",
  services: "",
  typography: "",
  typographyCustom: "",
  borders: "",
  bordersCustom: "",
  textures: "",
  texturesCustom: "",
  immersion: "",
  immersionCustom: "",
  microinteractions: "",
  microinteractionsCustom: "",
};

const PROJECT_TYPES = ["SaaS Platform", "E-Commerce", "Institutional Website", "Mobile App", "Internal Dashboard", "Portfolio"];

const TYPOGRAPHY_OPTIONS = [
  { id: "tech", title: "Tech (Sans-serif)", desc: "Limpo, moderno e focado em legibilidade. Ideal para SaaS e dashboards.", className: "font-sans", preview: "Aa" },
  { id: "editorial", title: "Editorial (Serif)", desc: "Clássico, luxuoso e imponente. Transmite alto valor e tradição.", className: "font-serif text-lg", preview: "Aa" },
];

const BORDER_OPTIONS = [
  { id: "sharp", title: "Reto", desc: "Sério, brutalista e high-end.", wrapperClass: "rounded-none" },
  { id: "rounded", title: "Arredondado", desc: "Amigável, moderno e padrão Apple.", wrapperClass: "rounded-2xl" },
];

const TEXTURE_OPTIONS = [
  { id: "glass", title: "Glassmorphism", desc: "Efeito de vidro fosco. Sofisticado e tecnológico.", wrapperClass: "bg-white/10 backdrop-blur-md border border-white/20" },
  { id: "flat", title: "Flat/Matte", desc: "Cores sólidas sem distrações. Ultra minimalista.", wrapperClass: "bg-[#111111] border-transparent" },
];

const IMMERSION_OPTIONS = [
  { id: "2d", title: "Apenas 2D e Fotografias", desc: "Foco total no conteúdo plano e imagens de alta qualidade." },
  { id: "3d", title: "Spline/Objetos 3D Interativos", desc: "Modelos 3D renderizados no browser para máximo impacto visual." },
  { id: "parallax", title: "Efeitos Parallax Profundos", desc: "Sensação de profundidade ao scrollar, com camadas se movendo em velocidades diferentes." },
];

const MICROINTERACTION_OPTIONS = [
  { id: "magnetic", title: "Botões Magnéticos", desc: "Elementos que 'grudam' suavemente no cursor." },
  { id: "cinematic", title: "Hover Effects Cinemáticos (Reveal/Glow)", desc: "Brilhos suaves e revelações elegantes ao interagir." },
  { id: "subtle", title: "Efeitos Subtis/Quase Estáticos", desc: "Animações mínimas, apenas para feedback funcional." },
];

export default function App() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => setStep((p) => Math.min(p + 1, totalSteps));
  const handlePrev = () => setStep((p) => Math.max(p - 1, 1));
  const updateData = (fields: Partial<WizardData>) => setData((prev) => ({ ...prev, ...fields }));

  const generateArchitecture = async () => {
    setLoading(true);
    try {
      const promptText = `
Tipo de Projeto: ${data.projectType}
Nome: ${data.projectName}
Objetivo: ${data.objective}
Público: ${data.audience}
O que evitar: ${data.avoid}
Referências: ${data.references}
Arquivos anexados: ${data.filesAttached ? "Sim" : "Não"}
Localização: ${data.location}
Horários: ${data.hours}
Serviços: ${data.services}

DIREÇÃO DE ARTE:
Tipografia: ${TYPOGRAPHY_OPTIONS.find(o => o.id === data.typography)?.title || ""}
Observações de Tipografia: ${data.typographyCustom}

Bordas e Shapes: ${BORDER_OPTIONS.find(o => o.id === data.borders)?.title || ""}
Observações de Bordas: ${data.bordersCustom}

Materiais & Texturas: ${TEXTURE_OPTIONS.find(o => o.id === data.textures)?.title || ""}
Observações de Texturas: ${data.texturesCustom}

Elementos 3D & Imersão: ${IMMERSION_OPTIONS.find(o => o.id === data.immersion)?.title || ""}
Observações de Imersão: ${data.immersionCustom}

Micro-interações: ${MICROINTERACTION_OPTIONS.find(o => o.id === data.microinteractions)?.title || ""}
Observações de Micro-interações: ${data.microinteractionsCustom}
      `.trim();

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }
      
      const text = await response.text();
      setResult(text);
    } catch (err) {
      console.error(err);
      alert("Houve um erro ao gerar a arquitetura. Veja a console.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Funcao para renderizar markdown e criar botoes de copia se possivel
  const renderResult = () => {
    if (!result) return null;
    
    // Expressão regular para encontrar blocos de código com a linguagem (opcional)
    const blockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let match;
    let lastIndex = 0;
    let blockCount = 0;

    while ((match = blockRegex.exec(result)) !== null) {
      // Texto antes do bloco
      if (match.index > lastIndex) {
        parts.push(
          <div key={`text-${lastIndex}`} className="markdown-body text-white/80 mb-6 px-2">
            <Markdown>{result.slice(lastIndex, match.index)}</Markdown>
          </div>
        );
      }
      
      const lang = match[1] || "";
      const code = match[2];
      const currentIndex = blockCount++;
      
      parts.push(
        <div key={`code-${currentIndex}`} className="relative mb-8 group rounded-xl overflow-hidden border border-white/10 bg-[#141414]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/40">
            <span className="text-xs font-mono text-white/50 uppercase">{lang || "markdown"}</span>
            <button
              onClick={() => handleCopy(code, currentIndex)}
              className="text-white/50 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              {copiedIndex === currentIndex ? (
                <><Check className="w-3.5 h-3.5 text-green-400" /> Copied</>
              ) : (
                <><Copy className="w-3.5 h-3.5" /> Copy</>
              )}
            </button>
          </div>
          <div className="p-4 overflow-x-auto text-sm font-mono text-white/90 leading-relaxed whitespace-pre">
            {code}
          </div>
        </div>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < result.length) {
      parts.push(
        <div key="text-end" className="markdown-body text-white/80 px-2 mt-4">
          <Markdown>{result.slice(lastIndex)}</Markdown>
        </div>
      );
    }
    
    // Se não encontrou blocos, tenta renderizar tudo como markdown genérico
    if (parts.length === 0) {
      return (
         <div className="markdown-body text-white/80 p-4 bg-white/5 rounded-xl">
            <Markdown>{result}</Markdown>
         </div>
      );
    }

    return parts;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-12 px-4 selection:bg-white/20">
      <div className="w-full max-w-2xl">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-medium tracking-tight mb-2">Agency OS</h1>
          <p className="text-white/50 text-sm font-medium tracking-wide shadow-sm">CREATIVE DIRECTION WIZARD</p>
        </header>

        {!result ? (
          <div className="relative">
            <Progress value={progress} className="mb-8" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="min-h-[400px]"
              >
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-medium mb-1">Tipo de Projeto</h2>
                      <p className="text-white/50 text-sm">Selecione o artefato criativo que vamos desenhar hoje.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {PROJECT_TYPES.map((type) => (
                        <Card
                          key={type}
                          onClick={() => updateData({ projectType: type })}
                          className={`cursor-pointer transition-all p-5 hover:bg-white/5 ${
                            data.projectType === type ? "border-white bg-white/10 ring-1 ring-white" : ""
                          }`}
                        >
                          <h3 className="font-medium">{type}</h3>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-medium mb-1">Briefing Essencial</h2>
                      <p className="text-white/50 text-sm">Defina o foco estrutural e o alvo deste projeto.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Objetivo Principal</label>
                        <Textarea
                          placeholder="Ex: Aumentar a conversão de trials para pago em 20%..."
                          value={data.objective}
                          onChange={(e) => updateData({ objective: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Público-Alvo</label>
                        <Textarea
                          placeholder="Ex: Diretores executivos, 35-50 anos, sem muito tempo livre..."
                          value={data.audience}
                          onChange={(e) => updateData({ audience: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">O que evitar (Anti-patterns)</label>
                        <Textarea
                          placeholder="Ex: Não usar gradientes, evitar jargões técnicos complexos..."
                          value={data.avoid}
                          onChange={(e) => updateData({ avoid: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-medium mb-1">Referências Visuais</h2>
                      <p className="text-white/50 text-sm">Inspirações que guiam a direção de arte.</p>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Links (URLs)</label>
                        <Input
                          placeholder="Ex: https://stripe.com, https://linear.app"
                          value={data.references}
                          onChange={(e) => updateData({ references: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Moodboard (Fictício)</label>
                        <div 
                          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                            data.filesAttached ? "border-white/50 bg-white/5" : "border-white/10 hover:bg-white/5"
                          }`}
                          onClick={() => updateData({ filesAttached: !data.filesAttached })}
                        >
                          <UploadCloud className="w-8 h-8 mx-auto mb-3 text-white/40" />
                          <p className="text-sm font-medium">
                            {data.filesAttached ? "Anexos Recebidos!" : "Clique para simular upload"}
                          </p>
                          <p className="text-xs text-white/40 mt-1">PNG, JPG, PDF (Max 10MB)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-medium mb-1">Dados Concretos</h2>
                      <p className="text-white/50 text-sm">Informações primárias a serem usadas no design.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Nome da Empresa/Projeto</label>
                        <Input
                          value={data.projectName}
                          onChange={(e) => updateData({ projectName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Localização (se houver)</label>
                        <Input
                          value={data.location}
                          onChange={(e) => updateData({ location: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Horários de Operação</label>
                        <Input
                          value={data.hours}
                          onChange={(e) => updateData({ hours: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Serviços Principais</label>
                        <Input
                          placeholder="Separados por vírgula"
                          value={data.services}
                          onChange={(e) => updateData({ services: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-medium mb-1">Direção de Arte de Luxo</h2>
                      <p className="text-white/50 text-sm">Selecione o DNA visual do projeto. Cada escolha altera radicalmente o resultado final.</p>
                    </div>
                    <div className="space-y-10">
                      
                      <div className="space-y-4">
                        <label className="text-sm font-medium text-white/70 block">1. Tipografia Primária</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {TYPOGRAPHY_OPTIONS.map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => updateData({ typography: opt.id })}
                              className={`text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                                data.typography === opt.id ? "bg-white/10 border-white ring-1 ring-white" : "bg-black/50 border-white/10 hover:border-white/30"
                              }`}
                            >
                              <div className={`w-12 h-12 flex-shrink-0 bg-white/5 rounded-lg flex items-center justify-center text-xl text-white ${opt.className}`}>
                                {opt.preview}
                              </div>
                              <div>
                                <h3 className="font-medium text-white mb-1">{opt.title}</h3>
                                <p className="text-xs text-white/50 leading-relaxed">{opt.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                        <Textarea 
                          className="min-h-[80px]"
                          placeholder="Personalização avançada (Opcional): Descreva detalhes específicos, fontes exatas que deseja usar ou regras estritas para este item..."
                          value={data.typographyCustom}
                          onChange={(e) => updateData({ typographyCustom: e.target.value })}
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-medium text-white/70 block">2. Bordas e Shapes</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {BORDER_OPTIONS.map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => updateData({ borders: opt.id })}
                              className={`text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                                data.borders === opt.id ? "bg-white/10 border-white ring-1 ring-white" : "bg-black/50 border-white/10 hover:border-white/30"
                              }`}
                            >
                              <div className={`w-12 h-12 flex-shrink-0 bg-white/10 border border-white/20 ${opt.wrapperClass}`}></div>
                              <div>
                                <h3 className="font-medium text-white mb-1">{opt.title}</h3>
                                <p className="text-xs text-white/50 leading-relaxed">{opt.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                        <Textarea 
                          className="min-h-[80px]"
                          placeholder="Personalização avançada (Opcional): Descreva detalhes (ex: arredondamento maior apenas nos botões)..."
                          value={data.bordersCustom}
                          onChange={(e) => updateData({ bordersCustom: e.target.value })}
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-medium text-white/70 block">3. Materiais & Texturas</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {TEXTURE_OPTIONS.map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => updateData({ textures: opt.id })}
                              className={`text-left p-4 rounded-xl border transition-all flex items-start gap-4 relative overflow-hidden ${
                                data.textures === opt.id ? "bg-white/10 border-white ring-1 ring-white" : "bg-black/50 border-white/10 hover:border-white/30"
                              }`}
                            >
                              {/* Background hint for glassmorphism */}
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-50 pointer-events-none"></div>
                              <div className={`w-12 h-12 flex-shrink-0 relative z-10 ${opt.wrapperClass} rounded-lg`}></div>
                              <div className="relative z-10">
                                <h3 className="font-medium text-white mb-1">{opt.title}</h3>
                                <p className="text-xs text-white/50 leading-relaxed">{opt.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                        <Textarea 
                          className="min-h-[80px]"
                          placeholder="Personalização avançada (Opcional): Descreva se deseja usar noise (granulado), blurs coloridos, etc..."
                          value={data.texturesCustom}
                          onChange={(e) => updateData({ texturesCustom: e.target.value })}
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-medium text-white/70 block">4. Elementos 3D & Imersão</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {IMMERSION_OPTIONS.map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => updateData({ immersion: opt.id })}
                              className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                                data.immersion === opt.id ? "bg-white/10 border-white ring-1 ring-white" : "bg-black/50 border-white/10 hover:border-white/30"
                              }`}
                            >
                              <h3 className="font-medium text-white text-sm">{opt.title}</h3>
                              <p className="text-xs text-white/40 leading-relaxed">{opt.desc}</p>
                            </button>
                          ))}
                        </div>
                        <Textarea 
                          className="min-h-[80px]"
                          placeholder="Personalização avançada (Opcional): Indique assets específicos 3D, referências tridimensionais..."
                          value={data.immersionCustom}
                          onChange={(e) => updateData({ immersionCustom: e.target.value })}
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-medium text-white/70 block">5. Micro-interações</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {MICROINTERACTION_OPTIONS.map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => updateData({ microinteractions: opt.id })}
                              className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                                data.microinteractions === opt.id ? "bg-white/10 border-white ring-1 ring-white" : "bg-black/50 border-white/10 hover:border-white/30"
                              }`}
                            >
                              <h3 className="font-medium text-white text-sm">{opt.title}</h3>
                              <p className="text-xs text-white/40 leading-relaxed">{opt.desc}</p>
                            </button>
                          ))}
                        </div>
                        <Textarea 
                          className="min-h-[80px]"
                          placeholder="Personalização avançada (Opcional): Descreva transições específicas, durações preferidas ou regras de animação..."
                          value={data.microinteractionsCustom}
                          onChange={(e) => updateData({ microinteractionsCustom: e.target.value })}
                        />
                      </div>

                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="space-y-6 text-center py-8">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-medium">Briefing Concluído</h2>
                    <p className="text-white/50 text-sm max-w-xs mx-auto mb-8">
                      Todos os parâmetros foram ajustados. O motor IA está pronto para arquitetar o projeto.
                    </p>
                    <Button 
                      onClick={generateArchitecture} 
                      disabled={loading}
                      className="w-full sm:w-auto min-w-[240px] h-12 text-base font-medium"
                    >
                      {loading ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Gerando Arquitetura...</>
                      ) : (
                        "Gerar Arquitetura Premium"
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {step < 6 && (
              <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/10">
                <Button
                  onClick={handlePrev}
                  disabled={step === 1}
                  className={`${step === 1 ? 'opacity-0' : 'opacity-100'} bg-transparent text-white hover:bg-white/10 shadow-none`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <Button onClick={handleNext}>
                  {step === 5 ? "Revisar Briefing" : "Próximo"} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-medium tracking-tight">Arquitetura Gerada</h2>
              <Button 
                onClick={() => {
                  setResult(null);
                  setStep(1);
                  setData(INITIAL_DATA);
                }} 
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                Novo Projeto
              </Button>
            </div>
            
            <div className="space-y-8 mt-8">
              {renderResult()}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, AlertTriangle, Eye, EyeOff, Save, Play, Server, Bot, Zap, RefreshCw, BarChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const AIConnectionManager = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeProvider, setActiveProvider] = useState<string>('openrouter');

    // Config state - Separate for each provider
    const [configs, setConfigs] = useState<Record<string, { apiKey: string, model: string, models: string[], settings: any, scanning?: boolean, scanProgress?: number, scanResults?: any[] }>>({
        openrouter: { apiKey: '', model: '', models: [], settings: { prefer_free: true }, scanning: false, scanProgress: 0, scanResults: [] },
        gemini: { apiKey: '', model: 'gemini-1.5-flash', models: [], settings: { prefer_free: true }, scanning: false, scanProgress: 0, scanResults: [] },
        openai: { apiKey: '', model: 'gpt-4o-mini', models: [], settings: {}, scanning: false, scanProgress: 0, scanResults: [] }
    });

    const [systemActiveProviders, setSystemActiveProviders] = useState<string[]>([]);
    const [showKey, setShowKey] = useState(false);

    // OpenRouter unique state
    const [orModels, setOrModels] = useState<any[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);
    const [searchModel, setSearchModel] = useState('');


    // Testing
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('ai_settings')
                .select('*');

            if (data && data.length > 0) {
                const newConfigs = { ...configs };

                data.forEach(item => {
                    if (newConfigs[item.provider]) {
                        newConfigs[item.provider] = {
                            apiKey: item.api_key || '',
                            model: item.model || newConfigs[item.provider].model,
                            models: item.models || [],
                            settings: item.settings || newConfigs[item.provider].settings
                        };
                    }
                });

                setConfigs(newConfigs);
                const activeOnes = data.filter(item => item.is_active).map(item => item.provider);
                setSystemActiveProviders(activeOnes);

                setActiveProvider(data[0].provider);

                if (newConfigs.openrouter.apiKey) {
                    fetchOpenRouterModels(newConfigs.openrouter.apiKey);
                }
            }
        } catch (error) {
            console.error('Error fetching AI settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOpenRouterModels = async (key: string) => {
        if (!key) return;
        setLoadingModels(true);
        try {
            const response = await fetch("https://openrouter.ai/api/v1/models", {
                headers: {
                    "Authorization": `Bearer ${key}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Failed to fetch models");

            const data = await response.json();
            setOrModels(data.data || []);
        } catch (error) {
            console.error("Error fetching models:", error);
            toast({ title: "Error", description: "No se pudieron obtener los modelos de OpenRouter.", variant: "destructive" });
        } finally {
            setLoadingModels(false);
        }
    };

    const runScanAndOptimize = async (provider: string) => {
        const apiKey = configs[provider].apiKey;
        if (!apiKey) return;

        setConfigs(prev => ({
            ...prev,
            [provider]: { ...prev[provider], scanning: true, scanProgress: 0, scanResults: [] }
        }));
        setTestResult(null);

        try {
            const preferFree = configs[provider].settings?.prefer_free ?? true;
            let candidates: any[] = [];

            if (provider === 'openrouter') {
                candidates = [...orModels];
                if (preferFree) {
                    candidates = candidates.filter(m => m.id.includes('free') || m.pricing?.prompt === "0");
                }
            } else if (provider === 'gemini') {
                candidates = [
                    { id: "gemini-3-flash-preview", name: "Gemini 3 Flash (Preview)" },
                    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
                    { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash (Exp)" },
                    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
                    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
                    { id: "gemini-1.0-pro", name: "Gemini 1.0 Pro" }
                ];
            }

            const results = candidates.map(c => ({ id: c.id, name: c.name, status: 'pending' }));
            setConfigs(prev => ({
                ...prev,
                [provider]: { ...prev[provider], scanResults: results }
            }));

            const passedModels: string[] = [];
            let completed = 0;

            for (const candidate of candidates) {
                try {
                    if (completed > 0) await new Promise(r => setTimeout(r, provider === 'openrouter' ? 800 : 300));

                    const success = provider === 'openrouter'
                        ? await testModelConnection(candidate.id, apiKey)
                        : await testGeminiModel(candidate.id, apiKey);

                    if (success) {
                        passedModels.push(candidate.id);
                        setConfigs(prev => ({
                            ...prev,
                            [provider]: {
                                ...prev[provider],
                                scanResults: prev[provider].scanResults?.map(p => p.id === candidate.id ? { ...p, status: 'success' } : p)
                            }
                        }));
                    } else {
                        setConfigs(prev => ({
                            ...prev,
                            [provider]: {
                                ...prev[provider],
                                scanResults: prev[provider].scanResults?.map(p => p.id === candidate.id ? { ...p, status: 'error' } : p)
                            }
                        }));
                    }
                } catch (e) {
                    setConfigs(prev => ({
                        ...prev,
                        [provider]: {
                            ...prev[provider],
                            scanResults: prev[provider].scanResults?.map(p => p.id === candidate.id ? { ...p, status: 'error' } : p)
                        }
                    }));
                } finally {
                    completed++;
                    const progress = Math.round((completed / candidates.length) * 100);
                    setConfigs(prev => ({ ...prev, [provider]: { ...prev[provider], scanProgress: progress } }));
                }
            }

            setConfigs(prev => ({
                ...prev,
                [provider]: {
                    ...prev[provider],
                    models: passedModels,
                    scanProgress: 100,
                    scanning: false
                }
            }));

            toast({ title: "Escaneo completado", description: `${passedModels.length} modelos validados para ${provider}.` });
        } catch (error: any) {
            toast({ title: "Error en escaneo", description: error.message, variant: "destructive" });
            setConfigs(prev => ({ ...prev, [provider]: { ...prev[provider], scanning: false } }));
        }
    };

    const testGeminiModel = async (modelId: string, apiKeyOverride?: string): Promise<boolean> => {
        const cleanKey = (apiKeyOverride || configs.gemini.apiKey).trim();
        const versions = ["v1", "v1beta"];

        for (const version of versions) {
            try {
                const res = await fetch(`https://generativelanguage.googleapis.com/${version}/models/${modelId}:generateContent?key=${cleanKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
                });
                if (res.ok) return true;

                // If 403 (Invalid Key), don't bother trying other versions
                if (res.status === 403) return false;
            } catch (e) {
                // Network error, continue to next version or return false
            }
        }
        return false;
    };

    const testModelConnection = async (modelId: string, apiKeyOverride?: string): Promise<boolean> => {
        try {
            const apiKey = (apiKeyOverride || configs.openrouter.apiKey).trim();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://seedumotor.com", // Required by free tier
                    "X-Title": "SEEDUMOTOR"
                },
                body: JSON.stringify({
                    model: modelId,
                    messages: [{ role: "user", content: "hi" }]
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return res.ok;
        } catch (e) {
            return false;
        }
    };

    const handleSave = async () => {
        const currentConfig = configs[activeProvider];
        if (!currentConfig.apiKey) {
            toast({ title: "Error", description: "La API Key es requerida", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            // Upsert the provider config
            const { error } = await supabase.from('ai_settings').upsert({
                provider: activeProvider,
                api_key: currentConfig.apiKey.trim(),
                model: currentConfig.model?.trim(),
                models: currentConfig.models,
                settings: currentConfig.settings,
                is_active: true // Now multiple can be active
            }, { onConflict: 'provider' });

            if (error) {
                // If unique constraint error (though we rely on UPSERT with conflict on provider)
                throw error;
            }

            setSystemActiveProviders(prev => {
                if (prev.includes(activeProvider)) return prev;
                return [...prev, activeProvider];
            });

            toast({ title: "Guardado", description: `Configuración de ${activeProvider} activada correctamente.` });
            fetchSettings(); // Refresh to get correct active list
        } catch (error: any) {
            console.error('Error saving settings:', error);
            toast({ title: "Error", description: error.message || "Error al guardar la configuración.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setTestResult(null);

        try {
            let success = false;
            let message = "";

            if (activeProvider === 'openrouter') {
                if (!configs.openrouter.model) throw new Error("Selecciona un modelo primero");
                success = await testModelConnection(configs.openrouter.model);
                if (!success) throw new Error("El modelo seleccionado no responde.");
                message = "Conexión con OpenRouter exitosa.";
            } else if (activeProvider === 'openai') {
                const res = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${configs.openai.apiKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: configs.openai.model || "gpt-4o-mini",
                        messages: [{ role: "user", content: "hi" }]
                    })
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(`OpenAI Error: ${data.error?.message || res.statusText}`);
                }
                success = true;
                message = "Conexión con OpenAI exitosa.";
            } else if (activeProvider === 'gemini') {
                const userModel = (configs.gemini.model || "gemini-1.5-flash").trim();
                const cleanKey = configs.gemini.apiKey.trim();

                // Models to try, putting user priority first, then "guaranteed" model, then fallbacks
                const modelsToTry = [...new Set([userModel, "gemini-3-flash-preview", "gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-1.5-pro"])].filter(Boolean);
                let lastGeminiError = "";

                for (const m of modelsToTry) {
                    try {
                        console.log(`Testing Gemini model: ${m}`);
                        // Try v1 first, if fail try v1beta
                        const versions = ["v1", "v1beta"];
                        for (const version of versions) {
                            const url = `https://generativelanguage.googleapis.com/${version}/models/${m}:generateContent?key=${cleanKey}`;
                            const res = await fetch(url, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
                            });

                            if (res.ok) {
                                success = true;
                                message = `Conexión con Gemini exitosa usando el modelo ${m} (${version}).`;
                                break;
                            } else {
                                const errData = await res.json().catch(() => ({}));
                                lastGeminiError = errData.error?.message || res.statusText;
                                console.warn(`Gemini ${version} ${m} failed: ${lastGeminiError}`);
                            }
                        }
                        if (success) break;
                    } catch (e: any) {
                        lastGeminiError = e.message;
                    }
                }

                if (!success) {
                    throw new Error(`Gemini Error: ${lastGeminiError || "No se pudo conectar con ningún modelo de Gemini."}`);
                }
            }

            setTestResult({ success, message });
        } catch (error: any) {
            setTestResult({ success: false, message: error.message });
        } finally {
            setTesting(false);
        }
    };

    const filteredModels = orModels.filter(m => {
        const matchesSearch = m.id.toLowerCase().includes(searchModel.toLowerCase()) || m.name.toLowerCase().includes(searchModel.toLowerCase());
        const preferFree = configs.openrouter.settings?.prefer_free ?? true;
        const matchesFree = preferFree ? (m.id.toLowerCase().includes('free') || m.pricing?.prompt === "0") : true;
        return matchesSearch && matchesFree;
    });

    return (
        <Card className="w-full border-primary/20 shadow-md">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Server className="h-5 w-5 text-primary" />
                    Configuración de Inteligencia Artificial
                </CardTitle>
                <CardDescription>
                    Gestiona la conexión con proveedores de IA.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeProvider} onValueChange={(v) => { setActiveProvider(v); setTestResult(null); }} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="openrouter" className="flex gap-2">
                            <Bot className="h-4 w-4" />
                            OpenRouter {systemActiveProviders.includes('openrouter') && <CheckCircle2 className="h-3 w-3 text-green-500 ml-1" />}
                        </TabsTrigger>
                        <TabsTrigger value="gemini" className="flex gap-2">
                            <Zap className="h-4 w-4" />
                            Gemini {systemActiveProviders.includes('gemini') && <CheckCircle2 className="h-3 w-3 text-green-500 ml-1" />}
                        </TabsTrigger>
                        <TabsTrigger value="openai" className="flex gap-2">
                            <div className="h-4 w-4 rounded-full bg-current" />
                            OpenAI {systemActiveProviders.includes('openai') && <CheckCircle2 className="h-3 w-3 text-green-500 ml-1" />}
                        </TabsTrigger>
                    </TabsList>

                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <div className="relative">
                                <Input
                                    type={showKey ? "text" : "password"}
                                    value={configs[activeProvider].apiKey}
                                    onChange={(e) => setConfigs(prev => ({
                                        ...prev,
                                        [activeProvider]: { ...prev[activeProvider], apiKey: e.target.value }
                                    }))}
                                    placeholder={activeProvider === 'openrouter' ? 'sk-or-v1-...' : activeProvider === 'gemini' ? 'AIza...' : 'sk-...'}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1 h-7 w-7 p-0"
                                    onClick={() => setShowKey(!showKey)}
                                >
                                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        {activeProvider === 'openrouter' && (
                            <div className="space-y-4 border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <Label>Modelos Disponibles</Label>
                                    <div className="flex items-center gap-2">
                                        <Label className="text-xs cursor-pointer flex items-center gap-1">
                                            <input type="checkbox" checked={configs.openrouter.settings?.prefer_free ?? true} onChange={e => setConfigs(prev => ({
                                                ...prev,
                                                openrouter: { ...prev.openrouter, settings: { ...prev.openrouter.settings, prefer_free: e.target.checked } }
                                            }))} className="rounded border-gray-300" />
                                            Gratuitos
                                        </Label>
                                        <Button variant="link" size="sm" onClick={() => fetchOpenRouterModels(configs.openrouter.apiKey)} disabled={!configs.openrouter.apiKey || loadingModels}>
                                            <RefreshCw className={`h-3 w-3 mr-1 ${loadingModels ? 'animate-spin' : ''}`} /> Actualizar
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Select value={configs.openrouter.model} onValueChange={(val) => setConfigs(prev => ({
                                        ...prev,
                                        openrouter: { ...prev.openrouter, model: val }
                                    }))}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Selecciona un modelo principal" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            <div className="p-2 sticky top-0 bg-popover z-10">
                                                <Input
                                                    placeholder="Buscar..."
                                                    value={searchModel}
                                                    onChange={e => setSearchModel(e.target.value)}
                                                    onKeyDown={e => e.stopPropagation()}
                                                />
                                            </div>
                                            {filteredModels.map(m => (
                                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold flex items-center gap-2">
                                            <BarChart className="h-4 w-4" /> Escáner de Conectividad
                                        </h4>
                                        <Button size="sm" variant="secondary" onClick={() => runScanAndOptimize('openrouter')} disabled={configs.openrouter.scanning || !configs.openrouter.apiKey || orModels.length === 0}>
                                            {configs.openrouter.scanning ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Zap className="h-3 w-3 mr-2 text-yellow-500" />}
                                            Escanear y Optimizar
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Analiza los mejores {configs.openrouter.settings?.prefer_free ? 'modelos gratuitos' : 'modelos'} y crea una lista de respaldo para garantizar estabilidad.
                                    </p>

                                    {configs.openrouter.scanning && (
                                        <div className="space-y-1">
                                            <div className="h-2 w-full bg-secondary rounded overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${configs.openrouter.scanProgress}%` }} />
                                            </div>
                                            <p className="text-xs text-right text-muted-foreground">{configs.openrouter.scanProgress}%</p>
                                        </div>
                                    )}

                                    {configs.openrouter.scanResults && configs.openrouter.scanResults.length > 0 && (
                                        <div className="grid grid-cols-1 gap-1 max-h-[150px] overflow-y-auto">
                                            {configs.openrouter.scanResults.map(res => (
                                                <div key={res.id} className="flex items-center justify-between text-xs p-1 px-2 rounded hover:bg-muted/50">
                                                    <span className="truncate max-w-[200px]" title={res.id}>{res.name}</span>
                                                    {res.status === 'pending' && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                                                    {res.status === 'success' && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                                                    {res.status === 'error' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {configs.openrouter.models.length > 0 && !configs.openrouter.scanning && (
                                        <div className="pt-2 border-t mt-2">
                                            <p className="text-xs font-medium text-green-600 flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> {configs.openrouter.models.length} modelos verificados en el pool de respaldo.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeProvider !== 'openrouter' && (
                            <div className="space-y-4 border-t pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Modelo Predeterminado</Label>
                                        {activeProvider === 'gemini' && (
                                            <Label className="text-xs cursor-pointer flex items-center gap-1">
                                                <input type="checkbox" checked={configs.gemini.settings?.prefer_free ?? true} onChange={e => setConfigs(prev => ({
                                                    ...prev,
                                                    gemini: { ...prev.gemini, settings: { ...prev.gemini.settings, prefer_free: e.target.checked } }
                                                }))} className="rounded border-gray-300" />
                                                Elegir mejores gratuitos primero
                                            </Label>
                                        )}
                                    </div>
                                    <Input
                                        value={configs[activeProvider].model}
                                        onChange={(e) => setConfigs(prev => ({
                                            ...prev,
                                            [activeProvider]: { ...prev[activeProvider], model: e.target.value }
                                        }))}
                                        placeholder={activeProvider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini'}
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        {activeProvider === 'gemini' ? 'Sugeridos: gemini-1.5-flash (Gratis), gemini-1.5-pro, gemini-2.0-flash-exp' : 'Sugeridos: gpt-4o-mini, gpt-4o'}
                                    </p>
                                </div>

                                {activeProvider === 'gemini' && (
                                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                                <Bot className="h-4 w-4" /> Pool de Modelos Gemini
                                            </h4>
                                            <Button size="sm" variant="secondary" onClick={() => runScanAndOptimize('gemini')} disabled={configs.gemini.scanning || !configs.gemini.apiKey}>
                                                {configs.gemini.scanning ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCw className="h-3 w-3 mr-2" />}
                                                Validar Modelos
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Verifica qué versiones de Gemini están disponibles para tu API Key.
                                        </p>

                                        {configs.gemini.scanning && (
                                            <div className="space-y-1">
                                                <div className="h-2 w-full bg-secondary rounded overflow-hidden">
                                                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${configs.gemini.scanProgress}%` }} />
                                                </div>
                                            </div>
                                        )}

                                        {configs.gemini.models.length > 0 && (
                                            <div className="grid grid-cols-2 gap-1 max-h-[100px] overflow-y-auto">
                                                {configs.gemini.models.map(m => (
                                                    <div key={m} className="flex items-center gap-1 text-[10px] p-1 bg-green-500/5 text-green-600 rounded">
                                                        <CheckCircle2 className="h-3 w-3" /> {m}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {testResult && (
                            <div className={`p-3 rounded-md text-sm flex items-start gap-2 ${testResult.success ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                                {testResult.success ? <CheckCircle2 className="h-4 w-4 mt-0.5" /> : <AlertTriangle className="h-4 w-4 mt-0.5" />}
                                <div>
                                    <p className="font-semibold">{testResult.success ? 'Conexión Exitosa' : 'Error de Conexión'}</p>
                                    <p className="text-xs opacity-90">{testResult.message}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" className="flex-1" onClick={handleTestConnection} disabled={testing || !configs[activeProvider].apiKey}>
                                {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                Probar Conexión
                            </Button>
                            <Button className="flex-1" onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                {systemActiveProviders.includes(activeProvider) ? 'Actualizar Configuración' : 'Activar Proveedor'}
                            </Button>
                        </div>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
};

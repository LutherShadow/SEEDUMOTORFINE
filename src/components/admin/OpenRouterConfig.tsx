import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, AlertTriangle, Eye, EyeOff, Play, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const OpenRouterConfig = () => {
    const { toast } = useToast();
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [models, setModels] = useState<any[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);
    const [selectedModel, setSelectedModel] = useState('');
    const [searchModel, setSearchModel] = useState('');
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

    useEffect(() => {
        const storedKey = localStorage.getItem('local_openrouter_key');
        const storedModel = localStorage.getItem('local_openrouter_model');
        if (storedKey) setApiKey(storedKey);
        if (storedModel) setSelectedModel(storedModel);
    }, []);

    const saveSettings = () => {
        if (!apiKey.trim()) {
            toast({ title: "Error", description: "La API Key no puede estar vacía", variant: "destructive" });
            return;
        }
        localStorage.setItem('local_openrouter_key', apiKey.trim());
        localStorage.setItem('local_openrouter_model', selectedModel);
        toast({ title: "Guardado", description: "Configuración guardada localmente." });

        // Refresh models if key changed
        fetchModels();
    };

    const fetchModels = async () => {
        if (!apiKey) return;
        setLoadingModels(true);
        try {
            const response = await fetch("https://openrouter.ai/api/v1/models", {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`);

            const data = await response.json();
            setModels(data.data || []);
            toast({ title: "Modelos actualizados", description: `Se encontraron ${data.data?.length || 0} modelos.` });
        } catch (error: any) {
            console.error("Error fetching models:", error);
            toast({ title: "Error", description: "No se pudieron obtener los modelos. Verifica tu API Key.", variant: "destructive" });
        } finally {
            setLoadingModels(false);
        }
    };

    const runtest = async () => {
        if (!apiKey || !selectedModel) {
            toast({ title: "Incompleto", description: "Configura la API Key y selecciona un modelo.", variant: "destructive" });
            return;
        }

        setTesting(true);
        setTestResult(null);
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "SEEDUMOTOR Debugger"
                },
                body: JSON.stringify({
                    "model": selectedModel,
                    "messages": [{ "role": "user", "content": "Say 'OK' if you can read this." }]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Status ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(`API Error ${data.error.code || ''}: ${data.error.message || JSON.stringify(data.error)}`);
            }

            setTestResult({
                success: true,
                message: "Conexión exitosa: El modelo respondió correctamente.",
                data: data
            });
        } catch (error: any) {
            setTestResult({
                success: false,
                message: error.message || "Error desconocido",
            });
        } finally {
            setTesting(false);
        }
    };

    const [showFreeOnly, setShowFreeOnly] = useState(true);

    const filteredModels = models.filter(m => {
        const matchesSearch = m.id.toLowerCase().includes(searchModel.toLowerCase()) ||
            m.name.toLowerCase().includes(searchModel.toLowerCase());
        const matchesFree = showFreeOnly ? (m.id.toLowerCase().includes('free') || m.pricing?.prompt === "0") : true;
        return matchesSearch && matchesFree;
    });

    return (
        <Card className="w-full mt-4 border-orange-200 dark:border-orange-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Diagnóstico de Conexión IA (OpenRouter)
                </CardTitle>
                <CardDescription>
                    Herramienta para validar credenciales y disponibilidad de modelos.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>OpenRouter API Key Local</Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                type={showKey ? "text" : "password"}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-or-v1-..."
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1 h-7 w-7 p-0"
                                onClick={() => setShowKey(!showKey)}
                            >
                                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        <Button onClick={saveSettings} size="sm">
                            <Save className="h-4 w-4 mr-2" />
                            Guardar
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Esta llave se guarda en tu navegador (localStorage) para pruebas. No afecta al servidor.</p>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center bg-muted/50 p-2 rounded-lg">
                        <Label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showFreeOnly}
                                onChange={(e) => setShowFreeOnly(e.target.checked)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            Mostrar solo modelos gratuitos
                        </Label>
                        <Button variant="link" size="sm" className="h-auto p-0" onClick={fetchModels} disabled={loadingModels || !apiKey}>
                            {loadingModels ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                            Actualizar lista
                        </Button>
                    </div>

                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un modelo" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            <div className="p-2 sticky top-0 bg-popover z-10">
                                <Input
                                    placeholder="Buscar modelo..."
                                    value={searchModel}
                                    onChange={(e) => setSearchModel(e.target.value)}
                                    className="h-8"
                                    onKeyDown={(e) => e.stopPropagation()}
                                />
                            </div>
                            {filteredModels.map(model => (
                                <SelectItem key={model.id} value={model.id}>
                                    {model.name}
                                </SelectItem>
                            ))}
                            {filteredModels.length === 0 && (
                                <div className="p-2 text-sm text-muted-foreground text-center">
                                    {models.length === 0 ? "Carga los modelos primero" : "No hay coincidencias"}
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="pt-2">
                    <Button
                        onClick={runtest}
                        className="w-full"
                        disabled={testing || !apiKey || !selectedModel}
                        variant={testResult?.success ? "outline" : "default"}
                    >
                        {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                        Probar Conexión
                    </Button>
                </div>

                {testResult && (
                    <div className={`mt-4 p-3 rounded-md text-sm border ${testResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        <div className="flex items-center gap-2 font-medium mb-1">
                            {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                            {testResult.success ? "Prueba Exitosa" : "Error de Conexión"}
                        </div>
                        <p>{testResult.message}</p>
                        {testResult.data && (
                            <pre className="mt-2 text-xs overflow-auto max-h-40 bg-white/50 p-2 rounded">
                                {JSON.stringify(testResult.data, null, 2)}
                            </pre>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

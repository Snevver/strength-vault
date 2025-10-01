import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { applyPrimaryHsl, savePrimaryHsl, hexToHslString, LOCAL_KEY, savePrimaryHex, LOCAL_HEX_KEY } from "@/lib/theme";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const DEFAULT_HEX = "#1ec06f"; // green-ish default (converted to HSL in CSS already)

const Profile = () => {
    const { toast } = useToast();
    const [hex, setHex] = useState<string>(DEFAULT_HEX);
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        let mounted = true;

        const loadLocal = () => {
            try {
                const savedHex = localStorage.getItem(LOCAL_HEX_KEY);
                if (savedHex && mounted) setHex(savedHex);
            } catch (e) {
                // ignore localStorage errors
            }
        };

        loadLocal();

        // If logged in, try to load from DB (user_settings.key = 'primary-hex')
        const loadFromDb = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('user_settings')
                    .select('value')
                    .eq('user_id', user.id)
                    .eq('key', 'primary-hex')
                    .single();

                if (error && error.code !== 'PGRST116') {
                    // ignore not found (PGRST116) and other transient errors
                    console.warn('Failed to load user setting primary-hex', error);
                }

                if (data && mounted) {
                    setHex(data.value);
                    // also apply immediately
                    const hsl = hexToHslString(data.value);
                    if (hsl) {
                        applyPrimaryHsl(hsl);
                        savePrimaryHsl(hsl);
                        savePrimaryHex(data.value);
                    }
                }
            } catch (e) {
                console.warn('Error loading primary-hex from DB', e);
            }
        };

        if (!authLoading) loadFromDb();

        return () => {
            mounted = false;
        };
    }, [authLoading, user]);

    const handleApply = async () => {
        const hsl = hexToHslString(hex);
        if (!hsl) {
            toast({ title: "Invalid color", description: "Please enter a valid hex color like #1ec06f", variant: "destructive" });
            return;
        }
        applyPrimaryHsl(hsl);
        savePrimaryHsl(hsl);
        savePrimaryHex(hex);

        // Persist to Supabase if logged in
        try {
            if (typeof window !== 'undefined') {
                const session = await supabase.auth.getSession();
                const userId = session.data.session?.user?.id;
                if (userId) {
                    // upsert into user_settings table
                    const { error } = await supabase.from('user_settings').upsert({
                        user_id: userId,
                        key: 'primary-hex',
                        value: hex,
                    }, { onConflict: ['user_id','key'] });

                    if (error) {
                        console.warn('Failed to persist primary-hex to DB', error);
                    }
                }
            }
        } catch (e) {
            console.warn('Error saving primary-hex to Supabase', e);
        }

        toast({ title: "Theme updated", description: "Primary color has been updated and saved." });
    };

    const handleReset = () => {
        const defaultHsl = '142 76% 36%';
        applyPrimaryHsl(defaultHsl);
        savePrimaryHsl(defaultHsl);
        setHex(DEFAULT_HEX);
        toast({ title: "Reset", description: "Theme restored to default." });
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                    <p className="text-muted-foreground">Customize your preferences</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Theme</CardTitle>
                        <CardDescription>Change the primary accent color for the app</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div className="col-span-2">
                                <label className="text-sm mb-1 block">Primary color (hex)</label>
                                <Input value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#1ec06f" />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-md shadow-inner" style={{ backgroundColor: hex }} />
                                <div>
                                    <div className="text-sm text-muted-foreground">Preview</div>
                                    <div className="mt-2">
                                        <Button style={{ backgroundColor: hex, borderColor: 'transparent' }}>Primary</Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleApply}>Apply</Button>
                            <Button variant="outline" onClick={handleReset} className="hover:bg-muted">Reset</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default Profile;
